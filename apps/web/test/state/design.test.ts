import { expect, test } from "bun:test";
import { createStore } from "jotai";
import { createSession } from "@resumi/engine";
import { createResume } from "@resumi/cv";
import { sessionAtom, selectionAtom, undoAtom } from "../../src/state/editor";
import {
  enableVisualAtom,
  modeAtom,
  selectLayerAtom,
  selectedIdsAtom,
  groupSelectionAtom,
  designCommandAtom,
  designErrorAtom,
} from "../../src/state/design";

test("opening visual mode deactivates source and creates canvas as one undo step", () => {
  const original = createResume("switch-mode", "react-studio");
  const store = createStore();
  store.set(sessionAtom, createSession(original));
  store.set(modeAtom, "text");
  store.set(enableVisualAtom);
  const session = store.get(sessionAtom)!;
  expect(session.document.canvas).toBeDefined();
  expect(session.document.source).toEqual({
    ...original.source!,
    enabled: false,
  });
  expect(session.past).toHaveLength(1);
  expect(session.past[0].batch.commands[0]).toEqual({
    type: "source.activate",
    enabled: false,
  });
  expect(store.get(modeAtom)).toBe("visual");
  store.set(undoAtom);
  expect(store.get(sessionAtom)?.document).toEqual(original);
});

test("canvas and layer-list selection add, remove and preserve a group without document edits", () => {
  const store = createStore();
  store.set(
    sessionAtom,
    createSession(createResume("select-layers", "studio")),
  );
  store.set(enableVisualAtom);
  const before = store.get(sessionAtom)!;
  const [first, second, third] = before.document.canvas!.order;
  store.set(selectLayerAtom, { id: first });
  store.set(selectLayerAtom, { id: second, additive: true });
  expect(store.get(selectedIdsAtom)).toEqual([first, second]);
  store.set(selectLayerAtom, { id: first, additive: true });
  expect(store.get(selectedIdsAtom)).toEqual([second]);
  store.set(selectLayerAtom, { id: third, additive: true, wholeGroup: false });
  expect(store.get(selectedIdsAtom)).toEqual([second, third]);
  expect(store.get(sessionAtom)).toBe(before);
  store.set(groupSelectionAtom);
  const grouped = store.get(sessionAtom)!,
    group = grouped.document.canvas!.groups[0];
  expect(grouped.past.length).toBe(before.past.length + 1);
  store.set(selectLayerAtom, { id: first });
  store.set(selectLayerAtom, { id: second });
  expect(store.get(selectedIdsAtom)).toEqual(group.elementIds);
  expect(store.get(selectionAtom)?.groupId).toBe(group.id);
  store.set(selectLayerAtom, { id: third });
  expect(store.get(selectionAtom)?.groupId).toBe(group.id);
  store.set(selectLayerAtom, {
    id: second,
    wholeGroup: false,
    preserveSelection: false,
  });
  expect(store.get(selectedIdsAtom)).toEqual([second]);
  expect(store.get(selectionAtom)?.groupId).toBeUndefined();
  expect(store.get(sessionAtom)).toBe(grouped);
});

test("selected groups move in one validated edit and locked selections cannot partially move", () => {
  const store = createStore();
  store.set(sessionAtom, createSession(createResume("move-layers", "studio")));
  store.set(enableVisualAtom);
  const [first, second] = store.get(sessionAtom)!.document.canvas!.order;
  store.set(selectLayerAtom, { id: first });
  store.set(selectLayerAtom, { id: second, additive: true });
  store.set(groupSelectionAtom);
  const grouped = store.get(sessionAtom)!,
    group = grouped.document.canvas!.groups[0],
    ids = group.elementIds;
  store.set(designCommandAtom, {
    type: "layer.translate",
    ids,
    dx: 50,
    dy: 30,
  });
  expect(store.get(sessionAtom)!.past.length).toBe(grouped.past.length + 1);
  for (const id of ids) {
    const before = grouped.document.blocks[id].design!,
      after = store.get(sessionAtom)!.document.blocks[id].design!;
    expect(after.x - before.x).toBe(50);
    expect(after.y - before.y).toBe(30);
  }
  store.set(undoAtom);
  expect(store.get(sessionAtom)!.document).toEqual(grouped.document);
  store.set(designCommandAtom, {
    type: "group.update",
    id: group.id,
    patch: { locked: true },
  });
  const locked = store.get(sessionAtom)!;
  store.set(designCommandAtom, {
    type: "layer.translate",
    ids,
    dx: 50,
    dy: 30,
  });
  expect(store.get(sessionAtom)).toBe(locked);
  expect(store.get(designErrorAtom)).toContain("locked");
});
