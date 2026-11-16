# Preview avatar edge correction — 2026-11-14

Owner reported a white fringe around the supplied avatar. Scope is the isolated `/quest-preview` sprite renderer; original PNG, pets, camera, gait, protected Portfolio and automation remain unchanged.

## Diagnosis

Pixel inspection of the first idle frame found 24 near-white partially transparent pixels, including RGB (255,255,254) at alpha 1. Most clear pixels are not white. The renderer uploaded straight-alpha pixels, then used linear texture filtering and SRC_ALPHA blending for both color and alpha. Filtering straight RGB allows weakly transparent colors to contaminate an edge; using the same blend factor on alpha also produces incorrect canvas alpha over transparent areas. These are verified rendering defects, but browser tools timed out before a fresh visual comparison could establish whether they explain the owner's entire reported fringe.

## Correction

- Premultiply the image on GPU upload, before texture filtering.
- Interpolate premultiplied sprite colors directly instead of multiplying already filtered color by alpha afterward.
- Output premultiplied color for sprite, shadow and portal passes; use ONE / ONE_MINUS_SRC_ALPHA blending.
- Restore the unpack flag after upload so pet/other texture uploads do not inherit it.
- Keep existing linear sampling and low-alpha rejection. No crude outline, raster erosion, nearest-neighbor pixelation or artwork edits.

## Exact changed files

- `lib/quest-preview/journey-drawing.ts`
- `tests/quest-journey-drawing.test.mjs`
- This report.

Recovery: `.local-snapshots/quest-avatar-edge-before/baseline.tar.gz`.

## Validation

- Lint, TypeScript, production build and diff whitespace check passed.
- Unit suite: 92 passed, including protected Portfolio checks.
- Quest plus website HTTP suite: 123 passed, zero failures/skips.
- Focused renderer/atlas suite: 10 passed, including the new premultiplied upload, upload-state reset, blend factors and all three shader-pass regression checks (included in the broader suite).
- Source PNG hash remains `44de681ac938c7d5161bad4d17b11a22f7db533f3fda94476dae4f1861b653f1`.
- Native Chrome inspection timed out twice, including after reconnecting. No fresh screenshot, visual removal claim, mobile edge comparison or live shader-compilation claim is made. Owner visual review is still required.

Preview server rebuilt/restarted at `http://127.0.0.1:3100/quest-preview`. Refresh the page to load the corrected renderer. The finite resolution of the supplied art still limits very large/high-DPI enlargement. No installations, commits, pushes or deployment.
