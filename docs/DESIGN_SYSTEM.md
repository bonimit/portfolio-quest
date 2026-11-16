# Design System

Source: [Project Blueprint](PROJECT_BLUEPRINT.md), sections 8 and 9. Owner-approved website decisions are recorded below. Section 12 defines the entrance and preservation contract; section 11 is the approved Portfolio-page specification and supersedes the earlier loose-adaptation/motion restrictions for that page. Unresolved final system-wide decisions remain **TBD**; early implementation values are explicitly temporary.

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
The single source of truth is `app/tokens.css`. Approved palette/type tokens have semantic names; remaining provisional scales retain `--temp-*` names. Categories:

| Token group | Status |
|---|---|
| Editorial palette | Approved: paper, ink, secondary paper, orange; see section 8 |
| Font families / type scale | Condensed display + readable sans-serif approved; Anton selected after license verification; exact scales provisional |
| Spacing scale | TBD |
| Responsive breakpoints | TBD (shell must work at 360px and 1280px) |
| Shadows / elevation | TBD |
| Icon sizes | TBD |
| z-index layers (page, nav, overlay, dialog, game canvas) | TBD names and values |
| Motion durations/easing | TBD |

Temporary values used in early phases must be clearly named as temporary.

## 4. Components and patterns
- Shared: header nav, footer, skip link, mode links (View Portfolio / Preview Adventure — Coming Soon; Start Adventure is reserved for playable gameplay), buttons, links, dialogs, focus styles.
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
- Final type sizing, spacing, breakpoints, and remaining world/UI colors
- Contrast target and touch-target minimum
- Sprite sizes and asset budgets
- Touch controls in the game (also listed in the blueprint)

## 8. Earlier editorial adaptation — 2026-11-10 (historical)

The owner approved adapting the visual direction of the supplied standalone
`design-playground.html` reference, retaining the existing Next.js architecture.
Only its visual ideas are adapted; its code, biography, projects, contacts,
character artwork, and chat integration are not copied.

### Palette

| Role | Token | Value |
|---|---|---|
| Page / reversed text | `--color-paper` | `#F6F5F1` |
| Primary text / actions / footer | `--color-ink` | `#131313` |
| Secondary surface | `--color-secondary-paper`, `--color-surface` | `#ECEAE3` |
| Hero / brand accent | `--color-accent` | `#F79A3B` |
| Supporting text | `--color-muted` | `#595751` (implementation choice for contrast) |
| Decorative rules | `--color-border` | `#B9B5AC` |
| Focus on light/orange | `--color-focus` | ink; reversed to paper in dark footer |

### Typography and assets

- Display: Anton Regular (normal 400), used for the homepage hero, homepage
  section headings, and footer wordmark. No synthetic stretching, italics, or
  per-character JavaScript animation.
- Body/navigation/professional content: system Arial/Helvetica/sans-serif. Interior
  page headings stay in readable sans-serif with a calmer scale.
- Anton availability and SIL Open Font License 1.1 verified against official
  [Google Fonts metadata](https://github.com/google/fonts/blob/main/ofl/anton/METADATA.pb)
  and [license](https://github.com/google/fonts/blob/main/ofl/anton/OFL.txt).
- The unmodified 170,812-byte font is self-hosted at
  `public/fonts/anton/Anton-Regular.ttf`; the full license and copyright notice
  are retained beside it in `OFL.txt`. `README.md` in that directory records
  source URLs, retrieval date, and SHA-256.
- One local font preload; `font-display: swap`; no runtime Google Fonts requests
  or new JavaScript dependencies. Impact/Arial Narrow/system sans-serif fallbacks
  keep text available if the font cannot load.
- The original decorative SVG in `components/home/world-preview.tsx` and its
  `--temp-map-*` colors are preserved. It is placeholder art, not final game art.

### Composition and interaction

- Homepage: orange editorial hero, both route actions, framed map preview, two
  structured route cards, then numbered portfolio section links.
- Header: existing six-route navigation plus persistent View Portfolio and
  Preview Adventure — Coming Soon links. Footer: ink surface, paper text, orange hover accents.
- `View Portfolio` opens `/work`; `Preview Adventure — Coming Soon` opens `/world`. The preview
  explicitly states it is not playable. Mobile remains editorial by default.
- Layout uses normal CSS grid/flex flow, not the reference's scatter engine or
  drag sorting. Navigation remains visible and wraps on narrow screens.
- Existing metadata, skip link, semantic landmarks, native anchors, focus styles,
  reduced-motion support, and custom 404 are preserved.
- No client-side animation loops, host-specific chat, CMS, filters, or case studies.

### Temporary dimensions and states

These values remain provisional pending final system-wide review:

- 4–96px spacing scale; fluid 76rem content container; 40rem reading measure.
- Display hero 3.25–6rem; compact hero 2.5–5rem; section display 2.5–4rem.
- Thresholds: 64rem stacks the hero/header/footer; 48rem stacks route cards;
  40rem adjusts navigation/gutters. Literal media conditions mirror this list
  because native media queries cannot use CSS custom properties.
- Editorial: minimal 2px corners, 1px structural rules, 2px action-link borders,
  static 3px offset preview shadow. World panels use separate temporary tokens.
- At least 44px primary/nav/footer link targets, 3px focus outlines with 4px
  offsets; dark footer reverses focus color for visibility.
- 160ms color/background transitions only; reduced motion removes all transitions
  and animations. Current-page navigation uses an underline and font weight.
- Navigation layer 10, skip-link layer 20; final game/dialog layers remain TBD.

## 9. Validation of this adaptation — 2026-11-10

- `npm run lint`, `npm run typecheck`, `npm run build`, and `git diff --check`
  passed. All seven public routes are statically rendered; unknown routes retain
  the custom HTTP 404.
- Production HTTP checks verified titles/descriptions, one h1/main/header/footer,
  labeled navigation, current-route markers, valid skip/anchor targets, a single
  anonymous-CORS font preload, and delivery of the font and full license.
- Built CSS includes the responsive thresholds, focus indicators, and
  reduced-motion rules. All stylesheet token references resolve.
- Text contrast: ink/paper 17.03:1, ink/secondary paper 15.43:1, ink/orange 8.53:1,
  supporting text/paper 6.62:1, supporting text/secondary paper 6.00:1. Footer
  paper and orange text on ink use the same passing reversed pairs.
- React review: existing native links and stable list keys retained; content stays
  server-rendered with only active-route navigation as a client component. No
  animation loops, browser event handlers, external font requests, or new package
  dependencies added.
- Browser host was unavailable. Actual desktop/tablet/mobile rendering, zoom,
  keyboard traversal, and screen-reader behavior have **not** been verified.
  CSS/source checks and font-width estimates do not replace that visual review.
- At that milestone, the original SVG/map colors, `/world` content, six routes, and 404 content were
  preserved. Playable world, filters, case studies, CMS, and guide remain deferred.

## 10. Review corrections — 2026-11-10

The owner reported an independent Claude Art Direction/UX/Code QA review with no
Critical or High issues and authorized the listed Medium corrections. This section
records implementation choices; it does not claim a new independent review.

- All adventure entrance links, the world eyebrow, and world page title use the
  shared `ADVENTURE_PREVIEW_LABEL`: **Preview Adventure — Coming Soon**.
  **Start Adventure** is reserved for a future playable game.
- Main navigation uses `aria-current="page"` for exact URLs and `"location"`
  for nested section URLs. Prefix lookalikes such as `/workshop` do not match.
- Mode links use `"page"` only at their exact `/work` or `/world` targets.
  Other recognized editorial pages use `"location"` on View Portfolio; nested
  world URLs use `"location"` on the preview link. Home and paths outside the
  recognized sections have no selected mode. This describes location, not a tab
  or a disabled action; both links stay usable.
- Hero columns stack through 1024px. Compact typography grows at 8.5vw between
  2.5rem and 5rem; desktop display remains capped at 6rem. Explicit line spans
  retain spaces in the accessible heading. Ordinary words are never subject to
  a global `overflow-wrap: anywhere`; `.breakable-text` is an opt-in for long URLs.
- `/world` uses temporary `--temp-world-*` tokens: sage sky `#E5F0EA`, cream
  surface `#FFF7E5`, green ink `#243B33`, muted text `#435C50`, edge `#42624E`,
  1.75rem corners, and a static soft offset shadow. These affect only the world
  preview; editorial chrome remains paper/ink/orange. Final world design is TBD.
- The original map SVG geometry and colors are retained. No replacement imagery,
  character, gameplay controls, or animations are introduced. The non-playable
  notice and View Portfolio exit stay prominent.
- Numbered destination links get their accessible names from their headings and
  descriptions from their separate paragraphs. Decorative field-note numbering,
  arrows, and star marks are excluded from screen-reader output. Wordmarks have
  explicit home-link names.
- Action-link borders are explicitly 2px in every state; labels can wrap without
  crushing their decorative arrow. Focus and reduced-motion styles are retained.
- Back to top targets the focusable `#page-top` header, with an inset focus outline.
  Skip to content still targets the separate focusable `#main-content`. Both use
  native fragment links, without JavaScript or smooth-scroll requirements.

### Validation evidence for the review corrections

- `npm run lint`: passed with zero warnings; `npm run typecheck`: passed;
  `npm run build`: passed, with all seven intended routes statically rendered.
- Direct navigation-helper checks: **9 section cases + 14 mode cases passed**.
  These cover exact/nested routes, the introduction, world/editorial modes, and
  prefix lookalikes. These are logic checks, not browser navigation tests.
- Production HTTP: `/`, `/work`, `/concepts`, `/arcade`, `/about`, `/contact`,
  `/world` returned **200**; `/unknown-review-check` returned the custom **404**.
- Rendered HTML verified consistent names for every world entrance; exact-page
  versus editorial-location mode states; one h1/main/header/footer; page metadata;
  unique IDs; named destination links with valid descriptions; and separate,
  focusable skip-to-content and back-to-top fragment targets. No canvas or
  premature Start Adventure label appears in the rendered output.
- Built CSS verified responsive rules at 40/48/64rem, world tokens, explicit
  control borders, focus rules, and reduced-motion overrides. Every stylesheet
  variable resolves. Source review confirms ordinary words are not split globally.
- Editorial contrast: ink/paper **17.03:1**, ink/orange **8.53:1**, muted text on
  secondary paper **6.00:1**. World ink/sage **10.29:1**, muted/sage **6.23:1**,
  ink/cream **11.26:1**, muted/cream **6.82:1**; world edges/surfaces **5.82–6.37:1**.
- Browser connection: the browser access host was unavailable. Native Chrome
  eventually loaded the local homepage; its accessibility tree confirmed the
  full preview wording, spaced heading, hidden decorative field numbering, and
  concise destination names. Responsive-control interaction then timed out and
  reset the computer-use session. This is partial browser evidence only.

| Requested browser check | Result |
|---|---|
| 360px | Unverified: viewport control unavailable after timeout |
| 641px | Unverified: viewport control unavailable after timeout |
| 768px | Unverified: viewport control unavailable after timeout |
| 1024px | Unverified: viewport control unavailable after timeout |
| 1280px | Unverified: viewport control unavailable after timeout |
| 200% zoom | Unverified |
| Keyboard traversal / skip / back-to-top focus | Markup verified; actual keyboard behavior unverified |

Screen-reader behavior and full visual/console checks also remain unverified.
These source, HTTP, and native accessibility-tree checks do not establish visual
layout or runtime focus behavior. Follow-up browser/owner review remains required.
No package dependencies, font files, automation files, or Git/deployment state
were changed by these corrections.

## 11. Faithful landing-page reference implementation — 2026-11-10

The owner explicitly superseded the loose editorial adaptation. The supplied
`/Users/workspace/portfolio-reference/design-playground.html` is now the primary
landing-page presentation/interaction specification. Existing content/privacy,
Next.js routes, and accessibility requirements still apply. Earlier bans on
landing typography distortion and scroll effects are superseded for this milestone.

### Source effects identified and implemented

| Reference source | Distinctive behavior | React implementation |
|---|---|---|
| HTML lines 27–43, 217–220 | Fixed bar; full-height orange scene; top-right introduction; enormous bottom wordmark; four drifting circles | `HeaderFrame`, full-bleed `.reference-hero`, `KineticWordmark`, CSS atmosphere |
| JS lines 675–701 | Alternating glyph width weights, ink-bound measurement, line offset 3, gap max(4px, .006 viewport width), fitting after fonts/resize | Canvas text measurement only; React-rendered spans with fitted ink transforms; ResizeObserver and font-ready refits |
| JS lines 703–711 | Velocity-driven vertical stretch: target 1 + min(1.1, abs(velocity) × .55), damping .12, decay .86, second-line factor .8, 8px direction shift | `springStep` and scroll-triggered RAF; same coefficients, with bounded/settling updates |
| CSS lines 43–44 | 18s ease-in-out drift, 4vw/-3vh translation, scale 1.15, -4s staggering | Matching CSS timing/geometry; deterministic circle positions |
| CSS chips/actions | Alternating -1°/+1.2° tilts, .28s cubic-bezier(.34,1.8,.5,1), lifted hover, offset shadows | Hero actions and real shortcut links; matching focus presentation |
| CSS cards | Paper panels, grayscale-to-color art, .35s wash/filter reveal, variable shapes/tilt, .5s spring pop | Six destination cards, CSS quilt, IntersectionObserver entry reveal with 30ms staggering |
| CSS footer lines 168–175 | Ink footer, 60rem measure, two-column serif introduction/directory, small bottom row | Shared footer without unapproved biography/contact data |

The new headline is **Portfolio Quest**. The original introductory description
and approved route actions are retained. The previous two route cards and three
section rows correspond to the hero route choices and six-card destination quilt.
The original map is retained in the adventure card and unchanged on `/world`.

### Tokens, fonts, and assets

- Exact reference palette: paper #F6F5F1, secondary paper #ECEAE3, ink #131313,
  orange #F79A3B. Card accents: lilac #D9B8FF, yellow #FFD23F, lime #CFE86B,
  teal #7FD6C2, pink #FFB3D1; all `--landing-*` tokens live in `app/tokens.css`.
- Readable supporting text retains #595751 instead of the reference's
  lower-contrast graphite. Footer supporting text uses #C0BEB6.
- Anton remains the verified local display font. Newsreader (normal 300–400) and
  Instrument Sans (normal 400–500) now match the reference's serif/control roles.
- Official Google Fonts sources and SIL OFL 1.1 notices were verified before
  bundling. Locally hosted Latin WOFF2 files are unmodified: Newsreader 132,000
  bytes; Instrument Sans 30,092 bytes. Each has its complete OFL notice and a
  README with source CSS/font URLs and SHA-256 in `public/fonts/`.
- No font service is called at runtime and no animation package was added.
- Destination line drawings are original code-native SVG, not copied project
  illustrations. No reference character, biography, project narrative, or contact
  information is reused.

### Deliberate differences and accessibility/performance behavior

- Keep all six main navigation destinations and both exploration-mode links.
  This needs a larger fixed desktop header than the reference's sparse bar.
- A measured inner header frame floats on desktop; the actual `#page-top` header
  stays in document flow so its native back-to-top anchor still targets page start.
- Six clearly labeled **destinations**, not eight project records. The quilt is
  CSS Grid in logical reading/tab order; no shuffle, sorting, filters, drag engine,
  hash detail routing, or project-browser state is implemented.
- The heading has one readable accessible name; its decorative letter spans are
  aria-hidden. Without JS the headline and all links remain available. Reveals
  never require initial hiding; focus cancels a card's entry animation.
- On desktop, an accessible Pause motion toggle freezes the spring and drifting
  circles. RAF stops after settling, offscreen, paused, reduced-motion, or hidden
  document states. Observers, listeners, font callbacks and RAF are cleaned up.
- At <=48rem, the header/toolbar use normal flow, scroll stretching and circle
  drift are disabled, cards lose tilt/reveal movement, and controls stay usable.
  At <=35rem cards become a readable single column without fixed content heights.
- `prefers-reduced-motion` disables spring, drift, pop, tilt transitions, and smooth
  movement; static letter fitting remains a layout operation. Color/focus feedback
  and native navigation remain available.
- No default scroll interception or scroll locking. No mouse-only content.
- Short desktop windows use a 45rem minimum hero height to keep the required
  route actions and wordmark apart. Without JS, natural letter widths provide a
  readable fallback; exact fitted proportions appear after enhancement/font readiness.
- Use fixed circle positions instead of randomness to avoid hydration differences.
  The reference's perpetual idle RAF is replaced by scroll-triggered settling RAF.
- The full playable world, host-specific chat, and animated character are excluded.

### Changed files in this milestone

`app/page.tsx`, `app/layout.tsx`, `app/globals.css`, `app/landing.css`,
`app/tokens.css`, `components/site/site-shell.tsx`,
`components/site/header-frame.tsx`, `components/home/kinetic-wordmark.tsx`,
`components/home/landing-reveals.tsx`, `components/home/destination-art.tsx`,
`lib/shared/landing-motion.ts`, `README.md`, `docs/DESIGN_SYSTEM.md`,
`docs/AGENT_TASKS.md`, plus `latin.woff2`, `OFL.txt`, and `README.md` in each of
`public/fonts/newsreader/` and `public/fonts/instrument-sans/`.

### Actual validation evidence for the faithful landing milestone

- `npm run lint`: passed with zero warnings. `npm run typecheck`: passed.
  Final `npm run build`: passed; seven intended public routes statically generated.
  `git diff --check`: passed.
- Production HTTP: `/`, `/work`, `/concepts`, `/arcade`, `/about`, `/contact`,
  `/world` returned 200; `/missing-landing-check` returned the custom 404.
- Rendered HTML: one h1/main/header/footer; English language; page metadata;
  unique IDs; valid skip/back-to-top targets; six destination URLs; readable
  **Portfolio Quest** heading with decorative letters hidden from AT; labeled
  Pause motion control; consistent world entrance names. Cards are not initially
  hidden and all links exist without waiting for client JavaScript.
- Production CSS includes drift/pop keyframes, reference motion tokens,
  responsive 48rem/35rem alternatives, and reduced-motion overrides.
- Self-hosted Newsreader/Instrument Sans responses match local SHA-256; complete
  OFL notices are served. No remote Google Fonts imports or reference biographies,
  project names, contact details, canvas game, or host chat appear in the HTML.
- Spring logic tested at -12, -1, 0, 1, and 12 initial scroll velocities: finite,
  bounded between 1 and 2.1, and settled below the stop thresholds within 180
  frames. Existing route/mode boundary checks passed. These are logic checks,
  not a browser animation test.
- Ink contrast against the six card tints: 8.53:1, 10.84:1, 12.87:1, 13.63:1,
  10.88:1, 11.17:1 respectively; footer supporting text/ink 9.98:1. Hovered card
  numbering changes to ink to preserve contrast.
- React/source review: DOM reads for glyph fitting occur on resize/font readiness,
  not in scroll frames; scroll frames only update transforms. Timers/listeners/
  observers/RAF are cleaned up; no animation library/dependency was added.
- Browser comparison attempt: browser access host unavailable. Native Chrome
  connected, but the attempt to open the reference was rejected due to concurrent
  user app changes; the subsequent state refresh timed out and reset the session.
  Neither reference nor new homepage was successfully rendered for this task's
  matching-width comparison. No visual similarity percentage or pixel-match claim
  is made.
- **Unverified:** matching reference/homepage screenshots at 360, 641, 768, 1024,
  1280px; actual 200% zoom; keyboard traversal/fragment focus; live pause, scroll,
  resize/font fitting, reveal and reduced-motion behavior; browser console and
  screen-reader testing. Source/HTTP/logic checks do not establish these results.
- `automation/`, package manifests, lockfile, original map geometry/colors, and
  `/world` gameplay status unchanged. No commit, push, merge, purchase or deployment.

## 12. New entrance / protected Portfolio homepage — 2026-11-10

### Preservation takes precedence

The owner approved a new entrance but explicitly required preservation of the
latest reference-led Portfolio design. Before source edits, a 45-file source and
font archive plus SHA-256 manifest were saved at:

- `.local-snapshots/portfolio-baseline-2026-11-10-4ed42918.tar.gz`
- `.local-snapshots/portfolio-baseline-2026-11-10-4ed42918.json`

A baseline production build was served and its original `/` HTML, compiled CSS,
and render manifest saved beside the archive. Snapshots are ignored local files,
not public assets. Restore into an **empty directory**, inspect, and selectively
copy files back; do not extract over ongoing work. Example:
`tar -xzf .local-snapshots/portfolio-baseline-2026-11-10-4ed42918.tar.gz -C <empty-directory>`.

`app/portfolio/page.tsx` is a copy of the original page with only two metadata
strings changed from Home to Portfolio. Its render function is identical.
`app/landing.css`, `app/globals.css`, `app/tokens.css`, all approved motion/reveal/
artwork components, the motion helper, and fonts remain byte-identical. Necessary
chrome changes select the original landing-header class at `/portfolio`, return
wordmarks to `/portfolio`, keep Home → `/`, and recognize the new editorial route
in mode semantics. The existing View Portfolio → `/work` shortcut remains.

### Entrance direction and interaction

- `/` is a storybook crossroads: deep green sky, cream type, small star motifs,
  two richly illustrated path cards, and a local Wayfinder panel.
- Portfolio card → `/portfolio`: an original code-native miniature of the orange
  editorial composition, with the same brand colors and giant typography.
- Adventure card → `/world`: existing original map, layered hills/moon, and an
  explicit non-playable/coming-soon label. No new third-party assets or fonts.
- Fine-pointer movement produces bounded 3°/4° scene tilts and 10px/8px parallax,
  updated only in response to pointer events. Keyboard focus has the same content
  and a clear visual state. Touch scroll is never captured or suppressed.
- Plain activation of a path card opens a 600ms portal wipe, then routes at 640ms.
  Escape cancels before navigation. Modified/middle clicks keep native behavior;
  direct skip and guide links do not require the cinematic transition.
- Reduced motion bypasses the wipe and disables parallax/transform transitions.
  Media listeners, RAF and navigation timers are cleaned up when leaving.
- Entrance styles/tokens are isolated in `app/entrance.css`, under `.entrance` or
  `.site-header--entrance`. Protected Portfolio CSS/tokens are not edited. The
  new route stylesheet has no selectors matching `/portfolio` content.
- Desktop uses two path cards and a two-column guide. At <=768px the paths stack;
  at <=960px the guide stacks; at <=480px the question controls stack. No fixed
  text heights or mandatory gesture interactions.

### Guide contract

The entrance alone imports the local guide. It is labeled **Scripted answers,
not live AI**. Four meaningful prompt buttons and a labeled 240-character question
field map to approved answers about the existing site, section placeholders,
contact/about status, the two paths and non-playable world. Unknown questions
receive an honest unmatched answer and safe route choices. No fake typing delay,
external request, model-generated biography, private content or project claim.

`lib/guide/local-guide.ts` provides a `GuideProvider` interface and pure local
resolver. Actions are IDs resolved from a fixed allowlist (`portfolio`, `work`,
`concepts`, `arcade`, `about`, `contact`, `world`), never user-generated URLs.
Future AI requires a separate approved server-side provider, factual grounding,
privacy/cost controls and credentials kept off the client. None is added now.
Questions exist only in component state; no chat history persistence or analytics.

### Source-preservation evidence

- The moved page matches the snapshot exactly after normalizing only two title
  metadata strings.
- 20 protected style/motion/artwork/font/world-preview/404 files are byte-identical.
- Production `/portfolio` main DOM **exactly equals** the captured pre-move `/`
  main DOM; the landing-header class is identical.
- The original compiled production stylesheet is present **byte-identically** on
  `/portfolio`. Comparison evidence is saved in the ignored snapshot folder as
  `portfolio-baseline-2026-11-10-4ed42918-comparison.json`.
- These checks prove source/DOM/CSS preservation. Live animation, touch, zoom,
  responsive geometry and focus behavior still require browser review; they are
  not inferred as visually tested from a hash match.

### Actual entrance milestone validation — 2026-11-10

- Before modification: a production baseline build passed and its original `/`
  HTML/CSS were captured. After implementation: lint (zero warnings), typecheck,
  production build and `git diff --check` passed. Eight public routes are static.
- HTTP: `/`, `/portfolio`, `/work`, `/concepts`, `/arcade`, `/about`, `/contact`,
  `/world` returned 200; `/missing-entrance-check` returned the custom 404.
- HTML checks: unique IDs, one h1/main/header/footer, titles/descriptions,
  existing route links, valid skip/help/back-to-top fragments, both path targets,
  question label/max length/live region, six preserved quilt cards, pause control,
  and the non-playable notice. Guide markup appears only at `/`.
- Preservation: page source differs only in two title metadata strings;
  **20 protected files byte-identical**; `/portfolio` main DOM exactly matches
  the pre-move `/` main DOM; original landing-header class and compiled CSS retained.
- Guide: four suggested prompts, eight intent/edge cases, deterministic repeated
  questions, seven valid action IDs/routes and four invalid/inherited/arbitrary
  URL IDs passed. Portfolio/work/world/entrance and nested-section mode cases passed.
- Text/control contrast checks passed: cream/night 13.58:1; muted/night 9.35:1;
  muted/brown portal 7.53:1; muted/green portal 7.77:1; guide answer 10.04:1;
  mint/night 9.48:1; muted input placeholder 5.50:1; focus/night 10.26:1.
- Native Chrome: inspected the entrance at its current desktop window and its
  accessibility tree. In an isolated production test tab, activated “Can I play
  the adventure?” and confirmed the scripted, explicitly non-playable response
  and valid navigation. No model/network service was involved.
- Browser access host remains unavailable. Responsive emulation was interrupted
  by current-window/app changes, so **360px, 768px, 1280px, 200% zoom, keyboard
  traversal, live parallax/route wipe/reduced-motion and orange-page animation
  regression checks remain unverified**. No pixel-perfect or live-animation
  preservation claim is made; source/DOM/CSS preservation is verified separately.
- Owner review: new entrance art/composition, guide copy/coverage, transition feel,
  responsive/keyboard tests and live `/portfolio` comparison. The RPG, approved
  project/about/contact content, and a future real AI provider remain placeholders.
- No new dependencies, external API calls, credentials, paid SDKs, fonts or image
  downloads. `automation/`, package manifests and lockfile are unchanged. No
  commit, push, merge, purchase or deployment.

### Source files changed for this milestone

- `app/page.tsx`, `app/portfolio/page.tsx`, `app/entrance.css`
- `components/entrance/entrance-experience.tsx`, `portfolio-preview.tsx`, `local-guide.tsx`
- `components/site/header-frame.tsx`, `components/site/site-shell.tsx`
- `lib/guide/local-guide.ts`, `lib/shared/navigation.ts`
- `.gitignore`, `README.md`, `docs/PROJECT_BLUEPRINT.md`, `docs/DESIGN_SYSTEM.md`, `docs/AGENT_TASKS.md`

Ignored snapshot artifacts are separate local recovery/evidence files, not site
source or public output. All earlier uncommitted work remains in place.

## 13. Round 2 title screen and approved layout corrections — 2026-11-10

This section supersedes the rich portal-card entrance in section 12. It does not
supersede the protected orange Portfolio design in section 11.

`/` is a quiet game-title composition: condensed two-line title, exactly two large
path anchors, a muted static landscape and a small wandering traveler. Orange
PORTFOLIO enters `/portfolio`; mint ADVENTURE enters `/world`, with visible
preview/coming-soon/non-playable wording. A small Selected Work link remains the
professional bypass. The entrance has no mode bar, full directory or footer.

Entrance palette and typography are scoped together at the start of
`app/entrance.css`: night #101D2B, ink #152433, paper #F5E9D2, muted #BBCAD0,
orange #F79A3B, mint #B6D8B2 and border #769390. Anton and Instrument Sans reuse
existing locally bundled OFL fonts. No new fonts or external assets were added.
Title sizes clamp from 3.1rem to 7rem; the content measure is 46rem, path group
35rem and reserved avatar stage 30rem. Two equal zero-minimum button columns
remain visible on mobile; the avatar stays below them in a separate 143px area.

The original SVG lantern traveler has idle, walking and talking states. Walking
moves between clamped stage-relative waypoints at about 35px/s, with 1.8s rests.
Leg/arm cycles use CSS (625ms alternate); talking mouth uses a restrained 1.1s
step cycle. No per-frame React state updates or perpetual geometry RAF loop.
Hover, keyboard focus, dialog open, pause, offscreen, background-tab and reduced
motion stop wandering. Conversation faces the character forward. Pause is a
44px control; the avatar itself is an 80 × 128px accessible dialog button.
The reference sprite’s reuse rights were not supplied, so its artwork is absent.

Conversation uses a native modal dialog with text entry, a ten-exchange history,
three examples, empty/error states, approved destination links and numbered
announcements for identical repeated replies. It explicitly says “AI not
connected · Local scripted fallback”. History is ephemeral and cleared when
closed. No model, API, tracking, credentials or public inference endpoint exists.
See [AI_GUIDE_OPTIONS.md](AI_GUIDE_OPTIONS.md) for the separately gated service.

The path wipe is a native modal dialog: initial Cancel focus, background inert,
Escape or visible pointer/touch Cancel, cancellation announcement and focus
restoration. The wipe is 700ms cubic-bezier(.76,0,.24,1); routing occurs after
1.2s to provide a cancellation window. Reduced motion uses immediate native
link navigation; modified clicks retain normal link behavior. Timers/listeners
are cleaned up. CSS feedback uses short transform/shadow transitions.

The compact header keeps the existing route architecture. At ≤56rem it exposes
brand and Menu; wider screens additionally expose three core section links.
Menu is a disclosure, not a modal: ordinary Tab navigation, Escape returns focus,
outside pointer/focus departure closes it. Its scrollable panel fits small and
zoomed viewports. Current page and ancestor semantics use boundary-aware route
matching. Portfolio always means `/portfolio`, Selected Work always `/work`,
and Adventure Preview always `/world`.

Portfolio preservation uses `app/portfolio/layout.tsx`, which returns children
without a DOM wrapper, and `corrections.css`. The implicit hero column is now
`minmax(0,1fr)`; the breathing row also has a zero minimum. Editorial copy, controls
and cards align to `--portfolio-content-max: 90rem`. Hero background, wordmark,
circles and their timing remain full bleed. Focus/anchor offsets account for the
header and shortcut toolbar. Shared ActionLink normalizes the legacy “View
Portfolio” label on `/work` links to “Selected Work” without changing protected
page source. No protected effect file was edited.

Recovery: `.local-snapshots/round2-before-ce36be17.tar.gz` plus SHA manifest retains
the exact pre-repair uncommitted source. The older pre-route-split snapshot also
remains. Never restore either archive wholesale over later work: compare and
recover individual files. `tests/fixtures/portfolio-protected-sha256.json` guards
19 protected page/style/effect/font/license files. Portfolio main DOM matches the
original baseline after only the two approved label substitutions.

Actual command results, browser coverage, source inventory and unverified checks
are in [ROUND_2_REVIEW.md](ROUND_2_REVIEW.md). Earlier milestone evidence above is
historical, not a claim that every new interaction has been fully audited.

## 14. Owner-supplied atlas guide — 2026-11-11

This replaces the earlier simple SVG entrance avatar only. The orange Portfolio
visual system and protected effects remain intact. Owner confirmation permits
adapting the supplied character; provenance and limits are documented in
`assets/guide/README.md`.

Use the measured 42-frame atlas through GuideSprite/SpritePlayer, never source
image row/column guesses. Canonical canvas 144×176, 140px body, feet y=160,
pelvis x=72; main display 90×110 CSS pixels, portrait 48px wide. Keep uniform aspect
ratio, transparent edges and the dedicated movement arena. Walking frame phase
follows distance; orientation uses actual turn poses. Front speech and greeting
avoid cycling through the back. Pause and reduced motion show the frontal poster;
hidden/offscreen players stop. Never present expressive animation as a live AI
response: this is still a local scripted guide.

Lint, typecheck, build, 28 Node tests and 42-frame asset assertions passed.
Fresh browser interaction/viewport checks remain unverified due unavailable browser
host and interrupted native access. See [avatar review](AVATAR_QUALITY_REVIEW.md)
for exact files, evidence, preview artifacts and source artwork limitations.

### Avatar Round 2 corrections — 2026-11-11

Every GuideAnswer now declares `avatarCue`. Neutral/informational, unavailable,
transparency, unmatched and empty responses use `idle-front`. Only the available
Portfolio navigation answer uses `happy`: talking 2200ms → happy 900ms → idle.
Opening the conversation waves once; typing neither starts thinking nor changes
presentation timers. Thinking artwork remains available for a future genuine
waiting state, but is not invoked by the local scripted guide.

Pause is an ordinary action button whose visible text supplies its accessible
name: “Pause animation” while playing, “Resume animation” while paused. It has
no contradictory aria-label or changing-label toggle semantics. The avatar name
starts with the visible “Talk to me”. Keyboard focus-visible holds the actor;
pointer/touch-restored focus does not. Touch press is tracked separately from focus.
Closing by pointer clears hover/press holds, allowing wandering after the normal
idle interval. Escape restores keyboard focus and keeps the target stationary.

Walking samples `Animation.currentTime` in requestAnimationFrame only during
travel. Gait and interrupted position use the same piecewise interpolation as
the native transform animation. The sprite sheet shifts via translate3d only
when its frame changes; it does not update left/top or rerender React per frame.
Asset dimensions, frame maps, source artwork and protected Portfolio are unchanged.
See the current Round 2 section in [avatar review](AVATAR_QUALITY_REVIEW.md) for
actual tests, partial Chrome accessibility observations and remaining checks.

## 15. Nonmodal companion field notes — 2026-11-11

The entrance companion replaces the centered chat modal. Use warm paper #f6f5f1,
ink #131313, orange #f79a3b and secondary paper #eceae3; entrance scenery now uses
neutral ink/umber rather than unexplained green. Portfolio tokens and protected
styles remain unchanged.

At ≥80rem, reserve a real right-hand grid track (20–25rem) with the title, two
paths and unchanged avatar alongside. Below that width the sheet follows the
entrance in document flow; it never overlays the choices/character. The paper
corner, fastening strip, offset shadow, condensed name and serif opening line
create the companion's field-note identity. Keep only two suggested questions.
Disclose the local scripted behavior once, plus the compact privacy footer.

Use nonmodal dialog semantics, input focus on opening, free Tab traversal,
Escape/Close and avatar focus restoration. Never call showModal or make the
background inert for this panel. Preserve the separate path-transition modal.
Entry: 460ms cubic-bezier(.16,1,.3,1), transform/opacity unfold. Exit: 180ms
cubic-bezier(.55,0,1,.45). Message reveal: 260ms. Shared pause and reduced motion
suppress animation; close immediately. No constant ambient panel animation.

Lint/typecheck/build, 75 unit tests, 9 HTTP tests, asset and preservation checks
pass. Fresh rendered viewport/interaction checks remain unverified after browser
access interruptions. Static before/after previews are explicitly not screenshots.
See [companion review](COMPANION_INTERFACE_REVIEW.md) for inventory and QA gaps.

### Companion Round 3 — final-cycle corrections (2026-11-11)

Use one shared grid for intro, the two primary paths, unchanged character and
companion. At ≥64rem, the Field Note spans the right column. Below that width,
the same primary path row is sticky within the entire grid, so conversation
focus/scroll can preserve both choices. Verify visibility and hit targets; the
breakpoint itself is not validation. Keep the complementary aside semantics,
scoped Escape and focus ownership checks. Use the exact disclosure
“Scripted guide · Not AI” and visible welcome destinations.

The note has an orange offset shadow and a one-time transform origin measured
from the avatar. Stage positions use a short transform-only FLIP gesture; specific
path replies add a restrained outline. Shared pause and reduced motion suppress
effects; reduced motion hides the redundant animation control. Small panel text
is at least .75rem except the compact .7rem eyebrow at narrow widths. Failure
announcements have one live channel. Visibility observers are guarded independently
of the preserved walking algorithm.

Lint/typecheck/build, 92 unit tests, 9 HTTP checks, asset and protected hashes pass.
The eight-width browser matrix remains unverified after host/native interruptions.
[Final Round 3 handoff](COMPANION_ROUND_3_REVIEW.md) records exact evidence and the
live test runner; this is not visual approval. Earlier evidence is historical.


## AD1 Adventure integration — 2026-11-15

`/world` uses the owner-approved AD1 presentation, with styles scoped beneath `.adventure` and namespaced keyframes. Island is default; Arcade and Neon are optional Settings themes. Grid and carousel share a selection. View and theme persist in the URL and local storage, with URL values taking precedence. CSS miniature previews, restrained tilt, native view transitions where supported, pause and reduced-motion handling retain the preview character. Laptop layouts use the reference's viewport-based sizing; phones scroll normally. The full browser acceptance matrix remains outstanding.

Native modal dialogs provide background inertness and focus containment for cards, the story panel and machines. Escape, Close, backdrop dismissal, focus restoration, fresh machine iframes, source/origin-checked `arcade:back` messages and one-step history return are implemented. Browser interaction verification remains pending. Sound starts off; lineup sound and each unchanged machine's own sound control are independent and explicitly described.

Typography uses `next/font/local`: existing Anton and Newsreader plus Figtree for the Island body, Press Start 2P for Neon display, and IBM Plex Mono for Neon body. Original font files and OFL notices are bundled; provenance and hashes are in `assets/adventure-fonts.json`. Neon fonts are not preloaded. License sources: [Figtree](https://github.com/google/fonts/blob/main/ofl/figtree/OFL.txt), [Press Start 2P](https://github.com/google/fonts/blob/main/ofl/pressstart2p/OFL.txt), [IBM Plex Mono](https://github.com/google/fonts/blob/main/ofl/ibmplexmono/OFL.txt). No runtime font service is used by the React hub. Unchanged embedded machines retain their original Google Fonts import.

D6 Art Book is the approved default for case studies. No template markup, styles or motion were altered. No approved professional records exist yet, so production Selected Work remains an honest empty state and sample project routes return 404.

The orange Portfolio source has one separately approved description-only change. Its other source and effect/art/font hashes remain unchanged. The original hash fixtures remain intact; regression checks reverse only that exact approved sentence before comparing the full source hash.


## Main island entrance — 2026-11-15

The root page now renders the exact shared restored island component used by `/quest-preview`, importing its route-owned styles. `preview={false}` provides a Selected Work shortcut and a Settings summary on `/`; the preview retains its return-to-main link and Scene controls summary. Both offer Current City & Season and New Destination Scenes through the existing Scene set selector. Default Tokyo autumn/day and Season Changes OFF are preserved. No mesh, scene artwork, camera, avatar/pet sprite, scale or motion source changes were required.

Path copy now describes the real Adventure prototype lineup; outdated coming-soon/non-playable labels are removed from the shared island UI. Existing camera entry/cancellation, immediate reduced-motion and renderer-failure navigation, DOM links, touch/keyboard controls and transparent scripted guide are retained. The orange Portfolio and AD1 Adventure implementations are unchanged by this promotion. See [ISLAND_MAIN_REVIEW.md](ISLAND_MAIN_REVIEW.md) for actual validation and browser limitations.
