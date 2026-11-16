# Portfolio Quest

An interactive portfolio combining professional design work, creative concepts, and playable prototypes.

## Main Sections

- Selected Work
- Concept Lab
- Prototype Arcade

## Documentation

- [Project Blueprint](docs/PROJECT_BLUEPRINT.md) — product and technical plan, approved decisions, phases
- [Design System](docs/DESIGN_SYSTEM.md) — visual and UI rules (some decisions TBD)
- [Content Rules](docs/CONTENT_RULES.md) — what may be published, privacy and NDA rules
- [Agent Tasks](docs/AGENT_TASKS.md) — task list and acceptance criteria for Codex and Claude Code
- [AGENTS.md](AGENTS.md) — instructions for Codex
- [CLAUDE.md](CLAUDE.md) — instructions for Claude Code

## Local preview

Use Node.js 20.9 or newer and npm. From the repository root:

```sh
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Stop the server with Ctrl+C.
The site includes `/` (new entrance), `/portfolio` (preserved orange homepage),
`/work`, `/concepts`, `/arcade`, `/about`, and
`/contact`, plus `/world` for a clearly labeled, non-playable adventure preview.
The main island offers Portfolio, Concept Lab and Adventure paths with an explicitly local scripted guide. Concept Lab shows seven labelled sample pieces in development; production waits for approved public content. The two-path `/quest-preview` comparison is retained.
The approved orange page, its motion, and its quilt now live at `/portfolio`.
A skip link opens that page directly; the existing View Portfolio shortcut
still opens `/work`. Home returns to the entrance and wordmarks to `/portfolio`.
The shared navigation shell is implemented. The conventional section
pages still contain placeholder content; unknown URLs show a custom 404.
Approved paper/ink/orange colors and display typography live in `app/tokens.css`;
spacing and size scales remain provisional. The Portfolio homepage at `/portfolio` recreates the supplied
reference with a kinetic wordmark, drifting circles, tactile links, and a six-card
destination quilt. Pause motion freezes the ambient effects; mobile and
reduced-motion settings use static alternatives.
Anton, Newsreader, and Instrument Sans are self-hosted with their license notices
and provenance in `public/fonts/`; see `docs/DESIGN_SYSTEM.md` section 11.
No environment variables or external service accounts are needed.
The dev and build scripts use Next.js's supported Webpack option because
Turbopack's CSS worker cannot open its required port in this workspace.

## Checks and production preview

```sh
npm run lint
npm run typecheck
npm run build
```

Typechecking generates Next.js route types before checking TypeScript, so it also
works before the first build. Website regressions (Node 22.18+ with native
TypeScript stripping, validated on Node 26) run with:

```sh
node --test tests/website.test.mjs
```

With a production preview on loopback port 3100, also run:

```sh
node --test tests/website-http.test.mjs
```

See [Round 2 evidence](docs/ROUND_2_REVIEW.md) for the exact changes and browser
coverage. The [AI options proposal](docs/AI_GUIDE_OPTIONS.md) is documentation only;
real AI is not connected.

After a successful build, run `npm start` and open
[http://localhost:3000](http://localhost:3000) to preview the production build
locally. This does not deploy the website.

## Local development coordinator

The [automation guide](automation/README.md) explains the single-task Codex →
checks → Claude specialist review workflow. It requires Node.js 24+ and is
currently enabled for dry runs only:

```sh
npm run orchestrate:dry
npm run test:automation
```

Dry runs write ignored reports under `automation/reports/` and do not invoke
either agent or modify application code. Live runs require explicit owner approval.

## Portfolio preservation baseline

Before the entrance migration, the full source/font baseline and production HTML/
CSS were saved under ignored `.local-snapshots/` with prefix
`portfolio-baseline-2026-11-10-4ed42918`. See `docs/DESIGN_SYSTEM.md` section 12 for
recovery instructions, exact preservation evidence and validation limitations.
The local guide makes no model requests and requires no credentials or services.
