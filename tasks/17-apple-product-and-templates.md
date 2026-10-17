# 17 — Redesign the product presentation and resume collection

## Goal and scope

The user rejected the previous landing/dashboard direction as too generic. Redesign the landing, document library, template chooser and actual TSX resumes as one thoughtful Apple-inspired product. Preserve the existing engine, editable source contract, Base UI, Motion, requested fonts and Blue-600.

## Workstreams

- [x] Landing: strong editorial hierarchy, real CV showcase, meaningful concise copy and working variant actions.
- [x] Dashboard: compact collection toolbar, considered gallery scale, material sidebar, consistent card actions and the same template layout.
- [x] Templates: four distinct professional React resumes, including classic, editorial, designer and portrait layouts; inline icons and offline portrait embedding.
- [x] Generate and inspect a fictional professional portrait with imagegen; save an optimized project asset and prompt/provenance.
- [x] Harmonize light/dark surfaces and control details across the finished views.
- [x] Inspect actual desktop/mobile renders and representative exported templates before running final gates.
- [x] Complete combined/visual verification, record evidence and prepare the final PR.

## Compatibility and decisions

The legacy `studio`/`editorial` visual template IDs remain valid for existing CLI/API clients. The public chooser prioritizes the redesigned React collection. The landing's primary creation route remains a fast visual starter; named template actions open the corresponding real editable React source. All document mutations retain engine validation and history.

Asset: [fictional portrait](../packages/cv/assets/alex-morgan-portrait.jpg), with the exact imagegen prompt in [asset notes](../packages/cv/assets/README.md). No personal user data is used.

## Status

Implementation is frozen. Three explicitly reauthorized agents completed landing, dashboard and CV templates; root integrated assets and inspected the actual light/dark desktop/mobile views and all four A4 layouts. Inspection caught and corrected the Editorial page overflow, reduced-motion hydration mismatch, mobile title spacing, sidebar logo spacing and inaccessible bottom blend-menu options. The full suite also exposed nested contact/card links in server HTML: the preview is now a sibling of the card action, with inert thumbnail content. Both affected journeys pass after the correction. The final combined gate passes: 96 unit tests, 66 engine tests (99.64% lines / 99.47% functions), five cold-development and 32 production browser journeys. The literal visual check passes three journeys. Full A4 screenshots and the offline export were opened and inspected. CLI creation/validation/render succeed for Profile. Warmed click-to-painted-canvas medians are 296ms for the built Worker and 513ms for Vite, with conditions and traces in [verification](../docs/verification.md). The PR description and evidence are prepared; remote delivery status is tracked on [PR #1](https://github.com/ExtraBinoss/ResumI/pull/1).
