# Browser and visual QA

## Goal

Look at real rendering and verify user behavior rather than assume the source looks right.

## Scope

Included: the implementation checklist below. Deferred: production deployment, account/cloud synchronization, provider inference, remote MCP/WebMCP, freeform graphics and automatic pagination.

## Prerequisites and files

Dependencies: 04, 05, 06. Relevant files: `apps/web/e2e, artifacts/visual, artifacts/rendered`. See [architecture](../docs/architecture.md).

## Implementation checklist

- [x] Capture desktop landing/projects/editor and mobile landing/projects/templates/editor screenshots.
- [x] Open and visually inspect generated screenshots, including independently rendered CLI HTML.
- [x] Inspect rendered page HTML and computed canvas CSS.
- [x] Fix inspector restoration after agent close, mobile panel defaults, font import and compact mobile toolbar.
- [x] Run browser CRUD, persistence, migration, agent parity, keyboard, invalid-input and failure journeys.
- [x] Retain synthetic data only; record measured opening and input round trips.

## Acceptance criteria

12 Playwright checks pass on production Worker preview. Screenshots and DOM/CSS artifacts are saved and actually opened. Public layouts show no horizontal overflow.

## Testing and verification

Commands: `bun run test:e2e; bun run visual:check`. Actual evidence: [verification record](../docs/verification.md), [screenshots](../artifacts/visual/), [rendered HTML/CSS](../artifacts/rendered/) and [timings](../artifacts/performance/interactions.json).

## UX, performance and accessibility

Named controls, keyboard focus, genuine error/empty states and reduced motion were reviewed on relevant routes. Editor subscriptions and real interaction timings are tested. Browser storage loads after deterministic SSR hydration. No private resume data appears in QA artifacts.

## Risks and decisions

Chromium only in this environment; no broad WCAG certification or cross-browser/device guarantee is claimed. See [ADR 001](../docs/decisions/001-foundation.md) and [current boundaries](../README.md#current-boundaries).

## Status

Done — implemented and verified locally on 2026-10-16. No blocked items in the scoped vertical slice.
