import { expect, test } from "bun:test";
import {
  applyCommands,
  createDocument,
  makeLayer,
  type LayerPatch,
} from "@resumi/engine";
import { renderHtml } from "../src";
import brandCatalog from "../../assets/data/brands.json";

function vectorParts(
  parts: (typeof brandCatalog.icons)[number]["parts"],
): NonNullable<NonNullable<LayerPatch["vector"]>["parts"]> {
  return parts.map(({ fillRule, ...part }) => ({
    ...part,
    ...(fillRule === "evenodd" || fillRule === "nonzero" ? { fillRule } : {}),
  }));
}

function vectorOf(
  document: ReturnType<typeof createDocument>,
  blockId: string,
) {
  const design = document.blocks[blockId]?.design;
  if (design?.type !== "shape" || !design.vector)
    throw new Error(`Expected vector shape: ${blockId}`);
  return design.vector;
}

test("portable compound SVG keeps individual paints, proportions and escaped credits", () => {
  const document = applyCommands(createDocument("vector-test"), {
    version: 1,
    actor: { kind: "human", name: "Vector export QA" },
    commands: [
      {
        type: "section.create",
        section: { id: "content", title: "", blockIds: [] },
      },
      { type: "canvas.enable", layers: {} },
      {
        type: "block.create",
        sectionId: "content",
        block: {
          id: "vector",
          kind: "shape",
          text: "",
          design: makeLayer("shape", {
            vector: {
              path: "M0 0h10v10H0z",
              viewBox: "0 0 20 10",
              attribution: '<QA> & "Synthetic"',
              parts: [
                { path: "M0 0h10v10H0z", fill: "#ff0000" },
                {
                  path: "M10 0h10v10H10z",
                  fill: "transparent",
                  stroke: "#00ff00",
                  strokeWidth: 2,
                  opacity: 0.7,
                  fillRule: "evenodd",
                  matrix: [1, 0, 0, 1, 2, 3],
                  linecap: "square",
                  linejoin: "bevel",
                },
              ],
            },
          }),
        },
      },
    ],
  }).document;
  const html = renderHtml(document);
  expect(html).toContain('preserveAspectRatio="xMidYMid meet"');
  expect(html).toContain('fill="#ff0000" stroke="none"');
  expect(html).toContain(
    'fill="transparent" stroke="#00ff00" stroke-width="2" opacity="0.7" fill-rule="evenodd" transform="matrix(1 0 0 1 2 3)" stroke-linecap="square" stroke-linejoin="bevel"',
  );
  expect(html).toContain(
    "<metadata>&lt;QA&gt; &amp; &quot;Synthetic&quot;</metadata>",
  );
  expect(html).not.toContain("<QA>");
  expect(html).not.toContain("https://");

  const originalParts = vectorOf(document, "vector").parts;
  const monochrome = applyCommands(document, {
    version: 1,
    actor: { kind: "human", name: "Monochrome vector" },
    commands: [
      {
        type: "layer.update",
        ids: ["vector"],
        patch: {
          fill: "#123456",
          vector: {
            ...vectorOf(document, "vector"),
            colorMode: "monochrome",
          },
        },
      },
    ],
  }).document;
  const monochromeHtml = renderHtml(monochrome);
  expect(monochromeHtml).toContain('fill="#123456" stroke="none"');
  expect(monochromeHtml).toContain('fill="transparent" stroke="#123456"');
  expect(vectorOf(monochrome, "vector").parts).toEqual(originalParts);

  const restored = applyCommands(monochrome, {
    version: 1,
    actor: { kind: "human", name: "Restore original colors" },
    commands: [
      {
        type: "layer.update",
        ids: ["vector"],
        patch: {
          vector: {
            ...vectorOf(monochrome, "vector"),
            colorMode: "original",
          },
        },
      },
    ],
  }).document;
  expect(vectorOf(restored, "vector").parts).toEqual(originalParts);
  expect(renderHtml(restored)).toContain('fill="#ff0000" stroke="none"');
  expect(renderHtml(restored)).toContain('fill="transparent" stroke="#00ff00"');
});

test("LinkedIn remains readable in monochrome while its original white glyph paint is retained", () => {
  const linkedin = brandCatalog.icons.find(
    (asset) => asset.id === "brand-linkedin",
  )!;
  const vector = {
    path: linkedin.path,
    viewBox: linkedin.viewBox,
    parts: vectorParts(linkedin.parts),
    attribution: `MIT · ${linkedin.source}`,
    colorMode: "monochrome" as const,
  };
  const document = applyCommands(createDocument("linkedin-test"), {
    version: 1,
    actor: { kind: "human", name: "LinkedIn brand" },
    commands: [
      {
        type: "section.create",
        section: { id: "content", title: "", blockIds: [] },
      },
      { type: "canvas.enable", layers: {} },
      {
        type: "block.create",
        sectionId: "content",
        block: {
          id: "linkedin",
          kind: "shape",
          text: "",
          design: makeLayer("shape", {
            shape: "custom-icon",
            fill: "#2867b2",
            vector,
          }),
        },
      },
    ],
  }).document;
  const html = renderHtml(document);
  expect(html).toContain('fill="#2867b2" stroke="none"');
  expect(html).toContain('fill="#ffffff" stroke="none"');
  expect(html).toContain(linkedin.source);
  expect(vectorOf(document, "linkedin").parts).toEqual(
    vectorParts(linkedin.parts),
  );
});

test("multicolor brands render with one monochrome paint and recover their original paints", () => {
  const microsoft = brandCatalog.icons.find(
    (asset) => asset.id === "brand-microsoft",
  )!;
  const originalParts = vectorParts(microsoft.parts);
  const makeMicrosoftDocument = (colorMode: "original" | "monochrome") =>
    applyCommands(createDocument(`microsoft-${colorMode}`), {
      version: 1,
      actor: { kind: "human", name: "Microsoft brand" },
      commands: [
        {
          type: "section.create",
          section: { id: "content", title: "", blockIds: [] },
        },
        { type: "canvas.enable", layers: {} },
        {
          type: "block.create",
          sectionId: "content",
          block: {
            id: "microsoft",
            kind: "shape",
            text: "",
            design: makeLayer("shape", {
              fill: "#222222",
              vector: {
                path: microsoft.path,
                viewBox: microsoft.viewBox,
                parts: vectorParts(microsoft.parts),
                colorMode,
              },
            }),
          },
        },
      ],
    }).document;

  const monochrome = makeMicrosoftDocument("monochrome");
  expect(
    renderHtml(monochrome).match(/<path[^>]*fill="#222222"/g),
  ).toHaveLength(4);
  expect(vectorOf(monochrome, "microsoft").parts).toEqual(originalParts);
  const originalHtml = renderHtml(makeMicrosoftDocument("original"));
  for (const part of originalParts)
    expect(originalHtml).toContain(`fill="${part.fill}"`);
});
