# Quest entrance preview — implementation and owner review

Date: 2026-11-11. Workspace: `/Users/workspace/portfolio-quest-website`.
Branch: `website/implementation`.

## Scope and preservation

The new experience lives only at `/quest-preview`, with `noindex, nofollow`
metadata. `/` has not been replaced. Portfolio still opens the existing
`/portfolio`; Adventure opens the existing `/world`, explicitly described as
“Preview · Coming soon · Not playable.” No prototype destination pages were
copied from the reference.

Before implementation, 96 existing source, documentation, configuration, asset,
and test files were captured in `.local-snapshots/quest-preview-before-2026-11-11.tar.gz`
and its SHA-256 JSON manifest. All 96 files still match that manifest. The
19-file protected Portfolio fixture and existing avatar movement/art fixture
also pass. Existing uncommitted work was retained. No existing file was edited
by this task, including package files, shared layouts/components/styles,
destination pages, avatar files, and automation. No packages were installed.

The preview's CSS hides shared header/footer chrome only under
`body:has(.quest-preview)`. Its content-width override is guarded by
`.main-content > section.quest-preview`. Both were checked when navigating into
the existing destinations: conventional destination navigation returns normally.

## Reference inspection and creative changes

The complete `portfolio-reference/3D-quest.html` was inspected, including its
Three.js r128 CDN setup, geometry/material builders, orthographic camera,
shadow map, floating-island landmarks, themes, continuous animation loop,
signs, avatar grid assumptions, conversation calls, responsive rules, and
embedded images/prototype destinations.

The retained concept is a miniature floating island with a fork between a
tower and ruins. This is a new implementation and original procedural art:

- Lobed terrain, stepped rock strata, hanging shelves and small fragments give
  the island a more intentional silhouette than a cylinder and cone.
- A flagstone fork connects a foreground guide plaza to an octagonal
  observatory with copper roof ribs, balcony, entry steps, inset windows and
  a small flag; the other branch leads to a broken arch, leaning relic,
  rubble, moss and a floating marker.
- Curated groves, ferns, flowers, a bench, lanterns, a pond, waterfall and cloud
  sculptures support the scene without random object scattering.
- Hemisphere fill, directional light, a static shadow map with filtered
  sampling, warm local bounce, depth fog and tone mapping establish daylight
  and blue-hour atmospheres. Meadow, copper autumn and first-snow variants
  change material palettes as well as illumination.
- Paper/orange signs remain native links. Hover and keyboard focus produce
  restrained emphasis and bounded camera easing. Ordinary navigation has a
  180 ms scene fade; modified clicks and paused/reduced-motion navigation use
  native link behavior. Escape cancels the pending fade and restores focus.
- On narrow layouts, the choices become a sticky two-column sign row rather
  than attempting to place small floating controls over the island.

No reference biography, contact details, project narratives, images, equal-cell
avatar atlas, host chat service, hash navigation or destination pages were reused.
The result still requires owner visual judgment; passing tests does not establish
that it is artistically better than the reference.

## Architecture, performance and fallback

There was no installed 3D engine. A route-loaded native WebGL2 renderer avoids
adding a dependency or external CDN. Geometry, palette, camera math, rendering
and React UI are separate modules. This small renderer is bespoke code and
therefore carries a maintenance/testing cost compared with an established engine.

- 6,389 triangles / 19,167 packed vertices in one static geometry buffer.
- One shaded scene draw per rendered frame; a separate 1024px depth pass is
  cached after initialization. No texture/model downloads for the scene.
- Device pixel ratio capped at 1.6; drawing buffer capped at 2.8 million pixels
  and the device's renderbuffer limit. Antialiasing/GPU driver allocations can
  still exceed that color-buffer budget; total GPU memory was not measured.
- Scene motion is limited to 30 fps during short initial and interaction
  bursts, then stops. Pause, reduced motion, offscreen and hidden-document
  handling stop ongoing scene rendering. Resize/settings changes can still
  request a single redraw. The reused guide retains its original walking
  scheduling; it is separate from the environment renderer.
- Shader/allocation/framebuffer failures and WebGL context loss select the
  illustrated fallback and release renderer resources. A failed context is
  retried by toggling illustrated view off again; there is no automatic retry
  loop.
- Six original 1440×980 WebP illustrations are CPU-rasterized from the same
  geometry, with a depth buffer and shadow map. Each is 47,612–52,406 bytes;
  all six total 300,926 bytes. Only the chosen illustration is displayed.
- The fallback preserves the same HTML choices and guide. It uses a fixed
  camera and has no parallax, live lighting or environmental animation.
  Switching to it clears old WebGL pixel anchors so responsive CSS placement
  remains valid after resizing or context loss.

`scripts/prepare-quest-preview.mjs` regenerates the six assets and manifest. It
uses Sharp already present through Next.js, with no installation. The generator
was corrected after browser review to match the live renderer's two-sided
geometry and avoid missing patches in the irregular island underside.

## Guide, assets and accessibility

The original WalkingGuide, sprite player, measured atlas, scripted conversation,
answer cues, keyboard/touch behavior and movement algorithms are reused without
editing them. Existing owner-drawn character provenance is recorded in
`AVATAR_QUALITY_REVIEW.md`; this task makes no new independent rights claim.
Scene geometry and fallback illustrations are original code-derived work.
Existing licensed local Anton, Inter and Newsreader typography is reused; no
new fonts or third-party imagery are introduced.

The guide remains an HTML sprite on a reserved foreground plaza, not a new
3D character controller. On phones/tablets the same bounded walking area sits
below the island and the choices. A fully ground-constrained 3D walker would
conflict with the instruction to preserve existing movement and is deferred.
The open paper note occupies its own layout track or a stacked section; it
does not cover the two paths. Environmental camera motion pauses while it is
open. “Scripted guide · Not AI” remains visible, and no model service, API key,
SDK, external message submission or paid integration was added.

Native anchors, visible focus outlines, the existing skip link, a single main
and h1, reduced-motion styles, pause/resume text, polite navigation status,
decorative canvas/illustrations, and semantic HTML controls are retained.
Focus does not become trapped in the 180 ms transition.

## Actual validation

Final source/build validation:

| Check | Result |
| --- | --- |
| `npm run lint` | Pass, zero warnings |
| `npm run typecheck` | Pass |
| `npm run build` | Pass; preview and all existing routes prerendered |
| `npm test` | 92 passed, zero failures/skips |
| `node --test tests/quest-preview.test.mjs` | 7 passed, zero failures/skips |
| `npm run test:assets` | Pass, 42 existing measured avatar crops |
| `node --test tests/website-http.test.mjs tests/quest-preview-http.test.mjs` | 11 passed, zero failures/skips |
| Protected-file hashes | 19 Portfolio files plus existing avatar fixture match |
| Pre-task preservation | All 96 baseline files match SHA-256 |
| `git diff --check` | Pass |

The seven new tests cover finite deterministic geometry/budget, camera math
at requested sizes, matrix ordering, bounded render-buffer sizes, theme changes,
six fallback headers/byte counts, and preservation fixtures. These are not
browser rendering tests. HTTP tests verify all existing routes, custom 404,
preview metadata/primary destinations, and referenced CSS/JS/font/image delivery.
No existing package scripts were changed: run the new tests with the explicit
commands above. Existing Node native-TypeScript module-type warnings remain;
package metadata was intentionally preserved.

Native Chrome browser checks were available; the in-app browser host was not.
Live screenshots were captured in the tool conversation, not saved as a
browser-image artifact or recording in the repository.

| Live browser observation | Result and limits |
| --- | --- |
| 320×800 and 390×800 | Both choices readable; island fits; guide scrolls below choices; compacted phone artboard retested |
| 768×800 | Initial kicker/sign overlap found and fixed by moving to stacked title/sign layout; retested |
| 1024×800, 1280×800, 1440×800 | World and both choices visible; caption stacking fixed cramped guide text |
| 1920×800 and 2560×800 | Centered scene, distinct signs, bounded content; final 2560 check after display-title size cap |
| 1280×480 | Choices visible; lower scene/settings require ordinary vertical scrolling |
| Open guide, 320px | Both signs remain sticky and clickable above the note; no horizontal obstruction |
| Open guide, desktop | Separate note column; both choices visible |
| Scripted example | “Which way should I go?” returns honest Portfolio/Adventure directions and unpublished-work disclosure |
| Escape | Note closes and focus returns to Talk to me |
| Keyboard | Shift+Tab reaches Adventure then Portfolio from the guide trigger; visible Portfolio focus ring observed; Enter on Adventure navigates to `/world` with normal motion enabled |
| Pause/resume | Accessible visible button changes from Pause animation to Resume animation and back |
| Reduced motion | Chrome emulation confirmed; pause control removed; static guide/scene available; emulation restored afterward |
| Themes/fallback | Copper autumn selected; illustrated view displayed both paths; live WebGL successfully restored |
| Fallback resize | Switched from a full-window 3D view to illustration, then 1280px emulation; both signs remained visible with responsive anchors and the repaired underside rendered without missing patches |
| Destinations | Clicking Portfolio opens existing `/portfolio`; Adventure opens `/world` with its non-playable disclosure; shared chrome remains available there |

The live screenshots exposed and led to fixes for the inherited preview width
cap, overlapping tablet sign/kicker, desktop sign placement, phone spacing,
cramped guide caption and fallback underside. Chrome also reported unused CSS
preload warnings during route/prefetch activity. No application exception was
observed in the inspected console, but this was not a comprehensive console or
network audit.

Not verified: real iOS/Android hardware and touch gestures, screen-reader speech,
200% browser zoom, forced GPU initialization/context-loss fault injection,
all six themes in every viewport, sustained FPS/thermal/battery measurements,
GPU memory profiling, cross-browser rendering, or an automated visual baseline
comparison against the supplied reference. Native responsive emulation does not
establish real-device performance. Pending-transition Escape timing was checked
in code rather than reliably exercised inside its 180 ms browser window.

## Exact task file inventory

All are additions; no pre-existing source file was modified:

1. `app/quest-preview/page.tsx`
2. `app/quest-preview/quest-preview.css`
3. `components/quest-preview/experience.tsx`
4. `components/quest-preview/scene.tsx`
5. `lib/quest-preview/math.ts`
6. `lib/quest-preview/palette.ts`
7. `lib/quest-preview/renderer.ts`
8. `lib/quest-preview/world.ts`
9. `assets/quest-preview/manifest.json`
10. `public/quest-preview/meadow-day.webp`
11. `public/quest-preview/meadow-dusk.webp`
12. `public/quest-preview/autumn-day.webp`
13. `public/quest-preview/autumn-dusk.webp`
14. `public/quest-preview/frost-day.webp`
15. `public/quest-preview/frost-dusk.webp`
16. `scripts/prepare-quest-preview.mjs`
17. `tests/quest-preview.test.mjs`
18. `tests/quest-preview-http.test.mjs`
19. `docs/QUEST_PREVIEW_REVIEW.md`

Ignored local-only artifacts: the recoverable snapshot archive/manifest,
unit/HTTP result logs and a preliminary CPU scene-study PNG in
`.local-snapshots/`. The PNG is an illustration study, not a browser screenshot.
Normal ignored `.next`/TypeScript build outputs were regenerated.

## Preview and owner review

Current production preview: `http://127.0.0.1:3100/quest-preview`.
To restart from this directory:

```sh
npm run build
npm run start -- --hostname 127.0.0.1 --port 3100
```

For development, `npm run dev -- --hostname 127.0.0.1 --port 3102` and open
`http://127.0.0.1:3102/quest-preview`. Use a separate port if the existing
production preview is still running.

Owner review is needed for the miniature art direction, island/title/landmark
composition, material lighting, theme variants, mobile stacked presentation,
guide plaza treatment, and transition feel. The Adventure is still a preview;
the guide is still scripted. No readiness for gameplay or real AI is implied.
Do not promote this route to `/` until the owner explicitly approves it. No
commit, push, merge, deployment or service purchase occurred.
