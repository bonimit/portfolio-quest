# Compact preview controls

Simplified only `/quest-preview`'s bottom settings. The closed footer now shows the current location/season, the actual auto-tour status and one Scene controls disclosure. Previous/next, automatic touring, scene collection/place selection, illustrated view, pause/resume and fullscreen remain available inside a single paper panel with an orange offset shadow.

The panel closes on an outside pointer action. Escape from within the disclosure closes it and returns focus to its summary. Native details/summary keyboard behavior, 44px controls, reduced-motion handling and automatic-tour suspension during settings use remain. The panel has bounded width/height and internal overflow for small viewports. Day/night stays in the existing top control.

## Files changed in this task

- `components/quest-preview/restored/experience.tsx`
- `app/quest-preview/quest-preview.css`
- This report.

Pre-edit recovery: `.local-snapshots/quest-compact-controls-before/baseline.tar.gz`. Existing uncommitted work is preserved. No avatar/pet, scene renderer, protected Portfolio or automation files changed.

## Actual checks

- Lint, TypeScript and production build passed.
- Unit suite: 92 passed, including protected Portfolio snapshot checks.
- Quest and website HTTP suite: 122 passed after restarting the production server and allowing localhost access. An initial HTTP run without local-network permission failed with EPERM; the authorized rerun passed.
- `git diff --check` passed.
- Native Chrome desktop: inspected open/closed panel, verified pause/resume labels and Escape focus return. Captured screenshots in the conversation.
- Chrome responsive mode at 360 × 780: inspected the open panel and footer. All panel edges and actions fit within the viewport; closed the panel and restored the normal desktop preview.
- Fullscreen activation, outside-touch dismissal, all narrow heights, zoom and a fresh reduced-motion browser pass were not exercised in this task. Existing fullscreen and reduced-motion logic is retained.
- Chrome displayed stylesheet preload warnings; no claim of a warning-free browser console is made.

Preview: `http://127.0.0.1:3100/quest-preview`. No packages installed, commit, push or deployment performed.

## Owner simplification — 2026-11-14

Removed the “Use illustrated view” checkbox and its local state from `components/quest-preview/restored/experience.tsx`. The scene starts in 3D; the existing automatic static fallback still handles WebGL failure. This supersedes the manual-view-option description above. Pre-edit recovery: `.local-snapshots/quest-remove-illustrated-control-before/baseline.tar.gz`. No scene renderer, artwork, Portfolio or automation changes. Lint, typecheck and 14 pet/actor tests passed.

## Single bottom row — 2026-11-14

Moved Reset view into the actual footer using a React portal, alongside the scene caption, auto-tour status and Scene controls disclosure. The footer uses three grid tracks with a zero-minimum middle track. Long scene names truncate visually on small screens; their complete text remains in the accessible DOM. Reset view shortens visually to Reset on mobile and retains its full accessible name and 44px target. Removed the redundant visible building-choice hint while retaining its screen-reader description. The portal is removed automatically when the scene falls back from WebGL. No camera behavior or artwork changed.

Files: `components/quest-preview/restored/experience.tsx`, `components/quest-preview/scene.tsx`, `app/quest-preview/quest-preview.css`, and this report. Snapshot: `.local-snapshots/quest-single-bottom-row-before/baseline.tar.gz`.

Lint, typecheck, production build, 92 unit tests, six camera-orbit tests, preview HTTP checks and whitespace check passed. React review: the portal uses a stable footer target, preserves the original reset handler and is cleaned up by React; animation does not drive React state. Fresh browser visual checks remain unverified. Preview restarted at `http://127.0.0.1:3100/quest-preview`.

## Clickable text and quieter greeting — 2026-11-14

Reset view is now underlined clickable text at every size, with native button semantics and a 44px touch target. The footer's passive Auto tour status becomes a clickable **Season Changes ON/OFF** button; its pressed state represents the enabled preference. Reduced motion disables automatic changes. Existing temporary holds still apply while interacting, explained by the control's title. Removed the duplicate automatic-tour toggle from the settings panel, leaving Previous/Next there.

Removed the delayed “Which path would you like to try?” suggestion box, retaining the ten-second avatar greeting and existing Talk to me bubble. No conversation behavior or artwork changes.

Task files: `components/quest-preview/restored/experience.tsx`, `components/quest-preview/restored/scene-controls.tsx`, `components/quest-preview/scene.tsx`, `components/quest-preview/idle-prompt.tsx`, `app/quest-preview/quest-preview.css`, `tests/quest-preview-http.test.mjs`, and this report. Recovery: `.local-snapshots/quest-text-controls-before/baseline.tar.gz`.

Lint, typecheck, production build, 92 unit tests and 20 actor/camera tests passed. Updated HTTP regression checks cover the renamed toggle and absence of the old visible Auto tour wording. Fresh live browser visual and click checks remain unverified. Protected Portfolio and automation remain untouched; no commit or deployment.
