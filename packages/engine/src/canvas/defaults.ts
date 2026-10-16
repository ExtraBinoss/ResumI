import type { Layer, LayerPatch } from "./schema";
import { DEFAULT_VISUAL_EFFECTS } from "./effects";
export function makeLayer(type: Layer["type"], patch: LayerPatch = {}): Layer {
  const base = {
    name: type === "text" ? "Text" : type === "shape" ? "Shape" : "Image",
    x: 64,
    y: 64,
    width: 300,
    height: 54,
    rotation: 0,
    opacity: 1,
    blendMode: "normal" as const,
    locked: false,
    hidden: false,
    aspectLocked: false,
  };
  if (type === "text")
    return {
      ...base,
      type,
      fontFamily: "Arial, sans-serif",
      fontSize: 18,
      fontWeight: 400,
      fontStyle: "normal",
      lineHeight: 1.25,
      letterSpacing: 0,
      align: "left",
      color: "#151515",
      underline: false,
      strike: false,
      uppercase: false,
      marks: [],
      ...patch,
    } as Layer;
  if (type === "shape")
    return {
      ...base,
      type,
      width: 160,
      height: 120,
      shape: "rectangle",
      fill: "#2958e8",
      stroke: "transparent",
      strokeWidth: 0,
      borderRadius: 0,
      effects: { ...DEFAULT_VISUAL_EFFECTS },
      ...patch,
    } as Layer;
  return {
    ...base,
    type,
    width: 200,
    height: 200,
    src: "",
    alt: "",
    objectFit: "cover",
    objectPosition: { x: 50, y: 50 },
    imageScale: 1,
    borderRadius: 0,
    effects: { ...DEFAULT_VISUAL_EFFECTS },
    ...patch,
  } as Layer;
}
