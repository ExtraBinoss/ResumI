import { expect, test } from "bun:test";
import {
  applyCommand,
  applyCommands,
  createDocument,
  createSession,
  duplicateDocument,
  execute,
  redo,
  serializeDocument,
  deserializeDocument,
  undo,
  validateDocument,
} from "../../src";

test("source is validated opaque data with the same atomic human/agent history", () => {
  const document = createDocument("source-doc");
  const source = {
    format: "react" as const,
    code: "export default function Resume(){throw new Error('Never execute in engine')}",
  };
  const human = applyCommand(document, { type: "source.set", source });
  const session = execute(createSession(document), {
    version: 1,
    actor: { kind: "agent", name: "Code teammate" },
    commands: [{ type: "source.set", source }],
  });
  expect(session.document).toEqual(human);
  expect(undo(session).document).toEqual(document);
  expect(redo(undo(session)).document).toEqual(human);
  expect(deserializeDocument(serializeDocument(human))).toEqual(human);
  expect(
    duplicateDocument(human, "independent", () => "unused").source,
  ).toEqual(source);
  expect(applyCommand(human, { type: "source.clear" })).toEqual(document);
  expect(document).not.toHaveProperty("source");
  expect(
    applyCommand(document, {
      type: "source.set",
      source: { format: "html", code: "" },
    }).source?.code,
  ).toBe("");
});

test("bad source batches fail without publishing changes or executing code", () => {
  const document = createDocument("source-doc");
  for (const source of [
    { format: "javascript", code: "alert(1)" },
    { format: "html", code: "x".repeat(200_001) },
    { format: "react", code: "<p />", unchecked: true },
    { format: "react", code: 123 },
    { format: "html", code: "<h1>CV</h1>", enabled: "true" },
  ]) {
    expect(() => validateDocument({ ...document, source })).toThrow();
    expect(() =>
      applyCommands(document, {
        version: 1,
        actor: { kind: "agent", name: "Code teammate" },
        commands: [
          { type: "document.update", name: "Should roll back" },
          { type: "source.set", source },
        ],
      }),
    ).toThrow();
    expect(document.name).toBe("Untitled resume");
    expect(document).not.toHaveProperty("source");
  }
});

test("source activation preserves source across undo, serialization and missing-source errors", () => {
  const document = createDocument("source-doc");
  const source = { format: "html" as const, code: "<h1>Preserved HTML</h1>" };
  const initial = applyCommand(document, { type: "source.set", source });
  const inactive = execute(createSession(initial), {
    version: 1,
    actor: { kind: "human", name: "Visual view" },
    commands: [{ type: "source.activate", enabled: false }],
  });
  expect(inactive.document.source).toEqual({ ...source, enabled: false });
  expect(initial.source).toEqual(source);
  expect(undo(inactive).document).toEqual(initial);
  expect(redo(undo(inactive)).document).toEqual(inactive.document);
  const reopened = deserializeDocument(serializeDocument(inactive.document));
  expect(reopened.source).toEqual({ ...source, enabled: false });
  const active = applyCommand(reopened, {
    type: "source.activate",
    enabled: true,
  });
  expect(active.source).toEqual({ ...source, enabled: true });
  expect(applyCommand(active, { type: "source.clear" })).toEqual(document);
  try {
    applyCommand(document, { type: "source.activate", enabled: true });
    throw new Error("Expected missing source to fail");
  } catch (error) {
    expect(error).toMatchObject({ code: "NOT_FOUND" });
  }
});
