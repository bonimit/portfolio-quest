# Outward labels and selected pet sizes — 2026-11-14

- Portfolio's desktop anchor moves from 14% to 10% of the map width; Adventure moves from 86% to 90%. Both retain the same vertical position and shared cross-scene anchors.
- Narrow layout anchors move from 25%/75% to 22%/78%, retaining the existing 34vw label width and viewport space.
- Cat, Frenchie and sloth receive an additional 1.25× size multiplier on their current proportions, compounding the prior common 15% increase. Capybara, kitsune and avatar sizes are unchanged.

Files: `app/quest-preview/quest-preview.css`, `lib/quest-preview/pet-sprites.ts`, `tests/quest-character-motion.test.mjs`, and this report. Pre-edit files preserved in `.local-snapshots/quest-label-pet-spacing-before/baseline.tar.gz`.

Validation: lint, typecheck, production build and whitespace check passed. Focused character-motion and pet/actor tests: 20 passed. Browser inventory was available, but native Chrome inspection timed out; no fresh screenshot or visual approval is claimed. No artwork, movement, protected Portfolio or automation changes. No installation, commit or deployment.

Preview: refresh `http://127.0.0.1:3100/quest-preview`.
