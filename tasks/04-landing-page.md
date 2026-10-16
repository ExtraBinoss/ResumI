# Public landing page

## Goal

Explain the product and get a person into a real saved resume quickly.

## Scope

Included: the implementation checklist below. Deferred: production deployment, account/cloud synchronization, provider inference, remote MCP/WebMCP and automatic pagination.

## Prerequisites and files

Dependencies: 00, 02, 03. Relevant files: `apps/web/app/routes/home.tsx, templates.tsx, src/styles/Landing.module.css`. See [architecture](../docs/architecture.md).

## Implementation checklist

- [x] Server-render the exact brand tagline and metadata with semantic public page structure.
- [x] Connect create CTAs to actual persistent project creation and editor navigation.
- [x] Show real rendered CV content and two working template choices.
- [x] Use small vetted provider marks with truthful CLI compatibility wording.
- [x] Create responsive white/black/blue design with visible focus and reduced-motion behavior.
- [x] Capture and open desktop/mobile landing and template screenshots; assert no horizontal page overflow.

## Acceptance criteria

Server HTML contains the hero, catalog and document preview. CTA creates a project. All logo requests load; 390px layouts pass overflow assertions and were visually inspected.

## Testing and verification

Commands: `bun run test:ssr; bun run visual:check`. Actual evidence: [verification record](../docs/verification.md), [screenshots](../artifacts/visual/), [rendered HTML/CSS](../artifacts/rendered/) and [timings](../artifacts/performance/interactions.json).

## UX, performance and accessibility

Named controls, keyboard focus, genuine error/empty states and reduced motion were reviewed on relevant routes. Editor subscriptions and real interaction timings are tested. Browser storage loads after deterministic SSR hydration. No private resume data appears in QA artifacts.

## Risks and decisions

Provider inference/native integrations are not included; provenance is recorded in docs/brand-assets.md. See [ADR 001](../docs/decisions/001-foundation.md) and [current boundaries](../README.md#current-boundaries).

## Status

Done — implemented and verified locally on 2026-10-16. No blocked items in the scoped vertical slice.
