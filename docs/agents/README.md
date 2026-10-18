# Agent guide

Use explicit resume files and synthetic samples for setup checks. To work on a browser project, ask its owner to export JSON first. The CLI resolves project names to files in the working directory.

## Local setup prompt

Copy this into your coding agent and replace `<repository-url>`:

```text
Set up ResumI locally from <repository-url>, or use the current checkout.

1. Read AGENTS.md and README.md before changing anything.
2. Use Bun 1.4.2 and Node 24. Run bun install, then
   bunx playwright install chromium for screenshots, PDF output and browser tests.
3. Run bun run resumi --help to confirm the CLI is available.
4. Run bun run dev and report the local URL printed by Vite.
5. Use the shipped synthetic templates for verification. Read resume files only
   when they have been explicitly supplied for this task.
6. If I request changes, use the validated engine/CLI rather than bypassing
   document rules. Run the relevant checks from AGENTS.md and inspect the result.

Do not push or deploy as part of local setup.
```

## Create and edit a resume

Start with discovery, then inspect the actual document and IDs:

```sh
bun run resumi --help
bun run resumi templates list
bun run resumi templates inspect react-classic
bun run resumi new --template react-classic --out resume.json
bun run resumi document inspect resume
bun run resumi output resume --format source --out Resume.tsx
```

Edit `Resume.tsx`, then attach it to a new JSON file:

```sh
bun run resumi document source resume --file Resume.tsx --out edited.json
bun run resumi document validate edited
```

For HTML, use `--file Resume.html` instead. React/TSX must export a default component; React imports are supported, arbitrary npm imports are not. Keep styles, images and fonts embedded for portable output. Source compilation does not execute the component in the CLI process; rendering runs in an isolated browser.

Open `edited.json` through **Ctrl/⌘+O** in the app's library to continue by hand. Before the editor opens, the app prepares source as native text, image and shape layers. Complex SVGs may become image layers. The original source remains saved inactive; exports from the editor use the current canvas.

`output --format source` retrieves the preserved original code. After human canvas edits, use the editor's current HTML/React export or continue from its exported JSON instead of treating the preserved source as the current layout.

## Validated JSON changes

Discover the command contract before generating a patch:

```sh
bun run resumi commands
bun run resumi document schema
bun run resumi capabilities
```

Save a batch as `patch.json`, using IDs from `document inspect` when needed:

```json
{
  "version": 1,
  "actor": { "kind": "agent", "name": "Resume editing agent" },
  "commands": [{ "type": "document.update", "name": "Design application" }]
}
```

```sh
bun run resumi document apply edited patch.json --out revised.json
bun run resumi document validate revised
```

Batches are atomic: an invalid command rejects the batch. For a native canvas, the schema covers layer geometry, rich-text ranges, groups, fonts, images and pages. Inspect the document's current representation before choosing operations; page/layer commands require a compatible canvas. `--out` makes file writes explicit.

## Shapes, icons and brands

Use the shared catalog rather than inventing asset IDs or treating a logo as an npm package:

```sh
bun run resumi assets list --kind shapes
bun run resumi assets list --kind icons --search mail
bun run resumi assets list --kind brands --search Figma
bun run resumi assets show brand-figma --format svg --out figma.svg
bun run resumi assets show rectangle --format json
```

Embed SVG inline in HTML/TSX or use the returned vector data with validated canvas commands. Keep original brand colors and the catalog's provenance metadata. Fonts and artwork retain their respective notices.

## Verify before handoff

```sh
bun run resumi screenshot revised --out revised.png
bun run resumi output revised --format html --out revised.html
bun run resumi output revised --format pdf --out revised.pdf
```

Inspect the PNG for clipping, spacing, contrast and readable type. Screenshots and PDF rendering block network requests, so embed required assets.

Read the PDF command's JSON report: check page count, extracted text, links, missing/unexpected text and ordering/spacing results. A failed text check exits with code 3 and keeps the PDF for review. Fix the source or layers and render again; successful extraction is not a guarantee of compatibility with every applicant tracking system.

Hand off the JSON resume, the verified PDF and any requested portable HTML. For application code changes, run `bun run check`; for visible changes also run `bun run visual:check` and inspect the screenshots. See `bun run resumi help source`, `help design`, `help assets` and `help pdf` for the detailed local contracts.
