# Supplied avatar gait review

Scope: `/quest-preview` only. Branch: `website/implementation`. Pets, shared entrance artwork/player, protected Portfolio implementation, scene geometry, camera settings and automation are unchanged by this task.

## Diagnosis and change

The pets already use crisp, distance-driven frame changes. The former avatar walking loop used seven frames, and pose blending could display two overlapping leg positions. The supplied atlas provides eight walking frames per direction, but its painted bounds and feet differ between cells. Using full cells directly would leave changing empty space around the character.

The isolated preview now uses the supplied eight-frame forward walking sequences. Frame selection follows accumulated travel distance. Each occupied cell has measured alpha bounds; uniform scaling and a common foot baseline prevent empty cell padding from causing positional jitter. Supplied frames switch without dissolving two silhouettes together. The illustrated fallback also disables the extra synthetic bob and lean because the artwork already contains movement. Existing turn, idle, talking, thinking, happy and wave cues are mapped to the supplied atlas; conversation behavior is unchanged.

The character remains a 2D camera-facing sprite. No procedural 3D avatar was restored. Pets retain their existing art, gait and sizes.

## Asset provenance

The owner stated they drew the character. The supplied package README identifies `poses.png` as Bo's own character art. The image was copied unchanged from `/Users/workspace/Downloads/portfolio-quest-avatar/assets/poses.png`; no supplied JavaScript was executed or installed.

- Image: 712 × 1500 RGBA; 89 × 150 cells, 8 columns and 10 rows.
- 47 occupied cells, independently checked against alpha bounds.
- Source and repository SHA-256: `44de681ac938c7d5161bad4d17b11a22f7db533f3fda94476dae4f1861b653f1`.
- Recovery snapshot: `.local-snapshots/quest-provided-avatar-before/baseline.tar.gz`.

## Exact task files

- `components/quest-preview/actors.tsx`
- `components/quest-preview/guide-sprite.tsx` (new)
- `lib/quest-preview/avatar-animation.ts`
- `lib/quest-preview/provided-avatar.ts` (new)
- `lib/quest-preview/quest-sprite-player.ts`
- `lib/quest-preview/journey-drawing.ts`
- `public/quest-preview/guide/poses.png` (new)
- `tests/quest-reference-animation.test.mjs`
- `tests/quest-journey-drawing.test.mjs`
- `tests/quest-provided-avatar.test.mjs` (new)
- This report (new).

## Validation evidence

- `npm run lint`: passed, zero warnings.
- `npm run typecheck`: passed.
- `npm run build`: passed.
- `npm run test:unit`: 92 passed, zero failed/skipped, including protected Portfolio checks.
- `node --test tests/quest-*.test.mjs tests/website-http.test.mjs`: 122 passed, zero failed/skipped.
- Focused atlas, gait, lifecycle and GPU tests: 14 passed (included in the above runs). Coverage includes all occupied alpha bounds, all mapped frames, eight phases in each direction, foot normalization, duplicate load, disposal, GPU crop uniforms and disabling supplied-frame blending.
- `git diff --check`: passed.
- Native Chrome, production server at `http://127.0.0.1:3100/quest-preview`: supplied atlas rendered in the live WebGL Tokyo autumn scene. Captured approach screenshots showed a single crisp silhouette and separated feet. Portfolio approach cancellation returned to the preview; Adventure approach completed and opened `/world`. Returned to the preview afterward. Screenshots were emitted in the conversation; no video recording or screenshot files were saved.

## Limits and owner review

This update did not repeat the complete city, viewport, touch or reduced-motion visual matrix. Existing motion/pause controls and semantic DOM navigation are retained, but those facts are not fresh visual approval. A captured frame cannot establish every moment of both walking loops. The source has finite raster detail (89-pixel cells); high-DPI enlargement cannot create new detail. Owner review should assess the full walk at the intended size, naturalness of turns and residual variation within the source drawing. Conversation portraits intentionally retain the shared original atlas.

Preview: refresh `http://127.0.0.1:3100/quest-preview` and select a building. No commit, installation, push or deployment was performed.
