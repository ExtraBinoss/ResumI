// Imported with shadcn CLI from ReUI's Base UI registry (MIT); split by responsibility.
import { clamp, linearToOklab, oklabToOklch, wrapHue } from "./conversion";
import {
  D50_TO_SRGB,
  FUNCTION_PATTERN,
  HEX_PATTERN,
  multiply,
  namedColor,
  readNumber,
  RGB_SPACES,
} from "./parse-base";
import { ColorPickerColor, ColorPickerColorSpace, Triple } from "./types";

export function labToXyz([lightness, a, b]: Triple): Triple {
  const kappa = 24389 / 27;
  const epsilon = 216 / 24389;
  const fy = (lightness + 16) / 116;
  const fx = a / 500 + fy;
  const fz = fy - b / 200;
  const x = fx ** 3 > epsilon ? fx ** 3 : (116 * fx - 16) / kappa;
  const y = lightness > kappa * epsilon ? fy ** 3 : lightness / kappa;
  const z = fz ** 3 > epsilon ? fz ** 3 : (116 * fz - 16) / kappa;
  return [x * (0.3457 / 0.3585), y, z * ((1 - 0.3457 - 0.3585) / 0.3585)];
}

export const fromLinearSrgb = (linear: Triple): Triple =>
  oklabToOklch(linearToOklab(linear));

export const isUnit = (channels: Triple) =>
  channels.every((channel) => channel >= -1e-6 && channel <= 1 + 1e-6);

export function readChannels(
  name: string,
  parts: string[],
): { space: ColorPickerColorSpace; channels: Triple } | null {
  if (name === "rgb") {
    const rgb = parts.map((part) => readNumber(part, 255));
    if (rgb.some((value) => value === null)) return null;
    return {
      space: "rgb",
      channels: rgb.map((value) => clamp(value!, 0, 255)) as Triple,
    };
  }
  if (name === "hsl" || name === "hsv" || name === "hsb" || name === "hwb") {
    const hue = readNumber(parts[0], 1, true);
    const first = readNumber(parts[1], 100);
    const second = readNumber(parts[2], 100);
    if (hue === null || first === null || second === null) return null;
    const x = clamp(first, 0, 100);
    const y = clamp(second, 0, 100);
    if (name === "hsl") return { space: "hsl", channels: [hue, x, y] };
    if (name !== "hwb") return { space: "hsv", channels: [hue, x, y] };
    /* hwb(): whiteness and blackness are HSB's saturation and brightness
       read from the other end; summing past 100% gives their gray. */
    const total = x + y;
    if (total >= 100) {
      return { space: "hsv", channels: [hue, 0, (x / total) * 100] };
    }
    const brightness = 100 - y;
    return {
      space: "hsv",
      channels: [hue, (1 - x / brightness) * 100, brightness],
    };
  }
  if (name === "oklch" || name === "oklab") {
    const lightness = readNumber(parts[0], 1);
    const second = readNumber(parts[1], 0.4);
    const third =
      name === "oklch"
        ? readNumber(parts[2], 1, true)
        : readNumber(parts[2], 0.4);
    if (lightness === null || second === null || third === null) return null;
    const l = clamp(lightness, 0, 1);
    if (name === "oklch") {
      return {
        space: "oklch",
        channels: [l * 100, Math.max(0, second), third],
      };
    }
    return {
      space: "oklch",
      channels: oklabToOklch([l, second, third]),
    };
  }
  if (name === "lab" || name === "lch") {
    const lightness = readNumber(parts[0], 100);
    const second = readNumber(parts[1], name === "lab" ? 125 : 150);
    const third =
      name === "lch"
        ? readNumber(parts[2], 1, true)
        : readNumber(parts[2], 125);
    if (lightness === null || second === null || third === null) return null;
    const l = clamp(lightness, 0, 100);
    const angle = (third * Math.PI) / 180;
    const [a, b] =
      name === "lab"
        ? [second, third]
        : [
            Math.max(0, second) * Math.cos(angle),
            Math.max(0, second) * Math.sin(angle),
          ];
    return {
      space: "oklch",
      channels: fromLinearSrgb(multiply(D50_TO_SRGB, labToXyz([l, a, b]))),
    };
  }
  if (name === "color") {
    const target = RGB_SPACES[parts[0]];
    if (!target || parts.length !== 4) return null;
    const values = parts.slice(1).map((part) => readNumber(part, 1));
    if (values.some((value) => value === null)) return null;
    const channels = values as Triple;
    if (parts[0] === "srgb" && isUnit(channels)) {
      return {
        space: "rgb",
        channels: channels.map((value) => clamp(value, 0, 1) * 255) as Triple,
      };
    }
    const linear = channels.map(target.decode) as Triple;
    return {
      space: "oklch",
      channels: fromLinearSrgb(
        target.toSrgb ? multiply(target.toSrgb, linear) : linear,
      ),
    };
  }
  return null;
}

export function parseColor(
  input: string | null | undefined,
): ColorPickerColor | null {
  if (typeof input !== "string") return null;
  const text = input.trim().toLowerCase();
  if (!text) return null;
  if (text === "transparent") {
    return { space: "rgb", channels: [0, 0, 0], alpha: 0 };
  }
  const hex = HEX_PATTERN.exec(namedColor(text) ?? text);
  if (hex) {
    let digits = hex[1];
    if (digits.length <= 4) {
      digits = [...digits].map((digit) => digit + digit).join("");
    }
    const byte = (index: number) =>
      parseInt(digits.slice(index, index + 2), 16);
    return {
      space: "rgb",
      channels: [byte(0), byte(2), byte(4)],
      alpha: digits.length === 8 ? byte(6) / 255 : 1,
    };
  }
  const call = FUNCTION_PATTERN.exec(text);
  if (!call) return null;
  const name = call[1].replace(/a$/, "");
  const [main, slash, ...rest] = call[2].split("/");
  if (rest.length > 0) return null;
  const parts = main.split(/[\s,]+/).filter(Boolean);
  /* color() names its space first, and takes alpha only after a slash. */
  const count = name === "color" ? 4 : 3;
  /* Alpha follows a slash, or is the fourth value of the comma syntax. */
  const alphaToken = slash?.trim() ?? (name === "color" ? undefined : parts[3]);
  if (
    parts.length !== count &&
    !(name !== "color" && parts.length === 4 && slash === undefined)
  ) {
    return null;
  }
  const alpha = alphaToken === undefined ? 1 : readNumber(alphaToken, 1);
  const read = readChannels(name, parts.slice(0, count));
  if (alpha === null || !read) return null;
  const channels = read.channels;
  if (channels.some((channel) => !Number.isFinite(channel))) return null;
  if (read.space !== "rgb") {
    const hueIndex = read.space === "oklch" ? 2 : 0;
    channels[hueIndex] = wrapHue(channels[hueIndex]);
  }
  return { space: read.space, channels, alpha: clamp(alpha, 0, 1) };
}

export const CSS_WIDE =
  /^(inherit|initial|unset|revert|revert-layer|currentcolor)$/;

export function parseWithBrowser(text: string): ColorPickerColor | null {
  if (
    typeof document === "undefined" ||
    CSS_WIDE.test(text.toLowerCase()) ||
    !CSS.supports?.("color", text)
  ) {
    return null;
  }
  const parent = document.createElement("div");
  const probe = document.createElement("div");
  parent.style.display = "none";
  probe.style.color = text;
  parent.appendChild(probe);
  document.body.appendChild(parent);
  parent.style.color = "rgb(1, 2, 3)";
  const first = getComputedStyle(probe).color;
  parent.style.color = "rgb(4, 5, 6)";
  const second = getComputedStyle(probe).color;
  parent.remove();
  return first === second ? parseColor(first) : null;
}
