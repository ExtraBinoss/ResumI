export const CONTRAST_HELP = `Contrast: inspect every element and get actionable recommendations
contrast PROJECT [--level AA|AAA] [--pages SELECTOR] [--locale CODE|all]
  [--out contrast-report.json]
  (alias: document contrast PROJECT ...)

Examples:
  bun run resumi contrast application
  bun run resumi contrast application --pages 2,1 --locale all --level AAA
  bun run resumi contrast application --out output/contrast-report.json

The report is read-only and offline. A valid audit returns exit 0 even when
it finds issues: inspect textPassed and reports[].summary instead of treating
the process exit code as a contrast grade. Invalid arguments/documents and I/O
errors retain the normal CLI exit codes. --out saves the JSON report and cannot
overwrite the input project. Reports contain document text: keep private reports
in ignored output/ or outside the repository.

What it covers
- All project blocks, every native page and flat group, including hidden/empty
  elements marked skipped. Page selection uses the same IDs/names/ranges as output.
- Actual page background, z-order, uniform solid backing shapes, color alpha,
  layer opacity and group compositing. Backgrounds on other pages are ignored.
- Every mixed-style text range, not just the layer's base color. Each run includes
  offsets, text, specified/effective colors, ratio, requiredRatio and passed.
- The active document language by default; --locale all checks each declared
  language, including its own translated text and marks. Fallback text is checked
  as it actually appears. Interface language does not alter the audit.
- Shapes, icons, brands and photos remain in the element inventory with their
  paint colors and recommendations for visual/semantic review. They do not get a
  fabricated text grade. textPassed describes native text only, not all graphics
  or overall WCAG conformance.
Use document inspect PROJECT for complete layer properties, embedded graphics,
gradients and vector color modes; document schema defines their validated edits.

WCAG text requirements
AA: normal text >=4.5:1; large text >=3:1.
AAA: normal text >=7:1; large text >=4.5:1.
Large means >=24 CSS px, or >=18.6666666667 CSS px with weight >=700.
Use the exact 14pt = 14*96/72 CSS px boundary; displayed decimals are explanatory.
Threshold comparisons use unrounded ratios: 4.499:1 does not pass 4.5:1.
The ratio measures relative luminance, not hue/saturation alone. Thin fonts can
still be difficult to read; leave a margin above the threshold. Zoom does not
turn small document text into large text for this calculation.

How to correct an issue
1. Find reports[].elements by id, pageId and groupId. Read every failing/review
   run, its actual foreground/background and its required ratio.
2. Prefer a nearby darker or lighter text color. Verified recommendations search
   from the original RGB toward black/white, then apply the proposed engine batch
   to an immutable trial document and audit that exact range again. A proposed
   patch exists only when the measured result reaches the chosen AA/AAA target.
3. recommendations[].patch is a complete v1 command batch. Save ONE chosen patch
   to patch.json, inspect it, then run:
     bun run resumi document apply application patch.json --out application.json
   Range formatting preserves bold, italic, links and other colors outside that
   range. Original locks are restored. Locale-aware patches explicitly select
   their document language. A color may become opaque; an opacity-and-color
   recommendation also changes layer/group opacity and affects every member of
   that group. The audit never applies these changes itself.
4. Re-run contrast after each chosen correction. Patches are independent proposals
   for the current document, not one auto-mergeable global fix. Review shared group
   changes and mark limits; a full formatting budget may require simplifying marks.
5. Run screenshot PROJECT --page 1 --out output/review.png and export the PDF.
   Contrast is separate from ATS/text-coherence validation in PDF export.

Unknown results need work, not a guessed pass
Image/gradient backgrounds, overlapping content, non-normal blend modes, filtered
backdrops and transparent page backgrounds may make a numeric grade unsafe.
The report explains the reason and suggests a solid opaque text backing, moving
overlapping content, normal blending, removing filters or setting an opaque page.
Active HTML/TSX source and structured documents without canvas geometry require
visual review or materialization to editable canvas layers in the app, followed
by a JSON export and another CLI audit. The CLI cannot read private browser storage.

Meaningful non-text graphics generally need 3:1 against adjacent colors (WCAG
1.4.11); decorative artwork and logos have different requirements/exemptions.
Classify purpose before changing brand colors. Check relevant paints/regions in
the screenshot, recolor a meaningful icon, or add a contrasting stroke/backing.
Never assume one average image color proves contrast across all its regions.

Primary references:
https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html
https://www.w3.org/WAI/WCAG22/Understanding/contrast-enhanced.html
https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html
`;
