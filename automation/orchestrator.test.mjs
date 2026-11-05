import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, cp, readFile, writeFile, readdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { main, workflow, selectReviewers, validateReview, validateSchema, parseClaude, validateCodex, codexCommand, claudeCommand, runProcess } from "./orchestrator.ts";

const schema = JSON.parse(await readFile(new URL("./schemas/review.schema.json", import.meta.url)));
const selected = ["ux-reviewer", "code-qa-reviewer"];
const criterion = "Scoped requirement works";
function review(blocking = false) {
  return { status: blocking ? "fail" : "pass", summary: "Fixture", reviewers: selected.map(name => ({ name, complete: true, scope: "Fixture scope", status: blocking && name === "code-qa-reviewer" ? "fail" : "pass", findings: blocking && name === "code-qa-reviewer" ? [{ severity: "high", blocking: true, criterion, evidence: "app/page.tsx:1: fixture defect", suggestedFix: "Fix fixture", verification: "Run fixture test" }] : [], notReviewed: [] })), criteriaCoverage: [{ criterion, status: blocking ? "fail" : "pass", evidence: "Fixture evidence" }], openDecisions: [] };
}

test("routing includes required specialists and adapts to changed files", () => {
  for (const [category, expected] of Object.entries({ foundation: 2, homepage: 3, game: 3, "ai-companion": 4, cms: 2, search: 3, other: 1 })) {
    assert.equal(selectReviewers(category, []).length, expected);
    assert.ok(selectReviewers(category, []).includes("code-qa-reviewer"));
  }
  assert.equal(selectReviewers("other", ["components/companion/chat.tsx", "app/globals.css"]).length, 4);
  assert.throws(() => selectReviewers("invalid", []));
});

test("schema and semantic validation fail closed", () => {
  assert.equal(validateReview(review(), schema, selected, [criterion]).status, "pass");
  assert.equal(validateReview(review(true), schema, selected, [criterion]).status, "fail");
  for (const mutate of [
    r => { r.reviewers.pop(); }, r => { r.reviewers[0].complete = false; },
    r => { r.reviewers[0].name = r.reviewers[1].name; }, r => { r.summary = " "; },
    r => { r.criteriaCoverage = []; }, r => { r.criteriaCoverage[0].status = "unverified"; },
    r => { r.reviewers[0].findings = [{ severity: "high", blocking: false, criterion, evidence: "file:1", suggestedFix: "fix", verification: "test" }]; },
    r => { r.status = "fail"; }, r => { r.extra = true; }, r => { delete r.openDecisions; },
  ]) {
    const value = review(); mutate(value);
    assert.throws(() => validateReview(value, schema, selected, [criterion]));
  }
  assert.throws(() => validateReview(undefined, schema, selected, [criterion]));
  assert.throws(() => validateSchema({}, { unsupported: true }));
  assert.throws(() => validateReview({ ...review(), constructor: "unexpected" }, schema, selected, [criterion]));
});

test("three-round cap and repairs include blocking findings only", async () => {
  const events = [];
  const result = await workflow({ maxRounds: 3,
    implement: async (fixes, round) => events.push(["implement", round, fixes.length]),
    checks: async round => events.push(["checks", round]),
    review: async round => { events.push(["review", round]); return review(true); },
  });
  assert.deepEqual(result, { status: "blocking-defects-remain", rounds: 3 });
  assert.deepEqual(events.map(e => e[0]), ["implement", "checks", "review", "implement", "checks", "review", "implement", "checks", "review"]);
  assert.equal(events[3][2], 1);
  await assert.rejects(workflow({ maxRounds: 4 }));
});

test("optional findings do not trigger another implementation", async () => {
  const result = review();
  result.reviewers[0].findings.push({ severity: "low", blocking: false, criterion: "optional", evidence: "file:1", suggestedFix: "Consider naming", verification: "Read file" });
  let implementations = 0;
  const outcome = await workflow({ maxRounds: 3, implement: async () => { implementations++; }, checks: async () => {}, review: async () => validateReview(result, schema, selected, [criterion]) });
  assert.equal(outcome.rounds, 1); assert.equal(implementations, 1);
});

test("failed checks stop before review without retry", async () => {
  let reviews = 0, implementations = 0;
  await assert.rejects(workflow({ maxRounds: 3, implement: async () => { implementations++; }, checks: async () => { throw Error("exit 1"); }, review: async () => { reviews++; return review(); } }));
  assert.equal(reviews, 0); assert.equal(implementations, 1);
});

function stream() {
  return [
    ...selected.flatMap((name, i) => [
      { type: "assistant", message: { content: [{ type: "tool_use", name: "Agent", id: String(i), input: { subagent_type: name } }] } },
      { type: "user", message: { content: [{ type: "tool_result", tool_use_id: String(i), content: "Review complete" }] } },
    ]),
    { type: "result", subtype: "success", is_error: false, permission_denials: [], structured_output: review() },
  ];
}
const jsonl = items => items.map(item => JSON.stringify(item)).join("\n");
test("Claude requires completed specialist calls and a successful structured result", () => {
  assert.deepEqual(parseClaude(jsonl(stream()), selected), review());
  assert.throws(() => parseClaude(jsonl(stream().slice(2)), selected));
  assert.throws(() => parseClaude(jsonl(stream().slice(0, -1)), selected));
  const failed = stream(); failed[1].message.content[0].is_error = true;
  assert.throws(() => parseClaude(jsonl(failed), selected));
  const denied = stream(); denied.at(-1).permission_denials = ["Write"];
  assert.throws(() => parseClaude(jsonl(denied), selected));
  const background = stream(); background[0].message.content[0].input.run_in_background = true;
  assert.throws(() => parseClaude(jsonl(background), selected));
  assert.throws(() => parseClaude(jsonl([...stream(), { type: "rate_limit_event", rate_limit_info: { status: "rejected" } }]), selected));
  assert.throws(() => parseClaude("not JSON", selected));
});

test("Codex fails closed on errors or missing completion", () => {
  validateCodex(jsonl([{ type: "turn.completed" }]));
  assert.throws(() => validateCodex(jsonl([{ type: "turn.failed" }])));
  assert.throws(() => validateCodex(jsonl([{ type: "error", error: "auth failure" }, { type: "turn.completed" }])));
});

test("CLI plans keep sandbox and read-only tools without bypass flags", () => {
  const codex = codexCommand("/isolated-task", "scope");
  assert.equal(codex.args[codex.args.indexOf("--sandbox") + 1], "workspace-write");
  assert.ok(codex.args.includes('approval_policy="never"'));
  const claude = claudeCommand("/isolated-task", "scope", {}, schema);
  assert.ok(claude.args.includes("--restricted"));
  assert.equal(claude.args[claude.args.indexOf("--tools") + 1], "Read,Grep,Glob,Agent");
  assert.ok(![...codex.args, ...claude.args].some(s => /bypassPermissions|dangerously|danger-full-access|acceptEdits/.test(s)));
});

test("process runner handles exits, timeout, output limit, and literal arguments", async () => {
  const base = { command: process.execPath, cwd: process.cwd() };
  const literal = "$(echo should-not-run)";
  const result = await runProcess({ ...base, args: ["-e", "console.log(process.argv[1])", literal] });
  assert.equal(result.stdout.trim(), literal);
  await assert.rejects(runProcess({ ...base, args: ["-e", "process.exit(7)"] }), /exit 7/);
  await assert.rejects(runProcess({ ...base, args: ["-e", "setInterval(()=>{},1000)"], timeoutMs: 100 }), /timeout/);
  await assert.rejects(runProcess({ ...base, args: ["-e", "console.log('x'.repeat(10000))"], maxOutputBytes: 100 }), /output limit/);
  await assert.rejects(runProcess({ ...base, command: "portfolio-quest-nonexistent-binary", args: [] }));
});

test("dry-run integration never launches CLIs, checks, Git, or changes application code", async () => {
  const root = await mkdtemp(join(tmpdir(), "quest-dry-test-"));
  await cp(new URL("./", import.meta.url), join(root, "automation"), { recursive: true, filter: path => !path.includes("/reports") });
  await cp(new URL("../.claude", import.meta.url), join(root, ".claude"), { recursive: true });
  const sentinel = join(root, "app-sentinel.txt"); await writeFile(sentinel, "unchanged");
  const runner = async () => { throw Error("Dry run must not spawn a process"); };
  for (const scenario of ["pass", "repair", "exhausted", "invalid", "check-failure", "auth-failure", "timeout", "usage-limit"]) {
    await main(["--dry-run", "--scenario", scenario], runner, root);
    assert.equal(await readFile(sentinel, "utf8"), "unchanged");
    const dirs = (await readdir(join(root, "automation/reports"))).sort();
    const final = JSON.parse(await readFile(join(root, "automation/reports", dirs.at(-1), "final.json")));
    assert.equal(final.mode, "dry-run");
    assert.equal(final.status, ["pass", "repair"].includes(scenario) ? "ready-for-human-approval" : scenario === "exhausted" ? "blocking-defects-remain" : "stopped");
    assert.ok(final.rounds <= 3);
    process.exitCode = 0;
  }
  await assert.rejects(main(["--execute"], runner, root), /disabled/);
  await assert.rejects(main([], runner, root), /Choose exactly one/);
  const task = JSON.parse(await readFile(join(root, "automation/fixtures/task.json")));
  task.allowedPaths = ["../outside/"];
  await writeFile(join(root, "automation/fixtures/task.json"), JSON.stringify(task));
  await assert.rejects(main(["--dry-run"], runner, root), /relative/);
});
