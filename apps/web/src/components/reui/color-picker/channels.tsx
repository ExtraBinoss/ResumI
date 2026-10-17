// Imported with shadcn CLI from ReUI's Base UI registry (MIT); split by responsibility.
import { clamp, fixed, toSpace } from "./conversion";
import { formatColor, toCss } from "./format";
import {
  ColorPickerChannel,
  ColorPickerColor,
  ColorPickerColorSpace,
  ColorPickerI18nConfig,
  SPACE_CHANNELS,
  Triple,
} from "./types";

export const DEFAULT_SPACE: Record<ColorPickerChannel, ColorPickerColorSpace> =
  {
    hue: "hsv",
    saturation: "hsv",
    brightness: "hsv",
    lightness: "hsl",
    chroma: "oklch",
    red: "rgb",
    green: "rgb",
    blue: "rgb",
    alpha: "rgb",
  };

export const resolveSpace = (
  channel: ColorPickerChannel,
  space: ColorPickerColorSpace | undefined,
) =>
  channel !== "alpha" && space && SPACE_CHANNELS[space].includes(channel)
    ? space
    : DEFAULT_SPACE[channel];

export function channelRange(
  space: ColorPickerColorSpace,
  channel: ColorPickerChannel,
) {
  if (channel === "alpha") return { max: 1, step: 0.01 };
  if (channel === "hue") return { max: 360, step: 1 };
  if (channel === "chroma") return { max: 0.4, step: 0.004 };
  return { max: space === "rgb" ? 255 : 100, step: 1 };
}

export function readChannel(
  color: ColorPickerColor,
  space: ColorPickerColorSpace,
  channel: ColorPickerChannel,
) {
  if (channel === "alpha") return color.alpha;
  return toSpace(color, space)[SPACE_CHANNELS[space].indexOf(channel)];
}

export function withChannel(
  color: ColorPickerColor,
  space: ColorPickerColorSpace,
  channel: ColorPickerChannel,
  value: number,
): ColorPickerColor {
  if (channel === "alpha") return { ...color, alpha: clamp(value, 0, 1) };
  const channels = [...toSpace(color, space)] as Triple;
  channels[SPACE_CHANNELS[space].indexOf(channel)] = value;
  return { space, channels, alpha: color.alpha };
}

export function channelValueText(
  color: ColorPickerColor,
  space: ColorPickerColorSpace,
  channel: ColorPickerChannel,
  i18n: ColorPickerI18nConfig,
) {
  const value = readChannel(color, space, channel);
  if (channel === "alpha") return `${Math.round(value * 100)}%`;
  if (channel === "chroma") return fixed(value, 3);
  if (channel === "hue") {
    return `${Math.round(value)}°, ${i18n.functions.getColorName(color)}`;
  }
  return space === "rgb" ? String(Math.round(value)) : `${Math.round(value)}%`;
}

export function trackStops(
  color: ColorPickerColor,
  space: ColorPickerColorSpace,
  channel: ColorPickerChannel,
) {
  const opaque = { ...color, alpha: 1 };
  if (channel === "alpha") return ["transparent", toCss(opaque)];
  let base = opaque;
  if (channel === "hue") {
    base =
      space === "oklch"
        ? withChannel(
            opaque,
            "oklch",
            "chroma",
            Math.max(readChannel(opaque, "oklch", "chroma"), 0.12),
          )
        : { space: "hsv", channels: [0, 100, 100], alpha: 1 };
  }
  const count =
    channel === "hue" || space === "oklch"
      ? 13
      : space === "hsl" && channel === "lightness"
        ? 3
        : 2;
  const { max } = channelRange(space, channel);
  const target = channel === "hue" && space !== "oklch" ? "hsv" : space;
  return Array.from({ length: count }, (_, index) =>
    formatColor(
      withChannel(base, target, channel, (max * index) / (count - 1)),
      "rgb",
    ),
  );
}

export const CHECKER =
  "repeating-conic-gradient(var(--color-muted) 0 25%, var(--color-background) 0 50%) 50% / 8px 8px";

export const EMPTY_COLOR: ColorPickerColor = {
  space: "hsv",
  channels: [0, 0, 100],
  alpha: 1,
};
