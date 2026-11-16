# Guide/pet scale correction — 12 November 2026

On `website/implementation`, changed only the preview's guide scale and its
existing regression check. Preserved pet sizes, sprite art, walking behavior,
feet anchor, orbit projection, chat portrait, Portfolio and automation.
Recovery: `.local-snapshots/quest-avatar-size-before-2026-11-12.tar.gz`.

Guide scale now ranges from 0.4 to 1.1 instead of 0.24 to 0.65 and follows a taller
world-space size. Its frame height is at least 1.5× each pet frame across the
sampled camera densities. The larger initial CSS scale matches the new maximum.
The existing feet transform uses the same scale, preserving ground alignment.

Actual alpha measurements: idle guide occupies 140/176 frame pixels in height,
capybara 215/256, cat 196/256. At maximum sizing this gives approximately 96px
visible guide height versus 67px capybara and 61px cat, rather than relying only
on transparent frame dimensions. This is an asset/scale calculation, not a fresh
browser screenshot. Mobile/high-DPI visual approval remains an owner check.

Lint, typecheck, build and 35 preview/actor/orbit tests passed, including protected
Portfolio/avatar hash checks. `git diff --check` passed. No packages or deployment.

Changed files:
- `lib/quest-preview/math.ts`
- `app/quest-preview/quest-preview.css`
- `tests/quest-actors.test.mjs`
- `docs/QUEST_AVATAR_SCALE_REVIEW.md`

Preview: http://127.0.0.1:3100/quest-preview
