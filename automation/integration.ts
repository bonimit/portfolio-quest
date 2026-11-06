import { spawn } from "node:child_process";
import { realpathSync } from "node:fs";
import { readFile, writeFile, mkdir, readdir, lstat, symlink, open, unlink } from "node:fs/promises";
import { createHash, randomUUID } from "node:crypto";
import { join, resolve, dirname, isAbsolute, delimiter } from "node:path";
import { tmpdir, homedir } from "node:os";
import { fileURLToPath, pathToFileURL } from "node:url";
import { loadAgents, codexCommand, claudeCommand, parseClaude, validateReview, validateSchema, selectReviewers } from "./orchestrator.ts";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ALL = selectReviewers("ai-companion", []);
const SELECTED = selectReviewers("foundation", []);
const COMPONENT = "components/integration/IntegrationNotice.tsx";
const TEST = "tests/integration/notice.test.mjs";
const ALLOWED = new Set([COMPONENT, TEST]);
export const SANDBOX_PROBE = `const fs=require('node:fs'),assert=require('node:assert/strict'),net=require('node:net');
fs.writeFileSync(process.argv[1],'temporary probe');
for(const path of process.argv.slice(2)){let denied=false;try{fs.writeFileSync(path,'temporary probe')}catch(e){denied=['EPERM','EACCES'].includes(e.code)}assert.ok(denied,'write boundary failed')}
const socket=net.connect({host:'127.0.0.1',port:9});socket.setTimeout(1000,()=>{socket.destroy();process.exitCode=2});
socket.on('connect',()=>{socket.destroy();process.exitCode=2});socket.on('error',e=>{assert.ok(['EPERM','EACCES'].includes(e.code),'network boundary failed');console.log('sandbox boundaries passed')});`;
type Config = { enabled: boolean; maxReviewRounds: number; childTimeoutMs: number; totalTimeoutMs: number; maxOutputBytes: number };
type Review = ReturnType<typeof validateReview>;
type Schema = Parameters<typeof validateReview>[1];
type Spec = { command: string; args: string[]; cwd: string; input?: string; env?: NodeJS.ProcessEnv; timeoutMs: number; maxOutputBytes: number; monitor?: boolean };
type Execution = { stdout: string; stderr: string; exitCode: number | null; signal: string | null; reason: string | null };
export type IntegrationRunner = (spec: Spec) => Promise<Execution>;
const readJSON = async (path: string) => JSON.parse(await readFile(path, "utf8"));
function requireThat(ok: unknown, message: string): asserts ok { if (!ok) throw new Error(message); }
const digest = (value: string | Buffer) => createHash("sha256").update(value).digest("hex");

export function validateLimits(config: Config) {
  requireThat(typeof config.enabled === "boolean", "enabled must be boolean");
  for (const [value, max, name] of [[config.maxReviewRounds, 3, "rounds"], [config.childTimeoutMs, 600000, "child timeout"], [config.totalTimeoutMs, 2700000, "total timeout"], [config.maxOutputBytes, 10485760, "output cap"]] as const) {
    requireThat(Number.isInteger(value) && value >= 1 && value <= max, `Invalid ${name}`);
  }
}

export const SKILLS_BUDGET_NOTICE = "Skill descriptions were shortened to fit the 2% skills context budget. Codex can still see every skill, but some descriptions are shorter. Disable unused skills or plugins to leave more room for the rest.";

// Codex 0.145.0 emits this informational notice as an error-typed item without
// severity/code fields. Match the entire observed event shape/message only.
export function informationalNotice(event: Record<string, unknown>): boolean {
  const item = event.item as { type?: string; message?: string; status?: string; error?: unknown; exit_code?: number } | undefined;
  return event.type === "item.completed" && !event.error && item?.type === "error" &&
    item.message === SKILLS_BUDGET_NOTICE && item.status === undefined && item.error === undefined && item.exit_code === undefined;
}

// Apple Git can exit 0 despite an xcrun cache denial. Parse its exact diagnostic
// grammar, never generic words such as "permission" appearing in prose/stderr.
export function gitCacheDenials(text: string): string[] {
  return [...text.matchAll(/^git: error: couldn't create cache file '([^'\r\n]+)' \(errno=(?:Operation not permitted|Permission denied)\)\r?$/gm)].map(match => match[1]);
}

export function fatalEvent(event: Record<string, unknown>): boolean {
  if (["error", "turn.failed"].includes(String(event.type)) || event.error) return true;
  const item = event.item as { type?: string; status?: string; exit_code?: number | null; aggregated_output?: string } | undefined;
  if (item?.type === "error") return !informationalNotice(event);
  if (item?.status === "failed" || item?.status === "cancelled") return true;
  if (item?.type === "command_execution" && event.type === "item.completed") {
    if (item.status !== "completed" || item.exit_code !== 0) return true;
    if (gitCacheDenials(item.aggregated_output ?? "").length) return true;
  }
  if (event.type === "rate_limit_event" && (event.rate_limit_info as { status?: string })?.status !== "allowed") return true;
  if (event.type === "result" && (event.is_error === true || event.subtype !== "success" || (Array.isArray(event.permission_denials) && event.permission_denials.length > 0))) return true;
  const blocks = (event.message as { content?: { type?: string; is_error?: boolean }[] })?.content;
  return Boolean(blocks?.some(block => block.type === "tool_result" && block.is_error));
}

export function validateIntegrationCodex(stdout: string, exitCode: number | null): Record<string, unknown>[] {
  requireThat(exitCode === 0, "Codex process exited unsuccessfully");
  const events = stdout.trim().split("\n").map(line => JSON.parse(line) as Record<string, unknown>);
  requireThat(events.some(event => event.type === "turn.completed"), "Codex turn did not complete");
  requireThat(!events.some(fatalEvent), "Codex reported a structured failure or Git cache denial");
  return events.filter(informationalNotice);
}

export async function worktreeCommandEnvironment(worktree: string, nativeGit: string): Promise<NodeJS.ProcessEnv> {
  const local = realpathSync(join(worktree, ".integration-tmp"));
  const temp = join(local, "tmp"), cache = join(local, "cache");
  await mkdir(temp, { recursive: true }); await mkdir(cache, { recursive: true });
  return {
    PATH: [dirname(nativeGit), dirname(process.execPath), process.env.PATH ?? "/usr/bin:/bin"].join(delimiter),
    HOME: homedir(), TMPDIR: temp, TMP: temp, TEMP: temp, XDG_CACHE_HOME: cache,
    GIT_OPTIONAL_LOCKS: "0", NEXT_TELEMETRY_DISABLED: "1", CI: "1", NODE_ENV: "production",
  };
}

export function integrationCodexCommand(worktree: string, input: string, environment: NodeJS.ProcessEnv) {
  const spec = codexCommand(worktree, input);
  // Retain all existing policy rules and the original workspace-write boundary.
  spec.args = spec.args.filter(arg => arg !== "--ignore-rules");
  const overrides = ['allow_login_shell=false', 'shell_environment_policy.inherit="core"', 'shell_environment_policy.ignore_default_excludes=false'];
  for (const key of ["PATH", "TMPDIR", "TMP", "TEMP", "XDG_CACHE_HOME", "GIT_OPTIONAL_LOCKS"]) {
    requireThat(typeof environment[key] === "string", `Missing command environment: ${key}`);
    overrides.push(`shell_environment_policy.set.${key}=${JSON.stringify(environment[key])}`);
  }
  // The final dash still directs the CLI to read the supplied prompt from stdin.
  spec.args.splice(spec.args.length - 1, 0, ...overrides.flatMap(value => ["-c", value]));
  return spec;
}

// Stream guards stop on explicit CLI errors before another handoff can occur.
// Groups are killed on normal exit too, so descendants left in that group cannot linger.
export const executeBounded: IntegrationRunner = spec => new Promise(resolveResult => {
  const child = spawn(spec.command, spec.args, { cwd: spec.cwd, env: spec.env, shell: false, detached: true, stdio: ["pipe", "pipe", "pipe"] });
  let stdout = "", stderr = "", pending = "", bytes = 0, reason: string | null = null;
  let hardKill: ReturnType<typeof setTimeout> | undefined;
  const kill = (signal: NodeJS.Signals) => { try { if (child.pid) process.kill(-child.pid, signal); } catch { /* already exited */ } };
  const stop = (message: string) => {
    if (reason) return;
    reason = message; kill("SIGTERM"); hardKill = setTimeout(() => kill("SIGKILL"), 1000);
  };
  const interrupt = () => stop("cancelled");
  process.once("SIGINT", interrupt); process.once("SIGTERM", interrupt);
  const timer = setTimeout(() => stop("timeout"), spec.timeoutMs);
  const take = (data: Buffer, channel: "stdout" | "stderr") => {
    if (reason) return;
    bytes += data.length;
    if (bytes > spec.maxOutputBytes) { stop("output limit"); return; }
    const text = data.toString();
    if (channel === "stderr") {
      stderr += text;
    } else {
      stdout += text;
      if (!spec.monitor) return;
      pending += text;
      const lines = pending.split("\n"); pending = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.trim()) continue;
        try { if (fatalEvent(JSON.parse(line))) stop("fatal CLI event"); } catch { stop("invalid CLI stream"); }
      }
    }
  };
  child.stdout.on("data", data => take(data, "stdout"));
  child.stderr.on("data", data => take(data, "stderr"));
  child.stdin.on("error", () => {});
  child.once("error", error => { reason = `spawn failed: ${(error as NodeJS.ErrnoException).code ?? "unknown"}`; });
  child.once("close", (exitCode, signal) => {
    kill("SIGKILL"); clearTimeout(timer); if (hardKill) clearTimeout(hardKill);
    process.removeListener("SIGINT", interrupt); process.removeListener("SIGTERM", interrupt);
    resolveResult({ stdout, stderr, exitCode, signal, reason });
  });
  child.stdin.end(spec.input ?? "");
});

export function delegationEvidence(stdout: string) {
  const events = stdout.trim().split("\n").map(line => JSON.parse(line));
  const evidence: { agent: string; toolUseId: string; invocationLine: number; completionLine: number; resultSha256: string }[] = [];
  events.forEach((event, index) => {
    for (const block of event.message?.content ?? []) {
      if (block.type !== "tool_use" || block.name !== "Agent") continue;
      requireThat(block.input?.run_in_background !== true, "Cannot verify background delegation");
      const completionIndex = events.findIndex((other, i) => i > index && other.message?.content?.some((b: { type: string; tool_use_id?: string; is_error?: boolean }) => b.type === "tool_result" && b.tool_use_id === block.id && !b.is_error));
      requireThat(completionIndex > index, "No completed specialist call");
      const result = events[completionIndex].message.content.find((b: { tool_use_id?: string }) => b.tool_use_id === block.id);
      evidence.push({ agent: block.input.subagent_type, toolUseId: block.id, invocationLine: index + 1, completionLine: completionIndex + 1, resultSha256: digest(JSON.stringify(result)) });
    }
  });
  for (const name of SELECTED) requireThat(evidence.some(e => e.agent === name), `Missing delegation evidence: ${name}`);
  return evidence;
}

export function injectDefect(source: string): string {
  requireThat(!/aria-hidden/.test(source) && /<p(?:\s|>)/.test(source), "Cannot safely inject fixture defect; unexpected component shape");
  return source.replace(/<p(?=\s|>)/, '<p aria-hidden="true"');
}

export function sandboxProfile(worktree: string, metadata: string[], home = homedir()): string {
  const quote = (value: string) => JSON.stringify(value);
  // Seatbelt matches physical paths (for example /private/var, not /var).
  const physical = (path: string) => { try { return realpathSync(path); } catch { return path; } };
  return `(version 1)\n(allow default)\n(deny network*)\n(deny file-write*)\n(allow file-write* (subpath ${quote(physical(worktree))}) (literal "/dev/null"))\n` +
    metadata.map(path => `(deny file-write* (subpath ${quote(physical(path))}))\n`).join("") +
    [".codex", ".claude", ".aws", ".ssh"].map(path => `(deny file-read* (subpath ${quote(physical(join(home, path)))}))\n`).join("");
}

// Include ignored source files; only known build/dependency directories are excluded.
// Reject symlinks in source so scope checks cannot follow paths out of the worktree.
export async function sourceSnapshot(root: string): Promise<Record<string, string>> {
  const result: Record<string, string> = {}; let bytes = 0, count = 0;
  const walk = async (dir: string, prefix = "") => {
    for (const name of (await readdir(dir)).sort()) {
      const path = prefix ? `${prefix}/${name}` : name;
      if (["node_modules", ".next", ".git", ".integration-tmp"].includes(path)) continue;
      const absolute = join(dir, name), stat = await lstat(absolute);
      requireThat(!stat.isSymbolicLink(), `Unexpected source symlink: ${path}`);
      if (stat.isDirectory()) await walk(absolute, path);
      else if (stat.isFile()) {
        bytes += stat.size; count++;
        requireThat(bytes <= 100 * 1024 * 1024 && count <= 10000, "Source snapshot limit exceeded");
        result[path] = digest(await readFile(absolute));
      }
    }
  };
  await walk(root); return result;
}
export function assertScope(before: Record<string, string>, after: Record<string, string>, readonly = false) {
  for (const file of new Set([...Object.keys(before), ...Object.keys(after)])) {
    if (before[file] !== after[file]) requireThat(!readonly && ALLOWED.has(file), `Forbidden ${readonly ? "review " : ""}change: ${file}`);
  }
}

export async function integrationMain(argv: string[], runner: IntegrationRunner = executeBounded, root = ROOT) {
  requireThat(Number(process.versions.node.split(".")[0]) >= 24, "Use Node.js 24+");
  requireThat(argv.length === 1 && ["--plan", "--preflight", "--execute"].includes(argv[0]), "Choose --plan, --preflight, or --execute");
  const mode = argv[0];
  const config = await readJSON(join(root, "automation/integration-config.json")) as Config; validateLimits(config);
  const task = await readJSON(join(root, "automation/integration-fixtures/task.json"));
  validateSchema(task, await readJSON(join(root, "automation/schemas/task.schema.json")));
  requireThat(JSON.stringify(task.allowedPaths) === JSON.stringify([...ALLOWED]), "Fixture scope changed; inspect harness before proceeding");
  requireThat(task.acceptanceCriteria.length === 3 && task.category === "foundation", "Unexpected fixture criteria/category");
  const agents = await loadAgents(root, ALL);
  for (const agent of ALL) requireThat(!(await lstat(join(root, ".claude/agents", `${agent}.md`))).isSymbolicLink(), "Agent definitions cannot be symlinks");
  if (mode === "--plan") {
    console.log(JSON.stringify({ mode: "plan-only", liveEnabled: config.enabled, task, selected: SELECTED, definitionsValidated: ALL, limits: config, handoffs: ["Codex implements", "Harness injects declared defect", "Sandboxed base checks", "Claude delegates UX and Code QA", "Claude blocking fix brief → Codex", "Sandboxed checks + real rereview", "Final accessibility oracle", "Human approval"], modelsInvoked: false }, null, 2));
    return;
  }
  if (mode === "--execute") {
    requireThat(config.enabled, "Integration execution disabled; obtain explicit owner approval before setting enabled=true");
    requireThat(process.platform === "darwin", "Controlled live harness currently supports macOS only");
  }
  const directory = join(root, "automation/reports", `integration-${Date.now()}-${randomUUID().slice(0, 8)}`);
  await mkdir(directory, { recursive: true });
  const lockPath = join(root, "automation/reports/.lock"), lock = await open(lockPath, "wx");
  const started = Date.now(), deadline = started + config.totalTimeoutMs;
  const events: Record<string, unknown>[] = [], rounds: Record<string, unknown>[] = [];
  const real = runner === executeBounded;
  const report: Record<string, unknown> = { mode, runner: real ? "real" : "test-double", status: "running", modelsInvoked: false, task, limits: config, events, rounds, humanApprovalRequired: true };
  let worktree: string | undefined;
  const record = async (event: Record<string, unknown>) => {
    const entry = { at: new Date().toISOString(), ...event }; events.push(entry);
    await writeFile(join(directory, "handoffs.jsonl"), events.map(e => JSON.stringify(e)).join("\n") + "\n");
  };
  const step = async (label: string, command: string, args: string[], options: { cwd?: string; input?: string; env?: NodeJS.ProcessEnv; monitor?: boolean; auth?: boolean } = {}) => {
    const remaining = deadline - Date.now(); requireThat(remaining > 0, "Whole-run deadline exceeded");
    if (options.input) await writeFile(join(directory, `${label}.input.txt`), options.input);
    await record({ label, phase: "start", command, args: options.auth ? ["authentication-status (details suppressed)"] : args, inputSha256: options.input ? digest(options.input) : null });
    const output = await runner({ command, args, cwd: options.cwd ?? root, input: options.input, env: options.env, monitor: options.monitor, timeoutMs: Math.min(options.auth ? 15000 : config.childTimeoutMs, remaining), maxOutputBytes: config.maxOutputBytes });
    if (!options.auth) {
      await writeFile(join(directory, `${label}.stdout.log`), output.stdout);
      await writeFile(join(directory, `${label}.stderr.log`), output.stderr);
    }
    await record({ label, phase: "end", exitCode: output.exitCode, signal: output.signal, reason: output.reason });
    requireThat(output.exitCode === 0 && !output.reason, `${label} stopped: exit=${output.exitCode}, reason=${output.reason ?? "nonzero exit"}`);
    const deniedCachePaths = gitCacheDenials(output.stderr);
    if (deniedCachePaths.length) {
      await record({ label, diagnostic: "git-cache-denial", paths: deniedCachePaths });
      throw new Error(`${label}: Git cache permission failure despite exit 0`);
    }
    return output;
  };
  try {
    const versions = await readJSON(join(root, "automation/config.json"));
    for (const cli of ["codex", "claude"]) {
      const version = await step(`${cli}-version`, cli, ["--version"]);
      requireThat(version.stdout.trim() === versions.inspectedVersions[cli], `${cli} version drift; inspect flags first`);
    }
    const codexAuth = await step("codex-auth", "codex", ["login", "status"], { auth: true });
    requireThat(/logged in/i.test(codexAuth.stdout + codexAuth.stderr), "Codex authentication unavailable");
    const claudeAuth = await step("claude-auth", "claude", ["auth", "status", "--json"], { auth: true });
    let claudeLoggedIn = false;
    try { claudeLoggedIn = JSON.parse(claudeAuth.stdout).loggedIn === true; } catch { throw new Error("Invalid Claude authentication-status response (details suppressed)"); }
    requireThat(claudeLoggedIn, "Claude authentication unavailable");
    report.authentication = { codex: true, claude: true, note: "CLI status only; provider access not exercised" };
    report.definitionsValidated = ALL;
    if (mode === "--preflight") {
      report.status = "preflight-passed-no-models-run"; return;
    }
    const locatedGit = await step("resolve-native-git", "/usr/bin/xcrun", ["--no-cache", "--find", "git"]);
    const nativeGit = locatedGit.stdout.trim();
    requireThat(isAbsolute(nativeGit) && nativeGit !== "/usr/bin/git" && (await lstat(nativeGit)).isFile(), "Native toolchain Git unavailable; do not fall back to the Apple launcher");
    report.gitExecutable = nativeGit;
    await step("native-git-version", nativeGit, ["--version"]);
    await step("head", nativeGit, ["rev-parse", "--verify", "HEAD"]);
    const status = await step("clean", nativeGit, ["--no-optional-locks", "status", "--porcelain", "--untracked-files=all"]);
    requireThat(!status.stdout.trim(), "A reviewed clean committed baseline is required; no automatic commit or stash");
    requireThat(!(await lstat(join(root, "node_modules"))).isSymbolicLink(), "Use a local installed node_modules directory");
    requireThat((await lstat("/usr/bin/sandbox-exec")).isFile(), "macOS validation sandbox unavailable");
    worktree = join(tmpdir(), `portfolio-integration-${randomUUID()}`);
    const branch = `automation/integration-${randomUUID().slice(0, 8)}`;
    await step("worktree", nativeGit, ["-c", "core.hooksPath=/dev/null", "worktree", "add", "-b", branch, worktree, "HEAD"]);
    report.worktree = worktree; report.branch = branch;
    await symlink(join(root, "node_modules"), join(worktree, "node_modules"), "dir");
    await mkdir(join(worktree, ".integration-tmp"));
    const protectedProbe = join(worktree, ".integration-tmp/protected");
    await mkdir(protectedProbe);
    const common = await step("git-common", nativeGit, ["rev-parse", "--path-format=absolute", "--git-common-dir"], { cwd: worktree });
    const gitdir = await step("git-dir", nativeGit, ["rev-parse", "--absolute-git-dir"], { cwd: worktree });
    const profilePath = join(directory, "validation.sb");
    await writeFile(profilePath, sandboxProfile(worktree, [join(worktree, ".git"), common.stdout.trim(), gitdir.stdout.trim(), protectedProbe]));
    const base = await sourceSnapshot(worktree);
    requireThat(!base[COMPONENT] && !base[TEST], "Fixture paths already exist in the baseline");
    const env = await worktreeCommandEnvironment(worktree, nativeGit);
    report.commandEnvironment = { git: nativeGit, temp: env.TMPDIR, cache: env.XDG_CACHE_HOME, gitOptionalLocks: env.GIT_OPTIONAL_LOCKS, loginShell: false };
    const check = async (label: string, args: string[]) => step(label, "/usr/bin/sandbox-exec", ["-f", profilePath, process.execPath, ...args], { cwd: worktree, env });
    await check("sandbox-probe", ["-e", SANDBOX_PROBE, join(worktree, ".integration-tmp/allowed.txt"), join(directory, "forbidden-probe.txt"), join(protectedProbe, "forbidden.txt")]);
    await step("sandbox-git-status", "/usr/bin/sandbox-exec", ["-f", profilePath, nativeGit, "--no-optional-locks", "status", "--porcelain"], { cwd: worktree, env });
    const reviewSchema = await readJSON(join(root, "automation/schemas/review.schema.json")) as Schema;
    const implementationPrompt = await readFile(join(root, "automation/prompts/implement.md"), "utf8");
    const reviewPrompt = await readFile(join(root, "automation/prompts/review.md"), "utf8");
    let blockers: Review["reviewers"][number]["findings"] = [];
    let seedVerified = false;
    for (let round = 1; round <= config.maxReviewRounds; round++) {
      const input = `${implementationPrompt}\nUse shell tools with login=false (login shells are disabled). For Git commands use the installed native executable ${JSON.stringify(nativeGit)}, not /usr/bin/git or xcrun. Temporary and cache directories are already configured inside this worktree. Do not change them or request access outside it. The coordinator runs validation.\nCONTROLLED FIXTURE (not a backlog feature):\n${JSON.stringify(task)}\nBLOCKING FINDINGS FROM CLAUDE:\n${JSON.stringify(blockers)}\n`;
      await record({ handoff: round === 1 ? "human-task-to-codex" : "claude-blockers-to-codex", round, blockers });
      const spec = integrationCodexCommand(worktree, input, env);
      report.modelsInvoked = real;
      const implementation = await step(`r${round}-codex`, spec.command, spec.args, { cwd: worktree, input, env: { ...process.env, ...env }, monitor: true });
      const notices = validateIntegrationCodex(implementation.stdout, implementation.exitCode);
      for (const notice of notices) await record({ label: `r${round}-codex`, diagnostic: "informational-skills-budget-notice", event: notice });
      assertScope(base, await sourceSnapshot(worktree));
      await writeFile(join(directory, `r${round}-implemented.tsx`), await readFile(join(worktree, COMPONENT), "utf8"));
      if (round === 1) {
        const before = await readFile(join(worktree, COMPONENT), "utf8"), after = injectDefect(before);
        await writeFile(join(worktree, COMPONENT), after);
        await record({ handoff: "harness-injects-declared-accessibility-defect", round, path: COMPONENT, beforeSha256: digest(before), afterSha256: digest(after), criterion: task.acceptanceCriteria[1] });
      }
      // Execute fixed binaries from the approved controller dependency tree.
      // Never run task-edited npm scripts or lifecycle hooks.
      await check(`r${round}-lint`, [join(root, "node_modules/eslint/bin/eslint.js"), ".", "--max-warnings=0"]);
      await check(`r${round}-route-types`, [join(root, "node_modules/next/dist/bin/next"), "typegen"]);
      await check(`r${round}-typecheck`, [join(root, "node_modules/typescript/bin/tsc"), "--noEmit"]);
      await check(`r${round}-build`, [join(root, "node_modules/next/dist/bin/next"), "build", "--webpack"]);
      await check(`r${round}-component-test`, ["--test", TEST]);
      await check(`r${round}-base-oracle`, [join(root, "automation/integration-fixtures/render.mjs"), worktree, "base"]);
      assertScope(base, await sourceSnapshot(worktree));
      const beforeReview = await sourceSnapshot(worktree);
      const source = await readFile(join(worktree, COMPONENT), "utf8"), test = await readFile(join(worktree, TEST), "utf8");
      const checkEvidence = events.filter(e => String(e.label).startsWith(`r${round}-`) && e.phase === "end");
      const inputReview = `${reviewPrompt}\nCONTROLLED INTEGRATION DATA:\n${JSON.stringify({ task, selected: SELECTED, round, files: [COMPONENT, TEST], source, test, checks: checkEvidence, note: "The harness deliberately seeded aria-hidden=true after the first implementation. This is a real requirement defect to review with evidence, not a simulated verdict. Run no commands. On later rounds assess the repaired code; never assume it was fixed." })}\n`;
      await record({ handoff: "validated-code-to-claude-specialists", round, selected: SELECTED });
      const reviewerSpec = claudeCommand(worktree, inputReview, Object.fromEntries(SELECTED.map(name => [name, agents[name]])), reviewSchema);
      const response = await step(`r${round}-claude`, reviewerSpec.command, reviewerSpec.args, { cwd: worktree, input: inputReview, monitor: true });
      assertScope(beforeReview, await sourceSnapshot(worktree), true);
      const review = validateReview(parseClaude(response.stdout, SELECTED), reviewSchema, SELECTED, task.acceptanceCriteria);
      const delegated = delegationEvidence(response.stdout);
      await writeFile(join(directory, `r${round}-review.json`), JSON.stringify({ review, delegated }, null, 2));
      const evidence = { round, review, delegated, implementationSha256: digest(source), reviewInputSha256: digest(inputReview), reviewOutputSha256: digest(response.stdout) };
      rounds.push(evidence);
      blockers = review.reviewers.flatMap(r => r.findings).filter(f => f.blocking);
      if (round === 1) {
        seedVerified = blockers.some(f => f.criterion === task.acceptanceCriteria[1] && f.evidence.includes("aria-hidden") && f.evidence.includes("IntegrationNotice"));
        requireThat(review.status === "fail" && seedVerified, "Claude did not confirm the seeded blocking defect; collaboration test is incomplete");
      }
      await record({ handoff: "claude-review-to-controller", round, status: review.status, blockers, delegated });
      if (review.status === "pass") {
        requireThat(round >= 2 && seedVerified, "No verified feedback-to-Codex cycle occurred");
        await check(`r${round}-final-accessibility-oracle`, [join(root, "automation/integration-fixtures/render.mjs"), worktree, "final"]);
        report.status = real ? "collaboration-verified-awaiting-human-approval" : "mock-workflow-verified-not-a-live-result"; return;
      }
    }
    throw new Error("Blocking defects remain after the maximum review rounds");
  } catch (error) {
    report.status = "stopped-not-approved"; report.error = error instanceof Error ? error.message : String(error); process.exitCode = 1;
  } finally {
    report.elapsedMs = Date.now() - started;
    await writeFile(join(directory, "final.json"), JSON.stringify(report, null, 2));
    const handoffs = events.filter(e => e.handoff).map(e => `- Round ${e.round}: ${e.handoff}`).join("\n");
    const exits = events.filter(e => e.phase === "end").map(e => `- ${e.label}: exit ${e.exitCode}${e.reason ? ` (${e.reason})` : ""}`).join("\n");
    const experimentNote = mode === "--preflight" ? "Preflight only: no defect was injected, no worktree was created and no collaboration was tested." : "The fixture includes a deliberate first-round defect injection; see the injection handoff for evidence that it occurred. A successful real run tests a controlled feedback path, not spontaneous defect discovery. Mock results are not live collaboration evidence.";
    await writeFile(join(directory, "final.md"), `# Controlled integration test\n\nStatus: ${report.status}\n\nModels invoked: ${report.modelsInvoked}\n\n${report.error ?? ""}\n\nWorktree: ${worktree ?? "not created"}\n\nHandoffs:\n\n${handoffs || "No model handoffs occurred."}\n\nCommand exit codes:\n\n${exits}\n\nRounds reviewed: ${rounds.length}. See rN-review.json for specialist tool-use IDs, invocation/completion line numbers and result hashes. See rN-codex.input.txt for the exact blocking fix brief delivered to Codex.\n\n${experimentNote}\n\nNo commit, push, merge, deployment or paid-service activation is performed by the harness. Human review remains required.\n`);
    await lock.close(); await unlink(lockPath);
    console.log(`${report.status}\nReport: ${join(directory, "final.md")}`);
  }
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  integrationMain(process.argv.slice(2)).catch(error => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });
}
