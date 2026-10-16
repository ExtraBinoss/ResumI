# Architecture and ownership

```text
React / Mantine event handlers ─┐
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
