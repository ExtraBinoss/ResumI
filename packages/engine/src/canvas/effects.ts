// Adapted from cv-creator-private/src/engine; original checkout kept read-only.
export interface VisualEffects {
  blur: number;
  grain: number;
  grainSize: number;
  dither: number;
  brightness: number;
  contrast: number;
  saturation: number;
}

export const DEFAULT_VISUAL_EFFECTS: VisualEffects = {
  blur: 0,
  grain: 0,
  grainSize: 2,
  dither: 0,
  brightness: 1,
  contrast: 1,
  saturation: 1,
};

const finite = (value: unknown, fallback: number) =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback;
const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(maximum, Math.max(minimum, value));

export function normalizeEffects(
  value?: Partial<VisualEffects>,
): VisualEffects {
  return {
    blur: clamp(finite(value?.blur, 0), 0, 64),
    grain: clamp(finite(value?.grain, 0), 0, 1),
    grainSize: clamp(finite(value?.grainSize, 2), 0.5, 12),
    dither: clamp(finite(value?.dither, 0), 0, 1),
    brightness: clamp(finite(value?.brightness, 1), 0, 3),
    contrast: clamp(finite(value?.contrast, 1), 0, 3),
    saturation: clamp(finite(value?.saturation, 1), 0, 3),
  };
}

export function hasVisualEffects(value?: Partial<VisualEffects>) {
  const effects = normalizeEffects(value);
  return (
    effects.blur > 0 ||
    effects.grain > 0 ||
    effects.dither > 0 ||
    effects.brightness !== 1 ||
    effects.contrast !== 1 ||
    effects.saturation !== 1
  );
}

export function effectFilterId(id: string) {
  return `folio-fx-${id.replace(/[^a-zA-Z0-9_-]/g, "-")}`;
}

function number(value: number) {
  return String(Math.round(value * 10000) / 10000);
}

function escapeAttribute(value: string) {
  return value.replace(
    /[&<>'"]/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;",
      })[character] ?? character,
  );
}

export function visualEffectFilterMarkup(
  id: string,
  value?: Partial<VisualEffects>,
) {
  const effects = normalizeEffects(value);
  if (!hasVisualEffects(effects)) return "";
  const filterId = escapeAttribute(effectFilterId(id));
  const contrastOffset = 0.5 - effects.contrast * 0.5;
  const frequency = 0.72 / effects.grainSize;
  const discrete = "0 0.2 0.4 0.6 0.8 1";
  const dithered =
    effects.dither > 0
      ? `<feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="1" seed="19" stitchTiles="stitch" result="ditherNoise"/><feColorMatrix in="ditherNoise" type="matrix" values=".12 0 0 0 .44 0 .12 0 0 .44 0 0 .12 0 .44 0 0 0 1 0" result="ditherPattern"/><feBlend in="graded" in2="ditherPattern" mode="overlay" result="ditherInput"/><feComponentTransfer in="ditherInput" result="dithered"><feFuncR type="discrete" tableValues="${discrete}"/><feFuncG type="discrete" tableValues="${discrete}"/><feFuncB type="discrete" tableValues="${discrete}"/></feComponentTransfer><feComposite in="dithered" in2="graded" operator="arithmetic" k2="${number(effects.dither)}" k3="${number(1 - effects.dither)}" result="processed"/>`
      : '<feComposite in="graded" in2="graded" operator="over" result="processed"/>';
  const grained =
    effects.grain > 0
      ? `<feTurbulence type="fractalNoise" baseFrequency="${number(frequency)}" numOctaves="2" seed="7" stitchTiles="stitch" result="noise"/><feColorMatrix in="noise" type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 ${number(effects.grain)} 0" result="grain"/><feComposite in="grain" in2="SourceAlpha" operator="in" result="maskedGrain"/><feBlend in="processed" in2="maskedGrain" mode="soft-light"/>`
      : '<feComposite in="processed" in2="processed" operator="over"/>';
  return `<svg aria-hidden="true" width="0" height="0" style="position:absolute"><defs><filter id="${filterId}" x="-50%" y="-50%" width="200%" height="200%" color-interpolation-filters="sRGB"><feGaussianBlur in="SourceGraphic" stdDeviation="${number(effects.blur)}" result="softened"/><feColorMatrix in="softened" type="saturate" values="${number(effects.saturation)}" result="saturated"/><feComponentTransfer in="saturated" result="graded"><feFuncR type="linear" slope="${number(effects.brightness * effects.contrast)}" intercept="${number(contrastOffset)}"/><feFuncG type="linear" slope="${number(effects.brightness * effects.contrast)}" intercept="${number(contrastOffset)}"/><feFuncB type="linear" slope="${number(effects.brightness * effects.contrast)}" intercept="${number(contrastOffset)}"/></feComponentTransfer>${dithered}${grained}</filter></defs></svg>`;
}

export function visualEffectStyle(id: string, value?: Partial<VisualEffects>) {
  const filter = visualEffectFilterValue(id, value);
  return filter ? `filter:${filter}` : "";
}

export function visualEffectFilterValue(
  id: string,
  value?: Partial<VisualEffects>,
) {
  return hasVisualEffects(value) ? `url(#${effectFilterId(id)})` : "";
}
