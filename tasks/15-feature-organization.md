# 15 — Organize feature code by responsibility

## Goal and scope

Replace the flat features directory with clear dashboard, editor and canvas modules, including their local styles. Keep genuinely shared primitives/previews/settings outside these modules. No engine/state duplication.

## Dependencies and files

Task 14 workstreams must freeze before the move. All application imports, lazy loading, route imports, test imports and documentation are updated together.

## Implementation checklist

- [x] Move dashboard views/cards/previews into features/dashboard.
- [x] Move editor shell, properties, source and command review into features/editor.
- [x] Move canvas rendering/gestures/pickers into features/canvas.
- [x] Split mixed workspace CSS by the components that use it and colocate feature styles.
- [x] Update all imports, including lazy prefetch and route loading; no compatibility forwarding files.
- [x] Strict types, lint, <600-line policy, cold development, production build and browser checks pass after the move.

## Acceptance and verification

No loose feature implementation files remain at features root. A reader can find each screen and its styles under its owning feature. Shared UI stays in components/ui; the engine remains framework-free. Run `bun run check`, inspect the resulting tree and actual route navigation.

## Risks and decisions

Use one coordinated move after writers freeze to preserve relative imports and avoid stale Vite modules. Restart only the task-owned development server after relocation.

## Status

Complete — 40 files relocated and mixed styles split; the combined gate and literal visual check pass after the move. See [verification](../docs/verification.md) for actual counts and evidence.
