import { expect, test } from "bun:test";
import {
  applyCommands,
  applyCommand,
  createDocument,
  makeLayer,
  auditDocumentContrast,
  auditTextContrast,
  auditTextContrastRuns,
  DEFAULT_VISUAL_EFFECTS,
  serializeDocument,
  type Command,
  type Document,
  type LayerPatch,
} from "../../src";
import { batch, deepFreeze } from "./fixtures";

function scene(): Document {
  return applyCommands(
    createDocument("contrast-study"),
    batch([
      {
        type: "section.create",
        section: { id: "content", title: "", blockIds: [] },
      },
      ...["text", "good", "decoration", "hidden"].map((id): Command => ({
        type: "block.create",
        sectionId: "content",
        block: {
          id,
          kind: id === "decoration" ? "shape" : "text",
          text: "Read this",
        },
      })),
      {
        type: "canvas.enable",
        layers: {
          text: makeLayer("text", {
            x: 50,
            y: 60,
            width: 160,
            height: 30,
            color: "#aaaaaa",
            fontSize: 16,
          }),
          good: makeLayer("text", {
            x: 50,
            y: 120,
            width: 160,
            height: 30,
            color: "#202020",
            fontSize: 16,
          }),
          decoration: makeLayer("shape", {
            x: 400,
            y: 60,
            width: 20,
            height: 20,
            fill: "#445566",
          }),
          hidden: makeLayer("text", { x: 50, y: 180, hidden: true }),
        },
      },
    ]),
  ).document;
}
function change(doc: Document, patch: LayerPatch) {
  return applyCommand(doc, { type: "layer.update", ids: ["text"], patch });
}
function textMarks(doc: Document) {
  const layer = doc.blocks.text.design;
  if (layer?.type !== "text") throw Error("Expected a text fixture");
  return layer.marks;
}

test("global audit inventories all pages, groups and graphics without mutating private content", () => {
  const doc = applyCommands(
    scene(),
    batch([
      {
        type: "page.create",
        page: {
          id: "letter",
          name: "Letter",
          width: 700,
          height: 900,
          background: "#111111",
        },
      },
      { type: "layer.moveToPage", ids: ["good"], pageId: "letter" },
      { type: "layer.update", ids: ["good"], patch: { color: "#ffffff" } },
      {
        type: "group.create",
        id: "identity",
        ids: ["text", "decoration"],
        name: "Identity",
      },
    ]),
  ).document;
  const before = serializeDocument(doc);
  deepFreeze(doc);
  const report = auditDocumentContrast(doc);
  expect(report.textPassed).toBe(false);
  expect(report.summary.text).toEqual({
    total: 3,
    pass: 1,
    fail: 1,
    review: 0,
    skipped: 1,
  });
  expect(report.summary.graphics.review).toBe(1);
  expect(report.groups[0].id).toBe("identity");
  expect(report.elements.find((item) => item.id === "text")?.groupId).toBe(
    "identity",
  );
  expect(
    report.elements.find((item) => item.id === "good")?.runs[0],
  ).toMatchObject({ background: "#111111", passed: true });
  expect(
    report.elements.find((item) => item.id === "decoration")?.recommendations[0]
      .message,
  ).toContain("3:1");
  expect(
    auditDocumentContrast(doc, { pageIds: ["letter", "page-1"] }).pages.map(
      (page) => page.id,
    ),
  ).toEqual(["letter", "page-1"]);
  expect(
    auditDocumentContrast(doc, { pageIds: ["letter"] }).elements.map(
      (item) => item.id,
    ),
  ).toEqual(["good"]);
  expect(serializeDocument(doc)).toBe(before);
});

test("mixed-style failures have individually verified patches preserving links, weight and other text", () => {
  const doc = applyCommand(change(scene(), { color: "#202020" }), {
    type: "text.range.format",
    id: "text",
    markId: "original",
    start: 0,
    end: 4,
    style: {
      color: "#aaaaaa",
      fontWeight: 700,
      fontStyle: "italic",
      href: "https://example.com",
    },
  });
  const entry = auditDocumentContrast(doc).elements.find(
    (item) => item.id === "text",
  )!;
  expect(entry.runs.map((run) => run.passed)).toEqual([false, true]);
  const recommendation = entry.recommendations[0];
  expect(recommendation.verified).toBe(true);
  expect(recommendation.start).toBe(0);
  expect(recommendation.end).toBe(4);
  const fixed = applyCommands(doc, recommendation.patch!).document;
  expect(auditTextContrast(fixed, "text").aa).toBe(true);
  expect(fixed.blocks.text.text).toBe(doc.blocks.text.text);
  const segments = auditTextContrastRuns(fixed, "text");
  expect(segments[1].color).toBe("#202020");
  expect(textMarks(fixed)[0]).toMatchObject({
    href: "https://example.com",
    fontWeight: 700,
    fontStyle: "italic",
  });
  expect(textMarks(doc)).toHaveLength(1);
});

test("opacity corrections account for locked groups and restore every original lock", () => {
  const doc = applyCommands(
    change(scene(), { opacity: 0.1 }),
    batch([
      {
        type: "group.create",
        id: "identity",
        ids: ["text", "decoration"],
        name: "Identity",
      },
      { type: "group.update", id: "identity", patch: { opacity: 0.2 } },
      {
        type: "layer.update",
        ids: ["text", "decoration"],
        patch: { locked: true },
      },
      { type: "group.update", id: "identity", patch: { locked: true } },
    ]),
  ).document;
  const recommendation = auditDocumentContrast(doc).elements.find(
    (item) => item.id === "text",
  )!.recommendations[0];
  expect(recommendation.kind).toBe("opacity-and-color");
  expect(recommendation.message).toContain("every member");
  const fixed = applyCommands(doc, recommendation.patch!).document;
  expect(fixed.blocks.text.design?.locked).toBe(true);
  expect(fixed.blocks.decoration.design?.locked).toBe(true);
  expect(fixed.canvas?.groups[0]).toMatchObject({ locked: true, opacity: 1 });
  expect(auditTextContrast(fixed, "text").aa).toBe(true);
});

test("alpha colors and stronger AAA targets are measured after the real proposed edit", () => {
  for (const [color, level] of [
    ["#00000022", "AA"],
    ["#666666", "AAA"],
  ] as const) {
    const doc = change(scene(), { color });
    const entry = auditDocumentContrast(doc, { level }).elements.find(
      (item) => item.id === "text",
    )!;
    const recommendation = entry.recommendations[0];
    expect(recommendation.verified).toBe(true);
    const fixed = applyCommands(doc, recommendation.patch!).document;
    expect(
      auditTextContrast(fixed, "text")[level === "AAA" ? "aaa" : "aa"],
    ).toBe(true);
    expect(recommendation.ratio).toBeGreaterThanOrEqual(
      level === "AAA" ? 7 : 4.5,
    );
  }
  expect(
    auditDocumentContrast(change(scene(), { color: "#666666" })).elements.find(
      (item) => item.id === "text",
    )?.recommendations,
  ).toEqual([]);
});

test("active language and translated marks drive analysis and locale-safe fixes", () => {
  const doc = applyCommands(
    change(scene(), { color: "#202020" }),
    batch([
      { type: "locale.add", code: "fr", name: "French" },
      {
        type: "translation.set",
        id: "text",
        locale: "fr",
        text: "Lisez ceci",
        marks: [{ id: "french", start: 0, end: 10, color: "#ffffff" }],
      },
      { type: "locale.activate", code: "fr" },
    ]),
  ).document;
  const entry = auditDocumentContrast(doc).elements.find(
    (item) => item.id === "text",
  )!;
  expect(entry.runs[0]).toMatchObject({
    text: "Lisez ceci",
    color: "#ffffff",
    passed: false,
  });
  expect(entry.recommendations[0].patch?.commands[0]).toEqual({
    type: "locale.activate",
    code: "fr",
  });
  const fixed = applyCommands(doc, entry.recommendations[0].patch!).document;
  expect(auditTextContrast(fixed, "text").aa).toBe(true);
  expect(textMarks(fixed)).toEqual([]);
  expect(fixed.blocks.text.text).toBe("Read this");
  expect(
    auditTextContrast(
      applyCommand(fixed, { type: "locale.activate", code: "en" }),
      "text",
    ).aa,
  ).toBe(true);
});

test("unknown/filtered backgrounds and source/structured documents never receive invented passes", () => {
  for (const doc of [
    applyCommand(scene(), {
      type: "page.update",
      id: "page-1",
      patch: { background: "transparent" },
    }),
    applyCommands(
      scene(),
      batch([
        {
          type: "layer.update",
          ids: ["decoration"],
          patch: {
            x: 0,
            y: 0,
            width: 500,
            height: 500,
            effects: { ...DEFAULT_VISUAL_EFFECTS, blur: 2 },
          },
        },
        {
          type: "layer.relocate",
          source: { kind: "element", id: "decoration" },
          placement: "back",
        },
      ]),
    ).document,
    applyCommand(scene(), {
      type: "source.set",
      source: { format: "html", code: "<p>Source text</p>" },
    }),
  ]) {
    const report = auditDocumentContrast(doc);
    expect(report.textPassed).toBe(false);
    expect(report.elements.find((item) => item.id === "text")?.status).toBe(
      "review",
    );
    expect(
      report.elements.find((item) => item.id === "text")?.recommendations[0]
        .verified,
    ).toBe(false);
  }
  const structured = applyCommands(
    createDocument("structured"),
    batch([
      {
        type: "section.create",
        section: { id: "s", title: "Title", blockIds: [] },
      },
      {
        type: "block.create",
        sectionId: "s",
        block: { id: "b", kind: "text", text: "Read this" },
      },
    ]),
  ).document;
  expect(auditDocumentContrast(structured)).toMatchObject({
    mode: "structured",
    textPassed: false,
    summary: { text: { review: 1 } },
  });
  const source = applyCommand(createDocument("source"), {
    type: "source.set",
    source: { format: "html", code: "<p>Source</p>" },
  });
  expect(auditDocumentContrast(source)).toMatchObject({
    mode: "source",
    textPassed: false,
    pages: [],
    elements: [],
  });
  expect(auditDocumentContrast(source).recommendations?.[0].message).toContain(
    "editable canvas",
  );
});

test("range fixes avoid existing mark IDs and report formatting budgets without breaking the audit", () => {
  const doc = change(scene(), {
    marks: [{ id: "contrast-text-0-9", start: 0, end: 9, fontStyle: "italic" }],
  });
  const recommendation = auditDocumentContrast(doc).elements.find(
    (item) => item.id === "text",
  )!.recommendations[0];
  expect(
    recommendation.patch?.commands.some(
      (command) =>
        command.type === "text.range.format" &&
        command.markId === "contrast-text-0-9-1",
    ),
  ).toBe(true);
  const full = change(scene(), {
    marks: Array.from({ length: 200 }, (_, index) => ({
      id: `mark-${index}`,
      start: 0,
      end: 9,
      fontStyle: "italic" as const,
    })),
  });
  expect(
    auditDocumentContrast(full).elements.find((item) => item.id === "text")
      ?.recommendations[0].verified,
  ).toBe(false);
  expect(auditTextContrast(scene(), "text", { start: NaN, end: 5 }).level).toBe(
    "Unknown",
  );
});

test("document audit rejects invalid selection before processing elements", () => {
  for (const pageIds of [[], ["missing"], ["page-1", "page-1"]])
    expect(() => auditDocumentContrast(scene(), { pageIds })).toThrow(
      "page IDs",
    );
  expect(() =>
    auditDocumentContrast(scene(), { level: "other" as "AA" }),
  ).toThrow("AA or AAA");
  expect(() =>
    auditDocumentContrast(createDocument("empty"), { pageIds: ["page-1"] }),
  ).toThrow("page IDs");
});
