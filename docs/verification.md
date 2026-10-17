# Verification record

Synthetic resumes only. The original Vue checkout stayed read-only: its pre-existing PDF modification and untracked agent project are unchanged. No production deployment or credentials were configured.

## Current combined gate

[`bun run check`](../artifacts/check.log) completed with exit 0 after the macOS control/material revision and feature reorganization.

| Gate                                        | Actual outcome                                                                     |
| ------------------------------------------- | ---------------------------------------------------------------------------------- |
| Strict TypeScript / Hooks and Compiler lint | Pass                                                                               |
| Source policy                               | Every handwritten source is below 600 physical lines                               |
| Unit suite                                  | 93 tests pass                                                                      |
| Engine coverage                             | 66 tests; 99.64% lines / 99.47% functions; 85% minimum enforced                    |
| Cold development                            | First SSR request and five browser journeys pass with an isolated fresh Vite cache |
| Production build                            | Client assets and Cloudflare SSR Worker build successfully                         |
| Production browser suite                    | 28 Chromium journeys pass                                                          |
| Literal `bun run visual:check`              | Three journeys pass; [log](../artifacts/visual-check.log)                                                              |

Cold-development logs contain no invalid-hook, `useMemoCache` or missing PostCSS `from` regression. Bun reports line/function coverage, not branch coverage. GitHub Actions repeats the combined gate; its actual remote status is recorded on [PR #1](https://github.com/ExtraBinoss/ResumI/pull/1).

The earlier radius follow-up passed a fresh production build and six relevant browser journeys ([log](../artifacts/polish-check.log)). The combined gate above was subsequently repeated successfully after task 16 harmonized material/control tokens, toolbar grouping, segmented selection, menus, sliders and numeric steppers with macOS conventions.

## Behaviors exercised

- Real public SSR, nested recovery, desktop/mobile direct opening and reload: one viewport-height editor, no remaining loading heading, no hydration errors.
- Creation on actual intent/click, no project created by prefetch alone, and one record per click. IndexedDB migration, CRUD/import/export, offline editing, denied storage and stale-tab protection remain covered.
- Persistent Dashboard/Templates navigation on desktop/mobile: the navigation DOM survives sibling-route changes, sorting text is centered, Settings is a compact accessible icon, and no horizontal overflow appears.
- Centered CV thumbnails, larger eye preview, Escape dismissal, search/sorting/list view, project rename/duplicate/delete, and agent-driven project-title persistence.
- Permanent composition/properties, native styled canvas editing, eight resize handles, grouping/order/lock/visibility, image crop/border/shadow, gradient/effects and faithful portable HTML.
- Capitalized blend options preview on hover and restore on Escape. Undo then returns to the last committed blend: hovering creates no history entry.
- Ctrl-wheel reaches its animated target while preserving the point beneath the pointer and browser zoom; Space dragging moves the canvas accurately at desktop/mobile sizes.
- The font-size stepper changes the actual canvas typography through the engine, and Undo restores the previous value. Native number editing and arrow keys remain available.
- Light/dark persistence and actual loaded Source Sans 3 / Space Grotesk FontFaces. Text and inspector editing follow the UI theme without changing the CV's colors.
- Imported WOFF2 actually loads on the canvas, persists after reload and is embedded byte-for-byte in standalone HTML.
- Reviewed human/agent commands share validation/history; an older proposal cannot apply after a human edit. HTML/React source drafts, sandboxing, saved activation, compiler failure recovery and portable offline output remain functional.
- New engine cases cover decoration validation/history/export, rotated resize anchors, alpha/group text contrast, marked ranges, worst grades and conservative `Unknown` results for variable backgrounds.

The stable-selector test still proves that one block edit does not notify unrelated blocks or their section. Save-drain tests exercise serialized writes while more edits arrive. All document edits still pass through the engine.

## Visual inspection

The actual Vue components ran in an isolated temporary copy using a synthetic CV. Its [desktop layout](../artifacts/visual/vue-reference-desktop.png) and [properties](../artifacts/visual/vue-reference-properties.png) were opened alongside the React result. No personal V1 documents were opened or saved.

Final screenshots were opened and checked for readable controls, matching theme surfaces, clipping, panel/dock placement, centering and action alignment:

- Editor [light](../artifacts/visual/editor-v1-light.png), [dark](../artifacts/visual/editor-v1-dark.png), [mobile light](../artifacts/visual/editor-v1-mobile-light.png) and [mobile dark](../artifacts/visual/editor-v1-mobile-dark.png).
- Themed Text workspace [desktop](../artifacts/visual/editor-text-dark.png) and [mobile](../artifacts/visual/editor-text-mobile-dark.png).
- Dashboard [light](../artifacts/visual/projects-v1-light.png), [dark](../artifacts/visual/projects-v1-dark.png), [mobile light](../artifacts/visual/projects-v1-mobile-light.png) and [mobile dark](../artifacts/visual/projects-v1-mobile-dark.png).
- Templates in the same shell: [desktop](../artifacts/visual/templates-v1-light.png) and [mobile](../artifacts/visual/templates-v1-mobile-light.png).
- [Source dialog](../artifacts/visual/source-dialog-light.png) and [restrained loading orb](../artifacts/visual/loading-orb-light.png).
- [Compact appearance menu](../artifacts/visual/dashboard-settings-light.png), with the same material/control treatment as the editor.
- Blend hover previews and menu treatment in [light](../artifacts/visual/blend-menu-light.png) and [dark](../artifacts/visual/blend-menu-dark.png).

The standard screenshot/DOM artifacts are also refreshed by the production suite. Earlier portable React/visual exports and exact font verification remain in `artifacts/rendered` and `artifacts/visual`.

Inspection caught actual defects: retaining an exiting data route accessed discarded loader data; document-colored text was illegible on dark editing surfaces; scrollbars were inset by content padding. These were corrected and rechecked. Incoming page transitions retain no obsolete data route; local Visual/Text transitions keep their panels mounted.

## Opening performance

The revised profiler uses a trusted Playwright mouse click and one Node monotonic clock across native or client navigation. Its endpoint requires a nonempty, visible, opaque canvas, loaded fonts and two stable rendering intervals. The first sample retains a Chrome trace and screenshot. Each sample starts with fresh browser storage; conditions and resource timings are included in its JSON.

With the server already warmed and no concurrent browser runners, three fresh contexts produced:

| Runtime | Click → fully painted canvas | Samples | Navigation |
| --- | --- | --- | --- |
| [Built Worker](../artifacts/performance/create-ui-production.json) | 326ms median | 292 / 326 / 346ms | Client navigation |
| [Vite development](../artifacts/performance/create-ui-development.json) | 572ms median | 557 / 572 / 705ms | Client navigation |

These final samples were collected after the macOS polish, with both servers warmed and no concurrent browser runners. All six used client navigation; the profiler also follows native navigation if an early click occurs before hydration, rather than failing when the old execution context disappears. These are local samples without CPU/network throttling, not field Core Web Vitals or a controlled comparison with earlier runs. The earlier [611ms](../artifacts/performance/create-before.json) / [366ms](../artifacts/performance/create-final.json) results used an in-page click and different endpoint. They remain historical evidence and must not be directly compared with the revised measurement.

Creation keeps code prefetch free of storage side effects, canonicalizes the created route without remounting the editor, and defers color-picker editing, command review, source compilation/runtime and large catalogs. The first Vite compilation is distinct from a warmed click-to-canvas measurement. The [production interaction sample](../artifacts/performance/interactions.json) includes Playwright transport/assertion overhead.

## Reproduction and boundaries

Run `bun run check`, then `bun run visual:check`. Use `BASE_URL` to target an existing server. `RESUMI_PROFILE_LABEL=latest bun run profile:create` writes versioned measurement conditions, resources, screenshot and trace; `RESUMI_PROFILE_SERVER_STATE` labels the actual server condition without performing hidden warmup.

Tasks 14–16 supersede the earlier interface/layout organization. The product still uses one freeform page and flat groups. Source and canvas are preserved representations, not arbitrary two-way conversion. Browser coverage here is Chromium on Linux; UI localization, wider browser/device certification, automatic pagination, provider inference, MCP/WebMCP, cloud sync and production deployment remain outside this delivery.
