import { expect, test } from "bun:test";
import { applyCommand } from "@resumi/engine";
import { createResume, makeReactSource, renderDocumentHtml } from "../../src";
import { compileReact, renderSourceHtml } from "../../src/source/render";
import { enableVisual } from "../../src/design";
import { resumeData } from "../../src/source/starter";
import { escapeScript, sourcePolicy } from "../../src/source/policy";

test("React templates are editable TSX with actual document data and safe data injection", async () => {
  const document = applyCommand(createResume("code"), {
    type: "block.update",
    id: "identity-0",
    patch: { text: '$& <Alex> "Morgan"' },
  });
  const projected = resumeData(enableVisual(document));
  expect(
    projected.sections.find((section) => section.title === "Profile")?.blocks,
  ).toHaveLength(1);
  const source = makeReactSource(document);
  expect(source).toContain(JSON.stringify('$& <Alex> "Morgan"'));
  expect(source).toContain("export default function Resume");
  expect(source).not.toContain("resume-data:start");
  expect(compileReact(source)).toContain("React.createElement");
  expect(createResume("react", "react-studio").source?.format).toBe("react");
  expect(createResume("react-serif", "react-editorial").source?.code).toContain(
    '"serif": true',
  );
  expect(await renderDocumentHtml(document)).toContain("&lt;Alex&gt;");
});

test("portable HTML and React compile offline without evaluating user source", async () => {
  const document = applyCommand(createResume("code"), {
    type: "source.set",
    source: {
      format: "react",
      code: "throw new Error('must not execute'); export default function Resume(){return <h1>Code CV</h1>}",
    },
  });
  const html = await renderDocumentHtml(document);
  expect(html).toContain("must not execute");
  expect(html).toContain('id="resumi-root"');
  expect(html).toContain("Content-Security-Policy");
  expect(html).toContain("connect-src &#39;none&#39;");
  expect(html).not.toMatch(/<script[^>]+src=/);
  const escaped = renderSourceHtml({
    format: "react",
    code: 'export default function Resume(){return <p>{"</script><script>bad</script>"}</p>}',
  });
  expect(escaped.match(/<\/script>/g)).toHaveLength(2);
  const raw = renderSourceHtml(
    { format: "html", code: "<article><h1>HTML CV</h1></article>" },
    "Safe <name>",
  );
  expect(raw).toContain("<h1>HTML CV</h1>");
  expect(raw).toContain("<title>Safe &lt;name&gt;</title>");
  expect(raw).toContain("script-src &#39;none&#39;");
  expect(sourcePolicy(true)).toContain("'unsafe-eval'");
  expect(escapeScript("<\u2028\u2029")).toBe("\\u003c\\u2028\\u2029");
  expect(() =>
    compileReact("export default function Resume( { return <p>"),
  ).toThrow();
});

test("inactive source preserves its code while exporting the visual document", async () => {
  const document = applyCommand(createResume("inactive"), {
    type: "source.set",
    source: {
      format: "react",
      code: "this is deliberately invalid TSX",
      enabled: false,
    },
  });
  const html = await renderDocumentHtml(document);
  expect(html).toContain("Alex Morgan");
  expect(html).not.toContain("deliberately invalid");
  expect(html).not.toContain('id="resumi-root"');
  expect(document.source?.code).toBe("this is deliberately invalid TSX");
});
