# Tokyo seasons and scene transitions — 12 November 2026

Implemented only in `/quest-preview`, on `website/implementation`. Preserved
`/portfolio`, original entrance, avatar/pet assets and movement, automation and
existing uncommitted work. Recovery snapshot:
`.local-snapshots/quest-tokyo-transition-before-2026-11-12.*` (159 baseline files).

## What changed

The previous dissolve put a fixed 1440 × 980 illustration over a live WebGL view
whose camera changes with the viewport and pointer. Their positions and scale
could differ, producing a ghost image. WebGL transitions now copy the exact live
canvas immediately before updating the scene, then dissolve that canvas over
1100ms. No PNG encoding/image decode or additional render loop is needed.
Temporary snapshot pixel memory is released on completion, cancellation and
unmount. The illustrated fallback keeps its image dissolve. Sky interpolation
uses the same timing/easing. Reduced motion cancels the transition and switches
directly; controls and route access remain unchanged.

- Mount Fuji is 42% taller and 35% wider, with a proportionally deeper base.
- Spring: existing pink crowns now have individual five-petal blossoms and fallen
  petals beside the pond.
- Autumn: orange persimmons have stems/calyces; a harvest basket reinforces the
  seasonal detail. Existing autumn foliage remains.
- Winter: snow slope, tracks, boundary markers, skis/poles and an original small
  decorative skier. The skier is static scenery, not a skiing game or animated
  character. This is a stylized Japan-inspired composition, not a claim that a ski
  resort is located in central Tokyo.
- Fixed a reversed slope normal found in image review. Ground snow now uses snow
  material, preventing it from inheriting cloud drift (also corrects NYC winter).
- Regenerated fallback assets; 10 files changed, other cities/seasons stayed
  byte-identical. All 22 total 1,209,020 bytes; largest 70,810 bytes. Maximum scene
  geometry is Tokyo spring: 21,415 triangles, below the existing 24,000 budget.

## Validation actually performed

- Lint, TypeScript and production build passed; all 11 static pages generated.
- Existing unit suite: 92/92 passed.
- Preview/actors/isometric/Tokyo-transition suites: 38/38 passed (five new tests).
  Includes seasonal geometry distinctions, Fuji height/budget, live snapshot
  dimensions, animation cancellation/memory cleanup and stationary ground snow.
- Guide asset checks: 42 passed. Protected Portfolio/avatar fixtures: all 28 hash
  entries match. Whitespace checks passed.
- Production HTTP checks: 12/12 passed, including all existing routes/custom 404
  and preview assets.
- Live native Chrome: checked Tokyo spring, summer, autumn and winter at desktop
  1440px, with the larger mountain, blossoms, fruit and white ski slope visible.
  Checked repeated manual scene changes and city/season transition alignment.
  Desktop Return on Previous scene successfully changed summer to spring.
- At responsive 390 × 800, the full winter scene/mountain fit and both path links
  remained visible. Reduced-motion emulation disabled automatic tour, hid the
  redundant pause control and allowed immediate manual seasonal changes.
  Restored normal browser motion settings and desktop view afterward.
- Console showed existing Next CSS preload warnings; no error counter was shown.
- Inspected generated winter illustration and corrected the slope lighting before
  the final build. Browser screenshots were viewed but not saved as artifacts.

Physical mobile devices, Safari/Firefox, the full zoom/viewport matrix and measured
GPU frame-time comparisons were not rerun. The overall smoothness and art direction
still need owner review; successful automated checks do not constitute visual
approval. No new packages, services, third-party art, commit or deployment.

## Preview

http://127.0.0.1:3100/quest-preview

Local production server remains running. Previous/Next step the seasons and
cities; Auto tour toggles the existing 16-second loop. Restart if needed:
`npm run start -- --hostname 127.0.0.1 --port 3100`.

## Exact files changed in this pass

- `app/quest-preview/quest-preview.css`
- `assets/quest-preview/manifest.json`
- `components/quest-preview/scene.tsx`
- `docs/QUEST_TOKYO_TRANSITION_REVIEW.md`
- `lib/quest-preview/city-details.ts`
- `lib/quest-preview/palette.ts`
- `lib/quest-preview/renderer.ts`
- `lib/quest-preview/scene-transition.ts`
- `lib/quest-preview/tokyo-seasons.ts`
- `lib/quest-preview/world.ts`
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
- `tests/quest-tokyo-transition.test.mjs`
