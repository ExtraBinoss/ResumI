# Verification record

Synthetic resumes only. The original Vue checkout stayed read-only: its pre-existing PDF modification and untracked agent project are unchanged. No production deployment or credentials were configured.

## Current combined gate

[`bun run check`](../artifacts/check.log) completed with exit 0 after the editor interaction refinement (task 18).

| Gate                                        | Actual outcome                                                                     |
| ------------------------------------------- | ---------------------------------------------------------------------------------- |
| Strict TypeScript / Hooks and Compiler lint | Pass                                                                               |
| Source policy                               | Every handwritten source is below 600 physical lines                               |
| Unit suite                                  | 102 tests pass                                                                     |
| Engine coverage                             | 68 tests; 99.65% lines / 99.47% functions; 85% minimum enforced                    |
| Cold development                            | First SSR request and five browser journeys pass with an isolated fresh Vite cache |
| Production build                            | Client assets and Cloudflare SSR Worker build successfully                         |
| Production browser suite                    | 49 Chromium journeys pass                                                          |
| Literal `bun run visual:check`              | Four journeys pass; [log](../artifacts/visual-check.log)                           |

Cold-development logs contain no invalid-hook, `useMemoCache` or missing PostCSS `from` regression. Bun reports line/function coverage, not branch coverage. GitHub Actions repeats the combined gate; its actual remote status is recorded on [PR #1](https://github.com/ExtraBinoss/ResumI/pull/1).

## Behaviors exercised

- Real public SSR, nested recovery, desktop/mobile direct opening and reload: one viewport-height editor, no remaining loading heading, no hydration errors.
- Creation on actual intent/click, no project created by prefetch alone, and one record per click. IndexedDB migration, CRUD/import/export, offline editing, denied storage and stale-tab protection remain covered.
- Persistent Dashboard/Templates navigation on desktop/mobile: the navigation DOM survives sibling-route changes, sorting text is centered, desktop Settings fills its sidebar row while mobile/editor keep a 32px icon, and no horizontal overflow appears.
- Centered CV thumbnails, larger eye preview, Escape dismissal, search/sorting/list view, project rename/duplicate/delete, and agent-driven project-title persistence.
- Selectable landing variants, functional Visual/Text demonstration and clean reduced-motion hydration. Four distinct complete A4 layouts load their fonts/images and fit 794×1123px without overflow. Profile preserves its photo/icons through saved TSX, reload and a portable export opened with all network requests blocked.
- Source preview fitting accounts for both viewport dimensions and its zoom toolbar. The actual transformed iframe stays inside desktop/mobile bounds; 100% restores the full-size page and Fit page returns to the fitted size.
- Direct server-rendered template cards contain one action link each; their static thumbnail content is inert. Contact links remain functional in the actual CV and standalone export.
- The final blend option is reachable by wheel, changes the real canvas blend mode and remains undoable.
- Permanent composition/properties, native styled canvas editing, eight resize handles, grouping/order/lock/visibility, image crop/border/shadow, gradient/effects and faithful portable HTML.
- Capitalized blend options preview on hover and restore on Escape. Undo then returns to the last committed blend: hovering creates no history entry.
- Ctrl-wheel reaches its animated target while preserving the point beneath the pointer and browser zoom; Space dragging moves the canvas accurately at desktop/mobile sizes.
- Numeric label scrubbing previews geometry/type changes and commits one undo step; rotation snaps near quarter turns. Native number editing and arrow keys remain available.
- Light/dark persistence and actual loaded Source Sans 3 / Space Grotesk FontFaces. Text and inspector editing follow the UI theme without changing the CV's colors.
- Imported WOFF2 actually loads on the canvas, persists after reload and is embedded byte-for-byte in standalone HTML.
- Reviewed human/agent commands share validation/history; an older proposal cannot apply after a human edit. HTML/React source drafts, sandboxing, saved activation, compiler failure recovery and portable offline output remain functional.
- New engine cases cover decoration validation/history/export, rotated resize anchors, alpha/group text contrast, marked ranges, worst grades and conservative `Unknown` results for variable backgrounds.

The stable-selector test still proves that one block edit does not notify unrelated blocks or their section. Save-drain tests exercise serialized writes while more edits arrive. All document edits still pass through the engine.

Task 18 additionally exercises mixed character styling in canvas and Text mode; ending the old editor on selection changes; live layer/outline reorder with insertion indicators, cancellation, no-op drops and one-step undo; Google font search/categories/hover and embedded download/reload; real clipboard copying of source, stale-save and import errors; project rename on Enter/blur with Escape cancellation; primary export, zoom buttons and active-mode toggling. Compound vectors retain original Figma/Microsoft colors, transforms and full credits through reload/JSON/HTML. Individual vector paints are editable and undoable. Active/external SVGs are rejected without execution or network traffic.

## Visual inspection

The actual Vue components ran in an isolated temporary copy using a synthetic CV. Its [desktop layout](../artifacts/visual/vue-reference-desktop.png) and [properties](../artifacts/visual/vue-reference-properties.png) were opened alongside the React result. No personal V1 documents were opened or saved.

Task 18 final screenshots were opened and checked against the user’s references in both themes:

- Gradient-free template cards at 1920×959: [light](../artifacts/visual/library-glass-templates-light.png) and [dark](../artifacts/visual/library-glass-templates-dark.png); project cards [light](../artifacts/visual/library-glass-projects-light.png) and [dark](../artifacts/visual/library-glass-projects-dark.png). Captions float 8px inside the card with restrained theme-colored glass, aligned actions and no dark gradient. Desktop Settings fills the navigation width.
- Mobile library [projects](../artifacts/visual/library-glass-projects-mobile-light.png) and [templates](../artifacts/visual/library-glass-templates-mobile-light.png), with equivalent dark captures retained alongside them.
- Actual editor controls [light](../artifacts/visual/editor-controls-light.png) and [dark](../artifacts/visual/editor-controls-dark.png); searchable font picker [light](../artifacts/visual/font-picker-light.png) and [dark](../artifacts/visual/font-picker-dark.png).
- Color picker [light](../artifacts/visual/color-picker-light.png) and [dark](../artifacts/visual/color-picker-dark.png), neutral [weight menu](../artifacts/visual/weight-menu-dark.png) and [layer menu](../artifacts/visual/layer-menu-dark.png) with room for full shortcuts and a red destructive action.
- [Layer drag](../artifacts/visual/editor-layer-drag-preview.png), [Outline drag](../artifacts/visual/editor-outline-drag-preview.png), [mixed text](../artifacts/visual/editor-mixed-text.png), [brand palette](../artifacts/visual/brand-palette-dark.png) and [recovery page](../artifacts/visual/chrome-404-light.png).

Actual [control DOM/CSS](../artifacts/visual/editor-controls-dom.json) and [follow-up measurements](../artifacts/visual/editor-touchups-dom.json) accompany the screenshots. Inspection caught cramped shortcuts and black brand marks on dark surfaces: the menu is now 244px wide without clipped items, and original-color marks sit on a small white artboard. The final card/Settings changes passed a fresh production build, three focused desktop/mobile appearance journeys ([log](../artifacts/final-polish.log)), refreshed type/lint/source checks, and the literal four-journey visual check.

Earlier inspected milestones remain available below. These images record tasks 14–17; the task 18 library/control images above supersede their card gradients and compact desktop Settings trigger:

- Editor [light](../artifacts/visual/editor-v1-light.png), [dark](../artifacts/visual/editor-v1-dark.png), [mobile light](../artifacts/visual/editor-v1-mobile-light.png) and [mobile dark](../artifacts/visual/editor-v1-mobile-dark.png).
- Themed Text workspace [desktop](../artifacts/visual/editor-text-dark.png) and [mobile](../artifacts/visual/editor-text-mobile-dark.png).
- Landing [light](../artifacts/visual/apple-landing-desktop.png), [dark](../artifacts/visual/apple-landing-dark.png), [mobile light](../artifacts/visual/apple-landing-mobile.png) and [mobile dark](../artifacts/visual/apple-landing-mobile-dark.png).
- Dashboard [light](../artifacts/visual/apple-projects-desktop.png), [dark](../artifacts/visual/apple-projects-dark.png), [mobile light](../artifacts/visual/apple-projects-mobile.png) and [mobile dark](../artifacts/visual/apple-projects-mobile-dark.png).
- Templates in the same shell: [desktop light](../artifacts/visual/apple-templates-desktop.png), [desktop dark](../artifacts/visual/apple-templates-dark.png), [mobile light](../artifacts/visual/apple-templates-mobile.png) and [mobile dark](../artifacts/visual/apple-templates-mobile-dark.png).
- Complete actual A4s: [Classic](../artifacts/visual/template-classic.png), [Editorial](../artifacts/visual/template-editorial.png), [Studio](../artifacts/visual/template-studio.png), [Profile](../artifacts/visual/template-profile.png) and [Profile offline export](../artifacts/visual/template-profile-offline.png). Its fictional portrait, exact imagegen prompt and licenses are preserved in [asset notes](../packages/cv/assets/README.md).
- [Source dialog](../artifacts/visual/source-dialog-light.png) and [restrained loading orb](../artifacts/visual/loading-orb-light.png).
- Fitted TSX workspace in [light](../artifacts/visual/source-fit-light.png), [dark](../artifacts/visual/source-fit-dark.png) and [mobile dark](../artifacts/visual/source-fit-mobile-dark.png), with themed zoom controls and scrollbars.
- [Compact appearance menu](../artifacts/visual/dashboard-settings-light.png), with the same material/control treatment as the editor.
- Blend hover previews and menu treatment in [light](../artifacts/visual/blend-menu-light.png) and [dark](../artifacts/visual/blend-menu-dark.png).

The standard screenshot/DOM artifacts are also refreshed by the production suite. Earlier portable React/visual exports and exact font verification remain in `artifacts/rendered` and `artifacts/visual`.

Inspection caught actual defects: retaining an exiting data route accessed discarded loader data; document-colored text was illegible on dark editing surfaces; scrollbars were inset by content padding. These were corrected and rechecked. Incoming page transitions retain no obsolete data route; local Visual/Text transitions keep their panels mounted. Task 17 review additionally caught A4 overflow, reduced-motion SSR mismatch, mobile word spacing and nested contact/card anchors in server HTML. The corrected card structure passes the original strict selector and hydration checks; no warning or assertion was suppressed. CLI create, validate and HTML render also succeed for `react-profile`.

## Opening performance

The revised profiler uses a trusted Playwright mouse click and one Node monotonic clock across native or client navigation. Its endpoint requires a nonempty, visible, opaque canvas, loaded fonts and two stable rendering intervals. The first sample retains a Chrome trace and screenshot. Each sample starts with fresh browser storage; conditions and resource timings are included in its JSON.

With the server already warmed and no concurrent browser runners, three fresh contexts produced:

| Runtime                                                                 | Click → fully painted canvas | Samples           | Navigation        |
| ----------------------------------------------------------------------- | ---------------------------- | ----------------- | ----------------- |
| [Built Worker](../artifacts/performance/create-ui-production.json)      | 276ms median                 | 268 / 276 / 285ms | Client navigation |
| [Vite development](../artifacts/performance/create-ui-development.json) | 470ms median                 | 461 / 470 / 494ms | Client navigation |

These samples were collected after task 18’s final card/Settings follow-up, with one explicit unmeasured creation warming each server and no concurrent browser runners. All six used client navigation and reported no page errors. The profiler keeps the same clock if the old execution context disappears. These are local samples without CPU/network throttling, not field Core Web Vitals or a controlled comparison with earlier runs. The earlier [611ms](../artifacts/performance/create-before.json) / [366ms](../artifacts/performance/create-final.json) results used an in-page click and different endpoint. They remain historical evidence and must not be directly compared with the revised measurement.

Creation keeps code prefetch free of storage side effects, canonicalizes the created route without remounting the editor, and defers color-picker editing, command review, source compilation/runtime and large catalogs. The first Vite compilation is distinct from a warmed click-to-canvas measurement. The [production interaction sample](../artifacts/performance/interactions.json) records 453ms project opening and 106ms p95 for ten input round trips, including Playwright transport/assertion overhead; this is not INP.

The final [zoom gesture sample](../artifacts/performance/canvas-zoom.json) observed 16 frames, one layout width and one 38px font size, zero reverse movement and less than 0.01px anchor error. Intermediate zoom uses a compositor transform; final committed bounds are asserted separately around the pointer. This bounded synthetic gesture does not establish identical rendering across every browser/GPU.

## Reproduction and boundaries

Run `bun run check`, then `bun run visual:check`. Use `BASE_URL` to target an existing server. `RESUMI_PROFILE_LABEL=latest bun run profile:create` writes versioned measurement conditions, resources, screenshot and trace; `RESUMI_PROFILE_SERVER_STATE` labels the actual server condition without performing hidden warmup.

Tasks 14–18 supersede the earlier interface/layout organization. The product still uses one freeform page and flat groups. Source and canvas are preserved representations, not arbitrary two-way conversion. Browser coverage here is Chromium on Linux; UI localization, wider browser/device certification, automatic pagination, provider inference, MCP/WebMCP, cloud sync and production deployment remain outside this delivery.
