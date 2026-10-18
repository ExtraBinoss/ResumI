import { test, expect } from "bun:test";
import {
  createDocument,
  serializeDocument,
  deserializeDocument,
  migrateDocument,
  duplicateDocument,
  applyCommands,
  MAX_DOCUMENT_FILE_BYTES,
} from "../../src/index";
test("round trip and v0 migration", () => {
  const doc = createDocument("doc");
  expect(deserializeDocument(serializeDocument(doc))).toEqual(doc);
  const { name, ...rest } = doc;
  expect(migrateDocument({ ...rest, schemaVersion: 0, title: name })).toEqual(
    doc,
  );
  for (const input of [null, [], {}, "x", { schemaVersion: 2 }])
    expect(() => migrateDocument(input)).toThrow();
  for (const input of ["{", "x".repeat(MAX_DOCUMENT_FILE_BYTES + 1)])
    expect(() => deserializeDocument(input)).toThrow();
});
test("duplication allocates independent stable identifiers and validates ID collisions", () => {
  const doc = applyCommands(createDocument("doc"), {
    version: 1,
    actor: { kind: "human", name: "Test" },
    commands: [
      {
        type: "section.create",
        section: { id: "s", title: "Section", blockIds: [] },
      },
      {
        type: "block.create",
        sectionId: "s",
        block: { id: "b", kind: "text", text: "Body" },
      },
    ],
  }).document;
  let counter = 0;
  const copy = duplicateDocument(doc, "copy", () => `new-${counter++}`);
  expect(copy.name).toEndWith("(copy)");
  expect(copy.sectionIds).toEqual(["new-0"]);
  expect(copy.blocks["new-1"].text).toBe("Body");
  copy.blocks["new-1"].text = "Independent";
  expect(doc.blocks.b.text).toBe("Body");
  expect(() => duplicateDocument(doc, "copy", () => "collision")).toThrow();
});
