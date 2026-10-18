import type { Document } from "../document/schema";
import { EngineError } from "../validation";
import type { CanvasCommand } from "./commands";
import { requireUnlocked } from "./groups";
import {
  canvasForPage,
  documentPages,
  INITIAL_PAGE_ID,
  pageForLayer,
} from "./pages";
import { MAX_DOCUMENT_PAGES } from "./schema";

type PageCommand = Extract<
  CanvasCommand,
  { type: "page.create" | "page.update" | "page.delete" | "layer.moveToPage" }
>;

export function applyPage(doc: Document, command: PageCommand): Document {
  if (doc.source && doc.source.enabled !== false)
    throw new EngineError(
      "CONFLICT",
      "Page commands require the visual canvas. Deactivate source explicitly first.",
    );
  const canvas = doc.canvas!;
  const pages = canvas.pages ?? [];
  switch (command.type) {
    case "page.create": {
      if (documentPages(doc).length >= MAX_DOCUMENT_PAGES)
        throw new EngineError(
          "INVALID_INPUT",
          `A document supports at most ${MAX_DOCUMENT_PAGES} pages.`,
        );
      if (
        [
          INITIAL_PAGE_ID,
          doc.id,
          ...doc.sectionIds,
          ...Object.keys(doc.blocks),
          ...canvas.groups.map((group) => group.id),
          ...pages.map((page) => page.id),
        ].includes(command.page.id)
      )
        throw new EngineError("CONFLICT", "ID already exists.");
      const index = command.index ?? pages.length;
      if (index > pages.length)
        throw new EngineError(
          "INVALID_INPUT",
          "Insertion index is out of range.",
        );
      return {
        ...doc,
        canvas: {
          ...canvas,
          pages: [
            ...pages.slice(0, index),
            command.page,
            ...pages.slice(index),
          ],
        },
      };
    }
    case "page.update": {
      canvasForPage(doc, command.id);
      if (command.id === INITIAL_PAGE_ID) {
        if (command.patch.name !== undefined)
          throw new EngineError(
            "INVALID_INPUT",
            "The original page name is fixed.",
          );
        return { ...doc, canvas: { ...canvas, ...command.patch } };
      }
      return {
        ...doc,
        canvas: {
          ...canvas,
          pages: pages.map((page) =>
            page.id === command.id ? { ...page, ...command.patch } : page,
          ),
        },
      };
    }
    case "page.delete": {
      const page = canvasForPage(doc, command.id);
      if (command.id === INITIAL_PAGE_ID || page.order.length)
        throw new EngineError(
          "CONFLICT",
          "Only empty additional pages can be deleted.",
        );
      return {
        ...doc,
        canvas: {
          ...canvas,
          pages: pages.filter((page) => page.id !== command.id),
        },
      };
    }
    case "layer.moveToPage": {
      canvasForPage(doc, command.pageId);
      requireUnlocked(doc, command.ids);
      for (const group of canvas.groups)
        if (
          group.elementIds.some((id) => command.ids.includes(id)) &&
          !group.elementIds.every((id) => command.ids.includes(id))
        )
          throw new EngineError(
            "CONFLICT",
            "Move every member of a group to the same page.",
          );
      const changed = command.ids.filter(
        (id) => pageForLayer(doc, id) !== command.pageId,
      );
      if (!changed.length) return doc;
      const blocks = { ...doc.blocks };
      for (const id of changed) {
        const design = { ...blocks[id].design! };
        if (command.pageId === INITIAL_PAGE_ID) delete design.pageId;
        else design.pageId = command.pageId;
        blocks[id] = { ...blocks[id], design };
      }
      return { ...doc, blocks };
    }
  }
}
