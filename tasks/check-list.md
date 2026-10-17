# Master acceptance checklist

Source of progress truth. Checkmarks describe verified local behavior; remote CI and production deployment are separate. Evidence: [verification](../docs/verification.md).

## Foundation and original milestone

- [x] [00 — Discovery/foundation](00-discovery-and-foundation.md): real React Router SSR and Cloudflare Worker build; legacy repository unchanged.
- [x] [01 — Generic engine](01-engine.md): shared validated human/agent commands, immutable atomic failures, 44 engine tests, 99.59% lines / 99.38% functions.
- [x] [02 — CV renderer](02-cv-renderer.md): actual standalone structured/freeform HTML, shared styling, React templates and offline source rendering.
- [x] [03 — IndexedDB](03-projects-indexeddb.md): complete CRUD/import/export, independent copies, real migration, serialized saves, offline edit and stale-tab protection.
- [x] [04 — Public pages](04-landing-page.md): meaningful SSR, real create CTA, working template catalog, inspected desktop/mobile layouts.
- [x] [05 — Editor](05-editor-and-ux.md): real content/style editing, section/block CRUD and history; expanded by task 11.
- [x] [06 — Agent/CLI](06-agent-cli.md): validate/preview/apply/undo, actual CLI/schema/rendered exports and reviewable agent batches.
- [x] [07 — Browser/visual QA](07-visual-qa.md): synthetic screenshots and rendered DOM/CSS opened and inspected; complete interaction journeys.
- [x] [08 — Delivery](08-hardening-and-release.md): strict gates, docs, source policy, feature branch and [PR #1](https://github.com/ExtraBinoss/ResumI/pull/1).

## User-requested expansion

- [x] [09 — Profile/fast creation](09-profile-and-fast-creation.md): baseline and final Chrome traces; warmed median 611ms → 366ms; one creation route and side-effect-free intent prefetch.
- [x] [10 — Floating workspace/dashboard](10-floating-workspace-and-dashboard.md): dock/context panels, saved previews, continue editing, search, sort and grid/list.
- [x] [11 — V1 creative workspace](11-v1-workspace-parity.md): layers, flat groups, geometry, drag/resize/snapping/pan, blend/opacity/effects, typography/ranges, fonts, image/shape tools and Text mode.
- [x] [12 — shadcn with Base UI](12-shadcn-base-ui.md): official CLI, 18 editable components, no Mantine/Radix imports or dependencies.
- [x] [13 — React/HTML source](13-react-and-html-source.md): React-authored templates, isolated source preview, saved activation, hooks, portable offline exports and shared agent commands.

Tasks 00–13 record earlier verified milestones. Tasks 14–17 supersede their interface and file organization. Current verification is recorded below.

## Required gates

- [x] One framework-free document engine and one canonical Jotai session; stable block selectors.
- [x] All document mutations runtime-validated, with atomic batches and shared asset/content budget.
- [x] Real IndexedDB lifecycle, migration, denied-storage errors and stale-tab protection.
- [x] Strict TS, Hooks/Compiler lint and <600-line source scanner, including boundary tests.
- [x] Engine coverage exceeds 85% lines/functions with all sources included.
- [x] Actual desktop/mobile screenshot inspection and standalone exports opened offline.
- [x] Fresh-cache development SSR, direct/reload hydration regression and no hooks/PostCSS warning suppression.
- [x] Code preview uses opaque iframe/CSP; CLI compiles without executing user components.
- [x] Current `bun run check`: 96 unit tests, 66 engine tests, five cold-dev and 32 production browser journeys, plus production build.
- [x] Literal `bun run visual:check`: three journeys pass; final desktop/mobile, light/dark and complete A4 screenshots opened and inspected.
- [x] Feature branch and PR established; remote verification is tracked separately on the PR and inspected at delivery.

## Explicit boundaries

- [ ] Production deployment, DNS and credentials — outside the authorized delivery.
- [ ] Auth/cloud synchronization, provider inference, native integrations, MCP/WebMCP — future work.
- [ ] Automatic multipage pagination, nested groups, dedicated PDF service and broad browser/device/accessibility certification — future work.
- [ ] Automatic bidirectional arbitrary HTML/React-to-layer conversion or arbitrary npm project execution — outside this source-editor contract.

Local browser storage and session-local undo limitations are described in the README. Tasks 00–08 record the initial scope; tasks 09–13 supersede its earlier freeform/library deferrals.

## Current interface revision

- [x] [14 — Vue interface and polish](14-vue-interface-and-polish.md): actual reference UI, permanent panels, native editing, image decorations, settings/Motion and dashboard.
- [x] [15 — Feature organization](15-feature-organization.md): dashboard/editor/canvas ownership, colocated styles and verified imports.
- [x] [16 — macOS design](16-macos-design.md): shared materials, coherent controls, centered document title and numeric steppers.
- [x] [17 — Apple product and templates](17-apple-product-and-templates.md): substantial landing/library redesign and distinct professional TSX resumes with offline imagery.
