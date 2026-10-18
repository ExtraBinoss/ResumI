# ResumI for agents

Work from a project JSON file. Browser projects are private to that browser: ask the user to export JSON first, then reopen the result with **Ctrl/⌘+O** in the library. Keep personal content, sources, assets and exports in the ignored `output/` directory or outside the repository. Ask only for information needed to complete the user's CV, cover letter or other creation; never invent facts.

## Discover and start

Check `bun --version` and `node --version` (Bun 1.4.2 and Node 24). Ask before installing a missing prerequisite. From the repository root:

```sh
bun install
bun run resumi --help
bun run resumi docs all
bun run resumi templates list
bun run resumi templates inspect react-classic
bun run resumi new --template react-classic --out output/application.json
```

`docs TOPIC` and `help TOPIC` provide offline guidance: `agent`, `design`, `source`, `assets`, `commands`, `pages`, `exports`, `screenshot` and `pdf`. `capabilities` describes supported features and limits; `commands` lists engine operations; `document schema` gives their exact fields. Use these contracts rather than guessing commands or IDs.

## Edit source or canvas

For a template's HTML/TSX source:

```sh
bun run resumi output output/application --format source --out output/Resume.tsx
# Edit output/Resume.tsx, then attach it:
bun run resumi document source output/application --file output/Resume.tsx --out output/application.json
bun run resumi document validate output/application
```

Use `--file output/Resume.html` for HTML. TSX exports a default React component; only React imports are available. Embed styles, images, fonts and SVGs for offline rendering. The CLI compiles source without running it in its own process; rendering uses an isolated browser with network requests blocked. `assets list` and `assets show` provide shared shapes, icons and brand artwork with credits.

Opening the JSON in the editor prepares source as editable native layers and preserves the original code inactive. Export JSON after visual edits to continue through the CLI. `--format source` retrieves saved code; `--format tsx` snapshots the current canvas, including its edits and embedded assets.

For canvas changes, first run `document inspect PROJECT`. Write a version 1 batch containing an `actor` and `commands`, then use `document apply PROJECT PATCH --out FILE`. All commands are runtime validated and atomic. The schema covers sections, blocks, layers, groups, rich text, geometry, styling, embedded assets and independent CV language variants. Interface language does not change document content.

## Several creations in one project

Use one editable canvas page per CV page, cover letter or other creation. Start directly with an empty canvas:

```sh
bun run resumi new --blank --name "My application" --out output/application.json
```

Page operations and selected exports require canvas pages with inactive source. `--blank` is ready immediately; active HTML/TSX source can be rendered as a whole, or prepared in the editor and exported as JSON before selecting pages. There is no automatic pagination.

For example, save this as `output/add-letter.json` to create a blank A4 page:

```json
{
  "version": 1,
  "actor": { "kind": "agent", "name": "Application assistant" },
  "commands": [
    {
      "type": "page.create",
      "page": {
        "id": "cover-letter",
        "name": "Cover letter",
        "width": 794,
        "height": 1123,
        "background": "#ffffff"
      }
    }
  ]
}
```

```sh
bun run resumi document apply output/application output/add-letter.json --out output/application.json
bun run resumi pages output/application
```

Create a section with `section.create`, then add content with `block.create`. Omit `design` to use engine defaults; adjust geometry and style with `layer.update`, and place layers with `layer.moveToPage`. A complete supplied design can also set `pageId` directly. Move grouped members together and inspect real IDs first. `page.update` changes dimensions/background and additional-page names; `page.delete` removes empty additional pages. The first page is `page-1`. Projects support up to 20 pages, each 100–5000 CSS pixels per dimension.

## Export and verify

Install the local rendering browser once:

```sh
bunx playwright install chromium
bun run resumi document validate output/application
bun run resumi output output/application --format pdf --out output/application.pdf
bun run resumi screenshot output/application --out output/application.png
```

Read the PDF command's JSON report and inspect the screenshot for clipping, spacing and readable type. The report checks actual extracted text, links, reading order and spacing against the rendered page. A mismatch exits with code 3 and retains the PDF for correction; it is not certification for every ATS.

Choose one page, several pages in order, or all pages:

```sh
# One page; one combined PDF in a chosen order; all pages as separate PDFs.
bun run resumi output output/application --pages 2 --format pdf --out output/letter.pdf
bun run resumi output output/application --pages 2,1 --format pdf --out output/combined.pdf
bun run resumi output output/application --pages all --format pdf --out-dir output/pdf-pages

# Standalone HTML or React/TSX per page; inspect a particular page.
bun run resumi output output/application --pages all --format html --out-dir output/html-pages
bun run resumi output output/application --pages all --format tsx --out-dir output/tsx-pages
bun run resumi screenshot output/application --page 2 --out output/letter.png
```

`--pages` accepts numbers, ascending ranges such as `1-3`, page IDs and exact names; use `id:cover-letter` or `name:Cover letter` to disambiguate. Quote selectors containing spaces. Omit it for every page in canvas order. `--out` writes one file; `--out-dir` writes one file per selected page with numbered names. JSON always preserves the complete project; source always preserves the exact saved code. Selection never changes the input project.

Hand off the JSON backup, verified PDF and any requested portable source/HTML/TSX. Use `bun run dev` for the local editor. Do not commit private content or push, deploy or publish without an explicit request.
