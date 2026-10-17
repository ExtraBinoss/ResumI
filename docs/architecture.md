# Architecture and ownership

```text
React / shadcn Base UI events ──┐
Reviewed JSON commands ────────┼─ validated v1 batch → framework-free engine
Bun CLI / external agents ────┘                         │
                                     immutable document + history
                                                      │
                         canonical Jotai session ──────┼─ CV renderer
                                                      └─ IndexedDB adapter
```

`packages/engine` owns schemas, document invariants, commands, serialization and history. It imports no React, Jotai, browser APIs, storage or renderer. `packages/cv` owns resume defaults, React templates and portable HTML/CSS rendering. `packages/adapters` validates and previews command proposals; `packages/cli` handles arguments and files around those same contracts. Only the CLI entry uses Bun file APIs.

## Web feature boundaries

```text
apps/web/src/
  features/
    dashboard/
      Projects.tsx          Project browsing and CRUD orchestration
      Templates.tsx         Server-rendered template catalog in the same shell
      components/           Sidebar, cards and preview dialog
      state/                Shared repository-list lifecycle
      styles/               Dashboard and template CSS Modules
    editor/
      Editor.tsx            Workspace composition and global editing shortcuts
      components/           Topbar, dock, project menu and dialogs
      panels/               Composition, properties, typography and assets
      agent/                Command review and rendered diff
      source/               HTML/React authoring dialog and source preview
      text/                 Text workspace
      styles/               Editor and panel CSS Modules
    canvas/
      Canvas.tsx            Compatibility renderer for structured documents
      DesignCanvas.tsx      Layer rendering, selection, drag and resize
      CanvasText.tsx        In-place text editing
      ShapePicker.tsx       Shared shape/icon palette
      useCanvasPan.ts       Pan and pointer-anchored wheel zoom
      styles/               Canvas, controls, legacy and palette CSS Modules
  components/               Shared previews, settings, ScrollShadow, Shortcut
    ui/                     Generated shadcn/Base UI components
    reui/                   Imported Base UI color picker and its license
  ui/                       Small component adapters
  state/                    Shared session/selectors, interaction state and theme
  lib/                      Repository, file handoff and shared utilities
  styles/                   Global tokens and public-page CSS Modules
```

The dashboard uses the repository and read-only previews. It reaches the editor through route URLs and side-effect-free intent prefetch; it does not manage an editing session. The editor composes canvas, panels and dialogs. Canvas components own gestures and rendering, while shared state lets canvas and inspector issue commands against the same session. Feature CSS stays beside its feature; shared primitives do not import feature components.

`/projects` and `/templates` share the `routes/dashboard.tsx` layout, sidebar and repository-list provider. Sibling navigation preserves that shell and animates only incoming content; old data routes are not retained after their loader data expires. The catalog still uses its server loader. The shared list holds repository snapshots for browsing, never a second canonical editor session.

The landing showcases those same trusted templates, with selectable variants and a working Visual/Text demonstration. The library uses bounded, centered document cards, title-aligned preview/actions and a neutral overlay. Classic, Editorial, Studio and Profile are real TSX layouts rather than presentation-only images. Profile includes a synthetic portrait; contact icons and licensed typography travel with portable output. Legacy visual IDs remain available to CLI/API clients. Asset generation and source preservation are documented in [code templates](code-templates.md).

`app/` owns route loaders, SSR, hydration and page transitions. `workers/` owns the Cloudflare request handler. IndexedDB is a browser adapter, never a server or CLI data source.

## State, rendering and persistence

Each editor has one isolated Jotai store and **one canonical engine Session**. Stable block/section/style atoms preserve unchanged identities; selector caches are prepared outside render. Canvas rendering subscribes to page/order data and individual blocks, rather than the complete document. Selection, tools, zoom, open dialogs and drafts are interaction state, not duplicate documents.

Pointer movement previews DOM transforms; release commits a validated command. In-place canvas text editing keeps its editable draft until commit. Inspector text edits use the same block commands; its DOM bridge preserves selection while reconciling external changes. No pagination or hidden layout measurement runs on every keystroke. Ctrl/⌘ + wheel animates canvas zoom around the pointer; Space or the middle mouse button pans. Blend-option hover temporarily changes only the selected DOM surfaces and restores canonical styling on leave/close; choosing an option issues the validated command.

The repository validates records and maintains timestamps/revisions. Saves coalesce after 180 ms and serialize; a transaction checks the expected revision. A stale tab cannot overwrite a newer record or recreate a deleted project. Failed saves leave in-memory content available for export. Back navigation flushes first; immediate browser termination can still interrupt pending work. History is limited to 50 session-local entries and resets on reload.

Database `resumi-projects` v1 creates `projects`; v2 adds recency indexing and missing revision values. Storage upgrades are separate from document `schemaVersion`. Imports allocate independent document/section/block IDs. The exported document contains content, not repository timestamps or transient UI state.

## UI and source representations

Composition and properties remain present, including the compact mobile arrangement. The dock exposes **Visual / Text**. The project name opens metadata, **Edit source** and **Import commands**; these tools use dialogs rather than extra workspace modes. Both people and agents rename the project through `document.update`.

The UI uses shadcn with Base UI: `components.json` selects `base-luma`, neutral surfaces, Blue-600 `#2563EB` and 6–8px UI radii. Source Sans 3 is the interface font; Space Grotesk is the heading font. CV fonts remain independently editable. Generated primitives live in `components/ui`. The color picker was imported with the shadcn CLI from ReUI's Base UI registry and split by responsibility, with its MIT license retained. `src/ui` adapts those editable components without introducing another component framework.

The desktop treatment follows macOS document-app conventions: neutral translucent panels, a centered document title, grouped toolbar actions, recessed segmented controls and quiet separators. Shared light/dark tokens own control surfaces, borders, selected segments and material elevation. Numeric fields retain native number editing, min/max/step and arrow-key behavior; their shadcn step buttons call the same validated change handler and produce ordinary undoable engine edits. Application fonts, Lucide icons and the requested Blue-600 remain consistent across platforms.

`ScrollShadow` shares Base UI overflow state and shadcn scrollbars across composition, properties and shape/icon palettes. Content padding stays inside the scrolling content so the rails remain on the outer edge; overflow fades use the theme surface color. `Shortcut` renders platform-aware hints with shadcn `Kbd`. Motion handles page, selection and control transitions under a reduced-motion-aware `MotionConfig`. Light/dark/system appearance is a UI preference, synchronized with browser storage and system settings; it is not saved into the CV.

Visual documents keep normalized sections/blocks. Optional `block.design` holds geometry, appearance and text marks; content stays in `block.text`. `document.canvas` owns page settings, ordering, flat groups and embedded fonts. Image borders and image/shape shadows are validated document fields and render in both the canvas and portable output.

Pure V1 geometry, effects, gradients and rich-text helpers were adapted from the read-only `cv-creator-private` repository. IDs, ownership, group ordering and mutations are validated by the new engine. No Vue store or browser filesystem bridge was copied.

HTML/React source is a preserved optional representation, not a second session. Visual/Text deactivate saved source without deleting it; applying in the Source dialog activates it. Arbitrary source is not converted back into layers. [Source contract](code-templates.md).

## Runtime boundaries

Public loaders generate template previews on the server. React template SSR has a separate package entry, keeping React's server renderer out of visual project creation. The color picker panel, command review, source compiler, offline React runtime and large icon/shape catalogs are lazy. Source compilation does not execute user components in the Worker or CLI; browser preview uses an opaque sandboxed iframe.

The creation route loads/creates the browser record, mounts the editor, then canonicalizes its address. Intent prefetch loads code without creating records. Development prebundles Compiler and lazy UI dependencies in both SSR/client graphs; cold-cache and direct/reload tests cover that boundary.

The Cloudflare Vite plugin runs development and production preview in workerd. Builds emit a Worker and static assets; no production account bindings, credentials or deployment are configured. Actual gate results and measurements belong in [verification](verification.md), not architecture claims. See the [engine contract](engine.md) and [current boundaries](../README.md#current-boundaries).
