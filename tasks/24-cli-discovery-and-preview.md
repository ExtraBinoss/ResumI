# 24 — Discoverable CLI and visual feedback

## Scope

Give humans and agents a complete CLI guide to the available commands, editing capabilities, HTML/CSS/TSX workflow, templates and shared vector assets. Provide usable JSON/HTML/source output and a real screenshot command so an agent can inspect its result.

## Acceptance and evidence

- [x] Help documents actual commands, capabilities, inputs, outputs and useful examples rather than undocumented aliases.
- [x] Projects resolve through explicit filesystem files/names; CLI never claims access to the browser's private IndexedDB.
- [x] One pure shared bank supplies shapes, icons and vetted brands to both UI and CLI, including IDs, original colors, SVG output and licenses.
- [x] Project creation, source changes and other document mutations use runtime-validated engine commands.
- [x] JSON and portable HTML/source output work on a synthetic project with readable errors for invalid inputs.
- [x] Screenshot renders actual portable output with loaded assets, correct page dimensions and isolated browser cleanup; missing-browser instructions are actionable.
- [x] Help and simple JSON paths do not eagerly load browser/React rendering dependencies.
- [x] CLI examples are executed, resulting PNG/HTML/JSON artifacts inspected, targeted tests and full project gates pass.

Filesystem projects are an explicit interface. Browser-local storage, production deployment and remote account credentials remain outside this CLI contract.

## Targeted verification

The CLI exposes `new`, `output`, `screenshot`, template list/inspect, assets list/show, schema-derived `commands`, `capabilities` and five focused help topics. Existing document commands remain compatible. Source import runs `source.set` through the engine and rejects invalid TSX before writing. The pure shared `packages/assets` bank supplies the editor and CLI without copying paths/colors into a second catalog.

Executed the actual Bun entry point: help, `new --template react-profile`, JSON/HTML output and `screenshot`; then repeated creation/output/capture with the new `react-cobalt` template. [Cobalt document JSON](../artifacts/rendered/cli-cobalt.json), [portable HTML](../artifacts/rendered/cli-cobalt.html), [Cobalt PNG](../artifacts/visual/cli-cobalt.png), [Profile HTML](../artifacts/rendered/cli-profile.html) and [Profile PNG](../artifacts/visual/cli-profile.png) are synthetic evidence. Both PNGs were opened and inspected: 794 × 1123, readable typography, Profile portrait and original-color Cobalt tool marks; no blocked external requests.

CLI/asset tests cover command/feature discovery, template and full-color brand extraction, filename resolution, raw outputs, source validation/atomic file behavior, capture adapter errors and all shared vectors against the engine schema. Real Chromium tests execute TSX/hooks inside an opaque frame, decode an embedded Figma SVG, prove parent-DOM access is rejected, abort a network request even without source CSP and reject a broken embedded image. A Bun import guard rejects React/ReactDOM/Playwright/Sucrase imports while actual CLI help and JSON output still pass, proving lazy loading. Browser capture closes in `finally`; all capture processes finished.

Twelve targeted tests pass (including the real capture and lazy-import guard); strict TypeScript and targeted ESLint pass. Tests and static-check logs are recorded in `artifacts/cli-check.log`. Repository-wide verification is recorded below.

Final integrated verification: `bun run check` exits 0 (137 unit tests, 76 engine coverage tests at 99.70% lines / 99.52% functions, five cold-development journeys, production build and 80 Chromium journeys). Literal `bun run visual:check` passes twelve journeys. Actual production screenshots, DOM/CSS and portable outputs were opened and inspected; see [verification](../docs/verification.md).
