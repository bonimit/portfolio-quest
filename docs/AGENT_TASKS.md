# Agent Tasks

Source: [Project Blueprint](PROJECT_BLUEPRINT.md), sections 11, 13 and 14. Instructions for each agent: [AGENTS.md](../AGENTS.md) (Codex), [CLAUDE.md](../CLAUDE.md) (Claude Code).

The roadmap uses **Phase 0–5** as defined in the blueprint ([section 11](PROJECT_BLUEPRINT.md#11-phased-build-plan-and-acceptance-criteria)). Work inside a phase is split into numbered tasks from the blueprint backlog ([section 14](PROJECT_BLUEPRINT.md#14-initial-backlog-first-ten-implementation-tasks)).

## Working rules
- One implementation owner per task. Codex implements on a branch/PR; Claude Code reviews and does not edit the same files at the same time.
- Do one task at a time and do not modify unrelated features.
- Ask the owner before major architectural changes, paid services, secrets, or deployment. None of these are allowed without approval.
- Every task report lists changed files, check results, and unresolved issues.
- Definition of done: see "Definition of done" in blueprint section 11. It applies to every task and phase.

## Phase status
| Phase | Name | Status |
|---|---|---|
| 0 | Project setup and decisions | In progress: documentation done, pending owner review; Task 1 is next |
| 1 | Editorial website + CMS | Not started |
| 2 | Vertical slice game | Not started |
| 3 | Guide without AI fees | Not started |
| 4 | Content/visual polish and launch readiness | Not started |
| 5 | Optional paid enhancements | Deferred |

## Current task: Phase 0, Task 1 — Scaffold Next.js app and layout
Owner: Codex. Reviewer: Claude Code. This is the **only** task approved to start. Do not begin Task 2 or anything else until the owner has reviewed and approved Task 1. Do not start until the owner has reviewed the documentation and made the initial commit.

Scope:
- Create a Next.js + TypeScript + Tailwind app at the repo root following the layout in blueprint section 7.
- Add `lint`, `typecheck` and `build` scripts; document how to run them in the README.
- Git-ignore `.env*` files (an `.env.example` is allowed if needed); commit no secrets.
- Add minimal placeholder pages for `/`, `/work`, `/concepts`, `/arcade`, `/about`, `/contact` with titles and descriptions, and a 404 for unknown routes.

Out of scope: design tokens, header/footer/shell, Sanity, Phaser, guide, real content, CI, deployment, paid services.

Acceptance criteria: see "Task 1 acceptance criteria" in the blueprint (section 11).

## Next tasks (not yet approved to start)
| Phase | Task | Notes |
|---|---|---|
| 0 | 2: Design tokens and responsive site shell | Criteria in blueprint section 11; starts only after Task 1 is approved |
| 1 | 3: Typed `PortfolioProject` model and mock dataset | Placeholder data only; see [Content Rules](CONTENT_RULES.md) |
| 1 | 4: Selected Work list, card and filters | |
| 1 | 5: Case study blocks and table of contents | |
| 1 | 6: Concept Lab listing and template | |
| 1 | 7: Prototype Arcade listing and template | |
| 1 | 8: Sanity schema, queries, adapters, draft controls | Must separate private from public fields; design TBD |
| 2 | 9: Client-only Phaser vertical slice | Small slice, one working avatar, includes DOM navigation alternative |
| 3 | 10: Guide UI with scripted answers and local search | Search library TBD; no paid AI |

Detailed acceptance criteria for tasks 3-10 are TBD and should be written before each task starts.

## Review checklist (Claude Code)
- Matches the blueprint and the approved decisions in section 0.
- Accessibility: keyboard, focus, headings, contrast, reduced motion.
- No private/NDA content, secrets or unlicensed assets.
- Editorial mode works without the game; mobile defaults to editorial.
- Checks were actually run and results reported.
