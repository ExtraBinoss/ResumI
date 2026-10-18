// Imported with shadcn CLI from ReUI's Base UI registry (MIT); split by responsibility.
import { cn } from "cn";
import { CheckIcon } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { createContext, useContext, useId, useRef, useState } from "react";
import { useColorPickerContext } from "./context";
import { swatchBackground } from "./display";
import { formatColor, getForegroundColor } from "./format";
import { copyOnShortcut } from "./gestures";
import { parseColor } from "./parse";

export type SwatchesContextValue = {
  shape: "square" | "circle";
  activeId: string | null;
  setActiveId: (id: string | null) => void;
};

export const SwatchesContext = createContext<SwatchesContextValue>({
  shape: "square",
  activeId: null,
  setActiveId: () => {},
});

export type ColorPickerSwatchInput = string | { value: string; label?: string };

export const OPTION_SELECTOR =
  '[data-slot="color-picker-swatch-item"]:not([aria-disabled="true"])';

export function neighbor(
  options: HTMLElement[],
  current: HTMLElement | undefined,
  key: string,
  rtl: boolean,
) {
  if (key === "Home") return options[0];
  if (key === "End") return options[options.length - 1];
  if (!current) return options[0];
  const forward =
    key === "ArrowDown" || key === (rtl ? "ArrowLeft" : "ArrowRight");
  return options[options.indexOf(current) + (forward ? 1 : -1)];
}

export type ColorPickerSwatchesProps = Omit<
  ComponentProps<"div">,
  "children"
> & {
  colors?: ColorPickerSwatchInput[];
  shape?: "square" | "circle";
  children?: ReactNode;
};

export function ColorPickerSwatches({
  colors,
  shape = "square",
  className,
  children,
  onKeyDown,
  onFocus,
  ...props
}: ColorPickerSwatchesProps) {
  const context = useColorPickerContext("ColorPickerSwatches");
  const [activeId, setActiveId] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const options = () =>
    Array.from(
      listRef.current?.querySelectorAll<HTMLElement>(OPTION_SELECTOR) ?? [],
    );
  const activate = (option: HTMLElement | undefined) => {
    if (!option) return;
    setActiveId(option.id);
    option.scrollIntoView?.({ block: "nearest" });
  };

  return (
    <SwatchesContext.Provider value={{ shape, activeId, setActiveId }}>
      <div
        ref={listRef}
        role="listbox"
        tabIndex={context.disabled ? -1 : 0}
        aria-label={context.i18n.labels.swatches}
        aria-activedescendant={activeId ?? undefined}
        aria-disabled={context.disabled || undefined}
        aria-readonly={context.readOnly || undefined}
        data-slot="color-picker-swatches"
        data-empty={activeId ? undefined : ""}
        className={cn(
          "group/color-picker-swatches data-empty:focus-visible:outline-ring grid grid-cols-[repeat(auto-fill,var(--color-picker-swatch-size))] justify-between gap-x-1 gap-y-1.5 outline-none [--color-picker-swatch-size:calc(var(--spacing)*6)] aria-disabled:opacity-50 data-empty:focus-visible:outline-2 data-empty:focus-visible:outline-offset-2",
          className,
        )}
        onFocus={(event) => {
          onFocus?.(event);
          if (event.target !== event.currentTarget) return;
          const found = activeId
            ? event.currentTarget.ownerDocument.getElementById(activeId)
            : null;
          if (!found) {
            const selected = event.currentTarget.querySelector<HTMLElement>(
              `${OPTION_SELECTOR}[aria-selected="true"]`,
            );
            setActiveId(selected?.id ?? null);
          }
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (event.defaultPrevented || copyOnShortcut(event, context)) return;
          if (context.disabled) return;
          const list = options();
          const current = list.find((option) => option.id === activeId);
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            current?.click();
            return;
          }
          if (
            ![
              "ArrowLeft",
              "ArrowRight",
              "ArrowUp",
              "ArrowDown",
              "Home",
              "End",
            ].includes(event.key)
          ) {
            return;
          }
          event.preventDefault();
          const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
          activate(neighbor(list, current, event.key, rtl) ?? current);
        }}
        {...props}
      >
        {children ??
          colors?.map((item, index) => {
            const swatch = typeof item === "string" ? { value: item } : item;
            return (
              <ColorPickerSwatchItem
                key={`${index}-${swatch.value}`}
                value={swatch.value}
                label={swatch.label}
              />
            );
          })}
      </div>
    </SwatchesContext.Provider>
  );
}

export const SWATCH_ITEM_SQUARE = "rounded-md";

export const SWATCH_ITEM_CLASS =
  "forced-color-adjust-none relative flex size-(--color-picker-swatch-size) shrink-0 cursor-default items-center justify-center outline-offset-2 transition-[scale] duration-150 after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:inset-ring after:inset-ring-foreground/10 not-aria-disabled:hover:scale-110 aria-disabled:opacity-40 motion-reduce:transition-none group-focus-visible/color-picker-swatches:data-active:outline-2 group-focus-visible/color-picker-swatches:data-active:outline-ring [&_svg]:size-3.5";

export type ColorPickerSwatchItemProps = Omit<
  ComponentProps<"div">,
  "children"
> & {
  /** Any color `parseColor` reads. */
  value: string;
  /** Read out instead of the generated color name. */
  label?: string;
  disabled?: boolean;
};

export function ColorPickerSwatchItem({
  value,
  label,
  disabled = false,
  className,
  style,
  onClick,
  ...props
}: ColorPickerSwatchItemProps) {
  const context = useColorPickerContext("ColorPickerSwatchItem");
  const swatches = useContext(SwatchesContext);
  const id = useId();
  const parsed = parseColor(value);
  const color = parsed && !context.alpha ? { ...parsed, alpha: 1 } : parsed;
  const selected =
    !!color &&
    !!context.color &&
    formatColor(color, "hex") === formatColor(context.color, "hex");
  /* The check reads like text on the swatch: one rule for both. */
  const check =
    (color && getForegroundColor(color, { light: "#fff", dark: "#000" })) ??
    "#000";
  const inactive = disabled || !color;

  return (
    <div
      id={id}
      role="option"
      aria-selected={selected}
      aria-disabled={inactive || undefined}
      aria-label={
        label ?? (color ? context.i18n.functions.getColorName(color) : value)
      }
      data-slot="color-picker-swatch-item"
      data-active={swatches.activeId === id ? "" : undefined}
      data-selected={selected ? "" : undefined}
      className={cn(
        SWATCH_ITEM_CLASS,
        swatches.shape === "circle" ? "rounded-full" : SWATCH_ITEM_SQUARE,
        className,
      )}
      style={{ background: swatchBackground(color), color: check, ...style }}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented || inactive || !context.editable) return;
        swatches.setActiveId(id);
        context.change(color);
      }}
      {...props}
    >
      {selected && <CheckIcon aria-hidden="true" />}
    </div>
  );
}
