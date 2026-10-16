# Discovery and foundation

## Goal

Audit the read-only V1, select compatible stable dependencies, and establish Bun workspaces, actual SSR, Compiler and tooling. This delivers the human/agent vertical slice.

## Scope

Included: Audit the read-only V1, select compatible stable dependencies, and establish Bun workspaces, actual SSR, Compiler and tooling.

Deferred: cloud synchronization, provider inference, remote MCP/WebMCP, arbitrary freeform graphics, automatic pagination and production deployment.

## Prerequisites and files

Dependencies: None. See [architecture](../docs/architecture.md) for ownership.

## Implementation checklist

- [ ] Implement the scoped behavior.
- [ ] Verify acceptance and failure cases.
- [ ] Record evidence and limitations.

## Acceptance criteria

Stack installs; nested routes server render; V1 remains untouched.

## Verification

`bun run typecheck; bun run build; bun run test:ssr`. Record actual outcomes below after running.

## UX, performance and accessibility

Keep external browser systems out of SSR and engine; use named labels, keyboard focus, granular subscriptions and clear errors. Review relevant pages at desktop and mobile widths.

## Risks and decisions

See [decisions](../docs/decisions/). Never imply live browser access for external CLI agents.

## Status

Not started. Evidence pending.
