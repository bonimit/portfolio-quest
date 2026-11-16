# Seasonal scene redesign — 12 November 2026

Implemented only in `/quest-preview` on `website/implementation` after owner
feedback that previous small props still looked identical. Preserved `/portfolio`,
original entrance, navigation, arrow-free floating labels, chat, orbit camera,
transitions, sprite artwork, avatar/pet movement, automation and all existing
uncommitted work. Recovery snapshot:
`.local-snapshots/quest-season-scenes-before-2026-11-12.*` (170 baseline files).

## Larger seasonal compositions

| City | Season | Main new scene features |
|---|---|---|
| NYC | Spring | Pink blossom crowns, large flower banks, tall white garden trellises, fresh green park |
| NYC | Summer | Enlarged pool, poolside deck, loungers, oversized parasols, deep green canopy |
| NYC | Autumn | Two large striped harvest stalls, pumpkin displays, copper foliage and ochre ground |
| NYC | Winter | Large ice rink with full perimeter rail, snowman, snowy surroundings |
| Tokyo | Spring | Broad hanami picnic islands, low tea tables, large lantern posts and larger blossoms |
| Tokyo | Summer | Prominent festival tower with red/white banners and lanterns, lily pond |
| Tokyo | Autumn | Enlarged pond with arched vermilion bridge, orchard harvest stall, saturated maple red |
| Tokyo | Winter | Deep garden snowdrifts, snowman, broad snow-covered studio roofs; existing Fuji/skier retained |
| Bangkok | Raining | Wide canal gardens, raised timber boardwalk, shelter canopy and boat vignette |
| Bangkok | Summer | Green fountain garden, fruit stall, large yellow flowering bank |
| Bangkok | Cool season | Pale market canopy, substantial lantern pavilion, dry golden terrain; no snow |

The city landmarks remain consistent, while the side gardens and silhouettes now
change substantially. These are original stylized compositions, not literal maps
or playable skating/skiing/festival activities. Fixtures/figures are scenic.

Moved the bench onto dry ground in scenes with enlarged ponds/rinks. Fixed the
snow-cap offset to avoid coincident roof surfaces. Frozen water uses a pale blue
palette and skips the live water-ripple highlight. Optimized tiny blossom centers
from full round meshes to small flat gold centers to fund larger scenery without
increasing the existing 24,000-triangle budget.

## Verification

- Lint, TypeScript and production build passed; 11 static pages generated.
- Existing unit suite: 92/92 passed. Preview suites: 50/50 passed, 142 total.
- Two new regression checks cover large bounded installations across both side
  gardens and actual decoded image differences for all 15 within-city pairs.
  Every pair changes at least 30% of shared visible daytime pixels, measured after
  resizing to 320 × 218 with RGB distance >24. This is an image-change guard,
  not a measure of beauty or proof of owner approval.
- Existing night-luminance checks pass for all 11 day/night pairs. Existing camera,
  orbit framing, route, conversation and protected-file checks also pass.
- Guide asset checks: 42 passed. All 28 protected Portfolio/avatar hash entries
  matched their fixtures. HTTP suites: 12/12 passed. `git diff --check` passed.
- All 22 fallback illustrations regenerated and reviewed in labeled day/night
  contact sheets. Total 1,197,730 bytes; largest 72,348 bytes. Maximum geometry:
  21,123 triangles. No new package, external artwork or service.
- The initial image comparison still found Bangkok summer/cool-season too close
  (21.2% pixel-change ratio). Separated summer greenery from dry-season terrain,
  regenerated and passed the 30% guard for every pair.
- Rendered review caught a bench intersecting the enlarged pond and a snow roof
  offset needing adjustment; both were corrected before final generation/build.
- No fresh live WebGL/responsive inspection completed this pass: the native browser
  was in active use on another page. Generated-art review is not a browser test.
  Physical device, reduced-motion, complete orbit occlusion and animation/transition
  checks remain owner QA items. Existing logic is preserved and its tests pass.

## Review artifacts and preview

- Day contact sheet: `.local-snapshots/quest-season-scenes-day-review.png`
- Night contact sheet: `.local-snapshots/quest-season-scenes-night-review.png`
- Running local preview: http://127.0.0.1:3100/quest-preview

Use Previous/Next to compare each season immediately, or Auto tour for the existing
16-second loop. If needed, restart with:
`npm run start -- --hostname 127.0.0.1 --port 3100`.

## Exact changed files

- `assets/quest-preview/manifest.json`
- `docs/QUEST_SEASON_SCENES_REVIEW.md`
- `lib/quest-preview/palette.ts`
- `lib/quest-preview/renderer.ts`
- `lib/quest-preview/season-details.ts`
- `lib/quest-preview/tokyo-seasons.ts`
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
- `tests/quest-season-scenes.test.mjs`

No commit, push, merge or deployment.
