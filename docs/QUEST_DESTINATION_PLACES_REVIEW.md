# Added destination scenes and restored walking-camera entry

2026-11-12 — `/quest-preview`, branch `website/implementation`.

## What is implemented

The current eleven seasonal city scenes remain the default and their geometry is **byte-identical** to the pre-task baseline. A new fixture hashes each complete Float32 mesh; tests protect every scene and the restored-geometry renderer adapter. Existing fallback images are untouched. All previous source and review snapshots remain recoverable. New recovery snapshot: `.local-snapshots/quest-places-and-cinematic/before-1794476438473076000.tar.gz`.

A separate **New destination scenes** set adds eleven original procedural miniatures and twenty-two day/night fallback images. Shared floating-island geometry, avatar and pets remain; individual locations have different buildings, landscape landmarks and environmental storytelling:

| Group | Spring / Monsoon | Summer | Autumn | Winter |
|---|---|---|---|---|
| NYC | Central Park lake/boathouse/bridge | Coney Island boardwalk/wheel/beach | High Line planted railway/Hudson pier/warehouses | Rockefeller/Broadway-inspired Art Deco skyline, snow, holiday tree, rink and marquee |
| Japan | Kyoto canal/temple/blossoms | Okinawa village/red roofs/coral shore/boats | Nikko mountains/shrine/waterfall/maples | Hokkaido chalets/snow/ski slope/lift |
| Thailand | Bangkok canal market/boats/covered stalls/monsoon | Krabi karsts/palms/coast/long-tail boat | — | Chiang Mai/Doi Inthanon-inspired rolling mountains/twin pagodas/terraced gardens; no snow |

These are stylized original place studies, not licensed landmark models or literal geographic reproductions. Broader regional labels are explicit: Okinawa is labeled Okinawa, and Doi Inthanon is labeled Chiang Mai rather than Bangkok. Internal city keys retain existing seasonal behavior without renaming conventional routes.

Select **Scene settings → Scene set → New destination scenes**, then use Place or Previous/Next. Each set tours independently. Auto tour remains visibly Off until enabled; reduced motion disables automatic touring. Day/Night works in either set. The new scenes are additive, not replacements.

## Camera, character and accessibility

Reactivated the previously implemented reusable world-space camera, cached GPU atlas renderer and time-based destination machine. The restored page now shares the existing `QuestScene`, actor controller and cinematic renderer, with an adapter selecting its preserved geometry. Selection stops wandering, follows authored approach lanes with alternating sprite steps, aligns/enters/disappears, pushes the camera through the entrance and navigates to `/portfolio` or `/world`. Escape/Cancel before entry returns focus and interpolates the camera back; Enter now bypasses the sequence. Duplicate activation is guarded; mouse, touch and native keyboard links remain. Reduced motion, paused motion, unavailable WebGL/atlas and renderer failure navigate immediately. No CSS canvas zoom, external animation library or full-screen wipe was added. The avatar remains larger than the pets.

Removed the visible navigation/rotation arrow glyphs; Previous, Next, Reset view and Send use words. Keyboard arrow controls for map rotation remain available. Chat text, labels, disclosure, history, speaker labels, prompts, input, buttons and links use consistent 16px sans-serif text; bold weight supplies hierarchy. The guide is still explicitly **Scripted guide · Not AI**. No real AI, paid service, SDK, credentials, new font or external asset was added.

## Actual validation

- `npm run lint`: PASS, zero warnings.
- `npm run typecheck`: PASS.
- `npm run build`: PASS.
- `npm run test:unit`: 92 PASS, no failures/skips.
- `node --test tests/quest-*.test.mjs tests/website-http.test.mjs`: 103 PASS, no failures/skips.
- `python3 tests/guide-assets.py`: all 42 original avatar checks PASS.
- All 22 new WebPs decode at 1440×980, match current geometry/byte manifests and are served over HTTP. Models stay within the 24,000-triangle budget. Existing DPR/pixel limits and 30Hz activity rendering remain.
- All 110 out-of-scope task-baseline files, including protected Portfolio sources and avatar assets, still match; original eleven scene mesh hashes match; diff whitespace check PASS.

Live native Chrome observations: preserved Tokyo autumn scene; new High Line/Hudson and Okinawa daytime scenes; Doi Inthanon daytime scene; Rockefeller/Broadway at night with snow, holiday tree and lit windows. Screenshots were emitted in the conversation. The final small facade/mountain refinements were followed by geometry/image checks rather than a repeat of every browser view. Okinawa Portfolio entry visibly moved the avatar and camera and reached `/portfolio`. Adventure selection + Escape returned to the preview and restored link focus. At an actual 360×800 emulated viewport, both paths remained visible and the chat/input/Send control fit; reduced-motion emulation disabled touring/hid pause and followed Adventure directly to `/world`. Normal motion and desktop width were restored afterward.

This is smoke coverage. The complete city/place × day/night × viewport matrix, physical touch devices, 200% zoom, comprehensive screen-reader testing and a fresh full transition video set remain unverified. The native console showed image-preload warnings; no GPU shader error was observed. New art quality, scene composition, exact doorway alignment/occlusion in every scene and final motion feel still require owner visual review. A successful build is not visual approval.

## Preview

http://127.0.0.1:3100/quest-preview is running locally. Reload, then use Scene settings to switch sets. If stopped: `npm run build` then `npm run start -- --hostname 127.0.0.1 --port 3100`. Fallback artwork regeneration for the added set only: `node scripts/prepare-restored-quest-preview.mjs --places`.

No `/portfolio`, `/`, `/world`, other route implementation, source avatar artwork, automation, package/dependency, commit, push, merge or deployment changes.

## Exact changed files

- `app/quest-preview/quest-preview.css`
- `assets/quest-preview/restored/places-manifest.json`
- `components/quest-preview/restored/experience.tsx`
- `components/quest-preview/restored/guide.tsx`
- `components/quest-preview/restored/scene-controls.tsx`
- `components/quest-preview/restored/scene.tsx`
- `lib/quest-preview/city-layout.ts`
- `lib/quest-preview/destination-transition.ts`
- `lib/quest-preview/palette.ts`
- `lib/quest-preview/renderer.ts`
- `lib/quest-preview/restored/places.ts`
- `lib/quest-preview/restored/variants.ts`
- `lib/quest-preview/restored/world.ts`
- `lib/quest-preview/scene-config.ts`
- `lib/quest-preview/variants.ts`
- `lib/quest-preview/world.ts`
- `public/quest-preview/restored/place-canalmarket-day.webp`
- `public/quest-preview/restored/place-canalmarket-night.webp`
- `public/quest-preview/restored/place-centralpark-day.webp`
- `public/quest-preview/restored/place-centralpark-night.webp`
- `public/quest-preview/restored/place-coney-day.webp`
- `public/quest-preview/restored/place-coney-night.webp`
- `public/quest-preview/restored/place-highline-day.webp`
- `public/quest-preview/restored/place-highline-night.webp`
- `public/quest-preview/restored/place-hokkaido-day.webp`
- `public/quest-preview/restored/place-hokkaido-night.webp`
- `public/quest-preview/restored/place-inthanon-day.webp`
- `public/quest-preview/restored/place-inthanon-night.webp`
- `public/quest-preview/restored/place-krabi-day.webp`
- `public/quest-preview/restored/place-krabi-night.webp`
- `public/quest-preview/restored/place-kyoto-day.webp`
- `public/quest-preview/restored/place-kyoto-night.webp`
- `public/quest-preview/restored/place-nikko-day.webp`
- `public/quest-preview/restored/place-nikko-night.webp`
- `public/quest-preview/restored/place-okinawa-day.webp`
- `public/quest-preview/restored/place-okinawa-night.webp`
- `public/quest-preview/restored/place-rockefeller-day.webp`
- `public/quest-preview/restored/place-rockefeller-night.webp`
- `tests/fixtures/quest-current-city-geometry.json`
- `tests/quest-place-scenes.test.mjs`
- `tests/quest-preview-http.test.mjs`
- `tests/quest-restored-preview.test.mjs`
- `scripts/prepare-restored-quest-preview.mjs`

This report is the additional documentation file. Local recovery archives and validation logs are review artifacts, not public website assets.
