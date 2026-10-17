# 14 — Match the original Vue workspace

## Goal and scope

Use the actual V1 interface as the reference rather than an approximation. Keep composition/properties permanently visible, simplify the project bar and copy, restore native text editing, and improve image decoration, theme and scrolling. Source authoring remains available through the project menu; it is no longer an editing mode. No deployment or provider integration.

## Dependencies and files

Tasks 00–13, read-only V1 source, shadcn Base UI, Motion, engine/CV decoration schema and canvas interactions. A temporary isolated Vue harness uses a synthetic Alex Morgan document to inspect the actual reference without altering the V1 checkout.

## Implementation checklist

- [x] Inspect and run original Vue components with synthetic data in an isolated temporary copy.
- [x] Implement validated optional image borders and visual shadows with portable rendering and history.
- [x] Replace canvas textareas with in-place text editing; add eight resize handles and pointer-anchored Ctrl/Meta-wheel zoom.
- [x] Permanent blurred composition/properties panels and compact centered project bar match the reference.
- [x] shadcn registry color picker, generic ScrollShadow and Kbd shortcuts; no native color popup.
- [x] Motion page/tool transitions and persistent light/dark/system settings.
- [x] Dashboard centered previews, gradient title overlays, eye preview and concise copy.
- [x] Port the V1 text contrast audit with conservative unknown results for variable backgrounds.
- [x] Apply shadcn preset `b6Rf8X01vU` (Base UI Luma, neutral, Source Sans 3 / Space Grotesk), then apply the requested Blue-600 `#2563EB`, 6–8px radii and readable 12px panel controls.
- [x] Share a persistent dashboard layout with Templates, centered sorting, neutral card overlays/actions and a compact sidebar Settings icon.
- [x] Preview capitalized blend modes on hover without mutating document/history; restore on dismissal.
- [x] Use themed edge-aligned scrollbars/fades, smooth anchored wheel zoom and themed Visual/Text/dock transitions.
- [x] Replace the opening screen with a restrained accessible orb; defer the picker and command review from the initial module path.
- [x] Complete browser, visual, cold-development and engine verification.
- [ ] Push the integrated revision and update PR.

## Acceptance and verification

No composition/properties toggles or close controls, no Teammate button, no public Code mode. Double-click edits text in its actual styled canvas area. Image border/shadow persists and exports. Wheel zoom changes canvas scale without changing browser zoom and preserves the point under the cursor. Preview eye opens/closes by keyboard. Both themes and mobile permanent panels remain usable. Run `bun run check`, `bun run visual:check`, inspect actual screenshots beside the Vue reference.

## UX and decisions

Motion respects reduced motion. Canvas data still uses the single validated engine and Jotai session. Pure resize geometry covers rotated opposite anchors. UI settings remain separate from CV content. Existing documents accept absent decoration fields.

## Status

Implementation and local verification complete: 93 unit tests, 66 engine tests, five cold-development journeys and 28 production journeys; literal visual check passes. Final radius adjustments pass a fresh build and six relevant journeys. Git delivery pending.
