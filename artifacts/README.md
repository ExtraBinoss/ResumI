# Verification artifacts

Synthetic documents only. `check.log` is the actual output of the successful combined local check. Reproduce with `bun run check`.

- `visual/`: desktop/mobile screenshots captured from the actual production Worker preview and opened for visual inspection. Reproduce with `bun run build && bun run test:e2e`.
- `rendered/landing.html`, `editor.html` and `agent-review.html`: rendered browser DOM snapshots; these reference application assets and are not standalone application exports.
- `rendered/resume.html`: actual self-contained CLI HTML/CSS export, rendered independently in a browser.
- `rendered/sample.json`: the synthetic document used for the standalone HTML export.
- `rendered/commands.schema.json`: generated real versioned command schema.
- `rendered/canvas-computed.json`: browser-computed dimensions, styles and rendered content.
- `performance/interactions.json`: measured local opening and input round trips; includes Playwright overhead and varies by host load.

Screenshots use deterministic filenames. Browser tests overwrite them on each run; they are evidence, not golden-image regression assertions. See [verification record](../docs/verification.md).

The extra `agent-review-desktop.png` was captured separately from the built preview: open `/editor`, choose Teammate → Load a working example → Validate & preview, then capture the 1440×1000 viewport. It was actually opened and inspected.
