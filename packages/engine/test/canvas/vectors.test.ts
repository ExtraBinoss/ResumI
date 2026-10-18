import { expect, test } from "bun:test";
import {
  applyCommands,
  createSession,
  deserializeDocument,
  execute,
  makeLayer,
  serializeDocument,
  undo,
} from "../../src";
import { batch, visualDocument } from "./fixtures";

const vector = {
  path: "M0 0h10v10H0z",
  viewBox: "0 0 20 10",
  parts: [
    { path: "M0 0h10v10H0z", fill: "#ff0000" },
    {
      path: "M10 0h10v10H10z",
      fill: "#00ff00",
      stroke: "#0000ff80",
      strokeWidth: 2,
      opacity: 0.8,
      fillRule: "evenodd" as const,
      matrix: [1, 0, 0, 1, 2, -3] as [
        number,
        number,
        number,
        number,
        number,
        number,
      ],
      linecap: "square" as const,
      linejoin: "bevel" as const,
    },
  ],
  attribution: "Synthetic vector © QA",
};

test("compound vectors preserve colors, transforms, attribution and one-step history", () => {
  const original = visualDocument();
  const command = {
    type: "block.create" as const,
    sectionId: "extra",
    block: {
      id: "logo",
      kind: "shape" as const,
      text: "",
      design: makeLayer("shape", { shape: "custom-icon", vector }),
    },
  };
  const agent = applyCommands(original, batch([command])).document;
  const human = execute(createSession(original), {
    version: 1,
    actor: { kind: "human", name: "Import vector" },
    commands: [command],
  });
  expect(human.document).toEqual(agent);
  expect(deserializeDocument(serializeDocument(agent))).toEqual(agent);
  expect(agent.blocks.logo.design).toMatchObject({ vector });
  const monochrome = applyCommands(
    agent,
    batch([
      {
        type: "layer.update",
        ids: ["logo"],
        patch: {
          vector: { ...vector, colorMode: "monochrome" },
          fill: "#243b70",
        },
      },
    ]),
  ).document;
  expect(monochrome.blocks.logo.design).toMatchObject({
    vector: { ...vector, colorMode: "monochrome" },
    fill: "#243b70",
  });
  const restored = applyCommands(
    monochrome,
    batch([
      {
        type: "layer.update",
        ids: ["logo"],
        patch: { vector: { ...vector, colorMode: "original" } },
      },
    ]),
  ).document;
  expect(restored.blocks.logo.design).toMatchObject({ vector });
  expect(restored.blocks.logo.design).toHaveProperty(
    "vector.colorMode",
    "original",
  );
  expect(undo(human).document).toEqual(original);
});

test("compound vector injection and resource limits fail atomically", () => {
  const original = applyCommands(
    visualDocument(),
    batch([
      {
        type: "block.create",
        sectionId: "extra",
        block: {
          id: "logo",
          kind: "shape",
          text: "",
          design: makeLayer("shape", { vector }),
        },
      },
    ]),
  ).document;
  const before = serializeDocument(original);
  const part = vector.parts[0];
  for (const invalid of [
    { ...vector, parts: [] },
    { ...vector, parts: Array.from({ length: 129 }, () => part) },
    { ...vector, attribution: "x".repeat(12001) },
    ...[
      { ...part, path: "<script>alert(1)</script>" },
      { ...part, fill: "url(https://example.com/payload)" },
      { ...part, stroke: "currentColor;display:none" },
      { ...part, opacity: 1.1 },
      { ...part, strokeWidth: -1 },
      { ...part, matrix: [1, 0, 0, 1, Infinity, 0] },
      { ...part, matrix: [1, 0, 0, 1, 100001, 0] },
      { ...part, onload: "alert(1)" },
      { ...part, fillRule: "unsafe" },
      { ...part, linecap: "unsafe" },
    ].map((entry) => ({ ...vector, parts: [entry] })),
  ]) {
    expect(() =>
      applyCommands(
        original,
        batch([
          { type: "document.update", name: "Must roll back" },
          { type: "layer.update", ids: ["logo"], patch: { vector: invalid } },
        ]),
      ),
    ).toThrow();
    expect(serializeDocument(original)).toBe(before);
  }
});
