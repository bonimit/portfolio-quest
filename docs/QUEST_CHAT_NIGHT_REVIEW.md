# Preview chat, night lighting and seasonal identity — 12 November 2026

Branch: `website/implementation`. Scope: `/quest-preview` only. Orange Portfolio,
original entrance, shared guide provider, source sprites, avatar/pet movement and
`automation/` preserved. Existing uncommitted work retained. Recoverable snapshot:
`.local-snapshots/quest-chat-night-before-2026-11-12.*` (163 baseline files).

## Chat repairs

- Conventional conversation structure: identity/disclosure, bounded scrollable
  history with distinct user/guide messages, compact example pills, fixed composer.
  Keeps the background visible, paper/orange identity and no enclosing chat card.
- Replaced the disconnected underline input with a two-line rounded composer.
  Explicitly resets inherited form spacing, send-button minimum width and shadow.
  Focus outlines the stable wrapper; 16px text avoids mobile input zoom.
- Enter sends, Shift+Enter inserts a newline, IME composition/confirmation never
  sends. Textarea resizing disabled to preserve the viewport layout. Native label,
  keyboard instructions, error state, live reply announcement and Escape preserved.
- Pills have smaller visible borders while retaining 44px button hit height.
- Message history stays above the input; added ResizeObserver anchoring after a
  browser check exposed the latest reply being partly hidden after resizing.
  Observer cleans up on unmount. Disclosure remains “Scripted guide · Not AI”.

## Lighting and seasons

- Daylight-strength night key light was the primary luminance issue. Night now
  uses substantially dimmer, cooler moonlight and blue indirect ground lighting.
- Night has its own light direction and regenerated shadow map; shadow floor is
  softer than daylight. Wet nights soften further. Cloud illumination is reduced
  independently; windows/lanterns keep localized warm highlights.
- Darkened night backgrounds, including the previously too-light rain backdrop.
- CPU fallback generation uses the matching day/night shadow direction, ground
  fill, cloud brightness and window treatment, rather than reusing day shadow data.
- Added original seasonal installations, clear of destination approaches:
  NYC spring flower beds, summer parasols/picnic blanket, autumn pumpkins; existing
  winter snow remains. Tokyo summer festival streamers/fans complement existing
  spring blossoms, autumn persimmons and winter skier/snow. Bangkok summer tropical
  flowering planters/lotus, rain shelter/barrels and cool-season lantern market.
  Buildings remain recognizable across seasons; this is seasonal scene dressing,
  not a different city layout on every stop. No Bangkok snow.
- Regenerated 22 fallback WebPs: 1,115,382 bytes total, largest 66,536 bytes.
  Maximum geometry 21,415 triangles (existing 24,000 budget). No package installed,
  new runtime dependency, external artwork, service, commit or deployment.

## Actual validation and limits

- `npm run lint`, `npm run typecheck`, `npm run build`: passed; 11 static pages.
- Existing unit suite: 92/92 passed.
- Preview/actor/isometric/Tokyo/chat-night suites: 42/42 passed, including four new
  tests for composer keys/IME, night parameters, seasonal props and decoded image
  luminance across all 11 day/night pairs. Each rendered night mean luminance is
  below 80% of day and above 22%, avoiding a near-black fallback.
- Guide assets: 42 checks passed. Portfolio/avatar protected fixtures: all 28 hash
  entries match. HTTP suites: 12/12 passed on the final production build.
- `git diff --check`: passed. An initial overly strict blue-channel assertion
  rejected deliberately blue winter moonlight; corrected its bound to 70% of day.
  Pixel luminance tests passed throughout; no failing test remains.
- Reviewed all 22 generated scenes in labeled contact sheets:
  `.local-snapshots/quest-chat-night-day-review.png` and
  `.local-snapshots/quest-chat-night-night-review.png`. These are rendered asset
  reviews, not screenshots of all live WebGL combinations.
- Live native Chrome: desktop focused textarea stayed aligned, small pills and
  message treatments visible; Enter submitted a valid reply; Shift+Enter preserved
  a newline and subsequent Enter sent it. Night preview showed warm windows,
  dimmer clouds, cool ground and readable conversation text. At 390 × 800 both
  paths, composer, chips and history remained within the viewport.
- The 390px history-resize issue was found during that check and fixed afterward.
  Final resize anchoring was source/build verified but could not be rechecked live
  because the browser was in use. Do not treat that specific fix as visually signed
  off. Representative live scene was NYC; all Tokyo/Bangkok night variants were
  checked in generated assets, not individually in WebGL this pass.
- Console had existing Next CSS preload warnings. Full viewport/zoom/reduced-motion
  matrix, physical software keyboard, IME hardware and screen-reader output were
  not rerun. Reduced-motion behavior remains in the existing scoped rules.

## Preview

http://127.0.0.1:3100/quest-preview

Production server remains running. Restart if needed:
`npm run start -- --hostname 127.0.0.1 --port 3100`.

## Exact changed files in this pass

- `app/quest-preview/quest-preview.css`
- `assets/quest-preview/manifest.json`
- `components/quest-preview/guide.tsx`
- `docs/QUEST_CHAT_NIGHT_REVIEW.md`
- `lib/quest-preview/chat-composer.ts`
- `lib/quest-preview/palette.ts`
- `lib/quest-preview/renderer.ts`
- `lib/quest-preview/season-details.ts`
- `lib/quest-preview/world.ts`
- `public/quest-preview/bangkok-raining-day.webp`
- `public/quest-preview/bangkok-raining-night.webp`
- `public/quest-preview/bangkok-summer-day.webp`
- `public/quest-preview/bangkok-summer-night.webp`
- `public/quest-preview/bangkok-winter-day.webp`
- `public/quest-preview/bangkok-winter-night.webp`
- `public/quest-preview/nyc-autumn-day.webp`
- `public/quest-preview/nyc-autumn-night.webp`
- `public/quest-preview/nyc-spring-day.webp`
- `public/quest-preview/nyc-spring-night.webp`
- `public/quest-preview/nyc-summer-day.webp`
- `public/quest-preview/nyc-summer-night.webp`
- `public/quest-preview/nyc-winter-day.webp`
- `public/quest-preview/nyc-winter-night.webp`
- `public/quest-preview/tokyo-autumn-day.webp`
- `public/quest-preview/tokyo-autumn-night.webp`
- `public/quest-preview/tokyo-spring-day.webp`
- `public/quest-preview/tokyo-spring-night.webp`
- `public/quest-preview/tokyo-summer-day.webp`
- `public/quest-preview/tokyo-summer-night.webp`
- `public/quest-preview/tokyo-winter-day.webp`
- `public/quest-preview/tokyo-winter-night.webp`
- `scripts/prepare-quest-preview.mjs`
- `tests/quest-chat-night.test.mjs`
