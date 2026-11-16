# Approved camera and avatar preset

2026-11-12 — `/quest-preview`, branch `website/implementation`.

Owner selected option C, modified to a 25% larger avatar. The normal page now uses 1.10× camera magnification and 1.25× avatar world size. Pets retain their world size. The avatar therefore also benefits from the camera magnification. No geometry, art, city content, typography or other route was replaced.

The default yaw/pitch remain unchanged. The walking approach, doorway alignment and final push now preserve the starting viewing direction, including a rotated user view, rather than lowering the camera during entry. The live WebGL change uses the world-space camera/frustum and measured sprite billboard. The image-only fallback uses equivalent projected coordinates, image framing and avatar sizing. Reduced motion retains immediate navigation.

Live comparison: http://127.0.0.1:3100/quest-preview/camera-compare.html. Four real app instances show the previous baseline, A (camera +15%), B (avatar +25%) and selected C (camera +10%, avatar +25%). External accessible controls play either actual destination sequence, cancel before entry or reset for replay. Origin/source-checked messages are enabled only for explicit whitelisted comparison query values. Ready messages are latched, observers/listeners cleaned up, and completion is announced to the parent. On smaller layouts the panel buttons replace Play all. This is a local noindex review surface, not another landing-page redesign.

Browser evidence: native Chrome showed all four live scenes side by side; screenshots were emitted in the conversation. Play Adventure in all started four walking/camera sequences and all four reached `/world` with completion statuses. Reset reloaded all four; Play Portfolio followed by early Cancel returned all four to Ready and restored their links. A separate normal `/quest-preview` view showed the approved closer framing and larger avatar. Fresh mobile/zoom/full-scene doorway matrices and fresh recorded video exports remain unverified. The comparison itself provides replayable live animation.

Validation: lint, TypeScript and production build PASS; 92 website unit tests and 105 quest/HTTP tests PASS, no failures/skips. New regressions check the selected default, query whitelisting, and constant viewing direction across approach/entry/push at normal and rotated yaw. Existing shader-resource and transition tests pass. All 110 out-of-scope task-baseline hashes match; no Portfolio, original avatar asset, other route, automation, dependency, commit, push, merge or deployment changes. Recovery is under `.local-snapshots/quest-camera-options/`, alongside prior snapshots.

Files changed/added:
- `lib/quest-preview/camera-preview.ts`
- `lib/quest-preview/city-camera.ts`
- `lib/quest-preview/renderer.ts`
- `lib/quest-preview/journey-drawing.ts`
- `components/quest-preview/scene.tsx`
- `components/quest-preview/restored/experience.tsx`
- `app/quest-preview/quest-preview.css`
- `public/quest-preview/camera-compare.html`
- `tests/quest-camera-preview.test.mjs`
- `docs/QUEST_CAMERA_PRESET_REVIEW.md`

Preview: http://127.0.0.1:3100/quest-preview. Server is running locally. If stopped: `npm run build`, then `npm run start -- --hostname 127.0.0.1 --port 3100`.
