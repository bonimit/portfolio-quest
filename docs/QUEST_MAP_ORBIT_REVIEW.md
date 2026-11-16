# Drag-to-rotate map — 12 November 2026

Implemented in `/quest-preview` on `website/implementation`. Preserved Portfolio,
original entrance, source art, existing avatar/pet motion, automation and all
uncommitted work. Recovery: `.local-snapshots/quest-orbit-before-2026-11-12.*`
(167 source/asset/document baseline hashes and recoverable archive).

## Interaction

- Drag empty map space with the primary mouse button to rotate horizontally and
  tilt vertically. This changes the actual WebGL camera, not a CSS image transform.
- Bounded ±50° horizontal rotation and approximately −6°/+11° tilt offset keep
  the scene readable. Framing adjusts outward with angle to retain complete clouds.
  The default camera is byte-identical to the existing fallback-art projection.
- Touch horizontal swipes rotate; vertical scrolling and pinch zoom remain native.
  No momentum or autonomous rotation. Explicit manual camera changes remain usable
  while world motion is paused or reduced motion is enabled.
- Focus the map and use arrow keys to rotate/tilt; Home resets it. Separate left,
  right and Reset view buttons provide accessible alternatives. Escape cancels an
  active drag and restores its starting angle.
- Pointer capture, six-pixel drag threshold, primary-pointer tracking, lost-capture
  handling and cancellation keep gestures distinct from clicks. Drag completion
  suppresses the synthetic mouse click, without swallowing keyboard link activation.
- Links, guide/actor buttons, form fields and camera controls never start a drag.
  Camera manipulation is disabled during path-entry navigation.
- Building hit targets, guide/pet projections and apparent sprite scale use the
  same rotated camera. Atlas artwork and world-space walking logic are unchanged.
- Rotation UI is available only in live WebGL mode. The illustrated fallback
  remains static and honestly labeled; both destination links remain available.
- Uses refs and the existing renderer frame scheduling; no React updates per move,
  new animation loop, library or regenerated assets.

## Validation

- Lint, typecheck and production build passed; all 11 static pages generated.
- Existing unit suite: 92/92 passed. Preview suites including orbit: 48/48 passed
  (140 total). Six new regressions cover pointer identity/thresholds, native touch
  scrolling, bounds/cancel/reset, preserved default camera, destination separation
  and cloud framing. Projection checks cover 320–2560px widths, short/tall heights,
  all supported cities/seasons and extreme rotation/tilt angles.
- 42 guide asset checks passed. All 28 protected Portfolio/avatar hash entries
  matched existing fixtures. Asset generation was unnecessary; all existing assets
  and their manifests remain unchanged. `git diff --check` passed.
- HTTP suites: 12/12 passed against the local production build.
- Live native Chrome: new controls/instructions present, 390px mobile layout
  inspected, desktop Rotate map right visibly changed the true 3D perspective.
  The guide/pets/targets moved with the scene. Three Shift+Tab presses from the
  right control correctly focused the map as a keyboard-accessible group.
- Direct drag attempts hit computer-use `windowNotFoundAtPosition` coordinate
  errors on the multi-display setup, including after moving only the preview
  window to the test display. The direct browser host was unavailable. Thus mouse
  and touch gesture delivery have unit coverage but were NOT verified end-to-end
  in the browser. Arrow-key/tilt/Home attempts were interrupted by a user window
  change; those runtime checks also remain pending. No gesture success is claimed.
- Console showed existing CSS preload warnings; no error counter appeared during
  the live camera-control inspection. No screenshots saved as evidence files.
- Full browser/device/reduced-motion matrix and depth occlusion of DOM sprite
  billboards at every angle remain owner QA items. Rotation is deliberately bounded,
  not a 360° orbit around unfinished rear architecture.

## Preview

http://127.0.0.1:3100/quest-preview

Server remains running. If needed:
`npm run start -- --hostname 127.0.0.1 --port 3100`.
Drag an empty part of the map; use Reset view to restore the original angle.

## Exact changed files

- `app/quest-preview/quest-preview.css`
- `components/quest-preview/scene.tsx`
- `lib/quest-preview/map-orbit.ts` (new)
- `lib/quest-preview/math.ts`
- `lib/quest-preview/renderer.ts`
- `tests/quest-orbit.test.mjs` (new)
- `docs/QUEST_MAP_ORBIT_REVIEW.md` (new)

No packages, paid services, commit, push, merge or deployment.
