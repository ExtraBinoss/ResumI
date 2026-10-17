// Imported with shadcn CLI from ReUI's Base UI registry (MIT); split by responsibility.
import { PopoverContent } from "@/components/ui/popover";
import { cn } from "cn";
import type { ComponentProps } from "react";
import { useContext } from "react";
import { ColorPickerCopy, ColorPickerEyeDropper } from "./actions";
import { SurfaceContext, useColorPickerContext } from "./context";
import { ColorPickerArea, ColorPickerSlider } from "./controls";
import { ColorPickerFields } from "./fields";
import { ColorPickerSwatches } from "./swatches";

export const TABBABLE =
  'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])';

export type ColorPickerContentProps = ComponentProps<typeof PopoverContent>;

export function ColorPickerContent({
  className,
  align = "start",
  onKeyDown,
  children,
  ...props
}: ColorPickerContentProps) {
  const context = useColorPickerContext("ColorPickerContent");
  return (
    <PopoverContent
      align={align}
      aria-labelledby={context.labelledBy}
      aria-label={
        context.labelledBy
          ? undefined
          : (context.label ?? context.i18n.labels.panelLabel)
      }
      /* OKLCH with opacity needs the extra width for its four fields, and
         more below md, where the shadcn input's text grows to 16px so iOS
         does not zoom on focus. Capped to the viewport. A variable, not
         md:w-*, so one plain w-* in className wins at every breakpoint. */
      className={cn(
        "w-(--color-picker-content-width) max-w-[calc(100vw-1rem)]",
        context.alpha
          ? "[--color-picker-content-width:--spacing(96)] md:[--color-picker-content-width:--spacing(84)]"
          : "[--color-picker-content-width:--spacing(72)]",
        className,
      )}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.defaultPrevented || event.key !== "Tab") return;
        if (event.altKey || event.ctrlKey || event.metaKey) return;
        const items = Array.from(
          event.currentTarget.querySelectorAll<HTMLElement>(TABBABLE),
        );
        const active = event.currentTarget.ownerDocument.activeElement;
        const first = items[0];
        const last = items[items.length - 1];
        if (!event.shiftKey && active === last) {
          event.preventDefault();
          first?.focus();
        } else if (event.shiftKey && active === first) {
          event.preventDefault();
          last?.focus();
        }
      }}
      {...props}
    >
      <SurfaceContext.Provider value="popup">
        {children === undefined ? <ColorPickerPanel /> : children}
      </SurfaceContext.Provider>
    </PopoverContent>
  );
}

export const PANEL_CLASS = "flex w-full min-w-0 flex-col gap-2.5";

export type ColorPickerPanelProps = ComponentProps<"div">;

export function ColorPickerPanel({
  className,
  children,
  ...props
}: ColorPickerPanelProps) {
  const context = useColorPickerContext("ColorPickerPanel");
  const inline = useContext(SurfaceContext) === "inline";
  return (
    <div
      role={inline ? "group" : undefined}
      aria-labelledby={inline ? context.labelledBy : undefined}
      aria-label={
        inline && !context.labelledBy
          ? (context.label ?? context.i18n.labels.panelLabel)
          : undefined
      }
      data-slot="color-picker-panel"
      data-disabled={context.disabled ? "" : undefined}
      className={cn(PANEL_CLASS, className)}
      {...props}
    >
      {children === undefined ? (
        <>
          <ColorPickerArea />
          <div className="flex items-center gap-3">
            <ColorPickerEyeDropper />
            <div className="flex min-w-0 flex-1 flex-col gap-2.5">
              <ColorPickerSlider channel="hue" />
              {context.alpha && <ColorPickerSlider channel="alpha" />}
            </div>
            <ColorPickerCopy />
          </div>
          <ColorPickerFields />
          {context.swatches && context.swatches.length > 0 && (
            <ColorPickerSwatches colors={context.swatches} />
          )}
        </>
      ) : (
        children
      )}
    </div>
  );
}
