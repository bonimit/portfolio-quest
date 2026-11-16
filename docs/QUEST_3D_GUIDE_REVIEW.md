# 3D guide prototype — 2026-11-13

Owner request: clearer left/right footfalls, remove the odd sprite border, and
recreate a recognizable version of the same character in real 3D.

## Diagnosis and implementation

The raster guide has limited distinct foot poses. Its transparent atlas edges and
pose dissolves can also show fringes or overlapping silhouettes. Neither adding
more redraws nor stretching that artwork creates independent legs.

Implemented an original procedural 3D prototype in `/quest-preview` only:

- Curly black hair, large rounded head, ears, eyes/smile, red floral shirt, black
  shorts and modeled sandals. This is an interpretation for owner review, not an
  exact sculpted likeness claim. No downloaded models, third-party textures or
  reference HTML imagery are used. The supplied character's owner stated they
  drew it themselves; the original sprite files remain untouched.
- Twelve bones with separate thighs, knees, ankles, arms and forearms. Alternating
  feet have a real swing height; two-link inverse kinematics place each sandal.
  The stance foot offsets root travel, reducing straight-path sliding. Gait is
  distance-driven, turns use shortest-arc smoothing, and start/stop/wave activity
  weights ease without stretching bones. Static/reduced modes settle immediately.
- True world-space model rotation and depth testing against buildings. Uses the
  existing path controller, camera, doorway opacity and contact shadow. Geometry
  has no alpha-cutout border or two-sprite pose dissolve. Day/night character
  lighting follows the scene. No new animation loop, library or service.
- Scene settings → “3D guide · Uncheck for original sprite” switches between
  model and preserved sprite without rebuilding the island. Default is the 3D
  prototype. Illustrated/non-WebGL view retains the original accessible sprite;
  model allocation failure retains the sprite renderer.
- Geometry uploads once. About 12,600 triangles, below the tested 40k-vertex budget;
  only twelve bone matrices change during animation. No frame-rate benchmark is
  claimed. The character does not cast a new environment shadow; the existing
  contact shadow remains.

## Exact files changed

1. lib/quest-preview/guide-model.ts (new procedural mesh and rig)
2. lib/quest-preview/guide-model-drawing.ts (new GPU draw and animation blending)
3. lib/quest-preview/renderer.ts (model integration and comparison selection)
4. lib/quest-preview/journey-drawing.ts (retain portal/shadow while hiding billboard)
5. components/quest-preview/scene.tsx (comparison prop and deferred-renderer sync)
6. components/quest-preview/restored/experience.tsx (labeled native checkbox)
7. tests/quest-guide-model.test.mjs (new)
8. docs/QUEST_3D_GUIDE_REVIEW.md (this report)

Protected Portfolio, island geometry, other routes, source artwork, pets,
automation and dependencies were not edited. Pre-edit primary sources and
compressed generated-build recovery copies are in
`.local-snapshots/quest-3d-guide-before/`. Earlier generated build directories were
compressed into verified tar archives in their existing snapshot folders to keep
lint/typecheck from scanning generated recovery files. Original source snapshots
are unchanged. No installation, commit, push, merge or deployment.

## Validation

- Lint, typecheck, clean production build and diff checks PASS.
- 92 shared unit tests PASS, including protected Portfolio hashes.
- 123 quest/HTTP tests PASS. Total: 215 passing, zero failures/skips.
- New tests: deterministic finite mesh, normalized normals, grounded soles,
  vertex/bone budgets, clear opposite-foot swing, planted stance in world space,
  static independence from clock/distance, rigid start/stop activity weights,
  one-time geometry upload, GPU uniforms and cleanup/failure cleanup.
- Native desktop Chrome: inspected initial proportions, refined head/body ratio,
  then inspected final model in day/night. Verified the native comparison checkbox
  displays the original sprite and restores the model. Captured a real 3D doorway
  approach showing the character's back and distinct lifted sandal, then observed
  successful Adventure navigation to `/world`. Pause/Resume labels and both
  activations were exercised; Portfolio entry activated in night mode.
- Screenshots were emitted in conversation, not exported as a video or saved
  screenshot set. No new mobile/touch, 200% zoom, browser-emulated reduced-motion,
  all-city visual matrix, screen-reader audit or performance profiling claimed.
  Unit regressions cover all route controllers and static rig behavior separately.

## Owner review / limits

Review likeness, facial expression, proportions and walking feel in the browser.
This is a working procedural prototype, not final character-art approval. It has
idle, alternating walk, turning and wave behavior; no face rig/lip-sync, running
clip, climbing, terrain-specific foot raycasts or full game character controller.
Feet are planted against the authored level walkways; sharp path bends can still
show some skating while the body turns. The 2D fallback retains its source-frame
limitations. Original art can be selected at any time.

Preview: http://127.0.0.1:3100/quest-preview — refresh the page. Use Scene settings
to compare characters; click a building to inspect walking and entry.

Follow-up desktop observation: the 3D night-mode Portfolio approach completed at
`/portfolio`. Returned to `/quest-preview`, left the 3D guide enabled in day mode.

## Owner rollback — 2026-11-13

Owner requested “revert avatar back.” Restored the four runtime integration files
byte-for-byte from the pre-3D source archive. Removed the new model/rig and its
isolated test from active source only after archiving and byte-verifying them in
`.local-snapshots/quest-3d-guide-before/retired-3d-prototype.tar.gz`. The generated
3D production build is also archived. The 3D switch is removed; the earlier sprite,
current sizes, walking fixes, head bubble and camera behavior are restored. This
report's implementation sections are historical, not the active avatar.
Rollback validation: lint, typecheck, clean build and diff checks PASS; 92 unit +
116 quest/HTTP tests PASS (208 total). Refreshed desktop Chrome and visually
confirmed the original sprite with its head bubble and enlarged pets. No fresh
mobile or motion matrix is claimed for the rollback.
