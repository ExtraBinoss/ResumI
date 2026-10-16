# ResumI — Engineering Handoff for Codex Cloud

> **Project:** ResumI  
> **Product:** AI-native, agentic resume editor  
> **Brand line:** **“Your resume just got a new teammate.”**  
> **New repository:** `ResumI`  
> **Legacy reference (read-only):** `CV-creator` — Vue + Bun V1  
> **Intended hosting:** Cloudflare Workers  
> **Parent domain:** `plinka.eu`  
> **Status:** Implementation brief — build a working first vertical slice

---

## Mission

You are the lead software engineer responsible for building **ResumI**, a new AI-native resume creation platform.

You are working in the new GitHub repository named **`ResumI`**. You also have access to an older repository, **`CV-creator`**, containing a V1 built with **Vue and Bun**.

**This is a new project, not an automatic migration.** Inspect `CV-creator` first to understand its capabilities, data models, rendering techniques, useful algorithms, UX decisions, and limitations. Reuse only ideas or code that genuinely fit the new architecture. Treat the old repository as **read-only**; all changes belong in `ResumI`. If access to `CV-creator` is unavailable, document that constraint and continue.

Your mission is to **implement, test, document, and validate a real application**. Do not stop after producing an architecture plan or a non-functional mockup. Make sound technical decisions without repeatedly asking for approval, while respecting the mandatory decisions below.

## 1. Product vision

ResumI is an **agentic visual resume editor**, closer in interaction quality to **Figma / Canva / Linear** than to a traditional form-based resume generator.

Users should eventually be able to:

- Create and edit resumes directly on an **HTML/CSS canvas**.
- Add, remove, reorder, and customize sections and content blocks.
- Edit typography, colors, spacing, and layouts with immediate feedback.
- Ask AI agents to inspect, rewrite, reorganize, or restyle the document.
- Review agent-made changes, undo them, and remain in control.
- Export professional PDF documents and share previews.

The application must feel **fast, direct, coherent, accessible, and premium**. Start with a complete functional vertical slice rather than superficial breadth.

### Brand, narrative, and agent-agnostic positioning

The product name is **ResumI** (preserve this spelling and casing). It belongs to the **Plinka** ecosystem.

The core marketing line is:

> **Your resume just got a new teammate.**

ResumI is designed as a **tool for people *and* their agents**, not as an application locked to one model provider. Think **Claude Code, OpenAI Codex, Grok-based agents, and any other agent that can use a CLI or a documented tool interface**. The integration contract must be independent of the vendor; adding an agent should not require reimplementing document operations.

- Use the tagline intentionally in the landing-page hero and brand storytelling. Do not plaster it across the UI or add meaningless “eyebrows.”
- Give the landing page a restrained, credible way to illustrate agent compatibility: recognizable, **official brand logos/icons for Claude / Claude Code, Codex / OpenAI, Grok / xAI**, when available and permitted by each brand's usage guidelines. Do not invent logos or imply partnership, endorsement, or working native integrations that have not been built.
- **Lucide remains the standard for product-action icons.** Third-party brand marks are a limited exception and must come from appropriately licensed official SVG/assets or a legally appropriate vetted icon source. Keep brand marks small, accessible, and visually consistent; provide meaningful `alt` text. Do not use Lucide to imitate corporate logos.
- Distinguish precisely between **engine/CLI compatibility**, a working **provider integration**, and a hypothetical future **MCP/WebMCP bridge**. At MVP, the engine and CLI can be real even when individual provider integrations are future work.

### Two equal users of the product

1. **Humans** operate the CV visually through the canvas, menus, inspector, and keyboard commands.
2. **AI agents** operate the same CV through typed, versioned, validated engine commands exposed by the CLI and future adapters.

**Both paths must have equivalent document semantics.** They must not have separate document models, duplicated business rules, or different validation. They may have different UX, transports, and permissions, but **one engine must own the meaning of document operations**.

## 2. Mandatory technology choices

| Concern | Decision |
| --- | --- |
| Language | **TypeScript** with strict mode |
| UI framework | **React 19** |
| Package manager and local tooling | **Bun** |
| Build | **Vite** |
| SSR | **Real SSR**, via a Vite-based React framework compatible with Cloudflare |
| Hosting target | **Cloudflare Workers** |
| Component library | **Mantine** |
| Client reactivity | **Jotai** |
| Icons | **Lucide**, via **`lucide-react`** (third-party brand logos are a documented exception) |
| Styling | **CSS Modules + CSS custom properties** |
| Utility CSS | **Tailwind CSS only if it materially helps** |
| Animation | **Motion** for purposeful interactions; CSS when simpler |
| Render optimization | **React Compiler** where supported |
| Testing | **Bun test** for pure TypeScript; **Playwright** for E2E, screenshots, and visual inspection |
| Local project persistence | **IndexedDB**, with a minimal typed access layer and schema migrations |
| Architectural priority | **Generic document engine independent of React** |

Use modern **stable, mutually compatible** versions. Validate choices against current official documentation; do not assume a particular major version without checking.

### SSR framework decision

Prefer **React Router framework mode** with its officially supported Vite/Cloudflare integration, if compatible with the current ecosystem. **TanStack Start** is an acceptable alternative when there is a concrete, documented engineering advantage. Preserve React + Bun + Vite and actual SSR regardless of selection.

Do **not** build a static Vite SPA and label it “SSR.” Public pages must be server-renderable, and nested routes must survive direct navigation and refresh.

**Important:** Bun is for package management, local scripts, and development tooling. Production code deployed to Cloudflare Workers runs in the **Workers runtime**, not the Bun server runtime. Avoid incompatible Node/Bun-only production dependencies.

### Styling philosophy

- Use **Mantine** for production-grade UI controls and its accessible interaction primitives.
- Use **CSS Modules** for custom styles and **CSS variables** for themes/tokens/document properties.
- Tailwind is optional, not a requirement and not inherently faster than compiled CSS.
- Use **Motion** for transitions that convey state, not gratuitous movement.
- Prefer the simplest implementation that achieves a precise, professional appearance.

### Lucide icon policy — required

- Install and use **`lucide-react`** as the **single default icon library** across the application.
- Import **named icons directly** from `lucide-react`; avoid bulk imports, dynamically importing the entire icon catalog, or bundling unused glyphs.
- Keep icon sizes, stroke weights, alignment, and optical spacing consistent via design-system tokens or a thin shared `AppIcon` component *only if useful*.
- Use semantic icons, not decorative icons on every line. Do not mix icon packs unless a concrete limitation requires it and the exception is documented.
- Provide accessible labels for **icon-only buttons**. Decorative icons should be hidden from assistive technology.
- Match the restrained Apple/Linear/Figma aesthetic: compact Lucide icons with predictable hover, active, and disabled states.

## 3. Architecture: engine first

**React must not be the document engine.** Implement a reusable, framework-independent **TypeScript document engine** that does not import React, Jotai, Mantine, browser-only APIs, or UI components.

It must be usable from:

1. The React editor.
2. A CLI.
3. AI-agent tools and scripted workflows.
4. Server-side application code.
5. A future remote MCP server.
6. A future browser WebMCP integration.

Keep the generic engine separate from the **resume-specific domain**. Do not overgeneralize prematurely, but do not hardwire React assumptions into domain logic.

### Suggested monorepo structure

Adapt this layout if technically justified, but **preserve the responsibility boundaries**. Do not create folders and packages just to populate an architecture diagram.

```text
ResumI/
├── AGENTS.md
├── README.md
├── package.json
├── bunfig.toml
├── tsconfig.json
├── apps/
│   └── web/
│       ├── app/                     # Framework routes, root, server entry
│       ├── src/
│       │   ├── components/          # Shared presentation components
│       │   ├── features/
│       │   │   ├── editor/
│       │   │   ├── canvas/
│       │   │   ├── inspector/
│       │   │   ├── agent/
│       │   │   └── workspace/
│       │   ├── state/               # Jotai atoms, selectors, bindings
│       │   ├── hooks/               # Only justified React hooks
│       │   ├── styles/              # Tokens and CSS Modules
│       │   └── lib/
│       └── test/
├── packages/
│   ├── engine/
│   │   ├── src/
│   │   │   ├── document/
│   │   │   ├── commands/
│   │   │   ├── history/
│   │   │   ├── validation/
│   │   │   ├── serialization/
│   │   │   └── events/
│   │   └── test/
│   ├── cv/
│   │   ├── src/
│   │   │   ├── schema/
│   │   │   ├── sections/
│   │   │   ├── templates/
│   │   │   └── transformations/
│   │   └── test/
│   ├── cli/
│   │   ├── src/
│   │   └── test/
│   └── adapters/
│       ├── src/
│       └── test/
├── scripts/
│   └── check-file-length.ts
└── docs/
    ├── architecture.md
    ├── engine.md
    └── decisions/
```

Use **Bun workspaces** when sufficient. Avoid unnecessary tooling, layers, factories, and dependency-injection frameworks. Design around **high cohesion, low coupling, stable contracts, and testability**.

### Human and agent architecture: a single source of truth

Model the core flow as:

```text
Human UI (React/Mantine/Jotai) ─────────────┐
                                           ├─> Validated document commands
External agents (Codex/Claude/Grok/...) ───┤          │
    via CLI / future MCP or WebMCP ─────────┘          ▼
                                       Framework-free document engine
                                                  │
                           ┌──────────────────────┼───────────────────┐
                           ▼                      ▼                   ▼
                      Document state       Persistence adapter   HTML/CSS renderer
                           │                  (IndexedDB)           │
                           └───── UI subscriptions / previews ──────┘
```

The diagram expresses responsibilities, not an instruction to create redundant sources of truth. Define and document the canonical in-memory document state and how it is loaded/saved, how commands update it, and how Jotai subscribers receive granular changes. **IndexedDB is persistent storage for local projects, not another independent document engine.**

Keep browser-specific IndexedDB APIs out of the generic engine. A future remote storage adapter should fit behind a documented interface without changing command semantics. Avoid unnecessary abstraction before a real second adapter exists.


## 4. The generic document engine

Use a normalized document model with stable identifiers. Distinguish **document content**, **document style/layout properties**, and **transient editor UI state**.

The engine should progressively support:

- Creation and loading of documents.
- Validated schemas and versioning.
- Sections, blocks, and structured content with stable IDs.
- Typed, atomic document commands.
- Immutable, deterministic transformations.
- Serialization and deserialization.
- Undo/redo and well-defined history semantics.
- Reordering and targeted property updates.
- Structured errors and predictable failure cases.
- Safe modifications initiated by AI agents.

Illustrative API (choose accurate names and signatures during implementation):

```ts
createDocument()
validateDocument()
applyCommand()
applyCommands()
serializeDocument()
deserializeDocument()
undo()
redo()
```

External inputs must be runtime-validated. Invalid operations must fail predictably, not leave documents partially corrupted. Design tests for invariants, round trips, deterministic commands, failure paths, and history correctness.

### First-class CRUD operations

Implement **complete Create / Read / Update / Delete capabilities for editable domain entities**, including projects and document sections/blocks, according to their domain rules. Reordering, duplicating, archiving/restoring, and style changes are additional domain operations, not substitutes for missing CRUD.

- A human action and its equivalent agent command must call the same engine operation when changing a document.
- Expose read/inspect and validate capabilities, not only mutation commands.
- Keep all edits compatible with undo/redo and consistent persistence where applicable.
- Ensure user-visible actions have functioning behaviors and helpful error/confirmation states—no decorative controls that pretend to work.
- Do not create meaningless CRUD for static catalog content or entities that are genuinely read-only; document these intentional boundaries.


### Agent-operated document model

Humans and AI agents must use the **same command engine** to modify documents. Agent operations should be structured, attributable, reviewable, reversible when reasonable, and explicitly validated.

Intended future operations include:

- Inspect document metadata and structure.
- List and read sections.
- Create/update/delete a section or block.
- Rewrite a specified text block.
- Apply targeted layout/style changes.
- Reorder sections.
- Validate and preview changes.
- Undo operations.
- Export supported representations.

Do not give an LLM the ability to execute arbitrary application code or inject unchecked HTML. **The document engine itself must remain independent of any LLM provider or SDK.**

## 5. CLI — a first-class interface for agents

Implement a functional **command-line interface** using the engine directly, with no dependency on the React app or browser.

Illustrative commands (adapt command names to a coherent grammar):

```bash
bun run resumi --help
bun run resumi document create
bun run resumi document validate ./cv.json
bun run resumi document inspect ./cv.json
bun run resumi document apply ./cv.json ./patch.json
bun run resumi document render ./cv.json --format html --out ./preview.html
```

Requirements:

- Clear, complete `--help` output.
- Validated arguments and inputs.
- Machine-readable JSON output for automation.
- Explicit exit codes and actionable error messages on `stderr`.
- No unnecessary interactive prompts.
- Documented examples and stable command semantics.
- Testable command handlers.
- **No duplicated document logic** in the CLI.
- Where supported by the implemented renderer, provide a **read-only rendered HTML/CSS inspection/export** command for an existing document, usable without the React UI. It must reuse the real renderer and emit actual usable HTML/CSS rather than a handcrafted demo string.
- Prefer portable, well-defined output files (e.g., self-contained HTML or an HTML file plus copied CSS/assets). Handle content escaping and untrusted data safely.
- Support structured agent use cases: inspect → propose command(s) → validate → apply → preview/render → inspect result; allow atomic multi-command application when appropriate.

### Future MCP and WebMCP readiness

Keep engine commands and tool schemas separate from protocol transports. This enables future exposure via a **remote MCP server hosted on Cloudflare Workers** and potentially via **WebMCP in the browser**.

These are **different integration models**. Do not conflate them.

**Do not implement or deploy either integration yet.** Document intended adapter boundaries and build a secure, testable command contract first.

**Important browser/agent boundary:** a remote Codex/Claude/Grok agent cannot directly read a user's browser IndexedDB merely because the CLI and UI share an engine. For the local-first MVP, support a documented **export → CLI inspect/edit → validated import/preview** workflow (or an equivalent explicit file-based handoff). Design a future authenticated bridge for live editing, but never fake direct access to private browser data. Reuse the same document schema, validation, commands, and renderer across both paths.

## 6. `AGENTS.md` — strict React performance guide

**Create `AGENTS.md` at the repository root. This is mandatory.** It must be a practical, enforceable development policy for current and future coding agents, not a vague philosophy essay.

At minimum it must cover the rules below and link to relevant commands and architectural docs.

### Principle

**React renders the application; the TypeScript engine owns document rules.** Do not implement core business operations through lifecycle hooks or component-local effects.

### `useEffect`: discouraged by default

Use `useEffect` **only when synchronizing with an actual external system** that needs a component lifecycle, such as a DOM observer, external subscription, or imperative widget, and ensure correct cleanup.

Do **not** use effects for:

- Deriving values from props/state.
- Filtering/sorting ordinary data.
- Keeping two React states synchronized.
- Reacting to direct user actions that belong in event handlers.
- Executing ordinary business commands.
- Fetching ordinary route/server data when the framework can load it.
- Mirroring canonical document state into redundant stores.
- Workarounds for an incorrectly structured component.

Do not ban genuinely necessary effects or use fragile workarounds merely to eliminate the hook name.

### React Compiler and memoization

- Enable **React Compiler** where stable and supported by the chosen integration.
- Follow React purity, immutability, and Rules of Hooks.
- Avoid adding `useMemo`, `useCallback`, or `React.memo` everywhere as a reflex.
- Add manual memoization when required by a real performance finding or a documented identity contract.
- Enable React Hooks/Compiler-related ESLint rules; do not suppress errors to hide architectural problems.
- Keep development Strict Mode enabled. Fix side-effect bugs rather than masking them.

### Jotai usage

- Use **fine-grained subscriptions** and stable atoms.
- Prefer `useAtomValue` for reading and `useSetAtom` for writing when appropriate.
- Use derived atoms for derived state rather than copying it elsewhere.
- Avoid one giant `cvAtom` subscribed to by the entire canvas.
- Do not create unstable atom identities on every render.
- Avoid duplicating canonical document data between an engine store, Jotai, and component state.
- Document clearly **who owns the canonical document** and how engine commands publish updates to relevant UI subscribers.
- Keep high-frequency transient interaction state away from global subscriptions when possible.

### Component architecture and rendering

- Components should be small, cohesive, and focused.
- Separate presentation, interactions, document commands, and side effects.
- Avoid giant providers, excessive prop drilling, and unnecessary context-wide updates.
- Keep independently editable CV blocks independently renderable.
- A change in one block must not force irrelevant document regions to update.
- Avoid expensive synchronous render calculations and hidden layout reads.
- Prefer stable IDs and normalized structures for targeted updates.
- Measure before micro-optimizing; use React DevTools Profiler and browser traces.

### High-frequency input

Dragging, resizing, zoom, and text editing must feel instantaneous:

- Handle pointer movement without forcing React to rerender the entire editor per frame.
- Use `PointerEvent`, `requestAnimationFrame`, and transient DOM transforms where appropriate.
- Commit meaningful changes through engine commands at appropriate boundaries.
- Batch/throttle agent stream display updates if needed.
- Do not reparse every historical message or rerender the whole canvas for each streamed token.
- Keep typing latency, layout thrashing, and unnecessary pagination work under control.

### Data fetching and SSR

- Use framework loaders and SSR conventions for server data.
- Add a query/cache library only if the application's actual server-state complexity justifies it.
- Never access browser-only globals during server render.
- Ensure hydration is deterministic and free of avoidable warnings.

### Code review checklist

Before submitting code, check:

- Is this `useEffect` genuinely necessary?
- Is data duplicated or redundantly derived?
- Does one state update repaint more UI than necessary?
- Does a document mutation bypass engine commands/validation?
- Does browser-only code leak into SSR?
- Is the component pure and React Compiler-compatible?
- Were critical behaviors tested and measured?
- Are icon usages consistent with the **Lucide policy**?

## 7. HTML resume canvas

The document must be rendered as **real HTML/CSS**, not rasterized screenshots or a static decorative preview. The canvas is the most performance-sensitive part of the product.

Keep these concerns distinct:

1. Document model / engine.
2. Resume-domain schema and templates.
3. HTML document renderer.
4. Direct editing interactions.
5. Selection and inspector state.
6. Measurement and page layout.
7. Export/print pipeline.

### First iteration

Support an editable demo document with multiple sections; allow section selection, content editing, basic style changes, add/remove/reorder, undo/redo, and immediate feedback.

### Canvas constraints

- Support sensible A4 proportions and a coherent zoom model.
- Use CSS variables for theme inputs (fonts, accent, spacing, etc.).
- Avoid repeated forced synchronous reflows and massive layout remeasurement.
- A one-field edit should not rerender unrelated document sections.
- Pagination should be an independent subsystem and should not blindly recalculate all pages on every keystroke.
- Isolate resume document styles from the SaaS shell; consider an iframe only if its costs and benefits justify it.
- Keep all Mantine chrome **outside** the actual resume content renderer.
- Prepare for accurate print/PDF export, but do not claim pixel-perfect export before it exists and is verified.

### Agent-visible rendering and visual feedback loop — required

The coding agent must be able to **see what it actually built**, not merely read TSX and assume the result is beautiful. Provide two complementary methods:

**A. Browser screenshots and rendered-page inspection**

- Integrate **Playwright** (or an equally capable and justified browser automation stack) to start the real app locally, visit its actual routes, wait for fonts/hydration to settle, and capture screenshots.
- Capture at least the **landing page**, **recent-projects view**, and **CV editor/canvas** in a desktop viewport; include relevant mobile viewport screenshots for the landing page and projects view.
- Save reproducible, timestamped or deterministically named screenshot artifacts to a clearly defined directory (e.g., `artifacts/visual/`), using **synthetic demo CV data only**.
- Make the workflow runnable through a documented command such as `bun run visual:check` or a dedicated Playwright test script.
- When supported by Codex Cloud's browser/image viewing tools, **open and visually inspect the screenshots before reporting the task done**. Check spacing, contrast, clipping, overflow, mobile layout, visual balance, and whether important actions are discoverable.
- If direct visual inspection is unavailable, still generate screenshots and report that limitation honestly; do not claim to have visually reviewed what you did not open.

**B. Actual finished HTML/CSS inspection**

- Allow the agent to inspect the **rendered DOM/HTML**, linked/generated CSS, and relevant computed styles—not just component source code.
- Provide a documented way to render an example resume to real HTML/CSS via a shared renderer or CLI command.
- For pages, support browser-side inspection using Playwright (`page.content()`, selectors, computed style checks) and, when useful, inspecting SSR HTML output.
- Ensure preview/export uses the same document model and rendering rules as the browser canvas. Do not create a disconnected static preview implementation.

Use this loop whenever substantial UI work is done:

**Implement → run → inspect rendered HTML/CSS → capture and view screenshots → fix UX/layout defects → rerun tests.**

Screenshots are **evidence of rendering**, not a substitute for interaction tests, accessibility tests, or performance measurement. Do not commit screenshots containing real user personal data.

## 8. Visual direction — Figma × Linear × Apple

Build a polished, restrained, **premium SaaS** interface; not a generic generated dashboard.

### Palette and typography

- Primary surfaces: **white**, with very light neutral gray canvas surroundings.
- Text: **near-black** with a clear hierarchy of subdued neutrals.
- Borders: subtle cool grays; shadows used sparingly.
- Accent: a **single SaaS blue**, e.g. `#2563EB` as an initial token, adjustable later.
- Typography: clean and readable; **Inter** or **Geist** are good options.
- UI: compact, precise spacing, low noise, coherent focus/hover/disabled states.
- Icons: **Lucide (`lucide-react`)**, restrained, consistent sizing/strokes.

### Explicit visual anti-patterns

Avoid:

- Eyebrow labels above every headline.
- Meaningless helper text, filler descriptions, decorative paragraphs, and fake placeholders.
- “AI-generated SaaS dashboard” clichés.
- Giant rounded cards or excessive nested cards.
- Huge padding that makes an editor feel empty.
- Excessive gradients, glassmorphism, blurs, and shadows.
- Multiple competing accent colors.
- Gratuitous badges, decorative icons, and permanent animations.
- Fake interactions that look clickable but do nothing.

**Every visible element should provide real value.** Minimalism must not sacrifice accessibility, labels, keyboard usage, or necessary feedback.

### Product UX is a first-class engineering responsibility

Treat **user experience as core functionality**, not a cosmetic final step. Before polishing animations, ensure the core workflows are obvious, low-friction, consistent, and keyboard-accessible.

UX requirements:

- Sensible information architecture, navigation, and meaningful defaults.
- Clear selection/focus state; contextual properties rather than persistent clutter.
- Fast creation and editing, immediate visual feedback, and predictable undo/redo.
- Strong empty/loading/success/error states where needed—never filler text.
- Accessibility: keyboard access, visible focus, semantic labels, contrast, reduced motion, responsive layouts.
- Destructive actions require appropriate confirmation or recoverability; undo, duplication, and deletion should be understandable.
- Minimize unnecessary dialogs and clicks; include shortcuts where they benefit repeated editor tasks.
- Distinguish autosaved, saving, and failed-save states without intrusive visual noise.
- Measure meaningful interaction performance (typing, selection, canvas operations, project opening), not only bundle size.

### Landing page (LP) — real SSR, premium conversion UX

The public landing page is **part of the product**, not an afterthought. It must receive substantial UX and visual design attention.

- Hero line: **“Your resume just got a new teammate.”** Keep the headline clean and strong.
- Explain the differentiator concisely: **an editable canvas + a generic engine usable by humans and AI agents**.
- Clear primary CTA (e.g., **Create a resume**) that **actually works**, creates a local project, and enters the editor. Secondary navigation should also lead somewhere real.
- Include a credible, polished product preview using real rendered content—not a fake generic AI dashboard screenshot.
- Show agent compatibility carefully through official brand marks (Claude Code, Codex, Grok, etc.) with correct, non-misleading language. Do not imply shipped integrations or official endorsements.
- SSR metadata, accessible markup, responsive desktop/mobile layouts, and reasonable page-loading performance.
- Avoid irrelevant eyebrow text, spammy feature grids, huge empty sections, walls of copy, and overdone gradients.
- Design for discoverability, trust, and a fast first-run path into the editor.

### Recent projects page — IndexedDB, full CRUD

Build a polished **Projects / Recent resumes** view backed by **IndexedDB** (not a fake hardcoded array, not `localStorage` pretending to be a database). This is part of the initial vertical slice.

Core behaviors:

1. **Create:** new resume project, with a valid initial document; optionally choose a template if actually implemented.
2. **Read:** list recent projects and open a specific project; show accurate names and last-modified timestamps. Handle an empty database gracefully.
3. **Update:** rename and edit projects; persist modifications, updated timestamps, and document content across reloads.
4. **Delete:** remove a project with safe confirmation and/or a recoverable trash/undo flow. Do not silently discard documents.
5. **Duplicate:** create an independent copy with new IDs; ensure changes to one copy do not leak to the other.
6. **Discover:** useful sorting by recency, and search/filter when genuinely warranted by the number of projects. Keep the UI compact and understandable.
7. **Reliability:** debounce or coalesce frequent saves, handle write failures and storage quota issues, prevent stale writes from overwriting recent edits, and provide actionable feedback.
8. **Persistence safety:** typed IndexedDB access, a versioned schema, explicit migrations, and tests for reload/reopen and create/rename/duplicate/delete lifecycle.
9. **Privacy:** clearly represent data as **stored locally on this device/browser** until cloud sync genuinely exists. Do not claim account synchronization or cross-device access.
10. **SSR:** server-render a stable projects-page shell, then load IndexedDB data after client hydration. Do not access IndexedDB during SSR or force hydration mismatches.
11. **Portability:** offer validated JSON document/project export and import when practical, so users can back up local data and exchange documents with CLI-based agents. Import must not bypass engine validation or silently overwrite another project.

Choose a lightweight IndexedDB access approach (native API with a typed wrapper or a focused dependency such as `idb`). Avoid introducing a large state or persistence framework without a concrete need.

Use proper data ownership: the **document engine** defines valid document edits; the **project repository** persists/loads documents and project metadata; **Jotai** exposes precise UI subscriptions. The browser UI must not bypass validated document commands when editing CV data.

### Full-operation discipline

For every **editable entity**, ensure a coherent, tested lifecycle for applicable actions: create → read/open → update → delete, plus recoverability/duplication where justified. Use real feedback, state transitions, persistence, and error handling. Do not leave action menus whose items have no working implementation. Do not invent nonsensical CRUD for read-only system templates.

### Target editor layout

- Compact top toolbar with document actions.
- Left sidebar for structure, navigation, and templates.
- Large centered HTML resume canvas as the visual focus.
- Contextual right inspector for the selected object.
- Integrated AI-agent panel/dock (initially may be a realistic interface shell if the agent backend is not yet present; label functionality accurately).
- Responsive behavior, including smaller screens, without treating a complex desktop editing workspace as a mobile-only layout.

Use Mantine for inputs, dialogs, menus, tooltips, popovers, sliders, and other controls. Use CSS Modules to tune spacing, typography, surfaces, and layout. Use Motion only where it genuinely improves interaction. Respect `prefers-reduced-motion`.

## 9. Actual SSR, SEO, and Cloudflare readiness

**SSR is mandatory**, especially for public, indexable routes.

- Implement genuine server rendering for marketing and templates pages.
- Include proper metadata, titles, descriptions, semantic markup, and clean canonical URLs when relevant.
- Support direct visits to nested routes.
- Provide correct client hydration with no mismatches.
- Keep the heavy interactive editor isolated behind an SSR-compatible shell where appropriate.
- Follow Mantine's current official SSR guidance to handle styles/color scheme without visible flashing or mismatch.
- Use Cloudflare-supported deployment/build tooling and avoid Node-only runtime assumptions.

Suggested routes:

```text
/                    # SSR landing page
/projects            # SSR shell, client-hydrated IndexedDB data
/templates           # SSR template catalog if implemented
/editor              # Create or redirect to a valid document
/editor/:documentId  # Resume editor
```

For local-only browser projects, do **not** pretend SSR can directly read the visitor's IndexedDB. SSR the page shell and load local projects after hydration with stable loading/empty states. Make direct navigation to `/editor/:documentId` robust even when the project is missing from the local browser; show recovery actions rather than a blank page.

Possible final public hostname: **`cv.plinka.eu`**, under the main brand **`plinka.eu`**. Keep hostnames configurable; do not hardcode production URLs into internal logic. **Do not deploy to production or configure credentials without explicit user approval.**

## 10. Source-file length policy and scanner

Aim for small, cohesive files. **Every handwritten source file must contain fewer than 600 physical lines**; 600 or more is a failure. Treat this as a hard guardrail, not a target size.

Create a **generic** reusable script:

```text
scripts/check-file-length.ts
```

Requirements:

1. Recursively traverse all relevant source trees and workspaces.
2. Include `.ts`, `.tsx`, `.js`, `.jsx`, `.css`, and configurable additional source extensions.
3. Count physical lines accurately.
4. Report files nearing the threshold.
5. Exit non-zero when any included handwritten file has **600+ lines**.
6. Ignore build output, dependencies, generated artifacts, lockfiles, coverage, and explicitly configured exclusions.
7. Document and test exclusions.
8. Run with Bun.
9. Avoid hardcoded folder assumptions that make future packages invisible.
10. Include tests for nested paths, excluded paths, and threshold boundaries.

Provide:

```bash
bun run check:files
```

Integrate the scan into CI and the combined `check` command. Split oversized files according to real responsibilities, rather than creating arbitrary tiny wrappers to manipulate line counts.

## 11. Testing strategy and enforcement

**Require at least 85% coverage for the generic engine.** Prioritize meaningful tests over artificially inflating a percentage. UI components do **not** need 85% blanket coverage.

### Mirrored test structure

Keep tests in dedicated `test/` directories that mirror the `src/` tree:

```text
packages/engine/
├── src/
│   ├── commands/
│   │   ├── apply-command.ts
│   │   └── reorder-section.ts
│   └── history/
│       └── undo.ts
└── test/
    ├── commands/
    │   ├── apply-command.test.ts
    │   └── reorder-section.test.ts
    └── history/
        └── undo.test.ts
```

### Engine testing requirements

- Minimum **85% line coverage**.
- Minimum **85% function coverage**.
- Track branch coverage where supported; add extra tooling only if necessary.
- Make thresholds **fail CI**.
- Ensure unimported engine source files cannot silently disappear from coverage accounting.
- Test invalid input, schema edge cases, command invariants, deterministic application, undo/redo, serialization round trips, and document version transitions.

Use Bun's native test runner for engine and other pure TypeScript packages when practical. Add browser integration or E2E tests for important UI journeys and SSR/hydration behavior.

### Quality gates

Set up:

- Strict TypeScript checking.
- ESLint, including React Hooks and relevant compiler rules.
- Source-file length scanner.
- Unit tests and coverage thresholds.
- A production build.
- SSR smoke tests.
- Browser tests for critical editor flows where feasible.
- Playwright UI/visual inspection scripts and reproducible screenshots for critical routes.
- IndexedDB integration tests for complete project CRUD, persistence after reload, schema upgrade behavior, and failure cases (using an appropriate browser-based test setup).
- E2E flows: landing CTA → create project → edit CV → save/reload → reopen → rename → duplicate → delete; include a basic undo/redo and agent-command equivalence check.
- Tests or assertions that the shared renderer produces expected HTML/CSS, not a separate fake preview.
- GitHub Actions CI if practical.

Provide a single command:

```bash
bun run check
```

It must execute appropriate quality gates and fail on real errors. Never fabricate successful build, test, performance, or coverage results.

## 12. README: explain the platform and engine

Write a high-quality root `README.md` that introduces **ResumI as an engine-first, agent-native document editing platform**, not just a resume generator UI.

Include:

1. Clear product overview and vision.
2. Actual implemented feature list (distinguish planned features).
3. Technology stack, including Mantine, Jotai, **Lucide**, Bun, Vite, SSR, and Cloudflare.
4. Architecture overview and responsibility boundaries.
5. Repository tree.
6. Generic document engine and resume-domain relationship.
7. Document command model and how UI/agents use it.
8. CLI examples using real implemented commands.
9. Local development instructions.
10. Tests, coverage, lint, and line-count commands.
11. SSR and Cloudflare deployment model.
12. Future MCP/WebMCP extension points (clearly marked future work).
13. Current limitations and next steps.
14. The actual human/agent shared-command contract, compatible CLI tools, and the status of any provider integrations.
15. IndexedDB's local-only storage model, project CRUD, migrations, and data limitations.
16. The landing page, recent-projects UX, and the **“Your resume just got a new teammate.”** positioning.
17. How to generate/open UI screenshots and inspect final rendered HTML/CSS.
18. The task-by-task Markdown execution plan and its master completion checklist.

Make the documentation accurate, concise enough to navigate, and useful to coding agents and human contributors alike.

## 13. Implementation sequence

Work toward a **functioning vertical slice**. Do not build the entire long-term product in one step.

### Mandatory Markdown execution plan (tracked in the repository)

**Before substantive implementation**, inspect what is available, then create a **task-driven plan as actual Markdown files in `tasks/`**. Do not keep the only plan in chat or bury it in a giant README. The plan must be useful to future Codex/Claude Code/other coding-agent sessions and human contributors.

Required suggested breakdown (rename only for a real improvement in dependencies or clarity):

```text
tasks/
├── README.md                       # Task index, dependencies, priorities
├── check-list.md                   # Master acceptance checklist; source of progress truth
├── 00-discovery-and-foundation.md  # CV-creator audit, stack, Bun, SSR, tooling
├── 01-engine.md                    # Generic engine, commands, validation, history
├── 02-cv-renderer.md               # Resume domain, actual HTML/CSS rendering
├── 03-projects-indexeddb.md        # Local project persistence, CRUD, migrations
├── 04-landing-page.md              # Brand, SSR LP, CTA, responsive UX
├── 05-editor-and-ux.md             # Canvas, inspector, selection, keyboard, undo
├── 06-agent-cli.md                 # Shared agent tools, CLI, future MCP boundaries
├── 07-visual-qa.md                 # Browser screenshots, HTML/CSS, UX review
└── 08-hardening-and-release.md     # Test gates, coverage, perf, Cloudflare, docs
```

Every numbered task Markdown file must include:

- **Goal** and why it matters to the product.
- **Scope** (included and explicitly deferred).
- **Prerequisites/dependencies** and relevant files/packages.
- **Implementation checklist** with individual checkboxes (`- [ ]`).
- **Acceptance criteria** tied to observable behavior, not vague adjectives.
- **Testing/verification plan** with actual commands and expected evidence.
- **UX/performance/accessibility checks** where relevant.
- **Risks and important decisions** (or links to ADRs).
- **Status**: Not started / In progress / Blocked / Done, with honest notes.

`tasks/check-list.md` is a **master checklist** linking back to the task files. Organize it by workstream and include hard gates such as shared engine parity, CRUD coverage, SSR, offline/local persistence, visual reviews, test coverage, and the <600-line source policy.

**The checklist is not aspirational:** mark items done (`[x]`) **only after implementation and verification**. Record commands run and their outcome, link screenshot/output evidence when available, and explain blocked items. Update the relevant task file and master checklist as work progresses. No fake checkmarks.

Plan before coding, but **do not stop at planning**. The task files are a living execution record, not a substitute for a functioning application. Prioritize dependencies, keep the initial vertical slice achievable, and avoid creating empty implementation scaffolds merely to match the directory list.

### Phase 1 — Inspect the V1

- Review the accessible `CV-creator` repository.
- Identify what worked and what should change.
- Capture reusable document concepts and any notable technical risks.
- Keep that repository untouched.

### Phase 2 — Initialize ResumI

- Set up Bun workspaces, TypeScript, React, Vite, and real SSR.
- Integrate Cloudflare-compatible build/runtime configuration.
- Configure Mantine, Jotai, CSS Modules, Motion where used, and **`lucide-react`**.
- Enable React Compiler where supported.
- Write an initial root `AGENTS.md` and `README.md`.
- Add lint/test/check scripts.

### Phase 3 — Implement the engine

- Create the generic document schema, validations, typed commands, and serialization.
- Implement robust document history and undo/redo.
- Create a sample resume document through the resume-domain package.
- Add engine tests as each capability is built.

### Phase 4 — Build local projects, landing page, and usable editor

Create the **IndexedDB-backed recent-projects view** and its lifecycle before claiming a persistent editor. Implement a real SSR landing page with the tagline and a functioning create-project CTA. Then deliver, at minimum:

- A polished, SSR-compatible editor shell.
- A real HTML/CSS A4-style resume canvas.
- A working sample CV.
- Section selection and content editing.
- Basic style editing through a contextual inspector.
- Adding, deleting, and reordering sections.
- Working undo/redo through the engine.
- A clean Lucide-based toolbar and application navigation.
- A usable `/projects` screen with persistent create/list/open/rename/duplicate/delete actions.
- Correct local save/load behavior after reload and graceful handling of missing documents.
- A real SSR landing page with **“Your resume just got a new teammate.”**, strong product illustration, and working CTAs.
- Agent-compatible positioning with appropriate brand marks and no fictitious integration promises.

**Do not ship a static screenshot or a beautiful non-functional mockup.**

### Phase 5 — Build the CLI and agent adapters

- Implement CLI access to the real engine.
- Define transport-independent command schemas suitable for future agents.
- Demonstrate an automated document mutation without requiring paid AI credentials (a deterministic script is acceptable).
- Do not claim working LLM/MCP functionality until implemented.

### Phase 6 — Visually inspect, verify, and document

Run the real application and **look at the resulting UI**. Capture desktop/mobile screenshots of the landing and projects pages plus screenshots of the editor. Inspect rendered HTML/CSS and the resulting visual layout, then fix visible flaws. Exercise complete CRUD and the shared human/agent command path.

Run and fix:

- Type check.
- Lint.
- Unit tests.
- Coverage thresholds.
- File-length analysis.
- Production build.
- SSR smoke check.
- Critical editor interaction tests, including IndexedDB persistence and reload.
- Playwright screenshot/DOM inspection workflows, using synthetic data.
- UX review of landing CTA, recent-projects CRUD, keyboard flows, empty states, errors, and canvas interactions.

Update `README.md`, `AGENTS.md`, **each task Markdown file**, and `tasks/check-list.md` to match the actual implementation and verification evidence.

## 14. Engineering judgment and security

When several approaches are plausible, optimize in this order:

1. Correctness.
2. User-perceived responsiveness.
3. Clear responsibilities.
4. Maintainability.
5. Testability.
6. Cloudflare/runtime compatibility.
7. Simplicity.
8. Ecosystem maturity.

Prefer stable dependencies and native platform features where appropriate. Avoid premature abstractions, gratuitous packages, and unnecessary infrastructure.

Resume data may contain personal information. Therefore:

- Keep secrets and API keys out of browser bundles.
- Validate all untrusted document and agent inputs.
- Avoid unsafe unchecked HTML insertion.
- Never log private resume contents unnecessarily.
- Prepare clear user/document authorization boundaries for future agents.
- Do not silently perform destructive changes.
- Keep agent modifications reviewable and reversible where feasible.

Make ordinary implementation decisions autonomously, but **do not change the mandatory stack, deploy to production, configure credentials, or perform destructive repository operations without explicit authorization**.

Record significant design decisions and their tradeoffs in `docs/decisions/` when they are not obvious.

## 15. Definition of done

The initial milestone is done when:

- [ ] The **`ResumI`** repository contains a working application.
- [ ] `CV-creator` was inspected where accessible and was not modified.
- [ ] React + Bun + Vite + **real SSR** are integrated.
- [ ] Cloudflare Workers compatibility is established and verified as far as the environment allows.
- [ ] Mantine is used for UI controls; Jotai is used for granular client reactivity.
- [ ] **Lucide (`lucide-react`) is consistently used for application icons**, with vetted brand assets as a limited exception for agent-provider logos.
- [ ] CSS Modules/tokens drive the visual identity; Tailwind is only added if justified.
- [ ] The editor **and public landing page** have a minimal white/black/SaaS-blue design inspired by Figma/Linear/Apple.
- [ ] The landing page uses **“Your resume just got a new teammate.”** and has a working create-project CTA.
- [ ] Compatible-agent positioning is truthful, portable across CLI-capable agents, and does not invent built integrations or affiliations.
- [ ] The recent-projects page is backed by **IndexedDB**, not demo-only in-memory data.
- [ ] Projects support **create/read/open/update/rename/duplicate/delete**, persistence after reload, and safe deletion/error flows.
- [ ] IndexedDB schema/versioning and browser-only hydration boundaries are handled deliberately.
- [ ] UX, accessibility, empty/error states, and responsive behavior were actively reviewed for the landing, projects, and editor.
- [ ] A real HTML resume can be viewed **and edited**.
- [ ] Section operations, basic style editing, and undo/redo work.
- [ ] The document engine is independent of React.
- [ ] **Human actions and agent commands use the same validated generic engine** for equivalent document operations.
- [ ] Editable document entities have the relevant **CRUD** operations, with tests and no dead UI controls.
- [ ] All document mutations use validated commands.
- [ ] The CLI can create/inspect/validate/modify documents as implemented, and the local-browser/CLI data boundary is documented.
- [ ] A real import/export path enables exchanging a validated local document with CLI agents, or any limitation is explicitly scoped and tracked.
- [ ] Root `AGENTS.md` contains strict, actionable React performance rules.
- [ ] Root `README.md` documents real behavior, UX, project CRUD, agent interoperability, and the engine-first vision.
- [ ] `tasks/` contains separate numbered Markdown execution files and a maintained **`tasks/check-list.md`** with verified checkmarks/evidence.
- [ ] Coding agent can generate **actual browser screenshots** for key pages and inspect final rendered **HTML/CSS** via the shared renderer/browser tooling.
- [ ] Significant UI changes receive an actual screenshot/DOM inspection cycle when tooling permits, with limitations reported when it does not.
- [ ] Tests mirror the `src/` hierarchy.
- [ ] Engine coverage meets the enforced **85% line/function thresholds**.
- [ ] The generic scanner fails on handwritten source files with **600+ lines**.
- [ ] `bun run check` runs relevant checks and succeeds.
- [ ] Production build and SSR checks succeed, or blockers are clearly reported.
- [ ] No fake features, misleading test claims, or unnecessary `useEffect` patterns.
- [ ] Remaining limitations are stated clearly.

## Final instructions for Codex

**Start by inspecting the repositories and the available environment. Then implement ResumI. Do not stop at planning.**

Use these requirements to guide decisions, not to justify empty abstractions or needless complexity. Focus on real functionality, responsiveness, **deep product UX**, a clean design system, **persistent local CRUD**, and **one engine shared by humans and AI agents**.

Create and maintain the **numbered task Markdown files + `tasks/check-list.md`** before and during implementation. Capture and inspect screenshots and finished HTML/CSS, and iterate on the design rather than assuming the code looks correct.

At the end, report:

1. What is actually implemented.
2. The resulting repository structure.
3. Important engineering decisions and reasons.
4. How to run, test, and build locally.
5. Actual test/coverage/check results.
6. SSR and Cloudflare readiness.
7. Working local project storage/CRUD and any unresolved browser persistence caveats.
8. Visual QA artifacts (screenshots, rendered HTML/CSS) and whether they were actually inspected.
9. Which numbered task Markdown files/checklist entries are complete, incomplete, or blocked.
10. Known limitations and suggested next development steps.

Commit changes on an appropriate branch and open a pull request if repository access and environment permissions allow. **Do not deploy to production without approval.**

---

**ResumI by Plinka — Build a serious, agent-native document platform, not a disposable AI-generated demo.**
