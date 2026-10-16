# Generic document engine

## Goal

Implement normalized, runtime-validated documents, atomic commands, structural sharing, serialization and bounded attributed history. This delivers the human/agent vertical slice.

## Scope

Included: Implement normalized, runtime-validated documents, atomic commands, structural sharing, serialization and bounded attributed history.

Deferred: cloud synchronization, provider inference, remote MCP/WebMCP, arbitrary freeform graphics, automatic pagination and production deployment.

## Prerequisites and files

Dependencies: 00. See [architecture](../docs/architecture.md) for ownership.

## Implementation checklist

- [ ] Implement the scoped behavior.
- [ ] Verify acceptance and failure cases.
- [ ] Record evidence and limitations.

## Acceptance criteria

CRUD, deterministic commands, failures and undo/redo preserve invariants.

## Verification

`bun run test:engine`. Record actual outcomes below after running.

## UX, performance and accessibility

Keep external browser systems out of SSR and engine; use named labels, keyboard focus, granular subscriptions and clear errors. Review relevant pages at desktop and mobile widths.

## Risks and decisions

See [decisions](../docs/decisions/). Never imply live browser access for external CLI agents.

## Status

Not started. Evidence pending.
