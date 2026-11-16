# Floating label placement — 2026-11-13

Owner supplied two cropped screenshots identifying the open space beside the
Portfolio and Adventure landmarks. Labels now occupy those shared side areas
instead of following each landmark's variable roof height.

Changed files:
- app/quest-preview/quest-preview.css
- docs/QUEST_FLOATING_LABELS_REVIEW.md (this report)

Desktop anchors use 14% / 86% of the actual artboard width and its existing 38%
height measurement. Each anchor subtracts the projected link's origin so the label
stays in a consistent open-sky region while building hit areas retain their real
projection. Width is bounded, text has no panel background, and existing hover,
focus, reduced-motion and native-link behavior remain. The same rules cover both
scene collections, every city/season and day/night. Compact labels retain paired
positions, with a vertical offset below the title instead of against the header.

A pre-edit CSS copy and compressed generated-build recovery archive are retained
under `.local-snapshots/quest-label-position-before/`. No avatar, source artwork,
terrain, camera, Portfolio, other routes, automation or dependencies changed.
No installation, commit, push, merge or deployment.

Validation:
- Lint, typecheck, clean production build and diff checks PASS.
- 92 shared unit tests PASS, including protected Portfolio hashes.
- Native desktop Chrome: keyboard-revealed both labels in Tokyo autumn; inspected
  left label in Tokyo winter against the supplied winter reference, right label
  in Bangkok winter, and left label in NYC spring. Text occupied the outer side
  regions and remained on-screen. Screenshots emitted in conversation.
- Chrome responsive emulation confirmed 360×780 with both compact labels visible
  below the heading. An initial numeric AX setter produced an invalid 1px width;
  corrected through the field editor and verified the actual 360/780 values before
  taking the responsive screenshot. Attempted restoration to 1280×800/closed tools
  was interrupted by concurrent browser activity; final QA-tab tool state is
  unverified. No subsequent actions were sent to the unrelated active page.
- This is representative visual coverage, not a captured all-scene/device matrix.
  No fresh 200% zoom, screen-reader audit, night visual matrix or physical touch
  test is claimed. Shared CSS placement applies to unvisited variants as well.

Preview: http://127.0.0.1:3100/quest-preview — refresh to load updated styles.

Final quest/HTTP run: 116 PASS. Combined with shared unit tests: 208 PASS,
zero failures/skips. Production preview remains running on port 3100.
