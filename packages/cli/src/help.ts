export const HELP = `ResumI — portable resume tools for humans and agents
Usage: bun run resumi <command> [arguments]

  new [--template ID | --blank] [--name NAME] [--out FILE]
  output PROJECT [--format json|html|tsx|react|source|pdf] [--pages SELECTOR]
    [--out FILE | --out-dir DIR]
  pages PROJECT                    List editable page numbers, IDs, names and sizes
  screenshot PROJECT --out FILE.png [--page SELECTOR] [--width PX] [--height PX]
  templates [list|inspect ID]       Discover real React and canvas starters
  assets list [--kind shapes|icons|brands] [--search TEXT] [--limit N]
  assets show ID [--format json|svg] [--out FILE]
  commands                         List every validated engine operation
  capabilities                     Machine-readable features and boundaries
  help [agent|design|source|assets|commands|screenshot|pdf|pages|exports|all]
  docs [TOPIC] [--source local|github]   Shipped offline help; explicit remote guide

Document commands (existing automation remains compatible):
  document create [--template ID | --blank] [--name NAME] [--out FILE]
  document inspect PROJECT          Complete normalized document and IDs
  document validate PROJECT         Check schema, ownership and asset budgets
  document apply PROJECT PATCH [--out FILE]   Apply an atomic v1 batch
  document source PROJECT --file Resume.tsx [--out FILE] [--actor NAME]
  document render PROJECT --format html|pdf|tsx [--pages SELECTOR]
    --out FILE (combined) or --out-dir DIR (separate pages)
  document output PROJECT ...        Same options as output
  document pages PROJECT             Same page listing as pages
  document screenshot PROJECT --out FILE.png [--page SELECTOR] [--width PX] [--height PX]
  document schema                   Complete versioned command JSON Schema

PROJECT is a JSON path or filename without .json, relative to the working
directory. Browser projects must be exported first; no private browser access.
Use: templates → new → inspect → apply/source → output → screenshot → import.
PDF: output PROJECT --format pdf --out Resume.pdf renders and checks its text.
Use docs agent to start, docs pages for CV + cover-letter projects, or docs all
for every shipped topic. The default docs/help commands never access the network.
Help and raw output are text; other responses are JSON stdout. Errors are JSON
stderr. Exit codes: 0 success; 2 arguments; 3 invalid document/render; 4 file I/O.
create/apply/source never overwrite input unless that same --out is explicit.
`;

const DESIGN = `Designing a resume with ResumI
Start from a real TSX template: templates list, then new --template react-classic
--out Alex.json. Use templates inspect ID to discover layouts and accents.

Choose one readable type family (serif for an academic CV, sans for product
roles), a clear name/role hierarchy, 40–64px page margins and a restrained accent.
Keep body text readable at print size, align dates, use concise evidence-led
bullets and preserve whitespace between sections. Source layouts can use CSS
Grid, Flexbox, print rules, inline SVG, embedded portraits and data-URL fonts.
Avoid decorative charts for proficiency; check contrast and real page bounds.

Assets are shared with the editor: assets list --kind brands --search Figma
then assets show brand-figma --format svg --out figma.svg. Original colors and
source/license metadata travel with the SVG. Embed SVG inline in HTML, or as a
data:image/svg+xml URL in TSX; preserve its metadata. A brand is not an npm
module. Icons and decorative shapes are discoverable with the same commands.

HTML: document source Alex --file Resume.html --out Alex.json
TSX: document source Alex --file Resume.tsx --out Alex.json
Only imports from react are available; inline CSS and local embedded assets.
Use output Alex --format source --out Resume.tsx to edit a starter's source.
Source is a preserved representation. output --format tsx snapshots the current
editable canvas instead; --format source returns the exact saved source code.

Visual layers: commands and document schema describe geometry, groups, order,
mixed text ranges, gradients, borders, shadows, blends, embedded fonts/images
and languages. Use document inspect for real IDs and document apply for edits.
Pages: page.create takes page:{id,name,width,height,background}; page.update
takes id and patch (width,height,background, and name on additional pages).
The original canvas is page-1; existing layers belong there by default.
layer.moveToPage takes ids and pageId; move every grouped member together.
block.create can set design.pageId to add a layer directly to a page.
page.delete removes empty additional pages only. Up to 20 pages, dimensions
100–5000 CSS px. Page commands require visual canvas and inactive source.

Always validate, then screenshot Alex --out Alex.png and inspect the image.
Use output Alex --format html --out Alex.html for offline review; output Alex
--format json --out handoff.json for complete content/geometry and browser import.
Source code executes only in the isolated capture browser, never inside the CLI.
`;
const SOURCE = `HTML / React source
document source PROJECT --file Resume.html|Resume.htm|Resume.tsx|Resume.jsx
  [--format html|react] [--actor NAME] [--out FILE]
Applies one runtime-validated source.set batch. React is compiled without
execution; compilation errors leave the input file unchanged. HTML accepts a
fragment/document with inline CSS. TSX exports one default React component;
React hooks/imports work, arbitrary npm imports do not. Styles, SVG, images and
fonts must be embedded (data URLs) for portable offline output.
Use output --format source to retrieve exact code (including inactive source),
--format tsx (alias react) for a snapshot of the live editable canvas,
--format html for a complete
offline page and --format json for the complete engine document. Source code
is limited to 200,000 characters and shares the global 12 MB document budget.
Use source.activate/source.clear through document apply to switch or remove
the representation. Source is not automatically converted into visual layers.
`;
const ASSETS = `Shared artwork catalog
assets list [--kind shapes|icons|brands] [--search TEXT] [--limit N]
  Returns stable IDs, names, categories and provenance without SVG path payloads.
assets show ID [--format json|svg] [--out FILE]
  JSON includes the complete validated vector usable in layer.update or
  block.create with makeLayer-equivalent fields from document schema. SVG is
  ready to embed in HTML/TSX and retains compound colors and license metadata.
Examples: brand-figma, brand-microsoft, lucide:mail, rectangle, gallery-1.
Reviewed brand marks are available. Their collection licenses do not
grant trademark rights or imply endorsement. Brand sources/credits are included.
User-imported SVGs belong to each exported document, not a hidden global bank;
inspect its block.design.vector to reuse those embedded paths and attribution.
`;
const SCREENSHOT = `Visual feedback
screenshot PROJECT --out preview.png [--page SELECTOR] [--width PX] [--height PX]
PROJECT resolves only to a JSON file (name or path), never browser IndexedDB.
Uses Chromium from Playwright, loaded only for this command. Install once:
  bunx playwright install chromium
The CLI builds the actual portable HTML, opens it in a fresh isolated browser
and opaque sandboxed iframe, waits for React content, fonts and image decoding,
then captures the full document, or one native page selected by --page (number,
ID or exact name). Its own size is used unless --width/--height override it.
No dev server or credentials are required.
Network requests are blocked; use embedded offline assets. Width/height default
to canvas dimensions or 794×1123 CSS px. Width is bounded to 100–5000; the full
captured height is bounded to 10000. Output is PNG, with dimensions and blocked
request URLs in the JSON result. A screenshot failure leaves no partial PNG.
`;
const COMMANDS = `Engine commands
commands lists every current runtime-validated operation, directly from the
engine command schema. document schema returns full fields, bounds and enums.
document apply PROJECT patch.json [--out FILE] accepts:
{
  "version": 1,
  "actor": { "kind": "agent", "name": "Codex" },
  "commands": [{ "type": "document.update", "name": "Design application" }]
}
Batches are atomic: one invalid command rejects every edit. Up to 100 commands
per batch. IDs are explicit; inspect the document before generating commands.
Operations include sections/blocks, page/layers/groups, rich-text ranges,
styles/effects, HTML/React source activation and CV language variants. The
versioned schema is the authority for all fields and invariants.
`;
const PDF = `PDF rendering and text verification
output PROJECT --format pdf [--pages SELECTOR] --out Resume.pdf
output PROJECT --format pdf [--pages SELECTOR] --out-dir pdf-pages
  (alias: document render PROJECT --format pdf --out Resume.pdf)
Uses the same portable renderer as the app for canvas, HTML and React/TSX.
A local, disposable Chromium renders the current source in an opaque sandbox;
a separate inert print document preserves text, vectors, links and embedded fonts.
Images are optimized in the print copy. Positive letter spacing is reset only
in print so tracked headings extract as coherent words; the app uses the same rule.
No skill, dev server, account or remote PDF service is needed. Chromium is installed once: bunx playwright install chromium.

Visual documents export every page in canvas order by default, with its own size
and layers. --pages 2,1 preserves selection order. --out combines selected pages;
--out-dir creates one PDF per selected page with safe numbered filenames.
Empty pages are valid when the extracted page is also empty and the count matches.
Every PDF is read back with local PDF.js. The JSON response includes page count,
page text/links, missing/unexpected text, reading-order and spacing checks against
the actual rendered page. A mismatch returns exit 3 and PDF_TEXT_MISMATCH while
keeping the complete PDF(s) so you can inspect and correct the layout. Separate
PDF exports check every file and aggregate failures into exit 3; all files remain.
Successful text verification means selectable text is coherent with the app;
it is not a guarantee that every proprietary applicant tracking system accepts it.
Fix the source/layers and render again if text is missing, joined or reordered.
The input project is never changed. Browser projects must be exported as JSON first.
`;
const AGENT = `ResumI agent quick start (offline)
A project can contain a CV, cover letter, portfolio or other independent pages.
Browser projects are private local IndexedDB: export JSON before using the CLI.
1. Discover: capabilities; templates list; assets list; commands; document schema.
2. Start: new --blank --name "Application" --out application.json for editable
   pages from the CLI; or new --template react-classic for a source starter.
   --blank and --template cannot be combined; --blank has no saved source.
3. Inspect: document inspect application; pages application.
4. Edit through document apply application patch.json --out application.json.
   Batches are runtime-validated and atomic; read the schema for exact fields.
   Engine page.create adds arbitrary-sized pages, not automatic CV pagination.
   Create sections, then block.create (omit design for engine defaults).
   Use layer.update for geometry/styles and layer.moveToPage for page ownership.
   --blank already enables the canvas; there is no canvas.enable step.
5. Export: output application --format html --out review.html.
   output application --format pdf --pages 1,2 --out Application.pdf.
   output application --format tsx --pages 2 --out CoverLetter.tsx.
   screenshot application --page 2 --out CoverLetter.png.
6. Validate and inspect output; PDF reports actual selectable text per page.

Use docs pages/exports for selection and split exports; docs source for HTML/TSX;
docs assets for graphics; docs commands for mutations; docs pdf for text checks.
All help is shipped offline: docs all. No auth, network or production access.
Optional: docs agent --source github fetches only the public repository guide
with a 10-second timeout and no credentials. HTTP errors suggest offline help.
Repository guide: https://github.com/ExtraBinoss/ResumI/blob/main/docs/agents.md
`;
const PAGES = `Project pages: CV + cover letter + anything else
pages PROJECT (alias document pages PROJECT) lists number, id, exact name,
width, height and background for each editable page. Original page: page-1.
Active source has no inspectable native page selection; prepare its canvas in
the app first. Whole-source HTML/PDF and exact --format source remain available.

Start an empty editable canvas: new --blank --name "Application" --out application.json.
--blank cannot be combined with --template. It has page-1 and no saved source.
Create a cover-letter page using an atomic engine batch, for example:
{
  "version":1,"actor":{"kind":"agent","name":"Application agent"},
  "commands":[{"type":"page.create","page":{"id":"letter",
    "name":"Cover letter","width":794,"height":1123,"background":"#ffffff"}}]
}
Use document apply application patch.json --out application.json. The blank
starter already has an editable canvas and inactive source. Read document schema for block.create,
layer.moveToPage and page.update. Add text with block.create design.pageId set
to letter, or move existing layers using layer.moveToPage; move a whole group.
The first page can hold a CV and the second a cover letter, with independent size.

--pages SELECTOR accepts all (default), 1-based numbers, ascending ranges,
comma-separated selections, exact IDs or names; selection order is preserved.
Examples: --pages 2; --pages 2,1; --pages 1-3; --pages id:letter;
--pages "name:Cover letter". Use id: or name: to disambiguate numeric/ID-like names.
Duplicate selections, ambiguous names, unknown pages and invalid ranges fail
before any file is written. A page may appear only once in an export.
Screenshot uses --page with exactly one selector, not --pages.
`;
const EXPORTS = `Granular exports (the input project is never changed)
output PROJECT --format pdf|html|tsx|react [--pages SELECTOR]
  [--out FILE | --out-dir DIR]
--out: one file containing all selected pages, in selection order.
--out-dir: one standalone file per selected page, preserving each page's size,
fonts, images, groups, language and links. Safe filenames use the original page
number plus a normalized name, e.g. 02-cover-letter.pdf; duplicate names stay
unique and unsafe path characters are removed. Existing export targets are
replaced when explicitly requested; the input project cannot be an export target.
--out and --out-dir cannot be combined. PDF requires one of these destinations;
HTML and TSX may print to stdout. render is an alias requiring a destination.

output application --format pdf --pages 2 --out CoverLetter.pdf
output application --format pdf --pages 1,2 --out Application.pdf
output application --format pdf --pages all --out-dir pdf-pages
output application --format html --pages 2,1 --out Application.html
output application --format html --out-dir html-pages
output application --format tsx --pages 2 --out CoverLetter.tsx
output application --format react --out-dir react-pages

HTML is standalone portable rendered output. TSX (alias react) snapshots current
editable canvas pages into a standalone React component. Exact saved code is a
different operation: output PROJECT --format source --out Original.tsx; this
returns the saved source, even when inactive, without projecting live canvas edits.
JSON preserves the complete engine project. JSON/source cannot select or split
pages. Active source exports as a whole; subset/split/TSX exports require canvas.
`;
const topics: Record<string, string> = {
  agent: AGENT,
  design: DESIGN,
  source: SOURCE,
  assets: ASSETS,
  screenshot: SCREENSHOT,
  pdf: PDF,
  commands: COMMANDS,
  pages: PAGES,
  exports: EXPORTS,
};
export function help(topic?: string) {
  return topic === "all"
    ? [HELP, ...Object.values(topics)].join("\n")
    : (topics[topic ?? ""] ?? HELP);
}
