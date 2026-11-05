# Controlled Codex → Claude → Codex integration test

**Prepared, not executed. Owner approval is required before any real model run.**
This is a separate, fixed test harness in `integration.ts`; it does not enable the
general orchestrator. `integration-config.json` ships with `enabled: false`.

## From VS Code: safe preparation now

Open the repository, then **Terminal → New Terminal**. Use Node.js 24+.

```sh
npm run integration:plan
npm run integration:preflight
npm run test:automation
```

Plan mode validates the task schema and all four existing specialist definitions,
and prints the selected reviewers, stages and limits. It spawns no process and
writes no report. Preflight runs only CLI version and authentication-status
commands, validates definitions, and writes a local report. It never starts a
model, creates a task worktree, signs in, provisions a service or reads credential
files. Authentication responses are processed in memory and discarded; only
exit codes and success/failure are recorded. It verifies local login status, not
that a provider will accept the next model request.

Run preflight in your normal VS Code terminal. An agent sandbox can prevent
Claude from accessing the macOS keychain and incorrectly make it appear logged
out. Stop if preflight fails; do not bypass permissions. If login is actually
missing, arrange it yourself through the installed CLI, then rerun preflight.
Never paste tokens into this harness or chat.

The automated harness tests use mock model streams. Their report status is
`mock-workflow-verified-not-a-live-result`, and `modelsInvoked` is false.
They do not prove that either real agent participated.

## Prerequisites for a later approved live test

- Explicit owner approval for this exact fixture and its deliberate defect injection.
- macOS with `/usr/bin/sandbox-exec` available. Other platforms fail closed.
- Codex CLI 0.145.0 and Claude Code 2.1.304, matching `automation/config.json`.
  Inspect updated flags before changing pinned versions.
- Both CLI authentication-status checks pass. Existing account usage may be
  consumed by a live test; no new paid service or API account is activated.
- A reviewed initial commit containing the app scaffold, coordinator, this
  harness, fixture helpers and all four `.claude/agents/` files. The working tree
  must be clean, including untracked files. The harness never commits or stashes.
- Existing local dependencies installed from the reviewed lockfile (`npm ci`).
  The harness performs no automatic dependency installation.
- Both fixture target paths must be absent from the baseline.

Once the owner explicitly approves, set **only** `enabled` to `true` in
`automation/integration-config.json` and include that reviewed setting in the
clean committed baseline. Leave `automation/config.json`'s `liveEnabled` false.
Then, in the VS Code terminal:

```sh
npm run integration:preflight
npm run integration:run
```

Do not run the second command until approved. With the shipped setting it refuses
before invoking models. The command is limited to the checked-in fixture; it
accepts no arbitrary task, shell command, extra directory or permission flag.

## The actual test task and why it needs a repair

Codex is asked to create only:

- `components/integration/IntegrationNotice.tsx`: a reusable `<p role="status">`
  that displays a supplied message, with normal React escaping.
- `tests/integration/notice.test.mjs`: a Node test of message rendering and role.

It is never mounted on a portfolio route. No design system or backlog feature
is implemented, and no dependencies may change.

After Codex's first implementation, the harness **deliberately adds
`aria-hidden="true"`** to the paragraph. The injection and both source hashes
are recorded. Basic rendering, lint, types, build and the component test should
still pass. The accessibility requirement must fail review.

This is a declared fault-injection experiment, not a claim that Codex introduced
a defect. The basic test intentionally covers text/role only; the immutable
controller-owned final oracle additionally rejects hidden output. It runs only
after a claimed review pass, to ensure the repair was real.

Claude must invoke **ux-reviewer and code-qa-reviewer** using foreground `Agent`
calls. All four specialist definitions are validated, but Art and Conversation
are not invoked because the fixture has no visual style or dialogue work.
Claude must return a real structured blocking finding tied to the accessibility
criterion, naming `IntegrationNotice` and `aria-hidden` in its evidence. A first
round pass is treated as a failed integration experiment, never as approval.

The exact blocking findings are then included in Codex's next stdin prompt.
After repair, actual checks run again, Claude delegates another real review,
and the final accessibility oracle verifies the rendered markup. A successful
experiment requires at least two Codex calls and two completed Claude reviews.
There are at most **three review rounds total**, including the first review.

## How to verify actual collaboration

Open the printed `automation/reports/integration-<id>/final.md`, then inspect:

| Evidence | What to verify |
| --- | --- |
| `final.json` | `runner: "real"`, `modelsInvoked: true`, status `collaboration-verified-awaiting-human-approval` |
| `handoffs.jsonl` | Ordered starts/ends, round numbers, exit codes, and `claude-blockers-to-codex` handoff |
| `r1-codex.stdout.log` | Real Codex JSONL completion, not fixture events |
| `r1-implemented.tsx` | Codex output before the injected defect |
| Injection handoff | Before/after hashes, affected file and criterion |
| `r1-claude.stdout.log` | `Agent` tool-use events with selected `subagent_type` values, followed by matching successful tool results |
| `r1-review.json` | Actual fail verdict, blocking evidence, tool-use IDs, invocation/completion line numbers and result hashes |
| `r2-codex.input.txt` | Exact blocking findings from round one delivered back to Codex |
| `r2-implemented.tsx` | Repaired component; compare with the seeded markup from the first Claude input |
| `r2-review.json` | Fresh completed specialist invocations and validated pass verdict |
| `rN-*.stdout.log` and handoff end events | Actual lint, route type generation, typecheck, build, component test and oracle results, with exit code 0 |

If a third round is needed, inspect the corresponding `r3-*` files too. Reports
are ignored by Git. Review model output for private information before sharing.
No report is automatically committed or published.

Text saying “the specialists reviewed this” is insufficient. The parser requires
matching foreground tool-use/result evidence for every selected specialist, one
successful structured final result, complete acceptance coverage, consistent
statuses and nonempty finding evidence/fixes. Missing, invalid, unverified,
incomplete, denied or failed reviews stop the run.

## Execution boundaries

The harness creates a dedicated branch/worktree from the clean `HEAD` and keeps
it for inspection on success or failure. It shares existing dependencies through
a read-only-in-validation symlink, rather than installing packages. Source
snapshots include ignored files such as `.env.local` and reject unexpected source
symlinks; only the two fixture targets may change. Known dependency/build/cache
directories are excluded, and this is not a general hostile-code scanner.

Codex uses `workspace-write` only in the task worktree, with no extra writable
roots, no command network access and no approval escalation. The harness preserves
existing policy rules. It does not use sandbox-bypass flags. Claude is restricted
to read tools and `Agent`; specialists have only Read/Grep/Glob, with hooks and MCP
disabled and no permission prompts. Source fingerprints are compared around each
review.

Validation uses fixed controller-owned binaries and the fixed oracle, never npm
scripts or lifecycle hooks selected from model-edited files. All validation
children run under a macOS profile denying network access, writes outside the
worktree, writes to Git metadata, and reads of common CLI/SSH/AWS credential
directories. Their environment omits inherited API keys and other secrets. This
also applies when validation loads generated test/component code.
A harmless sandbox self-test runs before either model: it must allow a temporary
worktree write and deny writes outside it, a protected-metadata surrogate write,
and a localhost socket connection. A failed probe stops the experiment.

The live boundary must still be verified in a real approved trial. In particular,
CLI output formats, OS sandbox support and provider access have not been exercised
by plan mode or mocked tests. Sandbox/permission failures stop rather than loosen
permissions. This harness is designed for this small trusted fixture, not arbitrary
hostile applications or an OS/container security audit.

Each child is limited to 10 minutes and 10 MiB output; auth-status checks to 15
seconds. A 45-minute whole-run deadline limits remaining time for each subsequent
child. Process groups are terminated on cancellation, timeout, errors and normal
exit. Independently escaped process sessions are outside that group mechanism;
do not interpret it as a container-wide process guarantee.

Explicit streamed authentication, usage-limit and permission errors stop the
current model process. Nonzero exit codes and invalid streams stop before another
handoff; nothing is automatically retried after these failures. Ctrl+C stops the
active group. A shared report lock prevents concurrent coordinators in this
checkout. After a forced kill, inspect processes before manually removing a stale
lock. The harness never commits, pushes, merges, deploys, creates secrets or
activates paid services.

## Local harness verification

```sh
npm run test:automation
npm run lint
npm run typecheck
npm run build
```

These are preparation checks, not a real model collaboration run. The existing
general orchestrator remains a separate prototype with its previously documented
limitations; this harness does not silently enable or repair its live path.
