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
