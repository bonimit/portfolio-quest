# Reference animation adaptation — 2026-11-13

Applied to `/quest-preview` after owner instruction “applied,” following inspection
of `/Users/workspace/portfolio-reference/Portfolio Quest 3D.html`.

## Implemented

- Removed the renderer's separate 30fps threshold, which was still skipping
  display frames after the actor driver had been corrected. Rendering and movement
  now follow RAF while active, with existing visibility/pause/bounded-idle behavior.
  Actual achieved frame rate depends on the device; no profiler benchmark claimed.
- Quest-only walking player uses all seven owner-supplied directional frames in
  forward order, without the former forward/reverse ping-pong. Retains measured
  atlas positions and distance-based footsteps, rather than importing the
  reference's separate eight-frame sheet or allowing feet to cycle while stopped.
- Partial turns use 180ms per cue. Maximum partial turn, movement preparation and
  doorway alignment are synchronized at 540ms, letting the sprite face the doorway
  before disappearance. The reference's full five-frame 900ms turn informs this
  timing; its complete monolithic controller is not copied.
- GPU pose changes blend over 200ms at a common feet anchor. Gait frames stay crisp;
  they do not each restart a dissolve. Alpha-weighted color mixing avoids dark
  transparent edges. Static/paused/reduced-motion states settle immediately.
  Rendering stays active only for the bounded blend interval. This adapts the
  reference's DOM pose crossfade to the preview's billboard; the reference's own
  3D billboard does not crossfade.
- Preserved current camera angle, camera entry/return interpolation, island scenes,
  enlarged avatar/pets, labels, source artwork and existing paths. Shared entrance
  SpritePlayer, protected Portfolio, other routes and automation were not edited.

## Exact files changed

- components/quest-preview/actors.tsx
- lib/quest-preview/actors.ts
- lib/quest-preview/destination-transition.ts
- lib/quest-preview/journey-drawing.ts
- lib/quest-preview/renderer.ts
- lib/quest-preview/avatar-animation.ts (new)
- lib/quest-preview/quest-sprite-player.ts (new)
- tests/quest-reference-animation.test.mjs (new)
- tests/quest-journey-drawing.test.mjs
- docs/QUEST_REFERENCE_ANIMATION_REVIEW.md (this report)

Pre-edit primary source archive and generated-build recovery copies are retained in
`.local-snapshots/quest-reference-motion-before/`; older snapshots are preserved.
No dependencies, credentials, services, original sprites or unverified reference
assets were added. No commit, push, merge or deployment.

## Actual validation

- Lint, typecheck, clean production build and diff check PASS.
- 92 shared unit tests PASS, including protected Portfolio hashes.
- 116 quest and HTTP tests PASS. Total: 208 passing tests, zero failures/skips.
- New coverage: full forward frame order and loop, all partial-turn durations,
  preparation/alignment synchronization, 200ms state blending without gait-frame
  restart, static settlement, atlas transforms, no walking timers, return-to-idle
  frame cache, GPU blend uniforms and unchanged feet anchor, resource cleanup.
- Native desktop Chrome: WebGL initialized without illustrated fallback. Captured
  actual Adventure and Portfolio approach screenshots, then confirmed final
  `/world` and `/portfolio` routes. Returned to preview, activated Adventure and
  pressed Escape before entry; transition canceled, status announced and focus
  returned to Adventure. Preview left open at http://127.0.0.1:3100/quest-preview.
- Browser screenshots are emitted in the conversation, not saved video recordings.
  These are desktop smoke checks. No frame-rate measurements, all-city/device
  matrix, mobile/200%-zoom, fresh reduced-motion browser emulation or screen-reader
  audit is claimed. Static settlement is unit/GPU-tested. Seven available source
  frames and side-facing art limit an exact match to the reference's eight-frame
  character. Owner review of gait and the brief blended silhouettes is outstanding.
