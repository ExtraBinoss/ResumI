# Verification record

Local Linux environment, 2026-10-16. Synthetic Alex Morgan / Sam Taylor documents only. The original V1 checkout was read, not modified; its existing PDF edit and untracked agent project were left as found.

## Commands and actual outcomes

| Gate                  | Evidence / outcome                                                                                                                                                             |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `bun install`         | Locked compatible workspaces; no paid services or credentials needed                                                                                                           |
| `bun run typecheck`   | Pass, strict TypeScript and generated route types                                                                                                                              |
| `bun run lint`        | Pass, including Hooks and React Compiler recommended rules                                                                                                                     |
| `bun run check:files` | Pass, zero files with 600+ lines; Editor CSS has a non-failing 500-line proximity warning                                                                                      |
| `bun run test`        | 23 tests pass, 0 fail; schemas/commands/history/serialization, renderer, CLI, adapters, IndexedDB, granular subscriptions, serialized overlapping saves and scanner boundaries |
| `bun run test:engine` | 12 engine tests pass; 100% measured line and function coverage, all engine source modules explicitly imported; enforced minimum 85% each                                       |
| `bun run test:dev`    | Pass; 2 critical browser flows on a fresh isolated development cache, first-request SSR and absence of the reported hooks/PostCSS regressions                                  |
| `bun run build`       | Pass; Vite client assets and Cloudflare SSR Worker generated                                                                                                                   |
| `bun run test:e2e`    | 12 Playwright tests pass on the built application in local workerd preview                                                                                                     |
| `bun run check`       | Pass; runs all the preceding gates, build and browser checks                                                                                                                   |
| `git diff --check`    | Pass                                                                                                                                                                           |

Bun reports lines/functions here; branch coverage is not available through this runner and is not claimed. No production deployment, account credential configuration or DNS change was made. Local Worker execution/build establishes runtime compatibility, not proof of an already deployed site.

## Browser assertions

- Public route response bodies contain actual SSR content. `/projects` renders a stable shell; direct nested editor navigation recovers a missing document. No browser errors or hydration mismatches in the asserted SSR journey.
- Landing CTA → persistent project → direct text edit → save → reload → reopen.
- Agent proposal validation/preview/apply → undo/redo, using the same engine contract. A human edit invalidates an older preview until it is revalidated.
- Section/block CRUD, section and block reorder, styling after reload and keyboard history.
- Project rename/duplicate, deletion cancellation and confirmation, portable JSON export and validated import into a distinct project.
- Real IndexedDB v1 → v2 migration, offline editing after initial load, denied storage feedback and duplicate independence.
- Two tabs: stale write is refused, unsaved content remains exportable, newer content survives reload.
- Mobile editing starts with a fitted visible canvas; opening properties closes outline. Public pages have no horizontal overflow at 390 px.
- Standalone CLI HTML renders all 14 blocks independently, without scripts, using the expected 794 px/A4 CSS and accent.

The coalesced save drain additionally has a unit test holding a write open while multiple flush requests and another edit arrive. Writes remain serialized, revision numbers advance in order and the latest edit is saved.

## Visual and rendered evidence

Actually opened with image viewing tools and inspected for clipping, spacing, balance, contrast and action visibility:

- [Landing desktop](../artifacts/visual/landing-desktop.png) and [mobile](../artifacts/visual/landing-mobile.png).
- [Projects desktop](../artifacts/visual/projects-desktop.png) and [mobile](../artifacts/visual/projects-mobile.png).
- [Editor desktop](../artifacts/visual/editor-desktop.png) and [mobile](../artifacts/visual/editor-mobile.png).
- [Templates mobile](../artifacts/visual/templates-mobile.png).
- [Portable CLI resume](../artifacts/visual/portable-resume.png).
- [Agent proposal review](../artifacts/visual/agent-review-desktop.png), captured separately in the production preview after loading and validating the deterministic example; [its actual DOM](../artifacts/rendered/agent-review.html) is retained.

The first development-server inspection exposed optimizer reloads and an invalid font import. A later user report exposed a real cold-start Compiler/runtime failure not covered by the production-only suite. This was reproduced and fixed; a fresh-cache development check is now part of the combined gate. See [ADR 002](decisions/002-cold-development.md). Interaction QA found and fixed inspector restoration after closing the agent panel. Mobile visual review led to one-panel-at-a-time behavior, fitted zoom and a compact teammate button. Final evidence comes from production preview rather than a development overlay.

[Landing DOM](../artifacts/rendered/landing.html), [editor DOM](../artifacts/rendered/editor.html) and [computed canvas CSS](../artifacts/rendered/canvas-computed.json) were generated and inspected. The CLI actually created [sample.json](../artifacts/rendered/sample.json) and rendered [resume.html](../artifacts/rendered/resume.html), which is a real self-contained HTML/CSS file, not a substitute preview. The [command JSON Schema](../artifacts/rendered/commands.schema.json) is generated by the actual adapter schema.

Reproduce with `bun run build && bun run test:e2e`; the visual subset is `bun run visual:check`. `BASE_URL=http://127.0.0.1:PORT bun run test:e2e` targets an already-running server. Deterministic artifact filenames are overwritten by each run.

## Responsiveness

[Recorded interaction samples](../artifacts/performance/interactions.json) measure local production-preview project opening and 10 text-input round trips. The latest file is authoritative; values vary by load. These include Playwright transport/assertion overhead, are not frame timings, and do not establish field Core Web Vitals. A separate Jotai subscription test verifies that a one-field edit does not notify an unrelated block or its parent section.

## Release boundaries

All tasks 00–08 are implemented and locally verified, including feature-branch Git delivery and [PR #1](https://github.com/ExtraBinoss/ResumI/pull/1). See [master checklist](../tasks/check-list.md) for the current state. The GitHub Actions workflow repeats the combined check and uploads artifacts. Remote CI status is reported separately on the PR and must not be inferred from local success.

Browser automation is Chromium only. Broad assistive-technology testing, Firefox/WebKit, authenticated remote persistence, provider inference, freeform layout, automatic pagination, dedicated PDF export and a production deployment remain documented follow-ups.
