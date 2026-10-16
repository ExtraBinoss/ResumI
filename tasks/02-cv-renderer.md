# CV domain and renderer

## Goal

Render real editable resumes from the engine document, including portable CLI exports.

## Scope

Included: the implementation checklist below. Deferred: production deployment, account/cloud synchronization, provider inference, remote MCP/WebMCP, freeform graphics and automatic pagination.

## Prerequisites and files

Dependencies: 01. Relevant files: `packages/cv/src, src/features/Canvas.tsx, artifacts/rendered`. See [architecture](../docs/architecture.md).

## Implementation checklist

- [x] Provide Studio and Editorial synthetic resume templates.
- [x] Keep domain defaults outside the generic engine.
- [x] Share block markup, section rules, CSS and style tokens across canvas, CLI and agent previews.
- [x] Escape all untrusted text and constrain style inputs.
- [x] Produce real self-contained HTML/CSS and A4 print styles.
- [x] Inspect rendered browser DOM, computed 794×1123 minimum dimensions and standalone CLI HTML.

## Acceptance criteria

Standalone HTML renders 14 synthetic blocks with actual text and shared CSS. Renderer escaping and template behavior pass; portable screenshot opened.

## Testing and verification

Commands: `bun test packages/cv/test; bun run test:e2e`. Actual evidence: [verification record](../docs/verification.md), [screenshots](../artifacts/visual/), [rendered HTML/CSS](../artifacts/rendered/) and [timings](../artifacts/performance/interactions.json).

## UX, performance and accessibility

Named controls, keyboard focus, genuine error/empty states and reduced motion were reviewed on relevant routes. Editor subscriptions and real interaction timings are tested. Browser storage loads after deterministic SSR hydration. No private resume data appears in QA artifacts.

## Risks and decisions

Automatic pagination and pixel-perfect PDF are deferred; native print is exposed accurately. See [ADR 001](../docs/decisions/001-foundation.md) and [current boundaries](../README.md#current-boundaries).

## Status

Done — implemented and verified locally on 2026-10-16. No blocked items in the scoped vertical slice.
