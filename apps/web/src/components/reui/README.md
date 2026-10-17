# Base UI color picker

Imported from [ReUI's Base UI color picker registry](https://reui.io/docs/components/base/color-picker) with the actual shadcn CLI:

```sh
cd apps/web
bunx --bun shadcn@latest add https://reui.io/r/base-nova/color-picker.json --yes
```

Existing Button, DropdownMenu, Input, Textarea, Popover and Separator sources were retained. The command generated the color picker and shadcn InputGroup. ReUI uses the existing Base UI shadcn primitives and requires no color library or Radix dependency. Its MIT license is retained in [LICENSE.md](LICENSE.md).

The original 2,996-line registry source is split into cohesive modules under `color-picker/` to respect this repository's source-size policy. The public barrel remains `color-picker.tsx`; the implementation keeps the registry's color math, accessible channels, pointer and keyboard gestures, format fields and swatches. The root and context are separate to avoid cyclic SSR module initialization. DOM append calls use `appendChild` for compatibility with this project's Bun DOM types. The user-selected field format is owned by the root rather than mirrored from a child effect.

`src/ui/color-input.tsx` lazily loads `src/ui/color-picker-panel.tsx` to adapt the picker to the application's ColorInput API. Dragging is local transient state; `onValueCommit` creates one validated document command per completed interaction. Page, text, shapes, gradients, images and links use this same picker.

The subsequent official Luma preset updates the shared shadcn primitives; this registry implementation continues to use those same Base UI components. UI radii and colors follow the application tokens.
