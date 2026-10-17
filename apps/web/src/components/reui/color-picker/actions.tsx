// Imported with shadcn CLI from ReUI's Base UI registry (MIT); split by responsibility.
import { Button } from "@/components/ui/button";
import { CheckIcon, CopyIcon, PipetteIcon } from "lucide-react";
import type { ComponentProps } from "react";
import { useSyncExternalStore } from "react";
import { useColorPickerContext } from "./context";
import { parseColor } from "./parse";
import { ColorPickerFormat } from "./types";

export type EyeDropperConstructor = new () => {
  open: (options?: { signal?: AbortSignal }) => Promise<{ sRGBHex: string }>;
};

export const getEyeDropper = () =>
  (window as unknown as { EyeDropper?: EyeDropperConstructor }).EyeDropper;

export const noSubscribe = () => () => {};

export type ColorPickerActionProps = ComponentProps<typeof Button>;

export function ColorPickerEyeDropper({
  variant = "ghost",
  size = "icon-sm",
  onClick,
  children,
  ...props
}: ColorPickerActionProps) {
  const context = useColorPickerContext("ColorPickerEyeDropper");
  /* False on the server and in the first client render, so markup matches. */
  const supported = useSyncExternalStore(
    noSubscribe,
    () => !!getEyeDropper(),
    () => false,
  );
  if (!supported) return null;
  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      disabled={!context.editable}
      aria-label={context.i18n.labels.eyeDropper}
      data-slot="color-picker-eye-dropper"
      onClick={async (event) => {
        onClick?.(event);
        const EyeDropper = getEyeDropper();
        if (event.defaultPrevented || !EyeDropper) return;
        try {
          const { sRGBHex } = await new EyeDropper().open();
          const picked = parseColor(sRGBHex);
          if (picked) {
            context.change({ ...picked, alpha: context.getColor().alpha });
          }
        } catch {
          /* Escape cancels the sampler with an AbortError. */
        }
      }}
      {...props}
    >
      {children === undefined ? <PipetteIcon aria-hidden="true" /> : children}
    </Button>
  );
}

export type ColorPickerCopyProps = ColorPickerActionProps & {
  /** The format copied. Defaults to the picker's. */
  format?: ColorPickerFormat;
};

export function ColorPickerCopy({
  format,
  variant = "ghost",
  size = "icon-sm",
  onClick,
  children,
  ...props
}: ColorPickerCopyProps) {
  const context = useColorPickerContext("ColorPickerCopy");
  const target = format ?? context.shownFormat;
  const copied = context.copied === target;
  const { labels } = context.i18n;
  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      disabled={context.disabled || !context.color}
      aria-label={copied ? labels.copied : labels.copy}
      aria-keyshortcuts="Control+C Meta+C"
      data-slot="color-picker-copy"
      data-copied={copied ? "" : undefined}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) context.copy(target);
      }}
      {...props}
    >
      {children === undefined ? (
        copied ? (
          <CheckIcon aria-hidden="true" />
        ) : (
          <CopyIcon aria-hidden="true" />
        )
      ) : (
        children
      )}
    </Button>
  );
}

export function ColorPickerClear({
  variant = "ghost",
  size = "sm",
  onClick,
  children,
  ...props
}: ColorPickerActionProps) {
  const context = useColorPickerContext("ColorPickerClear");
  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      disabled={!context.editable}
      data-slot="color-picker-clear"
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) context.change(null);
      }}
      {...props}
    >
      {children === undefined ? context.i18n.labels.clear : children}
    </Button>
  );
}
