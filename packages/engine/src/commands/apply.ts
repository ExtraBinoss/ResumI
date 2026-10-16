import { applySource } from "../source/apply";
import { applyCanvas } from "../canvas/apply";
import { makeLayer } from "../canvas/defaults";
import { requireUnlocked, removeMembers } from "../canvas/groups";
import { updateTextPreservingMarks } from "../canvas/marks";
import {
  EngineError,
  assertInvariants,
  documentSchema,
  parse,
  type Document,
} from "../document/schema";
import { batchSchema, type Command, type CommandBatch } from "./schema";

function requireSection(doc: Document, id: string) {
  if (!Object.hasOwn(doc.sections, id))
    throw new EngineError("NOT_FOUND", `Section not found: ${id}`);
  return doc.sections[id];
}
function requireBlock(doc: Document, id: string) {
  if (!Object.hasOwn(doc.blocks, id))
    throw new EngineError("NOT_FOUND", `Block not found: ${id}`);
  return doc.blocks[id];
}
function availableId(doc: Document, id: string) {
  if (
    id === doc.id ||
    Object.hasOwn(doc.sections, id) ||
    Object.hasOwn(doc.blocks, id) ||
    doc.canvas?.groups.some((group) => group.id === id)
  )
    throw new EngineError("CONFLICT", `ID already exists: ${id}`);
}
function reordered(current: string[], next: string[]) {
  if (
    next.length !== current.length ||
    new Set(next).size !== next.length ||
    next.some((id) => !current.includes(id))
  )
    throw new EngineError(
      "INVALID_INPUT",
      "Reordering must preserve all existing IDs exactly once.",
    );
  return next;
}
function inserted(current: string[], id: string, index = current.length) {
  if (index > current.length)
    throw new EngineError("INVALID_INPUT", "Insertion index is out of range.");
  return [...current.slice(0, index), id, ...current.slice(index)];
}
function apply(doc: Document, command: Command): Document {
  switch (command.type) {
    case "source.set":
    case "source.clear":
    case "source.activate":
      return applySource(doc, command);
    case "document.update":
      return { ...doc, name: command.name };
    case "style.update":
      return { ...doc, style: { ...doc.style, ...command.patch } };
    case "section.create": {
      availableId(doc, command.section.id);
      return {
        ...doc,
        sectionIds: inserted(doc.sectionIds, command.section.id, command.index),
        sections: { ...doc.sections, [command.section.id]: command.section },
      };
    }
    case "section.update": {
      const section = requireSection(doc, command.id);
      return {
        ...doc,
        sections: {
          ...doc.sections,
          [command.id]: { ...section, title: command.title },
        },
      };
    }
    case "section.delete": {
      const section = requireSection(doc, command.id);
      requireUnlocked(doc, section.blockIds);
      const sections = { ...doc.sections },
        blocks = { ...doc.blocks };
      delete sections[command.id];
      section.blockIds.forEach((id) => {
        delete blocks[id];
      });
      return {
        ...doc,
        sectionIds: doc.sectionIds.filter((id) => id !== command.id),
        ...(doc.canvas
          ? {
              canvas: {
                ...doc.canvas,
                order: doc.canvas.order.filter(
                  (id) => !section.blockIds.includes(id),
                ),
                groups: removeMembers(doc.canvas.groups, section.blockIds),
              },
            }
          : {}),
        sections,
        blocks,
      };
    }
    case "section.reorder":
      return { ...doc, sectionIds: reordered(doc.sectionIds, command.ids) };
    case "block.create": {
      const section = requireSection(doc, command.sectionId);
      availableId(doc, command.block.id);
      return {
        ...doc,
        blocks: {
          ...doc.blocks,
          [command.block.id]: doc.canvas
            ? {
                ...command.block,
                design:
                  command.block.design ??
                  makeLayer(
                    command.block.kind === "shape" ||
                      command.block.kind === "image"
                      ? command.block.kind
                      : "text",
                    { y: Math.min(1000, 64 + doc.canvas.order.length * 30) },
                  ),
              }
            : command.block,
        },
        ...(doc.canvas
          ? {
              canvas: {
                ...doc.canvas,
                order: [...doc.canvas.order, command.block.id],
              },
            }
          : {}),
        sections: {
          ...doc.sections,
          [section.id]: {
            ...section,
            blockIds: inserted(
              section.blockIds,
              command.block.id,
              command.index,
            ),
          },
        },
      };
    }
    case "block.update": {
      const block = requireBlock(doc, command.id);
      requireUnlocked(doc, [command.id]);
      const patch = command.patch;
      const design = patch.design ?? block.design;
      const updatedDesign =
        design?.type === "text" && patch.text !== undefined
          ? {
              ...design,
              marks: updateTextPreservingMarks(
                block.text,
                patch.text,
                design.marks,
              ),
            }
          : design;
      return {
        ...doc,
        blocks: {
          ...doc.blocks,
          [block.id]: {
            ...block,
            ...patch,
            ...(updatedDesign ? { design: updatedDesign } : {}),
          },
        },
      };
    }
    case "block.delete": {
      requireBlock(doc, command.id);
      requireUnlocked(doc, [command.id]);
      const blocks = { ...doc.blocks };
      delete blocks[command.id];
      const section = Object.values(doc.sections).find((s) =>
        s.blockIds.includes(command.id),
      )!;
      return {
        ...doc,
        blocks,
        ...(doc.canvas
          ? {
              canvas: {
                ...doc.canvas,
                order: doc.canvas.order.filter((id) => id !== command.id),
                groups: removeMembers(doc.canvas.groups, [command.id]),
              },
            }
          : {}),
        sections: {
          ...doc.sections,
          [section.id]: {
            ...section,
            blockIds: section.blockIds.filter((id) => id !== command.id),
          },
        },
      };
    }
    case "block.reorder": {
      const section = requireSection(doc, command.sectionId);
      return {
        ...doc,
        sections: {
          ...doc.sections,
          [section.id]: {
            ...section,
            blockIds: reordered(section.blockIds, command.ids),
          },
        },
      };
    }
    default:
      return applyCanvas(doc, command);
  }
}
/** Validate everything before publishing. Failed batches never modify the input. */
export function applyCommands(
  document: Document,
  input: unknown,
): { document: Document; batch: CommandBatch } {
  parse(documentSchema, document);
  assertInvariants(document);
  const batch = parse(batchSchema, input);
  const next = batch.commands.reduce(apply, document);
  parse(documentSchema, next);
  assertInvariants(next);
  return { document: next, batch };
}
export function applyCommand(document: Document, command: Command): Document {
  return applyCommands(document, {
    version: 1,
    actor: { kind: "human", name: "Editor" },
    commands: [command],
  }).document;
}
