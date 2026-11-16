# Independent seasonal scenes

Implemented on `website/implementation`, 2026-11-12. Scope: the isolated
`/quest-preview`. The approved `/portfolio` and the current `/` are unchanged.

## What changed

The active world assembly no longer builds one city base and adds seasonal
dressing. Eleven named builder functions now create eleven complete compositions.
Ground outlines, architecture, paving and landscape arrangements differ. Day and
night are lighting views of each composition, producing 22 fallback illustrations.

| City | Season | New setting |
| --- | --- | --- |
| NYC | Spring | Glass conservatory, flowering pavilion, fountain garden |
| NYC | Summer | Hudson timber pier, boathouse, sail pavilion, distant towers |
| NYC | Autumn | Columned museum, clockhouse, harvest market, brick civic square |
| NYC | Winter | Art Deco station, crystalline hall, snowy rail plaza |
| Tokyo | Spring | Lakeside tea house, blossom pergola, picnic garden |
| Tokyo | Summer | Merchant building, festival theater, lantern street |
| Tokyo | Autumn | Balcony ryokan, persimmon shop, river bridge, maple terrace |
| Tokyo | Winter | A-frame chalet, gondola station, ski field, snowy Fuji |
| Thailand | Rainy | Stilt house, ferry pier, boats, curved canal dock |
| Thailand | Summer | Golden sala, temple portal, chedi, tiled fountain court, tuk-tuk |
| Thailand | Cool | Mountain lodge, lantern pavilion, planted terraces |

These are stylized navigation settings, not claims of accurately modeled real
buildings. The existing northern Thai winter mood remains labeled as such.

Low-level modeling primitives, the cloud sky style and the Tokyo Fuji modeling
helper remain shared for visual consistency. Complete city bases and destination
buildings are not reused between seasons. Fixed destination approach coordinates
preserve the existing avatar walking and building-entry contract. Per-scene roof
bounds and destination labels now match the new settings. Existing smooth scene
transitions, orbit, pause, reduced motion, sprites and movement are unchanged.

## Preservation

Before editing, 174 existing files were hashed and archived in:

- `.local-snapshots/quest-independent-scenes-before-2026-11-12.json`
- `.local-snapshots/quest-independent-scenes-before-2026-11-12.tar.gz`

The baseline comparison shows changes only in the files listed below. All
protected Portfolio/avatar fixture hashes pass. Old separate city-detail and
season-detail helper files remain preserved but are no longer called by the active
world builder. No `automation/`, dependencies, sprite artwork, walking logic,
Portfolio assets, typography or motion files were changed.

## Actual validation

- `npm run lint`: pass, zero warnings.
- `npm run typecheck`: pass.
- `npm run build`: pass, all 11 static pages generated.
- `npm run test:unit`: 92/92 pass.
- Seven Quest unit suites: 51/51 pass. Coverage includes all eleven independent
  builders, finite geometry, camera/rotated target bounds, transition cleanup,
  day/night lighting, and protected-file hashes.
- New structural regression excludes clouds, compares triangle coordinates and
  rejects seasonal pairs sharing 35% or more of the smaller structural assembly.
  The image regression requires at least 30% changed shared opaque daytime pixels.
  These are regression safeguards, not a substitute for art-direction approval.
- `npm run test:assets`: 42 measured avatar crops pass.
- Production HTTP suites: 12/12 pass, including conventional routes, custom 404,
  preview links and all 22 fallback assets.
- `git diff --check`: pass.
- Scene geometry: 5,497–12,490 triangles, below the existing 24,000 budget.
- Fallbacks: 1440×980 WebP, 23,710–47,398 bytes each. No downloaded artwork or
  new runtime library is needed.

## Visual observations and limits

Reviewed all eleven daytime and nighttime CPU fallback renders in comparison
sheets, saved in `.local-snapshots/quest-independent-scenes-day-review.png` and
`.local-snapshots/quest-independent-scenes-night-review.png`. These are generated
illustration comparisons, not browser screenshots.

Native Chrome production preview: observed the NYC conservatory, navigated through
the tour to the Tokyo alpine scene and Thai mountain retreat, checked the pause
status and day/night switch. Inspected actual rendered layouts at 360×800,
768×800 and 1280×800 using Chrome responsive mode. The map, destination links,
guide and scene controls remained in frame in those inspected states. Desktop
labels identify the new lodge and lantern pavilion; narrow layouts retain both
path choices above the map. The snowy Fuji scene includes the static skier and
gondola scenery. Scene changes retain the existing dissolve.

Chrome showed existing CSS preload warnings. Its console displayed no error
counter during this inspection. Live screenshots were inspected through the
browser tool, not saved as separate files. Full device, touch-drag, screen-reader,
200% zoom and reduced-motion browser matrices were not repeated for this scenery
change. Their existing source/test coverage remains passing; final visual quality
and all-angle sprite depth/occlusion still need owner review. The guide remains
scripted and Adventure remains non-playable.

## Exact files changed for this task

New source:

- `lib/quest-preview/scene-config.ts`
- `lib/quest-preview/scenes/index.ts`
- `lib/quest-preview/scenes/kit.ts`
- `lib/quest-preview/scenes/nyc.ts`
- `lib/quest-preview/scenes/tokyo.ts`
- `lib/quest-preview/scenes/bangkok.ts`

Modified source/tests:

- `components/quest-preview/experience.tsx`
- `lib/quest-preview/building-interaction.ts`
- `lib/quest-preview/palette.ts`
- `lib/quest-preview/world.ts`
- `tests/quest-chat-night.test.mjs`
- `tests/quest-season-scenes.test.mjs`
- `tests/quest-tokyo-transition.test.mjs`
- `assets/quest-preview/manifest.json`

Regenerated assets (both `day.webp` and `night.webp` for each prefix):

- `public/quest-preview/nyc-spring-`
- `public/quest-preview/nyc-summer-`
- `public/quest-preview/nyc-autumn-`
- `public/quest-preview/nyc-winter-`
- `public/quest-preview/tokyo-spring-`
- `public/quest-preview/tokyo-summer-`
- `public/quest-preview/tokyo-autumn-`
- `public/quest-preview/tokyo-winter-`
- `public/quest-preview/bangkok-raining-`
- `public/quest-preview/bangkok-summer-`
- `public/quest-preview/bangkok-winter-`

Documentation: this file. Local review artifacts: the two comparison PNGs and two
recovery files listed above. Other uncommitted work remains preserved.

## Preview

http://127.0.0.1:3100/quest-preview — production server is running locally.
Use **Next** to compare all 11 settings; **Pause world** holds the current scene.
The visible tour status distinguishes On, Paused and Off. If restarting:

```sh
cd /Users/workspace/portfolio-quest-website
npm run build
npm run start -- --hostname 127.0.0.1 --port 3100
```

No commit, push, merge, deployment or paid service.
