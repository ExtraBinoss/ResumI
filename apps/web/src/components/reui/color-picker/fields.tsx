// Imported with shadcn CLI from ReUI's Base UI registry (MIT); split by responsibility.
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Separator } from "@/components/ui/separator";
import { cn } from "cn";
import type { ComponentProps } from "react";
import { Fragment, useRef, useState } from "react";
import { flushSync } from "react-dom";
import {
  channelRange,
  readChannel,
  resolveSpace,
  withChannel,
} from "./channels";
import { assignRef, useColorPickerContext } from "./context";
import { clamp, fixed, wrapHue } from "./conversion";
import { CHEVRON_ICON } from "./display";
import { formatColor } from "./format";
import { copyOnShortcut, snap, useEscapeRevert } from "./gestures";
import { parseColor } from "./parse";
import {
  COLOR_PICKER_FORMATS,
  ColorPickerChannel,
  ColorPickerColor,
  ColorPickerColorSpace,
  ColorPickerFormat,
  FORMAT_LABELS,
} from "./types";

export type FieldChannel = ColorPickerChannel | "hex";

export const FORMAT_FIELDS: Record<
  ColorPickerFormat,
  { space: ColorPickerColorSpace; channels: FieldChannel[] }
> = {
  hex: { space: "rgb", channels: ["hex"] },
  rgb: { space: "rgb", channels: ["red", "green", "blue"] },
  hsl: { space: "hsl", channels: ["hue", "saturation", "lightness"] },
  hsb: { space: "hsv", channels: ["hue", "saturation", "brightness"] },
  oklch: { space: "oklch", channels: ["lightness", "chroma", "hue"] },
};

export function channelText(
  color: ColorPickerColor,
  space: ColorPickerColorSpace,
  channel: FieldChannel,
) {
  if (channel === "hex") {
    return formatColor({ ...color, alpha: 1 }, "hex")
      .slice(1)
      .toUpperCase();
  }
  if (channel === "alpha") return `${Math.round(color.alpha * 100)}%`;
  const value = readChannel(color, space, channel);
  if (channel === "chroma") return fixed(value, 3);
  return space === "oklch" ? fixed(value, 1) : String(Math.round(value));
}

export const FIELD_NUMBER =
  /^([+-]?(?:\d+(?:[.,]\d*)?|[.,]\d+))\s*(%|°|deg|grad|rad|turn)?$/;

export function readChannelText(
  text: string,
  color: ColorPickerColor,
  space: ColorPickerColorSpace,
  channel: FieldChannel,
): ColorPickerColor | null {
  if (channel === "hex") {
    const digits = text.trim().replace(/^#/, "");
    const parsed = /^[\da-f]+$/i.test(digits) ? parseColor(digits) : null;
    if (!parsed) return null;
    return digits.length === 4 || digits.length === 8
      ? parsed
      : { ...parsed, alpha: color.alpha };
  }
  const match = FIELD_NUMBER.exec(text.trim().toLowerCase());
  if (!match) return null;
  const value = Number(match[1].replace(",", "."));
  const unit = match[2];
  if (!Number.isFinite(value)) return null;
  if (channel === "hue") {
    if (unit === "%") return null;
    const degrees =
      unit === "rad"
        ? (value * 180) / Math.PI
        : unit === "grad"
          ? value * 0.9
          : unit === "turn"
            ? value * 360
            : value;
    return withChannel(color, space, channel, wrapHue(degrees));
  }
  if (unit && unit !== "%") return null;
  if (channel === "alpha") return { ...color, alpha: clamp(value / 100, 0, 1) };
  const { max } = channelRange(space, channel);
  const scaled = unit === "%" ? (value * max) / 100 : value;
  return withChannel(color, space, channel, clamp(scaled, 0, max));
}

export type ColorPickerChannelInputProps = Omit<
  ComponentProps<typeof InputGroupInput>,
  "value" | "defaultValue"
> & {
  /** A channel, or `"hex"` for the six hex digits. */
  channel: FieldChannel;
  colorSpace?: ColorPickerColorSpace;
};

export function ColorPickerChannelInput({
  channel,
  colorSpace,
  className,
  onBlur,
  onKeyDown,
  onChange,
  ref,
  ...props
}: ColorPickerChannelInputProps) {
  const context = useColorPickerContext("ColorPickerChannelInput");
  const space = channel === "hex" ? "rgb" : resolveSpace(channel, colorSpace);
  const [text, setText] = useState<string | null>(null);
  const current = channelText(context.display, space, channel);
  const shown = text ?? current;
  const fieldRef = useRef<HTMLInputElement | null>(null);
  const typing = useRef(false);
  useEscapeRevert(fieldRef, text !== null, () => {
    if (typing.current) {
      context.cancelInteraction();
      typing.current = false;
    }
    setText(null);
  });
  const { max } = channelRange(space, channel === "hex" ? "red" : channel);
  /* A number field is a spin button: a screen reader hears its range. */
  const spin =
    channel === "hex"
      ? {}
      : {
          role: "spinbutton",
          "aria-valuemin": 0,
          "aria-valuemax": channel === "alpha" ? 100 : max,
          "aria-valuenow":
            channel === "alpha"
              ? Math.round(context.display.alpha * 100)
              : Number(channelText(context.display, space, channel)),
          "aria-valuetext": shown,
        };

  const read = () => {
    if (text === null) return;
    setText(null);
    const next = readChannelText(text, context.getColor(), space, channel);
    if (typing.current) {
      if (next) context.emit(next);
      context.endInteraction();
      typing.current = false;
    } else if (next && text !== current) context.change(next);
  };

  return (
    <InputGroupInput
      value={shown}
      inputMode={channel === "hex" ? "text" : "decimal"}
      maxLength={channel === "hex" ? 9 : 8}
      disabled={context.disabled}
      readOnly={context.readOnly}
      autoComplete="off"
      autoCorrect="off"
      autoCapitalize="off"
      spellCheck={false}
      aria-label={context.i18n.labels[channel]}
      {...spin}
      data-channel={channel}
      className={cn(
        "h-auto min-w-0 self-stretch pr-1 pl-2 tabular-nums",
        /* Each field starts at its widest value plus padding, in ch so it
           tracks the font, where a tabular digit measures 1.03ch: 255 or 360,
           99.9 for OKLCH lightness, 0.399, 359.9, 100% and six hex digits. A
           short row shrinks every field in proportion. Equal shares clipped
           100% and every OKLCH channel. Text sits left, so the right padding
           is only the gap before the next separator. */
        channel === "hex"
          ? "flex-[1_1_calc(5.8ch+0.75rem)] uppercase"
          : channel === "alpha"
            ? "flex-[1_1_calc(4.8ch+0.75rem)]"
            : space !== "oklch"
              ? "flex-[1_1_calc(3.25ch+0.75rem)]"
              : channel === "lightness"
                ? "flex-[1_1_calc(3.7ch+0.75rem)]"
                : "flex-[1_1_calc(4.7ch+0.75rem)]",
        className,
      )}
      onChange={(event) => {
        onChange?.(event);
        setText(event.target.value);
        const next = readChannelText(
          event.target.value,
          context.getColor(),
          space,
          channel,
        );
        if (next && context.editable) {
          if (!typing.current) {
            typing.current = true;
            context.startInteraction();
          }
          context.emit(next);
        }
      }}
      onBlur={(event) => {
        onBlur?.(event);
        read();
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.defaultPrevented || copyOnShortcut(event, context)) return;
        const step = STEP_KEYS[event.key];
        if (event.key === "Enter") {
          /* Flushed, so an implicit form submit reads the new value. */
          flushSync(() => read());
        } else if (step && channel !== "hex" && context.editable) {
          event.preventDefault();
          read();
          const from = readChannelText(shown, context.display, space, channel);
          if (!from) return;
          const unit =
            channel === "alpha" ? 0.01 : channel === "chroma" ? 0.001 : 1;
          const delta = step * unit * (event.shiftKey ? 10 : 1);
          const { max: top } = channelRange(space, channel);
          const next = snap(readChannel(from, space, channel) + delta, unit);
          setText(null);
          context.change(
            withChannel(
              from,
              space,
              channel,
              channel === "hue" ? wrapHue(next) : clamp(next, 0, top),
            ),
          );
        }
      }}
      {...props}
      ref={(node: HTMLInputElement | null) => {
        fieldRef.current = node;
        assignRef(ref, node);
      }}
    />
  );
}

export const STEP_KEYS: Record<string, number> = {
  ArrowUp: 1,
  ArrowDown: -1,
  PageUp: 10,
  PageDown: -10,
};

export const DIVIDER = <Separator orientation="vertical" aria-hidden="true" />;

export const FORMAT_ADDON_CLASS = "pr-[0.2rem]";

export type ColorPickerFieldsProps = Omit<
  ComponentProps<typeof InputGroup>,
  "children"
> & {
  /** The format shown, controlled. It does not change what `onValueChange` emits. */
  format?: ColorPickerFormat;
  /** Defaults to the picker's `format`. */
  defaultFormat?: ColorPickerFormat;
  onFormatChange?: (format: ColorPickerFormat) => void;
  /** The formats in the menu. One format hides the menu. */
  formats?: ColorPickerFormat[];
};

export function ColorPickerFields({
  format: formatProp,
  defaultFormat,
  onFormatChange,
  formats = COLOR_PICKER_FORMATS,
  className,
  ...props
}: ColorPickerFieldsProps) {
  const context = useColorPickerContext("ColorPickerFields");
  // The picker owns this user preference; no effect mirrors a child's derived value.
  const shown =
    formatProp ?? context.fieldsFormat ?? defaultFormat ?? context.format;
  const fields = FORMAT_FIELDS[shown];
  const menu = formats.length > 1;
  const setFormat = (next: ColorPickerFormat) => {
    if (formatProp === undefined) context.setFieldsFormat(next);
    onFormatChange?.(next);
  };
  const menuProps = {
    size: "xs" as const,
    disabled: context.disabled,
    "aria-label": `${context.i18n.labels.format}, ${FORMAT_LABELS[shown]}`,
    "data-slot": "color-picker-format-trigger",
    className: "gap-1 text-xs font-medium",
  };

  return (
    <InputGroup
      dir="ltr"
      data-slot="color-picker-fields"
      data-disabled={context.disabled ? "" : undefined}
      className={className}
      {...props}
    >
      {menu && (
        <InputGroupAddon align="inline-start" className={FORMAT_ADDON_CLASS}>
          <DropdownMenu>
            <DropdownMenuTrigger render={<InputGroupButton {...menuProps} />}>
              {FORMAT_LABELS[shown]}
              {CHEVRON_ICON}
            </DropdownMenuTrigger>
            {/* A pick's click bubbles through the portal to InputGroupAddon,
                whose own handler would move focus into a field. */}
            <DropdownMenuContent
              align="start"
              className="w-auto min-w-56"
              onClick={(event) => event.stopPropagation()}
            >
              <DropdownMenuRadioGroup
                value={shown}
                onValueChange={(next) => setFormat(next as ColorPickerFormat)}
              >
                {formats.map((item) => (
                  <DropdownMenuRadioItem key={item} value={item} closeOnClick>
                    <span className="w-12 shrink-0 font-medium">
                      {FORMAT_LABELS[item]}
                    </span>
                    <span className="text-muted-foreground truncate text-xs tabular-nums">
                      {formatColor(context.display, item).replace(
                        /^\w+\(|\)$/g,
                        "",
                      )}
                    </span>
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </InputGroupAddon>
      )}
      <div className="flex min-w-0 flex-1 self-stretch">
        {fields.channels.map((channel, index) => (
          <Fragment key={`${shown}-${channel}`}>
            {(menu || index > 0) && DIVIDER}
            <ColorPickerChannelInput
              channel={channel}
              colorSpace={fields.space}
            />
          </Fragment>
        ))}
        {/* Opacity keeps its own width at the end: hex, or the channels,
            take the rest of the row. */}
        {context.alpha && (
          <>
            {DIVIDER}
            <ColorPickerChannelInput
              channel="alpha"
              className="w-[calc(4.8ch+0.75rem)] flex-none"
            />
          </>
        )}
      </div>
    </InputGroup>
  );
}
