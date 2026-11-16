# Original tower-and-ruins scene restored

2026-11-12 — `website/implementation`.

## Owner-selected reference

The owner explicitly selected `.local-snapshots/quest-preview-world-dusk.png`, then requested its style, smooth floating text and an avatar larger than the pets. This supersedes the previous default city-scene presentation. Recovered the complete `world.ts` and palette from `quest-cities-before-2026-11-11.tar.gz`. The world source is unchanged except its relative math import. The two fallback images are exact copies of archived meadow day/dusk artwork. A hash fixture protects all four recovered files.

The browser now defaults to `edition: classic`: the original orange-roof observatory, stone ruins, pond/waterfall, faceted trees/clouds, paths, floating rocks and deep island. Its settled camera restores the old span and vertical framing. Current renderer lighting, sky background, avatar, pets, title, chat and accessible controls remain; this is a faithful geometry/art recovery, not a pixel-identical rollback of every old UI/shader. Both city collections remain available in Scene settings and recoverable in the new pre-change snapshot. The classic scene does not automatically change into a city.

## Interactions and proportions

Unboxed floating destination type remains attached to each building. Classic labels use an 800ms opacity/translation reveal with eased movement; building glow uses 500–600ms transitions. Reduced motion disables those transitions. Current keyboard focus indicators, direct links, scripted guide, pause, day/night and cancellation logic remain.

Pets are 1.1 world units instead of 1.5; the guide remains 2.6 world units. A conservative visible-silhouette regression verifies at least a 1.5× height difference. Actual desktop Chrome view confirmed the avatar visibly taller than both pets. No source artwork was edited. Classic walking clearings and door approach points are authored for the smaller original island. Both destinations complete in simulation; existing links remain `/portfolio` and `/world` (non-playable preview).

## Validation and limits

- Lint, TypeScript and production build PASS.
- Website unit tests: 92 PASS, no failures/skips.
- All quest tests plus website HTTP tests: 92 PASS, no failures/skips (79 quest unit tests and 13 HTTP checks).
- All 42 source-avatar crop/alpha/alignment/dimension/byte checks PASS.
- All 110 out-of-scope task-baseline hashes remain unchanged, including protected Portfolio source/assets and the other route implementations. No automation or dependencies changed.
- Diff whitespace check PASS.
- Live native Chrome: original scene rendered, proportions inspected, Tab reached Portfolio with visible focus and floating label reveal. The observed idle greeting remained associated with the current scripted guide. Browser screenshots were emitted in the conversation. No fresh final mobile/tablet/zoom/reduced-motion or complete video matrix is claimed. Existing simulated path/camera/geometry tests do not substitute for those visual checks.
- Four new classic regressions protect recovered files, original geometry/palette, mobile/desktop camera math, bounded wandering, both entry sequences and avatar-to-pet proportions.

## Preview and recovery

http://127.0.0.1:3100/quest-preview is running locally. Reload to see the recovered classic scene. If stopped, run `npm run build` and `npm run start -- --hostname 127.0.0.1 --port 3100`.

Pre-change archive: `.local-snapshots/quest-classic-restore/before-1794474614131641000.tar.gz`. Previous uncommitted work and review snapshots are preserved. No installation, paid service, commit, push, merge or deployment.

## Exact changed files

Compared with the immediately preceding snapshot (this report is additional):

- `app/quest-preview/page.tsx`
- `app/quest-preview/quest-preview.css`
- `components/quest-preview/experience.tsx`
- `components/quest-preview/scene.tsx`
- `lib/quest-preview/city-camera.ts`
- `lib/quest-preview/city-layout.ts`
- `lib/quest-preview/classic/palette.ts`
- `lib/quest-preview/classic/world.ts`
- `lib/quest-preview/destination-transition.ts`
- `lib/quest-preview/palette.ts`
- `lib/quest-preview/scene-config.ts`
- `lib/quest-preview/variants.ts`
- `lib/quest-preview/world.ts`
- `public/quest-preview/classic-day.webp`
- `public/quest-preview/classic-night.webp`
- `tests/fixtures/quest-classic-preserved.json`
- `tests/quest-actors.test.mjs`
- `tests/quest-classic.test.mjs`
- `tests/quest-preview-http.test.mjs`
