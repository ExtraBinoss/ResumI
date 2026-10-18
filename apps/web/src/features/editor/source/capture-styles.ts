import type { LayerPatch } from "@resumi/engine";

/** Self-contained computed-paint adapter, serialized with the isolated capture. */
export function captureStyles() {
  const styleCache = new WeakMap<Element, CSSStyleDeclaration>();
  function style(element: Element) {
    let value = styleCache.get(element);
    if (!value) {
      value = getComputedStyle(element);
      styleCache.set(element, value);
    }
    return value;
  }
  const colorCanvas = document.createElement("canvas");
  colorCanvas.width = colorCanvas.height = 1;
  const colorContext = colorCanvas.getContext("2d", {
    willReadFrequently: true,
  })!;
  const colors = new Map<string, string>();
  function color(value: string) {
    if (!value || value === "none" || value === "transparent")
      return "transparent";
    const cached = colors.get(value);
    if (cached) return cached;
    colorContext.clearRect(0, 0, 1, 1);
    colorContext.fillStyle = value;
    colorContext.fillRect(0, 0, 1, 1);
    const bytes = colorContext.getImageData(0, 0, 1, 1).data;
    const result =
      bytes[3] === 0
        ? "transparent"
        : "#" +
          [...bytes]
            .slice(0, bytes[3] === 255 ? 3 : 4)
            .map((n) => n.toString(16).padStart(2, "0"))
            .join("");
    colors.set(value, result);
    return result;
  }
  const px = (value: string) => Number.parseFloat(value) || 0;
  const round = (value: number) => Math.round(value * 1000) / 1000;
  const clamp = (value: number, min: number, max: number) =>
    Math.min(max, Math.max(min, value));
  const family = (value: string) =>
    value.replace(/[^a-zA-Z0-9 '",._-]/g, "").slice(0, 160) ||
    "Arial, sans-serif";
  function textStyle(element: Element, pseudo?: string) {
    const css = pseudo ? getComputedStyle(element, pseudo) : style(element);
    return {
      fontFamily: family(css.fontFamily),
      fontSize: clamp(px(css.fontSize), 4, 240),
      fontWeight: clamp(px(css.fontWeight) || 400, 100, 1000),
      fontStyle:
        css.fontStyle === "italic" ? ("italic" as const) : ("normal" as const),
      color: color(css.color),
      underline: css.textDecorationLine.includes("underline"),
      strike: css.textDecorationLine.includes("line-through"),
    };
  }
  function split(value: string) {
    const parts: string[] = [];
    let depth = 0,
      start = 0;
    for (let i = 0; i < value.length; i++) {
      if (value[i] === "(") depth++;
      else if (value[i] === ")") depth--;
      else if (value[i] === "," && depth === 0) {
        parts.push(value.slice(start, i).trim());
        start = i + 1;
      }
    }
    parts.push(value.slice(start).trim());
    return parts;
  }
  function gradient(value: string): LayerPatch["gradient"] {
    if (!value.startsWith("linear-gradient(")) return undefined;
    const parts = split(value.slice(16, -1));
    const first = parts[0],
      directions: Record<string, number> = {
        "to right": 90,
        "to left": 270,
        "to bottom": 180,
        "to top": 0,
      };
    const directional = first.endsWith("deg") || first.startsWith("to ");
    const angle = directional ? (directions[first] ?? px(first)) : 180;
    const stops = parts.slice(directional ? 1 : 0).map((stop, index, all) => {
      const match = stop.match(/^(.*?)(?:\s+([\d.]+)%)?$/)!;
      return {
        id: `stop-${index}`,
        color: color(match[1]),
        offset: clamp(
          match[2] ? Number(match[2]) / 100 : index / (all.length - 1),
          0,
          1,
        ),
      };
    });
    return stops.length >= 2 && stops.length <= 16
      ? { type: "linear", angle, stops }
      : undefined;
  }
  function shadow(value: string): LayerPatch["shadow"] {
    const first = split(value)[0];
    if (!first || first === "none" || first.includes("inset")) return undefined;
    const paint = first.match(
      /rgba?\([^)]*\)|color\([^)]*\)|#[a-f0-9]{3,8}/i,
    )?.[0];
    const sizes = [...first.matchAll(/(-?[\d.]+)px/g)].map((match) =>
      Number(match[1]),
    );
    return paint && sizes.length >= 2
      ? {
          x: clamp(sizes[0], -500, 500),
          y: clamp(sizes[1], -500, 500),
          blur: clamp(sizes[2] ?? 0, 0, 200),
          spread: clamp(sizes[3] ?? 0, -200, 200),
          color: color(paint),
        }
      : undefined;
  }
  function pseudoText(element: Element, pseudo: string) {
    const value = getComputedStyle(element, pseudo).content;
    if (
      !value ||
      value === "none" ||
      value === "normal" ||
      value === '""' ||
      value === "''"
    )
      return "";
    return /^["'].*["']$/.test(value)
      ? value
          .slice(1, -1)
          .replace(/\\a\s?/gi, "\n")
          .replace(/\\(["'\\])/g, "$1")
      : "";
  }
  function decoration(
    element: Element,
    pseudo: string,
    origin: { x: number; y: number },
  ): LayerPatch | undefined {
    const css = getComputedStyle(element, pseudo);
    if (!['""', "''"].includes(css.content) || css.display === "none")
      return undefined;
    const width = px(css.width),
      height = px(css.height),
      rect = element.getBoundingClientRect();
    if (!width || !height) return undefined;
    const fill = color(css.backgroundColor),
      stroke = color(css.borderTopColor),
      strokeWidth = px(css.borderTopWidth);
    if (
      fill === "transparent" &&
      !strokeWidth &&
      css.backgroundImage === "none"
    )
      return undefined;
    const parent = style(element),
      absolute = css.position === "absolute";
    let x =
      rect.x +
      px(parent.borderLeftWidth) +
      px(parent.paddingLeft) +
      px(css.marginLeft);
    let y =
      rect.y +
      px(parent.borderTopWidth) +
      px(parent.paddingTop) +
      px(css.marginTop);
    if (absolute) {
      if (css.left !== "auto") x = rect.x + px(css.left);
      else if (css.right !== "auto") x = rect.right - px(css.right) - width;
      if (css.top !== "auto") y = rect.y + px(css.top);
      else if (css.bottom !== "auto") y = rect.bottom - px(css.bottom) - height;
    }
    const radius =
      px(css.borderTopLeftRadius) *
      (css.borderTopLeftRadius.endsWith("%")
        ? Math.min(width, height) / 100
        : 1);
    return {
      name: "Decoration",
      x: round(x - origin.x),
      y: round(y - origin.y),
      width,
      height,
      shape: "rectangle",
      fill,
      stroke,
      strokeWidth,
      borderRadius: radius,
      gradient: gradient(css.backgroundImage),
      shadow: shadow(css.boxShadow),
    };
  }
  /** Curved borders retain their geometry and the clipping of their source container. */
  function roundedBorder(element: Element, origin: DOMRect) {
    const css = style(element),
      bounds = element.getBoundingClientRect();
    const edges = ["Top", "Right", "Bottom", "Left"] as const;
    const corners = [
      "TopLeft",
      "TopRight",
      "BottomRight",
      "BottomLeft",
    ] as const;
    const border = px(css.borderTopWidth),
      stroke = color(css.borderTopColor);
    if (
      !border ||
      stroke === "transparent" ||
      !px(css.borderTopLeftRadius) ||
      !edges.every(
        (edge) =>
          px(css[`border${edge}Width`]) === border &&
          css[`border${edge}Style`] === "solid" &&
          color(css[`border${edge}Color`]) === stroke,
      ) ||
      !corners.every(
        (corner) => css[`border${corner}Radius`] === css.borderTopLeftRadius,
      )
    )
      return undefined;
    let left = Math.max(bounds.left, origin.left),
      top = Math.max(bounds.top, origin.top);
    let right = Math.min(bounds.right, origin.right),
      bottom = Math.min(bounds.bottom, origin.bottom);
    for (
      let parent = element.parentElement;
      parent;
      parent = parent.parentElement
    ) {
      const paint = style(parent),
        rect = parent.getBoundingClientRect();
      if (/hidden|clip|scroll|auto/.test(paint.overflowX)) {
        left = Math.max(left, rect.left + px(paint.borderLeftWidth));
        right = Math.min(right, rect.right - px(paint.borderRightWidth));
      }
      if (/hidden|clip|scroll|auto/.test(paint.overflowY)) {
        top = Math.max(top, rect.top + px(paint.borderTopWidth));
        bottom = Math.min(bottom, rect.bottom - px(paint.borderBottomWidth));
      }
    }
    const width = round(right - left),
      height = round(bottom - top);
    if (width <= 0 || height <= 0) return null;
    const x = round(left - bounds.left),
      y = round(top - bounds.top);
    const radii = css.borderTopLeftRadius.split(" ");
    const radius = (value: string, size: number) =>
      value.endsWith("%") ? (px(value) * size) / 100 : px(value);
    const rx = radius(radii[0], bounds.width),
      ry = radius(radii[1] ?? radii[0], bounds.height);
    const clipped =
      x > 0 || y > 0 || right < bounds.right || bottom < bounds.bottom;
    // A clipping path intentionally uses the existing complex-SVG bitmap fallback.
    // Plain curved borders remain native vectors; clipped paths cannot leak outside a page.
    const clip = clipped
      ? `<defs><clipPath id="border-clip"><rect x="${x}" y="${y}" width="${width}" height="${height}"/></clipPath></defs>`
      : "";
    return {
      x: round(left - origin.left),
      y: round(top - origin.top),
      width,
      height,
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="${x} ${y} ${width} ${height}">${clip}<rect x="${border / 2}" y="${border / 2}" width="${bounds.width - border}" height="${bounds.height - border}" rx="${rx}" ry="${ry}" fill="none" stroke="${stroke}" stroke-width="${border}"${clipped ? ' clip-path="url(#border-clip)"' : ""}/></svg>`,
    };
  }
  return {
    style,
    color,
    px,
    round,
    clamp,
    family,
    textStyle,
    gradient,
    shadow,
    pseudoText,
    decoration,
    roundedBorder,
  };
}
