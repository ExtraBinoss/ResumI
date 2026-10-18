import { expect, test } from "bun:test";
import {
  applyCommand,
  applyCommands,
  auditTextContrast,
  canvasForPage,
  createDocument,
  createSession,
  documentPages,
  execute,
  duplicateDocument,
  INITIAL_PAGE_ID,
  makeLayer,
  MAX_DOCUMENT_PAGES,
  pageForLayer,
  redo,
  serializeDocument,
  deserializeDocument,
  validateDocument,
  undo,
  type Document,
} from "../../src";
import { batch, deepFreeze, visualDocument } from "./fixtures";

const second = {
  id: "second",
  name: "Experience",
  width: 1123,
  height: 1587,
  background: "#eeeeee",
};
const addPage = (doc = visualDocument()) =>
  applyCommand(doc, { type: "page.create", page: second });

test("legacy JSON preserves its exact representation and exposes the implicit page", () => {
  const doc = deepFreeze(visualDocument());
  const json = serializeDocument(doc);
  expect(documentPages(doc)).toEqual([
    {
      id: INITIAL_PAGE_ID,
      name: "Page 1",
      width: 794,
      height: 1123,
      background: "#ffffff",
    },
  ]);
  expect(canvasForPage(doc, INITIAL_PAGE_ID)).toBe(doc.canvas!);
  expect(pageForLayer(doc, "a")).toBe(INITIAL_PAGE_ID);
  expect(deserializeDocument(json)).toEqual(doc);
  expect(serializeDocument(doc)).toBe(json);
  expect(documentPages(createDocument("plain"))).toEqual([]);
  expect(() => pageForLayer(doc, "missing")).toThrow("Layer not found");
  expect(() => canvasForPage(doc, "missing")).toThrow("Page not found");
});

test("validated human and agent page commands preserve content and structural sharing", () => {
  const doc = deepFreeze(visualDocument());
  let next = addPage(doc);
  expect(next.blocks).toBe(doc.blocks);
  expect(next.sections).toBe(doc.sections);
  next = applyCommands(
    next,
    batch([
      {
        type: "page.update",
        id: "second",
        patch: { name: "Projects", width: 1587 },
      },
      { type: "layer.moveToPage", ids: ["a", "b"], pageId: "second" },
    ]),
  ).document;
  expect(pageForLayer(next, "a")).toBe("second");
  expect(next.blocks.c).toBe(doc.blocks.c);
  expect(next.blocks.a.text).toBe(doc.blocks.a.text);
  expect(canvasForPage(next, "second")).toMatchObject({
    width: 1587,
    height: 1587,
    background: "#eeeeee",
    order: ["a", "b"],
    groups: [],
  });
  expect(canvasForPage(next, INITIAL_PAGE_ID).order).toEqual(["c", "d"]);
  expect(canvasForPage(next, "second").fonts).toBe(doc.canvas!.fonts);
  expect(
    applyCommand(next, {
      type: "layer.moveToPage",
      ids: ["a"],
      pageId: "second",
    }),
  ).toBe(next);
  next = applyCommand(next, {
    type: "layer.moveToPage",
    ids: ["a", "b"],
    pageId: INITIAL_PAGE_ID,
  });
  expect(next.blocks.a.design?.pageId).toBeUndefined();
  next = applyCommand(next, {
    type: "page.update",
    id: INITIAL_PAGE_ID,
    patch: { width: 2245, height: 3179 },
  });
  expect(next.canvas?.width).toBe(2245);
  expect(
    applyCommand(next, { type: "page.delete", id: "second" }).canvas?.pages,
  ).toEqual([]);
});

test("page create insertion and independent direct layer creation round trip and duplicate", () => {
  let doc = addPage();
  doc = applyCommand(doc, {
    type: "page.create",
    page: { ...second, id: "before" },
    index: 0,
  });
  doc = applyCommand(doc, {
    type: "block.create",
    sectionId: "extra",
    block: {
      id: "new",
      kind: "text",
      text: "Synthetic second page",
      design: makeLayer("text", { pageId: "second" }),
    },
  });
  expect(documentPages(doc).map((page) => page.id)).toEqual([
    INITIAL_PAGE_ID,
    "before",
    "second",
  ]);
  expect(deserializeDocument(serializeDocument(doc))).toEqual(doc);
  let counter = 0;
  const copy = duplicateDocument(doc, "copy", () => `copied-${counter++}`);
  const copiedPage = copy.canvas!.pages![1];
  const block = Object.values(copy.blocks).find(
    (block) => block.text === "Synthetic second page",
  )!;
  expect(copiedPage.id).not.toBe("second");
  expect(block.design?.pageId).toBe(copiedPage.id);
});

test("group membership stays on one page and group commands cannot bypass it", () => {
  let doc = applyCommand(addPage(), {
    type: "group.create",
    id: "group",
    ids: ["a", "b"],
    name: "Identity",
  });
  expect(() =>
    applyCommand(doc, {
      type: "layer.moveToPage",
      ids: ["a"],
      pageId: "second",
    }),
  ).toThrow("every member");
  const group = doc.canvas!.groups[0];
  doc = applyCommand(doc, {
    type: "layer.moveToPage",
    ids: ["a", "b"],
    pageId: "second",
  });
  expect(doc.canvas!.groups[0]).toBe(group);
  expect(canvasForPage(doc, INITIAL_PAGE_ID).groups).toEqual([]);
  expect(canvasForPage(doc, "second").groups).toEqual([group]);
  expect(() =>
    applyCommand(doc, {
      type: "group.create",
      id: "mixed",
      ids: ["a", "c"],
      name: "Mixed",
    }),
  ).toThrow("one page");
  expect(() =>
    applyCommand(doc, {
      type: "layer.update",
      ids: ["a"],
      patch: { pageId: INITIAL_PAGE_ID },
    }),
  ).toThrow("one page");
  doc = applyCommand(doc, {
    type: "group.update",
    id: "group",
    patch: { locked: true },
  });
  expect(() =>
    applyCommand(doc, {
      type: "layer.moveToPage",
      ids: ["a", "b"],
      pageId: INITIAL_PAGE_ID,
    }),
  ).toThrow("locked");
});

test("invalid page edits and imports are atomic and bounded", () => {
  const doc = deepFreeze(addPage());
  for (const command of [
    { type: "page.create", page: second },
    { type: "page.create", page: { ...second, id: INITIAL_PAGE_ID } },
    { type: "page.create", page: { ...second, id: "a" } },
    { type: "page.create", page: { ...second, id: "third", width: 99 } },
    { type: "page.create", page: { ...second, id: "third" }, index: 2 },
    { type: "page.update", id: "second", patch: { height: 5001 } },
    { type: "page.update", id: "missing", patch: { height: 1200 } },
    { type: "page.update", id: INITIAL_PAGE_ID, patch: { name: "Rename" } },
    { type: "page.delete", id: INITIAL_PAGE_ID },
    { type: "layer.moveToPage", ids: ["missing"], pageId: "second" },
    { type: "layer.moveToPage", ids: ["a"], pageId: "missing" },
    { type: "canvas.update", patch: { pages: [] } },
  ])
    expect(() => applyCommands(doc, batch([command]))).toThrow();
  const nonempty = applyCommand(doc, {
    type: "layer.moveToPage",
    ids: ["a"],
    pageId: "second",
  });
  expect(() =>
    applyCommand(nonempty, { type: "page.delete", id: "second" }),
  ).toThrow("empty");
  for (const mutate of [
    (next: Document) => {
      next.canvas!.pages = [second, second];
    },
    (next: Document) => {
      next.blocks.a.design!.pageId = "missing";
    },
    (next: Document) => {
      next.canvas!.pages![0].id = "a";
    },
  ]) {
    const next = structuredClone(doc);
    mutate(next);
    expect(() => validateDocument(next)).toThrow();
  }
  let maximum = doc;
  for (let index = 2; index < MAX_DOCUMENT_PAGES; index++)
    maximum = applyCommand(maximum, {
      type: "page.create",
      page: { ...second, id: `page-${index + 1}` },
    });
  expect(() =>
    applyCommand(maximum, {
      type: "page.create",
      page: { ...second, id: "overflow" },
    }),
  ).toThrow("at most 20");
  expect(() =>
    applyCommand(createDocument("plain"), {
      type: "page.create",
      page: second,
    }),
  ).toThrow("canvas");
  const source = applyCommand(doc, {
    type: "source.set",
    source: { format: "html", code: "<p>Source</p>" },
  });
  expect(() =>
    applyCommand(source, {
      type: "page.create",
      page: { ...second, id: "third" },
    }),
  ).toThrow("Deactivate source");
});

test("page additions and placement share one attributed undo step", () => {
  const before = visualDocument();
  const session = execute(
    createSession(before),
    batch([
      { type: "page.create", page: second },
      { type: "layer.moveToPage", ids: ["a"], pageId: "second" },
    ]),
  );
  expect(session.past).toHaveLength(1);
  expect(session.past[0].batch.actor.kind).toBe("agent");
  expect(undo(session).document).toBe(before);
  expect(redo(undo(session)).document).toBe(session.document);
  expect(session.document.blocks.b).toBe(before.blocks.b);
});

test("contrast uses the actual page background and ignores layers on other pages", () => {
  let doc = addPage();
  doc = applyCommands(
    doc,
    batch([
      { type: "page.update", id: "second", patch: { background: "#000000" } },
      { type: "layer.moveToPage", ids: ["a"], pageId: "second" },
      { type: "layer.update", ids: ["a"], patch: { color: "#ffffff" } },
    ]),
  ).document;
  expect(auditTextContrast(doc, "a")).toMatchObject({
    ratio: 21,
    background: "#000000",
    reliable: true,
    level: "AAA",
  });
});
