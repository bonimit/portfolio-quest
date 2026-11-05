import { spawn } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import { readFile, writeFile, mkdir, open, unlink, lstat } from "node:fs/promises";
import { dirname, resolve, join, isAbsolute } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { tmpdir } from "node:os";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const AGENTS = ["art-director", "ux-reviewer", "conversation-designer", "code-qa-reviewer"] as const;
type Agent = typeof AGENTS[number];
type Task = { id: string; category: string; description: string; acceptanceCriteria: string[]; allowedPaths: string[]; testScripts: string[] };
type Finding = { severity: string; blocking: boolean; criterion: string; evidence: string; suggestedFix: string; verification: string };
type Review = {
  status: "pass" | "fail"; summary: string;
  reviewers: { name: Agent; status: "pass" | "fail"; complete: boolean; scope: string; findings: Finding[]; notReviewed: string[] }[];
  criteriaCoverage: { criterion: string; status: "pass" | "fail" | "unverified"; evidence: string }[];
  openDecisions: string[];
};
type Config = { liveEnabled: boolean; maxReviewRounds: number; processTimeoutMs: number; maxOutputBytes: number; inspectedVersions: { codex: string; claude: string }; checks: string[] };
type Command = { command: string; args: string[]; cwd: string; input?: string; timeoutMs?: number; maxOutputBytes?: number };
type Result = { stdout: string; stderr: string };
export type Runner = (command: Command) => Promise<Result>;
type Schema = { type?: string; enum?: unknown[]; minLength?: number; minItems?: number; pattern?: string; properties?: Record<string, Schema>; required?: string[]; additionalProperties?: boolean; items?: Schema };

const json = async (path: string): Promise<unknown> => JSON.parse(await readFile(path, "utf8"));
function ensure(ok: unknown, message: string): asserts ok { if (!ok) throw new Error(message); }

// Only the JSON Schema subset used by the checked-in schemas is supported.
// Unknown keywords fail closed so schema extensions cannot silently lose checks.
export function validateSchema(value: unknown, schema: Schema, at = "$ "): void {
  const known = new Set(["$schema", "type", "enum", "minLength", "minItems", "pattern", "properties", "required", "additionalProperties", "items"]);
  for (const key of Object.keys(schema)) ensure(known.has(key), `Unsupported schema keyword: ${key}`);
  if (schema.enum) ensure(schema.enum.includes(value), `${at}: invalid enum value`);
  if (schema.type === "object") {
    ensure(value !== null && typeof value === "object" && !Array.isArray(value), `${at}: expected object`);
    const record = value as Record<string, unknown>;
    for (const key of schema.required ?? []) ensure(Object.hasOwn(record, key), `${at}: missing ${key}`);
    for (const [key, item] of Object.entries(record)) {
      const child = schema.properties && Object.hasOwn(schema.properties, key) ? schema.properties[key] : undefined;
      ensure(child || schema.additionalProperties !== false, `${at}: unexpected ${key}`);
      if (child) validateSchema(item, child, `${at}.${key}`);
    }
  } else if (schema.type === "array") {
    ensure(Array.isArray(value), `${at}: expected array`);
    ensure(value.length >= (schema.minItems ?? 0), `${at}: incomplete array`);
    for (const item of value) if (schema.items) validateSchema(item, schema.items, `${at}[]`);
  } else if (schema.type === "string") {
    ensure(typeof value === "string" && value.trim().length >= (schema.minLength ?? 0), `${at}: expected nonempty string`);
    if (schema.pattern) ensure(new RegExp(schema.pattern).test(value), `${at}: invalid format`);
  } else if (schema.type === "boolean") ensure(typeof value === "boolean", `${at}: expected boolean`);
}

export function selectReviewers(category: string, files: string[]): Agent[] {
  const routes: Record<string, Agent[]> = {
    foundation: ["ux-reviewer", "code-qa-reviewer"],
    homepage: ["art-director", "ux-reviewer", "code-qa-reviewer"],
    game: ["art-director", "ux-reviewer", "code-qa-reviewer"],
    "ai-companion": [...AGENTS], cms: ["ux-reviewer", "code-qa-reviewer"],
    search: ["ux-reviewer", "conversation-designer", "code-qa-reviewer"],
    other: ["code-qa-reviewer"],
  };
  ensure(routes[category], "Unknown task category");
  const selected = new Set(routes[category]);
  for (const file of files) {
    if (/^(app\/|components\/)|sanity|content|search|game|guide|companion/i.test(file)) selected.add("ux-reviewer");
    if (/\.(css|svg|png|webp|jpe?g)$|tokens|theme|^public\/assets\/|^game\/|components\/game|app\/page\.tsx$/i.test(file)) selected.add("art-director");
    if (/guide|companion|dialogue|faq|search|prompts/i.test(file)) selected.add("conversation-designer");
  }
  return AGENTS.filter(agent => selected.has(agent));
}

export function validateReview(value: unknown, schema: Schema, selected: Agent[], criteria: string[]): Review {
  validateSchema(value, schema);
  const review = value as Review;
  const names = review.reviewers.map(r => r.name);
  ensure(names.length === selected.length && new Set(names).size === names.length && selected.every(a => names.includes(a)), "Missing, duplicate or unexpected reviewer");
  for (const reviewer of review.reviewers) {
    ensure(reviewer.complete, `Incomplete review: ${reviewer.name}`);
    for (const finding of reviewer.findings) {
      ensure(!["critical", "high"].includes(finding.severity) || finding.blocking, "High/critical defect cannot be optional");
    }
    ensure((reviewer.status === "fail") === reviewer.findings.some(f => f.blocking), "Inconsistent reviewer status");
  }
  const coverage = review.criteriaCoverage.map(c => c.criterion);
  ensure(coverage.length === criteria.length && new Set(coverage).size === coverage.length && criteria.every(c => coverage.includes(c)), "Incomplete acceptance coverage");
  ensure(review.criteriaCoverage.every(c => c.status !== "unverified"), "Unverified acceptance criterion requires human review");
  const blockers = review.reviewers.flatMap(r => r.findings).filter(f => f.blocking);
  for (const criterion of review.criteriaCoverage.filter(c => c.status === "fail")) {
    ensure(blockers.some(f => f.criterion === criterion.criterion), "Failed criterion lacks a blocking fix");
  }
  ensure((review.status === "fail") === (blockers.length > 0), "Inconsistent overall status");
  return review;
}

// No shell interpolation; each child must fully close before the next is spawned.
// Bound runtime and output, and kill the entire process group on cancellation.
export const runProcess: Runner = async ({ command, args, cwd, input, timeoutMs = 900000, maxOutputBytes = 10485760 }) => {
  return new Promise((resolveResult, reject) => {
    const child = spawn(command, args, { cwd, shell: false, detached: process.platform !== "win32", stdio: ["pipe", "pipe", "pipe"] });
    let stdout = "", stderr = "", bytes = 0, failure: Error | undefined;
    const kill = (signal: NodeJS.Signals) => {
      try { if (process.platform !== "win32" && child.pid) process.kill(-child.pid, signal); else child.kill(signal); } catch { /* already closed */ }
    };
    let hardKill: ReturnType<typeof setTimeout> | undefined;
    const stop = (reason: string) => {
      if (failure) return;
      failure = new Error(reason); kill("SIGTERM");
      hardKill = setTimeout(() => kill("SIGKILL"), 1000);
    };
    const interrupt = () => stop("Cancelled by user");
    process.once("SIGINT", interrupt); process.once("SIGTERM", interrupt);
    const timer = setTimeout(() => stop(`${command}: timeout`), timeoutMs);
    child.stdout.on("data", (data: Buffer) => { if (failure) return; bytes += data.length; if (bytes > maxOutputBytes) { stop(`${command}: output limit exceeded`); return; } stdout += data.toString(); });
    child.stderr.on("data", (data: Buffer) => { if (failure) return; bytes += data.length; if (bytes > maxOutputBytes) { stop(`${command}: output limit exceeded`); return; } stderr += data.toString(); });
    child.stdin.on("error", () => { /* exit status/close reports early termination */ });
    const cleanup = () => { clearTimeout(timer); if (hardKill) clearTimeout(hardKill); process.removeListener("SIGINT", interrupt); process.removeListener("SIGTERM", interrupt); };
    child.once("error", error => { cleanup(); reject(error); });
    child.once("close", (code, signal) => {
      cleanup();
      if (failure) reject(failure);
      else if (code !== 0) reject(new Error(`${command}: exit ${code}, signal ${signal ?? "none"}\n${stderr}\n${stdout}`));
      else resolveResult({ stdout, stderr });
    });
    child.stdin.end(input ?? "");
  });
};

export function codexCommand(cwd: string, input: string): Command {
  return { command: "codex", cwd, input, args: ["exec", "--ignore-user-config", "--ignore-rules", "--ephemeral", "--sandbox", "workspace-write", "-C", cwd,
    "-c", 'approval_policy="never"', "-c", 'sandbox_workspace_write.writable_roots=[]',
    "-c", "sandbox_workspace_write.network_access=false", "-c", "sandbox_workspace_write.exclude_tmpdir_env_var=true",
    "-c", "sandbox_workspace_write.exclude_slash_tmp=true", "--json", "-"] };
}

export function claudeCommand(cwd: string, input: string, agents: Record<string, unknown>, schema: Schema): Command {
  return { command: "claude", cwd, input, args: ["-p", "--restricted", "--permission-mode", "plan", "--permission-prompts", "none",
    "--tools", "Read,Grep,Glob,Agent", "--allowedTools", "Read,Grep,Glob,Agent", "--disallowedTools", "Bash,PowerShell,Edit,Write,NotebookEdit,WebFetch,WebSearch",
    "--strict-mcp-config", "--mcp-config", '{"mcpServers":{}}', "--setting-sources", "", "--settings", '{"disableAllHooks":true}',
    "--no-chrome", "--no-session-persistence", "--agents", JSON.stringify(agents),
    "--output-format", "stream-json", "--verbose", "--json-schema", JSON.stringify(schema)] };
}

export function parseClaude(stdout: string, selected: Agent[]): unknown {
  const events = stdout.trim().split("\n").map(line => JSON.parse(line) as Record<string, unknown>);
  const calls = new Map<string, Agent>(); const completed = new Set<string>();
  for (const event of events) {
    if (event.type === "rate_limit_event") {
      const info = event.rate_limit_info as { status?: string } | undefined;
      ensure(info?.status === "allowed", "Claude usage/rate limit event");
    }
    ensure(event.type !== "error", "Claude error event");
    const message = event.message as { content?: { type: string; id?: string; name?: string; input?: { subagent_type?: Agent; run_in_background?: boolean }; tool_use_id?: string; is_error?: boolean }[] } | undefined;
    for (const block of message?.content ?? []) {
      if (block.type === "tool_use" && block.name === "Agent") {
        ensure(block.id && block.input?.subagent_type && selected.includes(block.input.subagent_type), "Unexpected specialist invocation");
        ensure(block.input.run_in_background !== true, "Background reviews cannot prove completion; use foreground Agent calls");
        calls.set(block.id, block.input.subagent_type);
      }
      if (block.type === "tool_result") {
        ensure(!block.is_error, "Claude tool/subagent failed");
        if (block.tool_use_id && calls.has(block.tool_use_id)) completed.add(block.tool_use_id);
      }
    }
  }
  for (const agent of selected) ensure([...calls].some(([id, name]) => name === agent && completed.has(id)), `No completed invocation evidence for ${agent}`);
  const results = events.filter(e => e.type === "result");
  ensure(results.length === 1, "Missing or duplicate Claude result");
  const result = results[0];
  ensure(result.subtype === "success" && result.is_error === false && result.structured_output, "Claude did not produce a successful structured review");
  ensure(!Array.isArray(result.permission_denials) || result.permission_denials.length === 0, "Claude encountered permission denials");
  return result.structured_output;
}

export function validateCodex(stdout: string): void {
  const events = stdout.trim().split("\n").map(line => JSON.parse(line) as { type: string; item?: { type?: string }; error?: unknown });
  ensure(events.some(e => e.type === "turn.completed"), "Codex turn did not complete");
  ensure(!events.some(e => e.type === "error" || e.type === "turn.failed" || e.error || e.item?.type === "error"), "Codex reported an error or usage/auth failure");
}

export async function workflow(options: {
  maxRounds: number; implement: (blockers: Finding[], round: number) => Promise<void>;
  checks: (round: number) => Promise<void>; review: (round: number) => Promise<Review>;
}): Promise<{ status: "ready-for-human-approval" | "blocking-defects-remain"; rounds: number }> {
  ensure(Number.isInteger(options.maxRounds) && options.maxRounds >= 1 && options.maxRounds <= 3, "Review rounds must be 1–3");
  let blockers: Finding[] = [];
  for (let round = 1; round <= options.maxRounds; round++) {
    await options.implement(blockers, round);
    await options.checks(round);
    const review = await options.review(round);
    blockers = review.reviewers.flatMap(r => r.findings).filter(f => f.blocking);
    if (review.status === "pass") return { status: "ready-for-human-approval", rounds: round };
  }
  return { status: "blocking-defects-remain", rounds: options.maxRounds };
}

export async function loadAgents(root: string, selected: Agent[]): Promise<Record<string, unknown>> {
  const definitions: Record<string, unknown> = {};
  for (const name of selected) {
    const source = await readFile(join(root, ".claude/agents", `${name}.md`), "utf8");
    const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]+)$/);
    ensure(match && new RegExp(`^name: ${name}$`, "m").test(match[1]) && /^tools: Read, Grep, Glob$/m.test(match[1]), `Invalid read-only agent definition: ${name}`);
    definitions[name] = { description: `${name}: Portfolio Quest specialist reviewer`, prompt: match[2], tools: ["Read", "Grep", "Glob"], model: "inherit", permissionMode: "plan" };
  }
  return definitions;
}

function safePaths(task: Task): void {
  ensure(new Set(task.acceptanceCriteria).size === task.acceptanceCriteria.length, "Duplicate acceptance criteria");
  for (const path of task.allowedPaths) {
    ensure(!isAbsolute(path) && !path.includes("\\") && !path.split("/").some(p => p === ".." || p === ".") && !/[\0\n*?]/.test(path), "allowedPaths must be literal relative files/directories");
    ensure(!/^(automation|\.git|\.claude|\.codex|\.env|AGENTS\.md|CLAUDE\.md)(\/|$|\.)/.test(path), "Protected allowedPath");
  }
  for (const script of task.testScripts) ensure(/^test(?::[a-z0-9-]+)*$/.test(script), "testScripts must be named npm test scripts");
}

export async function main(argv: string[], runner: Runner = runProcess, root = ROOT): Promise<void> {
  const major = Number(process.versions.node.split(".")[0]);
  ensure(major >= 24, "The coordinator requires Node.js 24+ (native TypeScript)");
  let taskPath = "automation/fixtures/task.json", dry = false, execute = false, scenario = "repair";
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--dry-run") dry = true;
    else if (arg === "--execute") execute = true;
    else if (arg === "--task") { ensure(argv[i + 1], "--task needs a JSON file"); taskPath = argv[++i]; }
    else if (arg === "--scenario") { ensure(argv[i + 1], "--scenario needs a value"); scenario = argv[++i]; }
    else throw new Error(`Unknown argument: ${arg}`);
  }
  ensure(dry !== execute, "Choose exactly one: --dry-run or --execute (live is disabled by default)");
  ensure(["pass", "repair", "exhausted", "invalid", "check-failure", "auth-failure", "timeout", "usage-limit"].includes(scenario), "Unknown dry-run scenario");
  const config = await json(join(root, "automation/config.json")) as Config;
  ensure(typeof config.liveEnabled === "boolean" && Array.isArray(config.checks) && config.checks.every(c => typeof c === "string"), "Invalid config");
  ensure(Number.isInteger(config.maxReviewRounds) && config.maxReviewRounds >= 1 && config.maxReviewRounds <= 3, "maxReviewRounds must be 1–3");
  ensure(Number.isInteger(config.processTimeoutMs) && config.processTimeoutMs > 0 && config.processTimeoutMs <= 900000, "Timeout must be 1–900000ms");
  ensure(Number.isInteger(config.maxOutputBytes) && config.maxOutputBytes > 0 && config.maxOutputBytes <= 10485760, "Invalid output cap");
  if (execute) ensure(config.liveEnabled, "Live execution is disabled. Obtain owner approval before enabling liveEnabled.");
  const taskSchema = await json(join(root, "automation/schemas/task.schema.json")) as Schema;
  const reviewSchema = await json(join(root, "automation/schemas/review.schema.json")) as Schema;
  const value = await json(resolve(root, taskPath)); validateSchema(value, taskSchema);
  const task = value as Task; safePaths(task);
  const reportRoot = join(root, "automation/reports");
  await mkdir(reportRoot, { recursive: true });
  ensure(!(await lstat(reportRoot)).isSymbolicLink(), "Reports directory must not be a symlink");
  const lockPath = join(reportRoot, ".lock");
  const lock = await open(lockPath, "wx");
  const id = `${task.id}-${Date.now()}-${randomUUID().slice(0, 8)}`;
  const reportDir = join(reportRoot, id); await mkdir(reportDir);
  const trace: unknown[] = [];
  let worktree: string | undefined;
  const roundReviews: { round: number; review: Review; checks: unknown[] }[] = [];
  const report: Record<string, unknown> = { id, task, mode: dry ? "dry-run" : "live", scenario: dry ? scenario : null, status: "running", trace, reviews: roundReviews, humanApprovalRequired: true };
  const save = async () => {
    await writeFile(join(reportDir, "final.json"), JSON.stringify(report, null, 2) + "\n");
    const latest = roundReviews.at(-1);
    const findings = latest?.review.reviewers.flatMap(r => r.findings) ?? [];
    const details = findings.map(f => `- ${f.blocking ? "BLOCKING" : "Optional"} / ${f.severity}: ${f.evidence}\n  Fix: ${f.suggestedFix}\n  Verify: ${f.verification}`).join("\n");
    await writeFile(join(reportDir, "final.md"), `# Portfolio Quest coordinator\n\nMode: ${report.mode}${dry ? " — all agent/check results are SIMULATED" : ""}\n\nStatus: ${report.status}\n\nTask: ${task.id}\n\nRounds: ${report.rounds ?? 0}\n\n${report.error ?? ""}\n\nReviewers: ${latest?.review.reviewers.map(r => r.name).join(", ") ?? "not completed"}\n\nChecks: ${JSON.stringify(latest?.checks ?? [])}\n\nFindings:\n\n${details || "No findings in a completed final review (see status for incomplete runs)."}\n\nOpen decisions: ${latest?.review.openDecisions.join("; ") || "none reported"}\n\nNot reviewed: ${latest?.review.reviewers.flatMap(r => r.notReviewed).join("; ") || "see review scope"}\n\nHuman approval required. No commit, push, merge or deployment performed.\n\nSee final.json and round logs in this directory.\n`);
  };
  const command = async (spec: Command, label: string) => {
    trace.push({ label, command: spec.command, args: spec.args, cwd: spec.cwd });
    let result: Result;
    try { result = await runner({ ...spec, timeoutMs: config.processTimeoutMs, maxOutputBytes: config.maxOutputBytes }); }
    catch (error) { await writeFile(join(reportDir, `${label}.error.log`), String(error)); throw error; }
    await writeFile(join(reportDir, `${label}.stdout.log`), result.stdout);
    await writeFile(join(reportDir, `${label}.stderr.log`), result.stderr);
    return result.stdout;
  };
  try {
    let selected = selectReviewers(task.category, []);
    await loadAgents(root, selected);
    if (!dry) {
      // Versions/help are inspection only. No model session is launched here.
      for (const cli of ["codex", "claude"] as const) {
        const version = await command({ command: cli, args: ["--version"], cwd: root }, `${cli}-version`);
        ensure(version.trim() === config.inspectedVersions[cli], `${cli} version changed; inspect its flags and update config before running`);
        await command({ command: cli, args: cli === "codex" ? ["exec", "--help"] : ["--help"], cwd: root }, `${cli}-help`);
      }
      await command({ command: "git", args: ["rev-parse", "--verify", "HEAD"], cwd: root }, "git-head");
      const dirty = await command({ command: "git", args: ["status", "--porcelain", "--untracked-files=all"], cwd: root }, "git-status");
      ensure(!dirty.trim(), "Live runs require a clean committed repository; preserve/review current changes first");
      worktree = join(tmpdir(), `portfolio-quest-${id}`);
      await command({ command: "git", args: ["worktree", "add", "-b", `automation/${id}`, worktree, "HEAD"], cwd: root }, "worktree-add");
      report.worktree = worktree; report.branch = `automation/${id}`;
      await command({ command: "npm", args: ["ci", "--ignore-scripts"], cwd: worktree }, "install");
    }
    const cwd = worktree ?? root;
    const git = async (args: string[], label: string) => command({ command: "git", args, cwd }, label);
    const changedFiles = async (round: number) => {
      const tracked = await git(["diff", "HEAD", "--name-only", "-z", "--no-renames"], `round-${round}-files`);
      const untracked = await git(["ls-files", "--others", "--exclude-standard", "-z"], `round-${round}-untracked`);
      const files = [...new Set((tracked + untracked).split("\0").filter(Boolean))];
      for (const file of files) ensure(task.allowedPaths.some(p => p.endsWith("/") ? file.startsWith(p) : file === p), `Out-of-scope file: ${file}`);
      return files;
    };
    const fingerprint = async (files: string[]) => {
      const hash = createHash("sha256");
      for (const file of files.sort()) {
        hash.update(file);
        try { hash.update(await readFile(join(cwd, file))); } catch (error) { ensure((error as NodeJS.ErrnoException).code === "ENOENT", "Cannot fingerprint file"); hash.update("deleted"); }
      }
      return hash.digest("hex");
    };
    let files: string[] = [];
    const checks: { script: string; status: string; log?: string }[] = [];
    const outcome = await workflow({
      maxRounds: config.maxReviewRounds,
      implement: async (blockers, round) => {
        report.rounds = round;
        trace.push({ stage: "codex", round, simulated: dry, blockingFixes: blockers });
        if (dry) {
          if (["auth-failure", "timeout", "usage-limit"].includes(scenario)) throw new Error(`Simulated ${scenario}; stopped without retry`);
          return;
        }
        const prompt = await readFile(join(root, "automation/prompts/implement.md"), "utf8");
        const input = `${prompt}\nTASK DATA:\n${JSON.stringify(task)}\nBLOCKING FIX BRIEF:\n${JSON.stringify(blockers)}\n`;
        validateCodex(await command(codexCommand(cwd, input), `round-${round}-codex`));
        files = await changedFiles(round); selected = selectReviewers(task.category, files);
      },
      checks: async round => {
        checks.length = 0;
        const scripts = new Set(["lint", "typecheck", "build", ...config.checks, ...task.testScripts]);
        if (!dry) {
          const pkg = await json(join(cwd, "package.json")) as { scripts?: Record<string, string> };
          for (const script of Object.keys(pkg.scripts ?? {})) if (/^test(?::|$)/.test(script)) scripts.add(script);
          for (const script of scripts) ensure(pkg.scripts?.[script], `Missing required check script: ${script}`);
        }
        for (const script of scripts) {
          trace.push({ stage: "check", script, round, simulated: dry });
          if (dry && scenario === "check-failure") throw new Error("Simulated nonzero check exit; stopped without retry");
          if (!dry) await command({ command: "npm", args: ["run", script], cwd }, `round-${round}-check-${script.replaceAll(":", "-")}`);
          checks.push({ script, status: dry ? "simulated-pass" : "pass" });
        }
      },
      review: async round => {
        trace.push({ stage: "claude", round, reviewers: selected, simulated: dry });
        let value: unknown;
        if (dry) {
          const fail = scenario === "exhausted" || (scenario === "repair" && round === 1);
          const finding: Finding = { severity: "high", blocking: true, criterion: task.acceptanceCriteria[0], evidence: "SIMULATION: fixture requirement is unmet", suggestedFix: "SIMULATION: repair the scoped fixture", verification: "SIMULATION: rerun fixture checks" };
          value = { status: fail ? "fail" : "pass", summary: "SIMULATED review; no model invoked", reviewers: selected.map(name => ({ name, status: fail && name === "code-qa-reviewer" ? "fail" : "pass", complete: true, scope: "Simulated specialist review", findings: fail && name === "code-qa-reviewer" ? [finding] : [], notReviewed: ["Application code and real CLI authentication were not reviewed."] })), criteriaCoverage: task.acceptanceCriteria.map(criterion => ({ criterion, status: fail && criterion === task.acceptanceCriteria[0] ? "fail" : "pass", evidence: "SIMULATED fixture result" })), openDecisions: [] };
          if (scenario === "invalid") value = {};
        } else {
          const beforeFiles = await changedFiles(round);
          const before = await fingerprint(beforeFiles);
          const definitions = await loadAgents(root, selected);
          const prompt = await readFile(join(root, "automation/prompts/review.md"), "utf8");
          const diff = await git(["diff", "HEAD", "--no-ext-diff", "--no-textconv", "--no-renames", "--", ...files], `round-${round}-diff`);
          const input = `${prompt}\nREVIEW DATA:\n${JSON.stringify({ task, selected, files, checks, diff })}`;
          value = parseClaude(await command(claudeCommand(cwd, input, definitions, reviewSchema), `round-${round}-claude`), selected);
          const afterFiles = await changedFiles(round);
          ensure(before === await fingerprint(afterFiles), "Review modified task files; stopping");
        }
        const review = validateReview(value, reviewSchema, selected, task.acceptanceCriteria);
        roundReviews.push({ round, review, checks: [...checks] });
        await writeFile(join(reportDir, `round-${round}-review.json`), JSON.stringify(review, null, 2) + "\n");
        return review;
      },
    });
    Object.assign(report, outcome, { checks, changedFiles: files });
    if (outcome.status === "blocking-defects-remain") process.exitCode = 1;
  } catch (error) {
    report.status = "stopped"; report.error = error instanceof Error ? error.message : String(error);
    process.exitCode = 1;
  } finally {
    try { await save(); } finally { await lock.close(); await unlink(lockPath); }
    console.log(`${dry ? "DRY RUN" : "LIVE"}: ${report.status}\nReport: ${join(reportDir, "final.md")}`);
    if (report.error) console.error(report.error);
  }
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  main(process.argv.slice(2)).catch(error => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; });
}
