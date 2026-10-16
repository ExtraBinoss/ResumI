# Visual editor

## Goal

Build canvas selection, direct text editing, contextual inspector, section/block CRUD, styles, zoom and undo/redo. This delivers the human/agent vertical slice.

## Scope

Included: Build canvas selection, direct text editing, contextual inspector, section/block CRUD, styles, zoom and undo/redo.

Deferred: cloud synchronization, provider inference, remote MCP/WebMCP, arbitrary freeform graphics, automatic pagination and production deployment.

## Prerequisites and files

Dependencies: 01, 02, 03. See [architecture](../docs/architecture.md) for ownership.

## Implementation checklist

- [ ] Implement the scoped behavior.
- [ ] Verify acceptance and failure cases.
- [ ] Record evidence and limitations.

## Acceptance criteria

All visible controls work; edits autosave and survive reload; missing projects recover gracefully.

## Verification

`bun run test:e2e; bun run visual:check`. Record actual outcomes below after running.

## UX, performance and accessibility

Keep external browser systems out of SSR and engine; use named labels, keyboard focus, granular subscriptions and clear errors. Review relevant pages at desktop and mobile widths.

## Risks and decisions

See [decisions](../docs/decisions/). Never imply live browser access for external CLI agents.

## Status

Not started. Evidence pending.
