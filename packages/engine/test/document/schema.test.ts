import { describe, test, expect } from "bun:test";
import { createDocument, validateDocument } from "../../src/document/schema";
const base = () => createDocument("doc");
describe("document schema and invariants", () => {
  test("creates independent valid documents", () => {
    expect(base()).toEqual(base());
    expect(base().style).not.toBe(base().style);
  });
  test("rejects external malformed values", () => {
    for (const input of [
      null,
      [],
      {},
      { ...base(), html: "<script>" },
      { ...base(), id: "__proto__" },
      { ...base(), schemaVersion: 4 },
      { ...base(), name: " " },
      { ...base(), style: { ...base().style, accent: "red;display:none" } },
      { ...base(), style: { ...base().style, fontSize: 30 } },
    ])
      expect(() => validateDocument(input)).toThrow();
  });
  test("rejects missing, duplicate, mismatched and unordered sections", () => {
    for (const input of [
      { ...base(), sectionIds: ["a"] },
      {
        ...base(),
        sectionIds: ["a", "a"],
        sections: { a: { id: "a", title: "", blockIds: [] } },
      },
      { ...base(), sections: { a: { id: "a", title: "", blockIds: [] } } },
      {
        ...base(),
        sectionIds: ["a"],
        sections: { a: { id: "wrong", title: "", blockIds: [] } },
      },
      {
        ...base(),
        sectionIds: ["doc"],
        sections: { doc: { id: "doc", title: "", blockIds: [] } },
      },
    ])
      expect(() => validateDocument(input)).toThrow();
  });
  test("rejects orphan, repeated, mismatched, missing blocks and cross entity duplicate IDs", () => {
    const section = { id: "a", title: "A", blockIds: ["b"] };
    const doc = {
      ...base(),
      sectionIds: ["a"],
      sections: { a: section },
      blocks: { b: { id: "b", kind: "text", text: "hello" } },
    };
    expect(validateDocument(doc).blocks.b.text).toBe("hello");
    for (const input of [
      { ...doc, blocks: {} },
      { ...doc, sectionIds: [], sections: {} },
      { ...doc, blocks: { b: { id: "bad", kind: "text", text: "" } } },
      { ...doc, sections: { a: { ...section, blockIds: ["b", "b"] } } },
      { ...doc, sections: { a: { ...section, blockIds: ["a"] } } },
    ])
      expect(() => validateDocument(input)).toThrow();
  });
});
