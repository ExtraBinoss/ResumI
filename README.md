# ResumI

Your resume just got a new teammate.

[![ResumI presentation: a resume with coding agent tools](apps/web/public/og-image.png)](assets/ssr-image/index.html)

A local-first resume editor with 20 templates, Visual/Text workspaces, rich text, images, shapes, groups and pages. Imported HTML and React/TSX become editable canvas layers; their original source is preserved inactive. Export the current resume as JSON, HTML, React/TSX or PDF.

The image above is generated from the [HTML presentation](assets/ssr-image/index.html) using public, synthetic demo assets.

## Install

Use Bun 1.4.2 and Node 24, matching CI.

```sh
bun install
bun run dev
```

Open the URL printed by Vite. Projects are saved in this browser; export JSON for backups and use **Ctrl/⌘+O** in the library to reopen one. There is no automatic cloud sync. Interface language and CV language are independent.

**Installing with a coding agent?** Give it the [local setup prompt and workflow guide](docs/agents/README.md).

## CLI

```sh
bun run resumi --help
bun run resumi help design
bun run resumi help pdf
bunx playwright install chromium
bun run resumi new --template react-classic --out resume.json
bun run resumi output resume --format pdf --out resume.pdf
```

The app uses the browser print dialog; the CLI generates PDFs directly with local Chromium and checks their actual text with PDF.js. See the [agent guide](docs/agents/README.md) for HTML/TSX editing, validated JSON commands, assets and visual verification.

## Development

```sh
bun run check          # types, lint, format, tests, cold dev, build and E2E
bun run visual:check   # visual journeys and screenshots
bun run format
bun run build
bun run preview        # http://127.0.0.1:4187
bun run brand:og       # regenerate the presentation PNG
```

Built with strict TypeScript, React 19, Jotai, Motion and shadcn/ui with Base UI. The framework-free engine in `packages/engine` validates document changes; `apps/web` owns the interface, and `packages/cli`, `packages/cv` and `packages/assets` provide file workflows, rendering and shared artwork.

## License

[MIT](LICENSE). Bundled fonts and artwork retain their own [license and provenance notices](assets/ssr-image/README.md).
