# Discovery and foundation

## Goal

Build the verified foundation for a real Cloudflare-compatible SSR application.

## Scope

Included: the implementation checklist below. Deferred: production deployment, account/cloud synchronization, provider inference, remote MCP/WebMCP, freeform graphics and automatic pagination.

## Prerequisites and files

Dependencies: None. Relevant files: `apps/web/app, apps/web/workers, package.json, AGENTS.md`. See [architecture](../docs/architecture.md).

## Implementation checklist

- [x] Audit V1 schema, commands, history, storage and renderer without changing the checkout.
- [x] Create the numbered execution plan before application implementation.
- [x] Install compatible Bun workspaces, React 19, React Router SSR, Vite and Cloudflare integration.
- [x] Configure Mantine SSR, Jotai, Lucide, CSS Modules and React Compiler.
- [x] Create strict TypeScript, Hooks lint, build and local Worker tooling.

## Acceptance criteria

Production build emits client and SSR Worker; server HTTP responses contain actual route content. V1 has exactly its pre-existing PDF/untracked file changes.

## Testing and verification

Commands: `bun run typecheck; bun run build; bun run test:ssr`. Actual evidence: [verification record](../docs/verification.md), [screenshots](../artifacts/visual/), [rendered HTML/CSS](../artifacts/rendered/) and [timings](../artifacts/performance/interactions.json).

## UX, performance and accessibility

Named controls, keyboard focus, genuine error/empty states and reduced motion were reviewed on relevant routes. Editor subscriptions and real interaction timings are tested. Browser storage loads after deterministic SSR hydration. No private resume data appears in QA artifacts.

## Risks and decisions

Registry peer ranges and official integration docs checked; see ADR 001. See [ADR 001](../docs/decisions/001-foundation.md) and [current boundaries](../README.md#current-boundaries).

## Status

Done — implemented and verified locally on 2026-10-16. No blocked items in the scoped vertical slice.
