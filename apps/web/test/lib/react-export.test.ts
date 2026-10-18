import { expect, test } from "bun:test";
import { applyCommand } from "@resumi/engine";
import { createResume, enableVisual } from "@resumi/cv";
import { compileReact } from "@resumi/cv/source-render";
import { exportReactCanvas } from "../../src/lib/react-export";

test("TSX export captures edited canvas geometry, multiple pages and content instead of saved source", () => {
  let doc = enableVisual(createResume("tsx-canvas", "studio"));
  const heading = Object.values(doc.blocks).find(
    (block) => block.kind === "heading",
  )!;
  doc = applyCommand(doc, {
    type: "block.update",
    id: heading.id,
    patch: { text: "Current canvas edit <safe>" },
  });
  doc = applyCommand(doc, {
    type: "layer.update",
    ids: [heading.id],
    patch: { x: 123, color: "#aabbcc", rotation: 12 },
  });
  doc = applyCommand(doc, {
    type: "page.create",
    page: {
      id: "second-page",
      name: "Second",
      width: 420,
      height: 600,
      background: "#ffeedd",
    },
  });
  doc = applyCommand(doc, {
    type: "layer.moveToPage",
    ids: [heading.id],
    pageId: "second-page",
  });
  doc = applyCommand(doc, {
    type: "source.set",
    source: {
      format: "react",
      code: "export default function Original(){return <p>STALE SOURCE</p>}",
      enabled: false,
    },
  });
  const source = exportReactCanvas(doc);
  const markup = JSON.parse(
    source.match(/^const canvas = (.*);$/m)![1],
  ) as string;
  expect(markup).toContain("Current canvas edit &lt;safe&gt;");
  expect(markup).toContain('data-page-id="second-page"');
  expect(markup).toContain("width:420px;height:600px;background:#ffeedd");
  expect(markup).toContain("left:123px");
  expect(markup).toContain("rotate(12deg)");
  expect(markup).toContain("#aabbcc");
  expect(source).not.toContain("STALE SOURCE");
  expect(source).not.toContain("@resumi/");
  expect(compileReact(source)).toContain("Resume");
});

test("active source cannot be silently exported as an approximate canvas", () => {
  const document = createResume("active-source", "react-studio");
  expect(() => exportReactCanvas(document)).toThrow("Prepare the resume");
});
