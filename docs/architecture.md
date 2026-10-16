# Architecture and ownership

```text
React / shadcn Base UI events ──┐
JSON proposal review ──────────┼─ validated v1 commands → framework-free engine
Bun CLI / external agents ────┘                          │
                                      normalized immutable document + history
                                                       │
                       Jotai derived block/section atoms ├─ CV HTML/CSS renderer
                                                       └─ browser repository → IndexedDB
```

`packages/engine` knows generic sections, text blocks, styles, IDs, invariants and command meaning. `packages/cv` provides resume templates and the actual portable HTML/CSS renderer. `packages/adapters` validates and previews proposals independently of transports. `packages/cli` handles files, arguments and exit codes. None of those packages imports UI or IndexedDB. Only the CLI entry uses Bun APIs; production Worker code uses Web APIs and Cloudflare's supported React Router integration.

`apps/web/src/state/editor.ts` contains stable atoms. Each editor's isolated Jotai store holds **one canonical Session**, with engine-owned immutable document snapshots. UI selections, zoom and panel visibility are transient. Block/section/style selectors preserve object identity for unaffected entities; a subscription test verifies an unrelated block and its section do not receive a notification for a one-field edit. React Compiler performs memoization; Hooks/Compiler lint rules remain enabled. Effects load browser records and synchronize keyboard/window events, with cleanup; document commands run in event handlers.

The repository validates documents, maintains project timestamps/revisions and persists them. It is not a second editing engine. Saves coalesce after 180 ms and serialize; a transaction compares the expected revision before writing. A stale tab cannot recreate a deleted record or overwrite a newer record. Errors leave the in-memory session/export available. Navigating back flushes first; the window warns about pending/failed saves. Immediate browser termination can still interrupt a save. History is bounded to 50 session-local entries; reload retains the document, not undo stacks.

Database `resumi-projects` v1 creates `projects`; v2 initializes missing revisions and adds a recency index. Browser tests seed a genuine v1 database and reopen it through the application. Storage upgrade is separate from document `schemaVersion`. The exported document is the portable unit; project timestamps, storage revision and transient state stay local. Import validates and allocates fresh document/section/block IDs so it never overwrites another project.

SSR renders public pages and stable workspace shells. Landing/template loaders render their resume previews on the server, avoiding loading the engine into the public-page client merely to draw a preview. IndexedDB loads only after hydration. Missing IDs render recovery actions. The Cloudflare Vite plugin runs both local SSR and production preview in workerd; the production build emits a Worker plus static client assets. No production domain, account binding, provider key or deployment is configured.

See [decisions](decisions/001-foundation.md), [engine contract](engine.md), [verification](verification.md) and [limitations](../README.md#current-boundaries).

The user's follow-up replaces Mantine with **shadcn/ui using Base UI**. The official shadcn CLI generated the editable sources under `apps/web/src/components/ui`; `apps/web/components.json` selects `base-nova`. Tailwind v4 provides the generated component utilities while application layouts, floating panels and editor controls keep CSS Modules and tokens. `apps/web/src/ui` adapts the existing small control API to those real generated components, preserving labels and event behavior during migration. There is no Mantine provider, stylesheet or dependency, and no Radix dependency. Menus, popovers, dialogs, selects, sliders, radios, scrolling, buttons and input fields use the generated Base UI components. Link buttons use shadcn's `buttonVariants` with actual links to retain link semantics. See [UI decision](decisions/003-shadcn-base-ui.md).

## Creative workspace and source representations

Visual documents retain normalized sections/blocks. A block’s optional `design` contains its geometry, appearance and text marks; text itself stays in `block.text`. `document.canvas` owns the page, z-order, flat groups and embedded fonts. Both Visual and Text issue commands against that same text and history. The original ResumI schema remains readable; a one-time CV-domain projection supplies initial frames when enabling a visual canvas.

V1 effects, gradients, rich-text helpers, shape geometry and group algorithms were adapted from the read-only `cv-creator-private` checkout. The new boundary validates every field, complete ownership and contiguous group ordering; IDs are supplied explicitly and engine operations remain deterministic. No Vue store or browser filesystem bridge was carried over.

Pointer movement previews transforms on the selected DOM elements. Pointer release publishes one engine command; resizing, nudges, group transforms and proposal batches remain undoable. Pan, snapping, marquee, zoom and selection are interaction state. A viewport ResizeObserver preserves the working center when the window changes size. The canvas root subscribes to page/order data, each layer to its own block, and properties to the selected document data. Selector caches are prepared outside render.

The creation route uses one optional document ID route and IndexedDB client loader, then canonicalizes the address after mounting. Intent prefetch loads code only. Zod Mini and CLI-only JSON Schema separation reduce the browser dependency cost; the full source compiler, offline React runtime and large icon/gallery catalogs are lazy. See [profiling evidence](verification.md).

React template SSR lives in a separate package entry; source compilation never evaluates user code in the Worker or CLI. Preview execution is confined to an opaque sandboxed iframe. [Code templates](code-templates.md) documents source commands, supported imports and portable output.
