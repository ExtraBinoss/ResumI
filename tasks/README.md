# ResumI execution plan

The source of progress truth is [check-list.md](check-list.md). Tasks execute in dependency order; document deferrals explicitly. No production deployment is authorized.

- [00-discovery-and-foundation — Discovery and foundation](00-discovery-and-foundation.md), dependencies: None.
- [01-engine — Generic document engine](01-engine.md), dependencies: 00.
- [02-cv-renderer — CV domain and renderer](02-cv-renderer.md), dependencies: 01.
- [03-projects-indexeddb — Local project repository](03-projects-indexeddb.md), dependencies: 01, 02.
- [04-landing-page — Public landing page](04-landing-page.md), dependencies: 00, 02, 03.
- [05-editor-and-ux — Visual editor](05-editor-and-ux.md), dependencies: 01, 02, 03.
- [06-agent-cli — Agent command interface](06-agent-cli.md), dependencies: 01, 02.
- [07-visual-qa — Browser and visual QA](07-visual-qa.md), dependencies: 04, 05, 06.
- [08-hardening-and-release — Hardening and delivery](08-hardening-and-release.md), dependencies: 00–07.

## Follow-up requested in this session

- [09 — Profile and fast creation](09-profile-and-fast-creation.md)
- [10 — Floating workspace and dashboard](10-floating-workspace-and-dashboard.md)
- [11 — V1 creative workspace parity](11-v1-workspace-parity.md)
- [12 — shadcn controls with Base UI](12-shadcn-base-ui.md)
- [13 — React templates and HTML/React source](13-react-and-html-source.md)
- [14 — Vue interface and polish](14-vue-interface-and-polish.md)
- [15 — Feature organization](15-feature-organization.md)
- [16 — macOS design](16-macos-design.md)
- [17 — Apple product and templates](17-apple-product-and-templates.md)
- [18 — Editor interaction refinement](18-editor-interaction-refinement.md)
