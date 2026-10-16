import { expect, test } from "bun:test";
import {
  applyCommand,
  applyCommands,
  createDocument,
  createSession,
  execute,
  undo,
  redo,
  makeLayer,
  groupFor,
  isLocked,
  boundsForElements,
} from "../../src";
import { batch, deepFreeze, visualDocument } from "./fixtures";

test("canvas enable requires every block and preserves semantic content", () => {
  const doc = visualDocument();
  expect(doc.canvas?.order).toEqual(["a", "b", "c", "d"]);
  expect(doc.blocks.a.text).toBe("Sample a");
  expect(doc.canvas?.width).toBe(794);
  expect(() =>
    applyCommand(doc, { type: "canvas.enable", layers: {} }),
  ).toThrow("already enabled");
  const plain = applyCommands(
    createDocument("plain"),
    batch([
      {
        type: "section.create",
        section: { id: "section", title: "", blockIds: [] },
      },
      {
        type: "block.create",
        sectionId: "section",
        block: { id: "text", kind: "text", text: "A" },
      },
    ]),
  ).document;
  expect(() =>
    applyCommand(plain, { type: "canvas.enable", layers: {} }),
  ).toThrow("every layer");
  expect(() =>
    applyCommand(plain, {
      type: "canvas.enable",
      layers: { wrong: makeLayer("text") },
    }),
  ).toThrow();
  expect(() =>
    applyCommand(plain, {
      type: "layer.translate",
      ids: ["text"],
      dx: 1,
      dy: 0,
    }),
  ).toThrow("Enable");
});

test("geometry and appearance commands are immutable, deterministic and structurally shared", () => {
  const original = deepFreeze(visualDocument());
  const command = {
    type: "layer.translate" as const,
    ids: ["a", "c"],
    dx: 7,
    dy: -9,
  };
  const moved = applyCommand(original, command);
  expect(moved.blocks.a.design?.x).toBe(17);
  expect(moved.blocks.c.design?.y).toBe(71);
  expect(moved.blocks.b).toBe(original.blocks.b);
  expect(moved.sections).toBe(original.sections);
  expect(moved.canvas).toBe(original.canvas);
  expect(applyCommands(original, batch([command])).document).toEqual(moved);
  expect(applyCommand(original, command)).toEqual(moved);
  const styled = applyCommand(moved, {
    type: "layer.update",
    ids: ["a"],
    patch: {
      rotation: 45,
      width: 180,
      height: 80,
      opacity: 0.6,
      blendMode: "luminosity",
      aspectLocked: true,
    },
  });
  expect(styled.blocks.a.design).toMatchObject({
    rotation: 45,
    width: 180,
    height: 80,
    opacity: 0.6,
    blendMode: "luminosity",
    aspectLocked: true,
  });
  expect(original.blocks.a.design?.x).toBe(10);
  const page = applyCommand(styled, {
    type: "canvas.update",
    patch: { width: 900, height: 1200, background: "#f0f0f0" },
  });
  expect(page.canvas).toMatchObject({
    width: 900,
    height: 1200,
    background: "#f0f0f0",
  });
  expect(page.blocks).toBe(styled.blocks);
  expect(boundsForElements([])).toBeNull();
  expect(
    boundsForElements([
      { x: -3, y: 2, width: 5, height: 7 },
      { x: 8, y: -4, width: 2, height: 3 },
    ]),
  ).toEqual({ x: -3, y: -4, width: 13, height: 13 });
});

test("grouping makes selected layers contiguous and reassigns prior membership", () => {
  const original = deepFreeze(visualDocument());
  let doc = applyCommand(original, {
    type: "group.create",
    id: "first",
    ids: ["a", "c"],
    name: "First group",
  });
  expect(doc.canvas?.order).toEqual(["b", "a", "c", "d"]);
  expect(doc.canvas?.groups[0].elementIds).toEqual(["a", "c"]);
  expect(groupFor(doc, "a")?.id).toBe("first");
  doc = applyCommand(doc, {
    type: "group.create",
    id: "second",
    ids: ["a", "b"],
    name: "Second group",
  });
  expect(
    doc.canvas?.groups.find((group) => group.id === "first")?.elementIds,
  ).toEqual(["c"]);
  expect(groupFor(doc, "a")?.id).toBe("second");
  expect(
    doc.canvas?.groups.find((group) => group.id === "second")?.elementIds,
  ).toEqual(["b", "a"]);
  expect(original.canvas?.groups).toEqual([]);
  const ungrouped = applyCommand(doc, { type: "group.ungroup", id: "second" });
  expect(ungrouped.canvas?.order).toEqual(doc.canvas?.order);
  expect(groupFor(ungrouped, "a")).toBeUndefined();
  expect(ungrouped.blocks).toBe(doc.blocks);
});

test("hidden layers remain editable while locks protect layer and group content", () => {
  let doc = applyCommand(visualDocument(), {
    type: "group.create",
    id: "group",
    ids: ["a", "b"],
    name: "Identity",
  });
  doc = applyCommand(doc, {
    type: "group.update",
    id: "group",
    patch: {
      opacity: 0.4,
      blendMode: "multiply",
      hidden: true,
      collapsed: true,
    },
  });
  doc = applyCommand(doc, {
    type: "block.update",
    id: "a",
    patch: { text: "Still editable" },
  });
  doc = applyCommand(doc, {
    type: "group.update",
    id: "group",
    patch: { locked: true },
  });
  expect(isLocked(doc, "a")).toBeTrue();
  for (const command of [
    { type: "layer.translate", ids: ["a"], dx: 10, dy: 0 },
    { type: "layer.update", ids: ["a"], patch: { x: 30 } },
    { type: "block.update", id: "a", patch: { text: "Blocked" } },
    { type: "block.delete", id: "a" },
    { type: "section.delete", id: "content" },
    { type: "group.ungroup", id: "group" },
    { type: "group.update", id: "group", patch: { opacity: 0.9 } },
  ])
    expect(() => applyCommands(doc, batch([command]))).toThrow("locked");
  doc = applyCommand(doc, {
    type: "group.update",
    id: "group",
    patch: { hidden: false, collapsed: false, locked: false },
  });
  doc = applyCommand(doc, {
    type: "layer.update",
    ids: ["a"],
    patch: { hidden: true, locked: true },
  });
  expect(isLocked(doc, "a")).toBeTrue();
  doc = applyCommand(doc, {
    type: "layer.update",
    ids: ["a"],
    patch: { locked: false },
  });
  expect(isLocked(doc, "a")).toBeFalse();
});

test("layer relocation covers relative order, group membership and complete group moves", () => {
  let doc = visualDocument();
  const element = (id: string) => ({ kind: "element" as const, id });
  const group = (id: string) => ({ kind: "group" as const, id });
  doc = applyCommand(doc, {
    type: "layer.relocate",
    source: element("a"),
    placement: "front",
  });
  expect(doc.canvas?.order).toEqual(["b", "c", "d", "a"]);
  doc = applyCommand(doc, {
    type: "layer.relocate",
    source: element("a"),
    placement: "back",
  });
  doc = applyCommand(doc, {
    type: "layer.relocate",
    source: element("d"),
    target: element("b"),
    placement: "below",
  });
  expect(doc.canvas?.order).toEqual(["a", "d", "b", "c"]);
  doc = applyCommand(doc, {
    type: "layer.relocate",
    source: element("a"),
    target: element("b"),
    placement: "above",
  });
  expect(doc.canvas?.order).toEqual(["d", "b", "a", "c"]);
  doc = applyCommand(doc, {
    type: "group.create",
    id: "group",
    ids: ["a", "c"],
    name: "Group",
  });
  doc = applyCommand(doc, {
    type: "layer.relocate",
    source: element("b"),
    target: group("group"),
    placement: "inside",
  });
  expect(groupFor(doc, "b")?.id).toBe("group");
  doc = applyCommand(doc, {
    type: "layer.relocate",
    source: element("d"),
    target: element("b"),
    placement: "below",
  });
  expect(groupFor(doc, "d")?.id).toBe("group");
  const unchanged = applyCommand(doc, {
    type: "layer.relocate",
    source: element("a"),
    target: group("group"),
    placement: "inside",
  });
  expect(unchanged).toBe(doc);
  doc = applyCommand(doc, {
    type: "layer.relocate",
    source: element("d"),
    placement: "back",
  });
  expect(groupFor(doc, "d")).toBeUndefined();
  const members = doc.canvas!.groups[0].elementIds;
  doc = applyCommand(doc, {
    type: "layer.relocate",
    source: group("group"),
    target: element("d"),
    placement: "below",
  });
  expect(doc.canvas?.order).toEqual([...members, "d"]);
  doc = applyCommand(doc, {
    type: "layer.relocate",
    source: group("group"),
    placement: "front",
  });
  expect(doc.canvas?.order).toEqual(["d", ...members]);
});

test("layer copies allocate explicit IDs, offset geometry and remain outside the original group", () => {
  const source = deepFreeze(
    applyCommand(visualDocument(), {
      type: "group.create",
      id: "group",
      ids: ["a", "b"],
      name: "Group",
    }),
  );
  const copy = applyCommand(source, {
    type: "layer.duplicate",
    copies: [
      { id: "a", newId: "copy-a" },
      { id: "b", newId: "copy-b" },
    ],
  });
  expect(copy.canvas?.order.slice(-2)).toEqual(["copy-a", "copy-b"]);
  expect(copy.blocks["copy-a"]).toMatchObject({
    id: "copy-a",
    text: "Sample a",
    design: { name: "a copy", x: 26, y: 36 },
  });
  expect(groupFor(copy, "copy-a")).toBeUndefined();
  expect(source.sections.content.blockIds).toEqual(["a", "b", "c", "d"]);
  const zeroOffset = applyCommand(source, {
    type: "layer.duplicate",
    copies: [{ id: "c", newId: "same-position" }],
    offset: 0,
  });
  expect(zeroOffset.blocks["same-position"].design?.x).toBe(
    source.blocks.c.design?.x,
  );
  expect(copy.sections.extra).toBe(source.sections.extra);
});

test("block creation and deletion keep visual and semantic references consistent", () => {
  let doc = applyCommand(visualDocument(), {
    type: "block.create",
    sectionId: "extra",
    block: { id: "added", kind: "shape", text: "" },
  });
  expect(doc.blocks.added.design).toMatchObject({
    type: "shape",
    shape: "rectangle",
  });
  expect(doc.canvas?.order.at(-1)).toBe("added");
  doc = applyCommand(doc, {
    type: "group.create",
    id: "group",
    ids: ["a", "added"],
    name: "Mixed",
  });
  doc = applyCommand(doc, { type: "block.delete", id: "a" });
  expect(doc.canvas?.order).not.toContain("a");
  expect(doc.canvas?.groups[0].elementIds).toEqual(["added"]);
  doc = applyCommand(doc, { type: "section.delete", id: "extra" });
  expect(doc.canvas?.groups).toEqual([]);
  expect(doc.canvas?.order).not.toContain("added");
});

test("visual command batches are atomic and restore exact geometry with undo and redo", () => {
  const doc = deepFreeze(visualDocument());
  const input = batch([
    { type: "layer.translate", ids: ["a"], dx: 10, dy: 5 },
    { type: "group.create", id: "group", ids: ["a", "b"], name: "Identity" },
    {
      type: "group.update",
      id: "group",
      patch: { blendMode: "screen", opacity: 0.75 },
    },
  ]);
  const session = execute(createSession(doc), input);
  expect(session.past).toHaveLength(1);
  expect(undo(session).document).toBe(doc);
  expect(redo(undo(session)).document).toBe(session.document);
  const before = JSON.stringify(doc);
  expect(() =>
    applyCommands(
      doc,
      batch([
        ...input.commands,
        { type: "layer.translate", ids: ["missing"], dx: 0, dy: 1 },
      ]),
    ),
  ).toThrow("not found");
  expect(JSON.stringify(doc)).toBe(before);
});

test("invalid references, unsafe patches and illegal nested or locked destinations fail", () => {
  let doc = applyCommand(visualDocument(), {
    type: "group.create",
    id: "group",
    ids: ["a", "b"],
    name: "Group",
  });
  const invalid: unknown[] = [
    { type: "layer.update", ids: ["missing"], patch: { hidden: true } },
    { type: "layer.translate", ids: ["missing"], dx: 1, dy: 0 },
    { type: "layer.translate", ids: ["a", "a"], dx: 1, dy: 0 },
    { type: "layer.update", ids: ["a"], patch: { x: Infinity } },
    { type: "layer.update", ids: ["a"], patch: { width: 0 } },
    { type: "layer.update", ids: ["a"], patch: { fill: "#ffffff" } },
    { type: "layer.duplicate", copies: [{ id: "a", newId: "d" }] },
    {
      type: "layer.duplicate",
      copies: [
        { id: "a", newId: "one" },
        { id: "a", newId: "two" },
      ],
    },
    { type: "group.create", id: "duplicate", ids: ["a"], name: "Too small" },
    {
      type: "group.create",
      id: "duplicate",
      ids: ["a", "a"],
      name: "Repeated",
    },
    {
      type: "group.create",
      id: "group",
      ids: ["a", "b"],
      name: "Duplicate ID",
    },
    { type: "group.update", id: "missing", patch: { hidden: true } },
    { type: "group.ungroup", id: "missing" },
    {
      type: "layer.relocate",
      source: { kind: "element", id: "a" },
      placement: "above",
    },
    {
      type: "layer.relocate",
      source: { kind: "element", id: "a" },
      target: { kind: "element", id: "c" },
      placement: "front",
    },
    {
      type: "layer.relocate",
      source: { kind: "element", id: "missing" },
      placement: "front",
    },
    {
      type: "layer.relocate",
      source: { kind: "element", id: "c" },
      target: { kind: "element", id: "d" },
      placement: "inside",
    },
    {
      type: "layer.relocate",
      source: { kind: "group", id: "group" },
      target: { kind: "group", id: "group" },
      placement: "inside",
    },
  ];
  for (const command of invalid)
    expect(() => applyCommands(doc, batch([command]))).toThrow();
  doc = applyCommand(doc, {
    type: "group.create",
    id: "other",
    ids: ["c", "d"],
    name: "Other group",
  });
  expect(() =>
    applyCommand(doc, {
      type: "layer.relocate",
      source: { kind: "group", id: "group" },
      target: { kind: "element", id: "c" },
      placement: "above",
    }),
  ).toThrow("nested");
  doc = applyCommand(doc, {
    type: "group.update",
    id: "other",
    patch: { locked: true },
  });
  expect(() =>
    applyCommand(doc, {
      type: "layer.relocate",
      source: { kind: "element", id: "a" },
      target: { kind: "group", id: "other" },
      placement: "inside",
    }),
  ).toThrow("locked");
});
