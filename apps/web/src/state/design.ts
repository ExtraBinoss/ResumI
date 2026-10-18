import { atom } from "jotai";
import { selectAtom } from "jotai/utils";
import {
  makeLayer,
  groupFor,
  INITIAL_PAGE_ID,
  documentPages,
  canvasForPage,
  type Canvas,
  type Layer,
  type LayerPatch,
  type Command,
  type CommandBatch,
  type Document,
} from "@resumi/engine";
import { visualCommands } from "@resumi/cv/design";
import { sessionAtom, selectionAtom, commandAtom } from "./editor";
export const modeAtom = atom<"visual" | "text">("visual");
export const toolAtom = atom<"select" | "text" | "shape">("select");
export const shapeToolAtom = atom<LayerPatch>({ shape: "rectangle" });
export type DesignError = string | { kind: "unableToEditLayer" };
const unableToEditLayer: DesignError = { kind: "unableToEditLayer" };
export const designErrorAtom = atom<DesignError>("");
export const canonicalCanvasAtom = atom(
  (get) => get(sessionAtom)?.document.canvas,
);
export const pagesAtom = selectAtom(
  sessionAtom,
  (session) => (session ? documentPages(session.document) : []),
  (a, b) =>
    a.length === b.length &&
    a.every((page, index) => {
      const other = b[index];
      return (
        page.id === other.id &&
        page.name === other.name &&
        page.width === other.width &&
        page.height === other.height &&
        page.background === other.background
      );
    }),
);
const requestedPageAtom = atom(INITIAL_PAGE_ID);
export const activePageIdAtom = atom(
  (get) => {
    const requested = get(requestedPageAtom);
    return get(pagesAtom).some((page) => page.id === requested)
      ? requested
      : INITIAL_PAGE_ID;
  },
  (get, set, id: string) => {
    if (!get(pagesAtom).some((page) => page.id === id)) return;
    set(requestedPageAtom, id);
    set(selectionAtom, null);
    set(textRangeAtom, null);
    set(toolAtom, "select");
  },
);
function sameCanvas(a: Canvas | undefined, b: Canvas | undefined) {
  return (
    a === b ||
    !!(
      a &&
      b &&
      a.width === b.width &&
      a.height === b.height &&
      a.background === b.background &&
      a.fonts === b.fonts &&
      a.pages === b.pages &&
      a.order.length === b.order.length &&
      a.order.every((id, index) => id === b.order[index]) &&
      a.groups.length === b.groups.length &&
      a.groups.every((group, index) => group === b.groups[index])
    )
  );
}
// Page projection has a stable identity while independently editable block text changes.
const projectedCanvasAtom = atom((get) => {
  const doc = get(sessionAtom)?.document;
  return doc?.canvas ? canvasForPage(doc, get(activePageIdAtom)) : undefined;
});
export const canvasAtom = selectAtom(
  projectedCanvasAtom,
  (canvas) => canvas,
  sameCanvas,
);
export const selectedIdsAtom = atom((get) => {
  const selection = get(selectionAtom);
  return selection?.blockIds ?? (selection?.blockId ? [selection.blockId] : []);
});
export const textRangeAtom = atom<{
  id: string;
  start: number;
  end: number;
} | null>(null);
export const designCommandAtom = atom(
  null,
  (_get, set, command: Command | CommandBatch) => {
    try {
      set(commandAtom, command);
      set(designErrorAtom, "");
    } catch (error) {
      set(
        designErrorAtom,
        error instanceof Error ? error.message : unableToEditLayer,
      );
    }
  },
);
export function sectionFor(doc: Document, id: string) {
  return (
    Object.values(doc.sections).find((section) => section.blockIds.includes(id))
      ?.id ?? doc.sectionIds[0]
  );
}
export const selectLayersAtom = atom(
  null,
  (get, set, input: { ids: string[]; groupId?: string }) => {
    const doc = get(sessionAtom)!.document,
      ids = input.ids.filter((id) => !!doc.blocks[id]);
    set(
      selectionAtom,
      ids.length
        ? {
            sectionId: sectionFor(doc, ids[0]),
            blockId: ids[0],
            blockIds: ids,
            groupId: input.groupId,
          }
        : null,
    );
    set(textRangeAtom, null);
  },
);
/** Pointer/keyboard selection is shared by the canvas and its layer list. */
export const selectLayerAtom = atom(
  null,
  (
    get,
    set,
    input: {
      id: string;
      additive?: boolean;
      wholeGroup?: boolean;
      preserveSelection?: boolean;
    },
  ) => {
    const doc = get(sessionAtom)?.document;
    if (!doc?.blocks[input.id]?.design) return;
    const selected = get(selectedIdsAtom),
      group = groupFor(doc, input.id);
    if (input.additive) {
      set(selectLayersAtom, {
        ids: selected.includes(input.id)
          ? selected.filter((id) => id !== input.id)
          : [...selected, input.id],
      });
    } else if (
      input.preserveSelection !== false &&
      selected.includes(input.id)
    ) {
      set(selectLayersAtom, {
        ids: selected,
        groupId:
          group &&
          selected.length === group.elementIds.length &&
          group.elementIds.every((id) => selected.includes(id))
            ? group.id
            : undefined,
      });
    } else
      set(selectLayersAtom, {
        ids:
          input.wholeGroup !== false && group ? group.elementIds : [input.id],
        groupId: input.wholeGroup !== false ? group?.id : undefined,
      });
  },
);
export const enableVisualAtom = atom(null, (get, set) => {
  const document = get(sessionAtom)!.document;
  const commands: Command[] = [
    ...(document.source && document.source.enabled !== false
      ? [{ type: "source.activate" as const, enabled: false }]
      : []),
    ...visualCommands(document),
  ];
  if (commands.length)
    set(designCommandAtom, {
      version: 1,
      actor: { kind: "human", name: "Visual layout" },
      commands,
    });
  set(modeAtom, "visual");
});
export const addLayerAtom = atom(
  null,
  (
    get,
    set,
    input: { type: Layer["type"]; text?: string; patch?: LayerPatch },
  ) => {
    const doc = get(sessionAtom)!.document,
      id = crypto.randomUUID(),
      sectionId = doc.sectionIds[0] ?? crypto.randomUUID(),
      commands: Command[] = [...visualCommands(doc)];
    if (!doc.sectionIds.length)
      commands.push({
        type: "section.create",
        section: { id: sectionId, title: "Content", blockIds: [] },
      });
    commands.push({
      type: "block.create",
      sectionId,
      block: {
        id,
        kind: input.type === "text" ? "text" : input.type,
        text: input.text ?? (input.type === "text" ? "Your text" : ""),
        design: makeLayer(input.type, {
          ...input.patch,
          ...(get(activePageIdAtom) === INITIAL_PAGE_ID
            ? {}
            : { pageId: get(activePageIdAtom) }),
        }),
      },
    });
    set(designCommandAtom, {
      version: 1,
      actor: { kind: "human", name: "Editor" },
      commands,
    });
    if (get(sessionAtom)!.document.blocks[id])
      set(selectLayersAtom, { ids: [id] });
    set(toolAtom, "select");
  },
);
export const groupSelectionAtom = atom(null, (get, set) => {
  const ids = get(selectedIdsAtom);
  if (ids.length < 2) return;
  const id = crypto.randomUUID();
  set(designCommandAtom, { type: "group.create", id, ids, name: "Group" });
  if (get(canvasAtom)?.groups.some((g) => g.id === id))
    set(selectLayersAtom, { ids, groupId: id });
});
export const duplicateSelectionAtom = atom(null, (get, set) => {
  const copies = get(selectedIdsAtom).map((id) => ({
    id,
    newId: crypto.randomUUID(),
  }));
  if (!copies.length) return;
  set(designCommandAtom, { type: "layer.duplicate", copies });
  if (get(sessionAtom)!.document.blocks[copies[0].newId])
    set(selectLayersAtom, { ids: copies.map((c) => c.newId) });
});
export const deleteSelectionAtom = atom(null, (get, set) => {
  const ids = get(selectedIdsAtom);
  if (!ids.length) return;
  set(designCommandAtom, {
    version: 1,
    actor: { kind: "human", name: "Editor" },
    commands: ids.map((id) => ({ type: "block.delete" as const, id })),
  });
  if (!ids.some((id) => get(sessionAtom)!.document.blocks[id]))
    set(selectLayersAtom, { ids: [] });
});

export const sourceAtom = atom((get) => get(sessionAtom)?.document.source);

export const addPageAtom = atom(null, (get, set) => {
  const canvas = get(canvasAtom);
  if (!canvas) return;
  const id = crypto.randomUUID();
  set(designCommandAtom, {
    type: "page.create",
    page: {
      id,
      name: `Page ${get(pagesAtom).length + 1}`,
      width: canvas.width,
      height: canvas.height,
      background: canvas.background,
    },
  });
  if (get(pagesAtom).some((page) => page.id === id)) set(activePageIdAtom, id);
});
