# Verification record

Synthetic resumes only. The legacy Vue checkout stayed read-only: its pre-existing PDF modification and untracked agent project are unchanged. No production deployment or credentials were configured.

## Current combined gate — tasks 19–21

[`bun run check`](../artifacts/check.log) completed with exit 0 on the integrated search, viewport, language, PDF, loading and brand revision.

| Gate                                        | Actual outcome                                                                    |
| ------------------------------------------- | --------------------------------------------------------------------------------- |
| Strict TypeScript / Hooks and Compiler lint | Pass                                                                              |
| Source policy                               | Every handwritten source is below 600 physical lines                              |
| Unit suite                                  | 122 tests pass                                                                    |
| Engine coverage                             | 76 tests; 99.70% lines / 99.52% functions; 85% minimum enforced                   |
| Cold development                            | First SSR request and five browser journeys pass with a fresh isolated Vite cache |
| Production build                            | Client assets and Cloudflare SSR Worker build successfully                        |
| Production browser suite                    | 68 Chromium journeys pass                                                         |
| Literal `bun run visual:check`              | Seven journeys pass; [log](../artifacts/visual-check.log)                         |

Cold-development logs contain no invalid-hook, `useMemoCache` or missing PostCSS `from` regression. Newly introduced i18next dependencies are prebundled in both client and SSR graphs. Bun reports line/function coverage, not branch coverage. GitHub Actions repeats the combined gate; remote results for the actual delivered commit are inspected on [PR #1](https://github.com/ExtraBinoss/ResumI/pull/1).

## Behavior and architecture review

- Public SSR, direct editor opening, reload and mobile hydration produce a real viewport-height workspace without page exceptions. Project creation happens on intent/click, never prefetch alone, and canonicalizes the URL without remounting the editor.
- IndexedDB migration, local CRUD/import/export, independent copies, denied storage, offline editing and stale-tab protection remain covered. The stale-tab journey waits for the canonical document URL before opening its second tab, ensuring it tests the same document. A conflicting tab preserves its in-memory edits and can export them.
- The persistent Dashboard/Templates shell uses opacity-only page transitions, keeping text on its final pixel grid. Centered previews, floating neutral glass captions, aligned actions and a full-width desktop Settings row retain the task 18 design.
- One search index handles projects, templates, fonts and vectors. Type-anywhere focus respects existing inputs, IME, modifiers and unrelated overlays. Contextual hints update without rerendering the catalog per character; hidden/reduced-motion behavior is covered. Virtual catalogs cap rendered rows/items, and visible font samples load through a bounded queue rather than waiting for hover.
- Visual, Text and legacy structured workspaces share anchored zoom, including the final bounds commit. Tests observe the animation and later paints; Space pan is measured after the zoom actually reaches its rendered target. Toolbar −/percentage/+ alignment is checked geometrically.
- Native canvas double-click/keyboard selection retains independent word/range styling through inspector typography and color controls. Changing selection ends the previous editor. Interaction frames, resize handles and measurements sit outside layer/group opacity and blend compositing.
- CV languages, section-title variants and rich-text marks use validated engine commands, history, persistence and JSON round trips. A translated Visual edit followed by blur takes exactly one Undo. Stable projected block/section identities avoid notifying unrelated subscribers. EN/FR interface dictionaries are independent, synchronous and isolated per SSR tree.
- Primary PDF prepares the active validated representation in an opaque sandbox, sanitizes its snapshot again and prints an inert separate page. Five journeys cover real PDFs, source isolation, original assets, image optimization, custom page dimensions and popup denial/cancellation. The native browser dialog remains the actual Save as PDF destination.
- Thinking Orbs retain upstream geometry and the MIT license without installing the package. Sixteen upstream golden cases cover breathing/working, both sizes and four timestamps. Two browser journeys hold a real loading boundary and verify pixels, motion, theme, hidden/offscreen pausing, cleanup and static reduced motion. No artificial loading delay is added.
- The supplied ResumI icon is used by one Brand component and global browser-icon declarations. The tray original is preserved but unused. The footer links to Plinka and its large Resumi wordmark returns to the top with keyboard focus and reduced-motion support.

Earlier critical journeys remain in the combined suite: permanent panels, eight resize handles, scrub fields and snapping, flat grouping/order/locks/visibility, live layer/outline reordering and one-step undo, image crop/border/shadow, gradients/effects, portable exports, embedded fonts, fifty original-color brands, SVG rejection, command review and stale proposals, agent project renaming, source compilation errors and generic copyable error feedback. Actual selected text contrast remains conservative for variable backgrounds. The save-drain and stable-selector tests still pass.

All document mutations go through runtime validation in the framework-free engine. UI effects are external lifecycle synchronization with cleanup; no document mirror or per-frame React zoom state was introduced. Feature ownership remains dashboard/editor/canvas with colocated styles. React Compiler and StrictMode remain enabled.

## Visual inspection and export artifacts

The final production screenshots were opened and compared with their actual DOM/CSS, rather than accepted on file existence:

- Library cards at the user’s reference size (1920×959): [light templates](../artifacts/visual/library-glass-templates-light.png), [dark templates](../artifacts/visual/library-glass-templates-dark.png), [light projects](../artifacts/visual/library-glass-projects-light.png) and [dark projects](../artifacts/visual/library-glass-projects-dark.png). [Current DOM/CSS](../artifacts/visual/library-latest-dom.json) confirms no gradients, neutral 3px shadows, 12px caption blur, a 191×36px desktop Settings row and zero overflow/page errors.
- Refreshed [landing desktop](../artifacts/visual/landing-desktop.png), [mobile](../artifacts/visual/landing-mobile.png), [projects](../artifacts/visual/projects-desktop.png), [mobile projects](../artifacts/visual/projects-mobile.png) and [mobile templates](../artifacts/visual/templates-mobile.png).
- Final supplied brand/footer in [light](../artifacts/visual/brand-footer-light.png), [dark](../artifacts/visual/brand-footer-dark.png), [mobile light](../artifacts/visual/brand-footer-light-mobile.png) and [mobile dark](../artifacts/visual/brand-footer-dark-mobile.png). [DOM observations](../artifacts/visual/brand-footer-dom.json) record loaded artwork/fonts, icon links, no horizontal overflow, correct Plinka link, return-to-top and no page exceptions. [Served assets](../artifacts/rendered/brand-assets.json) all return HTTP 200 with the expected image types.
- Font picker [light](../artifacts/visual/search-fonts-light.png) and [dark](../artifacts/visual/search-fonts-dark.png), brands [light](../artifacts/visual/search-brands-light.png) and [dark](../artifacts/visual/search-brands-dark.png), and imported SVG search [light](../artifacts/visual/search-imported-filled-light.png) and [dark](../artifacts/visual/search-imported-filled-dark.png). [Measured DOM](../artifacts/visual/search-controls-dom.json) accompanies these captures. Inspection caught one real contrast issue: original-black imported SVG hint previews now retain their colors on a tiny white artboard.
- [Native mixed canvas text](../artifacts/visual/native-mixed-visual.png), [group blend selection](../artifacts/visual/group-blend-selection.png), [Text zoom](../artifacts/visual/text-zoom-workspace.png), [CV languages](../artifacts/visual/cv-languages-text.png) and [section languages](../artifacts/visual/cv-section-languages.png).
- Actual loading frames [light](../artifacts/visual/loading-orb-light.png), [dark](../artifacts/visual/loading-orb-dark.png) and [reduced motion](../artifacts/visual/loading-orb-reduced.png).
- Actual generated PDFs [visual](../output/pdf/resumi-visual.pdf) and [React Profile](../output/pdf/resumi-profile.pdf), opened through their Poppler [visual page](../artifacts/visual/pdf-visual.png) and [Profile page](../artifacts/visual/pdf-profile.png). Both are one-page A4 with readable extracted text and no JavaScript. The Profile font produces a Type3 glyph bounding-box warning in Poppler; the inspected page has no missing or clipped text. [Print-copy image measurements](../artifacts/rendered/pdf-image-optimization.json) preserve the original asset. [French CLI-rendered HTML](../artifacts/rendered/localized-agent-fr.html) exercises the same engine locale commands.

The actual Vue components were previously run in an isolated temporary copy with synthetic data; [desktop](../artifacts/visual/vue-reference-desktop.png) and [properties](../artifacts/visual/vue-reference-properties.png) remain reference artifacts. Earlier tasks 14–18 captures are historical except for overlapping library/control paths refreshed above. The current images supersede older gradients, artwork and loading treatments. No personal V1 CV was opened or saved.

## Measured performance

The shared search benchmark records three cold index builds, first queries, five warm rounds and 300 timed queries per catalog, including broad one/two-character queries and misses. It does not cache query results. [Method and report](search.md): fonts p95 0.421ms, vectors 0.177ms, and 50,000 synthetic file names 3.654ms. The large index takes 162.18ms to build and is retained between queries. These are local CPU measurements, excluding DOM, I/O and network.

The opening profiler uses a trusted mouse click and one Node monotonic clock across navigations. Its endpoint requires nonempty visible opaque content, loaded fonts and two stable rendering intervals. Three fresh contexts follow one explicit unmeasured creation per server, with no concurrent automated browser runners and no CPU/network throttling. The first sample retains a Chrome trace and canvas screenshot.

| Runtime                                                                      | Click → painted canvas median | Three samples      | Navigation        |
| ---------------------------------------------------------------------------- | ----------------------------: | ------------------ | ----------------- |
| [Built Worker](../artifacts/performance/create-release-production.json)      |                         329ms | 316 / 353 / 329ms  | Client navigation |
| [Vite development](../artifacts/performance/create-release-development.json) |                         800ms | 745 / 800 / 1216ms | Client navigation |

These local samples are not field Core Web Vitals or a controlled cross-version comparison. Task 18's [276ms built](../artifacts/performance/create-ui-production.json) and [470ms development](../artifacts/performance/create-ui-development.json) medians remain historical. Earlier [611ms](../artifacts/performance/create-before.json) / [366ms](../artifacts/performance/create-final.json) measurements used an in-page click and a different endpoint and must not be compared directly. The [latest browser interaction sample](../artifacts/performance/interactions.json) records 381ms project reopening and 102ms p95 for ten input round trips, including Playwright transport/assertion overhead; this is not INP.

The final [wheel gesture sample](../artifacts/performance/canvas-zoom.json) records 48 frames, 2 distinct layout widths (initial/final bounds), one stable 38px font size, zero reverse movement and 0.0040px maximum anchor error. Intermediate animation uses a transient transform; the final bounds commit is included. [Toolbar observations](../artifacts/performance/canvas-coherence.json) record 29 visual frames with 0.0070px maximum anchor error, 30 text frames with 0.0035px maximum anchor error. These bounded Chromium gestures do not establish identical behavior across every GPU/browser.

## Reproduction and boundaries

Run `bun run check`, then `bun run visual:check`. `BASE_URL` targets an existing server. `RESUMI_PROFILE_LABEL=latest bun run profile:create` writes versioned conditions, timings, resources, screenshot and trace; `RESUMI_PROFILE_SERVER_STATE` describes the actual server condition without hidden warmup. `bun run benchmark:search` regenerates the catalog benchmark. [PDF behavior](pdf-export.md), [languages and extension](localization.md), [architecture](architecture.md) and the [master checklist](../tasks/check-list.md) document the contract.

Tasks 19–21 complete this local revision. Storage is browser-local; undo history is session-local. Groups remain flat and freeform output uses one explicitly sized page. Source/canvas are preserved representations, without arbitrary two-way conversion. Main interface controls have EN/FR resources; detailed inspector labels remain English, and adding a CV language does not automatically translate content. PDF uses the native print dialog, not a background PDF service. Chromium on Linux is the verified browser here; wider browser/device certification, automatic pagination, inference, MCP/WebMCP, auth/cloud sync and production deployment remain outside this delivery.
