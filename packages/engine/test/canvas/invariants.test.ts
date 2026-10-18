import { expect, test } from "bun:test";
import {
  applyCommand,
  applyCommands,
  validateDocument,
  serializeDocument,
  deserializeDocument,
  duplicateDocument,
  makeLayer,
  type Document,
} from "../../src";
import { batch, visualDocument } from "./fixtures";

function invalidChange(change: (document: Document) => void) {
  const doc = structuredClone(visualDocument());
  change(doc);
  expect(() => validateDocument(doc)).toThrow();
}

test("visual documents remain portable and duplication rekeys canvas order and group ownership", () => {
  let doc = applyCommand(visualDocument(), {
    type: "group.create",
    id: "group",
    ids: ["a", "b"],
    name: "Identity",
  });
  doc = applyCommand(doc, {
    type: "canvas.update",
    patch: {
      fonts: [
        {
          id: "custom-font",
          name: "Synthetic Font",
          dataUrl: "data:font/woff2;base64,AAAA",
          format: "woff2",
        },
      ],
    },
  });
  doc = applyCommand(doc, {
    type: "text.range.format",
    id: "a",
    markId: "mark",
    start: 0,
    end: 2,
    style: { underline: true },
  });
  expect(deserializeDocument(serializeDocument(doc))).toEqual(doc);
  let counter = 0;
  const copy = duplicateDocument(doc, "copy", () => `copy-${counter++}`);
  expect(copy.canvas?.order).toEqual(["copy-1", "copy-2", "copy-3", "copy-4"]);
  expect(copy.canvas?.groups[0]).toMatchObject({
    id: "copy-6",
    name: "Identity",
    elementIds: ["copy-1", "copy-2"],
  });
  expect(copy.canvas?.fonts).toEqual(doc.canvas?.fonts);
  const edited = applyCommand(copy, {
    type: "layer.translate",
    ids: ["copy-1"],
    dx: 100,
    dy: 0,
  });
  expect(edited.blocks["copy-1"].design?.x).toBe(110);
  expect(doc.blocks.a.design?.x).toBe(10);
  expect(doc.canvas?.groups[0].id).toBe("group");
  expect(() => duplicateDocument(doc, "copy", () => "reused")).toThrow();
});

test("canvas invariants reject missing or repeated z-order entries and wrong layer variants", () => {
  invalidChange((doc) => {
    doc.canvas!.order = ["a", "b", "c"];
  });
  invalidChange((doc) => {
    doc.canvas!.order = ["a", "b", "c", "c"];
  });
  invalidChange((doc) => {
    doc.canvas!.order = ["a", "b", "c", "missing"];
  });
  invalidChange((doc) => {
    delete doc.blocks.a.design;
  });
  invalidChange((doc) => {
    doc.blocks.a.design = makeLayer("shape");
  });
  invalidChange((doc) => {
    delete doc.canvas;
  });
  const plain = applyCommands(
    visualDocument(),
    batch([
      {
        type: "block.create",
        sectionId: "extra",
        block: { id: "shape", kind: "shape", text: "" },
      },
    ]),
  ).document;
  const withoutCanvas = structuredClone(plain);
  delete withoutCanvas.canvas;
  for (const block of Object.values(withoutCanvas.blocks)) delete block.design;
  expect(() => validateDocument(withoutCanvas)).toThrow(
    "Visual blocks require",
  );
});

test("groups enforce unique IDs, unique membership and contiguous layer order", () => {
  const group = {
    id: "group",
    name: "Group",
    elementIds: ["a", "b"],
    opacity: 1,
    blendMode: "normal" as const,
    collapsed: false,
    locked: false,
    hidden: false,
  };
  for (const id of ["document", "content", "a"])
    invalidChange((doc) => {
      doc.canvas!.groups = [{ ...group, id }];
    });
  invalidChange((doc) => {
    doc.canvas!.groups = [group, { ...group, elementIds: ["c", "d"] }];
  });
  invalidChange((doc) => {
    doc.canvas!.groups = [
      group,
      { ...group, id: "second", elementIds: ["b", "c"] },
    ];
  });
  invalidChange((doc) => {
    doc.canvas!.groups = [{ ...group, elementIds: ["a", "c"] }];
  });
  invalidChange((doc) => {
    doc.canvas!.groups = [{ ...group, elementIds: ["missing"] }];
  });
  invalidChange((doc) => {
    doc.canvas!.groups = [{ ...group, elementIds: ["a", "a"] }];
  });
  invalidChange((doc) => {
    doc.canvas!.groups = [{ ...group, elementIds: [] }];
  });
  const doc = visualDocument();
  doc.canvas!.groups = [{ ...group, elementIds: ["b", "a"] }];
  expect(validateDocument(doc).canvas?.groups[0].elementIds).toEqual([
    "b",
    "a",
  ]);
});

test("text range imports reject duplicate IDs, inverted or out-of-bounds ranges", () => {
  for (const marks of [
    [
      { id: "same", start: 0, end: 1 },
      { id: "same", start: 1, end: 2 },
    ],
    [{ id: "mark", start: 3, end: 2 }],
    [{ id: "mark", start: 0, end: 99 }],
  ])
    invalidChange((doc) => {
      if (doc.blocks.a.design?.type === "text")
        doc.blocks.a.design.marks = marks;
    });
});

test("shape, gradient, embedded font and raster sources reject unchecked payloads", () => {
  let doc = applyCommand(visualDocument(), {
    type: "block.create",
    sectionId: "extra",
    block: { id: "shape", kind: "shape", text: "" },
  });
  expect(() =>
    applyCommand(doc, {
      type: "layer.update",
      ids: ["shape"],
      patch: { shape: "unknown-shape" },
    }),
  ).toThrow("Unknown shape");
  expect(() =>
    applyCommand(doc, {
      type: "layer.update",
      ids: ["shape"],
      patch: {
        gradient: {
          type: "linear",
          angle: 90,
          stops: [
            { id: "same", offset: 0, color: "#000000" },
            { id: "same", offset: 1, color: "#ffffff" },
          ],
        },
      },
    }),
  ).toThrow("Duplicate gradient");
  doc = applyCommand(doc, {
    type: "layer.update",
    ids: ["shape"],
    patch: {
      shape: "custom-icon",
      vector: { path: "M0 0L10 10Z", viewBox: "0 0 24 24", strokeOnly: true },
    },
  });
  expect(doc.blocks.shape.design).toMatchObject({
    shape: "custom-icon",
    vector: { strokeOnly: true },
  });
  for (const command of [
    {
      type: "layer.update",
      ids: ["shape"],
      patch: {
        vector: { path: "<script>alert(1)</script>", viewBox: "0 0 24 24" },
      },
    },
    {
      type: "layer.update",
      ids: ["shape"],
      patch: { fill: "red; background:url(https://example.com)" },
    },
    { type: "layer.update", ids: ["shape"], patch: { effects: { blur: -1 } } },
    {
      type: "block.create",
      sectionId: "extra",
      block: {
        id: "image",
        kind: "image",
        text: "",
        design: makeLayer("image", { src: "https://example.com/tracker.png" }),
      },
    },
    {
      type: "block.create",
      sectionId: "extra",
      block: {
        id: "image",
        kind: "image",
        text: "",
        design: makeLayer("image", { src: "data:image/svg+xml;base64,AAAA" }),
      },
    },
    {
      type: "canvas.update",
      patch: {
        fonts: [
          {
            id: "font",
            name: "Bad; color:red",
            dataUrl: "data:font/woff2;base64,AAAA",
            format: "woff2",
          },
        ],
      },
    },
    {
      type: "canvas.update",
      patch: {
        fonts: [
          {
            id: "font",
            name: "Synthetic",
            dataUrl: "https://example.com/font.woff2",
            format: "woff2",
          },
        ],
      },
    },
  ])
    expect(() => applyCommands(doc, batch([command]))).toThrow();
  const font = {
    id: "font",
    name: "Synthetic",
    dataUrl: "data:font/woff2;base64,AAAA",
    format: "woff2" as const,
  };
  expect(() =>
    applyCommand(doc, {
      type: "canvas.update",
      patch: { fonts: [font, font] },
    }),
  ).toThrow("Duplicate embedded fonts");
  expect(() =>
    applyCommand(doc, {
      type: "block.create",
      sectionId: "extra",
      block: { id: "group", kind: "text", text: "" },
    }),
  ).not.toThrow();
  doc = applyCommand(doc, {
    type: "group.create",
    id: "group",
    ids: ["a", "b"],
    name: "Group",
  });
  expect(() =>
    applyCommand(doc, {
      type: "block.create",
      sectionId: "extra",
      block: { id: "group", kind: "text", text: "" },
    }),
  ).toThrow("already exists");
});
