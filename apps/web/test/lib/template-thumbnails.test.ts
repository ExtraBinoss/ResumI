import { expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { createResume, resumeCss, templates } from "@resumi/cv";
import { renderTemplateResume } from "@resumi/cv/templates";
import manifest from "../../src/assets/templates/manifest.generated.json" with { type: "json" };

test("every trusted template has a browser-rendered thumbnail matching its current TSX, content and assets", async () => {
  const catalog = templates.filter((template) => !template.legacy);
  expect(Object.keys(manifest)).toEqual(catalog.map((template) => template.id));
  for (const template of catalog) {
    const entry = manifest[template.id as keyof typeof manifest];
    const html = renderTemplateResume(
      createResume(`preview-${template.id}`, template.id),
    );
    expect(entry.sourceHash).toBe(
      createHash("sha256")
        .update(resumeCss + html)
        .digest("hex"),
    );
    const image = await readFile(
      new URL(
        `../../src/assets/templates/${template.id}.webp`,
        import.meta.url,
      ),
    );
    expect(image.subarray(0, 4).toString()).toBe("RIFF");
    expect(image.subarray(8, 12).toString()).toBe("WEBP");
    expect(entry.imageHash).toBe(
      createHash("sha256").update(image).digest("hex"),
    );
  }
});
