# Hardening and delivery

## Goal

Enforce engine coverage, strict types, Hooks lint, file limits, production build, SSR, CI and accurate documentation. This delivers the human/agent vertical slice.

## Scope

Included: Enforce engine coverage, strict types, Hooks lint, file limits, production build, SSR, CI and accurate documentation.

Deferred: cloud synchronization, provider inference, remote MCP/WebMCP, arbitrary freeform graphics, automatic pagination and production deployment.

## Prerequisites and files

Dependencies: 00–07. See [architecture](../docs/architecture.md) for ownership.

## Implementation checklist

- [ ] Implement the scoped behavior.
- [ ] Verify acceptance and failure cases.
- [ ] Record evidence and limitations.

## Acceptance criteria

Combined check passes, coverage >=85% lines/functions, every handwritten source <600 lines.

## Verification

`bun run check`. Record actual outcomes below after running.

## UX, performance and accessibility

Keep external browser systems out of SSR and engine; use named labels, keyboard focus, granular subscriptions and clear errors. Review relevant pages at desktop and mobile widths.

## Risks and decisions

See [decisions](../docs/decisions/). Never imply live browser access for external CLI agents.

## Status

Not started. Evidence pending.
