The two PDFs are local Chromium-generated, synthetic test fixtures. They contain
no personal CV data. No browser, renderer or external service runs in these tests.

`pdf-text-chromium.pdf`: two A4 pages, embedded Noto Sans, French accents and œ,
Greek, Cyrillic, ligatures, bold/italic spans, a word split across inline styles,
email/HTTPS annotations, and repeated tokens. Expected text is in the unit test.

`pdf-no-text-chromium.pdf`: one A4 page with a solid CSS rectangle and no text.
It verifies that graphics alone cannot pass text readability checks.

Generated through Playwright's local Chromium `page.pdf()` with `format: A4` and
print backgrounds. The text fixture uses tagged output and embedded, licensed
Noto Sans. Font source/license: https://github.com/notofonts/noto-fonts

The production inspector uses PDF.js content extraction, not a custom PDF syntax
parser, text inferred from source data, image OCR, or a screenshot.
