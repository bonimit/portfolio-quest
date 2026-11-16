# New Destination Scenes refresh — 2026-11-14

Implemented only the New Destination Scenes collection in `/quest-preview`. The Current City and Season collection remains byte-identical: 39 captured source/art/manifest files pass SHA-256 comparison, and existing tests confirm the eleven current geometry hashes. The original rocky island mesh is identical in every new destination. Camera settings, ground approach paths, entry targets, navigation, avatar, pets, chat, shared shell, protected Portfolio and automation were not edited.

Recovery: `.local-snapshots/quest-destination-refresh-before/baseline.tar.gz`; preservation baseline in the same folder as `protected.json`. Existing uncommitted work was retained.

## New compositions

These are original procedural tourist-inspired miniatures, with deliberately condensed geography and game destination doors. They are not surveyed reconstructions or imported landmark models. Shared construction helpers provide details, while each destination authors its own buildings, heights, environmental layout and landmark silhouette.

| Destination | Distinct scene elements |
| --- | --- |
| Central Park | Bow Bridge-inspired arched crossing over a lake, rowboat, low boathouse, open pavilion, flowering lawns and a broken distant Manhattan skyline |
| Coney Island | Broad seaside boardwalk, large observation wheel, separate lattice Parachute Jump-inspired tower, striped ticket house and carousel-like pavilion |
| High Line & Hudson | Elevated diagonal steel rail garden with rails, sleepers and planting, river edge/pier, sawtooth warehouse and industrial elevator entrance |
| Rockefeller & Broadway | Stepped Art Deco skyline, channel garden beds, skating rink, holiday tree, cleared snow and illuminated theatre marquee |
| Kyoto canal walk | Cherry-lined linear canal, multiple stone crossings, timber-lattice machiya and substantial two-level temple gate |
| Okinawa | Taketomi-inspired low red-tiled village, coral walls, small original shisa silhouettes, sandy shore, fishing boats and palms |
| Nikko | Nantai-inspired mountain mass, lake, vertical Kegon-inspired waterfall, arched red bridge, cedar-like pines and an ornate shrine gateway |
| Niseko, Hokkaido | Broad Yotei-inspired snow cone, diagonal ski slope, lift towers/chairs, low Japanese ski lodge and a lift-station entrance |
| Bangkok canal market | Taling Chan-inspired working khlong, stilted timber houses, produce boats/stalls, footbridge, covered market entrance and tuk-tuk |
| Krabi coast | Railay-inspired tall limestone amphitheatre, two coves, beach hut, palms, long-tail boats and natural rock-cave entrance |
| Doi Inthanon | Paired summit chedis, terraced flower gardens, northern mountain ridge, observation boardwalk and visitor lodge; no snow |

Place labels/descriptions now identify the specific inspirations and acknowledge condensed interpretation. NYC/Tokyo/Bangkok grouping and all existing place IDs are retained. No new paid service, library or downloaded imagery.

## Source references

Used for architectural/environmental cues only, without copying photographs, branding or prose:

- Bow Bridge and lake/rowing setting: [Central Park Conservancy — Bow Bridge](https://www.centralparknyc.org/locations/bow-bridge), [Boating](https://www.centralparknyc.org/activities/guides/boating).
- Boardwalk and Parachute Jump: [NYC Parks — Coney Island](https://nycgovparks.org/parks/coney-island-beach-and-boardwalk).
- Preserved rail tracks and planted industrial structure: [High Line design statement](https://assets.thehighline.org/pdf/high_line_at_the_rail_yards_press_kit.pdf).
- Cherry canopy and canal: [Kyoto Travel — Philosopher’s Path](https://kyoto.travel/en/destinations/philosophers-path-tetsugakunomichi/).
- Red-tiled kominka and shisa: [Official Okinawa Travel Guide](https://visitokinawajapan.com/travel-inspiration/okinawa-traditional-house-kominka/).
- Nikko lake/waterfall landscape: [JNTO — Kegon Falls](https://www.japan.travel/en/japans-local-treasures/kegon-falls/), [Nikko Official Guide](https://www.visitnikko.jp/itineraries/the-best-of-nikkos-nature/).
- Niseko skiing and Yotei backdrop: [Niseko Tourism](https://www.nisekotourism.com/more-to-niseko/travel).
- Working canal market: [Tourism Authority of Thailand — Talingchan](https://www.tourismthailand.org/Attraction/talingchan-floating-market).
- Railay cliffs/long-tail setting: [Tourism Authority brochure hosted by Thailand MFA](https://image.mfa.go.th/mfa/0/uK8Kxy2oDV/E_Brochure_TAT_2024_English_Version.pdf).
- Inthanon paired pagodas: [Tourism Authority of Thailand brochure](https://api.tat.or.th/upload/live/multimedia/9730/Connecting_to_spiritual_Thailand.pdf).

## Exact files changed

Source and checks:

- `lib/quest-preview/restored/places.ts`
- `lib/quest-preview/restored/place-scenes/details.ts` (new)
- `lib/quest-preview/restored/place-scenes/new-york.ts` (new)
- `lib/quest-preview/restored/place-scenes/japan.ts` (new)
- `lib/quest-preview/restored/place-scenes/thailand.ts` (new)
- `tests/quest-destination-refresh.test.mjs` (new)
- `tests/fixtures/quest-destination-refresh-protected.json` (new)
- `tests/quest-place-scenes.test.mjs` (stale visible-Send-text assertion updated to match the owner's previously approved accessible paper-plane button)
- `assets/quest-preview/restored/places-manifest.json`
- `public/quest-preview/destination-review.html` (new comparison contact sheet)
- This report.

Regenerated artwork, exclusively under `public/quest-preview/restored/`:

| Day file | Night file |
| --- | --- |
| `place-centralpark-day.webp` | `place-centralpark-night.webp` |
| `place-coney-day.webp` | `place-coney-night.webp` |
| `place-highline-day.webp` | `place-highline-night.webp` |
| `place-rockefeller-day.webp` | `place-rockefeller-night.webp` |
| `place-kyoto-day.webp` | `place-kyoto-night.webp` |
| `place-okinawa-day.webp` | `place-okinawa-night.webp` |
| `place-nikko-day.webp` | `place-nikko-night.webp` |
| `place-hokkaido-day.webp` | `place-hokkaido-night.webp` |
| `place-canalmarket-day.webp` | `place-canalmarket-night.webp` |
| `place-krabi-day.webp` | `place-krabi-night.webp` |
| `place-inthanon-day.webp` | `place-inthanon-night.webp` |

The existing generation script was run with `--places`; it was not changed. It writes the new collection's images/manifest only.

## Validation evidence

- Lint: passed, zero warnings.
- Typecheck and production build: passed.
- Unit suite: **92 passed**, including protected Portfolio hashes.
- Quest plus website HTTP suite: **129 passed**, zero failures/skips. Five new checks cover 39 protected files, identical rocky base geometry, bounded/distinct live geometry matching the new manifest, winter-specific material treatment and transparent image borders.
- Focused destination/current-scene suite: **12 passed** (included above).
- Both cinematic destinations complete in simulation for all eleven new places; existing cancellation checks pass.
- Full image borders are transparent in every day/night fallback, confirming no silhouette is cut by the image boundary. Initial Coney wheel, Rockefeller tower and Krabi cliff clipping was found during inspection and corrected through model height changes, without changing the camera.
- Geometry: 7552–14626 triangles per new scene, below the 24000-triangle test budget. All 22 fallback images total **929858 bytes**.
- `git diff --check`: passed.
- Comparison page: HTTP 200, eleven cards, twenty-two image references. Initial 404 after adding the static file was resolved by restarting the local server so Next could refresh its public-file inventory.
- Visually inspected rendered files for all eleven day scenes; rechecked the three corrected silhouettes and Okinawa/Inthanon at night. These are CPU renders from the same geometry, not live browser screenshots.
- Native browser testing was interrupted by concurrent owner activity in another design/video tab. No claim is made of fresh live WebGL, mobile, touch, keyboard, 200% zoom or reduced-motion visual approval. Existing interaction code and controls remain unchanged; owner review should assess the complete live composition and door approach framing.

## Preview and review

- Comparison: `http://127.0.0.1:3100/quest-preview/destination-review.html`.
- Interactive: `http://127.0.0.1:3100/quest-preview` → Scene controls → Scene set → New destination scenes → choose Place. Day/night remains in the top control; Previous/Next and Season Changes retain the existing behavior.
- Default arrival remains the preserved Tokyo autumn Current City scene; it was not switched automatically.
- Remaining review: owner art-direction approval, live framing at intended desktop/mobile sizes, and geographic recognizability. These are stylized interpretations, with some intentional simplifications and a shared functional approach corridor.

No installations, commits, pushes, merges or deployment.
