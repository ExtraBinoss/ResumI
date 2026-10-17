# CLI for humans and agents

Run from the repository with Bun: `bun run resumi --help`. `help design`, `help source`, `help assets`, `help commands` and `help screenshot` explain the respective workflows. `capabilities` returns machine-readable features, boundaries and discovery commands.

The CLI reads explicit JSON files. `Alex` resolves to `Alex`, then `Alex.json`, relative to the current working directory; paths with spaces work when quoted. It never reads browser IndexedDB. Export a browser project as JSON before editing, then import the validated result as an independent project.

## A complete authoring loop

```bash
bun run resumi templates list
bun run resumi templates inspect react-cobalt
bun run resumi new --template react-cobalt --name "Alex — Product systems" --out Alex.json
bun run resumi document inspect Alex
bun run resumi output Alex --format source --out Resume.tsx
# Edit Resume.tsx with your agent or editor.
bun run resumi document source Alex --file Resume.tsx --actor "Design agent" --out Alex.json
bun run resumi document validate Alex
bun run resumi output Alex --format json --out handoff.json
bun run resumi output Alex --format html --out Alex.html
bun run resumi screenshot Alex --out Alex.png
```

JSON contains normalized text, styles, layer geometry, grouping, embedded assets, language variants and preserved source. HTML is the actual self-contained portable renderer output. Source returns the saved HTML or TSX exactly; a visual document without saved source returns an actionable error. `output` without `--out` prints raw JSON, HTML or source to stdout, so it can be piped directly into other tools. With `--out` it writes the file and returns a JSON receipt.

`new` aliases `document create`. Existing `document inspect`, `validate`, `apply`, `render` and `schema` remain compatible. `document output` and `document screenshot` are also accepted. `create`, `apply` and `source` return the validated document without modifying input unless `--out` explicitly names that file.

## Engine editing

`commands` lists every operation from the engine's current command JSON Schema; `document schema` prints the full schema, bounds and enums. Use actual section, block and group IDs from `document inspect`. A batch is atomic, with at most 100 operations:

```json
{
  "version": 1,
  "actor": { "kind": "agent", "name": "Design agent" },
  "commands": [
    { "type": "document.update", "name": "Alex — Design application" },
    { "type": "style.update", "patch": { "accent": "#2563eb" } }
  ]
}
```

```bash
bun run resumi document apply Alex patch.json --out edited.json
```

Available operations include sections/blocks, explicit page/layer geometry, flat groups and stacking, mixed rich-text ranges/links, colors/gradients, image borders, shadows/effects, embedded fonts/images, source activation and CV language variants. `document source` reads a local HTML/TSX file and applies `source.set` through the same engine. Invalid source size, schema or React compilation fails before writing. [Complete engine contract](engine.md).

## Shapes, icons and brands

One framework-independent `@resumi/assets` package supplies both the editor and CLI. Catalogs load on demand. No React component or UI dependency is required to inspect artwork.

```bash
bun run resumi assets list --kind brands
bun run resumi assets list --kind icons --search mail --limit 12
bun run resumi assets list --kind shapes --search star
bun run resumi assets show brand-figma --format svg --out figma.svg
bun run resumi assets show brand-microsoft --format json
bun run resumi assets show lucide:mail --format svg --out mail.svg
```

`list` returns stable IDs, names, categories and brand provenance without large path payloads. It returns up to 50 results by default; `--limit` accepts 1–2500. `show` returns complete vector JSON or ready-to-embed SVG. Compound brand paths preserve their original colors. Both outputs retain source/license attribution; keep that metadata when embedding an asset. SVG can be inline in HTML or a `data:image/svg+xml;base64,…` image in TSX. The JSON `asset` fields `path`, `viewBox`, optional `parts`, `strokeOnly` and `attribution` form the vector stored in a validated shape layer.

Fifty vetted original brand marks include Figma, Microsoft, Apple, Google, Adobe tools and development platforms. Collection licenses cover artwork distribution, not trademark rights or endorsement. [Pinned sources and credits](../packages/assets/data/brands.sources.md). User-imported SVGs live in each document's `block.design.vector`; they are not a hidden CLI-global library.

## Designing a useful CV

Start with a template whose structure matches the content. Harvard uses restrained serif typography for academic/consulting content; Cobalt provides a strong blue header; Atelier combines a portrait, muted color and editorial space; Timeline, Consultant and Mosaic offer alternative structured layouts. These are real single-file TSX sources, not preview-only images.

Choose a clear name/role hierarchy, readable print-size body text, aligned dates and 40–64px page margins. Use concise evidence-led bullets and deliberate section spacing. HTML/CSS and TSX can use Grid/Flexbox, print rules, embedded photos, inline SVG, brand marks and decorative shapes. Use brands to identify actual tools/employers, rather than suggesting affiliation. Check the rendered page for clipping, contrast and accidental overflow.

TSX supports one default component, helper components, hooks and imports from `react`. Arbitrary npm imports are unavailable: embed CSS and assets rather than importing a UI/icon package. `help design` provides this guidance without requiring another document. [Source limits, preservation and isolation](code-templates.md).

## Screenshot feedback

Install the capture browser once with `bunx playwright install chromium`, then run:

```bash
bun run resumi screenshot Alex --out Alex.png
bun run resumi screenshot "./applications/Alex Morgan.json" --out Alex.png --width 794 --height 1123
```

The command lazily loads Playwright, creates a fresh disposable Chromium context, renders the real portable HTML in an opaque `sandbox="allow-scripts"` iframe, and waits for React content, `document.fonts.ready` and image decoding. It disables screenshot animations and requests reduced motion. Every network request is aborted, service workers/downloads are disabled and the browser closes in `finally`. The CLI compiles TSX without executing components in its own process; source executes only inside that isolated browser frame.

Default dimensions are the canvas size or 794 × 1123 CSS pixels. Width accepts 100–5000 and height 100–10000. Content may extend the captured height up to 10000; horizontal overflow produces a useful error. Missing fonts/images and rendering failures produce no partial PNG. The JSON receipt contains output path, final dimensions and blocked request URLs. A missing Chromium binary reports its installation command. No dev server, account or provider credentials are needed.

Open the PNG to inspect actual visual output; combine it with JSON/source/HTML for content and geometry. PDF remains the browser's Print / Save as PDF path from portable HTML; there is no advertised background CLI PDF renderer.

## Responses and boundaries

Help and raw output/SVG are plain text; other successful responses are JSON stdout. Errors are JSON stderr with exit code **2** for arguments, **3** for invalid document/command/rendering and **4** for filesystem I/O. Exit **0** indicates success. Help and simple JSON output do not load Playwright, React's renderer or the TSX compiler.

The document engine owns validation and mutations; CLI code handles arguments and files. Source and canvas are preserved representations, not automatic bidirectional conversion. Freeform pages have explicit dimensions and flat groups; automatic pagination and nested groups are not implemented.
