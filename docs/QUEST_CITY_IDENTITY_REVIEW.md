# Quest preview — city identity, reference pets and automatic tour

Scope: `/quest-preview` only. The approved Portfolio, entrance, shared guide,
automation, packages and existing review snapshots are unchanged. A recoverable
156-file snapshot precedes this work in `.local-snapshots/quest-city-identity-before-2026-11-11.*`.

## Implemented

- NYC: brick rowhouses/fire escapes, taller clustered skyline, paved street,
  crosswalk, small yellow cab and squared elevated steel station; fewer trees.
- Tokyo: lower timber studio, lattice veranda, broad tiled eaves, torii/lanterns,
  bamboo, cherry groves and red pond bridge. Bangkok's tropical composition stays.
- Original supplied capybara and owner-approved cat frames replace approximate
  procedural pet meshes. Transparent 1280×512 WebP atlases use measured alpha
  bounds, fixed per-character scale and feet at tile y=248. Only frames 3–6 enter
  the distance-synchronized gait; rest uses frame 0. No jumps/sitting frames in
  walking. DOM billboards follow the same projected world coordinates in both
  WebGL and illustrated modes. Reduced motion/pause keep them still.
- Night-mode switch with sun/moon and sliding orange thumb; native switch semantics,
  visible focus and reduced-motion alternative. Day/night is independent of tour.
- Automatic 16-second scene stops: NYC spring/summer/autumn/winter, then Tokyo's
  same four seasons, then Bangkok raining/summer/northern-inspired winter, repeat.
  Previous/Next and tour pause/play remain available. Tour pauses while the world
  is paused, guide is open, navigation is pending, settings/input is active, the
  tab is hidden or scene is offscreen. Reduced motion disables automatic changes.
- Guide is typeset directly on scene background: no enclosing paper box, border,
  blur or offset shadow. Honest local scripted disclosure and behavior retained.

## Asset provenance and limits

Sources: owner-supplied `/Users/workspace/portfolio-reference/mascot-capybara/`
and `mascot-scotishfolded/`. Owner selected cat after no Frenchie frames were found.
The manifest records exact crop bounds and source SHA-256. This local adaptation
is authorized by the request; independent publication rights for these pet folders
have not been established. No source originals changed or external assets fetched.
Capybara atlas 122,574 bytes; cat 158,898 bytes. Pixel-art silhouettes intentionally
remain 2D against the procedural 3D setting. No new third-party dependency.

## Actual validation

- Lint: PASS, zero warnings (removed unused geometry helper and extraction variable).
- Typecheck: PASS. Production build: PASS, all 11 static pages generated.
- Existing unit suite: 92/92 PASS. Preview/actor tests: 23/23 PASS.
- Original avatar assets: 42 measured crops PASS.
- Protection tests: 19 Portfolio hashes plus existing avatar assets/movement PASS.
- HTTP: 12/12 PASS against local production server, including existing routes,
  custom 404, preview semantics, all 22 themes, time/tour controls and pet atlases.
  Initial sandbox HTTP attempt failed EPERM; authorized local-network rerun passed.
- `git diff --check`: PASS. All 36 changes to snapshot files are preview-owned;
  no non-preview baseline file changed. Existing uncommitted work retained.
- CPU geometry: 5,691–7,339 triangles by theme; 22 fallback WebPs total 911,894 bytes.
- Native Chrome observed at desktop (1440 CSS px, high-DPI display), responsive
  320×800 and 768×800: distinct city shapes, both reference pets, time switch,
  guide without a surrounding box, both primary paths retained. 320/768 guide
  uses document flow and scrolls to show its conversation; paths remain above it.
  Desktop Escape closed guide and restored avatar focus. Manual Next crossed all
  four NYC seasons to Tokyo Spring; night preference stayed on.
- Chrome reduced-motion emulation: automatic tour disabled with a stated reason,
  Previous/Next available and redundant Pause world hidden.
- Chrome console showed repeated resource-preload warnings; no clean-console claim.

Unverified: physical touch devices, screen-reader speech, long-duration full-loop
browser observation, complete viewport/zoom matrix, performance profiling and
independent visual approval. Pure tests verify all 11 stops/wrap and frame mapping;
these do not substitute for final owner review. Adventure remains non-playable;
Wayfinder remains scripted, not real AI.

## Exact changed files

Updated:
- `app/quest-preview/quest-preview.css`
- `components/quest-preview/experience.tsx`, `scene.tsx`
- `lib/quest-preview/actors.ts`, `palette.ts`, `renderer.ts`, `variants.ts`, `world.ts`
- `scripts/prepare-quest-preview.mjs`
- `tests/quest-actors.test.mjs`, `quest-preview.test.mjs`, `quest-preview-http.test.mjs`
- `assets/quest-preview/manifest.json`
- All 22 `public/quest-preview/{nyc,tokyo,bangkok}-{supported-season}-{day,night}.webp`

Added:
- `components/quest-preview/pets.tsx`, `scene-controls.tsx`
- `lib/quest-preview/pet-sprites.ts`
- `scripts/prepare-quest-pets.mjs`
- `assets/quest-preview/pet-reference-manifest.json`
- `public/quest-preview/pets/capybara.webp`, `cat.webp`
- This review document.

Removed: unused `lib/quest-preview/pets.ts` mesh approximation (recoverable snapshot).

## Preview

Running locally at <http://127.0.0.1:3100/quest-preview>. To restart:
`npm run build`, then `npm run start -- --hostname 127.0.0.1 --port 3100`.
No commit, push, merge, deployment, service purchase or package installation.
