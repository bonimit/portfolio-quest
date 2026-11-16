# Tokyo persimmon preview rollback

2026-11-12, branch `website/implementation`.

Latest owner direction supersedes the tower-and-ruins style selection and the attempted earlier-city restoration. The owner identified the Tokyo autumn version with persimmon (kaki) fruit, before the request for separate seasonal scenes. Recovered the 2026-11-12 09:38 `quest-season-scenes-before-2026-11-12.tar.gz` preview. The actual `tokyo-seasons.ts` contains modeled kaki fruit with stems/calyces and a harvest basket. Its spring blossoms, large Fuji and winter skier are also restored.

Activated the complete saved preview in isolated `restored/` folders so later city, classic and cinematic work remains recoverable without being deleted or rewritten. The page imports the restored experience and the route CSS is restored from that snapshot. Module imports and asset URLs were adjusted for isolation. The only intentional presentation/config differences are: start at Tokyo autumn/day, Auto tour Off for owner inspection, smaller pets so the avatar remains larger, and the Bangkok rainy-season label reads Monsoon. Source avatar art, shared guide code, `/portfolio`, other routes, automation and dependencies remain untouched.

The restored set has 11 city-season scenes and 22 day/night variants: NYC and Tokyo each spring/summer/autumn/winter, Bangkok monsoon/summer/winter. Previous/Next controls visit the set; Auto tour can be enabled explicitly. Current path links remain Portfolio → `/portfolio` and Adventure Preview → `/world`. Restoring this earlier preview also restores its older destination/guide behavior; the later GPU doorway cinematic is preserved in dormant source, not presented as active. This is an owner comparison rollback, not a new approval claim.

Validation: lint/typecheck/build PASS; 92 website unit tests PASS; all quest unit/HTTP tests plus website HTTP tests total 97 PASS (zero failures/skips). New restored-preview regressions check every city-season/day-night asset, finite geometry, tour wrap, monsoon label, actual modeled autumn fruit, selected starting scene and retained pet scaling. All 110 out-of-scope pre-task baseline hashes match; diff whitespace check passes. Native desktop Chrome visibly showed Tokyo Autumn 7/11 with Fuji, orange fruit, the earlier island composition, avatar taller than pets and Auto tour Off. Fresh mobile/tablet, touch, reduced-motion and full transition video checks remain unverified.

Preview: http://127.0.0.1:3100/quest-preview. Production server is running locally. Reload to see Tokyo autumn; Auto tour is intentionally Off. No installation, commit, push, merge or deployment. Pre-rollback snapshot: `.local-snapshots/quest-persimmon-restore/before-*.tar.gz`. Earlier snapshots remain. Current recovered-file hashes are in `current-files.json` alongside that archive.

## Activated recovered files (54)

- `app/quest-preview/quest-preview.css`
- `components/quest-preview/restored/actors.tsx`
- `components/quest-preview/restored/experience.tsx`
- `components/quest-preview/restored/guide.tsx`
- `components/quest-preview/restored/idle-prompt.tsx`
- `components/quest-preview/restored/pets.tsx`
- `components/quest-preview/restored/scene-controls.tsx`
- `components/quest-preview/restored/scene.tsx`
- `lib/quest-preview/restored/actors.ts`
- `lib/quest-preview/restored/building-interaction.ts`
- `lib/quest-preview/restored/chat-composer.ts`
- `lib/quest-preview/restored/city-details.ts`
- `lib/quest-preview/restored/clouds.ts`
- `lib/quest-preview/restored/guide-gait.ts`
- `lib/quest-preview/restored/map-orbit.ts`
- `lib/quest-preview/restored/math.ts`
- `lib/quest-preview/restored/palette.ts`
- `lib/quest-preview/restored/pet-sprites.ts`
- `lib/quest-preview/restored/renderer.ts`
- `lib/quest-preview/restored/scene-transition.ts`
- `lib/quest-preview/restored/season-details.ts`
- `lib/quest-preview/restored/tokyo-seasons.ts`
- `lib/quest-preview/restored/variants.ts`
- `lib/quest-preview/restored/world.ts`
- `public/quest-preview/restored/autumn-day.webp`
- `public/quest-preview/restored/autumn-dusk.webp`
- `public/quest-preview/restored/bangkok-raining-day.webp`
- `public/quest-preview/restored/bangkok-raining-night.webp`
- `public/quest-preview/restored/bangkok-summer-day.webp`
- `public/quest-preview/restored/bangkok-summer-night.webp`
- `public/quest-preview/restored/bangkok-winter-day.webp`
- `public/quest-preview/restored/bangkok-winter-night.webp`
- `public/quest-preview/restored/frost-day.webp`
- `public/quest-preview/restored/frost-dusk.webp`
- `public/quest-preview/restored/meadow-day.webp`
- `public/quest-preview/restored/meadow-dusk.webp`
- `public/quest-preview/restored/nyc-autumn-day.webp`
- `public/quest-preview/restored/nyc-autumn-night.webp`
- `public/quest-preview/restored/nyc-spring-day.webp`
- `public/quest-preview/restored/nyc-spring-night.webp`
- `public/quest-preview/restored/nyc-summer-day.webp`
- `public/quest-preview/restored/nyc-summer-night.webp`
- `public/quest-preview/restored/nyc-winter-day.webp`
- `public/quest-preview/restored/nyc-winter-night.webp`
- `public/quest-preview/restored/pets/capybara.webp`
- `public/quest-preview/restored/pets/cat.webp`
- `public/quest-preview/restored/tokyo-autumn-day.webp`
- `public/quest-preview/restored/tokyo-autumn-night.webp`
- `public/quest-preview/restored/tokyo-spring-day.webp`
- `public/quest-preview/restored/tokyo-spring-night.webp`
- `public/quest-preview/restored/tokyo-summer-day.webp`
- `public/quest-preview/restored/tokyo-summer-night.webp`
- `public/quest-preview/restored/tokyo-winter-day.webp`
- `public/quest-preview/restored/tokyo-winter-night.webp`

Additional changes: `app/quest-preview/page.tsx` selects the restored experience; `tests/quest-preview-http.test.mjs` validates active restored URLs/content; `tests/quest-restored-preview.test.mjs` adds restoration regressions; this report records the final active choice. Prior attempted collection changes remain in their isolated modules and recovery snapshots for comparison; they are not the active preview.


## Follow-up: city elements with ruins-style base

Owner clarified that the restored buildings and seasonal elements should stay, while the floating base should resemble the ruins version. Replaced only `island()` in `lib/quest-preview/restored/world.ts` using the recovered classic profile: sedimentary rock layers, a tapered underside down to −8.3 world units and detached rock fragments. Kept the restored city's wider 14 × 11.6 footprint so every building/path retains its location. All code outside that function matches its pre-change hash; a regression protects this. Camera, CSS, controls, source avatar art and city/season details are unchanged by this follow-up.

Added `scripts/prepare-restored-quest-preview.mjs` to regenerate only the active isolated fallback artwork; all 22 files under `public/quest-preview/restored/` now show the deeper base. The matching asset manifest is `assets/quest-preview/restored/manifest.json`. Added `tests/fixtures/quest-restored-elements-preserved.json` and extended `tests/quest-restored-preview.test.mjs`. Earlier artwork remains in `.local-snapshots/quest-restored-rock-base/before-*.tar.gz`.

Actual checks: lint/typecheck/build PASS; 92 website unit tests and 98 quest/HTTP tests PASS, no failures/skips; all 22 refreshed assets match manifest byte sizes; all 110 out-of-scope task-baseline files remain unchanged; diff check PASS. Desktop native Chrome showed Tokyo autumn's existing Fuji, buildings, persimmons, paths and pets on the visibly deeper rocky underside. Fresh mobile/tablet/zoom and comprehensive interaction checks remain unverified. No commit, push, merge, deployment, installation or protected Portfolio changes.
