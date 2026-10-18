import { expect, test } from "bun:test";
import {
  applyCommand,
  applyCommands,
  canvasForPage,
  createDocument,
  createSession,
  deserializeDocument,
  execute,
  localizedBlock,
  makeLayer,
  redo,
  serializeDocument,
  undo,
  type Document,
  type MaterializeCommand,
} from "../../src";
import { batch, deepFreeze, visualDocument } from "../canvas/fixtures";

function snapshot(): MaterializeCommand {
  return {
    type: "canvas.materialize",
    canvas: {
      width: 794,
      height: 1123,
      background: "#ffffff",
      order: ["captured-name", "captured-role", "captured-body"],
      groups: [
        {
          id: "captured-identity",
          name: "Identity",
          elementIds: ["captured-name", "captured-role"],
          opacity: 1,
          blendMode: "normal",
          collapsed: false,
          locked: false,
          hidden: false,
        },
      ],
      fonts: [],
      pages: [
        {
          id: "captured-page",
          name: "Experience",
          width: 600,
          height: 800,
          background: "#eeeeee",
        },
      ],
    },
    sectionIds: ["captured-content"],
    sections: {
      "captured-content": {
        id: "captured-content",
        title: "",
        blockIds: ["captured-name", "captured-role", "captured-body"],
      },
    },
    blocks: {
      "captured-name": {
        id: "captured-name",
        kind: "heading",
        text: "Synthetic Avery",
        design: makeLayer("text", { x: 40, y: 40, width: 500, height: 50 }),
      },
      "captured-role": {
        id: "captured-role",
        kind: "subtitle",
        text: "Interface designer",
        design: makeLayer("text", { x: 40, y: 100, width: 500, height: 40 }),
      },
      "captured-body": {
        id: "captured-body",
        kind: "text",
        text: "Second page experience",
        design: makeLayer("text", {
          pageId: "captured-page",
          x: 40,
          y: 40,
          width: 450,
          height: 80,
        }),
      },
    },
  };
}

function sourceDocument(format: "html" | "react" = "react"): Document {
  return applyCommands(
    visualDocument(),
    batch([
      { type: "document.update", name: "Synthetic authored source" },
      { type: "style.update", patch: { accent: "#123456", font: "serif" } },
      { type: "locale.add", code: "fr", name: "Français" },
      {
        type: "source.set",
        source: {
          format,
          code:
            format === "html"
              ? "<h1>Synthetic Avery</h1>"
              : "export default function Resume(){throw new Error('Never execute source in the engine')}",
        },
      },
    ]),
  ).document;
}

for (const format of ["html", "react"] as const) {
  test(`materializing ${format} preserves document metadata and the exact inactive source`, () => {
    const document = deepFreeze(sourceDocument(format));
    const before = serializeDocument(document);
    const captured = deepFreeze(snapshot());
    const next = applyCommands(document, batch([captured])).document;
    expect(next.id).toBe(document.id);
    expect(next.name).toBe(document.name);
    expect(next.style).toBe(document.style);
    expect(next.localization).toBe(document.localization);
    expect(next.source).toEqual({ ...document.source!, enabled: false });
    expect(next.canvas).toEqual(captured.canvas);
    expect(next.sections).toEqual(captured.sections);
    expect(next.blocks).toEqual(captured.blocks);
    expect(next.blocks.a).toBeUndefined();
    expect(canvasForPage(next, "captured-page").order).toEqual([
      "captured-body",
    ]);
    expect(deserializeDocument(serializeDocument(next))).toEqual(next);
    expect(serializeDocument(document)).toBe(before);
    expect(captured.blocks["captured-name"].text).toBe("Synthetic Avery");
  });
}

test("materialization works without a native backup and allows normal human text and geometry edits", () => {
  const original = applyCommand(createDocument("new-source"), {
    type: "source.set",
    source: { format: "html", code: "<p>Source content</p>", enabled: true },
  });
  const native = applyCommand(original, snapshot());
  let edited = applyCommands(native, {
    version: 1,
    actor: { kind: "human", name: "Visual editor" },
    commands: [
      {
        type: "block.update",
        id: "captured-name",
        patch: { text: "Explicit human edit" },
      },
      {
        type: "layer.translate",
        ids: ["captured-name", "captured-role"],
        dx: 12,
        dy: 8,
      },
    ],
  }).document;
  expect(edited.blocks["captured-name"].text).toBe("Explicit human edit");
  expect(edited.blocks["captured-name"].design).toMatchObject({ x: 52, y: 48 });
  expect(edited.blocks["captured-body"]).toBe(native.blocks["captured-body"]);
  expect(edited.source).toBe(native.source);
  expect(native.blocks["captured-name"].text).toBe("Synthetic Avery");
  expect(original.canvas).toBeUndefined();
  edited = applyCommands(
    edited,
    batch([
      { type: "locale.add", code: "fr", name: "Français" },
      { type: "locale.activate", code: "fr" },
      {
        type: "block.update",
        id: "captured-name",
        patch: { text: "Modification française" },
      },
    ]),
  ).document;
  expect(localizedBlock(edited, "captured-name").text).toBe(
    "Modification française",
  );
  expect(edited.blocks["captured-name"].text).toBe("Explicit human edit");
  expect(edited.source?.code).toBe(original.source?.code);
});

test("materialization requires active source and never overwrites an existing native document implicitly", () => {
  for (const document of [
    createDocument("empty"),
    visualDocument(),
    applyCommand(sourceDocument(), { type: "source.activate", enabled: false }),
  ]) {
    const before = serializeDocument(document);
    expect(() => applyCommand(document, snapshot())).toThrow(
      "requires active saved source",
    );
    expect(serializeDocument(document)).toBe(before);
  }
  const once = applyCommand(sourceDocument(), snapshot());
  expect(() => applyCommand(once, snapshot())).toThrow(
    "requires active saved source",
  );
});

test("one materialization is one attributed undo step and source can be explicitly reactivated", () => {
  const original = sourceDocument();
  const materialized = execute(createSession(original), batch([snapshot()]));
  expect(materialized.past).toHaveLength(1);
  expect(materialized.past[0].batch.actor.kind).toBe("agent");
  expect(undo(materialized).document).toBe(original);
  expect(redo(undo(materialized)).document).toBe(materialized.document);
  const edited = execute(materialized, {
    version: 1,
    actor: { kind: "human", name: "Text editor" },
    commands: [
      {
        type: "block.update",
        id: "captured-name",
        patch: { text: "Updated name" },
      },
    ],
  });
  expect(undo(edited).document).toBe(materialized.document);
  expect(undo(undo(edited)).document).toBe(original);
  const active = applyCommand(edited.document, {
    type: "source.activate",
    enabled: true,
  });
  expect(active.source).toEqual({ ...original.source!, enabled: true });
  expect(active.blocks).toBe(edited.document.blocks);
});

test("invalid materialized references, ownership and dimensions reject the entire batch", () => {
  const original = deepFreeze(sourceDocument());
  const before = serializeDocument(original);
  const cases: ((command: MaterializeCommand) => unknown)[] = [
    (command) => ({ ...command, id: "cannot-replace-document-identity" }),
    (command) => {
      const { id, kind, text } = command.blocks["captured-name"];
      const plain = { id, kind, text };
      return {
        ...command,
        blocks: { ...command.blocks, "captured-name": plain },
      };
    },
    (command) => {
      command.sectionIds = ["missing"];
      return command;
    },
    (command) => {
      command.sections["captured-content"].id = "wrong-key";
      return command;
    },
    (command) => {
      command.sections["captured-content"].blockIds = [
        "captured-name",
        "captured-name",
      ];
      return command;
    },
    (command) => {
      command.canvas.order.pop();
      return command;
    },
    (command) => {
      command.blocks["captured-role"].id = original.id;
      return command;
    },
    (command) => {
      command.canvas.groups[0].id = original.id;
      return command;
    },
    (command) => {
      command.canvas.groups[0].elementIds = ["captured-name", "missing"];
      return command;
    },
    (command) => {
      command.canvas.groups[0].elementIds = ["captured-name", "captured-body"];
      return command;
    },
    (command) => {
      command.blocks["captured-role"].design.pageId = "missing";
      return command;
    },
    (command) => {
      command.canvas.pages![0].id = original.id;
      return command;
    },
    (command) => {
      command.canvas.width = 99;
      return command;
    },
    (command) => {
      command.canvas.height = 5001;
      return command;
    },
    (command) => {
      command.blocks["captured-name"].design = makeLayer("shape");
      return command;
    },
    (command) => {
      command.blocks["captured-name"].translations = {
        de: { text: "Undeclared language", marks: [] },
      };
      return command;
    },
  ];
  for (const invalid of cases) {
    expect(() =>
      applyCommands(
        original,
        batch([
          { type: "document.update", name: "Must roll back" },
          invalid(snapshot()),
        ]),
      ),
    ).toThrow();
    expect(serializeDocument(original)).toBe(before);
  }
});

test("materialization shares page, block, section and whole-document limits with native editing", () => {
  const original = deepFreeze(sourceDocument());
  const command = snapshot();
  command.canvas.pages = Array.from({ length: 20 }, (_, index) => ({
    id: `extra-${index}`,
    name: "Extra",
    width: 600,
    height: 800,
    background: "#ffffff",
  }));
  expect(() => applyCommand(original, command)).toThrow();
  command.canvas.pages = snapshot().canvas.pages;
  command.canvas.order = Array.from(
    { length: 1001 },
    (_, index) => `layer-${index}`,
  );
  expect(() => applyCommand(original, command)).toThrow();
  command.canvas.order = snapshot().canvas.order;
  command.sectionIds = Array.from(
    { length: 51 },
    (_, index) => `section-${index}`,
  );
  expect(() => applyCommand(original, command)).toThrow();
  command.sectionIds = snapshot().sectionIds;
  const dataUrl = `data:font/woff2;base64,${"A".repeat(1_400_000)}`;
  command.canvas.fonts = Array.from({ length: 9 }, (_, index) => ({
    id: `font-${index}`,
    name: `Font ${index}`,
    dataUrl,
    format: "woff2",
  }));
  expect(() => applyCommand(original, command)).toThrow("12 MB budget");
  expect(original.source?.enabled).not.toBe(false);
  expect(original.blocks.a.text).toBe("Sample a");
});
