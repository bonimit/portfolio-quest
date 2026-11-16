# Quest preview: walking guide and pets

Implementation remains on `/quest-preview`, branch `website/implementation`.
The existing `/`, `/portfolio`, `/world` and all other destinations are unchanged.
The city system still has 22 variants: NYC 8, Tokyo 8, Bangkok 6. No playable RPG
or live AI service is claimed.

## Implemented behavior

### Destination approach

The two primary controls remain native Next.js links to `/portfolio` and `/world`.
An ordinary activation with animation available starts a short approach toward
the chosen landmark, with turn frames and distance-synchronized walking frames.
After 1,700ms navigation opens the existing route. The approach covers up to 3.2
world units at a readable pace; it does **not** require waiting for a full island
crossing or pretend to enter a playable doorway.

The selected link keeps focus. A small transition status offers **Enter now**
and **Cancel**; Escape cancels and returns focus to the selected link. Repeated
selections replace the previous timer/path. Pausing or enabling reduced motion
cancels a pending walk without stealing focus from the setting being changed.
Modified clicks, paused/reduced-motion activations, unloaded sprite assets and
offscreen actors retain immediate native navigation. No full-screen wipe,
backdrop, focus trap or inert content is introduced.

### Guide and idle invitation

A preview-only virtual-clock controller moves the original sprite in world X/Z
coordinates, then projects its feet through the scene camera. It reuses the
existing measured atlas, SpritePlayer, turn sequence and distance-based gait;
none of their shared source or art files were edited. Scale follows camera units
instead of being a fixed desktop-size sticker. The visible character can become
small on phones, while its button remains at least 44px wide and its caption
remains readable. Movement uses transforms; React does not rerender each frame.

The guide wanders among a small set of clear foreground waypoints. Hover,
keyboard focus, touch contact and conversation stop its wandering. It faces the
visitor and can wave; closing the companion permits wandering again while
preserving keyboard focus behavior. The original scripted companion still uses
its existing response cues and honest **Scripted guide · Not AI** disclosure.

After 10 seconds of eligible inactivity, a small, nonmodal invitation asks which
path to try and explains Portfolio versus the coming-soon Adventure preview.
Pointer movement, pointer/touch presses and keyboard input reset the inactivity
timer. Editing, open settings, conversation, transitions, pause, hidden documents
and an offscreen scene suppress the invitation. This intentionally treats keyboard
and touch activity as activity too, rather than interrupting someone typing just
because the mouse is still. It never moves focus or repeatedly announces itself.
Ask Wayfinder opens the guide; Dismiss removes the invitation. The invitation is
shown once per scene activation, with a brief wave when motion is permitted.
Reloading or explicitly switching illustrated/WebGL mode starts a new activation.

### Pets and enlarged terrain

The terrain expands from roughly 12×9.2 to 14×11.6 world-unit radii, with a longer
foreground path, repositioned guide plaza, two pet clearings and a water bowl.
The city landmarks, architecture and established groves keep their sizes and
positions. The camera's framing expands with the ground rather than enlarging
all props together.

Both pets are original, low-poly procedural meshes:

- **Capybara:** rounded brown body, broad muzzle, small ears and a leaf cap,
  informed by the supplied `mascot-capybara/00.png` and `04.png` references.
- **Frenchie:** compact body, broad head/muzzle, upright bat ears, cream chest
  and short tail. No Frenchie reference was present in the inspected folder.
  This is an **original breed placeholder**, not a verified likeness of the
  owner's pet. The wombat images were inspected to identify them, not relabeled
  as a Frenchie or bundled into the site.

No source PNGs were copied into public assets and no redistribution license was
inferred for them. The new meshes are code-derived studies; owner review of the
pet likeness and art direction remains necessary. Existing local fonts and
character provenance are unchanged.

Each pet follows independent, deterministic clear-zone routes, with staggered
starts, different speeds and rest intervals. Four leg groups animate from
distance traveled, with restrained body bob and floor contact patches. They do
not cross the guide's central route or overlap the DOM path controls. This is
bounded choreography, not a collision/physics engine or a free-roaming game.
The illustrated fallback contains static versions of both pets; guide navigation
and conversation remain available. Reduced motion/pause freezes motion.

## Technical structure and performance limits

- `lib/quest-preview/actors.ts`: pure virtual-clock simulation, polyline sampling,
  bounded destination approaches, wander/rest schedules, native-navigation and
  idle-prompt eligibility policies.
- `components/quest-preview/actors.tsx`: browser RAF/timer driver, visibility and
  focus handling, original sprite player, imperative navigation/cancel/greeting.
- `lib/quest-preview/pets.ts`: two original meshes, leg-part indices, model
  matrices and static fallback export.
- `scene.tsx` and `renderer.ts`: camera projection, composited DOM actor position,
  three shaded draws (world + two pets), per-pet model/gait uniforms and cleanup.
- `idle-prompt.tsx`: guarded inactivity listener/timer and nonmodal invitation.

The 11 city/season geometry configurations are still shared across day/night.
Only city/season changes reupload world geometry; time updates lighting/materials.
The maximum scene including both pets is 10,885 triangles; pets contribute 3,786.
The 22 regenerated 1440×980 fallback WebPs total 951,230 bytes, each 39,368–47,356
bytes. Only the selected illustration is requested. Six historical fallback files
remain unchanged and unused by current settings.

Animation clocks are limited to 30fps while needed. Resting actors use a timer
instead of an idle RAF loop. Hidden/offscreen/paused scenes stop actor scheduling;
conversation also freezes the scene. The renderer retains the 1.6 DPR / 2.8M-pixel
cap and cached 1024px static shadow map. Pets use contact patches, not dynamic
shadow-map recasting. Active wandering necessarily renders more often than the
previous still scene; GPU, thermal and battery performance were not measured.
No engine package, SDK, API, credentials, service or installation was added.

## Actual validation and browser evidence

| Check | Result |
| --- | --- |
| `npm run lint` | Pass, zero warnings |
| `npm run typecheck` | Pass |
| `npm run build` | Pass; all existing routes and isolated preview prerendered |
| `npm test` | 92 passed |
| `node --test tests/quest-preview.test.mjs tests/quest-actors.test.mjs` | 21 passed |
| `npm run test:assets` | Pass, all 42 original measured avatar crops |
| `node --test tests/website-http.test.mjs tests/quest-preview-http.test.mjs` | 12 passed |
| Protected Portfolio and avatar fixtures | Match, including all 19 Portfolio hashes |
| `git diff --check` | Pass |

All test results have zero failures/skips. Node's module-type warning remains
because existing package metadata was preserved. New coverage includes path bends and
clamping, anticipation and bounded approach completion, cancellation/replacement,
hover during navigation, independent pets, repeated deterministic wander cycles,
terrain bounds, rest scheduling, static fallback pets, finite pet meshes and leg
parts, world-aware guide scale, 10-second prompt guards and native modifier/
pause/reduced-motion activation. Existing conversation, atlas, animation and
destination tests remain in place. New tests require the explicit command above;
package scripts were preserved.

Native Chrome observations during implementation:

- Live WebGL rendered the enlarged island, original sprite and both 3D pets.
  Screenshots show distinct pet positions/facing and an actual walking sprite
  during the Adventure approach. They are live tool captures, not a saved video
  or browser-screenshot artifact in the repository.
- Responsive observations at 320×800 and 1280×800 exposed and corrected the
  fixed-size mobile avatar. The corrected mobile scale and minimum touch target
  were inspected. A native desktop window was also reviewed.
- Typed the guide's example question, observed the honest scripted answer,
  then Escape returned focus to Talk to me.
- Keyboard activation of Portfolio showed the walking/status state; Escape
  cancelled it, preserved `/quest-preview` and returned focus to Portfolio.
- Keyboard activation of Adventure showed walking frames and completed into
  the existing `/world` with its non-playable disclosure. Pointer activation of
  Portfolio also started its walking transition and completed into the existing
  approved `/portfolio`; returning restored the isolated preview.
- The inactivity invitation appeared during a quiet interval and its Ask action
  opened the companion without automatic focus theft.
- Pause changed to Resume world. Reduced-motion emulation removed that control
  and displayed the static alternative; normal motion was restored afterward.
- Native browser access temporarily disconnected during the final smoke check,
  then recovered. The final build was reloaded successfully. Other tabs were
  not used as task instructions or imported content.

The console contained shared unused-CSS-preload warnings and an asynchronous
message-channel listener error logged from `/world`. No Chrome messaging API is
used by this preview or guide code. The latter resembles an extension error,
but its origin was **not conclusively established**; do not call the console
clean. The protected `/world` source was not altered to address it.

Not verified: a complete final-build viewport matrix, 200% zoom, real touch
hardware, screen-reader speech, forced context-loss/error injection, sustained
FPS/GPU/thermal profiling, every variant with moving actors, and cross-browser
behavior. Screenshots and builds do not establish final owner visual approval.

## Preservation and exact files

A recoverable 150-file pre-task snapshot is stored in
`.local-snapshots/quest-actors-before-2026-11-12.*`. Previous snapshots and all
uncommitted work were retained. Only preview-related source/assets/tests changed;
118 captured files remain unchanged. No edit to automation, `/`, `/portfolio`,
`/world`, other destinations, shared layouts/CSS/components, fonts, original avatar
assets/algorithms or package files. No commit, push, merge or deployment.

Modified source/data/test files:

1. `app/quest-preview/quest-preview.css`
2. `assets/quest-preview/manifest.json`
3. `components/quest-preview/experience.tsx`
4. `components/quest-preview/scene.tsx`
5. `lib/quest-preview/math.ts`
6. `lib/quest-preview/palette.ts`
7. `lib/quest-preview/renderer.ts`
8. `lib/quest-preview/world.ts`
9. `scripts/prepare-quest-preview.mjs`
10. `tests/quest-preview.test.mjs`

Also regenerated all 22 current `public/quest-preview/` assets:
`nyc-{spring,summer,autumn,winter}-{day,night}.webp`,
`tokyo-{spring,summer,autumn,winter}-{day,night}.webp`, and
`bangkok-{raining,summer,winter}-{day,night}.webp`.
The exact names and byte counts are in `assets/quest-preview/manifest.json`.

Added:

- `components/quest-preview/actors.tsx`
- `components/quest-preview/idle-prompt.tsx`
- `lib/quest-preview/actors.ts`
- `lib/quest-preview/pets.ts`
- `tests/quest-actors.test.mjs`
- `docs/QUEST_ACTOR_PETS_REVIEW.md`

Ignored recovery/audit/result files were added under `.local-snapshots/`; normal
ignored build/typecheck outputs were regenerated.

## Preview and owner review

Open `http://127.0.0.1:3100/quest-preview`.
Choose either path, use Enter now/Cancel during a walk, select Pause world, talk
to the guide, or leave the scene inactive for ten seconds. Scene settings retains
all 22 city/season/time variants and the illustrated fallback.

Restart with `npm run build`, then
`npm run start -- --hostname 127.0.0.1 --port 3100`.
For development: `npm run dev -- --hostname 127.0.0.1 --port 3102`, then open
`http://127.0.0.1:3102/quest-preview`.

Owner review is needed for pet likeness (especially the Frenchie placeholder),
the miniature art/character scale, walking pace, idle invitation size on phones,
and final visual polish. This remains a landing preview. Neither a playable
downstream RPG nor real AI is implemented. Promotion to `/` still requires
explicit owner approval.
