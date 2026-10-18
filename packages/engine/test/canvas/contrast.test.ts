import { expect, test } from "bun:test";
import {
  applyCommands,
  applyCommand,
  auditTextContrast,
  contrastRatio,
  relativeLuminance,
  createDocument,
  makeLayer,
  serializeDocument,
  type Layer,
  type Document,
  type Command,
} from "../../src";
import { batch, deepFreeze } from "./fixtures";
const text = (patch: Parameters<typeof makeLayer>[1] = {}) =>
  makeLayer("text", {
    x: 50,
    y: 50,
    width: 120,
    height: 30,
    fontSize: 16,
    fontWeight: 400,
    color: "#000000",
    ...patch,
  });
const rectangle = (patch: Parameters<typeof makeLayer>[1] = {}) =>
  makeLayer("shape", {
    x: 0,
    y: 0,
    width: 300,
    height: 300,
    shape: "rectangle",
    fill: "#ffffff",
    strokeWidth: 0,
    ...patch,
  });
function scene(layers: [string, Layer][], content = "Read this") {
  const commands: Command[] = [
    {
      type: "section.create",
      section: { id: "content", title: "Content", blockIds: [] },
    },
    ...layers.map(([id, layer]) => ({
      type: "block.create" as const,
      sectionId: "content",
      block: { id, kind: layer.type, text: content },
    })),
    { type: "canvas.enable", layers: Object.fromEntries(layers) },
  ];
  return applyCommands(createDocument("contrast-document"), batch(commands))
    .document;
}
const patch = (
  doc: Document,
  id: string,
  value: NonNullable<Parameters<typeof makeLayer>[1]>,
) => applyCommand(doc, { type: "layer.update", ids: [id], patch: value });

test("WCAG contrast helpers use exact luminance and reject colors without an opaque context", () => {
  expect(contrastRatio("#000000", "#ffffff")).toBe(21);
  expect(contrastRatio("#ffffff", "#000000")).toBe(21);
  expect(contrastRatio("#2468ad", "#2468ad")).toBe(1);
  expect(relativeLuminance("#ff0000")).toBeCloseTo(0.2126, 10);
  expect(relativeLuminance("#010101")).toBeCloseTo(0.00030352698, 10);
  for (const invalid of ["red", "#123", "transparent", "#00000080"]) {
    expect(relativeLuminance(invalid)).toBeNull();
    expect(contrastRatio(invalid, "#ffffff")).toBeNull();
  }
});

test("read-only text analysis reports exact black/white contrast without changing a frozen document", () => {
  const doc = deepFreeze(scene([["text", text()]])),
    serialized = serializeDocument(doc);
  expect(auditTextContrast(doc, "text")).toMatchObject({
    ratio: 21,
    foreground: "#000000",
    background: "#ffffff",
    level: "AAA",
    aa: true,
    aaa: true,
    reliable: true,
    isLargeText: false,
  });
  expect(serializeDocument(doc)).toBe(serialized);
});

test("large text thresholds and AA grading do not round a failing ratio up", () => {
  const doc = scene([["text", text({ color: "#777777" })]]);
  const normal = auditTextContrast(doc, "text");
  expect(normal.ratio).toBeCloseTo(4.478, 3);
  expect(normal.level).toBe("Fail");
  expect(
    auditTextContrast(patch(doc, "text", { fontSize: 24 }), "text"),
  ).toMatchObject({ level: "AA", isLargeText: true });
  expect(
    auditTextContrast(
      patch(doc, "text", { fontSize: (14 * 96) / 72, fontWeight: 700 }),
      "text",
    ).level,
  ).toBe("AA");
  expect(
    auditTextContrast(
      patch(doc, "text", { fontSize: 18.66, fontWeight: 700 }),
      "text",
    ).level,
  ).toBe("Fail");
});

test("RGBA text, layer opacity and translucent solid fills composite over the actual page", () => {
  const doc = scene([
    ["background", rectangle({ fill: "#0000ff80" })],
    ["text", text({ color: "#00000080", opacity: 0.5 })],
  ]);
  const result = auditTextContrast(doc, "text");
  expect(result.background).toBe("#7f7fff");
  expect(result.foreground).toBe("#5f5fbf");
  expect(result.level).toBe("Fail");
  expect(result.reliable).toBe(true);
});

test("flat group opacity composites once after its opaque child layers", () => {
  let doc = scene([
    ["red", rectangle({ fill: "#ff0000" })],
    ["blue", rectangle({ fill: "#0000ff" })],
    ["text", text()],
  ]);
  doc = applyCommand(doc, {
    type: "group.create",
    id: "background-group",
    ids: ["red", "blue"],
    name: "Backdrop",
  });
  doc = applyCommand(doc, {
    type: "group.update",
    id: "background-group",
    patch: { opacity: 0.5 },
  });
  expect(auditTextContrast(doc, "text")).toMatchObject({
    background: "#8080ff",
    foreground: "#000000",
    reliable: true,
  });
  doc = applyCommand(doc, {
    type: "group.update",
    id: "background-group",
    patch: { hidden: true },
  });
  expect(auditTextContrast(doc, "text").background).toBe("#ffffff");
});

test("the selected text and its background share their parent group's composite opacity", () => {
  let doc = scene([
    ["background", rectangle({ fill: "#ff0000" })],
    ["text", text()],
  ]);
  doc = applyCommand(doc, {
    type: "group.create",
    id: "text-group",
    ids: ["background", "text"],
    name: "Heading",
  });
  doc = applyCommand(doc, {
    type: "group.update",
    id: "text-group",
    patch: { opacity: 0.5 },
  });
  expect(auditTextContrast(doc, "text")).toMatchObject({
    background: "#ff8080",
    foreground: "#808080",
    reliable: true,
  });
  expect(
    auditTextContrast(patch(doc, "text", { opacity: 0.5 }), "text").foreground,
  ).toBe("#bf8080");
});

const unsupported: [string, Layer][] = [
  [
    "Image background",
    makeLayer("image", {
      x: 0,
      y: 0,
      width: 300,
      height: 300,
      src: "data:image/png;base64,AAAA",
    }),
  ],
  [
    "Gradient background",
    rectangle({
      gradient: {
        type: "linear",
        angle: 0,
        stops: [
          { id: "start", offset: 0, color: "#ffffff" },
          { id: "end", offset: 1, color: "#000000" },
        ],
      },
    }),
  ],
  ["Variable background", rectangle({ shape: "circle" })],
  ["Variable background", rectangle({ width: 80 })],
  ["Variable background", rectangle({ rotation: 10 })],
  [
    "Filtered background",
    rectangle({
      effects: {
        blur: 0,
        grain: 0,
        grainSize: 2,
        dither: 0,
        brightness: 1.2,
        contrast: 1,
        saturation: 1,
      },
    }),
  ],
  [
    "Shadow background",
    rectangle({
      shadow: { x: 0, y: 0, blur: 20, spread: 0, color: "#00000080" },
    }),
  ],
  ["Blended background", rectangle({ blendMode: "multiply" })],
  ["Overlapping text", text()],
];
for (const [reason, layer] of unsupported)
  test(`complex backgrounds return Unknown: ${reason} / ${layer.type}`, () => {
    expect(
      auditTextContrast(
        scene([
          ["background", layer],
          ["text", text()],
        ]),
        "text",
      ),
    ).toMatchObject({
      level: "Unknown",
      ratio: null,
      reliable: false,
      aa: false,
      reason,
    });
  });

test("foreground covers, group blends and text blends never yield a false AA", () => {
  expect(
    auditTextContrast(
      scene([
        ["text", text()],
        ["cover", rectangle()],
      ]),
      "text",
    ).reason,
  ).toBe("Overlapping foreground layer");
  expect(
    auditTextContrast(
      scene([["text", text({ blendMode: "multiply" })]]),
      "text",
    ).reason,
  ).toBe("Blended text");
  let doc = scene([
    ["background", rectangle()],
    ["text", text()],
  ]);
  doc = applyCommand(doc, {
    type: "group.create",
    id: "group",
    ids: ["background", "text"],
    name: "Group",
  });
  doc = applyCommand(doc, {
    type: "group.update",
    id: "group",
    patch: { blendMode: "multiply" },
  });
  expect(auditTextContrast(doc, "text").reason).toBe("Blended background");
});

test("hidden and transparent decoration or nonoverlapping elements do not obscure the audit", () => {
  const doc = scene([
    ["hidden", rectangle({ hidden: true })],
    ["distant", rectangle({ x: 1000 })],
    ["text", text()],
    ["invisible", rectangle({ opacity: 0 })],
    ["transparent", rectangle({ fill: "transparent" })],
  ]);
  expect(auditTextContrast(doc, "text").ratio).toBe(21);
  expect(
    auditTextContrast(patch(doc, "text", { hidden: true }), "text").reason,
  ).toBe("Hidden text");
});

test("mixed rich text reports the worst grade and a selected range audits its own styling", () => {
  const doc = scene([
    [
      "text",
      text({ marks: [{ id: "light", start: 5, end: 9, color: "#ffffff" }] }),
    ],
  ]);
  expect(auditTextContrast(doc, "text")).toMatchObject({
    level: "Fail",
    ratio: 1,
    foreground: "#ffffff",
  });
  expect(auditTextContrast(doc, "text", { start: 0, end: 4 })).toMatchObject({
    level: "AAA",
    ratio: 21,
  });
  expect(auditTextContrast(doc, "text", { start: 0, end: 20 }).level).toBe(
    "Unknown",
  );
  expect(auditTextContrast(doc, "text", { start: 2, end: 2 }).level).toBe(
    "Unknown",
  );
});

test("missing visual contexts, empty text and transparent pages remain unmeasured", () => {
  expect(auditTextContrast(createDocument("empty"), "missing").reason).toBe(
    "No visual text layer",
  );
  expect(auditTextContrast(scene([["text", text()]], ""), "text").reason).toBe(
    "No text in this range",
  );
  const doc = applyCommand(scene([["text", text()]]), {
    type: "canvas.update",
    patch: { background: "transparent" },
  });
  expect(auditTextContrast(doc, "text").reason).toBe(
    "Transparent page background",
  );
});

test("active source previews are not confused with their inactive visual backup", () => {
  const doc = applyCommand(scene([["text", text()]]), {
    type: "source.set",
    source: { format: "html", code: "<p>Source preview</p>" },
  });
  expect(auditTextContrast(doc, "text").reason).toBe("Source preview");
  expect(
    auditTextContrast(
      applyCommand(doc, { type: "source.activate", enabled: false }),
      "text",
    ).ratio,
  ).toBe(21);
});
