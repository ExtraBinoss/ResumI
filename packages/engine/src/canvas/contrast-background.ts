import { canvasForPage, pageForLayer } from "./pages";
import type { Document } from "../document/schema";
import type { Layer } from "./schema";
import {
  colorPixel,
  compositePixel,
  pixelOpacity,
  transparentPixel,
  type Rgba,
} from "./contrast-colors";

type Frame = { x: number; y: number; width: number; height: number };
type Resolution =
  | { reliable: true; background: Rgba; foreground: (color: Rgba) => Rgba }
  | { reliable: false; background: Rgba; reason: string };
function rotatedFrame(layer: Layer): Frame {
  const angle = (layer.rotation * Math.PI) / 180;
  const width =
    Math.abs(Math.cos(angle)) * layer.width +
    Math.abs(Math.sin(angle)) * layer.height;
  const height =
    Math.abs(Math.sin(angle)) * layer.width +
    Math.abs(Math.cos(angle)) * layer.height;
  return {
    x: layer.x + (layer.width - width) / 2,
    y: layer.y + (layer.height - height) / 2,
    width,
    height,
  };
}
function intersects(first: Frame, second: Frame) {
  return (
    first.x < second.x + second.width &&
    first.x + first.width > second.x &&
    first.y < second.y + second.height &&
    first.y + first.height > second.y
  );
}
function contains(first: Frame, second: Frame) {
  return (
    first.x <= second.x &&
    first.y <= second.y &&
    first.x + first.width >= second.x + second.width &&
    first.y + first.height >= second.y + second.height
  );
}
function containsRoundedFill(
  layer: Extract<Layer, { type: "shape" }>,
  target: Frame,
) {
  const stroke = layer.strokeWidth && layer.stroke !== "transparent";
  const insetX = stroke ? (layer.strokeWidth * layer.width) / 200 : 0,
    insetY = stroke ? (layer.strokeWidth * layer.height) / 200 : 0;
  const inner = {
    x: layer.x + insetX,
    y: layer.y + insetY,
    width: layer.width - 2 * insetX,
    height: layer.height - 2 * insetY,
  };
  if (!contains(inner, target)) return false;
  const rx = Math.max(
      0,
      Math.min(layer.borderRadius, layer.width / 2) - insetX,
    ),
    ry = Math.max(0, Math.min(layer.borderRadius, layer.height / 2) - insetY);
  if (!rx || !ry) return true;
  // A rounded rectangle is convex: checking every frame corner proves the
  // entire text frame is over fill, without excluding its flat top/side strips.
  return [target.x, target.x + target.width].every((x) =>
    [target.y, target.y + target.height].every((y) => {
      const cx = Math.max(
          inner.x + rx,
          Math.min(inner.x + inner.width - rx, x),
        ),
        cy = Math.max(inner.y + ry, Math.min(inner.y + inner.height - ry, y));
      return ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1;
    }),
  );
}
function extent(layer: Layer): Frame {
  const frame = rotatedFrame(layer);
  if (layer.type === "text") return frame;
  const blur = layer.effects.blur * 3;
  const shadow = layer.shadow;
  const spread = shadow ? Math.max(0, shadow.spread) + shadow.blur * 3 : 0;
  const left = Math.min(frame.x - blur, frame.x + (shadow?.x ?? 0) - spread);
  const top = Math.min(frame.y - blur, frame.y + (shadow?.y ?? 0) - spread);
  const right = Math.max(
    frame.x + frame.width + blur,
    frame.x + frame.width + (shadow?.x ?? 0) + spread,
  );
  const bottom = Math.max(
    frame.y + frame.height + blur,
    frame.y + frame.height + (shadow?.y ?? 0) + spread,
  );
  return { x: left, y: top, width: right - left, height: bottom - top };
}
function visible(layer: Layer) {
  if (layer.hidden || !layer.opacity) return false;
  if (
    layer.type === "shape" &&
    !layer.gradient &&
    !layer.shadow &&
    !layer.strokeWidth &&
    layer.fill === "transparent" &&
    !layer.effects.grain &&
    !layer.effects.dither
  )
    return false;
  return true;
}
function uniformFill(layer: Layer, target: Frame): Rgba | string {
  if (layer.blendMode !== "normal") return "Blended background";
  if (layer.type === "image") return "Image background";
  if (layer.type === "text") return "Overlapping text";
  if (layer.shadow) return "Shadow background";
  if (layer.gradient) return "Gradient background";
  const effects = layer.effects;
  if (
    effects.blur ||
    effects.grain ||
    effects.dither ||
    effects.brightness !== 1 ||
    effects.contrast !== 1 ||
    effects.saturation !== 1
  )
    return "Filtered background";
  if (
    layer.fill === "transparent" &&
    (!layer.strokeWidth || layer.stroke === "transparent")
  )
    return transparentPixel;
  if (layer.rotation || layer.shape !== "rectangle" || layer.vector)
    return "Variable background";
  if (!containsRoundedFill(layer, target)) return "Variable background";
  return pixelOpacity(colorPixel(layer.fill)!, layer.opacity);
}
/** Resolve a uniform color under the selected text frame, never estimate image/gradient pixels. */
export function contrastBackground(document: Document, id: string): Resolution {
  const layer = document.blocks[id]?.design;
  const canvas =
    document.canvas && layer
      ? canvasForPage(document, pageForLayer(document, id))
      : document.canvas;
  let background = colorPixel(canvas?.background ?? "transparent")!;
  function unknown(reason: string): Resolution {
    return { reliable: false, background, reason };
  }
  if (document.source && document.source.enabled !== false)
    return unknown("Source preview");
  if (!canvas || layer?.type !== "text") return unknown("No visual text layer");
  if (background.a !== 1) return unknown("Transparent page background");
  if (!visible(layer)) return unknown("Hidden text");
  const target = rotatedFrame(layer);
  const seen = new Set<string>();
  let resolution: Resolution | undefined;
  for (const nextId of canvas.order) {
    const group = canvas.groups.find((item) =>
      item.elementIds.includes(nextId),
    );
    if (group && seen.has(group.id)) continue;
    if (group) seen.add(group.id);
    const members = group
      ? canvas.order.filter((key) => group.elementIds.includes(key))
      : [nextId];
    const selected = members.includes(id);
    if (group?.hidden || group?.opacity === 0) {
      if (selected) return unknown("Hidden text");
      continue;
    }
    const relevant = members.filter(
      (key) =>
        visible(document.blocks[key].design!) &&
        intersects(extent(document.blocks[key].design!), target),
    );
    if (!relevant.length) continue;
    if (resolution) return unknown("Overlapping foreground layer");
    if (group && group.blendMode !== "normal")
      return unknown("Blended background");
    let inside = transparentPixel;
    let foreground: ((color: Rgba) => Rgba) | undefined;
    for (const key of relevant) {
      const candidate = document.blocks[key].design!;
      if (key === id) {
        if (layer.blendMode !== "normal") return unknown("Blended text");
        const under = inside;
        foreground = (color) =>
          compositePixel(pixelOpacity(color, layer.opacity), under);
      } else {
        if (foreground) return unknown("Overlapping foreground layer");
        const fill = uniformFill(candidate, target);
        if (typeof fill === "string") return unknown(fill);
        inside = compositePixel(fill, inside);
      }
    }
    const underGroup = background;
    const opacity = group?.opacity ?? 1;
    background = compositePixel(pixelOpacity(inside, opacity), underGroup);
    if (foreground) {
      const textPixel = foreground;
      resolution = {
        reliable: true,
        background,
        foreground: (color) =>
          compositePixel(pixelOpacity(textPixel(color), opacity), underGroup),
      };
    }
  }
  return resolution ?? unknown("Text layer is not on the canvas");
}
