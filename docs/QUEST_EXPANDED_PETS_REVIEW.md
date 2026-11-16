# Expanded preview pets — 2026-11-14

Added owner-selected sloth, kitsune and Frenchie references to the existing capybara and cat in `/quest-preview`. All five remain visible, decorative and non-interactive; the guide and both destinations keep their existing controls.

## Assets and movement

Sources: `mascot-slot` (sloth), `mascot-kitsune`, and `mascot-frenchie` under `/Users/workspace/portfolio-reference`. The owner explicitly requested their use. No independent third-party license documentation was found/verified; this remains local preview work, without publication. Original reference files and existing capybara/cat atlases are untouched.

Extended the existing deterministic packing script. Frenchie uses its three idle frames, four run frames and one jump frame; the runtime selects the four travel frames. Sloth has nine atlas frames and kitsune ten. All use the existing 5 × 2 layout, 256px cells and common 248px foot baseline. Source crops and SHA-256 values are recorded in the manifest. New atlas sizes: sloth 117272 bytes, kitsune 183226 bytes, Frenchie 117604 bytes.

All pets use distance-driven frame changes. Sloth moves at 0.3 world units/sec, capybara 0.65, Frenchie 0.85, cat 1 and kitsune 1.1. Added pets reuse the existing authored pet walkway lanes with staggered starts/targets, preserving terrain geometry and destination paths. Existing world pause, reduced-motion and cinematic pet-hold behavior covers every pet.

## Proportions

Species base sizes: capybara 1.3, kitsune 1.05, sloth 0.9, Frenchie 0.75, cat 0.65. Every species then receives the requested **1.15×** multiplier. These are stylized relative sizes, not a claim of biologically exact scale; kitsune uses a fox-like interpretation. The capybara remains largest and the cat smallest; the guide remains taller. Perspective still affects screen appearance. Existing avatar size, artwork and animation are unchanged.

## Exact changed files

- `scripts/prepare-quest-pets.mjs`
- `assets/quest-preview/pet-reference-manifest.json`
- `public/quest-preview/pets/sloth.webp` (new)
- `public/quest-preview/pets/kitsune.webp` (new)
- `public/quest-preview/pets/frenchie.webp` (new)
- `lib/quest-preview/pet-sprites.ts`
- `lib/quest-preview/character-motion.ts`
- `lib/quest-preview/actors.ts`
- `lib/quest-preview/city-layout.ts` (walkway lane typing only)
- `components/quest-preview/pets.tsx`
- `components/quest-preview/scene.tsx`
- `tests/quest-actors.test.mjs`
- `tests/quest-character-motion.test.mjs`
- `tests/quest-classic.test.mjs`
- `tests/quest-restored-preview.test.mjs`
- `tests/quest-preview-http.test.mjs`
- This report.

Recovery snapshot: `.local-snapshots/quest-expanded-pets-before/baseline.tar.gz`.

## Validation

- Lint, typecheck and production build passed.
- Unit suite: 92 passed, including protected Portfolio hashes.
- Quest and website HTTP suite: 124 passed, zero failures/skips. Includes all five atlas files over HTTP, alpha bounds/foot alignment, gait frame ranges, species sizing and walkway simulations across scene editions.
- Focused simulation/atlas/size suite: 36 passed (included in broader checks).
- React best-practices review: stable keyed decorative elements, refs for frequent animation updates, no React state updates per walking frame, no new listeners/dependencies.
- `git diff --check` passed.
- Browser control timed out. No fresh desktop/mobile visual approval, screenshot or motion recording is claimed. Owner should review relative visual sizes and interactions in the live preview.

Preview server: `http://127.0.0.1:3100/quest-preview`; refresh to load the new pets. Protected Portfolio, other routes, avatar source art and automation were not changed. No installation, commit, push or deployment.
