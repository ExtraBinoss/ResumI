# Master acceptance checklist

Source of progress truth. Checkmarks below describe verified local behavior, not production release. Evidence: [verification](../docs/verification.md).

## Workstreams

- [x] [Discovery and foundation](00-discovery-and-foundation.md): Production build emits client and SSR Worker; server HTTP responses contain actual route content. V1 has exactly its pre-existing PDF/untracked file changes.
- [x] [Generic document engine](01-engine.md): 12 engine tests pass; 100% measured line/function coverage. Equivalent human/agent commands produce equal documents; failed batches preserve the original.
- [x] [CV domain and renderer](02-cv-renderer.md): Standalone HTML renders 14 synthetic blocks with actual text and shared CSS. Renderer escaping and template behavior pass; portable screenshot opened.
- [x] [Local project repository](03-projects-indexeddb.md): CRUD/reopen, migration, independent copies and stale writes pass in unit and browser tests. Failed tab save retains exportable in-memory changes; offline edit survives online reload.
- [x] [Public landing page](04-landing-page.md): Server HTML contains the hero, catalog and document preview. CTA creates a project. All logo requests load; 390px layouts pass overflow assertions and were visually inspected.
- [x] [Visual editor](05-editor-and-ux.md): Critical interaction journeys pass, including keyboard history, styles after reload and block CRUD. Desktop/mobile editor screenshots opened. Timing samples are retained, not described as field benchmarks.
- [x] [Agent command interface](06-agent-cli.md): CLI handler tests cover successes and argument, validation and file errors. Real CLI sample/schema/HTML artifacts were generated; browser proposal preview, reject, apply and undo pass.
- [x] [Browser and visual QA](07-visual-qa.md): 12 Playwright checks pass on production Worker preview. Screenshots and DOM/CSS artifacts are saved and actually opened. Public layouts show no horizontal overflow.
- [x] [Hardening and delivery](08-hardening-and-release.md): Combined local check passes; feature commit pushed and [PR #1](https://github.com/ExtraBinoss/ResumI/pull/1) opened.

## Hard gates

- [x] Shared human/agent command semantics, atomic validation and section/block CRUD.
- [x] Project create/read/open/save/rename/duplicate/delete, reload and validated import/export.
- [x] IndexedDB versioning, real-browser migration, offline edits and stale-tab protection.
- [x] Actual SSR, direct nested routes and clean hydration on production Worker preview.
- [x] Fresh-cache development SSR/hydration and editor regression checks; explicit Compiler/lazy-dependency pre-bundling.
- [x] Granular block subscriptions and measured interaction evidence.
- [x] Desktop/mobile screenshots opened; real rendered HTML/CSS inspected.
- [x] Engine coverage 100% lines/functions, exceeding enforced 85% thresholds with all sources imported.
- [x] Generic scanner enforces <600 lines, with exclusions and threshold tests.
- [x] Combined local check, strict types, lint, tests, production build and browser checks pass.
- [x] README, AGENTS, ADRs and numbered tasks document actual implementation and deferrals.
- [x] Feature commit and [pull request #1](https://github.com/ExtraBinoss/ResumI/pull/1) created.

## Explicitly outside this milestone

- [ ] Production deployment, DNS and credentials — not authorized by this brief.
- [ ] Provider inference, native integrations, remote MCP/WebMCP and authenticated live sync — future work.
- [ ] Automatic pagination, dedicated PDF service, rich/freeform layout and cross-browser certification — future work.

These are documented deferrals, not blockers to the initial vertical slice.
