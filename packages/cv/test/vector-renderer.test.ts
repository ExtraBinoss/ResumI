import { expect, test } from "bun:test";
import { applyCommands, createDocument, makeLayer } from "@resumi/engine";
import { renderHtml } from "../src";

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
});
