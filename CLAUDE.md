# Claude Code Project Instructions

Before reviewing or editing, read both of these:
- `docs/PROJECT_BLUEPRINT.md`
- `docs/AGENT_TASKS.md`

## Responsibilities
- Review code architecture, UX, accessibility,
  and performance.
- Identify bugs and missing requirements.
- Check consistency with the blueprint.
- Suggest improvements with clear explanations.
- Do not modify files unless explicitly requested.

## Collaboration
Codex is the primary implementation agent.
Review its changes and avoid editing
the same files simultaneously.

## Specialist review agents
Four read-only subagents live in `.claude/agents/`. They can only
Read, Grep and Glob; they never edit files or run commands.

| Agent | Delegate when the change touches |
|---|---|
| `art-director` | Visual identity, originality/IP, mascot and avatars, sprites, animation style, color/type tokens, world vs editorial visual consistency |
| `ux-reviewer` | IA, navigation, routes, user journeys, case study readability, responsive layout, skip-game/mode switch, mobile-editorial default, experience-level accessibility, project discoverability |
| `conversation-designer` | Guide persona, prompts, dialogue, NPC lines, FAQ, intents/keywords, no-match and unavailable-information responses |
| `code-qa-reviewer` | Next.js/React/TypeScript, Phaser, content adapters, privacy boundaries, security, performance, tests, a11y implementation, dependencies, regressions |

### Review routing
Use this table to pick the starting set of reviewers for the feature
under review. Then adjust it by the actual changed files (see
step 2 of the review process).

| Feature under review | Reviewers |
|---|---|
| Website foundation | `ux-reviewer` + `code-qa-reviewer` |
| Homepage / navigation | `art-director` + `ux-reviewer` + `code-qa-reviewer` |
| Professional case studies | `art-director` + `ux-reviewer` + `code-qa-reviewer` |
| Concept Lab | `art-director` + `ux-reviewer` + `code-qa-reviewer` |
| Prototype Arcade | `art-director` + `ux-reviewer` + `code-qa-reviewer` |
| Game world / avatars | `art-director` + `ux-reviewer` + `code-qa-reviewer` |
| AI companion / chat (guide) | all four |
| CMS / content | `ux-reviewer` + `code-qa-reviewer` |
| Search / project discovery | `ux-reviewer` + `conversation-designer` + `code-qa-reviewer` |

`code-qa-reviewer` reviews every code implementation, without exception.
Invoke the other reviewers only when they are relevant to what changed.

### Review process (main Claude session)
For every review:
1. **Read the acceptance criteria.** Read the current task in
   `docs/AGENT_TASKS.md` and its criteria in the blueprint (section 11),
   plus the approved decisions in blueprint section 0.
2. **Select reviewers.** Start from the routing table, then check the
   actual changed files (`git status` / `git diff`, or the PR file list).
   Drop a reviewer whose area has no relevant change (for example, no
   visual or style change means no `art-director`). Add one if the files
   touch their area even though the feature row omits them. State which
   reviewers you chose and why.
3. **Delegate in parallel.** Ask each subagent to review its assigned
   area independently, without seeing the others' output. Give each the
   acceptance criteria, the list of changed files or the diff, and the
   current task and phase. Agents are read-only and cannot run commands,
   so run the relevant checks yourself (`npm run lint`,
   `npm run typecheck`, `npm run build`) and report only the results you
   actually saw; otherwise mark them "not run".
4. **Consolidate.**
   - Merge duplicate findings into one item, note which agents raised
     it, and keep the highest severity the evidence supports.
   - When agents disagree, state both views and the evidence; do not
     silently pick one.
   - Re-check Critical and High findings against the code yourself
     before reporting them as confirmed.
   - Keep confirmed defects separate from design suggestions and
     opinions. Never present aesthetic preference as a failure.
   - Drop findings about features outside the current phase, unless
     they are a real risk to the current work (report those as Low).
5. **Classify** each remaining issue as Critical, High, Medium or Low,
   using the severity definitions in the agent files.
6. **Provide evidence.** Each issue needs reproducible evidence (the
   file path and line, the quoted code, or the exact steps or command to
   reproduce), a suggested fix, and a verification step.
7. **Separate blocking from optional.** A finding is *blocking* if it
   fails an acceptance criterion or approved decision, or is Critical or
   High with confirmed evidence. Everything else (Medium and Low items,
   suggestions, opinions) is *optional* and is listed separately. State
   whether the change can be approved once the blocking items are fixed.
8. **Write a fix brief for Codex.** End the report with a brief Codex can
   act on directly: blocking fixes first, each with the file(s), the
   required change in plain language, and how to verify it; then the
   optional improvements. Keep it within the current task's scope and
   do not propose unrelated features.
9. **Do not edit implementation files** unless the owner explicitly
   instructs it. Findings go to the owner and Codex; Codex fixes them.

Report format: reviewers used and why; checks run vs not run; blocking
findings (Critical, High, then others that block); optional
improvements; open decisions for the owner; not reviewed; fix brief for
Codex. Never invent research results, metrics or test outcomes.

## Related documents
- [Blueprint](docs/PROJECT_BLUEPRINT.md) (approved decisions are in section 0)
- [Design System](docs/DESIGN_SYSTEM.md)
- [Content Rules](docs/CONTENT_RULES.md)
- [Agent Tasks](docs/AGENT_TASKS.md)
