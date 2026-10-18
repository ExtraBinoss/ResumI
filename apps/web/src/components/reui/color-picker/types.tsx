// Imported with shadcn CLI from ReUI's Base UI registry (MIT); split by responsibility.

export type ColorPickerFormat = "hex" | "rgb" | "hsl" | "hsb" | "oklch";

export type ColorPickerColorSpace = "rgb" | "hsl" | "hsv" | "oklch";

export type ColorPickerChannel =
  | "hue"
  | "saturation"
  | "brightness"
  | "lightness"
  | "chroma"
  | "red"
  | "green"
  | "blue"
  | "alpha";

export type ColorPickerColor = {
  space: ColorPickerColorSpace;
  channels: [number, number, number];
  alpha: number;
};

export type ColorPickerLabels = {
  /** Trigger text while there is no value. */
  placeholder: string;
  /** Names the popup and an inline panel. */
  panelLabel: string;
  /** The swatch button in `ColorPickerInput`. */
  openPicker: string;
  /** The saturation and brightness area. */
  area: string;
  hue: string;
  saturation: string;
  brightness: string;
  lightness: string;
  chroma: string;
  red: string;
  green: string;
  blue: string;
  alpha: string;
  hex: string;
  format: string;
  eyeDropper: string;
  copy: string;
  copied: string;
  clear: string;
  swatches: string;
};

export type ColorPickerFunctions = {
  /** Names a color for screen readers, in the area, the sliders and unlabelled swatches. */
  getColorName: (color: ColorPickerColor) => string;
};

export type ColorPickerI18nConfig = {
  labels: ColorPickerLabels;
  functions: ColorPickerFunctions;
};

export type ColorPickerI18nOverrides = {
  labels?: Partial<ColorPickerLabels>;
  functions?: Partial<ColorPickerFunctions>;
};

export type Triple = [number, number, number];

export const SPACE_CHANNELS: Record<
  ColorPickerColorSpace,
  [ColorPickerChannel, ColorPickerChannel, ColorPickerChannel]
> = {
  rgb: ["red", "green", "blue"],
  hsl: ["hue", "saturation", "lightness"],
  hsv: ["hue", "saturation", "brightness"],
  oklch: ["lightness", "chroma", "hue"],
};

export const COLOR_PICKER_FORMATS: ColorPickerFormat[] = [
  "hex",
  "rgb",
  "hsl",
  "hsb",
  "oklch",
];

export const FORMAT_LABELS: Record<ColorPickerFormat, string> = {
  hex: "HEX",
  rgb: "RGB",
  hsl: "HSL",
  hsb: "HSB",
  oklch: "OKLCH",
};
