import { expect, test } from "bun:test";
import { applyCommand } from "@resumi/engine";
import { createResume, makeReactSource, templates } from "../../src";
import { resumeData } from "../../src/source/starter";
import { compileReact, renderSourceHtml } from "../../src/source/render";
import { renderTemplateResume } from "../../src/templates/render";

const layouts = [
  ["react-classic", "classic"],
  ["react-editorial", "editorial"],
  ["react-studio", "studio"],
  ["react-profile", "profile"],
] as const;

test("the public catalog contains four distinct TSX layouts while legacy canvas IDs remain compatible", () => {
  expect(
    templates
      .filter((template) => !template.legacy)
      .map((template) => template.format),
  ).toEqual(["react", "react", "react", "react"]);
  expect(createResume("canvas-studio", "studio").source).toBeUndefined();
  expect(createResume("canvas-serif", "editorial").style.font).toBe("serif");
  for (const [id, layout] of layouts) {
    const document = createResume(`template-${id}`, id);
    expect(document.source?.format).toBe("react");
    expect(document.source!.code.length).toBeLessThan(180_000);
    expect(compileReact(document.source!.code)).toContain(
      "React.createElement",
    );
    const html = renderTemplateResume(document);
    expect(html).toContain(`data-template-layout="${layout}"`);
    expect(html).toContain('class="resume cv-sheet');
    expect(html).toContain("Alex Morgan");
    expect(html).toContain("Senior Product Designer");
    expect(html).toContain("Selected skills");
    expect(html).not.toMatch(
      /(?:src|href)=["']https?:[^"']+\.(?:jpg|png|webp|woff)/i,
    );
    expect(resumeData(document).layout).toBe(layout);
  }
});

test("Profile has one embedded professional portrait, real SVG contacts and licensed offline typography", () => {
  const document = createResume("portrait", "react-profile");
  const code = document.source!.code;
  const footer = code.indexOf("// Embedded assets stay at the end");
  expect(footer).toBeGreaterThan(
    code.indexOf("export default function Resume"),
  );
  expect(code.indexOf("data:image/jpeg;base64,")).toBeGreaterThan(footer);
  expect(code.indexOf("data:font/woff2;base64,")).toBeGreaterThan(footer);
  expect(code.match(/data:image\/jpeg;base64,/g)).toHaveLength(1);
  const html = renderTemplateResume(document);
  expect(html.match(/<img /g)).toHaveLength(1);
  expect(html).toContain('alt="Portrait of Alex Morgan"');
  expect(html).toContain('src="data:image/jpeg;base64,');
  expect(html.match(/<svg /g)?.length).toBeGreaterThanOrEqual(3);
  expect(html).toContain("SIL OPEN FONT LICENSE");
  expect(html).toContain("Lucide Contributors");
  const portable = renderSourceHtml(document.source!);
  expect(portable).toContain("data:image/jpeg;base64,");
  expect(portable).toContain("font-src data:");
  expect(portable).not.toMatch(/<script[^>]+src=/);
  for (const [id] of layouts.filter(([id]) => id !== "react-profile")) {
    expect(createResume(`no-photo-${id}`, id).source!.code).not.toContain(
      "data:image/jpeg;base64,",
    );
    expect(
      renderTemplateResume(createResume(`no-photo-preview-${id}`, id)),
    ).not.toContain("<img ");
  }
});

test("template regeneration preserves embedded Profile assets and escapes authored text without evaluating source", () => {
  const document = createResume("authored", "react-profile");
  const changed = applyCommand(document, {
    type: "block.update",
    id: "identity-0",
    patch: { text: '</style><script>alert("x")</script>' },
  });
  const source = makeReactSource(changed);
  expect(source).toContain('"layout": "profile"');
  expect(source).toContain("data:image/jpeg;base64,");
  expect(compileReact(source)).toContain("React.createElement");
  const html = renderTemplateResume(changed);
  expect(html).toContain("&lt;/style&gt;&lt;script&gt;");
  expect(html).not.toContain('<script>alert("x")</script>');
  const inactive = applyCommand(changed, {
    type: "source.activate",
    enabled: false,
  });
  expect(resumeData(inactive).layout).toBe("profile");
});
