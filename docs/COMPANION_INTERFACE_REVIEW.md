# Companion interface refinement — 2026-11-11

The [final Round 3 handoff](COMPANION_ROUND_3_REVIEW.md) supersedes the layout,
semantics and validation status below. This earlier implementation record and
its previews are retained for comparison.

Implemented in `/Users/workspace/portfolio-quest-website` on
`website/implementation`, following the owner's attached design brief.

## Result and design rationale

The centered modal has become a nonmodal companion panel. At 1280px and wider,
it occupies its own right-hand grid column; the Portfolio and Adventure choices
and avatar occupy the other column. The desktop grid has generous but bounded
ultrawide padding. Nothing overlays or dims the entrance. Below 1280px, a full-width,
compact paper sheet follows the entrance in normal document flow. Its transcript
scrolls independently. Small screens may need page scrolling between choices and
conversation; controls remain reachable and are not covered by a sheet/backdrop.
This is deliberately not a fixed overlay above the avatar.

The art direction is a field note from a companion: warm paper, ink rules, an
orange fastening strip, folded corner, offset printed shadow, condensed name and
serif opening line. Short unfolding/refolding gestures suggest a note opening
from the character's side. Message reveals and tactile route/control feedback add
energy only when interacting. There are no particles, continuous panel loops,
neon/glass effects or new animation dependencies. The previous green palette is
removed from the entrance and companion. Palette changes are entrance-scoped.

The panel has a character header, a compact “Local scripted guide · No live AI”
disclosure, dialogue, two useful example questions, input and Close. Local privacy
is a single footer line. Existing route answers and truthful placeholder status
remain; this does not activate real AI. The earlier repaired cue/timer rules and
Pause/Resume names are preserved.

## Interaction and accessibility

- `<aside role="dialog" aria-modal="false">` has a labelled title and disclosure.
  It uses neither showModal nor a modal backdrop/body inertness/focus trap.
- Opening focuses the input. Normal Tab/Shift+Tab can leave the panel for the two
  paths, avatar and navigation. Escape closes unless composing or already handled.
  Close is a 44px named button. Closing restores focus to the avatar.
- Exit lasts 180ms; reduced motion or shared pause makes it immediate. Entry is
  a single 460ms transform/opacity gesture; message reveal is 260ms. No recurring
  layout animation or pointer-parallax loop was added.
- Choosing a primary path dismisses the companion before the existing transition
  modal opens. Separate focus origins prevent cancellation restoring to the wrong
  control. Native modified/reduced-motion link behavior remains.
- Live reply announcements, empty-input errors, input labels and conversation
  history semantics remain. Reduced motion and shared pause suppress panel motion.
- The existing avatar file, movement controller, extraction, cues, sprite player,
  atlas and portrait component were not edited. The previous pointer/touch versus
  keyboard focus behavior is retained.

## Before / after previews

Open [the review gallery](previews/companion/index.html), select Open/Closed and a
matching width: 320, 390, 768, 1280, 1440 or 2560px. Scroll inside each view.

These are **static review previews, not browser screenshots or interaction tests**.
The before closed state comes from preserved pre-edit production HTML/CSS. Before
open is a reconstruction of the old empty modal using its preserved production
styles. After uses new production HTML/CSS and the actual server-rendered React
panel. Fonts and avatar images are embedded for local viewing. Motion is disabled;
preview controls do not operate the real guide. This distinction is also stated
in the gallery. No screenshot matrix was captured successfully.

Recreate previews with `node scripts/preview-companion.mjs --before` using the
preserved `.local-snapshots/companion-before-render/` baseline, and
`node scripts/preview-companion.mjs` after a production build. The local renderer
uses the existing TypeScript/React packages; it never ships to the frontend.

## Actual validation

- `npm run lint`: PASS, zero warnings.
- `npm run typecheck`: PASS.
- `npm run build`: PASS; all existing routes and custom 404 generated.
- `node --test tests/website.test.mjs tests/assistant-motion.test.mjs tests/guide-conversation.test.mjs tests/sprite-player.test.mjs tests/companion-panel.test.mjs`:
  **75 PASS**, no failures/skips. New checks render the real React panel for
  nonmodal semantics/disclosure/controls, test Escape/IME policy and immediate
  pause/reduced-motion dismissal, and check paper text/focus contrast. Earlier
  answer-cue, intent, timer, focus policy and motion tests continue to pass.
- `python3 tests/guide-assets.py`: PASS, all 42 frame checks and byte budgets.
- `node --test tests/website-http.test.mjs`: **9 PASS**, all eight routes,
  semantics/assets and custom 404 against the production server on localhost.
- `git diff --check`: PASS. Nineteen protected Portfolio hashes pass. Baseline
  comparison confirms no avatar source/output/movement or protected Portfolio
  changes. No dependencies or automation files changed.
- An HTML structure check caught and corrected an early static-preview insertion
  issue. The final after preview places its panel inside the reserved entrance
  grid. This is a preview-generator fix, not a product layout bug.
- Existing native Node TypeScript import tests still emit the
  MODULE_TYPELESS_PACKAGE_JSON warning. No package module setting was changed.

Fresh native Chrome attempts timed out/reset or reported concurrent user changes
before the local redesigned UI could be opened. Therefore the requested viewport
matrix, open-path hit testing, Tab/Shift+Tab, touch, Escape/focus return, live
screen-reader behavior, reduced motion, short-height/virtual keyboard behavior,
animation smoothness and actual before/after screenshots remain **unverified**.
The gallery supplies reviewable previews at those widths, not evidence that these
checks passed. Prior avatar/website browser observations predate this redesign.

## Exact task file inventory

Modified existing files:

- `app/entrance.css`
- `components/entrance/entrance-experience.tsx`
- `components/entrance/local-guide.tsx`
- `tests/website.test.mjs` (updated the entrance's former mint contrast pair)
- `docs/DESIGN_SYSTEM.md`
- `docs/AGENT_TASKS.md`
- `docs/AVATAR_QUALITY_REVIEW.md` (links this newer panel review)

Added:

- `lib/guide/panel-interaction.ts`
- `scripts/preview-companion.mjs`
- `tests/companion-panel.test.mjs`
- `docs/previews/companion/index.html`
- `docs/previews/companion/before-closed.html`
- `docs/previews/companion/before-open.html`
- `docs/previews/companion/after-closed.html`
- `docs/previews/companion/after-open.html`
- `docs/COMPANION_INTERFACE_REVIEW.md`

Recovery: 76 pre-edit files and hashes are preserved in
`.local-snapshots/companion-before-2026-11-11.tar.gz` and `.json`, alongside the
render baseline and unit-test log. Earlier snapshots and uncommitted work remain.
Compare individual files before recovery; do not restore archives wholesale.
Review previews are documentation assets, not public/runtime downloads.

## Claude Round 2 priorities and local preview

Use `npm run dev -- --hostname 127.0.0.1 --port 3100`, then open
`http://127.0.0.1:3100/`. Stop a production server on that port first. For production,
run `npm run build` then `npm run start -- --hostname 127.0.0.1 --port 3100`.

Review open/closed 320/390/tablet/1280/1440/ultrawide compositions, especially actual
1280px path visibility/clickability and mobile page-scroll context. Test leaving
and returning to the nonmodal panel by keyboard, Escape, pointer/touch close,
shared pause, reduced motion, long conversations and on-screen keyboards. Confirm
that the short paper motion feels connected to the character without becoming
another focal point. Full mobile/desktop usability and owner visual approval
remain open. Existing limited sprite gait/detail and scripted intent coverage
remain separate known limitations; no avatar redesign or real AI was attempted.

No automation, unrelated routes, protected Portfolio, paid service, package
installation, commit, push, merge or deployment changes.
