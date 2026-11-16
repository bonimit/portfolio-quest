# Entrance avatar quality review — 2026-11-11

The newer [companion interface review](COMPANION_INTERFACE_REVIEW.md) supersedes
the centered-modal placement described below. It preserves the avatar artwork,
walking system and Round 2 cue repairs. Panel-specific files, previews and current
validation gaps are tracked in that focused report.

## Current: Avatar Round 2 repairs — 2026-11-11

This section supersedes the original behavior/evidence below. The initial asset
extraction record is retained as history. Work remains on website/implementation.
Before editing, the current 73 files were archived with hashes in
`.local-snapshots/avatar-round2-before-2026-11-11.tar.gz` and `.json`; earlier
snapshots and unrelated uncommitted work were retained.

### Repairs against the supplied P0/P1 brief

1. Every GuideAnswer declares an explicit avatarCue. A complete 12-answer mapping
   test guards all entries. Empty, unmatched, unavailable, informational and
   transparency responses remain idle. Only a successful available Portfolio
   navigation response uses talking (2200ms), then happy (900ms), then idle. This
   offers a working link; it does not claim navigation already happened.
2. Typing updates input/error state only. It never cancels or starts an activity
   timer. Immediate scripted answers never enter thinking. ConversationActivity
   owns greeting and response timing, replacement, cancellation and unmount cleanup;
   deterministic clock tests verify exact boundaries and absence of stale updates.
   Thinking source artwork remains available but unused by this scripted provider.
3. Pause/Resume use visible text as the accessible name, with no aria-label override.
   Changing-label action buttons have no aria-pressed; the label describes the
   next action. Browser accessibility inspection confirmed both names/states.
4. Focus holds depend on keyboard modality and :focus-visible. Pointer/touch
   restored focus no longer permanently holds the actor. Closing by pointer clears
   hover/press holds; ordinary rest then wandering resumes. A touch press is tracked
   separately. Escape retains stationary keyboard focus until the visitor leaves.
5. Avatar accessible name is “Talk to me — Wayfinder, the local scripted guide”.
6. Replaced the 70ms gait timer with requestAnimationFrame sampling native
   Animation.currentTime. Native translation, gait distance and interrupted
   position share matching piecewise interpolation. Missed frames catch up from
   current time instead of accumulating steps. Frames shift with translate3d;
   unchanged frames/pose avoid DOM writes, and there are no per-frame React renders
   or layout reads. Idle/paused/hidden states have no walking RAF loop.
7. Added greetings, guide/AI-transparency, site-versus-owner questions and explicit
   Portfolio navigation. Specific project requests outrank generic game/AI words;
   questions about the guide itself outrank project words. All unpublished
   work/concepts/arcade/about/contact and non-playable world disclaimers remain.
   Tested examples are listed in tests/guide-conversation.test.mjs. The full raw
   specialist report was not present in the repository; this repair covers the
   supplied brief and the enumerated regression examples, not unseen examples.
8. Fixed review.mkdir(parents=True, exist_ok=True). Added timer, intent, focus,
   atlas mapping, decoding/fallback and compositor-coordinate regression checks.

### Validation and observations

- Lint (zero warnings), typecheck and production build: PASS.
- Unit suites: 71 PASS, zero failures/skips. Commands:
  `node --test tests/website.test.mjs tests/assistant-motion.test.mjs tests/guide-conversation.test.mjs tests/sprite-player.test.mjs`.
- `python3 tests/guide-assets.py`: PASS; all 42 measured frame alpha/baseline/border
  assertions, source hash, poster equality, dimensions and mobile byte budgets.
- Production HTTP suite: 9 PASS, including all eight routes, custom 404, loaded
  assets and initial avatar/pause accessible markup. Localhost testing required
  sandbox-approved local network access.
- Nineteen protected Portfolio hashes PASS. A complete comparison to the 73-file
  repair snapshot confirms changes are restricted to the inventory below.
- Node's existing MODULE_TYPELESS_PACKAGE_JSON warning remains in native TS tests;
  it is not a failed check. No module/dependency configuration was changed.

Browser host reported unavailable. Native Chrome fallback later allowed a limited
live production check. Observed the entrance and dialog without visible overlap
on the desktop window; exact CSS viewport width was not established. Accessibility
inspection showed “Talk to me…” and “Pause animation”; clicking Pause changed its
name to “Resume animation”, and Resume changed it back. Dialog opening focused
Ask Wayfinder. Submitting Open portfolio produced its working /portfolio link.
With animation resumed, entering text after that response left the portrait idle
in the later screenshot; input remained usable. Escape closed the dialog and
restored focus to the avatar. Pointer Close also restored focus.

These snapshots do not verify every intermediate talking/happy frame or prove
smooth gait/touch recovery. Their timing is covered by unit tests; full live
motion review remains necessary. DevTools showed four unused CSS preload warnings;
no application exception was visible in that console snapshot. The stylesheet
is shared/prefetched and outside this avatar repair; no warning-free browser
claim is made.

An attempt to set 360px in DevTools timed out and Chrome switched to another tab
during concurrent activity. Mobile width, touch emulation/real touch, full Tab
sequence, 200% zoom, reduced-motion emulation and cross-browser/screen-reader
checks remain **unverified for these repairs**. Do not carry prior milestone
browser coverage forward as current evidence. Existing preview images/animation
are unchanged source-art demonstrations, not a recording of the new cue policy.

### Exact repair file inventory

Modified:

- components/entrance/local-guide.tsx
- components/entrance/walking-guide.tsx
- lib/guide/local-guide.ts
- lib/guide/assistant-motion.ts
- lib/guide/sprite-player.ts
- scripts/prepare-guide-atlas.py
- tests/website.test.mjs
- tests/website-http.test.mjs
- docs/DESIGN_SYSTEM.md
- docs/AGENT_TASKS.md
- docs/AVATAR_QUALITY_REVIEW.md

Added:

- lib/guide/conversation-activity.ts
- tests/guide-conversation.test.mjs
- tests/sprite-player.test.mjs

No CSS, artwork, fonts, protected Portfolio, automation, package/dependency files,
or earlier snapshots were modified. There was no commit, push, merge or deployment.

### Remaining Round 2 review work

Review actual walking cadence and pointer/touch resume in a dedicated browser
session, then narrow-screen, keyboard, reduced-motion and screen-reader coverage.
The source walk still has limited key-pose variation and finite retina detail;
no new artwork or anatomy was invented. Guide responses are deterministic local
matches, not general AI. Owner art review and Claude’s independent re-review remain
open. Website-wide approval is a separate review.

## Historical: initial avatar implementation


Implemented on `website/implementation` in `/Users/workspace/portfolio-quest-website`.
The existing uncommitted website was reviewed before edits and retained. Recovery:
`.local-snapshots/avatar-before-2026-11-10.tar.gz` and matching JSON SHA manifest
(55 baseline files). Restore individual files only after comparison.

## Diagnosis and permissions

The previous avatar was a simple front-facing SVG. Rotating limbs simulated a gait
independently of translation; a small face shift indicated direction. It lacked
actual orientation, thinking, happy and greeting frames. Interaction could abruptly
reset its pose.

The supplied 1536×1024 PNG is an irregular RGBA atlas with labels, partially opaque
background/shadows, neighboring marks and inconsistent source bounds. It is not
suitable for shipping unchanged. The owner confirmed “yes I drew it myself” in
response to the ownership/adaptation/publication question. That confirmation is
our permission basis. Source metadata separately reports gpt-image/OpenAI processing;
its signature and full creation history were not independently verified. It does
not independently establish authorship. No open redistribution license is asserted.
See `assets/guide/README.md` for provenance, source hash and processing details.
No image-generation service or paid API was used for this task.

## Implemented

- Individually measured 42 source regions across nine groups, with pelvis anchors;
  connected alpha extraction plus measured exclusions removes labels, gold marks,
  background and adjacent fragments. A last visual pass removed a small brown
  artifact beside the frontal talking pose.
- Uniform resampling to a 140px body, feet baseline y=160, 144×176 transparent
  canvases. Output packing is a regular grid only after irregular source extraction.
- One 1008×1056 WebP atlas (196,594 bytes), plus matching static poster (11,366
  bytes). Exact alpha survives encoding. Visible poster pixels equal the first
  decoded atlas frame, preventing a loading swap flash. Source PNG is outside public.
- Front/back idle clips, walk-left/right, real orientation turns, thinking,
  talking, happy and wave. Back idle is available but not a prolonged entrance
  state; back/side poses are used in turns. Speech excludes the back-facing source
  calling pose. Greeting uses frontal wave/happy poses.
- Gait frame phase follows travelled distance, including acceleration/braking;
  native transform animation moves the actor within its dedicated bounded arena.
  Pose updates do not rerender React or download new images.
- Hover/focus/touch stop the actor and turn it toward the visitor. The guide opens
  through the existing named button. Dialog portrait greets, thinks during typing,
  talks after replies and briefly celebrates a matched answer. These are visual
  states of the explicitly local scripted guide, not evidence of real AI.
- Pause applies to both actors. Reduced motion uses a static frontal pose. Hidden
  tabs/offscreen actors stop timers; unmount cancels listeners, observers, timers
  and native movement. A poster remains if atlas loading fails.
- Existing dialog focus, history, labels, input, keyboard/touch controls and the
  Portfolio/Adventure routes are retained. No Portfolio visual source was edited.

The source walk frames are very similar poses, rather than a full contact/passing
walk cycle. The implementation uses actual frames and distance synchronization,
but cannot invent missing anatomy/key poses. Talking is a selected expression
sequence, not lip synchronization. Run/hurt/climb are outside this entrance task.

## Validation evidence

- `npm run lint`: PASS, zero warnings.
- `npm run typecheck`: PASS.
- `npm run build`: PASS (production static routes and custom 404).
- `node --test tests/website.test.mjs tests/assistant-motion.test.mjs`: 28 PASS,
  zero failures/skips. Covers guide routing, contrast, bounds, cue references,
  turn bridges, frontal speech, elapsed clip timing and distance-based walk phase.
  The 19 protected Portfolio page/style/effect/font/license hashes match baseline.
- `python3 tests/guide-assets.py`: PASS; all 42 alpha bounds/baselines/borders,
  source hash, native dimensions, poster visible equality and mobile byte budgets.
- `node --test tests/website-http.test.mjs`: 9 PASS, zero failures/skips; all
  eight routes, loaded assets and custom 404. Initial sandbox attempts could not
  bind/connect localhost (EPERM); rerunning with authorized local network access
  passed. No application fix was needed.
- `git diff --check`: PASS. Node native TypeScript test imports emit the existing
  MODULE_TYPELESS_PACKAGE_JSON warning; lint and build have no such warning.
- All 55 baseline source hashes were compared: only entrance CSS, entrance
  composition, walking guide, local guide and HTTP test changed before docs edits.
  Existing Portfolio, navigation, routes, typography/effects and automation remain.

Asset contact sheets were visually inspected on paper and dark backgrounds,
including a 2× density simulation of the actual 90×110 CSS canvas. The 48-frame,
~4-second animated review uses runtime cue tables and extracted frames. It is an
asset preview, **not a browser recording**. Source detail is finite: 140px native
body displayed around 87.5 CSS pixels is softer than bespoke true-2× artwork.

Fresh live-browser checks are **unverified**. The browser automation host was
unavailable; native Chrome access was interrupted by concurrent user activity
before opening the local preview. No new desktop/mobile viewport, 200% zoom,
keyboard, touch, reduced-motion or browser performance pass is claimed here.
Earlier Round 2 observations predate this avatar and do not validate the new one.
Screen-reader and cross-browser testing also remain outstanding.

## Exact task file inventory

Modified existing files (preserving prior work):

- `app/entrance.css`
- `components/entrance/entrance-experience.tsx`
- `components/entrance/walking-guide.tsx`
- `components/entrance/local-guide.tsx`
- `tests/website-http.test.mjs`
- `docs/DESIGN_SYSTEM.md`
- `docs/AGENT_TASKS.md`

Added files:

- `components/entrance/guide-sprite.tsx`
- `components/entrance/guide-portrait.tsx`
- `lib/guide/assistant-atlas.ts`
- `lib/guide/assistant-motion.ts`
- `lib/guide/sprite-player.ts`
- `assets/guide/source-atlas.png`
- `assets/guide/frame-map.json`
- `assets/guide/README.md`
- `public/guide/assistant-atlas.webp`
- `public/guide/assistant-idle.webp`
- `scripts/prepare-guide-atlas.py`
- `scripts/preview-guide.py`
- `tests/assistant-motion.test.mjs`
- `tests/guide-assets.py`
- `docs/previews/assistant-states.webp`
- `docs/previews/assistant-real-size-2x.png`
- `docs/previews/assistant-contact-sheet.png`
- `docs/AVATAR_QUALITY_REVIEW.md`

Ignored local recovery/inspection artifacts live under `.local-snapshots/`.
Existing Git changes outside this inventory predate this avatar task. Dependencies,
automation and protected Portfolio files were not changed by this task.

## Preview and owner review

From the website root run `npm run dev -- --hostname 127.0.0.1 --port 3100`, then
open `http://127.0.0.1:3100/`. For production use `npm run build` then
`npm run start -- --hostname 127.0.0.1 --port 3100` (stop other servers first).
Open Wayfinder, type a question, send a reply, pause/resume, Tab/Escape and enable
OS/browser reduced motion. Check a narrow viewport as well as desktop.

Review [animation](previews/assistant-states.webp),
[2× size simulation](previews/assistant-real-size-2x.png) and
[all measured frames](previews/assistant-contact-sheet.png).
Owner review is needed for expression/greeting feel, walk limitations and acceptable
retina softness. Higher-resolution source and fuller contact/passing walk poses
would improve the next art pass. The guide remains scripted; real AI is separate.
No commit, push, merge, deployment or purchase was performed.
