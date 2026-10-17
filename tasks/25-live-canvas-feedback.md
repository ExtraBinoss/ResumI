# 25 — One workspace mode, live color and multiple selection

## Scope

Remove the source-only Fit page/100% toolbar. An active HTML/React composition belongs to Visual and uses the same bottom zoom controls and gesture controller. Keep source authoring and its sandbox intact. Fix immediate color feedback on editable layers, plus Ctrl/Cmd selection and grouped movement with guides.

The user confirmed that the color and grouping issues concern editable layers, rather than an arbitrary React/HTML source composition. No automatic source-to-layer conversion is introduced.

## Acceptance and evidence

- [x] Exactly one Visual/Text mode is selected for an active source template. Clicking the active Visual mode cycles to Text through validated existing commands; saved source remains recoverable.
- [x] No source Fit page/100% bar. Bottom zoom and Ctrl/Cmd+wheel control the source surface with the shared controller. Initial fit runs once per editor, preserving user zoom after resize, dialogue use and source reactivation.
- [x] Moving a color control previews immediately on the relevant layer, range or surface, without committing document/history on every pointer event. Release commits one validated edit; cancellation/selection change restores transient paint.
- [x] Ctrl/Cmd/Shift selection works consistently on canvas and Layers, including leaving a previous text edit. Grouping, movement, snapping guides and Undo remain coherent.
- [x] Targeted interaction journeys, full project check and literal visual check pass; actual resulting desktop/mobile controls and live canvas screenshots opened and inspected.

The canonical document remains in the Jotai session. Transient DOM paint is reversible interaction state. Document changes still use runtime-validated engine commands; source code never enters the application's origin.

Targeted production verification: native partial-word preview → commit → text editing → reload; color drag before release with Undo still disabled; one commit/Undo after release; valid HEX preview with uppercase original restored by Escape without history; Ctrl/Cmd canvas/list selection and one-step snapped group movement; source Visual/dock zoom at 1440px and 390px including resize/reactivation. All targeted cases pass. Actual [live color](../artifacts/visual/live-color-before-release.png), [group guide](../artifacts/visual/group-guides-live.png), [desktop source](../artifacts/visual/source-workspace-1440.png) and [mobile source](../artifacts/visual/source-workspace-390.png) captures were opened and inspected. Mobile title shrink/ellipsis prevents Undo/Redo overlap, and the export disclosure remains visible. Repository-wide gates are recorded below.

Final integrated verification: `bun run check` exits 0 (137 unit tests, 76 engine coverage tests at 99.70% lines / 99.52% functions, five cold-development journeys, production build and 80 Chromium journeys). Literal `bun run visual:check` passes twelve journeys. Actual production screenshots, DOM/CSS and portable outputs were opened and inspected; see [verification](../docs/verification.md).
