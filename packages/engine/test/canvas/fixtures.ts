import {
  applyCommands,
  createDocument,
  makeLayer,
  type Command,
  type Document,
} from "../../src";

export const batch = (commands: unknown[]) => ({
  version: 1,
  actor: { kind: "agent", name: "Canvas QA" },
  commands,
});

export function visualDocument(): Document {
  const commands: Command[] = [
    {
      type: "section.create",
      section: { id: "content", title: "Content", blockIds: [] },
    },
    {
      type: "section.create",
      section: { id: "extra", title: "Extra", blockIds: [] },
    },
    ...["a", "b", "c", "d"].map((id) => ({
      type: "block.create" as const,
      sectionId: "content",
      block: { id, kind: "text" as const, text: `Sample ${id}` },
    })),
    {
      type: "canvas.enable",
      layers: Object.fromEntries(
        ["a", "b", "c", "d"].map((id, index) => [
          id,
          makeLayer("text", {
            name: id,
            x: 10 + index * 20,
            y: 20 + index * 30,
          }),
        ]),
      ),
    },
  ];
  return applyCommands(createDocument("document"), batch(commands)).document;
}

export function deepFreeze<T>(value: T): T {
  if (typeof value === "object" && value !== null && !Object.isFrozen(value)) {
    Object.freeze(value);
    Object.values(value).forEach(deepFreeze);
  }
  return value;
}
