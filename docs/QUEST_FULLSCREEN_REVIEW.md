# Quest preview full-viewport follow-up — 2026-11-13

Scope: `/quest-preview` only. Earlier files copied before modification to
`.local-snapshots/quest-fullscreen-before/`; previous snapshots retained.

## Changes

- `app/quest-preview/quest-preview.css`: canvas/artboard now occupies the entire
  preview behind the title and toolbar, rather than the smaller middle grid row.
  Camera approaches can draw throughout this area. Existing camera positions,
  interpolation and artwork are unchanged. Toolbar space is reserved for map,
  guide and greeting overlays. Buttons can wrap. Keeps the accessible short-height
  scrolling fallback. Includes the pending cream Talk to me speech bubble above
  the avatar's head with a small tail.
- `components/quest-preview/restored/experience.tsx`: mounts FullscreenControl;
  measures actual toolbar height with a cleaned-up ResizeObserver for overlay
  offsets when controls wrap or browser size changes.
- `components/quest-preview/restored/fullscreen-control.tsx`: native full-screen
  request on visitor activation; actual full-screen state controls the Exit full
  screen label. No automatic request. Unsupported browsers omit the button;
  rejected requests announce the fallback once through the existing status region.
  Native browser Escape exits. No custom key handler or forced focus.
- This report.

No protected Portfolio files, source art, other routes, automation or dependencies
changed by this follow-up. No installation, commit, push or deployment.

## Actual validation

- Lint, typecheck, production build and diff checks PASS.
- 92 unit tests PASS, including protected Portfolio source/asset hashes.
- 105 quest regression/production HTTP checks PASS after allowing localhost access;
  initial sandbox attempts could not connect (EPERM), not application failures.
- Restarted production preview at http://127.0.0.1:3100/quest-preview.
- Live desktop Chrome: saw full-viewport canvas, visible cream head bubble,
  existing avatar/pets, title and controls; activated Full screen and observed
  Exit full screen plus browser full-screen exit notice and hidden browser chrome.
  Screenshots emitted in conversation. This revealed overlapping bottom controls;
  final measured-toolbar offset correction is built and served.
- Subsequent browser checks were interrupted by concurrent activity in unrelated
  tabs. No actions were sent to those pages. Final offset visual recheck,
  destination-zoom capture, Escape exit, mobile, 200% zoom and reduced-motion
  rechecks remain UNVERIFIED for this follow-up. Passing build is not visual
  approval. Existing camera/scene behavior is covered by regressions separately.

Open the main preview (not the four-panel comparison), refresh it, and use
Full screen in the bottom toolbar. Escape is the browser's exit gesture.
