# New destination detail pass — 2026-11-14

Implemented on `website/implementation`, limited to New Destination Scenes in `/quest-preview`.

## Changes

- Okinawa: eight differently sized islets around the surf break, asymmetric green hills, sandy rims, foam, palms, reefs, surfboard stripes/fins, a beach shower and hut lanterns.
- Shared destination construction: framed windows with mullions, inset door panels, eave trim, boat ribs/gunwales and bridge fascia.
- Central Park: masonry, quoins, flag and bridge planters. Movie lawn: speakers, booth shutter, festoon wire and picnic details.
- High Line: masonry, fire escape and rail-deck planting. Rockefeller: gifts, garlands and rink details.
- Kyoto: lanterns, bamboo rail and stone lamps. Nikko: waterfall foam, roof brackets and viewing rail. Hokkaido: ski racks, tracks and small snowmen.
- Canal market: lanterns, produce crates and balcony rails. Krabi: more varied cliff foliage, vines, mooring and foam details.
- Doi Inthanon: curved flower beds, topiary and gold trim instead of rectangular flower grids.

The original rocky island mesh, Current City and Season scenes, avatar/pet art and behavior, destination navigation and protected Portfolio implementation are preserved. Recovery snapshot: `.local-snapshots/quest-destination-detail-before/baseline.tar.gz`.

## Exact changed files for this pass

- `lib/quest-preview/restored/places.ts`
- `lib/quest-preview/restored/place-scenes/details.ts`
- `lib/quest-preview/restored/place-scenes/polish.ts` (new)
- `lib/quest-preview/restored/place-scenes/thailand.ts`
- `tests/quest-destination-refresh.test.mjs`
- `assets/quest-preview/restored/places-manifest.json`
- `public/quest-preview/destination-review.html`
- `docs/QUEST_DESTINATION_DETAIL_REVIEW.md` (this file)
- `public/quest-preview/restored/place-centralpark-day.webp`
- `public/quest-preview/restored/place-centralpark-night.webp`
- `public/quest-preview/restored/place-coney-day.webp`
- `public/quest-preview/restored/place-coney-night.webp`
- `public/quest-preview/restored/place-highline-day.webp`
- `public/quest-preview/restored/place-highline-night.webp`
- `public/quest-preview/restored/place-rockefeller-day.webp`
- `public/quest-preview/restored/place-rockefeller-night.webp`
- `public/quest-preview/restored/place-kyoto-day.webp`
- `public/quest-preview/restored/place-kyoto-night.webp`
- `public/quest-preview/restored/place-okinawa-day.webp`
- `public/quest-preview/restored/place-okinawa-night.webp`
- `public/quest-preview/restored/place-nikko-day.webp`
- `public/quest-preview/restored/place-nikko-night.webp`
- `public/quest-preview/restored/place-hokkaido-day.webp`
- `public/quest-preview/restored/place-hokkaido-night.webp`
- `public/quest-preview/restored/place-canalmarket-day.webp`
- `public/quest-preview/restored/place-canalmarket-night.webp`
- `public/quest-preview/restored/place-krabi-day.webp`
- `public/quest-preview/restored/place-krabi-night.webp`
- `public/quest-preview/restored/place-inthanon-day.webp`
- `public/quest-preview/restored/place-inthanon-night.webp`

## Validation evidence

- `npm run lint`: passed, zero warnings.
- `npm run typecheck`: passed.
- `npm run build`: passed, all existing routes retained.
- `npm run test:unit`: 92 passed, zero failures.
- `node --test tests/quest-*.test.mjs tests/website-http.test.mjs`: 132 passed, zero failures against production server on port 3100.
- `npm run test:assets`: passed, 42 measured crops, alpha/feet/border/dimension/byte checks.
- `git diff --check`: passed.
- Preservation regression verifies 39 protected source/art/manifest hashes, all original city geometry, unchanged current palettes and the exact original rocky island prefix in all 11 destinations.
- New regression checks eight varied Okinawa islets and their separation from walking corridors.
- All 22 destination fallback images regenerated; combined size 1,010,132 bytes. Meshes remain below the existing 24,000-triangle ceiling.

Native Chrome: opened the comparison gallery, entered `/quest-preview`, selected New Destination Scenes and Okinawa using native select controls and keyboard, then verified live day and night rendering with screenshots. The gallery exposes all 11 day/night pairs with image descriptions. Inspected generated Okinawa and Doi Inthanon day artwork separately. These checks are not a complete mobile, zoom, performance or every-destination visual approval. No browser video recorded; no claims of those unperformed checks.

## Preview and remaining review

Server: `npm run start -- --hostname 127.0.0.1 --port 3100` after a build, or `npm run dev -- --port 3100` for editing.

- Interactive: <http://127.0.0.1:3100/quest-preview>
- Day/night comparison: <http://127.0.0.1:3100/quest-preview/destination-review.html>
- Select Scene controls → Scene set → New destination scenes → Place.

Default Current City Tokyo remains unchanged; automatic season changes remain off until enabled. Owner review is still needed for the added detail density, island silhouettes and overall visual quality. These are stylized destination interpretations, not literal maps. Live mobile/touch, 200% zoom and all-destination night review remain unverified in this pass. No installations, automation changes, commits or deployment.
