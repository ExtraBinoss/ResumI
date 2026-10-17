# Catalog search and previews

The immutable framework-free TypeScript utility in apps/web/src/lib/search-index.ts is shared by resumes, templates, shapes, icons, brands, imported SVGs and fonts. Its index identity is the immutable catalog/repository snapshot, so typing and virtual scrolling do not rebuild it.

The index normalizes case, diacritics and punctuation once, stores trigram postings, and starts each query from the rarest available posting. Every query token must match. Exact names rank first, followed by name prefixes, word prefixes, name substrings and keyword matches; catalog order breaks ties. Results have an explicit limit (100 by default). One/two-character queries scan normalized rows because there is no complete trigram; empty queries return directly without ranking. There is no query-result cache or fuzzy spelling correction. UI sort choices still govern the project library.

SearchInput is a shared input with at most six rotating hints and optional SVG previews. A timer updates its placeholder attribute without rendering the catalog for each character. It skips work while the tab is hidden, and reduced motion shows one static complete hint. Its type-anywhere listener ignores editable fields, composition, modifiers and unrelated dialogs/menus/popovers; navigation unmounts the listener. Palettes and fonts focus their search on opening and palette category changes. Enter chooses the first result in these pickers.

The font list renders at most eleven rows; the palette renders at most forty grid items around its viewport. Font rows subscribe to a visibility-driven preload queue with at most three background downloads. Leaving the viewport or unmounting removes queued work; newer visible rows have priority. An already-running shared download may finish and populate its cache, but never invokes a stale row callback. Samples reserve their height and show a neutral placeholder until the actual FontFace has loaded; hover separately previews the selected document content. Source discovery/import remains available while the family list is unified and categories filter by style.

Dashboard navigation keeps an opaque centered header mounted outside the library's fixed scroll viewport and animates incoming content opacity only. Navigation labels stay on their final pixel grid while their background pill moves. Resumes and Templates share one search-toolbar component; desktop/mobile EN/FR tests require identical input coordinates. Filtering does not resize the header or move the page scrollbar. Recent-menu typeahead and other overlays retain their own keyboard input.

The [initial DevTools observation](../artifacts/performance/library-search-before.json) did not conclusively reproduce the reported raster jitter: fonts, geometry and sidebar mutations remained stable, despite a changing document height. After replacing that shell, [light/dark screenshot comparisons](../artifacts/performance/library-search-stability.json) filter six synthetic projects to zero and restore them, then scroll the list. Header geometry is identical; only one or two soft-shadow pixels differ by one color-channel level in Chromium. This is a rendering regression check, not a controlled performance improvement claim.

## Reproducing the measurement

Run bun scripts/benchmark-search.ts. The report is written to [search-index.json](../artifacts/performance/search-index.json), with CPU/runtime, first-query timings and methodology. It measures three index builds, then thirty rounds of ten queries after five warm rounds, with a result limit of 100 and no query cache. Queries include short/broad matches, multiple tokens, diacritics and misses. These are in-process CPU measurements; browser input, rendering, font downloading and storage are separate costs.

Measured on 2026-10-17:

| Catalog                  | Entries | Median build | Median query | Query p95 |
| ------------------------ | ------: | -----------: | -----------: | --------: |
| Templates                |       4 |     0.022 ms |    0.0016 ms | 0.0045 ms |
| Google Fonts metadata    |   1,950 |      5.05 ms |     0.020 ms |  0.421 ms |
| Icons, shapes and brands |   1,970 |      3.63 ms |    0.0061 ms |  0.177 ms |
| Synthetic file names     |  50,000 |    162.18 ms |     1.023 ms |  3.654 ms |

The 50,000-file case exposes construction cost rather than hiding it in query timings. A catalog of that size should keep its index between queries; this app rebuilds only when its repository snapshot changes. These numbers are local measurements, not cross-device guarantees or browser INP.
