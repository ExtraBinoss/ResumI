# 22 — Centered library and stable search

## Scope

Replace the two-item library sidebar with a centered shared header: supplied ResumI brand, Resumes/Templates navigation and a compact recent-document menu. On mobile put tabs, Recents and the cog-only Settings control in one full-width frosted bottom bar; keep only the logo at the top. Diagnose the reported text jitter while typing in dashboard search and verify the actual rendering. Align search on both pages, narrow sorting and translate the library's visible controls through the existing react-i18next resources, including dictionary updates in an already-open development session.

## Acceptance and evidence

- [x] Measure typing before changing the shell and distinguish observed behavior from an unconfirmed cause. [DevTools observation](../artifacts/performance/library-search-before.json): 976 one-project frames and 106 six-to-zero frames, stable geometry/fonts, zero sidebar mutations/layout shifts. The reported raster jitter was not conclusively reproduced; the 157ms interaction is one development observation, not field INP or a before/after speedup.
- [x] Shared centered desktop/mobile navigation, no sidebar, accessible current-route indication and persistent header across sibling routes. Dashboard tests preserve the actual navigation DOM through sibling routes and measure its center.
- [x] Useful recent-document menu with titles, modification dates, keyboard navigation and working editor links. Desktop/mobile tests exercise typeahead, Escape focus return, ArrowDown and Enter without stealing search input. Its label now belongs to a real Base UI Menu.Group; the reported missing-context crash is covered by page-error assertions.
- [x] One shared toolbar keeps search at identical coordinates on both pages at 1440px and 390px in EN/FR. Both translated sorting trigger and popup are 104px, with an 8px label/chevron gap and at least 4px between option text and its check. Project actions, dialogs, template controls and empty states use resource keys. Atomic dictionary replacement repairs missing keys during HMR without replacing the search DOM or losing its draft/language: [actual HMR observation](../artifacts/performance/interface-language-hmr.json).
- [x] One cog-only Settings control at bottom right, both themes, no overlap or horizontal overflow. [Production DOM/CSS](../artifacts/visual/library-centered-dom.json) records a 36px desktop control and one 67px-high full-width mobile material with 44px controls, theme-colored background and 24px blur. Search coordinates match both routes; 320px tabs fit and the last card clears the complete bar.
- [x] Search leaves surrounding header text/geometry stable. [Raster regression](../artifacts/performance/library-search-stability.json) filters six synthetic projects to zero and back in both themes, then scrolls the list. Header boxes are identical; Chromium differs only by one or two soft-shadow pixels at one channel level. The test allows at most four such pixels, rather than ignoring text displacement.
- [x] Full check and literal visual check pass; actual light/dark desktop/mobile captures and DOM/CSS inspected.

No document/engine contract changes are required. Keep the legacy checkout read-only and the user's development server running.

Final integrated verification: `bun run check` exits 0 (137 unit tests, 76 engine coverage tests at 99.70% lines / 99.52% functions, five cold-development journeys, production build and 80 Chromium journeys). Literal `bun run visual:check` passes twelve journeys. Actual production screenshots, DOM/CSS and portable outputs were opened and inspected; see [verification](../docs/verification.md).
