# Portfolio Quest local coordinator

This tool handles **one task per command**. It prepares a Codex implementation,
checks it, asks Claude Code to delegate specialist reviews, and sends only blocking
fixes back to Codex. There are at most **three review rounds total**: the initial
review plus up to two repair reviews. It always ends with a report for a person.

For the separately gated, fixed Codex → Claude → Codex experiment, read
[Controlled integration test](INTEGRATION_TEST.md). Start safely with
`npm run integration:plan` or `npm run integration:preflight`; neither invokes
models. The integration harness is prepared only and requires separate approval
before execution.

**This first version is approved for dry runs only.** `liveEnabled` is `false` in
`config.json`. No live model invocation has been tested. Do not enable it or use
`--execute` until the owner explicitly approves a live trial.

## Run from VS Code

1. Open the `portfolio-quest` folder in VS Code.
2. Select **Terminal → New Terminal**. Use Node.js **24 or newer** (`node --version`).
   The website itself still supports the Node version documented in the root README.
3. Run the simulated workflow:

   ```sh
   npm run orchestrate:dry
   ```

4. Follow the printed path to `automation/reports/<run-id>/final.md`. In VS Code,
   Ctrl-click (Windows/Linux) or Cmd-click (Mac) the path to open it.

The default scenario simulates a blocking review followed by a successful repair.
It writes **reports only**. It does not create a worktree, edit application files,
run checks, invoke either model CLI, inspect authentication, or spend model usage.
The simulated checks in that report are not evidence that the website passes.

Other safe scenarios:

```sh
npm run orchestrate:dry -- --scenario pass
npm run orchestrate:dry -- --scenario exhausted
npm run orchestrate:dry -- --scenario invalid
npm run orchestrate:dry -- --scenario check-failure
npm run orchestrate:dry -- --scenario auth-failure
npm run orchestrate:dry -- --scenario timeout
npm run orchestrate:dry -- --scenario usage-limit
```

`exhausted` ends after three failed reviews. The other failure scenarios stop
immediately. Failure and exhausted commands deliberately return exit code 1.
Invalid command arguments or a disabled live run also return 1; successful dry
runs return 0.

## Describe a single task

Copy `fixtures/task.json` to your own task JSON file and replace the values:

```json
{
  "id": "task-2-shell",
  "category": "foundation",
  "description": "Implement only the owner-approved responsive site shell.",
  "acceptanceCriteria": [
    "Replace this with each exact, owner-approved acceptance criterion."
  ],
  "allowedPaths": ["app/", "components/", "lib/shared/"],
  "testScripts": ["test:automation"]
}
```

This example does **not** approve Task 2. Paths are literal repository-relative
file names or directories ending in `/`, without globs or `..`. Changes outside
them stop the run. Automation, agent instructions, permission settings, Git and
environment paths are protected. Task criteria must be unique and nonempty.

```sh
npm run orchestrate:dry -- --task path/to/task.json
```

Categories and starting reviewers:

| Category | Reviewers |
| --- | --- |
| `foundation` | UX, Code QA |
| `homepage` | Art, UX, Code QA |
| `game` | Art, UX, Code QA |
| `ai-companion` | All four |
| `cms` | UX, Code QA |
| `search` | UX, Conversation, Code QA |
| `other` | Code QA |

Changed paths add specialists for UI, art/styles/assets, guide dialogue, and search.
Code QA is always selected. This deliberately keeps the category's required
reviewers and adds relevant specialists; it does not silently drop them.

## How a future approved live trial works

After explicit owner approval, review this implementation and its limits first.
The owner must also arrange a reviewed initial commit and a clean working tree;
the coordinator never commits or stashes existing work. Ensure the four existing
`.claude/agents/*.md` definitions and this tool are included in that baseline.

Then enable `liveEnabled` in `automation/config.json` as part of that approved,
committed baseline, and run:

```sh
npm run orchestrate -- --execute --task path/to/approved-task.json
```

Live execution is opt-in twice: config plus `--execute`. With neither mode flag,
the command refuses to run. It does not infer owner approval from elapsed time,
review success, or an agent response.

The coordinator:

1. Checks local CLI versions/help against the inspected versions (Codex
   `0.145.0`, Claude Code `2.1.304`). Version drift stops for a person to inspect
   updated flags and update `config.json`.
2. Requires a clean Git repository with an existing `HEAD`. Creates a uniquely
   named `automation/<run-id>` branch and worktree under the OS temporary
   directory. Runs `npm ci --ignore-scripts` there; never copies credentials or
   environment files. The original checkout remains unchanged except reports.
3. Runs the installed `codex exec` in that worktree using `workspace-write`, no
   extra writable roots, restricted command network access and no approval
   escalation. User config/rules are excluded to avoid inheriting broader local
   permissions; CLI authentication remains the installed CLI's responsibility.
   No sandbox-bypass flags are used. Auth files are never read or copied by this
   tool. The model uses the CLI's existing authentication.
4. Runs `lint`, `typecheck`, `build`, configured checks, task test scripts, and
   every named `test`/`test:*` npm script present in the task worktree, sequentially.
   Missing scripts or any failure stop immediately. Use finite, non-watch tests.
5. Runs `claude -p` only after Codex and checks have exited. Restricted mode,
   plan permissions, no permission prompts, no hooks, no MCP and an explicit
   `Read,Grep,Glob,Agent` tool list keep reviews read-only. Existing specialist
   instruction bodies are loaded explicitly through `--agents`, with each
   restricted to `Read,Grep,Glob`. User/project customizations are disabled;
   managed organizational policy remains in effect. No authentication material
   is read by the coordinator. No separate `claude` process is spawned per agent.
6. Requires stream evidence that every selected specialist was invoked and its
   foreground call returned successfully, plus one successful structured final
   result. Schema and semantic validation reject missing reviewers, incomplete
   reviews, empty evidence, missing criteria, unknown criteria, unverified
   requirements, contradictory verdicts and failed tools/permission requests.
   Claude's claims alone are not proof of specialist invocation. Task-file
   fingerprints also detect changes during review.
7. Sends blocking findings only to Codex, then reruns checks and review. It stops
   at a pass, a process/review error, or three review rounds. Critical/high
   defects and failed acceptance criteria block; optional findings do not retry.
8. Writes JSON/Markdown reports, logs, review evidence, check results, changed
   files, worktree location and findings for human approval. It retains the
   worktree and branch for inspection, including on failure. It never cleans
   them up destructively, commits, pushes, merges, deploys, provisions services,
   or creates secrets.

Each child has a 15-minute maximum timeout and a 10 MiB output cap. Lower limits
can be set in config; higher values and review limits above three are rejected.
Ctrl+C stops the child process group and ends the run. A report lock prevents
two coordinator processes running in the same checkout. If the coordinator is
forcibly killed, inspect for surviving processes before manually removing
`automation/reports/.lock`; no automatic lock stealing occurs.

## Reports and limitations

Reports are ignored by Git. Review them for private information before intentionally
tracking or sharing any file; command/model output may contain sensitive content.
The tool does not print environment variables or fetch CLI credentials. It never
automatically approves, publishes, or tracks a report.

Dry runs exercise orchestration with deterministic fixtures. They cannot verify
CLI authentication, account usage limits, model behavior, real delegation event
formats, OS sandbox support or review quality. A future approved live trial must
verify those boundaries; unexpected output fails closed. Specialist calls are
foreground so completion can be checked from the stream, which is deliberately
more conservative than parallel background delegation.

Claude's tool restrictions are enforced by the installed CLI, not merely by a
prompt. This is not a separate OS container for Claude or for npm checks.
Only use trusted project code and reviewed npm scripts. Git worktrees isolate
application edits but still share repository metadata. Some tasks may require
native install scripts or network access; this tool stops rather than enabling
those permissions automatically. Do not relax permissions to get past a failure.

## Verify the coordinator

```sh
npm run test:automation
npm run lint
npm run typecheck
npm run build
```

The test suite uses deterministic model fixtures and tiny local Node child
processes to check exit codes, literal argument handling, timeouts and output
limits. It never runs autonomous Codex/Claude sessions.

CLI references: [Codex non-interactive mode](https://developers.openai.com/codex/noninteractive),
[Claude Code CLI](https://code.claude.com/docs/en/cli-reference),
[Claude Code subagents](https://code.claude.com/docs/en/sub-agents).
