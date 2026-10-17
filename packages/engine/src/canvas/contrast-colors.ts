// Contrast analysis adapted from cv-creator-private; no renderer or browser dependency.
export interface Rgba {
  r: number;
  g: number;
  b: number;
  a: number;
}
export const transparentPixel: Rgba = { r: 0, g: 0, b: 0, a: 0 };
export function colorPixel(value: string): Rgba | null {
  if (value === "transparent") return transparentPixel;
  if (!/^#[\da-f]{6}([\da-f]{2})?$/i.test(value)) return null;
  return {
    r: parseInt(value.slice(1, 3), 16),
    g: parseInt(value.slice(3, 5), 16),
    b: parseInt(value.slice(5, 7), 16),
    a: value.length === 9 ? parseInt(value.slice(7, 9), 16) / 255 : 1,
  };
}
export function pixelHex(pixel: Rgba) {
  return `#${[pixel.r, pixel.g, pixel.b].map((channel) => Math.round(channel).toString(16).padStart(2, "0")).join("")}`;
}
export function pixelOpacity(pixel: Rgba, opacity: number): Rgba {
  return { ...pixel, a: pixel.a * opacity };
}
export function compositePixel(foreground: Rgba, background: Rgba): Rgba {
  const a = foreground.a + background.a * (1 - foreground.a);
  if (!a) return transparentPixel;
  return {
    r:
      (foreground.r * foreground.a +
        background.r * background.a * (1 - foreground.a)) /
      a,
    g:
      (foreground.g * foreground.a +
        background.g * background.a * (1 - foreground.a)) /
      a,
    b:
      (foreground.b * foreground.a +
        background.b * background.a * (1 - foreground.a)) /
      a,
    a,
  };
}
function channel(value: number) {
  const srgb = value / 255;
  return srgb <= 0.04045 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
}
function luminance(pixel: Rgba) {
  return (
    0.2126 * channel(pixel.r) +
    0.7152 * channel(pixel.g) +
    0.0722 * channel(pixel.b)
  );
}
export function relativeLuminance(color: string): number | null {
  const pixel = colorPixel(color);
  return pixel?.a === 1 ? luminance(pixel) : null;
}
export function pixelContrast(foreground: Rgba, background: Rgba) {
  const first = luminance(foreground),
    second = luminance(background);
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}
/** An uncomposited transparent color has no standalone contrast ratio. */
export function contrastRatio(
  foreground: string,
  background: string,
): number | null {
  const first = colorPixel(foreground),
    second = colorPixel(background);
  return first?.a === 1 && second?.a === 1
    ? pixelContrast(first, second)
    : null;
}
