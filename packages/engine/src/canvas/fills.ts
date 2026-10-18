// Adapted from cv-creator-private/src/engine; original checkout kept read-only.
const HEX_COLOR = /#[\da-f]{3,8}\b/i;
const RGB_COLOR =
  /rgba?\(\s*([\d.]+)%?\s*[, ]\s*([\d.]+)%?\s*[, ]\s*([\d.]+)%?/i;

export interface GradientStop {
  id: string;
  offset: number;
  color: string;
}

export interface LinearGradientPaint {
  type: "linear";
  angle: number;
  stops: GradientStop[];
}

function channel(value: string) {
  return Math.max(0, Math.min(255, Math.round(Number(value))));
}

function normalizedHex(value: string) {
  const raw = value.slice(1);
  const expanded =
    raw.length === 3 || raw.length === 4
      ? raw
          .split("")
          .map((part) => part + part)
          .join("")
      : raw;
  return `#${expanded.slice(0, 6).toLowerCase()}`;
}

/**
 * Returns a deterministic solid RGB fallback for paints such as CSS gradients.
 * Canvas/HTML keep the original paint; fixed-paint exporters can use this value.
 */
export function representativeHexColor(value: string, fallback = "#000000") {
  const hex = value.match(HEX_COLOR)?.[0];
  if (hex) return normalizedHex(hex);
  const rgb = value.match(RGB_COLOR);
  if (rgb) {
    const toHex = (part: string) => channel(part).toString(16).padStart(2, "0");
    return `#${toHex(rgb[1])}${toHex(rgb[2])}${toHex(rgb[3])}`;
  }
  return normalizedHex(fallback.match(HEX_COLOR)?.[0] ?? "#000000");
}

const clampUnit = (value: number) =>
  Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));

export function normalizeGradient(
  value?: Partial<LinearGradientPaint>,
): LinearGradientPaint | undefined {
  if (!value) return undefined;
  const source = Array.isArray(value.stops) ? value.stops : [];
  const stops = source.map((stop, index) => ({
    id: typeof stop.id === "string" && stop.id ? stop.id : `stop-${index + 1}`,
    offset: clampUnit(Number(stop.offset)),
    color: representativeHexColor(stop.color ?? "#000000"),
  }));
  const fallback = stops.length
    ? stops
    : [
        { id: "stop-1", offset: 0, color: "#000000" },
        { id: "stop-2", offset: 1, color: "#ffffff" },
      ];
  if (fallback.length === 1)
    fallback.push({
      id: `${fallback[0].id}-end`,
      offset: 1,
      color: fallback[0].color,
    });
  return {
    type: "linear",
    angle: Number.isFinite(value.angle) ? Number(value.angle) : 90,
    stops: fallback.sort((left, right) => left.offset - right.offset),
  };
}

export function paintCss(fill: string, gradient?: LinearGradientPaint) {
  const normalized = normalizeGradient(gradient);
  if (!normalized) return fill;
  const stops = normalized.stops
    .map((stop) => `${stop.color} ${Math.round(stop.offset * 10000) / 100}%`)
    .join(", ");
  return `linear-gradient(${normalized.angle}deg, ${stops})`;
}

export function representativePaintColor(
  fill: string,
  gradient?: LinearGradientPaint,
) {
  return (
    normalizeGradient(gradient)?.stops[0]?.color ?? representativeHexColor(fill)
  );
}

export function svgGradientVector(angle: number) {
  const radians = (angle * Math.PI) / 180;
  const dx = Math.sin(radians) / 2;
  const dy = -Math.cos(radians) / 2;
  return { x1: 0.5 - dx, y1: 0.5 - dy, x2: 0.5 + dx, y2: 0.5 + dy };
}
