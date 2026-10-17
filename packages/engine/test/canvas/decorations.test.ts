import { expect, test } from "bun:test";
import {
  applyCommand,
  applyCommands,
  createSession,
  execute,
  undo,
  serializeDocument,
  deserializeDocument,
  makeLayer,
} from "../../src";
import { visualDocument, batch } from "./fixtures";

function imageDocument() {
  return applyCommand(visualDocument(), {
    type: "block.create",
    sectionId: "extra",
    block: {
      id: "photo",
      kind: "image",
      text: "",
      design: makeLayer("image", { src: "data:image/png;base64,AAAA" }),
    },
  });
}

test("image borders and shadows share validated human/agent history and portable JSON", () => {
  const document = imageDocument();
  const command = {
    type: "layer.update" as const,
    ids: ["photo"],
    patch: {
      border: { width: 3, color: "#123456", style: "dashed" as const },
      shadow: { x: -4, y: 8, blur: 18, spread: 2, color: "#00000040" },
    },
  };
  const agent = applyCommands(document, batch([command])).document;
  const human = execute(createSession(document), {
    version: 1,
    actor: { kind: "human", name: "Inspector" },
    commands: [command],
  });
  expect(human.document).toEqual(agent);
  expect(deserializeDocument(serializeDocument(agent))).toEqual(agent);
  expect(undo(human).document).toEqual(document);
  expect(
    applyCommand(agent, {
      type: "layer.update",
      ids: ["photo"],
      patch: { shadow: null },
    }).blocks.photo.design,
  ).toMatchObject({ shadow: null });
  expect(deserializeDocument(serializeDocument(document))).toEqual(document);
});

test("invalid decorations fail atomically, including wrong layer kinds and CSS injection", () => {
  const doc = imageDocument(),
    original = serializeDocument(doc);
  for (const patch of [
    { border: { width: -1, color: "#000000", style: "solid" } },
    { border: { width: 2, color: "red;display:none", style: "solid" } },
    { border: { width: 2, color: "#000000", style: "url(javascript:x)" } },
    { shadow: { x: 0, y: 0, blur: -1, spread: 0, color: "#000000" } },
    { shadow: { x: Infinity, y: 0, blur: 10, spread: 0, color: "#000000" } },
  ])
    expect(() =>
      applyCommands(
        doc,
        batch([
          { type: "document.update", name: "Must roll back" },
          { type: "layer.update", ids: ["photo"], patch },
        ]),
      ),
    ).toThrow();
  expect(() =>
    applyCommands(
      doc,
      batch([
        {
          type: "layer.update",
          ids: ["a"],
          patch: {
            shadow: { x: 0, y: 0, blur: 4, spread: 0, color: "#000000" },
          },
        },
      ]),
    ),
  ).toThrow();
  expect(serializeDocument(doc)).toBe(original);
});
