# Content Rules

Source: [Project Blueprint](PROJECT_BLUEPRINT.md), sections 1, 5, 6 and 10. Items not stated there are **TBD**.

## 1. Core rules
1. **One source of truth.** Each project is one canonical record shared by the editorial site, the game and the guide. Game destinations link to the canonical URL; no game-only copies.
2. **No invented claims.** Never invent metrics, clients, outcomes, quotes or credentials. Placeholder content must be clearly anonymized and labeled as placeholder.
3. **Public content excludes private and NDA material (approved decision).** Private, NDA, internal notes and confidential client material must never appear in the public frontend, static search index, guide FAQ, build output or any future AI index.
4. **Only published, public projects are rendered or indexed.** Unpublished or hidden projects disappear from lists, world destinations and guide results.
5. **Client assets need confirmed public permission** before use.
6. **Real projects are added only when material is supplied and approved** by the owner.

## 2. Visibility and publishing
- Each project has an explicit `visibility` and `publishState`. Only published + public records are exported.
- Private data must be kept out of public fields, not merely hidden by a flag. Field-level separation and a check that fails the build if private content reaches public output: **TBD design, required before real content is added**.
- Preview/draft data is separated from published data. Drafts are not indexed by search engines.

## 3. Writing and media
- Images need alt text (when meaningful) and captions; no empty heading blocks.
- Case-study structure follows the discipline: brand projects need not use UX-research headings.
- Concept entries link to a canonical shipped project rather than duplicating its story.
- Arcade entries disclose technology and AI use, and show GitHub links only when the repo is public. Embedded demos require trusted permission and a sandboxed iframe.
- Language: English, with architecture ready for localization.

## 4. Taxonomy (from the blueprint)
- Discipline: Product Design / UX/UI; Branding; Graphic Design; Marketing & Campaigns.
- Industry: FinTech; Restaurant Tech; Entertainment; Oil & Gas; Telecommunications; Food & Beverage; Real Estate; Art & Design.
- Audience model: B2B, B2C, B2B2C, B2D. Product type: SaaS, web app, mobile app, marketplace, internal tool, developer platform, website, brand experience, campaign. These are separate dimensions.
- Concept status: Ideas & Pitches; Prototypes; Realized Concepts.
- Arcade categories: Games & Interactive; AI Agents & Assistants; Dashboards & Data; Apps & Utilities; Creative Experiments (one primary, multiple tags).
- Project status values and per-section required fields: see blueprint section 5; final list **TBD**.

## 5. Guide content
- The initial guide is scripted and uses a free local search index over published public content.
- Guide answers come from approved FAQ entries and public project summaries (`approvedGuideSummary`, `keyFacts`). The guide must say when it has no good match and must not present itself as generative AI.
- FAQ approval workflow: **TBD**.

## 6. Legal, privacy and assets
- Art, fonts and code dependencies: record license and provenance.
- Analytics only after privacy requirements are handled; cookie/consent decision: **TBD**.
- Contact method and spam protection: **TBD**.
- Resume file and public contact details: owner decides what is public.
- Any future AI feature needs a privacy notice and must not receive private documents or visitor personal data (Phase 5).
