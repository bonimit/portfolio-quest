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
| 0 | Project setup and decisions | Scaffold/editorial page preserved at /portfolio; entrance milestone implemented; evidence below; owner/browser review pending |
| 1 | Editorial website + CMS | Not started |
| 2 | Vertical slice game | Not started |
| 3 | Guide without AI fees | Not started |
| 4 | Content/visual polish and launch readiness | Not started |
| 5 | Optional paid enhancements | Deferred |

## Current authorized milestone: New entrance with protected Portfolio homepage

Priority: preserve the latest approved orange homepage. Move it to `/portfolio`
without redesigning its render function, CSS, motion components, fonts, quilt,
footer or reduced-motion behavior. Build the new `/` path-selection entrance
with Portfolio → `/portfolio`, Adventure → non-playable `/world`, native direct
links, a local scripted guide, and responsive/accessible interaction.

A recoverable snapshot must precede edits. Compare protected sources and the
production `/portfolio` HTML/CSS against the pre-move `/` baseline. Existing
section routes remain unchanged. No paid APIs/SDKs, real AI, full RPG, automation
edits, commit, merge or deployment are authorized. See DESIGN_SYSTEM.md section 12.

## Previous task: Phase 0, Task 1 — Scaffold Next.js app and layout
Owner: Codex. Reviewer: Claude Code. This scaffold is present in the repository.
Its original starting restrictions are superseded by the owner’s explicit shell/homepage milestone authorization above.

Scope:
- Create a Next.js + TypeScript + Tailwind app at the repo root following the layout in blueprint section 7.
- Add `lint`, `typecheck` and `build` scripts; document how to run them in the README.
- Git-ignore `.env*` files (an `.env.example` is allowed if needed); commit no secrets.
- Add minimal placeholder pages for `/`, `/work`, `/concepts`, `/arcade`, `/about`, `/contact` with titles and descriptions, and a 404 for unknown routes.

Out of scope: design tokens, header/footer/shell, Sanity, Phaser, guide, real content, CI, deployment, paid services.

Acceptance criteria: see "Task 1 acceptance criteria" in the blueprint (section 11).

## Backlog (future content tasks are not yet approved)
| Phase | Task | Notes |
|---|---|---|
| 0 | 2: Design tokens and responsive site shell | Included in the currently authorized shell/homepage milestone |
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

## Initial shell/homepage validation — 2026-11-10 (historical palette)

- `npm run lint`, `npm run typecheck`, and `npm run build`: passed.
- Production HTTP smoke: `/`, `/work`, `/concepts`, `/arcade`, `/about`,
  `/contact`, `/world` returned 200; an unknown URL returned the custom 404.
- Rendered HTML: English language, one main/h1/header/footer, page metadata,
  labeled navigation, active route markers, and valid skip/anchor targets checked.
- Served CSS: responsive thresholds, focus rules, tokens, and reduced-motion
  rules present. Token text/focus contrasts on light surfaces >= 5.04:1; white
  primary-action text 8.42:1 (hover 11.90:1).
- React source review: static pages remain server components; pathname-aware
  navigation is the only client component. Lists use stable keys; navigation uses
  native links; no effects/listeners, data calls, game engine, or added runtime
  dependencies. Decorative map/arrows are excluded from screen-reader output.
- Limitation: browser access host unavailable. Actual 360px/1280px visual layout,
  keyboard focus traversal, zoom, and screen-reader behavior need browser review.
  Source/HTML checks do not establish those runtime results.
- `automation/` and package manifests/lockfile unchanged. No commit or deployment.
- Remaining content at that stage: conventional section pages, brand approval,
  and final game art/playability. Editorial colors/type have since been approved. Recommended next milestone: typed public project model
  and Selected Work cards using clearly labeled placeholder data.

## Editorial review corrections — 2026-11-10

Implemented within the existing redesign:

1. Shared Preview Adventure — Coming Soon wording on all entrances.
2. Exact-page and section/mode location semantics with boundary-safe matching.
3. Hero stacks through tablet widths; only explicit long-text utilities allow
   arbitrary word wrapping.
4. Temporary world-only surfaces, colors, rounded controls/panels; original map
   artwork and non-playable notice retained.
5. View Portfolio and all conventional routes remain accessible.
6. Heading-based destination names, decorative-text exclusions, explicit action
   borders, and separate native top/content fragment targets.
7. Approved decisions and actual evidence recorded in DESIGN_SYSTEM.md and here.

Files changed by this correction task (earlier uncommitted work preserved):
`app/page.tsx`, `app/world/page.tsx`, `app/tokens.css`, `app/globals.css`,
`components/site/site-shell.tsx`, `components/site/site-navigation.tsx`,
`components/ui/action-link.tsx`, `components/home/world-preview.tsx`,
`lib/shared/navigation.ts`, `docs/DESIGN_SYSTEM.md`, `docs/AGENT_TASKS.md`.


### Validation evidence for the review corrections

- `npm run lint`: passed with zero warnings; `npm run typecheck`: passed;
  `npm run build`: passed, with all seven intended routes statically rendered.
- Direct navigation-helper checks: **9 section cases + 14 mode cases passed**.
  These cover exact/nested routes, the introduction, world/editorial modes, and
  prefix lookalikes. These are logic checks, not browser navigation tests.
- Production HTTP: `/`, `/work`, `/concepts`, `/arcade`, `/about`, `/contact`,
  `/world` returned **200**; `/unknown-review-check` returned the custom **404**.
- Rendered HTML verified consistent names for every world entrance; exact-page
  versus editorial-location mode states; one h1/main/header/footer; page metadata;
  unique IDs; named destination links with valid descriptions; and separate,
  focusable skip-to-content and back-to-top fragment targets. No canvas or
  premature Start Adventure label appears in the rendered output.
- Built CSS verified responsive rules at 40/48/64rem, world tokens, explicit
  control borders, focus rules, and reduced-motion overrides. Every stylesheet
  variable resolves. Source review confirms ordinary words are not split globally.
- Editorial contrast: ink/paper **17.03:1**, ink/orange **8.53:1**, muted text on
  secondary paper **6.00:1**. World ink/sage **10.29:1**, muted/sage **6.23:1**,
  ink/cream **11.26:1**, muted/cream **6.82:1**; world edges/surfaces **5.82–6.37:1**.
- Browser connection: the browser access host was unavailable. Native Chrome
  eventually loaded the local homepage; its accessibility tree confirmed the
  full preview wording, spaced heading, hidden decorative field numbering, and
  concise destination names. Responsive-control interaction then timed out and
  reset the computer-use session. This is partial browser evidence only.

| Requested browser check | Result |
|---|---|
| 360px | Unverified: viewport control unavailable after timeout |
| 641px | Unverified: viewport control unavailable after timeout |
| 768px | Unverified: viewport control unavailable after timeout |
| 1024px | Unverified: viewport control unavailable after timeout |
| 1280px | Unverified: viewport control unavailable after timeout |
| 200% zoom | Unverified |
| Keyboard traversal / skip / back-to-top focus | Markup verified; actual keyboard behavior unverified |

Screen-reader behavior and full visual/console checks also remain unverified.
These source, HTTP, and native accessibility-tree checks do not establish visual
layout or runtime focus behavior. Follow-up browser/owner review remains required.
No package dependencies, font files, automation files, or Git/deployment state
were changed by these corrections.

## Faithful landing-page milestone — 2026-11-10

Implemented: full-bleed orange composition; enormous per-glyph fitted Portfolio
Quest wordmark; scroll-velocity stretch/spring; four 18s drifting circles; tactile
route controls and shortcut links; six colorful destination cards with spring
entry and grayscale-to-color focus/hover; compact serif footer. The original map
is relocated into the adventure card and remains on `/world`. Static mobile,
reduced-motion alternatives, pause toggle, accessible heading, native links and
existing route semantics are preserved. No full project browser or chat added.

Validation: lint/typecheck/build and whitespace checks passed. Production HTTP
returned 200 for all seven intended routes and 404 for an unknown route. HTML
names, metadata, landmarks, IDs, six destinations and native targets passed.
New font binaries and OFL notices are served locally. Five signed/zero spring
velocity scenarios settled safely; existing route/mode regression cases passed.
All six tint/text combinations and footer supporting text pass contrast checks.

Browser tooling failed: browser host unavailable; native Chrome reference-opening
attempt blocked by concurrent app changes, followed by a state-refresh timeout.
Matching-width reference/new screenshots, 360/641/768/1024/1280px visuals, 200%
zoom, keyboard, live motion/pause/reduced-motion, and screen-reader checks remain
unverified. See DESIGN_SYSTEM.md section 11 for exact implementation mapping,
intentional differences, full changed-file manifest, and actual evidence.

The implementation is ready for local owner review; browser QA and independent
follow-up remain outstanding. No merge/deployment approval is implied.

## Entrance milestone implementation — 2026-11-10

Implemented the approved route split with preservation first. The orange page is
now `/portfolio`; `/` contains the two path cards, direct skip/content links,
responsive pointer decoration, reduced-motion alternatives, cancelable path wipe,
and transparent local guide. Original section URLs and non-playable world remain.

Recovery archive: `.local-snapshots/portfolio-baseline-2026-11-10-4ed42918.tar.gz`.
SHA-256 manifest, pre-move production HTML/CSS, and preservation comparison JSON
are retained alongside it. See DESIGN_SYSTEM.md section 12 for the source manifest,
route/link semantics, recovery procedure, provider contract and review limitations.

### Actual entrance milestone validation — 2026-11-10

- Before modification: a production baseline build passed and its original `/`
  HTML/CSS were captured. After implementation: lint (zero warnings), typecheck,
  production build and `git diff --check` passed. Eight public routes are static.
- HTTP: `/`, `/portfolio`, `/work`, `/concepts`, `/arcade`, `/about`, `/contact`,
  `/world` returned 200; `/missing-entrance-check` returned the custom 404.
- HTML checks: unique IDs, one h1/main/header/footer, titles/descriptions,
  existing route links, valid skip/help/back-to-top fragments, both path targets,
  question label/max length/live region, six preserved quilt cards, pause control,
  and the non-playable notice. Guide markup appears only at `/`.
- Preservation: page source differs only in two title metadata strings;
  **20 protected files byte-identical**; `/portfolio` main DOM exactly matches
  the pre-move `/` main DOM; original landing-header class and compiled CSS retained.
- Guide: four suggested prompts, eight intent/edge cases, deterministic repeated
  questions, seven valid action IDs/routes and four invalid/inherited/arbitrary
  URL IDs passed. Portfolio/work/world/entrance and nested-section mode cases passed.
- Text/control contrast checks passed: cream/night 13.58:1; muted/night 9.35:1;
  muted/brown portal 7.53:1; muted/green portal 7.77:1; guide answer 10.04:1;
  mint/night 9.48:1; muted input placeholder 5.50:1; focus/night 10.26:1.
- Native Chrome: inspected the entrance at its current desktop window and its
  accessibility tree. In an isolated production test tab, activated “Can I play
  the adventure?” and confirmed the scripted, explicitly non-playable response
  and valid navigation. No model/network service was involved.
- Browser access host remains unavailable. Responsive emulation was interrupted
  by current-window/app changes, so **360px, 768px, 1280px, 200% zoom, keyboard
  traversal, live parallax/route wipe/reduced-motion and orange-page animation
  regression checks remain unverified**. No pixel-perfect or live-animation
  preservation claim is made; source/DOM/CSS preservation is verified separately.
- Owner review: new entrance art/composition, guide copy/coverage, transition feel,
  responsive/keyboard tests and live `/portfolio` comparison. The RPG, approved
  project/about/contact content, and a future real AI provider remain placeholders.
- No new dependencies, external API calls, credentials, paid SDKs, fonts or image
  downloads. `automation/`, package manifests and lockfile are unchanged. No
  commit, push, merge, purchase or deployment.

## Round 2 repairs and title-screen entrance — 2026-11-10

Implemented the owner’s replacement entrance direction and relevant P0/P1 brief.
Preserved the orange Portfolio via a pre-repair recovery snapshot and protected
hash fixture. Portfolio source effects were not rewritten; a pass-through layout
adds zero-minimum hero tracks, 90rem editorial width and focus offsets.

The entrance now has two large path links, a small direct Selected Work bypass,
an original bounded walking traveler and a compact conversation dialog. Reference
sprite rights were not supplied, so its image was not reused. The guide is an
explicitly scripted fallback with history, examples, empty/error handling and
improved intent priority. Real free-form AI is NOT connected. Provider options,
cost estimates, privacy and public-abuse controls are prepared for a separate
approval step in [AI_GUIDE_OPTIONS.md](AI_GUIDE_OPTIONS.md).

Removed rendered mode bars and entrance directory/footer. Shared navigation is a
compact responsive disclosure with correct route labels/current states and return
paths. Native path dialog handles focus, background inertness, Cancel, Escape,
cleanup and repeated cancellation announcements. Reduced motion follows links
immediately and stops avatar motion.

Actual validation: lint (zero warnings), typecheck and production build PASS;
21 unit/preservation/contrast regressions and 9 production HTTP/semantic/asset
checks PASS, zero failures/skips. Nineteen protected sources/assets match the
pre-repair hashes. Portfolio main DOM matches the original baseline after the two
approved label substitutions. Diff check passes; automation and dependencies are
unchanged by this repair.

Native Chrome fallback allowed visual inspection at 360, 768, 1024, 1280, 1440,
1920 and 2560px for both routes; the 2560px editorial board was also inspected.
Both pages were checked at confirmed 200% zoom. Guide empty/repeated responses,
Escape/focus restoration, menu Tab/Escape, transition focus/cancellation, and
reduced-motion direct entry/stationary avatar/flat Portfolio controls were
observed. Browser host remained unavailable. This is smoke coverage, not a full
cross-browser, screen-reader, performance or pixel/motion regression audit.

For the exact 25-file source inventory, recovery artifacts, P0/P1 mapping,
commands, viewport matrix, warnings and remaining gaps, read
[ROUND_2_REVIEW.md](ROUND_2_REVIEW.md). Earlier milestone entries are historical.

Status: implemented for Claude’s independent Round 2 re-review. Owner art/UX
review, remaining browser/accessibility coverage and any real AI activation
approval are outstanding. No commit, push, merge, deployment or purchase.


### Follow-up revalidation of the repeated repair brief — 2026-11-10

Confirmed the existing P0/P1 implementation and preserved application source.
Fresh lint, typecheck, production build, 21 unit/preservation/contrast tests,
9 production HTTP tests and diff checks passed. Nineteen protected file hashes,
the normalized Portfolio main DOM and 42 archived recovery hashes still match.

Browser host remains unavailable; native Chrome tab selection was interrupted by
concurrent user activity. No fresh browser matrix is claimed. Earlier viewport,
200% zoom, keyboard and reduced-motion observations remain recorded separately;
the full browser recheck is outstanding. See [Round 2 report](ROUND_2_REVIEW.md).

This follow-up modified only `docs/ROUND_2_REVIEW.md` and `docs/AGENT_TASKS.md`.
No additional website implementation changes were necessary. No automation,
dependency, agent-configuration, commit, push, merge or deployment changes.

### Entrance avatar frame-animation quality — 2026-11-11

Replaced the simple SVG entrance guide with individually extracted, normalized
owner-supplied character frames. Implemented real idle/left-right walk/turn/
thinking/talking/happy/wave clips, distance-synchronized gait, bounded movement,
interaction stopping, animated conversation portrait and shared pause/static
reduced-motion behavior. Source permission is the owner's confirmation; metadata
and the incomplete source gait/high-DPI detail are documented honestly.

Lint, typecheck, production build, 28 Node tests and all 42 frame asset checks pass.
Nineteen protected Portfolio hashes match. Fresh browser viewport/keyboard/touch/
reduced-motion checks remain unverified because browser host access failed and
native Chrome interaction was interrupted by concurrent activity. Asset previews
were inspected separately and do not substitute for browser validation.

Read [AVATAR_QUALITY_REVIEW.md](AVATAR_QUALITY_REVIEW.md) for exact inventory,
permissions, recovery baseline, production HTTP evidence and owner-review gaps.
No protected Portfolio, automation, dependency, paid service, commit, push, merge
or deployment changes. Owner art review and fresh live-browser QA remain open.

### Avatar review Round 2 repairs — 2026-11-11

Addressed the supplied P0/P1 brief: explicit complete answer cues, neutral idle,
positive Portfolio-only celebration, no typing/scripted thinking, independent
presentation clock, matching Pause/Resume names, visible avatar label in its name,
focus-visible-aware pointer/touch recovery, animation-clock gait with transform
frame painting, expanded honest intent coverage and parents=True extraction fix.

Preserved a 73-file pre-repair snapshot under
`.local-snapshots/avatar-round2-before-2026-11-11.*`; earlier snapshots remain.
Protected Portfolio hashes, original avatar assets and automation remain untouched.
Regression coverage includes all answer cues, deterministic timer boundaries and
replacement/cleanup, intent examples, focus policy, native interpolation, every
atlas frame coordinate, decoded image lifecycle and fallback.

Current commands and partial Chrome observations are recorded in the Round 2
section of [AVATAR_QUALITY_REVIEW.md](AVATAR_QUALITY_REVIEW.md). These repairs are
ready for independent re-review, not a claim of full website approval. Real AI,
new source art and comprehensive device/accessibility testing remain separate.
No commit, push, merge or deployment.

### Companion panel design refinement — 2026-11-11

Implemented the owner-approved nonmodal paper companion: right-hand layout track
on desktop, document-flow compact sheet below the entrance on smaller widths,
warm paper/ink/orange palette, folded/fastened paper details and short spatial
entry/exit/message gestures. Reduced prompts and disclosure clutter. Preserved
local scripted answers, cue/timer repairs and all avatar artwork/movement files.
Paths remain independent native links; panel uses no backdrop, inertness or focus
trap. Escape/Close returns to the avatar; path transitions use a separate origin.

Lint/typecheck/build, 75 unit tests, 9 production HTTP tests, all 42 frame asset
checks, protected Portfolio hashes and diff check PASS. Native Chrome attempts
were interrupted/timed out, so new browser matrix/screenshots and live keyboard/
touch/screen-reader/reduced-motion validation remain outstanding. Static review
previews are supplied with clear limitations. Recovery contains 76 baseline files.

See [COMPANION_INTERFACE_REVIEW.md](COMPANION_INTERFACE_REVIEW.md) for exact files,
design rationale, before/after gallery and Claude Round 2 priorities. No packages,
services, automation, protected Portfolio, commit, push, merge or deployment changes.

### Companion final Round 3 implementation — 2026-11-11

Implemented focused P0/P1 repairs from the owner's findings: shared grid/sticky
primary path row, explicit direction/lost/skip/transparency intents, honest fallback
and visible destinations, exact Scripted guide · Not AI disclosure, complementary
semantics, scoped Escape/focus ownership, larger small text, single-channel errors,
observer guards, reduced-motion control hiding, anchored Field Note opening,
orange shadow, restrained suggestions and stage FLIP. Preserved sprite assets,
walking algorithm, Portfolio and automation. Added test scripts and a local live
browser matrix runner; no packages installed.

Lint/typecheck/build PASS; 92 unit tests and 9 production HTTP checks PASS; all 42
asset checks, 19 Portfolio hashes plus avatar/core preservation checks PASS. The
87-file pre-edit recovery snapshot and earlier work remain intact.

Live browser access was interrupted/unavailable, so P0 actual visibility and
clickability at all eight widths remain unverified. The runner is syntax/HTTP
checked, not recorded passing in a browser. Claude's final verification must
complete the matrix and visual/accessibility checks before approval. This is the
final implementation round of this cycle; do not equate passing build with approval.
See [COMPANION_ROUND_3_REVIEW.md](COMPANION_ROUND_3_REVIEW.md) for exact files,
evidence, commands and remaining risks. No commit, push, merge or deployment.


### AD1 local integration and D6 default — 2026-11-15

Owner approved local integration, D6 default and Adventure wording, then explicitly approved replacing only the outdated Portfolio card description. Implemented `/world` as an isolated React AD1 hub with Island/Arcade/Neon, shared grid/carousel selection, Settings, prototype cards, native story dialog, fresh unchanged machine embeds, history/message return and licensed self-hosted fonts. Sample tiles/case studies stay development-only; unpublished case-study links are omitted. No real client narratives or outcomes added.

Validation: lint/typecheck/build PASS; 99 unit tests PASS; 140 quest/production HTTP checks PASS; all 42 avatar asset checks PASS; seven development template routes and default D6 verified over HTTP; 17 template source hashes and 5 machine/shared source hashes PASS. Existing Portfolio hash checks pass with only the exact approved sentence normalized. Native Chrome showed the initial Island grid and accessible controls, but owner browser activity interrupted further inspection; an isolated browser host is unavailable. The full viewport/theme/view, mobile, zoom, keyboard/focus, history, touch, drag and console matrix is not claimed passing.

Recovery snapshot: `.local-snapshots/ad1-integration-before-2026-11-15/`. Exact inventory, differences, limits and preview instructions: [AD1_INTEGRATION_REVIEW.md](AD1_INTEGRATION_REVIEW.md). Ready for local owner/Claude review, not live approval. No packages installed, automation changed, commits, merges, pushes or deployment.


### Promote latest island to main entrance — 2026-11-15

Owner requested the latest island design with New Destination Scenes in Settings as the main page. `/` now reuses the restored island component with a direct Selected Work shortcut and Settings summary. `/quest-preview` remains available. Default Tokyo autumn/day, all current and new destination scenes, sprites, pets, chat, entry camera and controls are preserved. Shared Adventure copy reflects the playable prototype lineup. No Portfolio or Adventure source changes.

Lint/typecheck/build PASS; 103 unit tests and 140 quest/production HTTP checks PASS; 42 avatar asset checks PASS; ten immediate Portfolio source/effect baseline hashes PASS. Fresh native browser testing was blocked by concurrent owner activity; no final viewport, keyboard/touch, reduced-motion or visual approval is claimed. Report/recovery: [ISLAND_MAIN_REVIEW.md](ISLAND_MAIN_REVIEW.md), `.local-snapshots/island-main-before-2026-11-15/`. No commit, merge, deployment, installation or automation edits.


### Contact mockup — 2026-11-15

Built `/contact` in the existing editorial style with labelled message fields, topic selection, explicit Email/LinkedIn pending states, local draft copying and manual-copy fallback. Owner specified mockup first; no address, profile or delivery service was invented. Navigation and P09 architecture reference updated. Lint/typecheck/build, 111 unit and 17 production HTTP checks PASS; desktop layout/AX inspected, remaining interactive/mobile checks documented in [CONTACT_REVIEW.md](CONTACT_REVIEW.md). No protected Portfolio, scene/artwork, automation, install, commit or deployment changes.


## Current implementation record — 2026-11-17

This section records the later owner-directed work and supersedes the initial scaffold-only task scope above. Approved product decisions remain in PROJECT_BLUEPRINT.md section 0. The task-log history above was recovered from the saved 2026-11-15 source snapshot after the working file was found to contain a duplicate of the blueprint.

### Concept Lab and latest three-path homepage

Concept Lab uses seven clearly labelled existing sample concepts/art projects and dedicated `/concepts/[slug]` visual detail URLs, sharing the seven unchanged case-study templates. Full-story links and a return to Concept Lab remain available. No real concept content was supplied or invented.

The owner-selected `/quest-preview/concept-scene` design is now the actual homepage. The shared scene component covers 22 city/season and destination scenes in day and night. Concept Lab is smaller on the left, Portfolio is central and Adventure is on the right. Preserve the original title, underlying island base, full-circle drag/reset, shared Settings, day/night, Season changes ON/OFF, hover labels, natural avatar walking/entry zoom and pets. The old island remains at `/quest-preview` for comparison; its scene sources and the seven case-study templates retain their protection fixtures.

### Lively scenes and final figure scope

Added distinct gallery buildings and local decorations. Bangkok has a river, temple, buildings, moving boats and tuk-tuks. Okinawa/Krabi have bays, small islands, surf/kayak/paddle participants and speedboats. Hakuba replaces Niseko in current labels and public scene URLs, with Japan Alps scenery, skiing, a lift and illuminated bars. Yi Peng has ten floating warm orange paper lanterns, fewer hanging lanterns and temple lights, with gentle rising/swaying motion.

Broadway has three theatre entrances, taller surrounding buildings, an original floating genie and twelve queued taxis, plus its separate moving taxi. Fourteen musical names appear once each and were checked against official NYC listings on 2026-11-16. Hovering each theatre moves its sign lettering and creates a smooth light pattern; pause/reduced motion restore resting hover geometry.

The final owner clarification removes only the added background walking figures across all scenes. Keep water-sport participants, skiers, vehicle riders, the main avatar, pets and genie. Added drifting clouds and stronger autumn leaf gusts. Talk to me toggles the conversation; its close icon is 2.25rem with a 48px target. All motion respects pause, reduced motion and hidden-page scheduling.

### Site hierarchy and navigation

Portfolio choices open Selected Work at `/work`, leading to project detail. Concept Lab opens concept detail. Adventure opens a story panel or one of three preserved playable prototypes. Other pages share the Portfolio-style top navigation: Portfolio Quest returns to `/`, desktop shows direct links, mobile uses Menu, and About Me/Contact remain available. The island homepage and its matching design-preview route intentionally omit the shared top navigation. The orange `/portfolio` overview is reached from the footer's See all works button. Contact remains an explicitly local mockup without invented public contact details.

### Latest UI fix and validation

Repaired the Adventure project dialog's malformed body selector, restored padding/gaps, balanced the title and Play button, separated the note and stacked actions on narrow screens. No machine or case-study-template assets changed.

Latest validation: 162 unit tests, lint and production build pass (2026-11-17). Previous HTTP checks covered main routes, all seven concept details, project details and original playable demos. Current prepared artwork covers all 44 views. Browser captures are versioned; the gallery uses current artwork instead of stale screenshot versions. Live visual/browser checks of the latest weather, guide and Adventure-dialog refinements remain incomplete because the browser connector was unavailable. No production deployment is included.

### Git save requested by owner

The owner requested saving all website changes to Git. Save on `website/implementation` and sync that branch to origin. Include source, runtime assets, review screenshots, tests and documentation. Keep local recovery snapshots and credentials ignored. The rebuildable `all-scenes*.zip` download archive is ignored because its 244 MB size exceeds GitHub's single-file limit; screenshot sources and regeneration scripts remain included. The separate automation worktree's pending changes are outside this website save.
