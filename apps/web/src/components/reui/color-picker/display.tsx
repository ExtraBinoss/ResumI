// Imported with shadcn CLI from ReUI's Base UI registry (MIT); split by responsibility.
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { PopoverTrigger } from "@/components/ui/popover";
import { cn } from "cn";
import { ChevronDownIcon } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { useContext, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { CHECKER } from "./channels";
import {
  assignRef,
  ColorPickerContext,
  useColorPickerContext,
} from "./context";
import { toCss } from "./format";
import { copyOnShortcut, useEscapeRevert } from "./gestures";
import { parseColor, parseWithBrowser } from "./parse";
import { ColorPickerColor } from "./types";

export const SWATCH_CLASS =
  "forced-color-adjust-none relative inline-flex size-4 shrink-0 after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:inset-ring after:inset-ring-foreground/10";

export const SWATCH_SQUARE = "rounded-[4px]";

export const EMPTY_SWATCH =
  "linear-gradient(to top right, transparent calc(50% - 0.75px), var(--color-destructive) calc(50% - 0.75px) calc(50% + 0.75px), transparent calc(50% + 0.75px))";

export function swatchBackground(color: ColorPickerColor | null) {
  if (!color) return EMPTY_SWATCH;
  const css = toCss(color);
  return color.alpha < 1 ? `linear-gradient(${css}, ${css}), ${CHECKER}` : css;
}

export type ColorPickerSwatchProps = Omit<ComponentProps<"span">, "color"> & {
  /** The color to show. Defaults to the picker's value, so it also works outside one. */
  color?: string | null;
  /** `square` follows each style's radius; `circle` is round in all of them. */
  shape?: "square" | "circle";
};

export function ColorPickerSwatch({
  color: colorProp,
  shape = "square",
  className,
  style,
  ...props
}: ColorPickerSwatchProps) {
  const context = useContext(ColorPickerContext);
  const color =
    colorProp !== undefined ? parseColor(colorProp) : (context?.color ?? null);
  const labelled = !!props["aria-label"] || !!props["aria-labelledby"];
  return (
    <span
      role={labelled ? "img" : undefined}
      aria-hidden={labelled ? undefined : true}
      data-slot="color-picker-swatch"
      data-empty={color ? undefined : ""}
      className={cn(
        SWATCH_CLASS,
        shape === "circle" ? "rounded-full" : SWATCH_SQUARE,
        className,
      )}
      style={{ background: swatchBackground(color), ...style }}
      {...props}
    />
  );
}

export const CHEVRON_ICON = <ChevronDownIcon aria-hidden="true" />;

export type ColorPickerValueProps = Omit<ComponentProps<"span">, "children"> & {
  placeholder?: ReactNode;
};

export function ColorPickerValue({
  placeholder,
  className,
  ...props
}: ColorPickerValueProps) {
  const context = useColorPickerContext("ColorPickerValue");
  return (
    <span
      data-slot="color-picker-value"
      data-placeholder={context.color ? undefined : ""}
      className={cn("truncate", className)}
      {...props}
    >
      {context.text ?? placeholder ?? context.i18n.labels.placeholder}
    </span>
  );
}

export const TRIGGER_CLASS =
  "font-normal normal-case tracking-normal tabular-nums data-placeholder:text-muted-foreground";

export type ColorPickerTriggerProps = ComponentProps<typeof Button> & {
  placeholder?: ReactNode;
};

export function ColorPickerTrigger({
  className,
  variant = "outline",
  placeholder,
  children,
  ref,
  ...props
}: ColorPickerTriggerProps) {
  const context = useColorPickerContext("ColorPickerTrigger");
  const labelledBy = props["aria-labelledby"] ?? context.labelledBy;
  const buttonProps = {
    variant,
    disabled: context.disabled,
    "aria-label": context.label,
    "aria-describedby": context.describedBy,
    ...(context.invalid && { "aria-invalid": true, "data-invalid": "" }),
    ...props,
    /* The label, then the button's own text: a label alone would replace the
       value, or whatever custom children show. */
    "aria-labelledby": labelledBy ? `${labelledBy} ${context.id}` : undefined,
    onKeyDown: (event: Parameters<NonNullable<typeof props.onKeyDown>>[0]) => {
      props.onKeyDown?.(event);
      if (!event.defaultPrevented) copyOnShortcut(event, context);
    },
    id: context.id,
    ref: (node: HTMLButtonElement | null) => {
      context.registerFocusTarget(node);
      assignRef(ref, node);
    },
    "data-slot": "color-picker-trigger",
    "data-placeholder": context.color ? undefined : "",
    className: cn(
      TRIGGER_CLASS,
      children === undefined && "justify-start",
      className,
    ),
  };
  const content =
    children === undefined ? (
      <>
        <ColorPickerSwatch data-icon="inline-start" />
        <ColorPickerValue
          placeholder={placeholder}
          className="flex-1 text-start"
        />
        <span
          data-icon="inline-end"
          aria-hidden="true"
          className="text-muted-foreground flex"
        >
          {CHEVRON_ICON}
        </span>
      </>
    ) : (
      children
    );

  return (
    <PopoverTrigger id={context.id} render={<Button {...buttonProps} />}>
      {content}
    </PopoverTrigger>
  );
}

export type ColorPickerInputProps = Omit<
  ComponentProps<typeof InputGroupInput>,
  "value" | "defaultValue"
>;

export function ColorPickerInput({
  className,
  placeholder,
  onBlur,
  onKeyDown,
  onChange,
  ref,
  ...props
}: ColorPickerInputProps) {
  const context = useColorPickerContext("ColorPickerInput");
  /* `null` while the field shows the value rather than an edit in progress. */
  const [text, setText] = useState<string | null>(null);
  const current = context.text ?? "";
  const shown = text ?? current;
  const fieldRef = useRef<HTMLInputElement | null>(null);
  useEscapeRevert(fieldRef, text !== null, () => setText(null));

  const read = () => {
    if (text === null) return;
    setText(null);
    if (text === current) return;
    if (!text.trim()) return context.change(null);
    const typed = parseColor(text) ?? parseWithBrowser(text.trim());
    if (typed) context.change(typed);
  };

  const swatchProps = {
    size: "icon-xs" as const,
    disabled: context.disabled,
    "aria-label": context.i18n.labels.openPicker,
    "data-slot": "color-picker-input-trigger",
  };

  return (
    <InputGroup
      data-slot="color-picker-input"
      data-disabled={context.disabled ? "" : undefined}
      className={className}
    >
      <InputGroupAddon align="inline-start">
        <PopoverTrigger render={<InputGroupButton {...swatchProps} />}>
          <ColorPickerSwatch />
        </PopoverTrigger>
      </InputGroupAddon>
      <InputGroupInput
        value={shown}
        placeholder={placeholder ?? context.i18n.labels.placeholder}
        disabled={context.disabled}
        readOnly={context.readOnly}
        required={context.required}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        aria-keyshortcuts="Alt+ArrowDown"
        aria-label={context.label}
        aria-labelledby={context.labelledBy}
        aria-describedby={context.describedBy}
        aria-invalid={context.invalid || undefined}
        className="tabular-nums"
        onChange={(event) => {
          onChange?.(event);
          setText(event.target.value);
        }}
        onBlur={(event) => {
          onBlur?.(event);
          read();
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (event.defaultPrevented || copyOnShortcut(event, context)) return;
          if (event.key === "Enter") {
            /* Flushed, so an implicit form submit reads the new value. */
            flushSync(() => read());
          } else if (event.altKey && event.key === "ArrowDown") {
            event.preventDefault();
            read();
            context.setOpen(true);
          }
        }}
        {...props}
        id={context.id}
        ref={(node: HTMLInputElement | null) => {
          fieldRef.current = node;
          context.registerFocusTarget(node);
          assignRef(ref, node);
        }}
      />
    </InputGroup>
  );
}
