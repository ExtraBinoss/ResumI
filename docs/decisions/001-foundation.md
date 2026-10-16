# ADR 001 — A structured, local-first vertical slice

Accepted 2026-10-16.

## V1 audit

Read-only reference: `../cv-creator-private`, the available checkout for GitHub `ExtraBinoss/cv-creator`. Reviewed its README, package metadata, document schema, command dispatcher, snapshot history, IndexedDB repository and portable HTML exporter. It uses Vue/Bun, a freeform A4 element model with rich text, graphics, translations and PDF capabilities. Reusable ideas: serializable headless commands, stable IDs, explicit history, browser-local projects and text-preserving portable exports.

For this milestone, carrying over its arbitrary graphics, effects, fonts and groups would import unnecessary scope and coupling. No legacy source was copied. ResumI implements normalized semantic sections/blocks with a shared renderer. This gives professional editable CVs, safe structured agent operations and a testable vertical slice. Freeform geometry and the V1 PDF engine remain deferred. Existing unrelated V1 changes (one PDF and an untracked agent project) were observed and left untouched; no user resume was imported into synthetic QA.

## Stack

Registry and official docs were checked before initialization. The lockfile pins React 19.3.1, React Router 8.4.0 framework mode, Vite 8.3.4, Cloudflare Vite plugin 1.64.0, Wrangler 4.151.1, Mantine 9.7.2, Jotai 2.20.3 and TypeScript 5.9.3. React Router is now v8 in this environment; no assumption of v7 was made. Peer ranges were inspected, and strict types/build/runtime browser checks validate the selected combination. Bun 1.4.2 manages workspaces and local tools. The production runtime is Workers, not Bun.

React Router is the brief's preferred framework and has a first-party Cloudflare Vite integration; TanStack Start adds no concrete advantage here. React Compiler 1.0.0 uses the documented Babel path, explicitly including application TSX. Development hydration uses StrictMode. Mantine uses matching forced light color scheme and official html props. CSS Modules and tokens need no Tailwind. Purposeful CSS hover/focus transitions respect reduced motion; no Motion dependency was added because this slice has no animation that benefits from it.

Native IndexedDB via `idb` is sufficient. Runtime validation uses Zod strict objects plus cross-record invariants. Jotai holds canonical session state, not a mirror of an independent mutable engine store. Engine transformations preserve unchanged entity identities. The shared canvas renderer returns escaped HTML for individual blocks; React adds selection and a native textarea only while directly editing. CLI HTML and agent previews use the same blocks, section rules, style variables and CSS.

## Sources

- [Cloudflare React Router framework guide](https://developers.cloudflare.com/workers/framework-guides/web-apps/react-router/)
- [Official Cloudflare React Router template](https://github.com/cloudflare/workers-sdk/tree/main/packages/create-cloudflare/templates/react-router/ts)
- [Workers best practices](https://developers.cloudflare.com/workers/best-practices/workers-best-practices/)
- [React Compiler installation, React Router integration](https://react.dev/learn/react-compiler/installation)
- [Mantine React Router SSR guide](https://mantine.dev/guides/react-router/)

## Consequences

Real SSR, local Worker preview and a production Worker build are verified without credentials or deployment. The implementation is portable to future provider and transport integrations. Browser print offers Save as PDF using the real HTML; there is no claim of pixel-perfect pagination or a dedicated PDF service. Local files and browser data require explicit export/import handoff. Undo is session-local, not a synchronization protocol.
