// Imported with shadcn CLI from ReUI's Base UI registry (MIT); split by responsibility.
import { ColorPickerColor, ColorPickerColorSpace, Triple } from "./types";

export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export const wrapHue = (hue: number) => ((hue % 360) + 360) % 360;

export const fixed = (value: number, digits: number) =>
  String(Number(value.toFixed(digits)) + 0);

export function rgbToHsv([red, green, blue]: Triple, fallbackHue = 0): Triple {
  const r = red / 255;
  const g = green / 255;
  const b = blue / 255;
  const max = Math.max(r, g, b);
  const delta = max - Math.min(r, g, b);
  let hue = fallbackHue;
  if (delta > 1e-9) {
    hue =
      max === r
        ? ((g - b) / delta) % 6
        : max === g
          ? (b - r) / delta + 2
          : (r - g) / delta + 4;
    hue = wrapHue(hue * 60);
  }
  return [hue, max === 0 ? 0 : (delta / max) * 100, max * 100];
}

export function hsvToRgb([hue, saturation, brightness]: Triple): Triple {
  const s = saturation / 100;
  const v = brightness / 100;
  const channel = (n: number) => {
    const k = (n + hue / 60) % 6;
    return (v - v * s * Math.max(0, Math.min(k, 4 - k, 1))) * 255;
  };
  return [channel(5), channel(3), channel(1)];
}

export function hsvToHsl([hue, saturation, brightness]: Triple): Triple {
  const s = saturation / 100;
  const v = brightness / 100;
  const l = v * (1 - s / 2);
  const sl = l === 0 || l === 1 ? 0 : (v - l) / Math.min(l, 1 - l);
  return [hue, sl * 100, l * 100];
}

export function hslToHsv([hue, saturation, lightness]: Triple): Triple {
  const s = saturation / 100;
  const l = lightness / 100;
  const v = l + s * Math.min(l, 1 - l);
  return [hue, v === 0 ? 0 : 2 * (1 - l / v) * 100, v * 100];
}

export const toLinear = (channel: number) => {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};

export const fromLinear = (channel: number) =>
  255 *
  (channel <= 0.0031308
    ? 12.92 * channel
    : 1.055 * channel ** (1 / 2.4) - 0.055);

export function linearToOklab([r, g, b]: Triple): Triple {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

export function oklabToOklch(
  [lightness, a, b]: Triple,
  fallbackHue = 0,
): Triple {
  const chroma = Math.sqrt(a * a + b * b);
  const hue =
    chroma < 1e-4 ? fallbackHue : wrapHue((Math.atan2(b, a) * 180) / Math.PI);
  return [lightness * 100, chroma, hue];
}

export function rgbToOklch(rgb: Triple, fallbackHue = 0): Triple {
  return oklabToOklch(linearToOklab(rgb.map(toLinear) as Triple), fallbackHue);
}

export function oklchToLinear([lightness, chroma, hue]: Triple): Triple {
  const angle = (hue * Math.PI) / 180;
  const L = lightness / 100;
  const a = chroma * Math.cos(angle);
  const b = chroma * Math.sin(angle);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

export const inSrgb = (linear: Triple) =>
  linear.every((channel) => channel >= -1e-4 && channel <= 1 + 1e-4);

export const clipLinear = (linear: Triple) =>
  linear.map((channel) => clamp(channel, 0, 1)) as Triple;

export function clipError(clipped: Triple, [lightness, chroma, hue]: Triple) {
  const [l, a, b] = linearToOklab(clipped);
  const angle = (hue * Math.PI) / 180;
  return Math.hypot(
    l - lightness / 100,
    a - chroma * Math.cos(angle),
    b - chroma * Math.sin(angle),
  );
}

export function oklchToRgb([lightness, chroma, hue]: Triple): Triple {
  const encode = (linear: Triple) =>
    linear.map((channel) => fromLinear(channel)) as Triple;
  if (lightness >= 100) return [255, 255, 255];
  if (lightness <= 0) return [0, 0, 0];
  const target: Triple = [lightness, Math.max(0, chroma), hue];
  const origin = oklchToLinear(target);
  if (inSrgb(origin)) return encode(clipLinear(origin));
  let clipped = clipLinear(origin);
  if (clipError(clipped, target) < 0.02) return encode(clipped);
  let low = 0;
  let high = target[1];
  let lowInGamut = true;
  while (high - low > 1e-4) {
    const mid = (low + high) / 2;
    const current: Triple = [lightness, mid, hue];
    const linear = oklchToLinear(current);
    if (lowInGamut && inSrgb(linear)) {
      low = mid;
      continue;
    }
    clipped = clipLinear(linear);
    const error = clipError(clipped, current);
    if (error < 0.02) {
      if (0.02 - error < 1e-4) break;
      lowInGamut = false;
      low = mid;
    } else {
      high = mid;
    }
  }
  return encode(clipped);
}

export function toRgb(color: ColorPickerColor): Triple {
  const { space, channels } = color;
  if (space === "rgb") return channels;
  if (space === "hsv") return hsvToRgb(channels);
  if (space === "hsl") return hsvToRgb(hslToHsv(channels));
  return oklchToRgb(channels);
}

export function toSpace(
  color: ColorPickerColor,
  space: ColorPickerColorSpace,
): Triple {
  const { space: from, channels } = color;
  if (from === space) return channels;
  if (from === "hsv" && space === "hsl") return hsvToHsl(channels);
  if (from === "hsl" && space === "hsv") return hslToHsv(channels);
  const rgb = toRgb(color);
  const hue = from === "rgb" ? 0 : channels[from === "oklch" ? 2 : 0];
  if (space === "rgb") return rgb;
  if (space === "hsv") return rgbToHsv(rgb, hue);
  if (space === "hsl") return hsvToHsl(rgbToHsv(rgb, hue));
  return rgbToOklch(rgb, hue);
}

export function isColorInSrgb(color: ColorPickerColor) {
  return color.space !== "oklch" || inSrgb(oklchToLinear(color.channels));
}
