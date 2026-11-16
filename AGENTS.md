# Codex Project Instructions

Before making changes, read both of these:
- `docs/PROJECT_BLUEPRINT.md`
- `docs/AGENT_TASKS.md`

## Responsibilities
- Follow the project architecture and design requirements.
- Implement one task at a time.
- Do not modify unrelated features.
- Use reusable components and clean code.
- Run relevant tests after implementing features.
- Explain all changes in simple language.
- Ask before making major architectural changes.

## Collaboration
Claude Code may review the same repository.
Do not overwrite changes made by another agent
without reviewing them.

## Related documents
- [Blueprint](docs/PROJECT_BLUEPRINT.md) (approved decisions are in section 0)
- [Design System](docs/DESIGN_SYSTEM.md)
- [Content Rules](docs/CONTENT_RULES.md)
- [Agent Tasks](docs/AGENT_TASKS.md)

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
