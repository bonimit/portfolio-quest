# Main island entrance promotion — 2026-11-15

Implemented locally on `website/implementation` in `/Users/workspace/portfolio-quest-website`.

## Result

`/` now renders the latest shared island design from `/quest-preview`. Current City & Season and New Destination Scenes are both retained. Open Settings → Scene set → New destination scenes, then select Place. Tokyo autumn/day remains default; Season Changes starts OFF. All 11 newer destinations and their day/night artwork remain available.

Portfolio links to `/portfolio`; Adventure links to the playable AD1 prototype lineup at `/world`. The main HUD provides direct Selected Work access at `/work`. The preview route still exists, with a return-to-main link and Scene controls summary. Shared island labels now describe playable prototypes instead of coming soon/not playable.

No geometry, scene layout, island base, palette, art, sprite, pet size, walking logic, camera transition or rendering sources changed. The same existing scene, chat, Settings, keyboard/touch, reduced-motion, fallback and entry logic is reused. The old title-screen components and styles remain in the repository; previous root page is archived at `.local-snapshots/island-main-before-2026-11-15/baseline.tar.gz`. Extensive pre-existing uncommitted work is preserved.

## Validation

- `npm run lint`: PASS, zero warnings.
- `npm run typecheck`: PASS.
- `npm run build`: PASS.
- `npm test`: 103 PASS.
- `node --test tests/quest-*.test.mjs tests/website-http.test.mjs tests/adventure-http.test.mjs`: 140 PASS.
- `npm run test:assets`: PASS, 42 avatar crop/alpha/feet/border/dimension/budget checks.
- Ten immediate pre-promotion Portfolio source/effect/style hashes match, including the approved page description from the preceding task. Existing broader preservation regressions also pass.
- Root HTTP checks verify two path links, direct Selected Work access, Settings, New destination scenes, correct Adventure wording, metadata and referenced assets. Existing `/portfolio`, `/world`, conventional routes, custom 404, all city/place assets and geometry regressions remain passing.
- `git diff --check`: PASS.

Native Chrome inspection found owner activity; the attempted separate preview tab was rejected by the computer-use guard because Chrome had changed. No further UI actions were forced. Fresh visual, viewport, keyboard, touch, reduced-motion and entry-animation checks remain unverified. HTTP/build success is not visual approval.

## Exact changed files

- `app/page.tsx`
- `app/quest-preview/page.tsx`
- `components/quest-preview/restored/experience.tsx`
- `components/quest-preview/restored/guide.tsx` (shared-use comment only)
- `tests/website-http.test.mjs`
- `tests/quest-preview-http.test.mjs`
- `docs/PROJECT_BLUEPRINT.md`
- `docs/DESIGN_SYSTEM.md`
- `docs/AGENT_TASKS.md`
- `docs/ISLAND_MAIN_REVIEW.md`

## Preview

Main entrance: <http://127.0.0.1:3100/>. Existing development server also serves it at <http://127.0.0.1:3000/>. The production preview was rebuilt and restarted; the owner's development server was not stopped. No installed dependencies, automation changes, commits, merges, pushes or deployment. The replacement is local only.
