import type { Document } from "../document/schema";
import { EngineError } from "../validation";
import { shapeDefinition } from "./shapes";
export function assertCanvas(doc: Document) {
  const fail = (message: string): never => {
    throw new EngineError("INVALID_INPUT", message);
  };
  const ids = Object.keys(doc.blocks),
    canvas = doc.canvas;
  if (!canvas) {
    if (
      ids.some(
        (id) =>
          doc.blocks[id].design ||
          ["shape", "image"].includes(doc.blocks[id].kind),
      )
    )
      fail("Visual blocks require a canvas.");
    return;
  }
  if (
    new Set(canvas.order).size !== ids.length ||
    canvas.order.length !== ids.length ||
    ids.some((id) => !canvas.order.includes(id))
  )
    fail("Canvas order must contain each block exactly once.");
  for (const id of ids) {
    const block = doc.blocks[id],
      layer = block.design;
    if (
      !layer ||
      layer.type !==
        (block.kind === "shape" || block.kind === "image" ? block.kind : "text")
    )
      fail(`Invalid layer type for ${id}.`);
    if (
      layer!.type === "text" &&
      (new Set(layer!.marks.map((mark) => mark.id)).size !==
        layer!.marks.length ||
        layer!.marks.some(
          (mark) => mark.end <= mark.start || mark.end > block.text.length,
        ))
    )
      fail(`Invalid text ranges for ${id}.`);
    if (
      layer!.type === "shape" &&
      !layer!.vector &&
      !shapeDefinition(layer!.shape)
    )
      fail(`Unknown shape: ${layer!.shape}.`);
    if (
      layer!.type === "shape" &&
      layer!.gradient &&
      new Set(layer!.gradient.stops.map((stop) => stop.id)).size !==
        layer!.gradient.stops.length
    )
      fail("Duplicate gradient stops.");
  }
  const used = new Set<string>([doc.id, ...doc.sectionIds, ...ids]),
    grouped = new Set<string>();
  for (const group of canvas.groups) {
    if (used.has(group.id)) fail("Group IDs must be unique.");
    used.add(group.id);
    const positions = group.elementIds
      .map((id) => canvas.order.indexOf(id))
      .sort((a, b) => a - b);
    if (
      positions.some(
        (position, index) =>
          position < 0 || (index > 0 && position !== positions[index - 1] + 1),
      )
    )
      fail("Group members must be contiguous in layer order.");
    for (const id of group.elementIds) {
      if (grouped.has(id)) fail("A layer can belong to only one group.");
      grouped.add(id);
    }
  }
  if (new Set(canvas.fonts.map((font) => font.id)).size !== canvas.fonts.length)
    fail("Duplicate embedded fonts.");
}
