# Portfolio Quest — Round 2 implementation evidence

Date: 2026-11-10. Workspace: `/Users/workspace/portfolio-quest-website`.
Branch verified: `website/implementation`. Existing uncommitted work was reviewed
and retained. This is an implementation report for independent re-review, not
owner approval or a complete accessibility certification.

## Follow-up revalidation of the repeated repair brief — 2026-11-10

Inspected the current worktree and confirmed the listed P0/P1 corrections are
already present. Existing application files, design, avatar and uncommitted work
were retained. This follow-up changes only this report and `AGENT_TASKS.md`.
The original 25-file implementation inventory below remains the repair inventory.

Freshly rerun: lint (zero warnings), typecheck, production build, 21 unit/
preservation/contrast tests, 9 production HTTP tests and diff checks all PASS.
The 19 protected hashes and normalized Portfolio main DOM still match their
baselines; all 42 recovery-archive hashes were also verified. No automation diff.

A new browser inventory again reported “The browser access host is unavailable”.
Native Chrome responded, but switching to the existing website test tab was
interrupted with “The user changed '/Applications/Google Chrome.app'”. No renewed
viewport/zoom/keyboard/motion pass is claimed for this follow-up. The earlier
seven-width and interaction observations below remain historical evidence for
the retained implementation. Full revalidation of those browser checks remains
outstanding, along with the more extensive gaps listed below.

## P0 corrections

| Owner brief | Implemented correction | Evidence |
| --- | --- | --- |
| Clipped Portfolio hero | Pass-through layout imports additive CSS; hero column `minmax(0,1fr)` and breathing row `minmax(0,1fr)` prevent intrinsic grid expansion | Current-build hero inspected at all seven requested widths after normalizing browser zoom; source effects remain unchanged |
| Ultrawide sizing | `--portfolio-content-max:90rem`, centered editorial section/cards and hero copy/controls; full-bleed orange, wordmark and circles retained | 1920/2560 hero inspected; centered board inspected at 2560; CSS measure verified in compiled output |
| Busy entrance | Replaced rich cards, explanation blocks, extra navigation and mode bar with title screen and two primary anchors | `/` renders PORTFOLIO → `/portfolio`, ADVENTURE → `/world`; visible non-playable notice; direct Selected Work retained |
| Mobile navigation | Compact brand/Menu header below 56rem; desktop additionally exposes Work, Concepts, Arcade | 360/768 compact layouts and 200% zoom inspected; native disclosure keyboard checks below |
| Labels, active states, returns | Consistent Portfolio, Selected Work, Adventure Preview; boundary-aware exact/nested matching; Entrance and both modes in Menu | Unit route tests and HTTP `aria-current` checks pass on all seven content routes; `/world` brand returns directly to Portfolio |

## P1 corrections and new entrance

- Native transition dialog makes the background inert, focuses Cancel, supports
  visible pointer/touch cancellation and Escape, restores the originating link,
  and announces each cancellation. Navigation timer/listeners clean up on cancel
  and unmount. The 1.2s window avoids a flash-only cancellation opportunity.
- Reduced-motion users follow the real link immediately. Modified clicks retain
  browser behavior. No JS is required to use the two path anchors.
- Guide matches specific site intents before generic terms. “AI projects” now
  points to Selected Work; “how does this guide work?” explains its limits.
  Empty questions produce a visible error. Unknown questions admit no local match.
  Responses explicitly identify current project/about/contact placeholders.
- Conversation has text entry, three examples, ten-exchange ephemeral history,
  rejected-provider error UI, safe approved destination IDs and unique numbered
  live replies. It is explicitly a scripted fallback; **real AI is not connected**.
- Original SVG lantern traveler uses idle/walk/talk states in a separate bounded
  stage below the path controls. It stops/faces forward for interaction and
  conversation. Pause, focus, hover, offscreen, hidden-tab and reduced-motion
  handling are implemented without per-frame React updates or a perpetual RAF.
- Shared scroll padding and focus/anchor margins account for the measured header;
  Portfolio cards also allow space for the shortcut toolbar. Menu fits short
  viewports with its own scrolling area.
- Entrance-only core color/font tokens are consolidated. Existing OFL fonts reused.
  Text contrast ≥4.5:1 and border contrast ≥3:1 are regression-tested for core pairs.

## Provenance and real AI boundary

The reference HTML embeds a sprite sheet but supplies no verifiable reuse license
or artist permission. Its artwork was not reused. The new SVG is original
placeholder art and needs owner aesthetic review. No reference biography,
project narratives, contacts, third-party images or chat service were copied.

[AI_GUIDE_OPTIONS.md](AI_GUIDE_OPTIONS.md) evaluates Workers AI Free, Gemini Free
and browser-local WebLLM, with primary-source pricing links, illustrative costs,
privacy/quality tradeoffs and a proposed hard-capped pilot. It specifies server
secrets, shared quotas, abuse limits, safe output actions and fallback tests for
a **future separately approved** service. None of those services or server-side
abuse controls is claimed active today. No API route/SDK/key/billing was added.

## Preservation evidence

Recovery archive and SHA manifest, created before repairs:

- `.local-snapshots/round2-before-ce36be17.tar.gz`
- `.local-snapshots/round2-before-ce36be17.json`

The recovery archive was reopened and all 42 archived file hashes matched its
manifest. The previous `portfolio-baseline-2026-11-10-4ed42918` archive/HTML/CSS remains.
Do not extract backups over later uncommitted work; compare/recover individual
files only.

All **19 files** listed in `tests/fixtures/portfolio-protected-sha256.json` match
the pre-repair hashes. These include the Portfolio page, original CSS/tokens,
wordmark/reveals/art/map, spring helper, custom 404, fonts and license records.
Portfolio main DOM equals the original pre-entrance baseline after only:

1. “View Portfolio” → “Selected Work” on the existing `/work` action.
2. “Preview Adventure — Coming Soon” → “Adventure Preview — Coming Soon”.

Comparison result saved in `.local-snapshots/round2-preservation.json`.
Protected source identity is verified; exact live animation/pixel parity against
the original reference is not claimed. Shared header/navigation changes and
additive sizing/focus corrections are intentional approved differences.

## Actual command results

- `npm run lint`: PASS, zero warnings.
- `npm run typecheck`: PASS, Next route generation and TypeScript.
- `npm run build`: PASS, all eight public routes statically generated, plus 404.
- `node --test tests/website.test.mjs`: **21/21 PASS**, no failures/skips. Covers
  guide edge cases, deterministic repeats, action allowlist, Unicode/length/empty
  input, current-route boundaries, wander bounds/duration, contrast and hashes.
- `node --test tests/website-http.test.mjs`: **9/9 PASS**, no failures/skips.
  Eight routes returned 200; missing route returned custom 404. Titles,
  descriptions, one main/h1, unique IDs, skip links, two primary path links,
  non-playable notice, six quilt destinations, labels, current states and all
  referenced JS/CSS/font response codes checked.
- `git diff --check`: PASS. No diff under `automation/`. Package manifests,
  lockfile, dependencies and agent configuration unchanged in this repair.
- Native TypeScript test imports emit Node’s benign MODULE_TYPELESS_PACKAGE_JSON
  reparse warning. Tests ran on Node 26.13.0; no package module-mode change made.

The loopback production server was restarted after rebuilding, so the final
browser pass used current manifests/assets. Nothing was deployed.

## Actual browser results and limits

Browser access host was unavailable. Native Chrome, its accessibility tree,
responsive device toolbar and Rendering controls were usable as a fallback.
Screenshots were inspected in the tool conversation; there is no automated
pixel-diff or committed screenshot suite.

| Width (CSS px), height 800 | Entrance | Portfolio |
| --- | --- | --- |
| 360 | Two paths, status and separate avatar stage inspected; guide dialog opened | Fitted wordmark, wrapped copy/actions and compact Menu inspected |
| 768 | Composition and separate guide stage inspected | Compact Menu and tablet hero inspected |
| 1024 | Composition inspected | Desktop links, Menu and hero inspected |
| 1280 | Composition inspected | Full-bleed hero and controls inspected |
| 1440 | Composition inspected | Full-bleed hero and controls inspected |
| 1920 | Restrained centered composition inspected | Hero and centered header/copy/controls inspected |
| 2560 | Restrained centered composition inspected | Hero plus centered editorial/card board inspected |

Early numeric-field attempts produced incorrect widths; those attempts are not
counted. Chrome’s width readout was checked for the listed cases. Browser zoom
was normalized to 100% before the final Portfolio matrix. These are visual smoke
checks, not computed overflow/position assertions at every width. A 360px entrance
DOM probe did return innerWidth=scrollWidth=360 before console pasting became
restricted; browser security settings were not relaxed.

Additional actual checks:

- Chrome confirmed **Zoom: 200%**. Both routes were inspected at that setting.
  Navigation remains available; vertical scrolling is needed at the shorter
  effective viewport. Menu opened, Tab reached Entrance, Escape closed it and
  returned focus to Menu. Zoom restored to 100% afterward.
- Guide: empty Enter submission produced the error; “AI projects” produced
  Selected Work and Portfolio links; a repeated question preserved both history
  exchanges and produced distinct “Reply 2…” live-region text. Escape returned
  focus to the avatar. Actual screen-reader speech was not tested.
- Normal-motion transition: initial focus was Cancel; Escape and pointer Cancel
  both returned to the correct originating path link with numbered cancellation
  status. Portfolio entry reached the correct route. A physical touch device and
  a complete focus-cycle/trap test were not available.
- **Reduced-motion emulation confirmed in Rendering controls**. The avatar stayed
  stationary across separated observations; Portfolio entry followed the direct
  route without the wipe; the Portfolio pause control was absent and tilted
  controls were flat. Emulation was restored afterward. Every effect at every
  width was not exhaustively compared.
- Source inspection: React effects clean up timers/listeners/observers; refs handle
  transient movement without per-frame state; form content is plain React text;
  safe links resolve through a fixed own-property allowlist. No app inference
  requests, credentials or third-party animation dependency exist.
- Console showed unused prefetched route-CSS warnings and extension font/message
  diagnostics. No React hydration error was observed. A clean-profile console
  audit and full network/performance trace remain unverified.

Still unverified: full quilt/footer at every width, exhaustive keyboard/focus
order and screen-reader output, real touch/virtual-keyboard behavior, Safari and
Firefox, JS-disabled browser walkthrough, provider-failure injection, performance
profiling, and frame-by-frame original-reference motion/hover/reveal comparison.
Basic source preservation does not replace these checks.

## Exact source files changed by this repair

Earlier uncommitted changes in Git remain; this inventory is the current repair
relative to the inspected pre-repair state.

Modified existing files:

- `app/layout.tsx`
- `app/entrance.css`
- `components/site/site-shell.tsx`
- `components/ui/action-link.tsx`
- `components/entrance/entrance-experience.tsx`
- `components/entrance/local-guide.tsx`
- `lib/shared/navigation.ts`
- `lib/guide/local-guide.ts`
- `README.md`
- `docs/PROJECT_BLUEPRINT.md`
- `docs/DESIGN_SYSTEM.md`
- `docs/AGENT_TASKS.md`

Added files:

- `app/site-navigation.css`
- `app/portfolio/layout.tsx`
- `app/portfolio/corrections.css`
- `components/site/compact-navigation.tsx`
- `components/site/footer-frame.tsx`
- `components/entrance/walking-guide.tsx`
- `components/entrance/path-transition.tsx`
- `lib/guide/walking.ts`
- `tests/website.test.mjs`
- `tests/website-http.test.mjs`
- `tests/fixtures/portfolio-protected-sha256.json`
- `docs/AI_GUIDE_OPTIONS.md`
- `docs/ROUND_2_REVIEW.md`

The three ignored Round 2 snapshot/evidence artifacts listed above are local-only.
No source files were deleted. `app/portfolio/page.tsx`, `app/landing.css`,
`app/globals.css`, `app/tokens.css`, all home effect/art components, original
map artwork and fonts are unchanged in this repair.

## Preview and remaining approval

From the website directory, run `npm run dev`, then open `http://localhost:3000/`,
`/portfolio` or `/world`. For a production preview: `npm run build`, then
`npm run start -- --hostname 127.0.0.1 --port 3100`. Run HTTP tests against that port.

Owner/Claude Round 2 review: title-screen art and avatar appearance, restrained
composition, guide discoverability/copy, transition/cancellation feel, and the
unverified checks above. Approve a provider/model, data policy, budget/quotas and
service deployment separately before real AI work is activated.

Remaining placeholders: genuine free-form AI, playable RPG, approved work/concept/
arcade content, biography, resume and contact details. Filters, case-study pages
and the reference character’s artwork remain out of scope. No commit, push,
merge, deployment, purchase or automation changes were performed.
