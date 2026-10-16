# 13 — React templates and HTML/React resume source

## Goal and scope

Author repository templates in React and allow people/agents to edit HTML or React resume source. Keep a preserved canvas representation and one validated document history. Arbitrary npm projects and automatic two-way source-to-layer conversion are outside this scope.

## Dependencies and files

Tasks 01–12; CV React templates, separate SSR entry, source compiler/runtime, engine source schema/commands, CodeEditor, sandboxed preview, CLI and template catalog.

## Implementation checklist

- [x] Repository-authored TSX templates, SSR-only renderer entry and editable React starters.
- [x] Validated source and `source.set`/`source.activate`/`source.clear` commands shared by human and agent workflows.
- [x] View switching preserves saved source/activation after reload; first projection/deactivation forms one undo step.
- [x] Explicit draft creation, editing, apply/preview, HTML/TSX import and original-source/portable-HTML exports.
- [x] Opaque iframe preview, restrictive CSP, offline bundled React runtime and no server-side user component execution.
- [x] React Studio/React Editorial catalog and project creation.
- [x] Sandboxed lazy dashboard source previews.
- [x] Engine/CV/CLI/state tests and real browser journeys, including hooks and offline HTML execution.
- [x] Standalone exports and Code mode screenshots actually opened and inspected.

## Acceptance and verification

Applying valid source changes the real preview and persists through reload. Invalid TSX preserves the applied preview. Visual/Text preserve saved code; Code reactivates it. Exported React works offline; CLI compilation never executes user code. `bun run check` includes source tests and browser journeys. [Portable inspection](../artifacts/rendered/portable-inspection.json) records actual 794 × 1123px rendering with no runtime errors.

## UX, performance and accessibility

Draft errors are actionable. Switching format creates a replacement draft without silently deleting saved code. Source editor and preview are named, keyboard-editable and responsive. Compiler/runtime load only when needed.

## Risks and decisions

Only single-file React imports are available. External resources and application storage/DOM access are blocked in preview. A standalone exported React file executes its component in the browser. See the full [source contract](../docs/code-templates.md).

## Status

Done — implementation, combined local gate and visual inspection complete.
