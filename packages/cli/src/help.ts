export const HELP = `ResumI — portable resume tools for humans and agents
Usage: bun run resumi <command> [arguments]

  new [--template ID] [--name NAME] [--out FILE]
  output PROJECT [--format json|html|source|pdf] [--out FILE]
  screenshot PROJECT --out FILE.png [--width PX] [--height PX]
  templates [list|inspect ID]       Discover real React and canvas starters
  assets list [--kind shapes|icons|brands] [--search TEXT] [--limit N]
  assets show ID [--format json|svg] [--out FILE]
  commands                         List every validated engine operation
  capabilities                     Machine-readable features and boundaries
  help [design|source|assets|commands|screenshot|pdf]

Document commands (existing automation remains compatible):
  document create [--template ID] [--name NAME] [--out FILE]
  document inspect PROJECT          Complete normalized document and IDs
  document validate PROJECT         Check schema, ownership and asset budgets
  document apply PROJECT PATCH [--out FILE]   Apply an atomic v1 batch
  document source PROJECT --file Resume.tsx [--out FILE] [--actor NAME]
  document render PROJECT --format html|pdf --out FILE
  document output PROJECT [--format json|html|source|pdf] [--out FILE]
  document screenshot PROJECT --out FILE.png [--width PX] [--height PX]
  document schema                   Complete versioned command JSON Schema

PROJECT is a JSON path or filename without .json, relative to the working
directory. Browser projects must be exported first; no private browser access.
Use: templates → new → inspect → apply/source → output → screenshot → import.
PDF: output PROJECT --format pdf --out Resume.pdf renders and checks its text.
Read help design for typography, layout, brand assets and an agent workflow.
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
Source is a preserved representation, not a reverse-converted editable canvas.

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
Use output --format source to retrieve exact code, --format html for a complete
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
screenshot PROJECT --out preview.png [--width PX] [--height PX]
PROJECT resolves only to a JSON file (name or path), never browser IndexedDB.
Uses Chromium from Playwright, loaded only for this command. Install once:
  bunx playwright install chromium
The CLI builds the actual portable HTML, opens it in a fresh isolated browser
and opaque sandboxed iframe, waits for React content, fonts and image decoding,
then captures the full document. No dev server or credentials are required.
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
output PROJECT --format pdf --out Resume.pdf
  (alias: document render PROJECT --format pdf --out Resume.pdf)
Uses the same portable renderer as the app for canvas, HTML and React/TSX.
A local, disposable Chromium renders the current source in an opaque sandbox;
a separate inert print document preserves text, vectors, links and embedded fonts.
Images are optimized in the print copy. Positive letter spacing is reset only
in print so tracked headings extract as coherent words; the app uses the same rule.
No skill, dev server, account or remote PDF service is needed. Chromium is installed once: bunx playwright install chromium.

Visual documents export every page in canvas order with its own size and layers.
Every PDF is read back with local PDF.js. The JSON response includes page count,
page text/links, missing/unexpected text, reading-order and spacing checks against
the actual rendered page. A mismatch returns exit 3 and PDF_TEXT_MISMATCH while
keeping the complete PDF at --out so you can inspect and correct the layout.
Successful text verification means selectable text is coherent with the app;
it is not a guarantee that every proprietary applicant tracking system accepts it.
Fix the source/layers and render again if text is missing, joined or reordered.
The input project is never changed. Browser projects must be exported as JSON first.
`;
export function help(topic?: string) {
  return (
    (
      {
        design: DESIGN,
        source: SOURCE,
        assets: ASSETS,
        screenshot: SCREENSHOT,
        pdf: PDF,
        commands: COMMANDS,
      } as Record<string, string>
    )[topic ?? ""] ?? HELP
  );
}
