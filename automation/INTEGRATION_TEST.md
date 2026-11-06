# Controlled Codex → Claude → Codex integration test

**The first live attempt stopped before Claude review. The repaired harness has
not been rerun live. Owner approval is required before another model run.**
This is a separate, fixed test harness in `integration.ts`; it does not enable the
general orchestrator. `integration-config.json` has a separate `enabled` gate;
the owner's current value is not changed by a harness repair.

## From VS Code: safe preparation now

Open the repository, then **Terminal → New Terminal**. Use Node.js 24+.

To understand an existing failure without another agent run, use the offline
audit first:

```sh
npm run integration:audit -- integration-1793944973800-cc4b3c3e
```

This reads the saved report and Claude stream only. It starts no child process,
performs no authentication, consumes no model usage, writes nothing, and never
grants approval. `specialistCallsVerified: 2` means both expected specialist
tool calls and matching completion results were found. `approvalGranted` is
always false; a rejected/incomplete review remains rejected. Replace only the
report-directory name when inspecting another saved attempt.

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
- Xcode/Command Line Tools must provide a native Git executable discoverable with
  `/usr/bin/xcrun --no-cache --find git`. The harness does not fall back to the
  `/usr/bin/git` launcher when the native executable is unavailable.

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
| `rN-evidence.json` | Exact packet sent to Claude: baseline commit, unchanged-file hashes, empty protected-file Git diff, full check output/exit codes, and harness artifact ownership |
| `r1-codex.stdout.log` | Real Codex JSONL completion, not fixture events |
| `r1-implemented.tsx` | Codex output before the injected defect |
| Injection handoff | Before/after hashes, affected file and criterion |
| `r1-claude.stdout.log` | `Agent` tool-use events with selected `subagent_type` values, followed by matching successful tool results |
| `r1-review.json` | Actual fail verdict, blocking evidence, tool-use IDs, invocation/completion line numbers and result hashes |
| `rN-review-received.json` | Received structured review and delegation evidence, saved even if strict acceptance validation subsequently rejects it |
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

## First live attempt: findings and repair

The attempt `reports/integration-1793944973800-cc4b3c3e/` completed a real Claude
review. The stream contains completed foreground `ux-reviewer` and
`code-qa-reviewer` calls. Both found the injected accessibility defect. The
strict gate then correctly rejected the review because Claude marked the
"routes and dependencies unchanged" criterion unverified: its input had only
exit codes, not actual check output or baseline/diff proof. A stopped report's
zero accepted review rounds did not mean that no specialist ran.

The corrected approach is an **evidence packet before review**, rather than
relaxing review validation or repeatedly rerunning agents with the same sparse
input. The controller verifies and includes SHA-256 before/after records for
protected source (including all app routes, package.json and package-lock.json),
the baseline commit, a real empty read-only Git diff, and complete stdout/stderr
and exit codes for each fixed check. It explicitly identifies controller-created
temp/probe/dependency artifacts and explains the deliberate fault injection and
delayed final oracle. Missing baseline route/dependency records, missing/failed
checks, protected-source changes, a nonempty diff or an oversized packet stop
before Claude. Every specialist receives the full packet. Reviewers still assess
the evidence honestly; there is no instruction to force a pass.

The received review and invocation evidence are now saved before semantic
acceptance validation, so rejected reviews remain easy to audit. Unknown or
unverified criteria still stop the run; this change cannot convert the existing
rejected review into approval. The real defect-fix-feedback cycle is not yet
proven. Use the free audit and local evidence tests before approving more model
usage. No past worktree/report is rewritten or resumed automatically.

The later attempt `reports/integration-1793940038646-5bcee603/` passed Codex,
lint, route generation, typecheck, build, component tests and the base oracle,
but stopped at `Forbidden change: next-env.d.ts` before Claude. Next.js generated
that ignored ambient-types file, and incremental TypeScript also generated
`tsconfig.tsbuildinfo`. The scope check had incorrectly attributed check output
to the agent. Those two exact root-level files may now change **only during the
fixed validation phase**. Their resulting hashes become the next round's baseline.
Codex and Claude still cannot create, edit or remove them; other ignored files
(including `.env.local`) remain protected. Checks may not change component/test
source. Generated-file diagnostics are recorded per round. The old attempts and
their worktrees are preserved; the live loop has not been restarted by the repair.

Evidence is preserved in `reports/integration-1793920540576-b247ade6/` and its
original `automation/integration-2461b7e3` worktree. Do not delete or overwrite
either to prepare a rerun. Codex created both fixture files, its component test
passed, its process exited 0, and a `turn.completed` event was present. There
were no Claude invocations, specialist calls, or completed review rounds.

The old shared validator treated every Codex `item.type: "error"` as fatal.
Codex CLI 0.145.0 emitted this informational notice in exactly that shape:

> Skill descriptions were shortened to fit the 2% skills context budget.

There is no severity or diagnostic-code field on that observed item. The controlled
harness now permits only the **entire exact observed message and item shape**,
recording it as an informational diagnostic. A successful process exit and
completed turn are still required. An unknown error item, a changed message,
explicit failed status, nonzero command/process exit, missing completion,
authentication/usage error or permission denial stops the run. The general
orchestrator's separate validator is unchanged by this scoped repair.

The Git failure was real even though Apple Git returned exit 0. The launcher
reported that `confstr()` could not resolve `DARWIN_USER_TEMP_DIR` and fell back
to `/tmp`, then failed to write `/tmp/xcrun_db-QZG0tlJn` and subsequent
`/tmp/xcrun_db-*` files. The sandbox intentionally excludes global `/tmp` and the
host's temporary directory. `TMPDIR` alone does not fix that launcher's confstr
fallback. Related Xcode developer-cache diagnostics and Codex's model-cache
`base_instructions` parse diagnostics remain in the original logs. This repair
does not delete caches, alter authentication or suppress those stderr logs.

For a fresh run, the controller discovers native Git **before** sandboxing with
`xcrun --no-cache --find git`, records its path/version, and invokes it directly.
On the diagnosed machine it is
`/Applications/Xcode.app/Contents/Developer/usr/bin/git`. Its directory is first
on the command PATH. Codex is instructed to use the recorded absolute executable.
The command environment and Codex's explicit `shell_environment_policy.set`
overrides set `TMPDIR`, `TMP`, `TEMP` to
`<worktree>/.integration-tmp/tmp` and `XDG_CACHE_HOME` to
`<worktree>/.integration-tmp/cache`. These directories are physically resolved
and created within the worktree. `allow_login_shell=false` prevents login-shell
startup from resetting these paths; tool calls must use `login=false`.

`GIT_OPTIONAL_LOCKS=0` avoids optional index refresh writes for read-only Git
commands. Normal Git trust checks and policy rules remain enabled; Git metadata
stays protected. No additional writable roots, global-temp access, unrestricted
sandbox mode, bypass flag, sudo or permission changes are introduced. A native
Git `status` probe now runs inside the validation sandbox before any agent call.

Stderr is saved verbatim rather than classified with broad keyword matching.
Structured errors and exit codes decide failures. Because the observed Git
launcher can report a permission failure with exit 0, a narrowly anchored parser
also recognizes its exact `git: error: couldn't create cache file '…'
(errno=Operation not permitted)` diagnostic, records/stops on it, and handles
the `Permission denied` errno variant. This is not a blanket rule about words
such as “permission” appearing in logs or documentation. Model command items
with nonzero exit codes now stop immediately too.

### Verify the repair without agents

```sh
npm run test:automation
node --test automation/integration-git.test.mjs
npm run lint
npm run typecheck
npm run build
```

The second command must run in a normal macOS terminal: a parent agent sandbox
can reject nested `sandbox-exec` setup with exit 71. Do not remove the inner
sandbox or loosen permissions to work around that restriction. It initializes
only a disposable, uncommitted scratch repository; it never starts models or
touches the failed worktree. It checks non-login PATH resolution, local temp/cache
variables, repeated native Git `status`/`diff` with empty stderr, unchanged Git
metadata, and denied outside/metadata writes and localhost network access.

Regression event fixtures in `integration-fixtures/observed-cli-events.json`
contain the warning and cache-denial shapes from the real first-run logs. Unit
tests cover those cases, retained stderr, process/command exit failures and the
full mocked feedback cycle. None of these are real Claude review evidence.

### Safe rerun after review and explicit approval

1. Review the harness repair and include it in a new local commit through your
   normal review process. The harness never commits automatically. Keep the
   repaired files out of the old failed worktree and do not cherry-pick its
   generated component into the main baseline. Both fixture paths must remain
   absent in the main checkout. Ensure `git status --short` is empty.
2. Keep the general orchestrator's `liveEnabled` false. Confirm the controlled
   integration's `enabled` setting reflects the owner's approval; the repair
   does not change that value or authorize another live run by itself.
3. In VS Code's normal terminal, from `/Users/workspace/portfolio-quest`, run
   `npm run integration:plan` and `npm run integration:preflight`. Stop if
   preflight fails; never paste credentials or bypass permissions.
4. **Only after approval**, run exactly:

   ```sh
   npm run integration:run
   ```

This creates a new uniquely named worktree/branch from the repaired clean HEAD.
It does not resume, overwrite or remove the failed run. The three-review-round
limit, read-only Claude restrictions, actual delegation evidence requirements,
final oracle, process limits and prohibitions on publishing remain unchanged.
The real Claude handoff still has not been validated. Account usage/charges may
apply to a live rerun. Press Ctrl+C to stop, and retain the new report on failure.

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
