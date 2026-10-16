# Floating workspace and project dashboard

## Goal

Make the workspace feel direct and flexible; give saved resumes a clear dashboard with real local data.

## Scope

Included: the user-requested performance and workspace improvements. Deferred: model inference, cloud sync and production deployment. Freeform drag/resize was subsequently added by task 11.

## Prerequisites and files

Depends on tasks 00–08; apps/web, packages/engine, packages/adapters, scripts and browser tests.

## Implementation checklist

- [x] Build a visible dashboard destination with recent local documents and working actions.
- [x] Add a real continue-editing entry and useful project counts/search/order.
- [x] Use a floating toolbar/dock and compact contextual panels around the canvas.
- [x] Preserve keyboard accessibility, export, CRUD and mobile panel behavior.
- [x] Capture/open screenshots and re-run complete CRUD/performance/SSR checks.

## Acceptance criteria

Creation/opening is measured with no spurious duplicate project or intermediate loading route. Existing local resumes are discoverable and all actions work. Floating controls preserve canvas editing and keyboard focus.

## Verification

`bun run profile:create`, `bun run test:dev`, `bun run check`, `bun run visual:check`. Capture actual timings/DOM/screenshots; compare identical profiling conditions.

## UX/performance/accessibility

No fake loading delay, hidden destructive action or cosmetic dashboard statistic. Keep fine-grained subscriptions and accessible control labels.

## Risks and decisions

Profile development compilation separately from production. Do not replace validation with trusted casts or treat prefetch as permission to create a document.

## Status

Done — implementation, combined local gate and visual inspection complete. See [verification](../docs/verification.md).
