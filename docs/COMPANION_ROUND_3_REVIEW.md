# Companion panel — Round 3 final implementation handoff

Date: 2026-11-11. Workspace: `/Users/workspace/portfolio-quest-website`.
Branch: `website/implementation`. This is the final implementation round of the
current three-round cycle, not visual or release approval.

The full specialist report was not present in the repository; the owner's
explicit Round 3 findings supplied the repair scope. Earlier reports, previews,
uncommitted work and recovery snapshots were preserved. Before edits, 87 files
were archived with hashes in `.local-snapshots/companion-round3-before-2026-11-11.tar.gz`
and `.json`. Recover individual files after comparison, never restore wholesale.

## P0 repairs

**Path visibility.** Intro, primary path navigation, character and companion now
share one entrance grid. At 1024px and wider the note spans the right column,
with the three entrance regions alongside. Below that width the same primary
path navigation is sticky within the full grid containing the panel, so it can
remain above the conversation when focus/scroll moves down the page. There are
no duplicate primary buttons, modal backdrop or inert background. Path buttons
have explicit stacking above the note, including during stage motion. Their
secondary text is now at least .75rem. This is an implemented layout strategy;
the actual eight-width visibility/clickability requirement is **not yet verified**.

**Conversation coverage.** The exact placeholder/example “Which way should I go?”
now resolves to choice guidance. Lost/directions, straight/curly “I'm lost”, “how
does this work”, “chatgpt”, “skip the game” and “what can you do” have explicit
regressions. Skip goes to the available Portfolio path. Informational/unmatched
answers remain idle. The prior truthful unavailable-content responses and cue
policy are retained.

**Honest copy and direct destinations.** The disclosure is exactly
“Scripted guide · Not AI”. Welcome contains visible Portfolio and Adventure
Preview links and states that the latter is non-playable. Unmatched copy describes
the limited local question matching without promising a future real-AI service.
No projects, biography, outcomes or new roadmap commitments were invented.

## Direction A and accessibility refinements

- Preserved the paper/ink/orange Field Note, with a coherent orange offset shadow.
  Opening transform origin is measured from the actual avatar button once per
  panel mount. No continuous parallax or extra animation dependency was added.
- Three stage regions use a 420ms transform-only FLIP transition; panel entry/exit
  stays brief. Specific Portfolio/Adventure requests receive a restrained path
  outline, announced in the single reply status. General questions do not choose
  a path for the visitor. Pause/reduced motion bypass stage motion and panel effects.
- The panel is a labelled complementary `<aside>`, not a dialog. The avatar has
  aria-expanded and a conditional aria-controls target, with no dialog popup claim.
  Opening focuses the complementary region; ordinary Tab navigation remains free.
- Escape is handled only by key events originating inside the panel, respecting
  IME composition and already-handled events. Escape on unrelated controls does
  nothing to the panel. Delayed dismissal restores avatar focus only if focus is
  still owned by the panel; clicking elsewhere during exit does not steal focus.
  Reply completion also does not pull focus back from unrelated controls.
- Improved the 320px character-header spacing and kept Close at 44px. Disclosure,
  small labels, questions and privacy text are larger. Focus/text contrast tests pass.
- Failure replies have plain visible history text plus one status announcement,
  rather than alert + status duplication. Empty input uses its single visible
  alert and leaves focus in place instead of refocusing and rereading the error.
  Screen-reader behavior still needs live assistive-technology verification.
- A shared visibility observer handles missing IO, empty/unrelated entries,
  multiple entries using the latest state, duplicate states and post-cleanup
  callbacks. This changes observation guards only, not walking movement decisions.
- The redundant Pause/Resume button is hidden under prefers-reduced-motion.
  Existing reduced-motion/static-avatar behavior is retained.

## Strict preservation

No sprite art, atlas, extraction, movement speed, stride selection, travel math,
turning logic, sprite playback, protected Portfolio files or automation changed.
`walking-guide.tsx` has only the observer wrapper/import and panel relationship
attributes changed. Its movement-function block is protected by a new baseline
hash, alongside nine art/runtime files. All 19 existing protected Portfolio hashes
also match. Package scripts were added; dependencies and package-lock are unchanged.
No packages/services, paid APIs, credentials, commits, pushes, merges or deployment.

## Exact validation results

- `npm run lint`: PASS, zero warnings.
- `npm run typecheck`: PASS.
- `npm run build`: PASS. All eight existing routes and custom 404 generated.
- `npm test` / `npm run test:unit`: **92 PASS, 0 failures, 0 skips**.
  Covers complete answer cues, reported intent examples, complementary semantics,
  visible welcome links/disclosure, scoped Escape/focus policy, suggestions,
  observer lifecycle, movement/atlas preservation, script syntax and matrix widths,
  plus prior timing, route, playback, contrast and preservation tests.
- `npm run test:assets`: PASS, all 42 frame alpha/baseline/border checks, source hash,
  poster equality, dimensions and byte budgets.
- `npm run test:http`: **9 PASS, 0 failures, 0 skips** against the production server.
  Includes all eight routes, metadata/semantics, loaded assets and custom 404.
- Browser-runner and its page proxy HTTP smoke checks: `/__companion-checks`, `/`
  and `/portfolio` all 200. This checks the runner server only, not browser rendering.
- `git diff --check`: PASS. Native TS tests retain the existing
  MODULE_TYPELESS_PACKAGE_JSON warning; no module configuration was changed.

## Live browser evidence and remaining P0 gap

Browser inventory reported “browser access host is unavailable”. Native Chrome
attempts opened a new tab but then reported concurrent user changes or timed out
before the local runner could be reached. No live matrix result JSON was recorded.
No new rendered screenshots, native keyboard/touch observations, screen-reader
checks, reduced-motion run or visual approval are claimed.

| CSS width | Implemented layout | Actual visibility and hit target verification |
| --- | --- | --- |
| 320 | Stacked note; sticky primary paths | Unverified |
| 390 | Stacked note; sticky primary paths | Unverified |
| 768 | Stacked note; sticky primary paths | Unverified |
| 1024 | Right note; paths in left column | Unverified |
| 1279 | Right note; paths in left column | Unverified |
| 1280 | Right note; paths in left column | Unverified |
| 1440 | Right note; paths in left column | Unverified |
| 1920 | Right note; bounded editorial measure | Unverified |

The build, unit tests and breakpoint choice do not prove this P0 requirement.
Claude's final verification must run the matrix and review the actual result.

### Reproducible live check

1. Run `npm run build`, then
   `npm run start -- --hostname 127.0.0.1 --port 3100`.
2. In a second terminal run `npm run test:browser`.
3. Open `http://127.0.0.1:3101/__companion-checks` and click **Run live matrix**.

The localhost-only runner proxies the real production site, opens same-origin
frames at all eight widths (900px height), waits for fonts/hydration, opens the
actual panel and checks both path bounds and center-point elementFromPoint hit
results after opening/focus and after input scrolling. It checks scoped/unrelated
Escape, path transitions and cancellation/focus. Results are visible and saved to
`.local-snapshots/companion-round3-browser-results.json`. No browser package or
external service is used. In reduced motion it checks native hrefs; normal mode
exercises and cancels transitions. Programmatic events are not physical pointer,
Tab, touch, screen-reader or animation-quality approval. Test those separately,
including 200% zoom, short heights and on-screen keyboards.

The runner is implemented and syntax/HTTP checked but remains unexecuted in a live
browser this round. It is a final-verification aid, not recorded passing evidence.

### Static review preview

[Round 3 gallery](previews/companion-round3/index.html) uses production styles and
actual React panel markup at matching widths. It is a static preview, not a live
focus/scroll test, screenshot or animation recording. Earlier galleries remain
unchanged. Regenerate after views with
`node scripts/preview-companion.mjs --out=docs/previews/companion-round3`.

## Exact changed files

Modified:

- `app/entrance.css`
- `components/entrance/entrance-experience.tsx`
- `components/entrance/local-guide.tsx`
- `components/entrance/guide-portrait.tsx`
- `components/entrance/walking-guide.tsx` (observer/ARIA only)
- `lib/guide/local-guide.ts`
- `lib/guide/panel-interaction.ts`
- `scripts/preview-companion.mjs`
- `tests/companion-panel.test.mjs`
- `tests/website-http.test.mjs`
- `package.json` (test scripts only)
- `docs/DESIGN_SYSTEM.md`
- `docs/AGENT_TASKS.md`
- `docs/COMPANION_INTERFACE_REVIEW.md` (latest-review link)

Added:

- `lib/guide/observe-visibility.ts`
- `scripts/serve-companion-checks.mjs`
- `tests/companion-round3.test.mjs`
- `tests/browser/companion.html`
- `tests/fixtures/avatar-movement-preserved-sha256.json`
- `docs/previews/companion-round3/index.html`
- `docs/previews/companion-round3/after-open.html`
- `docs/previews/companion-round3/after-closed.html`
- `docs/COMPANION_ROUND_3_REVIEW.md`

## Readiness for final verification

The focused repairs are implemented and automated checks pass. They are ready for
Claude to verify in this cycle's final review. **Approval readiness is pending the
actual P0 path-visibility/clickability matrix and visual/accessibility checks**.
Do not close the cycle as approved on the strength of the build. Owner visual
judgment and actual reduced-motion, touch and assistive-technology observations
remain outstanding; no additional redesign or automatic release is authorized.
