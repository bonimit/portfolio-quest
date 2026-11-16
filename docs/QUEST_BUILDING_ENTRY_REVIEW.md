# Quest preview — building entry refinement

Owner request: simplify the approved chat styling, enlarge the map, replace sign
cards with slowly revealed floating text, and walk into a highlighted landmark
before opening either destination. Scope remains `/quest-preview` only.

## Implemented

- Larger orthographic composition (22-unit vertical / 30-unit horizontal minimum
  span, previously 26 / 34); larger mobile artboard. Title receives its own desktop
  layout space; the camera leaves room above roofs for floating labels.
- Actual projected building volumes are native DOM links. Pointer hover or keyboard
  focus reveals unboxed Portfolio / Adventure lettering over 650ms and emphasizes
  the selected building with local warm light and a ground glow. Touch/coarse input
  and reduced-motion visitors see the labels without hover. Adventure remains
  explicitly coming soon / non-playable. The two canonical hrefs remain intact.
- The guide follows the entire fork at 2.25 world units/sec after a 220ms turning
  lead. A pure simulation reports arrival at the selected entrance. Only then does
  the 560ms doorway/character fade begin and navigation occur. The avatar faces
  away at arrival. There is no short approach followed by a fixed navigation timer.
- Enter now and Cancel stay fixed in the viewport while travelling. Escape cancels;
  retargeting, pausing, changing scene/view or changing to reduced motion clears a
  pending transition. Offscreen/hidden scene activity retains the existing virtual
  clock pause. Native immediate navigation remains for reduced motion, paused
  world, modified clicks, unavailable animation assets or an offscreen avatar.
- Tour holds during building focus/hover so the destination does not change while
  visitors choose it. Time toggle, seasons, pets and both existing routes remain.
- Preview-only compact guide: smaller identity/disclosure, one short invitation,
  two useful prompts, conversation history, text input and arrow Send button. The
  same local provider and approved answer cues supply honest responses. Suggested
  destinations highlight the building and links can initiate its entry walk.
  Other destination links remain direct. Empty input has one error announcement;
  replies have numbered announcements. Escape returns to the visible avatar.
- Shared entrance guide, source sprite art/atlases, Portfolio, other route code,
  package files, automation and all earlier review reports are unchanged.

## Exact files for this task

Updated (33 pre-existing files):
- `app/quest-preview/quest-preview.css`
- `components/quest-preview/experience.tsx`, `actors.tsx`, `scene.tsx`
- `lib/quest-preview/actors.ts`, `math.ts`, `renderer.ts`
- `assets/quest-preview/manifest.json`
- `tests/quest-actors.test.mjs`, `quest-preview.test.mjs`, `quest-preview-http.test.mjs`
- All 22 `public/quest-preview/{city}-{supported-season}-{day,night}.webp` fallbacks,
  regenerated from the same original geometry for the enlarged camera.

Added:
- `components/quest-preview/guide.tsx`
- `lib/quest-preview/building-interaction.ts`
- This document.

Recovery: `.local-snapshots/quest-building-entry-before-2026-11-12.json` and `.tar.gz`
contain 150 baseline files. Audit found no changes outside preview-owned source,
assets or tests. Existing uncommitted work and older snapshots are preserved.

## Validation evidence

- `npm run lint`: PASS, zero warnings.
- `npm run typecheck`: PASS.
- `npm run build`: PASS, all 11 static routes generated.
- `npm test`: 92/92 PASS.
- `node --test tests/quest-preview.test.mjs tests/quest-actors.test.mjs`: 26/26 PASS.
  Covers full-fork endpoints, late arrival, cancellation, travel duration, camera
  scale, building target bounds/separation at 320/390/768/1024/1280/1440/1920,
  compact guide examples, pet frames and all city variants.
- Production HTTP checks: 12/12 PASS, including existing routes, custom 404, two
  native destination links, honest preview labels, all 22 fallback themes and pets.
- `npm run test:assets`: 42 measured original-avatar assets PASS.
- Protection tests: all 19 Portfolio hashes and existing avatar art/motion PASS.
- `git diff --check`: PASS. Final fallback collection: 1,047,480 bytes / 22 images;
  every individual image remains under the 65,000-byte test budget.
- React review: animation state remains in the existing virtual clock / DOM refs;
  no per-frame React state, no new library, effect/animation cleanup retained,
  bounded conversation history, single reply/error channels, safe provider IDs.

Native Chrome observations on a high-DPI desktop (1440 CSS px): enlarged map and
uncrowded final title, compact unboxed guide, exact scripted disclosure, Adventure
example response with visible links, input focus after reply, Escape returning to
avatar, Tab revealing the floating Portfolio label and visible building outline.
Clicking Portfolio visibly started the avatar walk and local architectural glow.
An intermediate observation revealed title/label overlap, which was corrected and
rechecked in the final rendering. Screenshots were inspected through the browser
tool; no screenshot files were saved.

Browser checks were intermittently interrupted by active browser changes; the
isolated in-app browser host was unavailable. Full uninterrupted arrival/navigation
for both paths, live cancellation, final mobile/tablet/200% zoom matrix, physical
touch, reduced-motion behavior and screen-reader speech remain unverified for this
revision. Unit projection bounds are not visual approval. Earlier review evidence
is historical and does not replace these outstanding checks.

## Preview and owner review

<http://127.0.0.1:3100/quest-preview> is running locally. Hover or Tab to a building,
then click / Enter. Open the guide through the avatar. To restart:
`npm run build`, then `npm run start -- --hostname 127.0.0.1 --port 3100`.

Owner review: map scale, reveal speed, full-walk length (roughly 5–7 seconds from
normal wandering positions), building glow and compact conversation. This is an
animated route entrance, not a playable RPG. The guide remains scripted, not AI.
No packages installed, paid service, commit, push, merge or deployment.
