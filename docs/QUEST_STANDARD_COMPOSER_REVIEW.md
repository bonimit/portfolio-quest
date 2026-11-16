# Familiar chat composer — 2026-11-14

Applied the owner's supplied chat-input reference to the isolated preview conversation, keeping the existing paper/ink/orange styling and consistent 16px chat typography.

- Full-width multiline writing area above an action row.
- Suggested prompt pills inside the same rounded composer; orange circular Send button at lower right.
- Pills wrap on narrow screens; the input can grow within a bounded height.
- Native textarea, accessible label, focus-within indication, existing errors/disclosure/history and scripted provider remain.
- Enter submits; Shift+Enter and IME handling are preserved. Prompt buttons retain `type="button"` to avoid accidental form submission.
- Shortened the second pill to Adventure? while submitting the existing Is Adventure playable? question.
- No fake upload, web search, microphone or AI controls were added.

Files: `components/quest-preview/restored/guide.tsx`, `app/quest-preview/quest-preview.css`, and this report. Pre-edit snapshot: `.local-snapshots/quest-standard-composer-before/baseline.tar.gz`. No avatar, pets, scene, Portfolio or automation changes.

Validation: lint, typecheck, production build, 92 unit tests and four quest chat tests passed. Native Chrome desktop: opened a separate local preview tab, inspected the composer screenshot, activated Help me choose, then typed Is this AI? and submitted with Enter. Both returned the correct scripted responses; textarea retained focus and cleared after submission. Captured screenshots in the conversation. Fresh mobile, zoom, reduced-motion and soft-keyboard visual checks were not performed in this task. Initial scene loading briefly showed only overlays; the subsequent capture showed the complete island and avatar.

Preview: `http://127.0.0.1:3100/quest-preview`, then select Talk to me. No package installation, commit, push or deployment.

Owner refinement: replaced the cramped visible Send text with a centered 21px paper-plane SVG inside the same 44px orange button. The SVG is decorative; the accessible button name remains Send question. Only `components/quest-preview/restored/guide.tsx`, `app/quest-preview/quest-preview.css` and this report changed. Snapshot: `.local-snapshots/quest-send-icon-before/baseline.tar.gz`. Lint, typecheck, production build, four focused chat tests and whitespace checks passed. Fresh visual inspection was interrupted when the owner switched to the screenshot editor; that tab was preserved.
