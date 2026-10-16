# Local project repository

## Goal

Implement typed IndexedDB CRUD, migrations, independent duplication and optimistic revision checks. This delivers the human/agent vertical slice.

## Scope

Included: Implement typed IndexedDB CRUD, migrations, independent duplication and optimistic revision checks.

Deferred: cloud synchronization, provider inference, remote MCP/WebMCP, arbitrary freeform graphics, automatic pagination and production deployment.

## Prerequisites and files

Dependencies: 01, 02. See [architecture](../docs/architecture.md) for ownership.

## Implementation checklist

- [ ] Implement the scoped behavior.
- [ ] Verify acceptance and failure cases.
- [ ] Record evidence and limitations.

## Acceptance criteria

Create, reopen, rename, duplicate, import, delete and reload work; stale saves fail.

## Verification

`bun test apps/web/test; bun run test:e2e`. Record actual outcomes below after running.

## UX, performance and accessibility

Keep external browser systems out of SSR and engine; use named labels, keyboard focus, granular subscriptions and clear errors. Review relevant pages at desktop and mobile widths.

## Risks and decisions

See [decisions](../docs/decisions/). Never imply live browser access for external CLI agents.

## Status

Not started. Evidence pending.
