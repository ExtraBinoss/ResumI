# CV domain and renderer

## Goal

Create synthetic resume templates and one portable escaped HTML/CSS renderer used by canvas and CLI. This delivers the human/agent vertical slice.

## Scope

Included: Create synthetic resume templates and one portable escaped HTML/CSS renderer used by canvas and CLI.

Deferred: cloud synchronization, provider inference, remote MCP/WebMCP, arbitrary freeform graphics, automatic pagination and production deployment.

## Prerequisites and files

Dependencies: 01. See [architecture](../docs/architecture.md) for ownership.

## Implementation checklist

- [ ] Implement the scoped behavior.
- [ ] Verify acceptance and failure cases.
- [ ] Record evidence and limitations.

## Acceptance criteria

Canvas and exported HTML have identical semantic content and styling.

## Verification

`bun test packages/cv/test`. Record actual outcomes below after running.

## UX, performance and accessibility

Keep external browser systems out of SSR and engine; use named labels, keyboard focus, granular subscriptions and clear errors. Review relevant pages at desktop and mobile widths.

## Risks and decisions

See [decisions](../docs/decisions/). Never imply live browser access for external CLI agents.

## Status

Not started. Evidence pending.
