# Three urban worlds — implementation review

2026-11-12 · `website/implementation` · `/quest-preview` only.

## Result

Replaced the earlier garden/pier/alpine seasonal compositions with three urban
districts. Their ground plans, building arrangements, camera compositions and
pedestrian routes differ. This milestone uses one recognizable district per city
with physical seasonal variants, rather than eleven unrelated destinations.

| World | Composition and environmental details | Path destinations |
| --- | --- | --- |
| NYC | Thin Manhattan street-block cutaway; asphalt avenues, zebra crossing, brownstone stoops, fire escapes, cornices, rooftop tank, stepped skyline, taxi, pocket park and subway stairs | Brownstone → `/portfolio`; subway → `/world` |
| Tokyo | Asymmetric neighborhood plot; narrow alleys, layered shops and balconies, tiled atelier, contemporary studio, rail line, local train, crossing gates, warning lights, overhead wires, vertical signage, vending machine and distant Fuji | Atelier → `/portfolio`; studio → `/world` |
| Bangkok | Separate riverside quays, back-bank shophouses, timber landing, canal water, long-tail boats, covered boat, colonnade, ferry pavilion, temple spires, palms, market stall and tuk-tuk | Shophouse → `/portfolio`; ferry pier → `/world` |

All signage is original geometric lettering. No external character art, fonts,
textures, services or dependencies were added. The existing sprite artwork and
guide/pet scale relationship are preserved.

## Variants

- NYC: Spring/Summer/Autumn/Winter × Day/Night = **8**.
- Tokyo: Spring/Summer/Autumn/Winter × Day/Night = **8**.
- Bangkok: Rainy/Summer/Northern-inspired Winter × Day/Night = **6**.
- Total: **22** GPU themes and regenerated 1440×980 WebP fallback illustrations.

Seasonal changes include blossom trees and flower beds; leafy summer planting and
park water; maple foliage, fallen leaves, harvest/persimmon displays; actual snow
roof geometry, banks, bare trees, snowy train/shelters, frozen park water and a
larger snowy Fuji. Tokyo summer adds lantern strings and a festival stall.
Bangkok monsoon adds rain canopies, shutters, puddles and sandbags; summer adds
parasols; its cool-season variant adds lantern strings, flowers and smaller palms.
Snow/rain compositor layers remain bounded and stop with reduced motion. Bangkok
does not receive snow. The Northern Thailand option is explicitly an inspired
festival mood within this stylized riverside setting, not a claim of Bangkok snow
or geographically exact northern architecture.

Day/night use different key/fill illumination, softer moon shadows, sky colors,
cloud luminance and warm entry/window/sign/lantern light. Entry bounce lighting
now follows the actual city destinations in both GPU and CPU renderers.

## Cameras, movement and interaction

`CITY_LAYOUTS` defines each district's pedestrian rectangles, home positions,
wander loops, building footprints and authored door approaches. The guide and
pets reset to that city's safe homes when the city changes. They follow the
existing virtual animation clock and distance-based sprite gait; the original
source atlas and shared guide motion files are untouched.

The avatar walks to the chosen city's door before the existing entry fade and
canonical navigation. Cancellation retraces the actual route. Selecting another
path during a walk or after cancellation returns through the pedestrian route
instead of cutting through building lots. This is authored preview movement, not
a general-purpose collision/pathfinding engine or playable RPG.

Finite city arrivals:

- NYC: leftward approach, slightly elevated camera, **1450ms**.
- Tokyo: opposite yaw approach with a flatter view, **1700ms**.
- Bangkok: elevated river/quay view and a descending approach, **1850ms**.

They use a cubic settle and the existing **1100ms** outgoing-frame dissolve. A
short character opacity arrival accompanies city changes. Reduced motion uses
the settled camera and immediate native path navigation. Pause uses a settled
camera. Orbit remains bounded; its effective angle is capped to keep destination
targets separate. GPU scenery, DOM targets and fallback illustrations use the
same city camera projection.

Primary Portfolio/Adventure labels are always visible. Desktop labels are aligned
to the map edges, clear of the architecture; compact layouts retain the upper
path row. Building annotation hover/focus behavior remains restrained. Mouse,
touch and keyboard handlers, Reset view, native links, 10-second inactivity
greeting, pause controls and the right-side scripted conversation are preserved.

## Geometry and quality corrections

- Ground uses ear-clipped polygons. The old origin-based fan incorrectly covered
  space outside offset quays and created overlapping surfaces. Offset/concave
  area and vertex regression tests now guard this.
- Separated canal/land elevations and non-overlapping promenade strips eliminate
  the observed striped/coplanar terrain artifact in the final fallback render.
- Corrected inward-facing pitched-roof normals, which made snowy roofs too dark.
  A dedicated regression checks sky-facing roof normals.
- Geometry remains batched with a static shadow pass; no per-building React
  components, new animation library or React frame loop were introduced.
- Per-scene geometry: **10,078–15,370 triangles**, below the existing 24,000 budget.
- WebPs: **49,548–84,714 bytes** each; **1,328,542 bytes** across all 22. Only the
  current fallback is mounted, not a preload of the complete tour.

## Actual checks

| Check | Result |
| --- | --- |
| `npm run lint` | Pass, zero warnings |
| `npm run typecheck` | Pass |
| `npm run build` | Pass, 11 static pages |
| Existing unit suite | 92/92 pass |
| Eight isolated Quest suites | 60/60 pass |
| `npm run test:assets` | 42 measured crops pass |
| Production HTTP suites | 12/12 pass, including all 22 assets and existing routes/404 |
| Protected Portfolio/avatar fixture hashes | 28/28 match |
| Baseline file comparison | No existing non-preview files changed |
| `git diff --check` | Pass |

New coverage includes three-minute wander simulations per city, both authored
entry routes, multiple cancellation points, mid-walk destination changes,
arrival-clock boundaries, reduced-motion arrival, complete geometry framing at
360/768/1280 camera sizes, physical seasonal geometry, no Bangkok snow, terrain
triangulation and roof normals. Existing rotated target checks now use the actual
city cameras. City-to-city structural and decoded-image comparisons guard against
the shared-island problem. The prior seasonal structural/pixel threshold was
updated to compare cities for this brief; physical seasonal variants are checked
separately. Numerical projection checks are not browser layout approval.

React review: city-specific simulation reinitialization includes pause/pet effects
so a new driver cannot remain frozen; timers, observers, animation handles and
renderers retain cleanup. High-frequency poses/projections stay in refs and DOM
transforms. Heavy geometry remains deferred with the renderer. Native path links
retain accessible names and direct destinations.

## Captures and browser evidence

The final **CPU-rendered comparison artifacts** are here. These show the actual
procedural geometry/city camera and lighting, without the DOM interface or sprites;
they must not be described as browser screenshots:

- `.local-snapshots/quest-three-worlds/day-night-comparison.png`
- `.local-snapshots/quest-three-worlds/nyc-day.png`
- `.local-snapshots/quest-three-worlds/nyc-night.png`
- `.local-snapshots/quest-three-worlds/tokyo-day.png`
- `.local-snapshots/quest-three-worlds/tokyo-night.png`
- `.local-snapshots/quest-three-worlds/bangkok-day.png`
- `.local-snapshots/quest-three-worlds/bangkok-night.png`
- `.local-snapshots/quest-three-worlds/all-seasons-day.png`
- `.local-snapshots/quest-three-worlds/all-seasons-night.png`

Inspected the six final city/time renders and the seasonal comparison sheets.
Local `refresh.mjs` in that artifact folder regenerates them from the WebPs.

During refinement, native Chrome provided **1280×800** captures of NYC summer
day/night and Tokyo summer day/night. Both primary labels were visible outside
the architecture; pause status, scene switching, day/night control, sprites and
city-specific sky/lighting were observed. These captures were emitted in the
tool conversation, not saved as browser screenshot files. The final terrain/roof
normal corrections were subsequently rebuilt and reviewed in the CPU renders;
fresh final browser captures remain outstanding.

The regular Chrome profile showed asynchronous extension-listener errors. An
isolated incognito check showed CSS preload warnings without that error counter.
Further native checks failed with `noWindowsAvailable`, changed browser windows
and a timeout/kernel reset. The dedicated browser host reports unavailable.
Unrelated owner pages were not modified. An automatic local-HTTP approval timed
out once; its permitted retry succeeded.

**Unverified:** final live Bangkok day/night captures; the complete three-city
desktop/mobile matrix; live chat-open path visibility; complete keyboard/touch,
200% zoom, screen-reader and reduced-motion browser checks; live arrival timing
and complete walk-to-navigation flows. These retain source/unit/HTTP coverage
only. Hardware/high-DPI performance and all-angle DOM sprite depth/occlusion also
need owner review. No build or numerical test result constitutes visual approval.

## Preservation and exact inventory

Recovery before editing: 181 baseline files in
`.local-snapshots/quest-three-worlds-before-2026-11-12.json` and `.tar.gz`.
Earlier snapshots and uncommitted work remain. `/`, `/portfolio`, `/world`, other
routes, original avatar/pet art, shared guide motion, global styles, package files
and `automation/` were not modified by this task.

New files:

- `lib/quest-preview/city-layout.ts`
- `lib/quest-preview/city-camera.ts`
- `lib/quest-preview/scenes/urban-kit.ts`
- `tests/quest-city-worlds.test.mjs`
- `docs/QUEST_THREE_WORLDS_REVIEW.md`

Modified source/support files:

- `app/quest-preview/page.tsx`
- `app/quest-preview/quest-preview.css`
- `components/quest-preview/actors.tsx`
- `components/quest-preview/scene.tsx`
- `lib/quest-preview/actors.ts`
- `lib/quest-preview/building-interaction.ts`
- `lib/quest-preview/palette.ts`
- `lib/quest-preview/renderer.ts`
- `lib/quest-preview/scene-config.ts`
- `lib/quest-preview/scenes/nyc.ts`
- `lib/quest-preview/scenes/tokyo.ts`
- `lib/quest-preview/scenes/bangkok.ts`
- `lib/quest-preview/scenes/kit.ts`
- `scripts/prepare-quest-preview.mjs`
- `tests/quest-actors.test.mjs`
- `tests/quest-orbit.test.mjs`
- `tests/quest-season-scenes.test.mjs`
- `assets/quest-preview/manifest.json`

Regenerated assets:

- `public/quest-preview/nyc-spring-day.webp`
- `public/quest-preview/nyc-spring-night.webp`
- `public/quest-preview/nyc-summer-day.webp`
- `public/quest-preview/nyc-summer-night.webp`
- `public/quest-preview/nyc-autumn-day.webp`
- `public/quest-preview/nyc-autumn-night.webp`
- `public/quest-preview/nyc-winter-day.webp`
- `public/quest-preview/nyc-winter-night.webp`
- `public/quest-preview/tokyo-spring-day.webp`
- `public/quest-preview/tokyo-spring-night.webp`
- `public/quest-preview/tokyo-summer-day.webp`
- `public/quest-preview/tokyo-summer-night.webp`
- `public/quest-preview/tokyo-autumn-day.webp`
- `public/quest-preview/tokyo-autumn-night.webp`
- `public/quest-preview/tokyo-winter-day.webp`
- `public/quest-preview/tokyo-winter-night.webp`
- `public/quest-preview/bangkok-raining-day.webp`
- `public/quest-preview/bangkok-raining-night.webp`
- `public/quest-preview/bangkok-summer-day.webp`
- `public/quest-preview/bangkok-summer-night.webp`
- `public/quest-preview/bangkok-winter-day.webp`
- `public/quest-preview/bangkok-winter-night.webp`

## Preview and remaining product work

http://127.0.0.1:3100/quest-preview — final production preview is running locally.
Use Previous/Next and Day/Night to compare. The tour still runs NYC → Tokyo →
Bangkok and displays On/Paused/Off. If restarting:

```sh
cd /Users/workspace/portfolio-quest-website
npm run build
npm run start -- --hostname 127.0.0.1 --port 3100
```

Owner review remains required for art direction, city/season storytelling, final
browser/device behavior and character depth. Architecture/signs are stylized,
not accurate real-city reconstructions. Adventure remains explicitly non-playable;
the conversation remains “Scripted guide · Not AI.” No installations, paid service,
commit, push, merge or deployment.
