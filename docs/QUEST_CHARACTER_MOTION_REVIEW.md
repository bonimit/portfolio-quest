# Quest character motion and sizing — 2026-11-13

Changes are isolated to the quest preview. Pre-change sources are retained in
`.local-snapshots/quest-motion-size-before/baseline.tar.gz`. Existing work,
Portfolio, source sprite art, other routes and automation were not edited.

## Diagnosis and implementation

The driver gated RAF with a 33.3ms threshold, causing skipped display frames.
The animation key changed from preparing to walking and restarted an unfinished
turn. Nearly forward/backward headings could switch left/right at small path
bends. Duplicate first waypoints could also produce a zero-angle sample.

- Advance movement on each display frame, cap active stalled-frame catch-up at
  50ms, retain timer-based idle scheduling and visibility/pause cleanup.
- Preparing and walking share a facing target, so a turn continues across the
  movement boundary. A wider side-facing dead zone prevents small-bend flicker.
- Exponential shortest-arc heading smoothing is consistent across frame rates;
  duplicate waypoints are skipped. Wander preparation is 260ms.
- Footsteps remain driven by world distance. Gait cycle is 2.4 world units to
  suit the larger character; shared entrance SpritePlayer and original art remain
  unchanged. These repairs do not create additional in-between source frames.
- Pets grow exactly 30% relative to their prior bounded rendered size. Normal
  avatar grows 20% over the prior 1.25 factor to 1.5 (3.9 world units). Original
  opt-in camera comparison presets remain historical. Default camera zoom remains
  1.1; static fallback applies the same character/camera factors.
- Desktop left label anchors near the bottom of the building hit area (4%),
  rather than near its roof; mobile paired-label layout remains intact.

## Exact changed files

1. app/quest-preview/quest-preview.css
2. components/quest-preview/actors.tsx
3. components/quest-preview/scene.tsx
4. lib/quest-preview/actors.ts
5. lib/quest-preview/camera-preview.ts
6. lib/quest-preview/guide-gait.ts
7. lib/quest-preview/character-motion.ts (new)
8. tests/quest-actors.test.mjs
9. tests/quest-camera-preview.test.mjs
10. tests/quest-classic.test.mjs
11. tests/quest-restored-preview.test.mjs
12. tests/quest-character-motion.test.mjs (new)
13. docs/QUEST_CHARACTER_MOTION_REVIEW.md (this report)

## Validation and limits

Lint, typecheck, production build and diff checks pass. 92 unit tests pass,
including protected Portfolio hashes. Quest and HTTP results are recorded below.
New tests exercise exact size increases, side-facing stability, 60/120Hz clock
steps, bounded catch-up, duplicate-waypoint direction and both restored paths in
all three cities with monotonic distance and bounded frame displacement.

The first broad test attempt hit sandbox localhost EPERM and two obsolete source
string checks for the former inline pet size calculation. Those checks now target
the extracted helper; size behavior is tested separately. A later HTTP run during
production rebuilding received transient 500s; final tests run after server restart.

Native desktop Chrome screenshots showed enlarged pets/avatar, intact head bubble,
controls and keyboard-revealed left label. That inspection informed a further
lowering from 52% top placement to final 4% bottom placement. Final placement and
naturalness of complete walking/turn/entry sequences remain visually unverified:
concurrent activity switched browser tabs before transition inspection. In-app
browser host was unavailable. No fresh mobile, reduced-motion, all-city video,
high-DPI pixel-quality or full accessibility audit is claimed. Owner review of
motion remains necessary; source art limits the available turn/stride silhouettes.

Preview: http://127.0.0.1:3100/quest-preview (refresh to load the current build).
No installation, commit, push, merge or deployment.

Final result: clean production rebuild PASS; all 110 quest/HTTP regressions PASS
(202 total including the 92 unit tests). An incremental-build stale webpack asset
reference affected four conventional pages; moving the generated `.next` output
into the recovery folder and rebuilding resolved it without editing those pages.
Final production server is running on port 3100. Browser naturalness approval and
final label-position/mobile visual rechecks remain outstanding as noted above.
