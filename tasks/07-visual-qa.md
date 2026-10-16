# Browser and visual QA

## Goal

Capture and open desktop/mobile screenshots, inspect DOM/CSS, and exercise full user journeys using synthetic data. This delivers the human/agent vertical slice.

## Scope

Included: Capture and open desktop/mobile screenshots, inspect DOM/CSS, and exercise full user journeys using synthetic data.

Deferred: cloud synchronization, provider inference, remote MCP/WebMCP, arbitrary freeform graphics, automatic pagination and production deployment.

## Prerequisites and files

Dependencies: 04, 05, 06. See [architecture](../docs/architecture.md) for ownership.

## Implementation checklist

- [ ] Implement the scoped behavior.
- [ ] Verify acceptance and failure cases.
- [ ] Record evidence and limitations.

## Acceptance criteria

Screenshots actually viewed; SSR/hydration and CRUD flows pass; evidence retained.

## Verification

`bun run test:e2e; bun run visual:check`. Record actual outcomes below after running.

## UX, performance and accessibility

Keep external browser systems out of SSR and engine; use named labels, keyboard focus, granular subscriptions and clear errors. Review relevant pages at desktop and mobile widths.

## Risks and decisions

See [decisions](../docs/decisions/). Never imply live browser access for external CLI agents.

## Status

Not started. Evidence pending.
