# shadcn/ui with Base UI

The user explicitly requested shadcn generated through its CLI, using Base UI primitives, to make controls easier to customize. This replaces the initial Mantine choice. The engine, command validation and Jotai ownership are unchanged by the UI dependency migration.

The official CLI ran against the existing React Router workspace:

```sh
bunx --bun shadcn@latest init --base base --preset nova --yes --no-monorepo --no-rtl --pointer --cwd apps/web
bunx --bun shadcn@latest add button dialog dropdown-menu popover tooltip input textarea select slider scroll-area alert spinner radio-group label separator tabs field card --yes --cwd apps/web
```

This generated `components.json` with `style: "base-nova"`, sources in `src/components/ui`, and dependencies on Base UI, class-variance-authority, cn, Tailwind v4 and shadcn's CSS utilities. Generated sources are local and editable, not a runtime component service. Their accessible primitives handle focus, keyboard interaction, dismissal and portals. The application installs one TooltipProvider at the root; no theme provider or color scheme script is needed for the current light theme.

The `src/ui` adapter maps the existing control props to these generated components so that the editor's events remain intact. Application-specific appearance lives in small CSS Modules. Number inputs and color fields compose the generated Input with native number/color inputs; text color can also be entered as a hexadecimal value. The app retains Inter and its existing blue palette instead of fetching an extra font. Existing muted text uses `--muted-foreground`, reserving `--muted` for the shadcn surface token.

References: [official Vite installation](https://ui.shadcn.com/docs/installation/vite), [Base UI announcement](https://ui.shadcn.com/docs/changelog/2026-07-base-ui-default), [CLI](https://ui.shadcn.com/docs/cli), and [link composition](https://ui.shadcn.com/docs/components/base/button#as-link).
