# 19 — Search, multilingual documents and coherent viewports

## Scope

Follow the user's detailed review: stable library transitions, type-anywhere search, animated contextual hints, one measured search index, virtual catalogs and visible font previews; coherent Visual/Text zoom, content-only blends and actual native mixed styling; independent CV languages editable by people and validated agent commands; PDF-first export with print-copy image optimization.

## Implementation and evidence

- [x] Generic indexed search, contextual hints and focus guards across projects/templates/palettes/fonts; realistic benchmark conditions and results.
- [x] Persistent library shell without transform-induced text scaling; shared animated segments, horizontal font categories and capped virtual font picker.
- [x] Anchored zoom with no final teleport, same Text/Visual controls and symmetric percentage field; icon scrub labels and matching color swatch corners.
- [x] Native canvas word/range styling survives inspector interactions; blends exclude selection chrome.
- [x] Validated CV locale/translation commands, stable projections, history, persistence and active-language output; Text language management and independent EN/FR interface resources.
- [x] Primary PDF preparation, safe opaque source rendering, inert printable snapshots, original assets untouched and actual PDF visual/text/image verification.
- [x] Full integrated check, cold dependency/hydration check, literal visual check and opened synthetic desktop/mobile light/dark screenshots. The gate passes 122 unit tests, 76 engine tests (99.70% lines / 99.52% functions), five cold-dev and 68 production browser journeys. The literal visual check passes seven journeys. [Final evidence](../docs/verification.md).

## Boundaries

Search CPU measurements, including short queries and misses, are recorded in [search](../docs/search.md): font queries p95 0.421ms, vector queries 0.177ms, and 50,000 synthetic file names 3.654ms. Font/icon lists are virtualized; visible font loading is bounded to three requests. These figures exclude DOM, storage and network costs.

`canvas-coherence.spec.ts` exercises actual native word/range selection, Visual/Text/structured zoom including its final committed geometry, and selection frames outside group blending. `languages.spec.ts` additionally proves that a translated canvas edit followed by blur needs only one Undo. Locale commands and stable selectors are covered in engine and Jotai tests; section-title languages have a separate browser journey. [Localization](../docs/localization.md) documents human/agent commands and the independent interface resources.

The five PDF journeys produce actual synthetic PDFs, cover custom page dimensions, popup denial/cancellation, preserved original assets and active source isolation. [PDF export](../docs/pdf-export.md) records image and Poppler evidence.

PDF uses the browser's Save as PDF dialog. Groups remain flat, the page remains freeform, and arbitrary source code is not automatically translated or converted to layers. Detailed inspector labels remain English. Production deployment and credentials remain outside this delivery. The legacy checkout stays read-only.
