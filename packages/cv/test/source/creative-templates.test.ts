import { expect, test } from "bun:test";
import { applyCommand } from "@resumi/engine";
import { createResume, makeReactSource, templates } from "../../src";
import { compileReact, renderSourceHtml } from "../../src/source/render";
import { renderTemplateResume } from "../../src/templates/render";
import {
  creativeLayoutNames,
  creativeFamily,
  creativeFamilies,
} from "../../src/templates/types";
import { resumeData } from "../../src/source/starter";
import { templateSource } from "../../../../scripts/template-source";
import generated from "../../src/source/creative-template.generated.json" with { type: "json" };

test("creative layouts preserve editable content, offline artwork and source budgets", () => {
  for (const layout of creativeLayoutNames) {
    const entry = templates.find(
      (candidate) => candidate.id === `react-${layout}`,
    );
    expect(entry?.legacy).toBe(false);
    const document = createResume(`creative-${layout}`, `react-${layout}`);
    const code = document.source!.code;
    expect(code.length).toBeLessThan(180_000);
    expect(code).not.toMatch(/^import\s/m);
    expect(compileReact(code)).toContain("React.createElement");
    expect(code).toContain("data:font/woff2;base64,");
    expect(resumeData(document).layout).toBe(layout);
    const html = renderTemplateResume(document);
    expect(html).toContain(`data-template-layout="${layout}"`);
    expect(html).toContain(document.blocks["identity-0"].text);
    for (const id of [
      "profile",
      "experience",
      "projects",
      "education",
      "skills",
      "languages",
    ]) {
      expect(html).toContain(`data-section-id="${id}"`);
    }
    expect(html).not.toMatch(
      /(?:src|href)=["']https?:[^"']+\.(?:jpg|png|webp|woff)/i,
    );
    expect(renderTemplateResume(document)).toBe(html);
    const changed = applyCommand(document, {
      type: "block.update",
      id: "identity-0",
      patch: { text: "Jordan Avery" },
    });
    const regenerated = makeReactSource(changed);
    expect(compileReact(regenerated)).toContain("Jordan Avery");
    expect(renderTemplateResume(changed)).toContain("Jordan Avery");
    const portable = renderSourceHtml({ format: "react", code: regenerated });
    expect(portable).toContain("Jordan Avery");
    expect(portable).not.toMatch(/<script[^>]+src=/);
    const family = creativeFamily(layout);
    for (const candidate of creativeFamilies) {
      const component = `${candidate[0].toUpperCase()}${candidate.slice(1)}Layouts`;
      if (candidate === family) expect(code).toContain(component);
      else expect(code).not.toContain(component);
    }
  }
});

test("portable source families match their trusted authoring modules", async () => {
  const root = new URL("../../../../", import.meta.url);
  for (const family of creativeFamilies) {
    expect(generated[family]).toBe(await templateSource(root, family));
  }
});
