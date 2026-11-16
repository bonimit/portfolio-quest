# Quest preview: city-scene refinement

Date: 2026-11-11. Branch: `website/implementation`.
Route: `/quest-preview`. This has **not** been promoted to `/`.

## What changed

The preview now has a shared city/season/time scene system with 22 supported
variants: New York City 8, Tokyo 8, Bangkok 6. The fork, island footprint,
camera, foreground guide plaza and destination coordinates stay consistent.
City identity comes from original procedural architecture and props rather
than three separate page layouts or downloaded city imagery.

| City | Details | Seasons, each with day/night |
| --- | --- | --- |
| NYC | Brownstone facade and entry stoop, alternating fire-escape flights, rooftop water tank, small rear skyline, iron subway-inspired gateway, pocket-park planting | Spring, Summer, Autumn, Winter |
| Tokyo | Compact studio building with layered eaves/lattice, dense rear buildings, overhead cable, generic street cabinet, torii-inspired gate and lantern approach | Spring, Summer, Autumn, Winter |
| Bangkok | Stilted river house, layered warm rooflines, market shelters/produce, palms, canal edge and timber crossing, open garden pavilion | Raining, Summer, Winter · Northern Thai mood |

Spring changes planting and adds scattered petals; autumn changes foliage and
adds fallen leaves; NYC/Tokyo winter adds snow banks and canopy caps. Bangkok
raining adds cool wet surfaces, puddles, restrained static rain marks, a shelter,
and overcast illumination. Bangkok winter uses a dry, northern-inspired palette
and hanging lanterns, **without snow**. These are stylized city-inspired scenes,
not geographic reconstructions or claims about Bangkok's actual winter climate.
No transit logos, commercial marks, reference images or religious character art
were copied.

The title is smaller and arranged on one line. The two signs and avatar are
smaller, their labels are city-aware, and the island underside is shallower.
The scene/location utility display identifies the current city, season and time.
City, Season and Time are ordinary labeled selects inside Scene settings.

The companion is a translucent field panel on the right at desktop sizes. Its
colors follow day/night atmosphere, with restrained edge lighting and an orange
connector. On narrow screens it becomes a right-aligned panel in normal document
flow. It retains the existing scripted answers, examples, message history,
focus return and disclosure. No real AI, external service or conversation changes
were introduced. Existing avatar artwork, atlas and walking logic are unchanged;
only preview-scoped rendered dimensions and surrounding layout changed. The arena
and sprite scale together, preserving the relationship between the existing
distance-based stride and visible movement; the caption below stays unscaled.

Desktop guide opening eases the world track narrower and keeps the two signs
inside that track. Short-height layouts put the sign row higher. At tablet/phone
widths the signs remain a sticky two-column row above the companion. The guide
has short opening/closing effects; pause/reduced-motion rules disable these,
camera animation and the grid transition. Daytime focus outlines and companion
control-border contrast were strengthened.

## Scene-system structure

- `variants.ts`: typed city/season/time vocabulary, city labels, supported seasons,
  default variant, all 22 combinations, stable asset IDs, valid city switching and
  the explicit no-snow-in-Bangkok rule. Default: Tokyo / Spring / Night.
- `world.ts`: shared terrain, fork, planting, water and sculpture primitives;
  three city landmark builders; seasonal geometry additions. There are 11
  city/season geometry configurations, reused across day/night.
- `palette.ts`: city and seasonal material colors plus actual daylight/night,
  wet-weather and city-dependent fill/sun/fog values. Orange/paper navigation
  identity remains independent of seasonal foliage.
- `renderer.ts`: retains the route-loaded native WebGL2 renderer, bounded camera,
  1.6 DPR / 2.8M-pixel cap, cached 1024px shadow pass, demand rendering, pause,
  reduced motion, visibility handling and context-loss fallback. Geometry is
  uploaded again only when city/season changes; time changes update uniforms.
- `prepare-quest-preview.mjs`: generates 22 fixed-camera transparent WebP
  fallbacks from the same geometry, with CPU depth/shadow buffers. Day/night
  pairs reuse preparation. No new dependency was installed.
- React uses one variant state shared by settings, labels, scene and fallback
  URL. Changing city keeps a supported season; an unsupported season becomes
  Summer, which is valid in all three cities. Time is retained.

Geometry ranges from 5,387 to 6,795 triangles. The 22 current 1440×980 fallback
files total 928,588 bytes; the selected variant is requested rather than loading
all 22. Exact dimensions, bytes and 11 geometry budgets are in the asset manifest.
The original six fallback images are retained unchanged as historical assets
and are no longer selected by the UI. Rain is deliberately not a continuously
simulated particle system. The illustrated fallback has no camera parallax or
environmental motion.

## Preservation

Before editing, a recoverable archive and SHA-256 manifest captured 126 existing
files under `.local-snapshots/quest-cities-before-2026-11-11.*`. The audit identifies
only the 10 intended preview-related files below as changed; 116 captured files
are unchanged. The protected 19-file Portfolio fixture and existing avatar art/
movement fixture also pass. Prior snapshots and uncommitted work remain intact.

No edits to `/`, `/portfolio`, `/world`, other destination pages, shared layouts,
shared CSS/components, package files, fonts, avatar assets/algorithms, or
`automation/`. The earlier `QUEST_PREVIEW_REVIEW.md` remains a historical report
of the initial six-theme milestone; this document describes its successor.

## Validation

| Command/check | Actual result |
| --- | --- |
| `npm run lint` | Pass, zero warnings |
| `npm run typecheck` | Pass |
| `npm run build` | Pass, all existing routes plus `/quest-preview` prerendered |
| `npm test` | 92 passed, zero failures/skips |
| `node --test tests/quest-preview.test.mjs` | 11 passed, zero failures/skips |
| `npm run test:assets` | Pass, all 42 existing measured avatar crops |
| `node --test tests/website-http.test.mjs tests/quest-preview-http.test.mjs` | 12 passed, zero failures/skips |
| Portfolio/atlas/movement hashes | Match protected fixtures |
| Pre-edit source audit | Only the 10 intended preview files changed |
| `git diff --check` | Pass |

New/updated tests cover the exact 8/8/6 combination counts, unique variant IDs,
city-switch normalization, the Bangkok snow exclusion, all geometry budgets and
finite coordinates, reuse across time variants, city/season material differences,
day/night illumination, 22 fallback headers/byte counts, control contrast,
camera/pixel budgets and preservation. HTTP checks include existing routes and
custom 404, preview noindex semantics, exactly two primary destination anchors,
all 22 assets, and valid City/Season/Time controls. No test or asset commands were
added to package.json; run the explicit commands above. Node's existing module
type warning remains; no global package metadata was changed to suppress it.

### Browser and visual evidence

Native Chrome successfully rendered the Tokyo spring/night scene, including
its geometry, shadows, planting and smaller avatar. Live screenshots verified
the right-side companion and honest scripted disclosure. City/season/time
controls were used to render NYC winter/day and Bangkok raining/night; switching
to Bangkok retained Winter and correctly labeled it Northern Thai mood before
Raining was selected. All three scenes retained their fork and both destinations.

| Live viewport / check | Actual observation |
| --- | --- |
| 1280×800 | Right-side note and both primary signs visible, without overlap |
| 1024×800 | Desktop split remains readable; both choices inside the world track |
| 768×800 | Right-aligned stacked note; two sticky signs stay above it while scrolling |
| 390×800 | Both choices readable; note and form fit beneath the world |
| 320×800 | Initial overlap between note and sticky-sign bottoms found; fixed stacking and two-column examples, then rechecked with both signs and disclosure fully visible |
| 320×388 (incidental short-height emulation) | Primary signs remained above the scrolling note; full note requires scrolling |
| Reduced motion | DevTools emulation was enabled successfully; scene/guide settings inspected, but a complete timing and keyboard walkthrough was interrupted |

The 320px repair was rechecked after the final mobile CSS change. Other viewport
observations were made during refinement, rather than a complete final-build
matrix rerun. The daylight heading's pale contrast was found in the NYC check
and corrected to ink/dark amber; colors are covered by contrast assertions, but
its final browser recheck was interrupted. Do not count that attempted recheck
as a pass.

Screenshots are present in the tool conversation; they are not saved browser
captures in the repository. NYC winter/day and Bangkok raining/night fallback
images were also inspected as **static generated illustrations**. The in-app
browser host was unavailable; native-browser work was intermittently interrupted
by active user input/tab changes. The inspected console showed shared CSS preload
warnings; it was not a comprehensive console audit.

Do not infer visual approval from automated checks. Real touch devices,
screen-reader speech, a fresh complete keyboard/touch walkthrough, 200% zoom,
1440/1920/2560px final-build checks, short desktop heights, forced WebGL
context-loss injection, sustained FPS/GPU/battery profiling, every variant at
every viewport, and a cross-browser matrix remain unverified. Previous milestone
viewport checks do not count as fresh verification of this redesign.

## Exact task files

Modified:

1. `app/quest-preview/quest-preview.css`
2. `assets/quest-preview/manifest.json`
3. `components/quest-preview/experience.tsx`
4. `components/quest-preview/scene.tsx`
5. `lib/quest-preview/palette.ts`
6. `lib/quest-preview/renderer.ts`
7. `lib/quest-preview/world.ts`
8. `scripts/prepare-quest-preview.mjs`
9. `tests/quest-preview-http.test.mjs`
10. `tests/quest-preview.test.mjs`

Added:

- `lib/quest-preview/variants.ts`
- `docs/QUEST_CITY_SCENES_REVIEW.md`
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

Ignored local-only recovery archives, SHA audit and result logs were added under
`.local-snapshots/`; ordinary ignored build/typecheck outputs were regenerated.

## Preview and owner decisions

Open `http://127.0.0.1:3100/quest-preview`. Use **Scene settings** to change city,
season and time, or switch to the illustrated fallback. The scene is still an
entrance: Portfolio opens the approved `/portfolio`; Adventure opens the existing
non-playable `/world`. The guide remains local and scripted.

To restart: `npm run build`, then
`npm run start -- --hostname 127.0.0.1 --port 3100`.
For development on another port:
`npm run dev -- --hostname 127.0.0.1 --port 3102` and open `/quest-preview` there.

Owner review is needed for city recognizability, architectural abstraction,
default city/season/time, nighttime brightness, proportions, mobile composition,
companion treatment and overall polish. No route promotion, commit, push, merge,
deployment, paid service or credentials were introduced.
