import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, readFile, cp, readdir, symlink, realpath } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { integrationMain, validateLimits, executeBounded, fatalEvent, injectDefect, delegationEvidence, sourceSnapshot, assertScope, sandboxProfile } from "./integration.ts";
import { renderNotice, validateNotice } from "./integration-fixtures/render.mjs";

const root = new URL("../", import.meta.url);
const componentPath = "components/integration/IntegrationNotice.tsx";
const source = 'export function IntegrationNotice({ message }: { message: string }) { return <p role="status">{message}</p>; }';
const limits = { enabled: false, maxReviewRounds: 3, childTimeoutMs: 600000, totalTimeoutMs: 2700000, maxOutputBytes: 10485760 };

test("integration caps, disabled live gate and plan do not invoke a CLI", async () => {
  validateLimits(limits);
  for (const key of ["maxReviewRounds", "childTimeoutMs", "totalTimeoutMs", "maxOutputBytes"]) {
    assert.throws(() => validateLimits({ ...limits, [key]: limits[key] + 1 }));
    assert.throws(() => validateLimits({ ...limits, [key]: 0 }));
  }
  const noProcesses = async () => { throw Error("No child processes allowed"); };
  const isolatedRoot = await mkdtemp(join(tmpdir(), "integration-disabled-gate-"));
  await cp(new URL("automation", root), join(isolatedRoot, "automation"), { recursive: true, filter: path => !path.includes("/reports") });
  await cp(new URL(".claude", root), join(isolatedRoot, ".claude"), { recursive: true });
  await writeFile(join(isolatedRoot, "automation/integration-config.json"), JSON.stringify(limits));
  await integrationMain(["--plan"], noProcesses, isolatedRoot);
  await assert.rejects(integrationMain(["--execute"], noProcesses, isolatedRoot), /disabled/);
});

test("ignored source changes and read-only review changes are rejected", async () => {
  const directory = await mkdtemp(join(tmpdir(), "integration-scope-"));
  await writeFile(join(directory, ".gitignore"), ".env*\n");
  const before = await sourceSnapshot(directory);
  await writeFile(join(directory, ".env.local"), "TEST_ONLY=true");
  const after = await sourceSnapshot(directory);
  assert.throws(() => assertScope(before, after), /env.local/);
  assert.throws(() => assertScope({}, { [componentPath]: "hash" }, true), /review/);
  assert.doesNotThrow(() => assertScope({}, { [componentPath]: "hash" }));
  await symlink("/tmp", join(directory, "outside"));
  await assert.rejects(sourceSnapshot(directory), /symlink/);
});

test("declared defect affects actual React markup and final oracle rejects it", async () => {
  const directory = await mkdtemp(join(tmpdir(), "integration-render-"));
  await mkdir(join(directory, "components/integration"), { recursive: true });
  await writeFile(join(directory, "package.json"), "{}");
  await symlink(new URL("node_modules", root).pathname, join(directory, "node_modules"), "dir");
  await writeFile(join(directory, componentPath), source);
  assert.ok((await renderNotice(directory, "<hello>")).includes("&lt;hello&gt;"));
  await validateNotice(directory, true);
  await writeFile(join(directory, componentPath), injectDefect(source));
  await validateNotice(directory, false);
  await assert.rejects(validateNotice(directory, true), /aria-hidden/);
  assert.throws(() => injectDefect("<div>unexpected shape</div>"));
});

test("stream monitoring recognizes permission/auth/usage errors", () => {
  for (const event of [
    { type: "error" }, { type: "turn.failed" },
    { type: "rate_limit_event", rate_limit_info: { status: "rejected" } },
    { type: "result", subtype: "error_max_turns", is_error: true },
    { type: "result", subtype: "success", permission_denials: ["Write"] },
    { type: "user", message: { content: [{ type: "tool_result", is_error: true }] } },
  ]) assert.equal(fatalEvent(event), true);
  assert.equal(fatalEvent({ type: "turn.completed" }), false);
});

const jsonl = events => events.map(e => JSON.stringify(e)).join("\n") + "\n";
function stream(review) {
  return jsonl([
    ...["ux-reviewer", "code-qa-reviewer"].flatMap((name, i) => [
      { type: "assistant", message: { content: [{ type: "tool_use", name: "Agent", id: `agent-${i}`, input: { subagent_type: name, run_in_background: false } }] } },
      { type: "user", message: { content: [{ type: "tool_result", tool_use_id: `agent-${i}`, content: "Fixture review completed" }] } },
    ]),
    { type: "result", subtype: "success", is_error: false, permission_denials: [], structured_output: review },
  ]);
}
test("delegation evidence requires real-shaped invocation and completion pairs", () => {
  const evidence = delegationEvidence(stream({}));
  assert.equal(evidence.length, 2);
  assert.equal(evidence[0].invocationLine, 1);
  assert.equal(evidence[0].completionLine, 2);
  assert.equal(evidence[0].resultSha256.length, 64);
  assert.throws(() => delegationEvidence(jsonl([{ type: "result", structured_output: {} }])), /Missing/);
});

test("bounded runner stops on streamed errors and captures actual exit codes", async () => {
  const base = { command: process.execPath, cwd: process.cwd(), timeoutMs: 1000, maxOutputBytes: 10000 };
  const success = await executeBounded({ ...base, args: ["-e", "console.log('done')"] });
  assert.equal(success.exitCode, 0);
  const failed = await executeBounded({ ...base, args: ["-e", "process.exit(7)"] });
  assert.equal(failed.exitCode, 7);
  const limit = await executeBounded({ ...base, args: ["-e", "setInterval(()=>{},1000)"], timeoutMs: 100 });
  assert.equal(limit.reason, "timeout");
  const fatal = await executeBounded({ ...base, monitor: true, args: ["-e", `console.log(${JSON.stringify(JSON.stringify({ type: "error", error: "usage limit" }))});setInterval(()=>{},1000)`] });
  assert.equal(fatal.reason, "fatal CLI event");
});

test("validation sandbox denies network and shared Git writes", () => {
  const profile = sandboxProfile("/task", ["/repo/.git"], "/home/test");
  assert.ok(profile.includes("(deny network*)"));
  assert.ok(profile.includes('(deny file-write* (subpath "/repo/.git"))'));
  assert.ok(profile.includes('(deny file-read* (subpath "/home/test/.codex"))'));
});

test("sandbox writable paths use macOS physical directory names", async () => {
  const directory = await mkdtemp(join(tmpdir(), "integration-physical-"));
  const profile = sandboxProfile(directory, []);
  assert.ok(profile.includes(`(subpath ${JSON.stringify(await realpath(directory))})`));
});

test("complete mocked handoff records first review defect, Codex repair and final review", { skip: process.platform !== "darwin" }, async () => {
  const directory = await mkdtemp(join(tmpdir(), "integration-mock-"));
  await cp(new URL("automation", root), join(directory, "automation"), { recursive: true, filter: path => !path.includes("/reports") });
  await cp(new URL(".claude", root), join(directory, ".claude"), { recursive: true });
  await mkdir(join(directory, "node_modules"));
  await writeFile(join(directory, "automation/integration-config.json"), JSON.stringify({ ...limits, enabled: true }));
  let taskRoot, implementations = 0, reviews = 0, active = false;
  const task = JSON.parse(await readFile(join(directory, "automation/integration-fixtures/task.json")));
  const fake = async spec => {
    assert.equal(active, false, "CLI overlap"); active = true;
    let stdout = "";
    if (spec.command === "codex" && spec.args.includes("--version")) stdout = "codex-cli 0.145.0";
    else if (spec.command === "claude" && spec.args.includes("--version")) stdout = "2.1.304 (Claude Code)";
    else if (spec.args[0] === "login") stdout = "Logged in using ChatGPT";
    else if (spec.args[0] === "auth") stdout = JSON.stringify({ loggedIn: true, secretTestField: "MUST_NOT_BE_RECORDED" });
    else if (spec.command === "git" && spec.args.includes("add")) {
      taskRoot = spec.args.at(-2);
      await mkdir(taskRoot);
      await cp(join(directory, "automation"), join(taskRoot, "automation"), { recursive: true, filter: path => !path.includes("/reports") });
    } else if (spec.command === "git" && spec.args.includes("--git-common-dir")) stdout = "/mock/git";
    else if (spec.command === "git" && spec.args.includes("--absolute-git-dir")) stdout = "/mock/git/worktrees/task";
    else if (spec.command === "codex") {
      implementations++;
      if (implementations > 1) assert.ok(spec.input.includes("aria-hidden"));
      await mkdir(join(taskRoot, "components/integration"), { recursive: true });
      await mkdir(join(taskRoot, "tests/integration"), { recursive: true });
      await writeFile(join(taskRoot, componentPath), source);
      await writeFile(join(taskRoot, "tests/integration/notice.test.mjs"), "// mock only\n");
      stdout = jsonl([{ type: "turn.completed" }]);
    } else if (spec.command === "claude") {
      reviews++;
      const finding = { severity: "high", blocking: true, criterion: task.acceptanceCriteria[1], evidence: "components/integration/IntegrationNotice.tsx:1 aria-hidden=true", suggestedFix: "Remove aria-hidden", verification: "Run final oracle" };
      const fail = reviews === 1;
      stdout = stream({ status: fail ? "fail" : "pass", summary: "MOCK review", reviewers: ["ux-reviewer", "code-qa-reviewer"].map(name => ({ name, status: fail && name === "code-qa-reviewer" ? "fail" : "pass", complete: true, scope: "Fixture", findings: fail && name === "code-qa-reviewer" ? [finding] : [], notReviewed: [] })), criteriaCoverage: task.acceptanceCriteria.map((criterion, i) => ({ criterion, status: fail && i === 1 ? "fail" : "pass", evidence: "Fixture code" })), openDecisions: [] });
    }
    active = false;
    return { stdout, stderr: "", exitCode: 0, signal: null, reason: null };
  };
  await integrationMain(["--execute"], fake, directory);
  assert.equal(implementations, 2); assert.equal(reviews, 2);
  const reports = await readdir(join(directory, "automation/reports"));
  const reportDir = join(directory, "automation/reports", reports[0]);
  const report = JSON.parse(await readFile(join(reportDir, "final.json")));
  assert.equal(report.status, "mock-workflow-verified-not-a-live-result");
  assert.equal(report.modelsInvoked, false);
  assert.equal(report.rounds.length, 2);
  assert.ok(report.events.some(e => e.handoff === "claude-blockers-to-codex"));
  assert.ok(!JSON.stringify(report).includes("MUST_NOT_BE_RECORDED"));
});
