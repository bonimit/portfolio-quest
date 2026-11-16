# Destination focal points and palettes — 2026-11-14

Supersedes the prior New Destination Scenes art-direction pass. Only the new destination collection changes. Current City and Season sources, all 22 current fallback images, current geometry and current color values remain unchanged. The original island mesh and its rock pigment remain identical. Its top ground colors can vary in the new destinations to support the approved new palettes.

Owner references guide shape, color and composition only; none of the supplied photographs are copied into the website. These remain stylized, condensed tourist-inspired miniatures. The isolated sea-stack reference informs Krabi's limestone shapes without claiming a literal recreation of that photographed location.

## Implemented art direction

- Central Park: larger Belvedere-inspired castle and Bow Bridge/lake; smaller distant skyline, trees and visitor pavilion. The reference's foreground landmark/background skyline hierarchy is the goal.
- NYC summer: replaced Coney Island amusement geometry entirely with an outdoor movie lawn, large cinema screen, original abstract graphic, projection booth, picnic blankets and festoon lights. No film imagery, event schedule or licensing claims. The old internal `coney` identifier is retained for collection compatibility, but the visible title is Movies in Central Park and no wheel/Parachute Jump remains.
- Okinawa: replaced the village composition with a tapered turquoise surf break, white foam crest, small original surfer, surfboard rack and low beach huts. The wave is static geometry; no wave animation or surfing gameplay is implied.
- Krabi: one tall irregular weathered sea stack, lower flanking cliffs, foliage ledges, turquoise bay and small boats. Limestone uses its own destination pigment; the island's original rock color is untouched.
- Chiang Mai / Doi Inthanon: a larger foreground ivory royal chedi, smaller distant lavender companion, tiered bases, gold finials, garden pool/bridge and low mountain backdrop. No snow.
- High Line: more vertical separation for the elevated planted railway and a quieter rear skyline.
- Rockefeller: stronger central holiday tree, lower peripheral towers and an ice-blue/burgundy/gold palette.
- Kyoto: one dominant cherry tree against a quieter smaller canal-side canopy; blush, dark timber and blue-gray water.
- Nikko: taller waterfall against a reduced mountain mass; vermilion, burnt orange and cool water.
- Niseko: preserves its already dominant Yotei-inspired snow cone; glacial blue/white contrasts with warm timber and orange lift accents.
- Canal market: larger market canopy and one featured boat, smaller accompanying boats; jade, terracotta and produce-yellow accents.

Eleven distinct material palettes are applied consistently to live WebGL and generated fallback art. Current City and Season variants bypass these overrides. Existing sky/lighting, camera angles, original base, approach corridors, door targets, entry animations, avatar/pets, chat, controls and other pages retain their behavior.

## Exact files changed

- `lib/quest-preview/restored/places.ts`
- `lib/quest-preview/restored/place-scenes/new-york.ts`
- `lib/quest-preview/restored/place-scenes/japan.ts`
- `lib/quest-preview/restored/place-scenes/thailand.ts`
- `lib/quest-preview/restored/place-scenes/palette.ts` (new)
- `lib/quest-preview/palette.ts` (guarded new-destination palette adapter only)
- `scripts/prepare-restored-quest-preview.mjs` (same palette adapter for generated art)
- `tests/quest-destination-refresh.test.mjs`
- `assets/quest-preview/restored/places-manifest.json`
- `public/quest-preview/destination-review.html`
- This report.

Regenerated exactly these 22 files in `public/quest-preview/restored/`:

| Day | Night |
| --- | --- |
| `place-centralpark-day.webp` | `place-centralpark-night.webp` |
| `place-coney-day.webp` | `place-coney-night.webp` |
| `place-highline-day.webp` | `place-highline-night.webp` |
| `place-rockefeller-day.webp` | `place-rockefeller-night.webp` |
| `place-kyoto-day.webp` | `place-kyoto-night.webp` |
| `place-okinawa-day.webp` | `place-okinawa-night.webp` |
| `place-nikko-day.webp` | `place-nikko-night.webp` |
| `place-hokkaido-day.webp` | `place-hokkaido-night.webp` |
| `place-canalmarket-day.webp` | `place-canalmarket-night.webp` |
| `place-krabi-day.webp` | `place-krabi-night.webp` |
| `place-inthanon-day.webp` | `place-inthanon-night.webp` |

Recovery snapshot: `.local-snapshots/quest-destination-focal-before/baseline.tar.gz`. All existing snapshots and uncommitted work retained. Protected Portfolio and automation were not edited.

## Actual validation

- Lint, typecheck, production build and whitespace check passed.
- Unit tests: **92 passed**, including protected Portfolio hashes.
- Quest/website HTTP tests: **131 passed**, zero failures/skips.
- Focused destination tests: **11 passed** (included in the above suite).
- Regression coverage includes all 39 protected current-scene files, current geometry hashes, identical rocky base mesh, transparent image borders/no clipping, both destination entry simulations across eleven places, eleven unique palettes, identical live/fallback color values, unchanged current palette values and unchanged rock color.
- Scene geometry: **7974–14730 triangles**; 22 images total **937200 bytes**. No dependencies or animation loops added.
- Inspected generated day artwork for Central Park, movie lawn, Okinawa, Krabi and Inthanon; rechecked the revised tapered surf break and unoccluded pagodas. These are geometry-derived CPU renders, not live browser screenshots.
- Gallery returns HTTP 200. Native browser actions were stopped by concurrent owner activity; no fresh live WebGL, mobile, touch, zoom, keyboard or reduced-motion visual approval is claimed. Existing interaction code is preserved and simulation/route checks pass.

## Review

Comparison: `http://127.0.0.1:3100/quest-preview/destination-review.html`.

Interactive: `http://127.0.0.1:3100/quest-preview` → Scene controls → Scene set → New destination scenes. The default remains the preserved Current City Tokyo autumn scene.

Owner review remains necessary for hierarchy, saturation, recognizability and intended-size live framing. The miniature buildings and geography are deliberately simplified. No installation, paid service, commit, push, merge or deployment.

## Hudson shoreline correction

Replaced the High Line destination's rectangular water box with a tapered curved river surface, a slim curved stone quay and subtle ripples. Pier and boat remain; the adjacent tree moves onto dry ground. Original island mesh and all other scene layouts remain unchanged.

Task files: `lib/quest-preview/restored/place-scenes/new-york.ts`, `public/quest-preview/restored/place-highline-day.webp`, `public/quest-preview/restored/place-highline-night.webp`, `assets/quest-preview/restored/places-manifest.json`, and this report. Snapshot: `.local-snapshots/quest-hudson-shore-before/baseline.tar.gz`.

Lint, typecheck, build, eleven focused destination tests and whitespace check passed. SHA-256 comparison confirms 48 other artwork files unchanged after regeneration. Inspected the updated day render directly; no new live browser/mobile visual approval is claimed. Preview restarted at the existing localhost URL.
