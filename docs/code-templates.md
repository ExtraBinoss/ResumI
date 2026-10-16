# React templates and portable source resumes

Templates in `packages/cv/src/templates` are React components. `ResumeTemplate.tsx` renders structured Studio/Editorial documents on the server; `CodeResume.tsx` is also the editable starter for React Studio/React Editorial. Template data is supplied separately from the component. The SSR renderer is a separate `@resumi/cv/templates` entry, so creating a visual document does not load React's server renderer into the editor.

The template catalog offers visual and React versions. A React template creates a normal validated document with `source: { format: "react", code: "…" }`. Visual documents expose Code in the bottom dock. Opening Code does not modify the resume: **Start with HTML** copies the current rendered layout into a draft; **Start with React** builds a TSX component with the current structured text. The React starter uses semantic content, rather than reverse-engineering arbitrary positioned layers into components.

**Apply & preview** commits one validated `source.set` command and activates it. Draft typing is local interaction state; the applied source belongs to the same Jotai session, history and IndexedDB record as other commands. Invalid TSX and failed engine validation preserve the applied preview. A source changed by another command while a draft is open must be reloaded before applying. Visual/Text deactivate the source and return to the preserved canvas; Code reactivates the saved source. The selected representation survives reload, and changing views does not delete code. There is no automatic bidirectional conversion between arbitrary source and canvas layers. **New HTML source** and **New React source** explicitly start replacement drafts from the visual layout or structured content; the saved source stays intact until Apply.

## Source contract

`Document.source` is optional. Its strict schema accepts `format: "html" | "react"`, at most 200,000 characters of `code`, and optional `enabled: boolean`. Omitted `enabled` means active for compatibility with existing files. The engine treats code as opaque data and never executes it. Both formats and their activation state are portable through JSON import/export, duplication, undo/redo and agent command batches:

```json
{
  "version": 1,
  "actor": { "kind": "agent", "name": "My coding agent" },
  "commands": [
    {
      "type": "source.set",
      "source": {
        "format": "react",
        "code": "export default function Resume() { return <article><h1>Alex Morgan</h1></article>; }"
      }
    }
  ]
}
```

`source.activate` with `enabled: false` preserves code while selecting the visual/structured representation; `enabled: true` selects the saved source. It fails with `NOT_FOUND` when no source exists. Switching to Visual batches deactivation and any first canvas projection into one undo step. `source.clear` explicitly deletes the source representation and remains available to CLI/agent commands; view-switching buttons never use it. Existing blocks, sections, visual layers and groups remain available. Source commands share the UI/CLI contract and atomic batch validation; they do not introduce another browser-only editing engine.

HTML accepts a document or fragment and inline CSS. React accepts TSX/JSX, helper functions/components and an exported default component. `React` is available; imports such as `import { useState } from "react"` also work. Other packages are unavailable and produce a visible preview error. This is a single-file component editor, not an npm project runner. Styles and images/fonts can be embedded; data URLs remain portable.

## Rendering and isolation

Sucrase compiles TSX without running it. Applied source is displayed only inside an iframe with `sandbox="allow-scripts"`, without same-origin privileges, top navigation, popups or forms. The preview cannot access the application's DOM or private IndexedDB. HTML script execution is blocked by its CSP; React gets an inline production runtime. The CSP blocks external scripts, fetch connections, external image/font resources, embedded frames, objects and form actions. It is a browser isolation boundary, not a server-side JavaScript sandbox.

`renderDocumentHtml(document)` validates the document and dispatches to the selected representation. Inactive source is preserved in JSON while HTML export renders the canvas/structured document. Active source React exports contain a bundled React/ReactDOM runtime and compiled component in one HTML file; they work offline without a CDN. The CLI compiles source but never executes user components. A standalone exported React file executes its component when opened in a browser. Printing active source is done from that exported file; the application does not write source into a same-origin popup.

The source editor imports `.html`, `.htm`, `.tsx` and `.jsx` files, and exports the original `.html`/`.tsx` source or the portable rendered HTML. The normal JSON export preserves the complete document. To author through CLI, use `document apply` with `source.set`, then `document render ... --format html --out ...`. `document create --template react-studio` and `react-editorial` are available alongside the visual starters.

Run `bun scripts/build-source-runtime.ts` after updating React or `CodeResume.tsx`. It regenerates `runtime.generated.json` and `template.generated.json` from source; these are checked-in generated assets. The compiler/runtime are lazy chunks, separate from normal visual project creation.

## Verification

Engine source tests cover strict validation, size limits, atomic rollback, equal human/agent semantics, activation/deactivation, history, duplication and JSON round trips. State tests verify visual projection and deactivation form one undoable batch. CV tests cover inactive-source export, TSX data injection, compiler errors, CSP construction, script delimiters, no CDN and no evaluation during rendering. CLI safety tests verify source does not execute while exporting. Browser journeys in `apps/web/e2e/source.spec.ts` cover saved HTML, visual reload and code recovery, replacement React drafts, iframe isolation, React hooks, offline standalone export, catalog templates and compiler errors preserving the saved preview. See the master verification record for the actual run results.
