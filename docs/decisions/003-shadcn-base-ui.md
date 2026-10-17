# shadcn/ui with Base UI

The user's explicit choice replaces Mantine with editable shadcn components built on Base UI. The engine, validated commands and canonical Jotai session stay independent of this choice. There are no Mantine or Radix imports/dependencies.

The initial migration used the official shadcn CLI with `base-nova`. The requested follow-up preset was applied with:

```sh
bunx --bun shadcn@latest apply b6Rf8X01vU --cwd apps/web --yes
```

The resulting configuration is **Base UI Luma**, neutral surfaces, Lucide, Source Sans 3 for the interface and Space Grotesk for headings. Subsequent user instructions override the preset's Sky primary with **Blue-600 `#2563EB`**, limit UI radii to 6–8px, and enlarge panel text/controls to 12px. CV fonts and colors remain document data. Both fonts are packaged locally through Fontsource.

Sources live in `src/components/ui`; `src/ui` adapts the application's compact control API. Application layouts use CSS Modules; generated components use Tailwind v4. A root TooltipProvider manages tooltips. Menus, popovers, dialogs, selectors and sliders retain the generated Base UI focus, keyboard and dismissal behavior. Popovers use translucent themed surfaces and backdrop blur.

The color picker was imported through the shadcn CLI from [ReUI's Base UI registry](https://reui.io/docs/components/base/color-picker). Its MIT license and color/keyboard/pointer behavior are retained; its original source is split by responsibility under `components/reui`. `ui/color-input.tsx` exposes a light shadcn trigger and lazily loads `ui/color-picker-panel.tsx` on opening. Pointer drafts remain local; committing an interaction publishes one validated command. There is no native color dialog. [Import and provenance](../../apps/web/src/components/reui/README.md).

`ScrollShadow` composes Base UI ScrollArea with generated shadcn ScrollBars. Content owns padding; the rails sit at the outer edge. Overflow indicators fade to the current theme's surface color. Canvas scrollbars use separate thin themed viewport styles. Shortcut hints use the CLI-generated Kbd component.

Theme preference is a small external store, separate from CV data. A synchronous HTML bootstrap applies the stored/system preference before paint; ThemeSync handles storage and media changes with cleanup. Only the HTML attributes modified by this bootstrap use `suppressHydrationWarning`; route content still requires deterministic SSR and zero hydration errors. Motion respects reduced motion. Route transitions animate incoming views without retaining discarded loader data; canvas/Text and dock transitions retain their own safe local view state.

References: [official Vite installation](https://ui.shadcn.com/docs/installation/vite), [CLI](https://ui.shadcn.com/docs/cli), and [Base UI button composition](https://ui.shadcn.com/docs/components/base/button#as-link).
