# AD1 local integration review — 2026-11-15

## Scope and owner decisions

Workspace `/Users/workspace/portfolio-quest-website`, branch `website/implementation`.
Owner approved local integration, D6 default and the Adventure label. Separately approved changing only the Portfolio card's outdated non-playable description. Earlier uncommitted work remains preserved. Recovery: `.local-snapshots/ad1-integration-before-2026-11-15/baseline.tar.gz` and `hashes.json`.

## Implemented

- `/world` now hosts a React implementation of the approved AD1 preview: Island default, Arcade/Neon Settings themes, icon-only grid/carousel switch, shared selection, CSS previews, pointer tilt, native view transition when supported, pause and reduced-motion behavior.
- Header Paths → `/`, Contact → `/contact`. Existing entrance links still target `/world`. Entrance/guide/navigation/transition copy now describes Adventure and its actual prototype demos. Only the exact owner-approved description changed in protected `app/portfolio/page.tsx`; its markup, motion, artwork and typography were preserved.
- Native modal cards and right-side story dialog, Escape/Close/backdrop dismissal, focus containment, return-to-origin/fallback, polite selection announcements. Settings closes outside, on focus departure or Escape.
- P1–P3 copied byte-for-byte, with unchanged `play.css` and `play.js`. A new iframe is created on every launch, with a one-step browser-history entry. Parent messages require both matching origin and the current iframe source. Duplicate return activation is guarded. Sound is off by default; lineup sound and machine controls remain independent.
- Three actual playable prototype demos appear in production. Five unbuilt sample tiles appear only in development and cannot pretend to launch a machine. No biographies, roles, outcomes or fabricated project narratives were imported.
- Story panels transparently state that project stories are not published. Full case-study links require an explicit slug AND a published project record; there are none today. No sample case-study link is exposed publicly.
- D6 Art Book is now the default; `project.template` still allows individual D0–D6 choices. All 17 template source/style/shared files remain byte-identical. Development template overrides and the switcher remain gated by the existing sample-data source; production sample routes remain 404.
- Existing Selected Work discovery retained. A minimal drag-hook fix removes listeners/RAF and clears transforms on unmount; behavior/art was not redesigned. Added filter/URL/sort/layout regression coverage.

## Fonts and provenance

The hub uses `next/font/local`: existing Anton/Newsreader, newly self-hosted Figtree, Press Start 2P and IBM Plex Mono. Original font binaries, OFL notices, download URLs, sizes and hashes are recorded in `assets/adventure-fonts.json`. Neon font preload is disabled. The font licenses were read from the official Google Fonts repository: [Figtree](https://github.com/google/fonts/blob/main/ofl/figtree/OFL.txt), [Press Start 2P](https://github.com/google/fonts/blob/main/ofl/pressstart2p/OFL.txt), [IBM Plex Mono](https://github.com/google/fonts/blob/main/ofl/ibmplexmono/OFL.txt). They permit embedding/redistribution with their notices. The React hub makes no runtime font-service request. The unchanged machines retain their original external Google Fonts import; offline font fidelity inside embeds is therefore not guaranteed.

## Validation

- `npm run lint`: PASS, zero warnings.
- `npm run typecheck`: PASS.
- `npm run build`: PASS.
- `npm test`: 103 unit tests, PASS.
- `node --test tests/quest-*.test.mjs tests/website-http.test.mjs tests/adventure-http.test.mjs`: 140 PASS against local production build.
- `npm run test:assets`: PASS, all 42 measured avatar crop/alpha/feet/border/dimension/budget checks.
- `npm run test:adventure:dev`: D0–D6 each HTTP 200 with sample disclosure/switcher; no-override project selects D6; development-only Adventure tiles present.
- Production checks cover six SSR theme/view combinations, all five machine/shared HTTP byte hashes, sample-route exclusion, existing routes/assets and custom 404. They are HTTP checks, not visual or browser interaction tests.
- 17 template hashes match the pre-integration snapshot. Original Portfolio hash fixtures are unchanged; checks reverse only the exact approved sentence before comparing the complete Portfolio source hash. Other protected source/assets/motion checks pass.
- `git diff --check`: PASS.

## Browser evidence and gaps

Native Chrome opened the initial Island grid and exposed correctly named Grid/Carousel, Settings and project controls. An initial screenshot revealed the inherited reading-container width; a scoped full-width wrapper correction was then added, together with AD1's actual second style block and viewport-fit rules. A later development-page AX inspection confirmed eight tiles with the last five labelled sample/not built. Subsequent screenshot inspection was interrupted by owner activity switching to a search tab. The isolated browser host reports unavailable. No final screenshot is claimed for the corrected layout.

Unverified: final visual comparison to AD1; 1280×680, 1366×768, 1440×750, 1440×900, 1920×1080 × three themes × both views; 390×844 with/without story panel; 200% zoom; complete keyboard/focus/backdrop/Back/postMessage flow; swipe/touch; live reduced-motion behavior; console errors; filters/sort/drag interactions; visual rendering of all seven templates. Implemented native-dialog accessibility is not equivalent to a tested screen-reader result. Claude/owner visual and UX approval is still required before anything live is replaced.

## Intentional differences / remaining content

Production has three built demos rather than eight tiles. Unbuilt tiles and case-study samples stay development-only. Story sections omit the preview's invented roles and placeholder process/outcome claims; no Full case study link exists until approved records/slugs are supplied. The hub is a lineup of playable demos, not a roaming RPG or a live AI service. `/quest-preview` remains an isolated experimental route with its earlier preview wording; no scene files, sprites, artwork or world movement were changed here. All other protected Portfolio presentation is unchanged.

## Preview

- Production preview: <http://127.0.0.1:3100/world> (three built demos).
- Development preview: <http://127.0.0.1:3000/world> (also shows five sample tiles).
- Default D6 sample: <http://127.0.0.1:3000/work/sample-payments-onboarding>.
- Individual template: append `?template=D0` through `D6` in development only.
- Existing development server on port 3000 was reused; it was not stopped or replaced. To start elsewhere after stopping a dev server yourself: `npm run dev -- --port 3000`. Production: `npm run build`, then `npm run start -- --hostname 127.0.0.1 --port 3100`.

No package installation, paid service, automation change, commit, push, merge or deployment. This is local implementation ready for review, not live approval.

## Exact files changed in this integration

- `app/portfolio/page.tsx`
- `app/world/adventure.css`
- `app/world/page.tsx`
- `assets/adventure-fonts.json`
- `components/adventure/adventure-dialog.tsx`
- `components/adventure/adventure-hub.tsx`
- `components/adventure/live-preview.tsx`
- `components/entrance/entrance-experience.tsx`
- `components/entrance/local-guide.tsx`
- `components/entrance/path-transition.tsx`
- `components/work/use-card-drag.ts`
- `docs/AD1_INTEGRATION_REVIEW.md`
- `docs/AGENT_TASKS.md`
- `docs/DESIGN_SYSTEM.md`
- `docs/PROJECT_BLUEPRINT.md`
- `lib/adventure/machine-hashes.json`
- `lib/adventure/projects.ts`
- `lib/guide/local-guide.ts`
- `lib/shared/navigation.ts`
- `lib/work/projects.ts`
- `lib/work/templates.ts`
- `package.json`
- `public/arcade/P1-seat-optimizer.html`
- `public/arcade/P2-ai-concierge.html`
- `public/arcade/P3-break-the-bot.html`
- `public/arcade/play.css`
- `public/arcade/play.js`
- `public/fonts/figtree/Figtree[wght].ttf`
- `public/fonts/figtree/OFL.txt`
- `public/fonts/ibmplexmono/IBMPlexMono-Medium.ttf`
- `public/fonts/ibmplexmono/IBMPlexMono-Regular.ttf`
- `public/fonts/ibmplexmono/IBMPlexMono-SemiBold.ttf`
- `public/fonts/ibmplexmono/OFL.txt`
- `public/fonts/pressstart2p/OFL.txt`
- `public/fonts/pressstart2p/PressStart2P-Regular.ttf`
- `scripts/check-adventure-dev.mjs`
- `tests/adventure-http.test.mjs`
- `tests/adventure.test.mjs`
- `tests/fixtures/ad1-templates-protected.json`
- `tests/guide-conversation.test.mjs`
- `tests/quest-actors.test.mjs`
- `tests/quest-preview.test.mjs`
- `tests/website-http.test.mjs`
- `tests/website.test.mjs`
- `tests/work-model.test.mjs`
