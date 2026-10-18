import { expect, test } from "bun:test";
import { applyCommand } from "@resumi/engine";
import { createResume, makeReactSource } from "../../src";
import { resumeData } from "../../src/source/starter";
import { renderTemplateResume } from "../../src/templates/render";
import credits from "../../assets/photos.json" with { type: "json" };

test("photographic templates embed credited images once and retain them across content edits", () => {
  for (const layout of ["forma", "panorama", "polaroid"] as const) {
    const document = createResume(`photo-${layout}`, `react-${layout}`);
    const data = resumeData(document);
    const code = document.source!.code;
    const footer = code.indexOf("// Embedded assets stay at the end");
    expect(data.artwork).toMatch(/^data:image\/webp;base64,/);
    expect(code.indexOf(data.artwork!)).toBeGreaterThan(footer);
    expect(code.split(data.artwork!)).toHaveLength(2);
    expect(data.license).toContain("https://unsplash.com/license");
    expect(renderTemplateResume(document)).toContain(`src="${data.artwork}"`);
    const changed = applyCommand(document, {
      type: "block.update",
      id: "identity-0",
      patch: { text: "Jordan Avery" },
    });
    const regenerated = makeReactSource(changed);
    expect(regenerated).toContain(data.artwork!);
    expect(regenerated).toContain("Jordan Avery");
    if (layout === "polaroid") {
      expect(data.portrait).toMatch(/^data:image\/webp;base64,/);
      expect(regenerated).toContain(data.portrait!);
    }
  }
  expect(credits.map((credit) => credit.author)).toEqual([
    "Todd Trapani",
    "Lauren Mancke",
  ]);
});
