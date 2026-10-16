# 11 — Restore the V1 creative workspace

## Goal and scope

Restore the original cv-creator's bottom dock, Visual/Text editing, layers, groups, blend modes, effects and deeper properties. Reuse useful pure code from `../cv-creator-private` while keeping the validated ResumI engine and existing documents. Nested groups and automatic pagination remain outside this scope.

## Dependencies and files

Tasks 00–10; `packages/engine/src/canvas`, `packages/cv/src/design*`, editor state, canvas, layer panel, inspector and dock. The legacy checkout stays read-only.

## Implementation checklist

- [x] Inspect V1 CanvasStage, TextMode, LayersPanel, InspectorPanel and headless engine.
- [x] Adapt pure effects, fills, rich-text marks, shapes and group algorithms with strict validation; keep one canonical text value.
- [x] Shared UI/CLI commands for geometry, order, grouping, visibility, locks, typography, images, shapes, gradients and effects.
- [x] Floating dock, Visual/Text switching, layer tree and detailed inspector.
- [x] Drag/resize, multiselection, snapping, panning, group movement, history, image import/crop and portable rendering.
- [x] Runtime boundary, budget, persistence, CLI/export and browser workflows.
- [x] Real imported font loads on canvas and survives reload/export.
- [x] Profile creation and inspect desktop/mobile screenshots.

## Acceptance and verification

Equivalent human/agent commands produce the same document. Old structured documents remain editable; Visual and Text update the same block text/history. Groups composite opacity/blend once around their children. Failed commands remain atomic. `bun run check` covers engine boundary tests, three creative-workspace journeys and real font loading; [verification](../docs/verification.md) retains screenshots, computed styles and standalone exports.

## UX, performance and accessibility

Named controls, keyboard nudge/group/history, compact mobile panels and a two-row dock. Drag gestures use transient DOM state, then commit one command. Individual layers subscribe to stable block selectors. Shape/icon catalogs load lazily.

## Risks and decisions

A4 is a fixed single page with explicit frames and flat groups. The document budget counts all assets together in UTF-8. Imported source is not reverse-engineered into layers. [Architecture](../docs/architecture.md) records V1 reuse and state ownership.

## Status

Done — implementation, combined local gate and visual inspection complete.
