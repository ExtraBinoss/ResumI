import { atom } from "jotai";
import {
  makeLayer,
  type Layer,
  type LayerPatch,
  type Command,
  type CommandBatch,
  type Document,
} from "@resumi/engine";
import { visualCommands } from "@resumi/cv";
import { sessionAtom, selectionAtom, commandAtom } from "./editor";
export const modeAtom = atom<"visual" | "text">("visual");
export const toolAtom = atom<"select" | "text" | "shape">("select");
export const shapeToolAtom = atom<LayerPatch>({ shape: "rectangle" });
export const designErrorAtom = atom("");
export const canvasAtom = atom((get) => get(sessionAtom)?.document.canvas);
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
        error instanceof Error ? error.message : "Unable to edit this layer.",
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
        design: makeLayer(input.type, input.patch),
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
