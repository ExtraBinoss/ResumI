# 16 — Harmonize the application with macOS conventions

## Goal and scope

Use Apple's desktop design conventions for a coherent document application: restrained materials, clear groups, consistent controls and readable inspectors. Preserve the requested Base UI stack, Blue-600, Source Sans 3 / Space Grotesk, medium radii, permanent panels and shared dashboard layout.

## Implementation

- [x] Share light/dark material, control, segmented-selection and elevation tokens.
- [x] Center the document title; group navigation/history and document actions consistently.
- [x] Refine sidebar selection, panel headings, menus, sliders and segmented controls.
- [x] Add themed numeric steppers using native min/max/step editing and shadcn buttons; engine commands remain the mutation boundary.
- [x] Verify actual light/dark desktop/mobile rendering and numeric-step history behavior.
- [x] Pass the combined gate and literal visual check; update delivery evidence.
- [ ] Push the revision and update PR.

## References and boundaries

Apple's [toolbars](https://developer.apple.com/design/human-interface-guidelines/toolbars), [materials](https://developer.apple.com/design/human-interface-guidelines/materials) and [macOS guidance](https://developer.apple.com/design/human-interface-guidelines/designing-for-macos/) inform grouping, density and hierarchy. The web app retains its own identity, fonts and Lucide icons. Motion respects reduced motion. No native platform integration or deployment is introduced.

## Status

Implementation and local verification complete: 93 unit tests, 66 engine tests, five cold-development journeys, 28 production browser journeys and the literal visual check (three journeys) pass. Actual desktop/mobile light/dark, menu-hover and Source screenshots were opened and inspected. Git delivery is being finalized. No subagents were restarted.
