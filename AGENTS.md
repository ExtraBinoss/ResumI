# ResumI

- Use Bun, strict TypeScript, Oxlint/Oxfmt (with official ESLint Hooks/Compiler checks), React 19 with Compiler/StrictMode, Jotai, Motion and shadcn/ui with Base UI. Application styles use CSS Modules/tokens; generated components use Tailwind. Respect reduced motion and accessible controls.
- Keep UI ownership in `features/dashboard`, `features/editor` and `features/canvas`. Shared primitives belong in `components`/`ui`.
- The framework-free engine owns document rules. All mutations use runtime-validated commands; never import React, browser APIs or runtime adapters into the engine.
- Jotai holds the canonical editor session. Use stable block selectors, structural sharing and transient gesture state. Avoid whole-document subscriptions and duplicated state.
- Effects synchronize external systems only, with cleanup. Keep derived values in render and user actions in handlers. SSR must not access browser storage; hydration must be deterministic.
- Translate interface copy through `apps/web/src/i18n`; interface language and CV language are independent. Keep document content unchanged unless explicitly edited.
- Keep handwritten sources below 600 lines. Run `bun run check`; for visible changes also run `bun run visual:check` and inspect screenshots/DOM. Use synthetic CVs.
- Keep the legacy cv-creator checkout read-only. Do not run GitHub commands, publish or configure production without an explicit request.
