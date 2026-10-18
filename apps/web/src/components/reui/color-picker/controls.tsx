// Imported with shadcn CLI from ReUI's Base UI registry (MIT); split by responsibility.
import { cn } from "cn";
import type { ComponentProps, PointerEvent as ReactPointerEvent } from "react";
import {
  channelRange,
  channelValueText,
  CHECKER,
  readChannel,
  resolveSpace,
  trackStops,
  withChannel,
} from "./channels";
import { useColorPickerContext } from "./context";
import { clamp, toSpace, wrapHue } from "./conversion";
import {
  CONTROL_CLASS,
  copyOnShortcut,
  EDGE_CLASS,
  keyDelta,
  pointerRatio,
  snap,
  THUMB_CLASS,
  travel,
  useDrag,
} from "./gestures";
import { ColorPickerChannel, ColorPickerColorSpace } from "./types";

export const AREA_CLASS =
  "forced-color-adjust-none h-40 w-full touch-none bg-[linear-gradient(to_top,#000,transparent),linear-gradient(to_right,#fff,transparent)] rounded-md";

export type ColorPickerAreaProps = ComponentProps<"div">;

export function ColorPickerArea({
  className,
  style,
  onKeyDown,
  ...props
}: ColorPickerAreaProps) {
  const context = useColorPickerContext("ColorPickerArea");
  const { labels } = context.i18n;
  const [hue, saturation, brightness] = toSpace(context.display, "hsv");
  const set = (s: number, v: number) => {
    const [h] = toSpace(context.getColor(), "hsv");
    context.emit({
      space: "hsv",
      channels: [h, clamp(s, 0, 100), clamp(v, 0, 100)],
      alpha: context.getColor().alpha,
    });
  };
  const { dragging, handlers } = useDrag(context, (event, element) => {
    const { x, y } = pointerRatio(event, element);
    set(x * 100, (1 - y) * 100);
  });

  return (
    <div
      id={`${context.id}-area`}
      role="slider"
      tabIndex={context.disabled ? -1 : 0}
      aria-label={labels.area}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(saturation)}
      aria-valuetext={`${labels.saturation} ${Math.round(saturation)}%, ${labels.brightness} ${Math.round(brightness)}%, ${context.i18n.functions.getColorName(context.display)}`}
      aria-disabled={context.disabled || undefined}
      aria-readonly={context.readOnly || undefined}
      dir="ltr"
      data-slot="color-picker-area"
      data-dragging={dragging ? "" : undefined}
      className={cn(CONTROL_CLASS, EDGE_CLASS, AREA_CLASS, className)}
      style={{ backgroundColor: `hsl(${hue} 100% 50%)`, ...style }}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.defaultPrevented || copyOnShortcut(event, context)) return;
        if (!context.editable) return;
        const delta = keyDelta(event, 1);
        if (delta === null) return;
        event.preventDefault();
        const vertical =
          event.key === "ArrowUp" ||
          event.key === "ArrowDown" ||
          event.key.startsWith("Page");
        context.startInteraction();
        /* Only the channel that moves is rounded to the step. */
        if (vertical) set(saturation, Math.round(brightness) + delta);
        else set(Math.round(saturation) + delta, brightness);
        context.endInteraction();
      }}
      {...handlers}
      {...props}
    >
      <div
        data-slot="color-picker-area-thumb"
        className={THUMB_CLASS}
        style={{ left: `${saturation}%`, top: `${100 - brightness}%` }}
      />
    </div>
  );
}

export const SLIDER_CLASS =
  "forced-color-adjust-none data-[orientation=horizontal]:h-3 data-[orientation=horizontal]:min-h-3 data-[orientation=horizontal]:w-full data-[orientation=horizontal]:min-w-0 data-[orientation=horizontal]:touch-pan-y data-[orientation=vertical]:h-40 data-[orientation=vertical]:shrink-0 data-[orientation=vertical]:w-3 data-[orientation=vertical]:touch-pan-x rounded-full";

export type ColorPickerSliderProps = Omit<ComponentProps<"div">, "children"> & {
  channel: ColorPickerChannel;
  /** The space the channel belongs to. Defaults to HSB for hue, saturation and brightness, HSL for lightness, OKLCH for chroma and RGB for red, green and blue. */
  colorSpace?: ColorPickerColorSpace;
  orientation?: "horizontal" | "vertical";
};

export function ColorPickerSlider({
  channel,
  colorSpace,
  orientation = "horizontal",
  className,
  style,
  onKeyDown,
  ...props
}: ColorPickerSliderProps) {
  const context = useColorPickerContext("ColorPickerSlider");
  const space = resolveSpace(channel, colorSpace);
  const { max, step } = channelRange(space, channel);
  const precision = channel === "chroma" ? 0.001 : step;
  const value = readChannel(context.display, space, channel);
  const vertical = orientation === "vertical";
  const set = (next: number) => {
    context.emit(
      withChannel(
        context.getColor(),
        space,
        channel,
        clamp(snap(next, precision), 0, max),
      ),
    );
  };
  const { dragging, handlers } = useDrag(context, (event, element) => {
    const thumb = element.lastElementChild as HTMLElement | null;
    const inset = (vertical ? thumb?.offsetHeight : thumb?.offsetWidth) ?? 0;
    const { x, y } = pointerRatio(event, element, inset);
    set((vertical ? 1 - y : x) * max);
  });
  /* Stops follow the thumb's travel, so the color under its center is the
     value's own. */
  const colors = trackStops(context.display, space, channel);
  const stops = colors.map(
    (color, index) => `${color} ${travel(index / (colors.length - 1))}`,
  );
  const gradient = `linear-gradient(${vertical ? "to top" : "to right"}, ${stops.join(", ")})`;
  const fraction = clamp(value, 0, max) / max;
  const scale = channel === "alpha" ? 100 : 1;

  return (
    <div
      role="slider"
      tabIndex={context.disabled ? -1 : 0}
      aria-label={context.i18n.labels[channel]}
      aria-orientation={orientation}
      aria-valuemin={0}
      aria-valuemax={max * scale}
      aria-valuenow={Number((value * scale).toFixed(3))}
      aria-valuetext={channelValueText(
        context.display,
        space,
        channel,
        context.i18n,
      )}
      aria-disabled={context.disabled || undefined}
      aria-readonly={context.readOnly || undefined}
      dir="ltr"
      data-slot="color-picker-slider"
      data-channel={channel}
      data-orientation={orientation}
      data-dragging={dragging ? "" : undefined}
      className={cn(CONTROL_CLASS, EDGE_CLASS, SLIDER_CLASS, className)}
      style={{
        background: channel === "alpha" ? `${gradient}, ${CHECKER}` : gradient,
        ...style,
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.defaultPrevented || copyOnShortcut(event, context)) return;
        if (!context.editable) return;
        const delta = keyDelta(event, step);
        if (delta === null) return;
        event.preventDefault();
        context.startInteraction();
        set(snap(value, step) + delta);
        context.endInteraction();
      }}
      {...handlers}
      {...props}
    >
      <div
        data-slot="color-picker-slider-thumb"
        className={THUMB_CLASS}
        style={
          vertical
            ? { left: "50%", top: travel(1 - fraction) }
            : { left: travel(fraction), top: "50%" }
        }
      />
    </div>
  );
}

export const WHEEL_RING_CLASS =
  "forced-color-adjust-none pointer-events-none absolute inset-0 rounded-full bg-[conic-gradient(#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)] mask-[radial-gradient(farthest-side,transparent_calc(100%-var(--color-picker-wheel-thickness)),#000_calc(100%-var(--color-picker-wheel-thickness)+1px))]";

export type ColorPickerWheelProps = ComponentProps<"div">;

export function ColorPickerWheel({
  className,
  children,
  onKeyDown,
  ...props
}: ColorPickerWheelProps) {
  const context = useColorPickerContext("ColorPickerWheel");
  const [hue] = toSpace(context.display, "hsv");
  const set = (next: number) => {
    context.emit(
      withChannel(context.getColor(), "hsv", "hue", wrapHue(Math.round(next))),
    );
  };
  const { dragging, handlers } = useDrag(context, (event, element) => {
    const rect = element.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    set((Math.atan2(x, -y) * 180) / Math.PI);
  });
  /* Only the ring starts a drag. The thumb rides the ring's middle, so the
     hole's edge is that radius times two, less the outer radius. */
  const onPointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const thumb = event.currentTarget
      .querySelector("[data-slot=color-picker-wheel-thumb]")
      ?.getBoundingClientRect();
    if (thumb) {
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const middle = Math.hypot(
        thumb.left + thumb.width / 2 - centerX,
        thumb.top + thumb.height / 2 - centerY,
      );
      const inner = 2 * middle - rect.width / 2;
      const distance = Math.hypot(
        event.clientX - centerX,
        event.clientY - centerY,
      );
      if (distance < inner - 2) return;
    }
    handlers.onPointerDown(event);
  };
  const angle = (hue * Math.PI) / 180;
  const radius = "(50% - var(--color-picker-wheel-thickness) / 2)";

  return (
    <div
      data-slot="color-picker-wheel"
      className={cn(
        "relative size-48 shrink-0 [--color-picker-wheel-thickness:calc(var(--spacing)*5)]",
        className,
      )}
      {...props}
    >
      <div
        role="slider"
        tabIndex={context.disabled ? -1 : 0}
        aria-label={context.i18n.labels.hue}
        aria-valuemin={0}
        aria-valuemax={360}
        aria-valuenow={Math.round(hue)}
        aria-valuetext={channelValueText(
          context.display,
          "hsv",
          "hue",
          context.i18n,
        )}
        aria-disabled={context.disabled || undefined}
        aria-readonly={context.readOnly || undefined}
        data-slot="color-picker-wheel-track"
        data-dragging={dragging ? "" : undefined}
        className={cn(
          CONTROL_CLASS,
          "absolute inset-0 touch-none rounded-full",
        )}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (event.defaultPrevented || copyOnShortcut(event, context)) return;
          if (!context.editable) return;
          const delta = keyDelta(event, 1);
          if (delta === null) return;
          event.preventDefault();
          context.startInteraction();
          set(
            Number.isFinite(delta)
              ? Math.round(hue) + delta
              : delta > 0
                ? 359
                : 0,
          );
          context.endInteraction();
        }}
        {...handlers}
        onPointerDown={onPointerDown}
      >
        <div className={WHEEL_RING_CLASS} />
        <div
          data-slot="color-picker-wheel-thumb"
          className={THUMB_CLASS}
          style={{
            left: `calc(50% + ${radius} * ${Math.sin(angle)})`,
            top: `calc(50% - ${radius} * ${Math.cos(angle)})`,
          }}
        />
      </div>
      {children !== undefined && (
        <div className="absolute inset-[calc(50%-(50%-var(--color-picker-wheel-thickness))*0.7071+var(--spacing)*1.5)] flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
}
