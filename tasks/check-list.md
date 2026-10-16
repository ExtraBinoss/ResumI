# Master acceptance checklist

Only verified behavior receives a checkmark.

- [ ] [Discovery and foundation](00-discovery-and-foundation.md): Stack installs; nested routes server render; V1 remains untouched.
- [ ] [Generic document engine](01-engine.md): CRUD, deterministic commands, failures and undo/redo preserve invariants.
- [ ] [CV domain and renderer](02-cv-renderer.md): Canvas and exported HTML have identical semantic content and styling.
- [ ] [Local project repository](03-projects-indexeddb.md): Create, reopen, rename, duplicate, import, delete and reload work; stale saves fail.
- [ ] [Public landing page](04-landing-page.md): Tagline is in server HTML; CTA creates a persistent project; responsive layout has no overflow.
- [ ] [Visual editor](05-editor-and-ux.md): All visible controls work; edits autosave and survive reload; missing projects recover gracefully.
- [ ] [Agent command interface](06-agent-cli.md): Create, inspect, validate, apply and render run without browser or credentials; invalid batches are atomic.
- [ ] [Browser and visual QA](07-visual-qa.md): Screenshots actually viewed; SSR/hydration and CRUD flows pass; evidence retained.
- [ ] [Hardening and delivery](08-hardening-and-release.md): Combined check passes, coverage >=85% lines/functions, every handwritten source <600 lines.

## Hard gates

- [ ] Human/agent command parity and complete section/block CRUD.
- [ ] Local project CRUD, migrations, persistence and stale-write safety.
- [ ] Real SSR and hydration; nested navigation.
- [ ] Desktop/mobile screenshots opened and rendered HTML inspected.
- [ ] Engine line/function coverage >=85%, including unimported sources.
- [ ] Generic source scan rejects 600+ lines.
- [ ] Full combined check and production Worker build pass.
- [ ] Documentation and limitations reflect verified implementation.
