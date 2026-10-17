# React templates and portable source resumes

Templates in `packages/cv/src/templates` are React components. `CodeResume.tsx` composes shared semantic content and ten distinct A4 layouts. `ResumeTemplate.tsx` renders the trusted component with validated document data on the server; it never evaluates user source. The SSR renderer is a separate `@resumi/cv/templates` entry, so creating a visual document does not load React's server renderer into the editor.

| Template   | Composition                                                                          |
| ---------- | ------------------------------------------------------------------------------------ |
| Studio     | Sans serif, primary content with a narrow education/skills rail                      |
| Editorial  | Serif heading, contact column and section-label rail                                 |
| Classic    | Centered identity, single column and ruled sections                                  |
| Profile    | Synthetic portrait and cool neutral sidebar                                          |
| Harvard    | Academic single column, centered sections, education first, compact black typography |
| Cobalt     | Blue identity band, monogram, engineering content and original-color tool marks      |
| Atelier    | Warm portrait rail, serif editorial headings and brand/design tools                  |
| Timeline   | Forest-green research profile, chronological rails and geometric orbit               |
| Consultant | Typographic strategy resume, numbered sections and a three-column credentials footer |
| Mosaic     | Geometric color composition, highlighted introduction and inset skills panel         |

The public catalog exposes these ten React templates. Their IDs use `react-` followed by the lowercase template name. Legacy visual `studio`/`editorial` IDs remain valid for existing CLI/API clients and the fast blank-editor flow. A React template creates a validated document with `source: { format: "react", code: "…" }`. Press **Mod+Shift+E** to author HTML/React in a dialog. The dock keeps **Visual / Text**; source is not a third workspace mode.

Professional sample content is added only to React documents through validated commands. The six extended layouts have original, distinct illustrative career histories. The single-file TSX keeps readable data and layout code at the top; one asset section at the end embeds the licensed Inter font, optional fictional portrait, selected brand geometry and required licenses. Contact icons use vetted inline Lucide SVG paths. Brand marks reuse the pinned Devicon geometry from the shared asset catalog; they identify tools, never invented employers or endorsements. Standalone output therefore needs no remote image, font or icon service. The portrait's [generation prompt and provenance](../packages/cv/assets/README.md) are retained with the asset.

Harvard is an independent TSX implementation of the academic composition shown in the official Harvard Mignone Center for Career Success [resume templates](https://careerservices.fas.harvard.edu/resources/bullet-point-resume-template/) and [paragraph-format reference](https://cdn-careerservices.fas.harvard.edu/wp-content/uploads/sites/161/2024/07/resume-paragraph.pdf): centered identity and headings, education before experience, right-aligned dates, restrained typography and achievements. It contains original synthetic copy and no Harvard wordmark, affiliation claim or copied example career history.

Opening the Source dialog does not modify the resume. **Start with HTML** copies the current rendered layout into a draft; **Start with React** builds a TSX component from its structured text. This uses semantic content, not reverse-engineering of arbitrary positioned layers.

**Apply & preview** compiles React drafts before publishing one validated `source.set` command and activating the source. Draft typing is local state; applied code belongs to the same Jotai session, history and IndexedDB record as other edits. Compilation or engine-validation errors preserve the applied preview. If another command changes the saved source while a draft is open, reload it before applying.

Visual/Text deactivate source and return to the preserved canvas. To restore saved source, reopen the source dialog with **Mod+Shift+E** and apply it. Activation survives reload; switching modes does not delete code. **New HTML source** and **New React source** create replacement drafts, leaving saved code intact until Apply. Arbitrary HTML/React is not converted back into editable layers.

While source is active, the dock identifies its rendered composition as **Visual**, with the shared bottom zoom controls and Ctrl/Cmd+wheel. There is no separate source mode or Fit page toolbar. Reclicking the selected Visual mode switches to Text through the same validated deactivation commands; Text→Visual returns to editable layers. The initial source fit belongs to the editor session and does not reset a manually chosen zoom on resize or reactivation. Source-dialog previews retain their isolated React interactions.

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

The dialog imports `.html`, `.htm`, `.tsx` and `.jsx` files, and exports original source or portable rendered HTML. JSON preserves the complete document. To author through CLI, use `document apply` with `source.set`, then `document render ... --format html --out ...`. `document create --template react-studio`, `react-editorial`, `react-classic`, `react-profile`, `react-harvard`, `react-cobalt`, `react-atelier`, `react-timeline`, `react-consultant` and `react-mosaic` are available alongside legacy visual starters. Reviewed agent batches enter through the command review dialog (**Mod+Alt+Enter**).

UI ownership lives in `apps/web/src/features/editor/source`, with its CSS in the adjacent editor `styles` directory. Shared isolated preview components stay in `src/components`; compilation and portable rendering stay in `packages/cv/src/source`. Feature UI never adds document rules to the engine's source contract.

Run `bun run templates:assets` after updating the template component, portrait or embedded font; it deterministically regenerates the asset JSON, source snapshot and copied licenses. `scripts/template-source.ts` flattens the trusted types, semantic content, extended CSS/layouts and default component into one dependency-free TSX file; every helper travels with the source. Run `bun run source:runtime` after updating React to regenerate the offline runtime. Generated assets are checked in. The compiler/runtime are lazy chunks, separate from normal visual project creation.

## Verification

Engine source tests cover strict validation, size limits, atomic rollback, equal human/agent semantics, activation/deactivation, history, duplication and JSON round trips. State tests verify visual projection and deactivation form one undoable batch. CV tests cover inactive-source export, TSX data injection, compiler errors, CSP construction, script delimiters, no CDN and no evaluation during rendering. CLI safety tests verify source does not execute while exporting. Browser journeys in `apps/web/e2e/source.spec.ts` cover saved HTML, visual reload and code recovery, replacement React drafts, iframe isolation, React hooks, offline standalone export, catalog templates and compiler errors preserving the saved preview. See the master verification record for the actual run results.
