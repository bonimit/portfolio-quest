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
The scaffold includes `/`, `/work`, `/concepts`, `/arcade`, `/about`, and
`/contact`. Each route has placeholder content; unknown URLs show a custom 404.
Header, footer, navigation shell, and design tokens are reserved for Task 2.
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
works before the first build. There is no unit-test suite in this scaffold yet.

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
