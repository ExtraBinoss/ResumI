# Hardening and delivery

## Goal

Enforce objective quality gates and prepare an accurate reviewable repository.

## Scope

Included: the implementation checklist below. Deferred: production deployment, account/cloud synchronization, provider inference, remote MCP/WebMCP, freeform graphics and automatic pagination.

## Prerequisites and files

Dependencies: 00–07. Relevant files: `scripts, .github/workflows/check.yml, README.md, docs, tasks`. See [architecture](../docs/architecture.md).

## Implementation checklist

- [x] Enforce strict types, Hooks/Compiler lint and recursive <600-line source scan.
- [x] Test scanner nesting, exclusions, extra extensions and exact 599/600 boundaries.
- [x] Enforce >=85% engine line/function coverage including unimported modules.
- [x] Run unit tests, production build and SSR/critical browser checks from one check command.
- [x] Add GitHub Actions and retain synthetic verification evidence.
- [x] Document architecture, engine contract, V1 audit, local limitations and reproduction commands.
- [x] Update every numbered task and master checklist to verified state.
- [x] Commit on feature branch and open a PR; do not deploy production.

## Acceptance criteria

Combined local check succeeds. CI workflow is committed; remote results are tracked on the PR separately. No production deployment or credential configuration.

## Testing and verification

Commands: `bun run check; git diff --check`. Actual evidence: [verification record](../docs/verification.md), [screenshots](../artifacts/visual/), [rendered HTML/CSS](../artifacts/rendered/) and [timings](../artifacts/performance/interactions.json).

## UX, performance and accessibility

Named controls, keyboard focus, genuine error/empty states and reduced motion were reviewed on relevant routes. Editor subscriptions and real interaction timings are tested. Browser storage loads after deterministic SSR hydration. No private resume data appears in QA artifacts.

## Risks and decisions

A source file above 500 lines is a warning; 600+ is a failure. Release deferrals are intentional, not silently marked as shipped. See [ADR 001](../docs/decisions/001-foundation.md) and [current boundaries](../README.md#current-boundaries).

## Status

Done — implementation and local verification complete. Feature commit pushed; [PR #1](https://github.com/ExtraBinoss/ResumI/pull/1) opened. Remote CI is tracked separately from local results.
