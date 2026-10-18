import { describe, test, expect } from "bun:test";
import {
  createDocument,
  applyCommand,
  applyCommands,
  type Command,
  type Document,
} from "../../src/index";
const batch = (commands: unknown[]) => ({
  version: 1,
  actor: { kind: "agent", name: "Test agent" },
  commands,
});
const fresh = () =>
  applyCommands(
    createDocument("doc"),
    batch([
      {
        type: "section.create",
        section: { id: "a", title: "Profile", blockIds: [] },
      },
      {
        type: "section.create",
        section: { id: "z", title: "Skills", blockIds: [] },
      },
      {
        type: "block.create",
        sectionId: "a",
        block: { id: "b", kind: "text", text: "First" },
      },
      {
        type: "block.create",
        sectionId: "a",
        block: { id: "c", kind: "bullet", text: "Second" },
      },
    ]),
  ).document;
describe("atomic document operations", () => {
  test("complete section and block CRUD and structural sharing", () => {
    let doc = fresh();
    const original = doc;
    doc = applyCommand(doc, { type: "document.update", name: "Updated" });
    doc = applyCommand(doc, {
      type: "style.update",
      patch: { font: "serif", spacing: 30 },
    });
    doc = applyCommand(doc, {
      type: "section.update",
      id: "a",
      title: "About",
    });
    doc = applyCommand(doc, {
      type: "block.update",
      id: "b",
      patch: { text: "Changed" },
    });
    expect(doc.name).toBe("Updated");
    expect(doc.style.font).toBe("serif");
    expect(doc.sections.a.title).toBe("About");
    expect(doc.blocks.b.text).toBe("Changed");
    expect(doc.blocks.c).toBe(original.blocks.c);
    expect(doc.sections.z).toBe(original.sections.z);
    expect(original.blocks.b.text).toBe("First");
    doc = applyCommand(doc, { type: "block.delete", id: "b" });
    expect(doc.sections.a.blockIds).toEqual(["c"]);
    expect(doc.blocks.b).toBeUndefined();
    doc = applyCommand(doc, { type: "section.delete", id: "a" });
    expect(doc.sectionIds).toEqual(["z"]);
    expect(doc.blocks.c).toBeUndefined();
  });
  test("inserts and reorders without dropping IDs", () => {
    let doc = fresh();
    doc = applyCommand(doc, {
      type: "section.create",
      index: 1,
      section: { id: "m", title: "Middle", blockIds: [] },
    });
    expect(doc.sectionIds).toEqual(["a", "m", "z"]);
    doc = applyCommand(doc, { type: "section.reorder", ids: ["z", "m", "a"] });
    doc = applyCommand(doc, {
      type: "block.create",
      sectionId: "a",
      index: 1,
      block: { id: "d", kind: "meta", text: "Middle" },
    });
    expect(doc.sections.a.blockIds).toEqual(["b", "d", "c"]);
    doc = applyCommand(doc, {
      type: "block.reorder",
      sectionId: "a",
      ids: ["c", "b", "d"],
    });
    expect(doc.sections.a.blockIds).toEqual(["c", "b", "d"]);
  });
  test("agent and human commands have equivalent document semantics", () => {
    const command: Command = {
      type: "block.update",
      id: "b",
      patch: { text: "Same" },
    };
    expect(applyCommand(fresh(), command)).toEqual(
      applyCommands(fresh(), batch([command])).document,
    );
    expect(applyCommands(fresh(), batch([command])).document).toEqual(
      applyCommands(fresh(), batch([command])).document,
    );
  });
  test("failures leave original untouched; errors have stable codes", () => {
    const invalid: unknown[] = [
      { type: "section.delete", id: "unknown" },
      { type: "section.update", id: "unknown", title: "" },
      { type: "block.update", id: "unknown", patch: { text: "x" } },
      { type: "block.delete", id: "unknown" },
      {
        type: "block.create",
        sectionId: "unknown",
        block: { id: "new", kind: "text", text: "" },
      },
      {
        type: "section.create",
        section: { id: "a", title: "Duplicate", blockIds: [] },
      },
      {
        type: "section.create",
        section: { id: "doc", title: "Duplicate", blockIds: [] },
      },
      {
        type: "block.create",
        sectionId: "a",
        block: { id: "b", kind: "text", text: "" },
      },
      {
        type: "section.create",
        index: 9,
        section: { id: "new", title: "", blockIds: [] },
      },
      {
        type: "block.create",
        sectionId: "a",
        index: 9,
        block: { id: "new", kind: "text", text: "" },
      },
      { type: "section.reorder", ids: ["a"] },
      { type: "section.reorder", ids: ["a", "a"] },
      { type: "section.reorder", ids: ["a", "nope"] },
      { type: "block.reorder", sectionId: "a", ids: ["b"] },
      { type: "block.reorder", sectionId: "unknown", ids: [] },
      { type: "style.update", patch: { accent: "javascript:alert(1)" } },
      { type: "execute", code: "evil()" },
      { type: "block.update", id: "b", patch: { id: "new" } },
    ];
    for (const command of invalid) {
      const doc = fresh(),
        before = JSON.stringify(doc);
      expect(() =>
        applyCommands(
          doc,
          batch([
            { type: "document.update", name: "Should not publish" },
            command,
          ]),
        ),
      ).toThrow();
      expect(JSON.stringify(doc)).toBe(before);
    }
    expect(() => applyCommands(fresh(), batch([]))).toThrow();
    expect(() =>
      applyCommands(fresh(), { ...batch([]), version: 2 }),
    ).toThrow();
    expect(() =>
      applyCommands(
        {} as Document,
        batch([{ type: "document.update", name: "Bad" }]),
      ),
    ).toThrow();
    try {
      applyCommands(fresh(), batch([{ type: "block.delete", id: "unknown" }]));
    } catch (e) {
      expect((e as { code: string }).code).toBe("NOT_FOUND");
    }
  });
});
