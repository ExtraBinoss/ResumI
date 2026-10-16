# ADR 002 — Deterministic cold-start development dependencies

Accepted 2026-10-16 after a user reported `Invalid hook call` / null `useMemoCache` during `vite dev` startup.

The production build and CI checks passed, but those gates did not cover development dependency optimization. React Compiler injects `react/compiler-runtime` after Vite's initial source scan. Its first SSR request therefore discovered a new dependency and regenerated shared React chunks. The user's log showed a program reload followed by a null hook dispatcher. A clean isolated cache also reproduced browser `504 Outdated Optimize Dep` errors when Mantine and other lazy-route dependencies were discovered after the first page began hydrating.

The Vite config now explicitly pre-bundles the Compiler runtime and actual lazy UI/browser dependencies in **both** the client and SSR graphs. React Router already deduplicates React/React DOM, so no redundant alias or second React installation was added. Compiler optimization stays enabled in development and production. Dependencies and mandatory stack versions are unchanged.

A separate PostCSS warning disappeared after replacing the agent stylesheet's cross-file CSS Modules `composes` with direct use of the same shared classes in TSX. The resulting UI styles are unchanged; there is no warning filter or vendor patch.

`bun run test:dev` now creates an isolated fresh Vite cache, starts a real local Worker development server, requires the first SSR response to succeed (no hidden warmup retries after HTTP errors), and runs the SSR/hydration and complete human-editing workflows. It fails on the reported hook/runtime or PostCSS warnings, retains `artifacts/dev-smoke.log`, closes its own server and removes only its temporary cache. `bun run check` and CI include this regression gate before the production build/tests. The user's already-running server at port 5175 was separately checked with `BASE_URL=http://127.0.0.1:5175 bun run test:ssr` and passed.

The cache override is tooling-only (`RESUMI_VITE_CACHE_DIR`); normal development keeps Vite's standard cache. `RESUMI_DEV_CHECK_PORT` optionally changes the isolated test server's port. Public APIs and Workers production behavior do not change.

References: [Vite dependency optimization include](https://vite.dev/config/dep-optimization-options#optimizedeps-include), [React Compiler React Router installation](https://react.dev/learn/react-compiler/installation#react-router), and the installed React Router Vite plugin's existing `resolve.dedupe` policy.
