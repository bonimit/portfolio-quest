# Preview control and chat typography cleanup — 12 November 2026

Scope: `/quest-preview`, branch `website/implementation`. Five edited files were
snapshotted before editing in `.local-snapshots/quest-clean-ui-before-2026-11-12.*`.
Other uncommitted work, protected Portfolio, art, animations, routes and automation
are preserved.

Removed decorative link/return arrows, floating-label connector strokes, redundant
map rotation arrow buttons and the tour play/pause pictogram. Tour controls now
read Previous / Next; the chat uses Send / Close. Map dragging, keyboard rotation
and Reset view remain. Native accessible names still include visible labels.

All chat text now uses one scoped 1rem (16px at the default root size) token:
heading, disclosure, messages, speaker labels, destination links, examples,
textarea, error and buttons. Heading weight supplies hierarchy. The orange Send
button is a capsule with enough room for its text. The second preset's visible
label is shortened to Adventure; it still asks “Is Adventure playable?”.

Validation: lint, TypeScript and production build passed (11 static pages).
Existing unit suite 92/92 and preview suites 50/50 passed (142 total); protected
Portfolio/avatar fixture checks matched. HTTP suites passed 12/12. Whitespace
checks passed. React best-practices review: stable keyed examples, native controls,
unchanged hook lifecycle and local provider, no new listener, dependency or effect.

Native Chrome: inspected the opened chat and a reply at 969px and 320 × 800.
Arrow-free labels, consistent text size, Send and Close were visible. Both paths,
composer and footer fit at 320px. The initial long preset label wrapped; shortened
it afterward and rebuilt. That final label-only adjustment was not visually rerun.
History remains scrollable with its latest reply/destination links anchored at the
bottom. Existing CSS preload warnings appeared. The temporary QA tab was closed,
leaving the owner's other tabs intact. Full device/zoom/screen-reader matrix was
not rerun; source tokens are not a computed-style audit of every browser.

Changed files:
- `components/quest-preview/experience.tsx`
- `components/quest-preview/scene.tsx`
- `components/quest-preview/scene-controls.tsx`
- `components/quest-preview/guide.tsx`
- `app/quest-preview/quest-preview.css`
- `docs/QUEST_CLEAN_UI_REVIEW.md`

Preview: http://127.0.0.1:3100/quest-preview

No commit, push, merge, deployment, paid service or package installation.
