# Agent command interface

## Goal

Make the same engine useful to file-based CLI agents and human review.

## Scope

Included: the implementation checklist below. Deferred: production deployment, account/cloud synchronization, provider inference, remote MCP/WebMCP and automatic pagination.

## Prerequisites and files

Dependencies: 01, 02. Relevant files: `packages/cli, packages/adapters, src/features/AgentPanel.tsx`. See [architecture](../docs/architecture.md).

## Implementation checklist

- [x] Implement complete help, validated arguments, JSON document output/stderr and explicit exit codes.
- [x] Implement document create/inspect/validate/apply/render/schema commands without UI dependencies.
- [x] Define a versioned transport-free batch JSON Schema and proposal preview adapter.
- [x] Implement a working deterministic example and explicit preview/apply/discard review.
- [x] Apply proposals as one attributable undo step using the same engine as human edits.
- [x] Document export → CLI inspect/edit/render → validated import and distinct future MCP/WebMCP boundaries.

## Acceptance criteria

CLI handler tests cover successes and argument, validation and file errors. Real CLI sample/schema/HTML artifacts were generated; browser proposal preview, reject, apply and undo pass.

## Testing and verification

Commands: `bun test packages/cli/test packages/adapters/test; bun run resumi --help`. Actual evidence: [verification record](../docs/verification.md), [screenshots](../artifacts/visual/), [rendered HTML/CSS](../artifacts/rendered/) and [timings](../artifacts/performance/interactions.json).

## UX, performance and accessibility

Named controls, keyboard focus, genuine error/empty states and reduced motion were reviewed on relevant routes. Editor subscriptions and real interaction timings are tested. Browser storage loads after deterministic SSR hydration. No private resume data appears in QA artifacts.

## Risks and decisions

No model connection, remote MCP, WebMCP, live browser database bridge or provider credentials are implemented. See [ADR 001](../docs/decisions/001-foundation.md) and [current boundaries](../README.md#current-boundaries).

## Status

Done — implemented and verified locally on 2026-10-16. No blocked items in the scoped vertical slice.
