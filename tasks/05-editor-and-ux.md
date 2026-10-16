# Visual editor

## Goal

Deliver a direct document editing workspace with responsive, reviewable changes.

## Scope

Included: the implementation checklist below. Deferred: production deployment, account/cloud synchronization, provider inference, remote MCP/WebMCP, freeform graphics and automatic pagination.

## Prerequisites and files

Dependencies: 01, 02, 03. Relevant files: `apps/web/src/features, src/state/editor.ts, src/styles`. See [architecture](../docs/architecture.md).

## Implementation checklist

- [x] Build compact toolbar, outline, A4 canvas and contextual inspector.
- [x] Enable section/block selection, direct textarea editing and meaningful empty/recovery states.
- [x] Implement section/block add/update/delete/reorder, name and style editing through commands.
- [x] Expose zoom, native print, portable HTML/JSON exports and keyboard undo/redo.
- [x] Use stable granular Jotai atoms; test unrelated block/section subscribers remain quiet.
- [x] Fit mobile canvas and open one contextual panel at a time.
- [x] Measure real opening/input round trips; exercise autosave/reload and fail-safe navigation.

## Acceptance criteria

Critical interaction journeys pass, including keyboard history, styles after reload and block CRUD. Desktop/mobile editor screenshots opened. Timing samples are retained, not described as field benchmarks.

## Testing and verification

Commands: `bun run test:e2e; bun test apps/web/test/state`. Actual evidence: [verification record](../docs/verification.md), [screenshots](../artifacts/visual/), [rendered HTML/CSS](../artifacts/rendered/) and [timings](../artifacts/performance/interactions.json).

## UX, performance and accessibility

Named controls, keyboard focus, genuine error/empty states and reduced motion were reviewed on relevant routes. Editor subscriptions and real interaction timings are tested. Browser storage loads after deterministic SSR hydration. No private resume data appears in QA artifacts.

## Risks and decisions

Touch editing, full screen-reader review, freeform graphics and independent pagination remain future work. See [ADR 001](../docs/decisions/001-foundation.md) and [current boundaries](../README.md#current-boundaries).

## Status

Done — implemented and verified locally on 2026-10-16. No blocked items in the scoped vertical slice.
