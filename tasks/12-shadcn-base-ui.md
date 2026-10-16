# 12 — Editable shadcn controls with Base UI

## Goal and scope

Replace Mantine with actual editable shadcn components using Base UI, as explicitly requested. This supersedes the original library choice. Preserve the working controls and document engine.

## Dependencies and files

Tasks 00–11; `apps/web/components.json`, `src/components/ui`, `src/ui`, tokens, Tailwind Vite integration and lockfile.

## Implementation checklist

- [x] Run the official CLI in the React Router workspace; generate `base-nova` and 18 local component files.
- [x] Configure Tailwind v4, aliases and light-theme tokens with Inter; retain CSS Modules for application layout.
- [x] Replace Mantine imports/provider/styles through the local adapter and remove Mantine/Radix dependencies.
- [x] Preserve button/link semantics, labels, keyboard interaction, typed controls and validated engine handlers.
- [x] Inspect actual desktop/mobile selects, menus, dialogs, sliders, color/number inputs, dashboard radios and floating panels.
- [x] Strict types, Hooks/Compiler lint and source limits pass.

## Acceptance and verification

No application imports Mantine or Radix. Controls use the CLI-generated Base UI sources. `bun run check` verifies cold development, SSR/hydration, production build and complete interaction flows. Captures are retained under `artifacts/visual/shadcn-base-ui-*.png`, alongside the final editor/dashboard captures, and were opened.

## UX, performance and accessibility

Accessible names, keyboard select/menu/radio behavior, readable mobile zoom and bounded dock height are checked. The zoom field uses an integer step compatible with the fitted mobile value. Overlay focus and semantics come from Base UI.

## Risks and decisions

The adapter keeps a small local application API during migration; its implementation imports real generated controls. Tailwind is limited to generated component styling. [ADR 003](../docs/decisions/003-shadcn-base-ui.md) records the exact CLI setup.

## Status

Done — implementation, combined local gate and visual inspection complete.
