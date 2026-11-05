# Design System

Source: [Project Blueprint](PROJECT_BLUEPRINT.md), sections 8 and 9. Anything not stated there is **TBD** and must be decided by the owner before implementation. Do not invent values.

## 1. Principles (from the blueprint)
- Portfolio first, game second: editorial pages prioritize readability and evidence.
- Original artistic identity. No Nintendo (or other third-party) characters, art, music, maps or mechanics.
- Two visual registers: a colorful illustrated world UI, and a neutral, light, highly readable editorial UI. World overlays are consistent with each other but visibly different from article pages.
- Accessibility and performance requirements in blueprint section 9 apply to every component.

## 2. Art direction
- World: high-resolution whimsical illustrated characters and backgrounds, soft layers, bold colors, curved paths, appealing transitions, subtle squash/stretch. Pixelated assets are not the default.
- Perspective: 3/4 view.
- Characters: one original guide mascot (persistent across both modes) and original selectable avatars (Phase 2 starts with 1 working avatar; the final experience supports 3 selectable avatars).
- Editorial: neutral/light background, elegant modern typography, generous white space, image captions. Small illustration motifs may connect to the adventure UI.
- Mascot, game title (working name "Portfolio Quest") and art style: **TBD, owner approval required**.

## 3. Design tokens
A single source of truth is required (implementation location TBD, created in Phase 0, Task 2). Categories:

| Token group | Status |
|---|---|
| Color palette (brand, neutrals, semantic, world vs editorial) | TBD |
| Type scale and font families | TBD |
| Spacing scale | TBD |
| Responsive breakpoints | TBD (shell must work at 360px and 1280px) |
| Shadows / elevation | TBD |
| Icon sizes | TBD |
| z-index layers (page, nav, overlay, dialog, game canvas) | TBD names and values |
| Motion durations/easing | TBD |

Temporary values used in early phases must be clearly named as temporary.

## 4. Components and patterns
- Shared: header nav, footer, skip link, mode switch (Start Adventure / View Portfolio), buttons, links, dialogs, focus styles.
- Portfolio: project card (title, hero image, one-sentence description, role, discipline, industry, status, link), filters, project summary.
- Editorial: case-study chapter blocks, sticky chapter nav, mobile table of contents, image with caption and alt text, gallery, metric, quote, process steps.
- Game UI: overlays, map overlay, interaction prompt, project preview, dialogue box, controls help.
- Guide: sprite, search panel, result cards.
- Visual details for each of the above: **TBD**.

## 5. Interaction and accessibility rules
- Keyboard: WASD/arrows move, E or Enter interacts, Esc closes overlays or opens the menu.
- Every game destination and guide action has a DOM-based alternative that works without the canvas (approved decision).
- Visible focus, labeled dialogs, focus management when overlays open and close, skip links.
- Reduced-motion preference honored; music off by default; mute control; visible instructions.
- Color contrast verified (target level: WCAG 2.1 AA unless the owner decides otherwise — confirm, **TBD**).
- Touch targets sized for touch; minimum size **TBD**.
- Mobile visitors default to editorial mode (approved decision).

## 6. Asset rules
- Keep editable source artwork where possible; export optimized WebP/PNG atlases.
- Record provenance, license and alt description for every asset.
- Define sprite states and sizes before mass asset creation. Guide states: idle, walking, thinking, talking, pointing, celebrating. Avatars: idle/walk in 4 directions.
- Sprite dimensions, atlas budgets, and who produces the art: **TBD**.

## 7. Open decisions
- Mascot and avatar designs
- Palette, typography, spacing, breakpoints
- Contrast target and touch-target minimum
- Sprite sizes and asset budgets
- Touch controls in the game (also listed in the blueprint)
