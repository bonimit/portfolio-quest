# Quest preview — viewport, conversation and city refinement

Implemented in `/quest-preview` on `website/implementation`. Preserved `/portfolio`,
the original entrance, other routes, shared guide behavior, source sprite atlases,
pet assets, automation and existing uncommitted work/review snapshots.
Recovery: `.local-snapshots/quest-diorama-before-2026-11-12.*` (153 baseline files).

## Owner feedback addressed

- Bottom-right conversation: the input/pills stay at the bottom while bounded,
  scrollable history grows upwards. More tablet/phone history space keeps the
  latest answer readable. Desktop uses a reserved side area; smaller screens put
  the full-width map above the conversation. No opaque enclosing chat box.
- Exact input placeholder: “What would you like to explore?”; accessible label
  retained, visually hidden. Presets are pill buttons with hover/focus states.
- Large upper “Pick your path.” display heading plus a brief second line.
- Floating labels sit farther outside the architecture on desktop. Phones/tablets
  use a clear row above the scene; labels themselves are clickable native links.
  Full coming-soon/non-playable accessible names and persistent preview disclosure
  remain. No colored sign cards or label backgrounds.
- A viewport-sized grid keeps title, scene, chat and controls in the normal
  viewport. Very short windows (≤480 CSS px high, including the tested 200% zoom)
  deliberately allow document scrolling rather than clipping controls.
- Scene/time transitions use an outgoing scene dissolve and interpolated sky
  colors; layout, label, input, pill and time-switch interactions remain restrained.
  Reduced motion removes these effects and disables automatic tour changes.
- Visible Auto tour On / Paused / Off states. Chat, settings and path interaction
  pause the tour. Accessible names include the same visible state wording.
- Preview-only gait uses travelled world distance, not camera/screen movement:
  a full cycle per two world units (roughly 1.1 cycles/sec during entry), controlled
  body lean and two gentle footfall bobs per cycle. Existing approved sprite art
  remains unchanged; no new run artwork is claimed. Walking, arrival, cancellation,
  native bypasses and direct `/portfolio` / `/world` routes remain.

## Reference and city art

Inspected `/Users/workspace/portfolio-reference/3D-style.png`: a dense architectural
city diorama with detailed façades, varied rooflines, greenery and warm materials.
The raster is not bundled or reused as artwork. Added original procedural details
and finer material treatment in the existing renderer, without new dependencies:

- NYC: articulated façades, glazing, pilasters/cornices, stepped skyline, spire,
  rooftop planters, HVAC details, fire escapes and street railings. Winter has
  snow-covered ground/roof ledges, snow banks and bare trees; moving snow appears
  when motion is enabled.
- Tokyo/Japan: Fuji backdrop with season-dependent snow cap, pagoda roof tiers,
  finial, shop glazing/lattice/awnings, lanterns and roof ridges. Spring blossoms,
  summer foliage, autumn colors and snowy winter have distinct treatments.
- Thailand/Bangkok: gilded temple roof ornaments and stepped spire, visible
  three-wheel tuk-tuk, open seat/screen/roof/rails, market baskets/fruit/awnings,
  canal boat and tropical plants. Rain/summer/northern-inspired cool-season moods
  remain distinct; no Thailand snow is invented.
- Smooth foliage normals and subtle material grain/glazing improve the live 3D
  finish. The island base is shallower to support the viewport composition.

These are stylized procedural dioramas, not a photorealistic reproduction of the
reference. Final reference fidelity, scene density, scale and motion feel need
owner art-direction review. City scenes are geographic composites, not exact maps.
No unverified reference imagery, biographies, contacts or client narratives added.

## Exact files changed

Updated (38 baseline files):
- `app/quest-preview/quest-preview.css` (consolidated route-owned styles)
- `components/quest-preview/experience.tsx`, `guide.tsx`, `actors.tsx`, `scene.tsx`,
  `scene-controls.tsx`
- `lib/quest-preview/building-interaction.ts`, `math.ts`, `palette.ts`, `renderer.ts`,
  `variants.ts`, `world.ts`
- `assets/quest-preview/manifest.json`
- All 22 `public/quest-preview/{city}-{supported-season}-{day,night}.webp` fallbacks
- `tests/quest-preview.test.mjs`, `quest-actors.test.mjs`, `quest-preview-http.test.mjs`

Added: `lib/quest-preview/city-details.ts`, `lib/quest-preview/guide-gait.ts`, this report.

## Validation evidence

- Lint: PASS, zero warnings. Typecheck: PASS. Production build: PASS, 11 static routes.
- Existing unit tests: 92/92 PASS. Preview/actor tests: 29/29 PASS (121 total).
  Includes material/geometry budgets, seasonal snow, Fuji summit snow, temple
  details, tour states, world-distance gait, full entry endpoints/cancellation,
  original protected file hashes, pet frame maps and projected hit areas.
- Production HTTP: 12/12 PASS, including main routes/custom 404, two native paths,
  title/tour semantics, all 22 fallback themes and both reference pet atlases.
- Original avatar asset checks: 42 measured frames PASS. All 19 Portfolio hashes
  and shared avatar art/motion preservation checks PASS.
- Snapshot audit: exactly 38 preview-owned baseline files changed, none outside
  the allowed preview paths. Existing source pet/guide atlases unchanged.
- `git diff --check`: PASS. No packages installed, services enabled or automation run.
- Geometry: 11,239–16,755 triangles by theme, bounded to 24,000 in tests; still one
  batched scene draw and a static shadow pass. Existing GPU pixel/DPR caps remain.
- All 22 fallbacks total 1,197,946 bytes; largest 69,640 bytes. Atlas sizes unchanged.

## Actual browser observations

Native Chrome on a high-DPI display; screenshots inspected through the browser
tool, not saved as files. Default desktop 1440px, responsive 320×800, 390×800,
768×800 and 1280×800 inspected. Title, two path labels, footer controls and anchored
chat were visible. Tablet layout/history issues found during checks were corrected;
768px was rechecked with the complete latest answer and destination links visible
above the fixed input. Earlier screenshots are intermediate, not final approval.

Observed: exact input prompt, pill presets, upward-growing reply area, honest
scripted reply/disclosure, Auto tour On/Paused/Off, new jog start, local building glow,
Escape cancellation/focus return, manual scene stepping, NYC winter snow, Japan's
Fuji and Thailand's temple/tuk-tuk. Reduced-motion emulation disabled automatic tour
and ambient motion while leaving manual stepping available. Normal motion/100%
zoom restored afterwards. 200% zoom was verified through Chrome's actual zoom
control; the short-height layout used readable vertical scrolling.

Console: repeated Next CSS preload warnings remained. Earlier checks also showed
extension font/network messages and a stale error counter; after clearing the task
console/reloading, the observed console showed preload warnings without an error
counter. This is not a claim of exhaustive console or cross-browser validation.

Unverified: physical touch/virtual keyboard, screen-reader speech, Safari/Firefox,
1920/2560 live visual matrix, full long-duration automatic loop, frame-time profiling
and independent art-direction approval. No claim that this build is visual approval.
Adventure remains non-playable; Wayfinder remains a deterministic local guide.

## Preview

Running at <http://127.0.0.1:3100/quest-preview>. Click the avatar for the guide;
hover/focus a path or use the always-visible phone/tablet labels. Scene arrows
step manually. Auto tour starts with NYC and loops through Tokyo and Thailand.
To restart: `npm run build`, then
`npm run start -- --hostname 127.0.0.1 --port 3100`.

No commit, push, merge, deployment, paid service or protected Portfolio change.
