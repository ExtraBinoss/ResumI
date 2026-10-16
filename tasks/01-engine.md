# Generic document engine

## Goal

Give people and agents one deterministic validated meaning for document edits.

## Scope

Included: the implementation checklist below. Deferred: production deployment, account/cloud synchronization, provider inference, remote MCP/WebMCP, freeform graphics and automatic pagination.

## Prerequisites and files

Dependencies: 00. Relevant files: `packages/engine/src and mirrored test directories`. See [architecture](../docs/architecture.md).

## Implementation checklist

- [x] Create strict versioned normalized document, section, block and style schemas.
- [x] Validate ID uniqueness, ownership, ordering, limits and orphan-free structure.
- [x] Implement complete section/block CRUD, reordering, document naming and style commands.
- [x] Implement atomic command batches with attributable bounded undo/redo and redo invalidation.
- [x] Implement serialization, v0 migration and independent-ID duplication.
- [x] Test invalid input, atomic failures, invariants, structural sharing, determinism and history.
- [x] Enforce >=85% line/function coverage with all source modules explicitly imported.

## Acceptance criteria

12 engine tests pass; 100% measured line/function coverage. Equivalent human/agent commands produce equal documents; failed batches preserve the original.

## Testing and verification

Commands: `bun run test:engine`. Actual evidence: [verification record](../docs/verification.md), [screenshots](../artifacts/visual/), [rendered HTML/CSS](../artifacts/rendered/) and [timings](../artifacts/performance/interactions.json).

## UX, performance and accessibility

Named controls, keyboard focus, genuine error/empty states and reduced motion were reviewed on relevant routes. Editor subscriptions and real interaction timings are tested. Browser storage loads after deterministic SSR hydration. No private resume data appears in QA artifacts.

## Risks and decisions

History is session-local; engine code has no React, browser API or provider dependency. See [ADR 001](../docs/decisions/001-foundation.md) and [current boundaries](../README.md#current-boundaries).

## Status

Done — implemented and verified locally on 2026-10-16. No blocked items in the scoped vertical slice.
