import { expect, test } from "bun:test";
import {
  applyCommand,
  applyCommands,
  normalizeTextMarks,
  richTextSegments,
  textStyleAt,
  textStyleAcrossRange,
  replaceTextRange,
  updateTextPreservingMarks,
  safeTextHref,
  type TextMark,
} from "../../src";
import { batch, visualDocument } from "./fixtures";

const marks: TextMark[] = [
  { id: "bold", start: 0, end: 4, fontWeight: 700, color: "#112233" },
  {
    id: "link",
    start: 2,
    end: 6,
    href: "https://example.com",
    fontStyle: "italic",
    underline: true,
    strike: false,
    fontFamily: "Arial",
    fontSize: 20,
  },
];

test("rich text segments preserve precise overlapping styles and winning mark order", () => {
  const segments = richTextSegments("ABCDEF", marks);
  expect(segments.map((segment) => segment.text)).toEqual(["AB", "CD", "EF"]);
  expect(segments[1]).toMatchObject({
    start: 2,
    end: 4,
    markIds: ["bold", "link"],
    style: {
      fontWeight: 700,
      href: "https://example.com",
      fontStyle: "italic",
      underline: true,
      strike: false,
      fontSize: 20,
    },
  });
  expect(segments.map((segment) => segment.text).join("")).toBe("ABCDEF");
  expect(richTextSegments("")).toEqual([]);
  expect(normalizeTextMarks(undefined, 4)).toEqual([]);
  expect(
    normalizeTextMarks(
      [
        { id: "bad", start: -2.3, end: 2.9 },
        { id: "", start: 0, end: 2 },
        { id: "empty", start: 4, end: 1 },
      ],
      4,
    ),
  ).toEqual([{ id: "bad", start: 0, end: 2 }]);
  expect(textStyleAt("ABCDEF", marks, 6)).toMatchObject({
    href: "https://example.com",
  });
  expect(textStyleAt("", undefined, 0)).toEqual({});
});

test("selection style reports mixed values without losing common or inherited styles", () => {
  const full = textStyleAcrossRange("ABCDEF", marks, 6, 0, {
    fontWeight: 400,
    color: "#112233",
  });
  expect(full.style.color).toBe("#112233");
  expect(full.style.fontWeight).toBeUndefined();
  expect(full.mixed).toContain("fontWeight");
  expect(full.mixed).toContain("href");
  expect(
    textStyleAcrossRange("ABCDEF", marks, 3, 3, { fontWeight: 400 }).style,
  ).toMatchObject({ fontWeight: 700, fontStyle: "italic" });
  expect(textStyleAcrossRange("", undefined, 0, 0, { fontSize: 12 })).toEqual({
    style: { fontSize: 12 },
    mixed: [],
  });
  expect(textStyleAcrossRange("ABCDEF", marks, 0, 2).style).toEqual({
    fontWeight: 700,
    color: "#112233",
  });
});

test("text replacements shift, trim, extend and remove affected ranges without changing the input", () => {
  const source: TextMark[] = [
    { id: "before", start: 0, end: 1, underline: true },
    { id: "across", start: 1, end: 9, fontWeight: 700 },
    { id: "left", start: 2, end: 5, fontStyle: "italic" },
    { id: "right", start: 5, end: 9, color: "#112233" },
    { id: "inside", start: 4, end: 6, strike: true },
    { id: "after", start: 9, end: 10, underline: false },
  ];
  const before = JSON.stringify(source);
  const result = replaceTextRange("0123456789", source, 3, 7, "XY");
  expect(result.text).toBe("012XY789");
  expect(result.start).toBe(3);
  expect(result.end).toBe(5);
  expect(result.marks.find((mark) => mark.id === "before")).toMatchObject({
    start: 0,
    end: 1,
  });
  expect(result.marks.find((mark) => mark.id === "across")).toMatchObject({
    start: 1,
    end: 7,
  });
  expect(result.marks.find((mark) => mark.id === "left")).toMatchObject({
    start: 2,
    end: 3,
  });
  expect(result.marks.find((mark) => mark.color === "#112233")).toMatchObject({
    start: 5,
    end: 7,
  });
  expect(result.marks.find((mark) => mark.id === "inside")).toBeUndefined();
  expect(result.marks.find((mark) => mark.id === "after")).toMatchObject({
    start: 7,
    end: 8,
  });
  expect(JSON.stringify(source)).toBe(before);
  expect(
    replaceTextRange("abc", [{ id: "all", start: 0, end: 3 }], 0, 3, "").marks,
  ).toEqual([]);
  expect(updateTextPreservingMarks("ABCDEF", "ABCDEF", marks)).toEqual(marks);
  expect(
    updateTextPreservingMarks("ABCDEF", "ABxyCDEF", marks)[0],
  ).toMatchObject({ start: 0, end: 6 });
  for (const href of [
    "https://example.com",
    "http://example.com",
    "mailto:test@example.com",
    "tel:+33111111111",
  ])
    expect(safeTextHref(` ${href} `)).toBe(href);
  for (const href of [
    undefined,
    "",
    "javascript:alert(1)",
    "data:text/html,x",
    "//example.com",
  ])
    expect(safeTextHref(href)).toBe("");
});

test("rich formatting uses validated commands, replaces mark IDs and follows text edits", () => {
  const original = visualDocument();
  let doc = applyCommand(original, {
    type: "text.range.format",
    id: "a",
    markId: "mark",
    start: 0,
    end: 6,
    style: { fontWeight: 700, href: "https://example.com" },
  });
  expect(doc.blocks.a.design).toMatchObject({
    marks: [{ id: "mark", start: 0, end: 6, fontWeight: 700 }],
  });
  doc = applyCommand(doc, {
    type: "text.range.format",
    id: "a",
    markId: "mark",
    start: 1,
    end: 4,
    style: { color: "#ff0000" },
  });
  expect(
    doc.blocks.a.design?.type === "text" && doc.blocks.a.design.marks,
  ).toEqual([{ id: "mark", start: 1, end: 4, color: "#ff0000" }]);
  doc = applyCommand(doc, {
    type: "block.update",
    id: "a",
    patch: { text: "Sample a extended" },
  });
  expect(doc.blocks.a.design).toMatchObject({ marks: [{ start: 1, end: 4 }] });
  doc = applyCommand(doc, {
    type: "text.mark.remove",
    id: "a",
    markId: "mark",
  });
  expect(doc.blocks.a.design).toMatchObject({ marks: [] });
  expect(original.blocks.a.design).toMatchObject({ marks: [] });
  doc = applyCommand(doc, {
    type: "block.create",
    sectionId: "extra",
    block: { id: "shape", kind: "shape", text: "" },
  });
  for (const command of [
    {
      type: "text.range.format",
      id: "a",
      markId: "mark",
      start: 3,
      end: 2,
      style: {},
    },
    {
      type: "text.range.format",
      id: "a",
      markId: "mark",
      start: 0,
      end: 100,
      style: {},
    },
    {
      type: "text.range.format",
      id: "a",
      markId: "mark",
      start: 0,
      end: 3,
      style: { href: "javascript:alert(1)" },
    },
    {
      type: "text.range.format",
      id: "shape",
      markId: "mark",
      start: 0,
      end: 1,
      style: {},
    },
    { type: "text.mark.remove", id: "shape", markId: "mark" },
  ])
    expect(() => applyCommands(doc, batch([command]))).toThrow();
});

test("editing across the start of a styled range creates valid deterministic noncolliding IDs", () => {
  let doc = applyCommand(visualDocument(), {
    type: "block.update",
    id: "a",
    patch: { text: "0123456789" },
  });
  for (const mark of [
    { markId: "range", start: 5, end: 9 },
    { markId: "range-right", start: 0, end: 1 },
    { markId: "range-right-1", start: 9, end: 10 },
  ])
    doc = applyCommand(doc, {
      type: "text.range.format",
      id: "a",
      ...mark,
      style: { fontWeight: 700 },
    });
  const command = {
    type: "block.update" as const,
    id: "a",
    patch: { text: "012XY789" },
  };
  const edited = applyCommand(doc, command);
  expect(edited.blocks.a.design).toMatchObject({
    marks: [
      { id: "range-right-2", start: 5, end: 7 },
      { id: "range-right", start: 0, end: 1 },
      { id: "range-right-1", start: 7, end: 8 },
    ],
  });
  expect(applyCommand(doc, command)).toEqual(edited);
  const longId = "x".repeat(100);
  const replacement = replaceTextRange(
    "0123456789",
    [{ id: longId, start: 5, end: 9 }],
    3,
    7,
    "XY",
  );
  expect(replacement.marks[0].id.length).toBeLessThanOrEqual(100);
  expect(replacement.marks[0].id).toMatch(/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/);
});
