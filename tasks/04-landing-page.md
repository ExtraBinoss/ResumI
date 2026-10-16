# Public landing page

## Goal

Build accessible responsive SSR landing and template pages with real resume content and working create CTA. This delivers the human/agent vertical slice.

## Scope

Included: Build accessible responsive SSR landing and template pages with real resume content and working create CTA.

Deferred: cloud synchronization, provider inference, remote MCP/WebMCP, arbitrary freeform graphics, automatic pagination and production deployment.

## Prerequisites and files

Dependencies: 00, 02, 03. See [architecture](../docs/architecture.md) for ownership.

## Implementation checklist

- [ ] Implement the scoped behavior.
- [ ] Verify acceptance and failure cases.
- [ ] Record evidence and limitations.

## Acceptance criteria

Tagline is in server HTML; CTA creates a persistent project; responsive layout has no overflow.

## Verification

`bun run test:ssr; bun run visual:check`. Record actual outcomes below after running.

## UX, performance and accessibility

Keep external browser systems out of SSR and engine; use named labels, keyboard focus, granular subscriptions and clear errors. Review relevant pages at desktop and mobile widths.

## Risks and decisions

See [decisions](../docs/decisions/). Never imply live browser access for external CLI agents.

## Status

Not started. Evidence pending.
