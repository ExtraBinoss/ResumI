// Imported with shadcn CLI from ReUI's Base UI registry (MIT); split by responsibility.
import { clamp, fixed, toLinear, toRgb, toSpace, wrapHue } from "./conversion";
import { parseColor } from "./parse";
import {
  ColorPickerColor,
  ColorPickerFormat,
  ColorPickerI18nConfig,
  ColorPickerI18nOverrides,
  Triple,
} from "./types";

export function formatColor(
  color: ColorPickerColor,
  format: ColorPickerFormat,
): string {
  const alpha = clamp(color.alpha, 0, 1);
  /* Decided on the rounded alpha, so 0.996 writes no "/ 1" tail. */
  const tail = fixed(alpha, 2) !== "1" ? ` / ${fixed(alpha, 2)}` : "";
  if (format === "hex" || format === "rgb") {
    const rgb = toRgb(color).map((channel) =>
      Math.round(clamp(channel, 0, 255)),
    );
    if (format === "rgb") return `rgb(${rgb.join(" ")}${tail})`;
    const opacity = Math.round(alpha * 255);
    const bytes = opacity < 255 ? [...rgb, opacity] : rgb;
    return `#${bytes.map((byte) => byte.toString(16).padStart(2, "0")).join("")}`;
  }
  if (format === "oklch") {
    const [l, c, h] = toSpace(color, "oklch");
    /* Fine enough that hex to OKLCH and back is exact: 0 of 140,608 colors
       drift, where 0.1% and 3 decimals moved 29,278 by up to 7. */
    /* Chroma is never below 0, and a hue that rounds to 360 is 0. */
    const hue = fixed(wrapHue(Number(h.toFixed(3))), 3);
    return `oklch(${fixed(l, 2)}% ${fixed(Math.max(0, c), 5)} ${hue}${tail})`;
  }
  const [h, s, third] = toSpace(color, format === "hsl" ? "hsl" : "hsv");
  return `${format}(${fixed(h, 1)} ${fixed(s, 1)}% ${fixed(third, 1)}%${tail})`;
}

export const toCss = (color: ColorPickerColor) =>
  formatColor(color, color.space === "oklch" ? "oklch" : "rgb");

export function luminance(rgb: Triple) {
  const [r, g, b] = rgb.map(toLinear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function over(top: ColorPickerColor, bottom: Triple): Triple {
  const rgb = toRgb(top);
  return rgb.map(
    (channel, index) => channel * top.alpha + bottom[index] * (1 - top.alpha),
  ) as Triple;
}

export function getContrastRatio(
  foreground: string | ColorPickerColor,
  background: string | ColorPickerColor,
): number | null {
  const front =
    typeof foreground === "string" ? parseColor(foreground) : foreground;
  const back =
    typeof background === "string" ? parseColor(background) : background;
  if (!front || !back) return null;
  const base = over(back, [255, 255, 255]);
  const a = luminance(over(front, base));
  const b = luminance(base);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

export const FOREGROUND_SWITCH = 0.36;

export function getForegroundColor(
  background: string | ColorPickerColor,
  {
    light = "#ffffff",
    dark = "#0a0a0a",
  }: { light?: string; dark?: string } = {},
): string | null {
  const color =
    typeof background === "string" ? parseColor(background) : background;
  if (!color) return null;
  return luminance(over(color, [255, 255, 255])) < FOREGROUND_SWITCH &&
    (getContrastRatio(light, color) ?? 0) >= 3
    ? light
    : dark;
}

export const HUE_NAMES: Array<[number, string]> = [
  [15, "pink"],
  [45, "red"],
  [80, "orange"],
  [120, "yellow"],
  [135, "lime"],
  [165, "green"],
  [205, "cyan"],
  [250, "sky blue"],
  [280, "blue"],
  [300, "violet"],
  [320, "purple"],
  [345, "magenta"],
  [360, "pink"],
];

export function nameColor(color: ColorPickerColor) {
  const [lightness, chroma, hue] = toSpace(color, "oklch");
  const l = lightness / 100;
  if (chroma < 0.025) {
    if (l < 0.2) return "black";
    if (l < 0.45) return "dark gray";
    if (l < 0.75) return "gray";
    return l < 0.95 ? "light gray" : "white";
  }
  let name = HUE_NAMES.find(([end]) => hue < end)?.[1] ?? "pink";
  if (l < 0.6 && hue >= 40 && hue < 100) name = "brown";
  else if (l < 0.6 && hue >= 100 && hue < 135) name = "olive";
  const tone = chroma < 0.07 ? "grayish " : chroma > 0.2 ? "vibrant " : "";
  const shade = l < 0.45 ? "dark " : l > 0.82 ? "light " : "";
  return `${shade}${tone}${name}`;
}

export const DEFAULT_COLOR_PICKER_I18N: ColorPickerI18nConfig = {
  labels: {
    placeholder: "Select color",
    panelLabel: "Choose color",
    openPicker: "Open color picker",
    area: "Color",
    hue: "Hue",
    saturation: "Saturation",
    brightness: "Brightness",
    lightness: "Lightness",
    chroma: "Chroma",
    red: "Red",
    green: "Green",
    blue: "Blue",
    alpha: "Opacity",
    hex: "Hex",
    format: "Color format",
    eyeDropper: "Pick a color from the screen",
    copy: "Copy color",
    copied: "Copied",
    clear: "Clear",
    swatches: "Swatches",
  },
  functions: { getColorName: nameColor },
};

export function mergeColorPickerI18n(
  overrides?: ColorPickerI18nOverrides,
): ColorPickerI18nConfig {
  if (!overrides?.labels && !overrides?.functions) {
    return DEFAULT_COLOR_PICKER_I18N;
  }
  return {
    labels: { ...DEFAULT_COLOR_PICKER_I18N.labels, ...overrides.labels },
    functions: {
      ...DEFAULT_COLOR_PICKER_I18N.functions,
      ...overrides.functions,
    },
  };
}
