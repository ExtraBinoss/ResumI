# Local project repository

## Goal

Make local project CRUD persistent, portable and resistant to stale overwrites.

## Scope

Included: the implementation checklist below. Deferred: production deployment, account/cloud synchronization, provider inference, remote MCP/WebMCP and automatic pagination.

## Prerequisites and files

Dependencies: 01, 02. Relevant files: `apps/web/src/lib/projects.ts, test/lib/projects.test.ts, e2e/resilience.spec.ts`. See [architecture](../docs/architecture.md).

## Implementation checklist

- [x] Implement typed IndexedDB project create/read/save/rename/delete/duplicate.
- [x] Add v1 creation and v2 migration for recency index and revision defaults.
- [x] Allocate independent IDs on duplicates and imports; validate imported documents.
- [x] Coalesce writes and serialize overlapping autosave/navigation flushes.
- [x] Use transactional expected-revision checks for stale tabs and deleted projects.
- [x] Expose useful saving/error/export/retry states; confirm project deletion.
- [x] Test complete CRUD after reload, real-browser schema upgrade, denied storage, offline edits and two-tab conflicts.

## Acceptance criteria

CRUD/reopen, migration, independent copies and stale writes pass in unit and browser tests. Failed tab save retains exportable in-memory changes; offline edit survives online reload.

## Testing and verification

Commands: `bun test apps/web/test; bun run test:e2e`. Actual evidence: [verification record](../docs/verification.md), [screenshots](../artifacts/visual/), [rendered HTML/CSS](../artifacts/rendered/) and [timings](../artifacts/performance/interactions.json).

## UX, performance and accessibility

Named controls, keyboard focus, genuine error/empty states and reduced motion were reviewed on relevant routes. Editor subscriptions and real interaction timings are tested. Browser storage loads after deterministic SSR hydration. No private resume data appears in QA artifacts.

## Risks and decisions

IndexedDB is device/browser/origin local. No service worker, cloud sync or durable storage guarantee; backup is explicit. See [ADR 001](../docs/decisions/001-foundation.md) and [current boundaries](../README.md#current-boundaries).

## Status

Done — implemented and verified locally on 2026-10-16. No blocked items in the scoped vertical slice.
