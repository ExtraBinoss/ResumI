# 23 — Rich TSX gallery and measured navigation

## Scope

Make Projects/Templates navigation respond smoothly, using observed request, font and layout costs. Expand the four trusted TSX templates with six genuinely different professional compositions, including a Harvard-style academic resume, color, vetted brand marks, shapes and a portrait layout. Keep real editable source and portable offline output.

## Acceptance and evidence

- [x] Record a real navigation baseline; identify payload, FontFace lifecycle and layout work separately from animation duration. [Method and observations](../docs/library-navigation.md), [raw report](../artifacts/performance/library-navigation.json).
- [x] Optimize trusted preview transport/lifecycle through SSR loaders without reading browser storage or introducing a user-data cache. Actual production HTTP tests request/decode all ten WebP files plus the shared font and portrait; dialogs still use real HTML. One persistent scoped stylesheet survives sibling navigation.
- [x] Navigation animates only the segmented background and content opacity; labels never translate/scale. Respect reduced motion and prepare destinations on intent. The former Motion layout-projection measurement is removed from the tab indicator.
- [x] Ten distinct TSX templates, preserving existing IDs and legacy contracts. Harvard layout follows the [official Mignone reference](https://careerservices.fas.harvard.edu/resources/bullet-point-resume-template/) and inspected reference PDF; synthetic original copy only.
- [x] Actual full-color vetted brands and decorative shapes appear in relevant templates, with provenance retained. Cobalt, Atelier and Mosaic embed selected licensed tool marks from the shared asset bank.
- [x] Every new template renders as a complete A4 page and survives editable-source, standalone HTML and offline browser rendering without missing helpers, fonts or images. Source modules flatten into a complete standalone file. Six offline/print layouts and Profile persistence/export are exercised by actual Chromium journeys.
- [x] New gallery/exports and desktop/mobile light/dark screenshots opened and inspected, including clipping and overflow checks. Six new A4 captures are `artifacts/visual/template-{harvard,cobalt,atelier,timeline,consultant,mosaic}.png`; [production gallery](../artifacts/visual/library-centered-templates-light-1920.png) and [mobile dark](../artifacts/visual/library-centered-templates-dark-390.png) show the actual cards.
- [x] Updated tests and full project gates pass; measured results state the original/final catalog sizes and do not imply a controlled universal speedup.

The engine remains framework-free. The legacy checkout is read-only. No production deployment is included.

Final integrated verification: `bun run check` exits 0 (137 unit tests, 76 engine coverage tests at 99.70% lines / 99.52% functions, five cold-development journeys, production build and 80 Chromium journeys). Literal `bun run visual:check` passes twelve journeys. Actual production screenshots, DOM/CSS and portable outputs were opened and inspected; see [verification](../docs/verification.md).
