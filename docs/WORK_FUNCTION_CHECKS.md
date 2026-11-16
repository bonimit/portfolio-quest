# Selected Work function checks — 2026-11-15

Scope: existing mock-project experience in development. No application components, protected Portfolio sources, templates, scenes or assets were changed in this check.

## Verified by automated checks

- Actual `useCardDrag` hook executed against deterministic pointer events, DOM geometry and animation clock: card reorder callback, ghost/transform, drop, click suppression and expiry, ordinary-click navigation eligibility, touch/secondary-button exclusion, unmount listener/frame cleanup. Four tests pass. This harness does not reproduce browser rendering, pointer dispatch, focus or hit testing.
- Existing discovery model: all five filter dimensions and URL round-tripping, AND/OR facet behavior, nonmutating curated/alphabetical/newest sorting and valid collage/grid slots. Four tests pass.
- Development HTTP checks: default, search, industry filter, combined discipline/business model filter, A–Z/newest/colour sorts, grid layout query and empty results all match expected card order. All twelve sample cards open HTTP 200 D6 pages with sample disclosure and a return-to-Selected-Work link. Ten tests pass.
- Full `npm test`: 107 PASS. `npm run lint`: PASS. `git diff --check`: PASS.
- No application source changed, so production build/typecheck were not repeated; the preceding homepage-promotion checks remain separately documented.

## Browser observations and outstanding verification

Native Chrome showed the 12-card development page and sample disclosure. The accessibility action on the layout toggle focused it but did not demonstrate a state change, including after a reload. This is unresolved: it could be input delivery or client execution. A console-inspection attempt was interrupted by concurrent user window changes. Fresh state confirmed the browser had moved to an unrelated page; no unrelated page was manipulated. No drag gesture was performed, so live drag success is NOT claimed. Live search/filter/sort/layout changes, drag/drop/Tidy up, keyboard/touch and browser Back remain pending.

The server's existing logs also show blocked development HMR requests from `127.0.0.1`. Use the server's canonical hostname <http://localhost:3000/work> for the next browser check; no global origin/security settings were changed. No confirmed application defect was patched without evidence.

## Files changed

- `tests/work-drag.test.mjs` — four tests exercising the actual hook with a controlled event clock.
- `tests/work-preview-http.test.mjs` — ten development route/project-link tests.
- `package.json` — add drag tests to the unit suite and `test:work:preview` script.
- `docs/WORK_FUNCTION_CHECKS.md` — this evidence and limits.

Run `npm test` and, while the existing development server is running, `npm run test:work:preview`. No packages, commits, deployment or automation changes.


## Live follow-up after owner provided browser time

Native Chrome at `http://localhost:3000/work` verified grid switch (`?layout=grid` and pressed state), search `payments` (one result and matching URL), Clear all (twelve results), FinTech industry filter (three results), Escape closing filters, A–Z sort (alphabetical order), grid drag/drop, Tidy up, collage switch and collage drag/drop. In grid, Mobile plan launch campaign moved from fifth to sixth with Rental listings fifth; Tidy up restored the original order. In collage, Payments onboarding flow moved behind Table-side ordering app. The native accessibility tree confirmed both reordered DOM and the arrangement announcement. Screenshot inspection confirmed the card layouts before gestures.

A fast-drop edge case was reproduced in the hook harness: when pointerup arrived before RAF, the final hit test was skipped. Fixed by reusing the same swap calculation at release, with a regression test. The drop announcement no longer reports a stale position from the preceding render. Recovery: `.local-snapshots/work-fast-drop-before-2026-11-15/`.

Fresh validation: 108 unit tests, 10 development HTTP checks, lint, TypeScript and production build PASS. Only `components/work/use-card-drag.ts`, `components/work/work-explorer.tsx`, `tests/work-drag.test.mjs` and this report changed in the follow-up. Templates, protected Portfolio design, mock data and assets remain intact.

Live keyboard-only reordering is not implemented; touch retains native scrolling, as designed. Mobile/zoom/reduced-motion visual checks, Newest/Colour sorting via browser, console audit, project-click/Back flow and per-tab custom-arrangement persistence remain unverified. Arrangement is component state, not a saved preference; URL sharing includes filters/sort/layout, not custom drag order. Browser interaction was interrupted again after collage verification, so the remaining checks are not claimed passing.

Page names, navigation and journey gaps are documented in [INFORMATION_ARCHITECTURE.md](INFORMATION_ARCHITECTURE.md).
