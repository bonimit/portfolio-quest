# Isometric scene polish — 12 November 2026

Scoped to the isolated `/quest-preview`, on `website/implementation`.
Preserved the orange Portfolio, original entrance, shared guide, character/pet
art, movement, routing, controls, existing review snapshots and automation.
Recovery snapshot: `.local-snapshots/quest-isometric-polish-before-2026-11-12.*`
(156 baseline file hashes plus recoverable archive).

## Diagnosis and repairs

- Clouds previously reused irregular foliage geometry with compressed heights,
  constant lighting and per-vertex drift. Replaced them with four overlapping,
  closed ellipsoids per cloud, analytic smooth normals, clean tonal surfaces and
  soft directional light. Entire clusters drift together, avoiding deformation.
- All three cloud silhouettes are inset from camera edges. Added regression
  coverage across 320–2560px widths, short/tall heights, camera focus/parallax and
  the complete drift range. These are mathematical camera tests, not full browser
  coverage for every viewport.
- Foliage's non-periodic displacement left a longitude seam. Made its scallop
  periodic so rounded trees, flowers and rocks close cleanly. Kept their original
  sculpted character and the distinct architecture in each city.
- Island cliff layers used inconsistent neighboring heights. Reused shared ring
  vertices to close cracks without changing the island footprint or landmarks.
- Waterfall foam accidentally used cloud material and inherited cloud drift.
  It now uses water material and a small offset to keep its surface visible.
- Updated the CPU fallback rasterizer to interpolate normals for rounded foliage
  and clouds, matching live shading more closely. Regenerated all 22 WebP assets.
  Total 1,184,248 bytes; largest 70,126 bytes; dimensions remain 1440 × 980.
- Maximum city geometry: 19,251 triangles, below the existing 24,000 budget.
  No new dependency, render loop, external art or asset download.

## Actual validation

- `npm run lint`: passed, zero warnings.
- `npm run typecheck`: passed.
- `npm run build`: passed, all 11 static pages generated.
- `npm run test:unit`: 92/92 passed.
- `node --test tests/quest-preview.test.mjs tests/quest-actors.test.mjs tests/quest-isometric.test.mjs`: 33/33 passed, including four new mesh/bounds/material regressions.
- `npm run test:assets`: 42 measured guide-frame checks passed.
- HTTP suites `website-http` + `quest-preview-http`: 12/12 passed against local production server.
- All 28 protected Portfolio/avatar hash entries matched their fixtures.
- `git diff --check`: passed.
- One preview test run overlapped asset generation and saw the old manifest;
  rerun after generation completed passed all 33 tests. No failing test remains.

Live native Chrome on the local production build: inspected 1440px desktop at
high DPI, responsive 768 × 800 and 320 × 800. Clouds remained complete and clear
of path labels. Inspected day/night lighting and visible seasonal transition;
rounded cloud silhouettes and terrain edges remained coherent. Confirmed reduced
motion disables automatic touring, retains static clouds and hides the redundant
pause control. Restored normal emulation; pointer pause changed to Resume world,
and Space resumed it. Console showed existing preload warnings, no error counter.
Screenshots were viewed during inspection, not saved as evidence files.

Also inspected generated NYC spring/day, Tokyo winter/day and Bangkok rain/night
illustrations. Full city/season/browser/GPU matrix, physical touch devices and
measured GPU profiling were not repeated in this focused pass. Architecture and
terrain retain intentional facets; this is stylized procedural art and still
needs owner art-direction review, rather than a claim of photorealism or approval.

## Preview

Local production server: http://127.0.0.1:3100/quest-preview
Restart if needed: `npm run start -- --hostname 127.0.0.1 --port 3100`

## Exact files changed in this pass

- `assets/quest-preview/manifest.json`
- `docs/QUEST_ISOMETRIC_POLISH_REVIEW.md`
- `lib/quest-preview/clouds.ts`
- `lib/quest-preview/renderer.ts`
- `lib/quest-preview/world.ts`
- `public/quest-preview/bangkok-raining-day.webp`
- `public/quest-preview/bangkok-raining-night.webp`
- `public/quest-preview/bangkok-summer-day.webp`
- `public/quest-preview/bangkok-summer-night.webp`
- `public/quest-preview/bangkok-winter-day.webp`
- `public/quest-preview/bangkok-winter-night.webp`
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
- `tests/quest-isometric.test.mjs`
