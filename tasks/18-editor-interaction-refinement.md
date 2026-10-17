# 18 — Refine editor controls and interactions

Historical task 18 verification snapshot. Tasks 19–21 and the [current verification record](../docs/verification.md) supersede these gate counts and refresh overlapping screenshots/gesture artifacts; the versioned `create-ui-*` profiles remain task 18 measurements.

## Scope

Apply the user's detailed screenshot review while retaining the Mac-inspired materials, Base UI primitives, Motion, one canonical Jotai session and validated engine commands. Reclicking the active Visual/Text button toggles to the other mode, as explicitly clarified by the user.

## Implementation and targeted evidence

- [x] Compact project menu with rename on Enter/blur and Escape cancellation; primary Export, separated history, zoom −/+, silent successful save and a copyable error indicator. `chrome.spec.ts` and `error-feedback.spec.ts` exercise these behaviors.
- [x] Wider permanent panels and animated Layers/Outline; live reorder previews with insertion outlines, cancel and one undoable drop. `canvas-interactions.spec.ts` covers layers and outline order; engine tests cover group relocation invariants. A drop in the existing position creates no history entry.
- [x] Three-part numeric fields, label scrubbing, Shift acceleration and rotation snapping, with reversible previews. No stepper buttons. `property-controls.spec.ts` checks preview, commit and undo.
- [x] Searchable, virtualized font catalog, categories, hover previews, font-file import and explicit local-font discovery. Selected Google regular Latin fonts embed and survive reload/export; see [font boundaries](../apps/web/src/features/editor/panels/fonts.md).
- [x] Immediate color-picker intent loading, persistent exit content, larger swatch and one HEX border; neutral select/menu hovers and red destructive actions.
- [x] Mixed text ranges in canvas and Text mode; switching selection ends the previous editor; size labels are above layer content. Browser journeys verify range styling and preserved surrounding characters.
- [x] Shape/icon search padding, tooltips, shared scroll shadows, SVG import and 50 original-color brand marks. [Sources and licenses](../packages/assets/data/brands.sources.md) are retained in documents and portable exports. Browser tests reject active/external SVG without executing or fetching it.
- [x] Removed dashboard/template gradients entirely; small floating themed captions with aligned actions and faint neutral shadows. Desktop Settings fills its sidebar row; editor/mobile use a 32px icon. Compact appearance settings and recovery screens cover missing routes/documents/storage failures.
- [x] Transient compositor zoom avoids resizing text on every frame. The final gesture sample records 16 frames, one observed layout width, stable 38px text and zero reversal, with maximum observed anchor error below 0.01px in [measurement](../artifacts/performance/canvas-zoom.json). The final committed bounds are separately asserted around the pointer.

## Final integrated verification

The integrated local gate passes: 102 unit tests, 68 engine tests (99.65% lines / 99.47% functions), five cold-development and 49 production browser journeys, with types, lint, source policy and production build. The literal visual check passes four journeys. Screenshot/DOM review additionally caught and fixed cramped layer-menu shortcuts and low-contrast black logos in the dark palette. The final no-gradient cards and full-width Settings passed a fresh production build, three focused browser journeys and refreshed types/lint/source checks. Actual light/dark desktop/mobile renders were opened. Final warmed click-to-painted-canvas medians are 276ms built Worker and 470ms Vite (three fresh contexts each, no throttling). [Verification](../docs/verification.md) records final evidence and profiling conditions.

## Boundaries

Groups remain flat. Outline reorders sections or blocks within their existing section; visual layer grouping and z-order are independent of semantic section order. SVG import supports safe basic vector geometry and solid paints, not arbitrary SVG features. Font selection embeds the regular Latin Google face, not every script/weight. The legacy repository stays read-only and production deployment remains outside this task.
