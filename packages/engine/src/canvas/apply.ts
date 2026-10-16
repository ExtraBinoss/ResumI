import type { Document } from "../document/schema";
import { EngineError } from "../validation";
import type { CanvasCommand } from "./commands";
import {
  requireUnlocked,
  removeMembers,
  relocateLayer,
  referenceIds,
} from "./groups";
export function applyCanvas(doc: Document, command: CanvasCommand): Document {
  if (command.type === "canvas.enable") {
    if (doc.canvas)
      throw new EngineError("CONFLICT", "Canvas is already enabled.");
    if (Object.keys(command.layers).length !== Object.keys(doc.blocks).length)
      throw new EngineError("INVALID_INPUT", "Supply every layer once.");
    const blocks = { ...doc.blocks };
    for (const id of Object.keys(blocks))
      blocks[id] = { ...blocks[id], design: command.layers[id] };
    return {
      ...doc,
      blocks,
      canvas: {
        width: 794,
        height: 1123,
        background: "#ffffff",
        order: doc.sectionIds.flatMap((id) => doc.sections[id].blockIds),
        groups: [],
        fonts: [],
      },
    };
  }
  const canvas = doc.canvas;
  if (!canvas)
    throw new EngineError("CONFLICT", "Enable the visual canvas first.");
  switch (command.type) {
    case "canvas.update":
      return { ...doc, canvas: { ...canvas, ...command.patch } };
    case "layer.update": {
      if (
        Object.keys(command.patch).some(
          (key) => !["locked", "hidden"].includes(key),
        )
      )
        requireUnlocked(doc, command.ids);
      const blocks = { ...doc.blocks };
      for (const id of command.ids) {
        if (!blocks[id])
          throw new EngineError("NOT_FOUND", `Layer not found: ${id}`);
        blocks[id] = {
          ...blocks[id],
          design: { ...blocks[id].design!, ...command.patch },
        };
      }
      return { ...doc, blocks };
    }
    case "layer.translate": {
      requireUnlocked(doc, command.ids);
      const blocks = { ...doc.blocks };
      for (const id of command.ids) {
        const layer = blocks[id].design!;
        blocks[id] = {
          ...blocks[id],
          design: {
            ...layer,
            x: layer.x + command.dx,
            y: layer.y + command.dy,
          },
        };
      }
      return { ...doc, blocks };
    }
    case "layer.relocate":
      return relocateLayer(
        doc,
        command.source,
        command.target,
        command.placement,
      );
    case "group.create": {
      requireUnlocked(doc, command.ids);
      if (
        command.ids.length < 2 ||
        new Set(command.ids).size !== command.ids.length
      )
        throw new EngineError(
          "INVALID_INPUT",
          "Select at least two distinct layers.",
        );
      if (
        [
          doc.id,
          ...doc.sectionIds,
          ...Object.keys(doc.blocks),
          ...canvas.groups.map((g) => g.id),
        ].includes(command.id)
      )
        throw new EngineError("CONFLICT", "ID already exists.");
      const members = canvas.order.filter((id) => command.ids.includes(id)),
        top = Math.max(...members.map((id) => canvas.order.indexOf(id))),
        remaining = canvas.order.filter((id) => !members.includes(id)),
        index = canvas.order
          .slice(0, top + 1)
          .filter((id) => !members.includes(id)).length;
      return {
        ...doc,
        canvas: {
          ...canvas,
          order: [
            ...remaining.slice(0, index),
            ...members,
            ...remaining.slice(index),
          ],
          groups: [
            ...removeMembers(canvas.groups, members),
            {
              id: command.id,
              name: command.name,
              elementIds: members,
              opacity: 1,
              blendMode: "normal",
              collapsed: false,
              locked: false,
              hidden: false,
            },
          ],
        },
      };
    }
    case "group.update": {
      const ids = referenceIds(doc, { kind: "group", id: command.id });
      if (
        Object.keys(command.patch).some(
          (key) => !["locked", "hidden", "collapsed"].includes(key),
        )
      )
        requireUnlocked(doc, ids);
      return {
        ...doc,
        canvas: {
          ...canvas,
          groups: canvas.groups.map((g) =>
            g.id === command.id ? { ...g, ...command.patch } : g,
          ),
        },
      };
    }
    case "group.ungroup": {
      requireUnlocked(
        doc,
        referenceIds(doc, { kind: "group", id: command.id }),
      );
      return {
        ...doc,
        canvas: {
          ...canvas,
          groups: canvas.groups.filter((g) => g.id !== command.id),
        },
      };
    }
    case "layer.duplicate": {
      const blocks = { ...doc.blocks },
        sections = { ...doc.sections },
        mapping = new Map(command.copies.map((c) => [c.id, c.newId]));
      if (mapping.size !== command.copies.length)
        throw new EngineError("INVALID_INPUT", "Duplicate source IDs.");
      requireUnlocked(
        doc,
        command.copies.map((c) => c.id),
      );
      for (const { id, newId } of command.copies) {
        if (
          [
            doc.id,
            ...doc.sectionIds,
            ...Object.keys(blocks),
            ...canvas.groups.map((g) => g.id),
          ].includes(newId)
        )
          throw new EngineError("CONFLICT", "ID already exists.");
        const block = blocks[id],
          layer = block.design!,
          section = Object.values(sections).find((s) =>
            s.blockIds.includes(id),
          )!,
          index = section.blockIds.indexOf(id) + 1,
          offset = command.offset ?? 16;
        blocks[newId] = {
          ...block,
          id: newId,
          design: {
            ...layer,
            name: `${layer.name.slice(0, 110)} copy`,
            x: layer.x + offset,
            y: layer.y + offset,
          },
        };
        sections[section.id] = {
          ...section,
          blockIds: [
            ...section.blockIds.slice(0, index),
            newId,
            ...section.blockIds.slice(index),
          ],
        };
      }
      return {
        ...doc,
        blocks,
        sections,
        canvas: {
          ...canvas,
          order: [
            ...canvas.order,
            ...canvas.order.flatMap((id) =>
              mapping.has(id) ? [mapping.get(id)!] : [],
            ),
          ],
        },
      };
    }
    case "text.range.format":
    case "text.mark.remove": {
      requireUnlocked(doc, [command.id]);
      const block = doc.blocks[command.id],
        layer = block.design!;
      if (layer.type !== "text")
        throw new EngineError(
          "INVALID_INPUT",
          "Text formatting requires a text layer.",
        );
      if (
        command.type === "text.range.format" &&
        (command.end <= command.start || command.end > block.text.length)
      )
        throw new EngineError("INVALID_INPUT", "Invalid text range.");
      const marks = layer.marks.filter((mark) => mark.id !== command.markId);
      if (command.type === "text.range.format")
        marks.push({
          id: command.markId,
          start: command.start,
          end: command.end,
          ...command.style,
        });
      return {
        ...doc,
        blocks: {
          ...doc.blocks,
          [block.id]: { ...block, design: { ...layer, marks } },
        },
      };
    }
  }
}
