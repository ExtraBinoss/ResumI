# Profile and accelerate resume creation

## Goal

Measure click-to-canvas, engine work, storage and resource costs; eliminate serial route/loading work without weakening validation.

## Scope

Included: the user-requested performance and workspace improvements. Deferred: model inference, cloud sync and production deployment. Freeform drag/resize was subsequently added by task 11.

## Prerequisites and files

Depends on tasks 00–08; apps/web, packages/engine, packages/adapters, scripts and browser tests.

## Implementation checklist

- [x] Record real browser trace and a reproducible before baseline.
- [x] Use one route for creation/opening and the framework client-data lifecycle.
- [x] Keep CLI-only JSON Schema generation outside browser imports and reduce measured validation payload.
- [x] Prefetch editor code on intent without creating a project.
- [x] Re-measure with the same profiler and preserve before/after evidence.

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

Measured evidence: warmed local median 611ms before → 366ms final, three fresh contexts with identical pointer intent; approximately 40% lower. Cold Vite recompilation is reported separately. [Before](../artifacts/performance/create-before.json) · [Final](../artifacts/performance/create-final.json).
