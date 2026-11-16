# Quest preview: destination transitions and scene preservation

Date: 2026-11-12.

## Latest owner correction — deep original base

This section supersedes the earlier base-preservation statements below. The owner rejected the shallow base after the first restoration. Further archive inspection found that even the recovered seasonal scenes already used flattened slabs. The actual deeper organic island function was recovered from `quest-city-identity-before-2026-11-11.tar.gz`: 36 irregular segments, original layered rock, underside down to −6.8 world units, sedimentary shelves and detached fragments. `original-island.ts` preserves that function exactly except its exported name and a seasonal surface-material parameter. A regression checks its source body against an independently extracted archive hash and checks the actual lowest geometry point.

Both scene collections now use that original base. Buildings, path layouts, previous camera angle, labels, chat and destination transitions remain. Small paving/quay surfaces still use their existing local geometry. The current seasonal elements are retained: this is a base restoration, not a claim that the entire first tower-and-ruin scene has been restored. The earliest preview reference is `.local-snapshots/quest-preview-world-dusk.png`.

Fallback images/manifests are intentionally regenerated to match this owner-approved base correction; the old exact-byte assertion no longer applies to current images. Previous images and code remain recoverable in the additional `before-original-rock-base-*.tar.gz` archive. Source/art outside `/quest-preview` remains unchanged. New files for this correction: `lib/quest-preview/original-island.ts`, `tests/fixtures/quest-original-island.json`; affected helpers: both `scenes/kit.ts` files; generator now accepts explicit `--original`; scene preservation/envelope tests and fixtures are updated. The latest base still requires owner visual approval; earlier browser footage predates this correction. Fresh lint/typecheck/build pass; 92 website tests and 75 quest unit regressions pass (69 main + six scene/base preservation tests). The refreshed production preview runs at port 3100. No fresh live browser verification of this final deep-base correction is claimed. All 110 out-of-scope baseline file hashes still match.

Branch: `website/implementation`.

## Owner corrections implemented

The original 11 seasonal island scenes remain the default. Their four builder/helper sources were recovered from the earlier pre-three-world snapshot (relative imports adjusted only), together with original palette/configuration and all 22 day/night fallback images. Scene settings now offers **Original island scenes** and **New city islands**. The new 11 seasonal city scenes are additions, with 22 separately named `new-` fallback images and a separate manifest. Touring retains the chosen collection.

The old settled camera angle is restored: no new city-specific arrival yaw/pitch. New-city framing fits the taller buildings while retaining that angle. New islands have rounded organic outlines instead of square district slabs. The previous building-relative floating labels, restrained hover/focus reveal and mobile alternative are restored. Existing speech bubble and compact chat are retained.

## Destination sequence

Portfolio and Adventure use the same virtual-clock transition machine in either collection: turn, follow safe per-city waypoints, align at the door, enter/disappear, push through the portal, navigate to `/portfolio` or `/world`. Camera eye and target move in world space; there is no CSS zoom or full-screen wipe. The guide uses the existing alternating sprite frames, distance-based gait, measured foot baseline, one cached GPU texture, depth-tested building occlusion and floor shadow. Pets remain smaller and stop during the approach.

Duplicate activation is guarded. Native links remain usable; Enter and Space select paths. Cancel/Escape work before entry, with focus restored after inertness is removed; a direct Enter now link remains. Reduced motion, unavailable WebGL/atlas, paused motion or renderer failure use immediate navigation. Hidden-tab clocks do not catch up. GPU resources, observers, timers and listeners are cleaned up. Adventure remains a non-playable preview; the chat remains scripted, not AI.

## Preservation

Recoverable baselines remain under `.local-snapshots/quest-destination-transition/` (`before.tar.gz`, `before.json`, and `before-owner-island-feedback.tar.gz`). Earlier snapshots were preserved. No protected Portfolio source, original avatar artwork/shared animation source, other route implementation, automation or dependency files were changed by this task. All out-of-scope files tracked by the task baseline match their hashes. Unit checks also validate 19 protected Portfolio hashes and the existing avatar/core preservation fixture. Original-scene regression hashes cover four recovered sources and 22 fallback assets.

## Actual validation

- `npm run lint`: PASS, zero warnings.
- `npm run typecheck`: PASS.
- `npm run build`: PASS, all 10 app routes including custom not-found generated.
- `npm run test:unit`: 92 PASS, zero failures/skips.
- `node --test tests/quest-*.test.mjs tests/website-http.test.mjs`: 87 PASS, zero failures/skips (74 quest unit tests, four quest HTTP tests, nine website HTTP tests).
- `python3 tests/guide-assets.py`: all 42 crops/alpha bounds/feet baselines/dimensions/byte budgets PASS.
- `git diff --check`: PASS.
- All 44 scene fallback assets and their separate manifests pass geometry/HTTP tests. Transition mathematics cover both destinations in all three cities; camera continuity/framing covers 360, 768 and 1280px plus rotated camera positions. These are automated geometry checks, not live browser approval.

## Browser evidence and honest limits

The supplied Desktop recording was inspected using extracted contact/approach frames. Native Chrome confirmed the original NYC spring island at a 1280×800 CSS viewport and restored camera composition. A live original Tokyo spring → Portfolio transition was recorded: alternating walking frames, camera approach, back-facing door alignment, disappearance, forward push and final `/portfolio` were observed. The recording harness case selector still said NYC; the actual visible scene is **Tokyo**, so do not count this as an NYC recording.

Evidence: `.local-snapshots/quest-destination-transition/videos/nyc-portfolio-desktop-1794473656175.webm` (mislabelled case, actual Tokyo) and `video-contact.png` alongside the baseline files. Chrome recorded the real page through a local-only review harness; no rendered/synthetic video is presented as browser footage. The contact sheet contains only the available frames; unused grid cells are black.

A preceding live new NYC Adventure smoke test reached `/world`, before the final original/new collection split. It is historical smoke evidence, not final coverage of every scene. The final mobile recording attempt timed out and reset native control; subsequent app selection returned an unrelated owner window, so no further actions were taken there. The required complete 12 desktop/mobile destination video matrix, fresh keyboard/touch/reduced-motion runs and full day/night city screenshot matrix remain **unverified**. No visual approval is claimed. Final doorway framing (including posts briefly visible during the final push), foot placement across every seasonal mesh and the new-city art quality still need owner/Claude visual review.

## Preview and recording

Production preview: http://127.0.0.1:3100/quest-preview (server started locally). If stopped: `npm run build` then `npm run start -- --hostname 127.0.0.1 --port 3100`.

Choose Scene settings → Scene collection to compare originals and additions. Auto tour is shown explicitly and can be paused. Local recording harness: `node scripts/serve-quest-transition-review.mjs`, open http://127.0.0.1:3102. It records only the tab the visitor explicitly shares and saves under the local snapshot folder. It is not shipped as website UI. Stop sharing when finished. No installation, purchase, commit, push, merge or deployment occurred.

## Exact changed website/support files

Compared with the 186-file pre-task baseline, the following 84 files changed or were added. Original unprefixed images/manifest are restorations from the earlier approved-scene snapshot; `new-` images preserve the added city collection. This report is the additional 85th file. Local snapshots, logs and browser footage are review artifacts, not website assets.

- `app/quest-preview/page.tsx`
- `app/quest-preview/quest-preview.css`
- `assets/quest-preview/manifest.json`
- `assets/quest-preview/new-manifest.json`
- `components/quest-preview/actors.tsx`
- `components/quest-preview/experience.tsx`
- `components/quest-preview/scene.tsx`
- `lib/quest-preview/actors.ts`
- `lib/quest-preview/building-interaction.ts`
- `lib/quest-preview/city-camera.ts`
- `lib/quest-preview/city-layout.ts`
- `lib/quest-preview/destination-transition.ts`
- `lib/quest-preview/journey-drawing.ts`
- `lib/quest-preview/math.ts`
- `lib/quest-preview/palette.ts`
- `lib/quest-preview/renderer.ts`
- `lib/quest-preview/scene-config.ts`
- `lib/quest-preview/scenes/bangkok.ts`
- `lib/quest-preview/scenes/index.ts`
- `lib/quest-preview/scenes/kit.ts`
- `lib/quest-preview/scenes/nyc.ts`
- `lib/quest-preview/scenes/original/bangkok.ts`
- `lib/quest-preview/scenes/original/kit.ts`
- `lib/quest-preview/scenes/original/nyc.ts`
- `lib/quest-preview/scenes/original/palette.ts`
- `lib/quest-preview/scenes/original/scene-config.ts`
- `lib/quest-preview/scenes/original/tokyo.ts`
- `lib/quest-preview/scenes/tokyo.ts`
- `lib/quest-preview/variants.ts`
- `lib/quest-preview/world.ts`
- `public/quest-preview/bangkok-raining-day.webp`
- `public/quest-preview/bangkok-raining-night.webp`
- `public/quest-preview/bangkok-summer-day.webp`
- `public/quest-preview/bangkok-summer-night.webp`
- `public/quest-preview/bangkok-winter-day.webp`
- `public/quest-preview/bangkok-winter-night.webp`
- `public/quest-preview/new-bangkok-raining-day.webp`
- `public/quest-preview/new-bangkok-raining-night.webp`
- `public/quest-preview/new-bangkok-summer-day.webp`
- `public/quest-preview/new-bangkok-summer-night.webp`
- `public/quest-preview/new-bangkok-winter-day.webp`
- `public/quest-preview/new-bangkok-winter-night.webp`
- `public/quest-preview/new-nyc-autumn-day.webp`
- `public/quest-preview/new-nyc-autumn-night.webp`
- `public/quest-preview/new-nyc-spring-day.webp`
- `public/quest-preview/new-nyc-spring-night.webp`
- `public/quest-preview/new-nyc-summer-day.webp`
- `public/quest-preview/new-nyc-summer-night.webp`
- `public/quest-preview/new-nyc-winter-day.webp`
- `public/quest-preview/new-nyc-winter-night.webp`
- `public/quest-preview/new-tokyo-autumn-day.webp`
- `public/quest-preview/new-tokyo-autumn-night.webp`
- `public/quest-preview/new-tokyo-spring-day.webp`
- `public/quest-preview/new-tokyo-spring-night.webp`
- `public/quest-preview/new-tokyo-summer-day.webp`
- `public/quest-preview/new-tokyo-summer-night.webp`
- `public/quest-preview/new-tokyo-winter-day.webp`
- `public/quest-preview/new-tokyo-winter-night.webp`
- `public/quest-preview/nyc-autumn-day.webp`
- `public/quest-preview/nyc-autumn-night.webp`
- `public/quest-preview/nyc-spring-day.webp`
- `public/quest-preview/nyc-spring-night.webp`
- `public/quest-preview/nyc-summer-day.webp`
- `public/quest-preview/nyc-summer-night.webp`
- `public/quest-preview/nyc-winter-day.webp`
- `public/quest-preview/nyc-winter-night.webp`
- `public/quest-preview/tokyo-autumn-day.webp`
- `public/quest-preview/tokyo-autumn-night.webp`
- `public/quest-preview/tokyo-spring-day.webp`
- `public/quest-preview/tokyo-spring-night.webp`
- `public/quest-preview/tokyo-summer-day.webp`
- `public/quest-preview/tokyo-summer-night.webp`
- `public/quest-preview/tokyo-winter-day.webp`
- `public/quest-preview/tokyo-winter-night.webp`
- `scripts/prepare-quest-preview.mjs`
- `scripts/serve-quest-transition-review.mjs`
- `tests/fixtures/quest-original-scenes-preserved.json`
- `tests/quest-actors.test.mjs`
- `tests/quest-city-worlds.test.mjs`
- `tests/quest-destination-transition.test.mjs`
- `tests/quest-journey-drawing.test.mjs`
- `tests/quest-orbit.test.mjs`
- `tests/quest-preview-http.test.mjs`
- `tests/quest-scene-collections.test.mjs`
