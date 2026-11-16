# Portfolio Quest — Product & Technical Blueprint v1.0

Date: 2026-11-05
Status: Planning / free-first development

Related documents: [Design System](DESIGN_SYSTEM.md) · [Content Rules](CONTENT_RULES.md) · [Agent Tasks](AGENT_TASKS.md) · [Codex instructions](../AGENTS.md) · [Claude instructions](../CLAUDE.md)

## 0. Approved decisions (2026-11-05)
These decisions are approved by the project owner and take precedence over any conflicting text elsewhere in this document.

1. **Mobile defaults to editorial mode.** Mobile visitors land in the editorial portfolio by default. The game remains available as an opt-in choice; the exact device/viewport detection rule is TBD. Core content never requires the game.
2. **Accessible DOM alternatives are required.** Every game destination, the map, and every guide action must be reachable through DOM-based navigation (keyboard, touch and screen-reader operable) that does not depend on the canvas.
3. **The initial guide is scripted and uses a free local search index.** It runs entirely in the browser (or at build time) against published public content only. No generative AI, no external search service and no per-query cost.
4. **Public content excludes private and NDA material.** Private, NDA and internal-only content must never reach the public frontend, the static search index, the guide FAQ or any future AI index. See [Content Rules](CONTENT_RULES.md).
5. **Phase 2 is a small playable vertical slice**, not a full world. See Phase 2 in section 11.
6. **Paid AI services are deferred** (Phase 5 and later). Nothing in Phases 0-4 may require an AI API key or usage-based billing.
7. **Entrance / portfolio split (approved 2026-11-10).** `/` is a new interactive, accessible path-selection entrance. `/portfolio` preserves the latest approved orange reference-led homepage, including its typography, motion, cards and footer. This supersedes earlier homepage placement and automatic mobile editorial-entry assumptions: mobile receives the accessible entrance with Portfolio first and a direct skip link; no visitor is forced into the game. The first entrance milestone includes an explicitly local scripted guide only. The full portfolio/game companion, public search index and paid AI remain separate future work.

8. **Round 2 entrance and navigation update (approved 2026-11-10).** `/` is a restrained game-title screen with exactly two primary path buttons: PORTFOLIO → `/portfolio`, ADVENTURE → `/world` (preview/coming soon, not playable). Keep direct Selected Work access. Replace the redundant mode bar with a compact desktop header and accessible disclosure menu on content routes. Use an original placeholder walking guide until reference sprite rights are verified. Typed conversation remains an explicitly scripted fallback; a genuine free-form AI service requires separate approval after provider, cost, privacy and public-abuse evaluation. No service is activated now.
9. **Portfolio layout corrections only (approved 2026-11-10).** Preserve protected orange visual-effect sources. A pass-through layout imports additive CSS: zero-minimum hero grid tracks, centered 90rem editorial measure and focus offsets. Full-bleed orange hero, fitted wordmark, circles and motion remain. Owner-approved route labels are Portfolio, Selected Work and Adventure Preview.

10. **Adventure lineup and case-study template (approved 2026-11-15).** Locally replace `/world` with the approved AD1 project lineup: Island default, optional Arcade/Neon themes, grid/carousel, story panel and the unchanged P1–P3 playable prototype embeds. The path label is Adventure. This supersedes the old coming-soon `/world` placeholder; it does not claim a roaming RPG exists. D6 Art Book is the default project template; individual projects can select D0–D6. Unbuilt Adventure tiles and sample case studies remain development-only. Full case-study links require explicit approved published records. Live replacement, commits and deployment require separate owner instructions.

11. **Island entrance promoted (approved 2026-11-15).** `/` uses the latest restored island experience shared with `/quest-preview`, preserving current city/season scenes plus New Destination Scenes in Settings. Default remains Tokyo autumn/day; season changes start off. Portfolio → `/portfolio`; Adventure → the playable prototype lineup at `/world`; a direct Selected Work link → `/work` remains available. The old title-screen implementation is preserved in source and a recovery snapshot. No production deployment is implied.

12. **Concept Lab third path (approved 2026-11-15).** The main island adds a third path to `/concepts`, with an additive gallery pavilion and branch. Preserve the existing scenery and Portfolio/Adventure entrances. Concept Lab uses existing explicitly labelled development samples; no real concepts or artwork are supplied. This supersedes the two-primary-path restriction for the main island. The `/quest-preview` comparison remains two-path.

13. **Three-path scene redesign approved for extension (2026-11-15).** The owner approved the new composition: smaller Concept Lab left, main Portfolio centre, Adventure right, closer black day labels, natural back-facing entry, existing rocky base, full-circle drag/reset and shared guide/Settings. Extend it across the 11 current city/season stops and 11 destination scenes, with the current day/night toggle (44 light-specific views). This is the intended future homepage, but implementation stays on the review route until the owner approves the complete screenshot collection. Do not promote it to `/`, replace the current comparison or deploy before that final approval.

14. **Site hierarchy confirmed (2026-11-16).** The island homepage leads to Portfolio Home, Concept Lab and Adventure. Portfolio Home leads to Selected Work and project details. Concept Lab leads to individual visual concept details, reusing the approved case-study designs and labelled sample records. Adventure leads to project stories or playable prototypes. About Me and Contact belong in shared navigation on the island and content pages. This confirms the site structure; the final scene-collection promotion gate in decision 13 remains in place.

15. **Unified navigation and Portfolio routing (2026-11-16).** All application pages use the `/portfolio` top navigation as the shared source of truth. Desktop shows direct section links without a Menu button; mobile uses the responsive disclosure menu. Portfolio Quest returns to the island at `/`. Selecting Portfolio in navigation, the island or the guide opens Selected Work at `/work`. The orange `/portfolio` overview is reached through a footer button labelled “See all works”. This supersedes the Portfolio Home-first route in decisions 11–14; it does not promote the pending new island scenery.

16. **Latest island selected as homepage; navigation exception (2026-11-16).** The owner identified `/quest-preview/concept-scene` as the chosen design and directed that the island page have no shared top navigation. `/` now renders the same latest `SceneStudyExperience` and full scene collection, defaulting to Tokyo autumn/day. Portfolio opens `/work`, Concept Lab `/concepts`, and Adventure `/world`. The Portfolio Quest brand on other pages returns to `/`. Both the homepage and matching scene-review route omit the shared top header; other application pages retain it. Footer access to “See all works” remains. The original island stays at `/quest-preview` for comparison. This supersedes the promotion hold in decision 13 and the all-pages header rule in decision 15 for the island only. This is a local implementation change, not deployment authorization.

17. **Scene life and guide refinements (2026-11-16).** Remove only the added background walking figures from every current scene. Keep water-sport participants, skiers, vehicle riders, the main avatar, pets and the requested genie. Clouds drift visibly; autumn scenes can blow fallen leaves in stronger gusts. The main island's Talk to me trigger toggles the conversation open/closed, and its close icon is larger. All scene motion continues to respect pause/reduced motion.

## 1. Product vision
Build an original, illustrated, browser-based interactive portfolio inspired by the *feel* of a vibrant modern platform game (expressive animation, colorful layered scenes, rounded shapes), **not** a copy of Nintendo art, characters, music, world maps or mechanics. Visitors can select an avatar, roam a 3/4-view illustrated world, discover projects, and optionally skip the game and use a fast, accessible editorial portfolio. A small guide character is available in both modes. Phase 1 uses deterministic scripted search and navigation; a later phase can add AI chat grounded in approved published project content.

### Audiences / needs
- Recruiter: find relevant experience and case study outcomes in under ~2 minutes, without playing.
- Hiring manager / designer: read detailed UX process, research, decisions, images, final work, and outcomes.
- Curious visitor: explore a rich world, talk to characters, discover and try projects.
- Portfolio owner: create/edit rich case studies and project tags without committing code; publish once to update game, editorial website, and (later) AI search.

### Principles
1. Portfolio first, game second: no content is gated behind gameplay.
2. One source of truth for projects.
3. Every game destination corresponds to a stable canonical URL.
4. Original artistic identity; no copyrighted Nintendo assets.
5. Keyboard, touch, accessibility, low-bandwidth, reduced-motion fallback.
6. No invented claims, metrics, clients, or outcomes.
7. Zero recurring subscription cost for the initial version within free-tier limits, excluding optional domain and future usage-based services.
8. Treat NDA/internal notes as private and never export them to the public frontend or AI knowledge index.

## 2. Navigation / information architecture

Entrance: two primary path buttons, an optional guide and a small direct Selected Work link. No full navigation, mode bar or footer competes with the title screen.

Content routes: brand → `/portfolio`; desktop exposes Selected Work, Concept Lab and Prototype Arcade plus Menu. At ≤56rem only brand and Menu remain. The disclosure contains Entrance (`/`), Portfolio (`/portfolio`), Selected Work (`/work`), Concept Lab (`/concepts`), Prototype Arcade (`/arcade`), About (`/about`), Contact (`/contact`) and Adventure Preview — Coming Soon (`/world`). Current sections use `aria-current="page"` or nested `"location"`. Escape closes the disclosure and restores Menu focus. Selecting a link or leaving the menu closes it.

PORTFOLIO bypasses the entrance directly; professional content is never gated behind a transition, guide or game. Start Adventure remains reserved for implemented gameplay. Existing placeholder detail/filter routes remain future work.

### Selected Work (professional, long form)
Discipline filters: Product Design / UX/UI; Branding; Graphic Design; Marketing & Campaigns.
Industry filters: FinTech; Restaurant Tech; Entertainment; Oil & Gas; Telecommunications; Food & Beverage; Real Estate; Art & Design.
Additional project metadata: business relationship/audience (B2B, B2C, B2B2C, B2D); product type (SaaS, web app, mobile app, marketplace, internal tool, developer platform, website, brand experience, campaign). These are distinct dimensions; SaaS is not a type of buyer relationship.
Project card: title, hero image, one-sentence description, contribution/role, discipline, industry, status, and link.
Long-form case study blocks: overview/role/context; challenge; discovery/research; process and design decisions; solution; impact/reflections. Blocks are customizable by discipline; no need to force a brand project into UX research headings. Images include caption and alt text. Add sticky chapter navigation, anchors, mobile table of contents, executive summary, optional deep dives.

### Concept Lab (medium form)
Status filters: Ideas & Pitches; Prototypes; Realized Concepts.
Sections: opportunity, big idea, visual/interaction exploration, evolution/status, links to built professional work or Prototype Arcade where applicable. Cross-listed concept -> shipped project links should reference one canonical project rather than duplicate the full story.

### Prototype Arcade (demo first)
Primary categories: Games & Interactive; AI Agents & Assistants; Dashboards & Data; Apps & Utilities; Creative Experiments.
Multiple tags allowed; choose one primary category. Show preview, live demo URL, 2-3 short sections (what it is, why built, how it works, behind the build), technology/AI-use disclosure, GitHub link when public, state (live/beta/prototype/archived). No mandated full UX research.

### About / Contact
About story, role/skills, experience timeline, resume download, professional links. Contact with clear email/contact action; avoid exposing private information not intended for public release.

## 3. Routes (proposed)
- `/` immersive path-selection entrance and explicitly local scripted guide
- `/portfolio` preserved orange editorial homepage
- `/world` explicitly non-playable adventure preview today; future playable map will use client-only dynamic import
- `/work` filterable professional work
- `/work/[slug]` case study
- `/concepts` and `/concepts/[slug]`
- `/arcade` and `/arcade/[slug]`
- `/about`, `/contact`
- `/studio` optional Sanity Studio route protected by Sanity authentication (do not expose privileged API tokens)
- `/api/guide` reserved for future AI; NOT implemented/active in free MVP
- `/api/search` optional deterministic search endpoint; prioritize static client-side project index initially

All main pages should have meaningful titles, descriptions, Open Graph metadata and direct links. Keep project pages indexable where public.

## 4. World design and navigation
Proposed map: central Town Square with pathways to Selected Work region, Concept Lab region, Prototype Arcade building, and About/Archive area. Worlds can have multiple thematic sub-zones based on project data. An always-available map and fast-travel controls avoid forced walking.

MVP: One small world tile/scene with walkable bounds, obstacles and collisions, avatar selection (starts with one working avatar; the final experience supports 3 original selectable avatars), idle/walk animations for 4 directions, camera tracking, one NPC guide, one interactable professional project doorway, one concept marker, one arcade marker, map overlay, skip/exit option, simple project preview and deep-link.

Mobile: visitors on mobile devices are routed to editorial mode by default (see section 0); entering the game is an explicit choice. Whether the game supports touch controls at all in the MVP is TBD.

DOM alternative: a keyboard- and screen-reader-accessible navigation menu lists every world destination and guide action and links to the same canonical URLs. It is available inside `/world` at all times and does not depend on the canvas.

Physics: 2D arcade movement with smooth keyboard support; choose click/tap-to-move and touch joystick only if feasible without hurting usability. Maintain camera bounds. Distinguish physical walkable map coordinates from project content. Store map destination IDs and coordinates in map config, not generated AI text.

Guide animation states: idle, walking, thinking, talking, pointing, celebrating. Do not create fake claims that it is intelligent in phase 1; label responses as guide/search, not generative AI.

Controls: WASD/arrows move; E or Enter interacts; Esc closes overlays / opens menu where appropriate; click/tap target support; game pause when overlays or chatbot input active. Users can open direct navigation menu at any time. Reduced-motion preference, music off by default, mute, visible instructions.

## 5. Content model (Sanity)

### Document types
- `project`: one canonical record shared across all modes.
- `personProfile`: About, skills, resume links and public intro.
- `worldLocation`: world ID, mapped destination, label, unlocked state, coordinates reference, project reference(s), NPC dialogue summary.
- `siteSettings`: navigation, footer, featured IDs, contact info, hero copy, feature toggles.
- `guideFAQ`: approved question patterns, short responses, corresponding links/chapters, guide action and keywords (phase 1).
- `navigationTour`: ordered stops of available world destinations (optional later).

### Project fields
- `_id`, `slug`, `title`, `shortTitle`, `section` (work/concept/arcade), `discipline[]`, `industry[]`, `audienceModel[]`, `productType[]`.
- `primaryArcadeCategory` (if arcade), `tags[]`, `status` (idea/prototype/realized/shipped/live/archived as appropriate), `featured`, `sortOrder`.
- `summary`, `heroImage`, `cardImage`, `role`, `team`, `timeline`, `organizationOrClient` (when public), `responsibility[]`.
- `chapters[]` with flexible structured content blocks: heading, portable rich text, image, gallery, comparison, metric, quote, video/embed, process steps, downloadable artifact.
- `keyFacts[]` and `approvedGuideSummary` (separate short public factual material); `relatedProjects[]`; `worldLocationRef`.
- `demoUrl`, `sourceUrl`, `buildStack[]`, `aiInvolvementDescription`, `lastUpdated` where appropriate.
- `visibility` and `publishState`: only published, public projects are rendered or exported for AI.

### Validation
- Unique slug; title/summary required; alt text on meaningful images; valid external URLs; prohibit empty rich-text heading blocks; clear project state; chapter IDs stable for anchor linking.
- Avoid assuming all fields apply to each section; editor conditionals are preferred.
- Use an explicit content visibility flag, and confirm public permission for client assets.

### Shared typed view model
Create a TypeScript adapter that maps Sanity document records to `PortfolioProject` and `PortfolioSummary`. Both the website, game, and future AI index consume this adapter. Do not call Sanity separately from game objects for every sprite.

## 6. AI companion — two phases

### Phase 1: Free deterministic guide
The approved entrance milestone now includes a small route-only scripted Wayfinder on `/`. It has suggested prompts, typed questions, explicit unknown handling and allowlisted destination IDs. It does not implement project search, world movement, a model, API route, credentials or an SDK. The provider interface leaves room for a future server-backed implementation without exposing secrets in the browser. The broader content-index guide below remains future scope.

The guide is scripted and uses a free local search index built only from published, public content (no external service, no API key). The specific search library and index build step are TBD. A persistent character in portfolio and world mode, with a chat-like search panel. Visitor may type a question. Normalize text and search project title, description, skill tags, industry, product type, summary, public FAQs. For exact keywords and questions, return approved prewritten answers; otherwise present ranked relevant project cards and navigation options. If unmatched, say no good match and offer categories. Never pretend the search system is a generative AI.

Actions: `findProjects(filters)`, `showProjectPreview(projectId)`, `navigateToLocation(locationId)`, `guideToProject(projectId)`, `openCaseStudy(projectId)`, `jumpToChapter(projectId, chapterId)`, `showWorldMap()`, `switchMode(mode)`. All actions require validated IDs; no arbitrary route execution.

Guide may follow the visitor and can execute deterministic pathfinding to a known waypoint; the pathfinding engine, not an LLM, controls movement.

### Phase 2: Paid/usage-based AI
Later: server-side generative API, retrieval from only published/approved portfolio facts, action selection via strict schemas, citations/links to specific case study sections, conversation cost controls, rate limiting, error fallback. Never expose API key to frontend. Sync index upon published changes and deletions; test removal. Avoid sending private docs or personal visitor data into model context. Use a documented refusal/unknown behavior for missing facts. Consider data retention/privacy notice and abuse prevention before public launch.

## 7. Architecture / project layout

```
app/
  page.tsx
  world/page.tsx
  work/page.tsx
  work/[slug]/page.tsx
  concepts/page.tsx
  concepts/[slug]/page.tsx
  arcade/page.tsx
  arcade/[slug]/page.tsx
  about/page.tsx
  contact/page.tsx
  studio/[[...tool]]/page.tsx
components/
  editorial/ (rich-text blocks, image galleries, anchors, metrics)
  portfolio/ (filters, cards, project summaries)
  companion/ (companion sprite mount, chat/search, actions)
  game/ (client-only Phaser canvas mount, controls, overlays)
game/
  scenes/ (Boot, World, optional stage scenes)
  systems/ (movement, collision, interactions, pathfinding)
  data/ (world map config, destinations, test fixtures)
  sprites/ (animation definitions)
lib/
  content/ (types, Sanity queries, adapters, static fallback)
  guide/ (search, FAQ, action validation)
  shared/ (routes, feature flags, metadata)
sanity/
  schemaTypes/ (project, worldLocation, guideFAQ, siteSettings)
public/assets/
  game/ (original optimized sprites, tiles, atlases, backgrounds)
  placeholders/ (non-client temporary original graphics)
tests/
  e2e/ and unit/
docs/
  PROJECT_BLUEPRINT.md
  DESIGN_SYSTEM.md
  CONTENT_RULES.md
  AGENT_TASKS.md
AGENTS.md   (repo root, Codex instructions)
CLAUDE.md   (repo root, Claude Code instructions)
```

Build Sanity Studio only where practical and authenticated; preview/public data must be separated. Keep `game` code client-only with a dynamic import. Use static/ISR content where applicable; no AI backend needed in MVP.

## 8. Art direction and design system
Visual world: high-resolution whimsical illustrated characters/backgrounds, soft layers, bold colors, curved paths, appealing transitions, subtle squash/stretch, no pixelated assets as default. Use an original mascot and game title. Avoid imitating Nintendo's recognizably protected graphics or copying Super Mario Wonder character designs, level layouts, soundtrack or assets.

Editorial pages: neutral/light background, exceptionally readable long form, elegant modern typography, generous white space and image captions. Small original illustration motifs can connect to the adventure UI, but prioritize portfolio evidence.

Create visual tokens: type scale, spacing, colors, responsive breakpoints, shadows, icon sizes, z-index layers, consistent dialog/destination treatments. World UI overlays should be visually consistent but different from professional article pages.

Asset handling: maintain source artwork in editable form where possible, export optimized atlases (WebP/PNG), record provenance/license and alt descriptions. Design sprite states and sizes before mass asset creation.

## 9. Accessibility & performance
- Fully functional editorial mode without Canvas, JS game load or animation.
- Keyboard navigable menus, focus management, labeled dialogs, visible focus and skip links.
- Touch-friendly UI; no mandatory mouse/keyboard controls to access core content.
- Reduced motion, sound toggle, performance fallback, optional high/low quality game settings.
- Responsive image sizes, lazy load below the fold, game chunk loaded only on `/world`.
- Limit memory leaks: destroy Phaser instance on unmount; prevent duplicate listeners.
- Semantic heading structure, image captions and alt text, contrast tests.
- Test at mobile sizes and modest devices; baseline goal: good Core Web Vitals on editorial routes.

## 10. Free-first deployment
Use GitHub Free, Sanity Free, Phaser open source, Next.js and eligible Vercel Hobby development. Vercel Hobby is limited to personal/non-commercial use; review whether a public job-seeking/professional portfolio qualifies before public launch, and switch to an appropriate compliant hosting plan/provider if needed. Custom domain may be added later without redesign. Respect free-tier CMS/image and build limits. No OpenAI API in the free MVP.

Secrets: `.env.local` ignored by git, GitHub secret scanning, preview/published dataset permission checks; no tokens hardcoded in source. Restrict Studio editing to authenticated account.

CI: lint, typecheck, unit tests, build, end-to-end smoke; preview deploy on PR; production on approved main branch.

## 11. Phased build plan and acceptance criteria

### Phase 0 — Project setup and decisions
- Initialize repo, create Next.js TypeScript/Tailwind project, basic theme tokens, CI and docs.
- Draft one original mascot design sheet, 3 avatar concepts, one map thumbnail.
- Create anonymized placeholder projects for testing, not invented client credentials.
- Acceptance: app builds, lint/typecheck pass, no secrets committed.

#### Phase 0 implementation order
Phase 0 is delivered as separate tasks from the backlog (section 14), one at a time, each in its own PR. No Sanity, Phaser, guide or real content in Phase 0.
- **Task 1 (first implementation task): scaffold Next.js app and layout.** Approved as Codex's first and only starting task.
- **Task 2: design tokens and responsive site shell.** Starts only after Task 1 is reviewed and approved.
- Remaining Phase 0 items (CI, mascot/avatar/map drafts, anonymized placeholder projects) are separate tasks, TBD.

##### Task 1 acceptance criteria: scaffold Next.js app and layout
- A Next.js + TypeScript + Tailwind app exists at the repo root following the layout in section 7 (empty folders/placeholders are acceptable for later phases).
- `/`, `/work`, `/concepts`, `/arcade`, `/about`, `/contact` render minimal placeholder pages with a meaningful `<title>` and description; unknown routes return the 404 page.
- A root layout exists with a semantic page structure (`<main>`, one `<h1>` per page) and a `lang` attribute. Header, footer, skip link and design tokens are Task 2, not Task 1.
- No Phaser code or game assets are loaded on any route.
- `lint`, `typecheck` and `build` scripts exist and pass from a clean install; a README section documents how to run them.
- `.env.local` and other env files are git-ignored and no secrets exist in the repo.
- No Sanity, Phaser, AI SDK or other out-of-scope dependencies are added.

##### Task 2 acceptance criteria: design tokens and responsive site shell
- Design tokens exist as a single source (color, type scale, spacing, breakpoints, z-index) and are used by the shell; values not yet decided in [Design System](DESIGN_SYSTEM.md) are marked TBD there and use clearly named temporary values.
- A responsive shell provides header navigation, footer, skip link, visible focus styles and a visible mode-switch placeholder (Start Adventure / View Portfolio). It works at 360px and 1280px widths without horizontal scroll.
- Navigation is fully operable by keyboard alone.
- Task 1 criteria still pass.

Definition of done (applies to every task and phase):
- All acceptance criteria are met and demonstrated, not just claimed.
- Relevant checks pass (lint, typecheck, tests where they exist, build) and the output is recorded in the PR description.
- Only files in scope were changed; no unrelated features were modified.
- Docs affected by the change are updated; unresolved questions are listed as TBD, not guessed.
- No secrets, private/NDA content or unlicensed assets are added.
- Changed files, test results and open issues are reported in simple language.
- Claude Code has reviewed the change and the owner has approved it before merge (and, from Phase 2 on, after a visual review).

### Phase 1 — Editorial website + CMS
- Create Sanity schemas, content adapters, homepage, work/concepts/arcade lists, filters, 3 templates, About, Contact.
- Add one real project only when material is supplied and approved.
- Acceptance: editable images and long text render correctly; direct links work; desktop/mobile readable; bad slugs return 404; unpublished documents hidden.

### Phase 2 — Vertical slice game
- Small playable vertical slice (approved scope): a single world scene, one working original avatar (the final experience will support three selectable avatars, added after the slice), movement, collisions, camera, one NPC, three destinations, map overlay, DOM navigation alternative, game-to-portfolio project link. Nothing beyond this is in scope.
- Acceptance: player cannot walk through obstacles; all destinations accessible with game or DOM menu; exit works; game does not load on normal routes; mobile visitors are not forced into the game.

### Phase 3 — Guide without AI fees
- Add follow-character animation, scripted question search and project index, route suggestion, highlight waypoint, map/URL actions.
- Acceptance: keyword examples resolve correctly; unknown questions fail gracefully; action validation prevents bogus URLs; input focus pauses game.

### Phase 4 — Content/visual polish and launch readiness
- Replace placeholder art, add animations, compress images, test screen readers/focus, responsive behavior, CMS publishing, analytics only when privacy requirements handled.
- Acceptance: no broken routes, important information is discoverable without game, no leaked draft content, verified license/permission for assets, run performance audits.

### Phase 5 — Optional paid enhancements
- Custom domain, appropriate hosting for live professional/commercial context, paid Sanity only if necessary, AI API + published-knowledge index + rate limiting + safety checks.
- Acceptance: AI cites or links to actual sections; no unsupported facts; sync update/delete; API cost protections.

## 12. Testing scenarios
1. Visitor skips game, filters Work by Product Design, reads a long case study with research images.
2. Visitor enters game, selects an avatar (Phase 2 slice: the single available avatar; three once the final set exists), reaches three landmarks and uses Escape to exit.
3. Visitor types "Show me B2B SaaS projects" and sees relevant results from test/project content.
4. Visitor types "I'm lost" and gets map plus direct menu.
5. Visitor selects a project and opens the exact canonical URL, not a duplicate game-only copy.
6. Visitor on phone lands in editorial mode, can browse all core content without using movement controls, and can opt into the game.
7. Visitor navigates article with keyboard and can access image captions.
8. CMS editor unpublishes a project; it disappears from list, world destination and guide results.
9. No environment secrets appear in browser bundles.
10. Game engine cleans up cleanly when switching to regular portfolio.
11. A keyboard/screen-reader user reaches every world destination and guide action through the DOM navigation without the canvas.
12. Content marked private/NDA appears nowhere in the built output, search index or guide answers.

## 13. Collaboration protocol (Codex + Claude)
- One GitHub repo, one owner of implementation per task; avoid both agents editing the same files concurrently.
- Claude: review architecture, specs, UI/UX critique, acceptance criteria, edge cases; propose change requests.
- Codex: implement scoped tasks and tests on branches/PRs; record changed files, test output and unresolved issues.
- Human: approve architecture, content claims, art style and merge decisions.
- After each phase, require tests plus a human visual review before proceeding.
- No autonomous deployment to production, paid service activation or secret creation without approval.

## 14. Initial backlog (first ten implementation tasks)
1. Scaffold Next.js app and layout.
2. Add design tokens and responsive site shell.
3. Create typed `PortfolioProject` model and mock dataset.
4. Build Selected Work list/card/filter UI.
5. Build flexible editorial case study blocks and table of contents.
6. Build Concept Lab listing and medium story template.
7. Build Prototype Arcade listing and demo-first template.
8. Add Sanity schema, queries, adapters and draft controls.
9. Create minimal client-only Phaser world vertical slice.
10. Add companion guide UI with deterministic search and validated navigation.

## 15. Explicitly out of scope for initial free MVP
- Paid AI API, RAG vector database, voice-based guide, persistent accounts, real-time multiplayer, fully 3D world, elaborate procedural world generation, large number of mini-games, complex achievements, publishing private client/internal documents.

## 16. Open product decisions (default for now)
- Title: Portfolio Quest (working name).
- Main look: original illustrated 3/4-view fantasy world.
- Avatars: 3 original selectable characters in the final experience; Phase 2 starts with one working avatar.
- Companion: original separate guide mascot, persistent across both modes.
- Movement: free four-direction roaming, fast travel at any time.
- Arcade entries: external or embedded demo based on trusted permissions, with safe iframe sandbox if embedding.
- Initial language: English, with architecture ready for localization.
- Content: placeholders until approved project records are provided.

## 17. Official reference links
- Phaser: https://www.phaser.io/oss/docs/
- Sanity + Next.js: https://www.sanity.io/docs/nextjs
- Vercel Hobby: https://vercel.com/docs/plans/hobby
- Vercel commercial limits: https://vercel.com/docs/limits/fair-use-guidelines
