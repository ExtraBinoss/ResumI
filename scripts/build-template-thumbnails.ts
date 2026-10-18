import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "@playwright/test";
import { createResume, resumeCss, templates } from "../packages/cv/src/index";
import { renderTemplateResume } from "../packages/cv/src/templates/render";

/** Real browser renders of the trusted TSX templates; never user documents. */
const directory = new URL("../apps/web/src/assets/templates/", import.meta.url);
await mkdir(directory, { recursive: true });
const browser = await chromium.launch();
const manifest: Record<string, { sourceHash: string; imageHash: string }> = {};
try {
  const page = await browser.newPage({
    viewport: { width: 794, height: 1123 },
    deviceScaleFactor: 2,
    reducedMotion: "reduce",
  });
  for (const template of templates.filter((candidate) => !candidate.legacy)) {
    const html = renderTemplateResume(
      createResume(`preview-${template.id}`, template.id),
    );
    await page.setContent(
      `<!doctype html><html><head><meta charset="utf-8"><style>${resumeCss}body{margin:0}.resume{margin:0}</style></head><body>${html}</body></html>`,
    );
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all([...document.images].map((image) => image.decode()));
    });
    const png = await page
      .locator(".resume.cv-sheet")
      .screenshot({ animations: "disabled" });
    const encoded = await page.evaluate(
      async (dataUrl) => {
        const image = await createImageBitmap(
          await (await fetch(dataUrl)).blob(),
        );
        const canvas = document.createElement("canvas");
        canvas.width = 440;
        canvas.height = Math.round((440 * image.height) / image.width);
        const context = canvas.getContext("2d")!;
        context.imageSmoothingQuality = "high";
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        image.close();
        return canvas.toDataURL("image/webp", 0.88).split(",")[1];
      },
      `data:image/png;base64,${png.toString("base64")}`,
    );
    const image = Buffer.from(encoded, "base64");
    await writeFile(new URL(`${template.id}.webp`, directory), image);
    manifest[template.id] = {
      sourceHash: createHash("sha256")
        .update(resumeCss + html)
        .digest("hex"),
      imageHash: createHash("sha256").update(image).digest("hex"),
    };
    process.stdout.write(`${template.id}: ${image.length} bytes\n`);
  }
  await writeFile(
    new URL("manifest.generated.json", directory),
    JSON.stringify(manifest, null, 2) + "\n",
  );
} finally {
  await browser.close();
}
