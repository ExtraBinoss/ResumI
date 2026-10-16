# Agent command interface

## Goal

Expose engine through validated CLI and reviewed JSON command panel; document export/edit/import handoff. This delivers the human/agent vertical slice.

## Scope

Included: Expose engine through validated CLI and reviewed JSON command panel; document export/edit/import handoff.

Deferred: cloud synchronization, provider inference, remote MCP/WebMCP, arbitrary freeform graphics, automatic pagination and production deployment.

## Prerequisites and files

Dependencies: 01, 02. See [architecture](../docs/architecture.md) for ownership.

## Implementation checklist

- [ ] Implement the scoped behavior.
- [ ] Verify acceptance and failure cases.
- [ ] Record evidence and limitations.

## Acceptance criteria

Create, inspect, validate, apply and render run without browser or credentials; invalid batches are atomic.

## Verification

`bun test packages/cli/test packages/adapters/test`. Record actual outcomes below after running.

## UX, performance and accessibility

Keep external browser systems out of SSR and engine; use named labels, keyboard focus, granular subscriptions and clear errors. Review relevant pages at desktop and mobile widths.

## Risks and decisions

See [decisions](../docs/decisions/). Never imply live browser access for external CLI agents.

## Status

Not started. Evidence pending.
