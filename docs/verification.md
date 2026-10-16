# Verification record

Synthetic Alex Morgan / Sam Taylor documents only. The V1 checkout was read-only: its existing PDF modification and untracked agent project remain exactly as found. No credentials, DNS or production deployment were configured.

## Final gates

The authoritative combined run is [check.log](../artifacts/check.log). It includes strict types, Hooks/Compiler lint, the <600-line source gate, unit tests, full engine coverage, fresh-cache development, production build and production-runtime browser tests.

| Gate                         | Actual outcome                                                                                                  |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `bun run typecheck` / `lint` | Pass, strict TS and React Compiler rules                                                                        |
| `bun run check:files`        | Pass; all handwritten source below 600 lines; Projects CSS has a non-failing proximity warning                  |
| `bun run test`               | 69 tests, zero failures                                                                                         |
| `bun run test:engine`        | 44 engine tests; 99.59% lines / 99.38% functions; minimum 85% each, all engine sources included                 |
| `bun run test:dev`           | Fresh isolated Vite cache, first HTTP SSR response, five browser journeys; no hooks/runtime/PostCSS regressions |
| `bun run build`              | Real client assets and Cloudflare SSR Worker                                                                    |
| `bun run test:e2e`           | 22 Chromium journeys against the built local Worker                                                             |
| `bun run visual:check`       | Three visual/creative journeys pass; [log](../artifacts/visual-check.log); final screenshots opened             |
| `git diff --check`           | Checked before Git delivery; logs normalized for trailing whitespace only                                       |

Final `bun run check` completed successfully (exit 0), including all 22 production browser journeys. Bun reports lines/functions, not branch coverage. Cloudflare local execution verifies runtime compatibility rather than an already deployed site. GitHub Actions repeats the gate; its remote status is tracked separately on [PR #1](https://github.com/ExtraBinoss/ResumI/pull/1).

## Behavior exercised

- Actual SSR public response content, nested editor recovery, direct opening and reload at 1440px/390px. Exactly one main region, no leftover loading screen, no hydration errors and viewport-height editor. [Hydration decision](decisions/004-document-hydration.md).
- Landing → create exactly one project → edit → save → reload → dashboard reopen. Intent prefetch alone does not create an IndexedDB database or document.
- Dashboard previews, continue editing, search, sorting, grid/list, rename, independent duplication, confirmed/cancelled deletion, JSON import/export.
- Legacy section/block CRUD, order, styling and keyboard history remain functional. A real IndexedDB v1 database migrates to v2; offline editing survives reopening. Storage denial is actionable; stale-tab writes are refused while unsaved data remains exportable.
- Freeform layer drag/resize, snapping, marquee and multiselection, grouping/ungrouping, order, visibility, locks, blend/opacity, shapes/gradients/effects, image import and crop, inline text ranges, and Visual/Text editing against the same text/history.
- Imported real WOFF2 loads as a FontFace on canvas, survives reload and is embedded exactly in portable HTML. A CSS family name alone is insufficient for this assertion.
- Teammate validates, previews actual geometry/style/source changes, applies through the same commands, and supports undo/redo. A human edit invalidates an older preview.
- HTML/React drafts, saved activation across Visual/Code switching and reload, source import/export, React hooks, iframe isolation, compiler errors preserving the applied preview, catalog React templates and offline standalone React output.
- Engine boundary cases include group ownership/order/locks, text-mark splitting, non-duplicated selections and immutable failures, deterministic commands, exact UTF-8 document budgets and export/import limits. CLI compilation never executes user code.

The Jotai subscription test verifies that editing one block does not notify an unrelated block or parent section. Save-drain tests hold an asynchronous write open while further edits arrive, checking serialized writes and ordered revisions.

## Visual evidence actually inspected

Screenshots were opened with image tools and checked for spacing, clipping, legible controls and action visibility:

- [Landing desktop](../artifacts/visual/landing-desktop.png), [mobile](../artifacts/visual/landing-mobile.png), [templates mobile](../artifacts/visual/templates-mobile.png).
- [Dashboard desktop](../artifacts/visual/projects-desktop.png) and [mobile](../artifacts/visual/projects-mobile.png).
- [Editor desktop](../artifacts/visual/editor-desktop.png) and [mobile](../artifacts/visual/editor-mobile.png).
- [Layers/groups](../artifacts/visual/editor-layers-desktop.png), [Text mode](../artifacts/visual/editor-text-desktop.png), [embedded font](../artifacts/visual/editor-font-desktop.png), [Code mode](../artifacts/visual/editor-code-desktop.png), [editable React Studio](../artifacts/visual/editor-react-template-desktop.png).
- [Teammate review](../artifacts/visual/agent-review-desktop.png), with actual JSON proposal, rendered diff and enabled apply action.
- [Standalone React](../artifacts/visual/portable-react-resume.png) and [standalone visual](../artifacts/visual/portable-visual-resume.png) exports, opened offline without external requests.

[Rendered artifacts](../artifacts/rendered/) retain actual page DOM, computed CSS, command JSON Schema, CLI documents and standalone HTML. [Portable inspection](../artifacts/rendered/portable-inspection.json) confirms 794 × 1123px output, one Profile heading, no runtime errors, and group opacity 0.85 / multiply. [Font evidence](../artifacts/rendered/editor-font-verification.json) confirms one loaded Interface face and the exact embedded 48,256-byte WOFF2. These artifacts contain synthetic content.

Inspection found real issues beyond functional assertions: the split production fallback left a loading screen above the editor; CSS zoom culled initial layer painting; mobile dock sizing wrapped too far; dashboard search was compressed by a full-width select; a non-reactive font stylesheet rendered fallback glyphs despite a valid family name. Each was fixed and rechecked. Production direct/reload and real FontFace regressions now have browser assertions.

## Creation profiling

The same script measures three fresh Chromium contexts, 1440 × 1000, a warmed Vite server, 250ms pointer intent and no CPU/network throttle:

| Run                                                                    | Median click to canvas | Samples         |
| ---------------------------------------------------------------------- | ---------------------- | --------------- |
| [Before](../artifacts/performance/create-before.json)                  | 611ms                  | 588, 611, 702ms |
| [Final expanded workspace](../artifacts/performance/create-final.json) | 366ms                  | 360, 366, 415ms |

That is about 40% lower in this local comparison, despite the expanded workspace. Compressed Chrome traces are retained beside both JSON files. Run `RESUMI_PROFILE_LABEL=latest bun run profile:create` against an already warmed server; `BASE_URL` selects another server.

The changes remove the serial creation route, prefetch code on intent, isolate CLI-only schema generation, use Zod Mini rather than the full browser schema package, and defer the source compiler/runtime and large shape/icon catalogs. Validation remains mandatory.

These measurements do not include initial Vite compilation, network throttling, field Core Web Vitals or server inference. The intermediate `create-workspace.json` includes a 4.8s development recompilation sample and is retained as diagnostic evidence, not used in the warmed comparison. [Production interaction samples](../artifacts/performance/interactions.json) separately include Playwright transport/assertion overhead for opening and ten edits.

## Reproduction and boundaries

`bun run check` runs every required gate; `bun run visual:check` runs the screenshot subset. `BASE_URL=http://127.0.0.1:PORT bun run test:e2e` targets an existing server. Artifact filenames are deliberately overwritten with the latest run.

Tasks 00–13 describe the initial slice and its user-requested expansion. Browser coverage is Chromium on Linux; real-device and broader assistive-technology testing remain open. Freeform layout is one A4 page with flat groups. Arbitrary HTML/React remains a preserved source representation rather than automatic two-way conversion into layers. React accepts single-file React imports, not arbitrary npm projects. Auth/cloud sync, provider inference, MCP/WebMCP, automatic pagination, dedicated PDF service and production deployment remain outside this delivery.
