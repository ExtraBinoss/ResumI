import { expect, test, type Page } from "@playwright/test";
import { mkdir, readFile } from "node:fs/promises";
import { createResume, enableVisual } from "@resumi/cv";
import { templates } from "@resumi/cv/catalog";
import { renderTemplateHtml } from "@resumi/cv/templates";
import { expectMaterializedGraphics } from "./helpers/materialization-reference";
import {
  applyCommand,
  applyCommands,
  createDocument,
  documentPages,
  makeLayer,
  validateDocument,
  type Document,
} from "@resumi/engine";
import { renderHtml } from "@resumi/cv/renderer";
import type { Project } from "../src/lib/projects";

const publicTemplates = templates.filter((template) => !template.legacy);
const originalName = "Robin Synthetic";
const editedName = "Robin Human Edit";
const portfolioUrl = "https://example.com/work";
// Public repository demo portrait only; never read a user's document or photo.
const portrait = (
  await readFile("packages/cv/assets/alex-morgan-portrait.jpg")
).toString("base64");
const brand =
  '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="60" viewBox="0 0 20 30" aria-label="Figma brand"><path fill="#f24e1e" d="M5 0h5v10H5a5 5 0 0 1 0-10Z"/><path fill="#ff7262" d="M10 0h5a5 5 0 0 1 0 10h-5Z"/><path fill="#a259ff" d="M5 10h5v10H5a5 5 0 0 1 0-10Z"/><path fill="#1abcfe" d="M15 10a5 5 0 1 1 0 10 5 5 0 0 1 0-10Z"/><path fill="#0acf83" d="M5 20h5v5a5 5 0 1 1-5-5Z"/></svg>';
const fixtureCss = `body{margin:0}.resume{box-sizing:border-box;width:794px;height:1123px;padding:48px;background:#ffffff;color:#1d2939;font:18px/1.5 Arial,sans-serif}.resume h1{font-size:36px;line-height:1.2;margin:0 0 18px;color:#1248a1}.resume p{margin:0 0 22px}.resume section{margin-bottom:28px}.resume .assets{display:flex;gap:28px;align-items:center}.resume img{width:100px;height:100px;object-fit:cover;border-radius:12px}`;

function fixtureCode(format: "html" | "react", png: string) {
  const markup = `<article class="resume"><section data-group="Identity"><h1>${originalName}</h1><p>Careful <strong>bold work</strong> with <a href="${portfolioUrl}" style="color:#c026d3;text-decoration:underline">linked proof</a>.</p><div class="assets"><img src="${png}" alt="Synthetic portrait"/>${brand}</div></section><section data-group="Selected project"><h2>Selected project</h2><p>Built a dependable public demo.</p></section></article>`;
  if (format === "html")
    return `<style>${fixtureCss}</style>${markup}<script>parent.document.body.dataset.materializationEscaped='yes'</script>`;
  // JSX with real inline elements, rather than a screenshot or an embedded HTML frame.
  const jsx = markup
    .replaceAll('class="', 'className="')
    .replace(
      'style="color:#c026d3;text-decoration:underline"',
      'style={{color:"#c026d3",textDecoration:"underline"}}',
    );
  return `export default function Resume(){try{parent.document.body.dataset.materializationEscaped="yes"}catch{}return <><style>{${JSON.stringify(fixtureCss)}}</style>${jsx}</>}`;
}

async function portraitPng(page: Page) {
  return page.evaluate(async (data) => {
    const image = new Image();
    image.src = `data:image/jpeg;base64,${data}`;
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 128;
    canvas.getContext("2d")!.drawImage(image, 0, 0, 128, 128);
    return canvas.toDataURL("image/png");
  }, portrait);
}

async function storedProject(
  page: Page,
  id = new URL(page.url()).pathname.split("/").at(-1)!,
) {
  return page.evaluate(
    (id) =>
      new Promise<Project>((resolve, reject) => {
        const request = indexedDB.open("resumi-projects");
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const db = request.result;
          const get = db
            .transaction("projects")
            .objectStore("projects")
            .get(id);
          get.onerror = () => {
            db.close();
            reject(get.error);
          };
          get.onsuccess = () => {
            db.close();
            resolve(get.result as Project);
          };
        };
      }),
    id,
  );
}

async function seedProject(page: Page, fixture: Document) {
  const record: Project = {
    id: fixture.id,
    document: fixture,
    revision: 7,
    createdAt: "2026-10-01T12:00:00.000Z",
    updatedAt: "2026-10-01T12:00:00.000Z",
  };
  await page.evaluate(
    (record) =>
      new Promise<void>((resolve, reject) => {
        const request = indexedDB.open("resumi-projects", 2);
        request.onupgradeneeded = () => {
          const store = request.result.createObjectStore("projects", {
            keyPath: "id",
          });
          store.createIndex("by-updated", "updatedAt");
        };
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const db = request.result,
            tx = db.transaction("projects", "readwrite");
          tx.objectStore("projects").put(record);
          tx.oncomplete = () => {
            db.close();
            resolve();
          };
          tx.onerror = () => {
            db.close();
            reject(tx.error);
          };
        };
      }),
    record,
  );
  return record;
}

async function exportedText(page: Page, label: string) {
  await page.getByRole("button", { name: "Export", exact: true }).click();
  const pending = page.waitForEvent("download");
  await page.getByRole("menuitem", { name: label, exact: true }).click();
  const download = await pending;
  return {
    name: download.suggestedFilename(),
    text: await readFile((await download.path())!, "utf8"),
  };
}

async function nativeTools(page: Page) {
  for (const name of [
    "Select",
    "Text tool",
    "Add image",
    "Shapes",
    "Visual",
    "Text",
  ]) {
    await expect(page.getByRole("button", { name, exact: true })).toBeVisible();
  }
  await expect(
    page.getByRole("complementary", { name: "Layers panel", exact: true }),
  ).toBeVisible();
  await expect(page.locator("iframe")).toHaveCount(0);
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: /^(Source|Open source|Edit source)$/ }),
  ).toHaveCount(0);
}

for (const format of ["html", "react"] as const) {
  test(`visual materialization of custom ${format} keeps rich native layers editable, saved and exportable`, async ({
    page,
    context,
  }, testInfo) => {
    await page.goto("/projects");
    const code = fixtureCode(format, await portraitPng(page));
    const fixture = applyCommand(createResume(`custom-${format}`), {
      type: "source.set",
      source: { format, code, enabled: true },
    });
    await page.locator('input[type="file"]').setInputFiles({
      name: `custom-${format}.json`,
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(fixture)),
    });
    await expect(page).toHaveURL(/\/editor\/[^/?#]+$/);
    const canvas = page.getByRole("article", {
      name: "Resume canvas",
      exact: true,
    });
    await expect(
      canvas.getByRole("heading", { name: originalName, exact: true }),
    ).toBeVisible();
    await nativeTools(page);
    expect(
      await page.locator("body").getAttribute("data-materialization-escaped"),
    ).toBeNull();
    await expect(canvas.locator("[data-layer-id]")).not.toHaveCount(0);
    const before = validateDocument((await storedProject(page)).document);
    expect(before.source).toEqual({ format, code, enabled: false });
    expect(before.canvas?.width).toBe(794);
    expect(before.canvas?.height).toBe(1123);
    const blocks = Object.values(before.blocks);
    const paragraph = blocks.find(
      (block) => block.text === "Careful bold work with linked proof.",
    )!;
    expect(paragraph?.design?.type).toBe("text");
    if (paragraph.design?.type !== "text")
      throw new Error("Expected native rich text");
    expect(
      paragraph.design.marks.some(
        (mark) =>
          mark.fontWeight === 700 &&
          paragraph.text.slice(mark.start, mark.end) === "bold work",
      ),
    ).toBe(true);
    expect(
      paragraph.design.marks.some(
        (mark) =>
          mark.href === portfolioUrl &&
          mark.color === "#c026d3" &&
          mark.underline,
      ),
    ).toBe(true);
    await expect(
      canvas.getByRole("link", { name: "linked proof", exact: true }),
    ).toHaveAttribute("href", portfolioUrl);
    await expect(
      canvas.getByRole("link", { name: "linked proof", exact: true }),
    ).toHaveCSS("color", "rgb(192, 38, 211)");
    const photo = blocks.find(
      (block) =>
        block.design?.type === "image" &&
        block.design.alt === "Synthetic portrait",
    );
    expect(
      photo?.design?.type === "image" &&
        photo.design.src.startsWith("data:image/png;base64,"),
    ).toBe(true);
    const bitmap = canvas.getByRole("img", {
      name: "Synthetic portrait",
      exact: true,
    });
    await expect(bitmap).toBeVisible();
    expect(
      await bitmap.evaluate(async (image: HTMLImageElement) => {
        await image.decode();
        return image.naturalWidth;
      }),
    ).toBe(128);
    const brandLayer = blocks.find(
      (block) => block.design?.name === "Figma brand",
    );
    expect(brandLayer?.design?.type).toBe("shape");
    if (brandLayer?.design?.type !== "shape")
      throw new Error("Expected editable brand vector");
    expect(brandLayer.design.vector?.parts?.map((part) => part.fill)).toEqual(
      expect.arrayContaining(["#f24e1e", "#a259ff", "#0acf83"]),
    );
    expect(
      before.canvas?.groups.some(
        (group) =>
          group.name === "Identity" && group.elementIds.includes(paragraph.id),
      ),
    ).toBe(true);
    await expect(page.locator("[data-layer-group]")).not.toHaveCount(0);

    const headingLayer = canvas.getByRole("button", {
      name: `Edit heading: ${originalName}`,
      exact: true,
    });
    await headingLayer.dblclick();
    const inline = page.getByRole("textbox", {
      name: "Edit text on canvas",
      exact: true,
    });
    await inline.fill(editedName);
    await inline.press("Control+Enter");
    await expect(
      canvas.getByRole("heading", { name: editedName, exact: true }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Text", exact: true }).click();
    const workspace = page.getByRole("article", {
      name: "Text workspace",
      exact: true,
    });
    await expect(
      workspace.getByRole("textbox").filter({ hasText: editedName }),
    ).toHaveCount(1);
    await expect(page.locator("iframe")).toHaveCount(0);
    await page.getByRole("button", { name: "Visual", exact: true }).click();
    await expect(
      page.getByRole("status", { name: "Save status", exact: true }),
    ).toHaveText("Saved");
    await page.reload();
    await expect(
      canvas.getByRole("heading", { name: editedName, exact: true }),
    ).toBeVisible();
    await nativeTools(page);
    const restored = await storedProject(page);
    expect(restored.document.source).toEqual({ format, code, enabled: false });
    expect(
      Object.values(restored.document.blocks).some(
        (block) => block.text === editedName,
      ),
    ).toBe(true);
    expect(restored.revision).toBeGreaterThan(0);
    await mkdir("artifacts/visual", { recursive: true });
    await page.screenshot({
      path: `artifacts/visual/materialization-${format}.png`,
    });

    const json = validateDocument(
      JSON.parse((await exportedText(page, "JSON document")).text),
    );
    expect(json).toEqual(restored.document);
    const html = (await exportedText(page, "Portable HTML")).text;
    expect(html).toContain(editedName);
    expect(html).toContain("design-layer");
    expect(html).not.toContain(originalName);
    expect(html).not.toContain("<iframe");
    const tsx = await exportedText(page, "React / TSX");
    expect(tsx.name).toMatch(/\.tsx$/);
    const markup = JSON.parse(
      tsx.text.match(/^const canvas = (.*);$/m)![1],
    ) as string;
    expect(markup).toContain(editedName);
    expect(markup).toContain("design-layer");
    expect(markup).not.toContain(originalName);
    const offline = await context.newPage();
    await offline.route("**/*", (route) => route.abort());
    await offline.setContent(html);
    await expect(
      offline.getByRole("heading", { name: editedName, exact: true }),
    ).toBeVisible();
    await expect(
      offline.getByRole("link", { name: "linked proof", exact: true }),
    ).toHaveAttribute("href", portfolioUrl);
    await expect(offline.locator("iframe")).toHaveCount(0);
    await offline.close();
    if (format === "html") {
      const pending = page.waitForEvent("popup");
      await page
        .getByRole("button", { name: "Export PDF", exact: true })
        .click();
      const popup = await pending;
      await expect(popup.locator("html")).toHaveAttribute(
        "data-pdf-ready",
        "true",
      );
      const bytes = await popup.pdf({
        path: testInfo.outputPath("materialized-native.pdf"),
        preferCSSPageSize: true,
        printBackground: true,
      });
      const { inspectPdfText } = await import("@resumi/cv/pdf-text");
      const pdf = await inspectPdfText(new Uint8Array(bytes));
      expect(pdf.pageCount).toBe(1);
      expect(pdf.text).toContain(editedName);
      expect(pdf.pages[0]!.links).toContain(portfolioUrl);
      await popup.close();
    }
    await expect(page.getByRole("alert")).toHaveCount(0);
  });
}

for (const [format, code] of [
  ["react", "export default function Resume( { return <p>"],
  [
    "html",
    '<article style="width:794px;height:1123px"><svg width="40" height="40"><rect width="40" height="40" fill="#2563eb"/></svg></article>',
  ],
] as const) {
  test(`failed ${format} materialization preserves the exact stored source, canvas and revision`, async ({
    page,
  }) => {
    await page.goto("/");
    const document = applyCommand(
      enableVisual(createResume(`failure-${format}`)),
      { type: "source.set", source: { format, code, enabled: true } },
    );
    const original = await seedProject(page, document);
    await page.goto(`/editor/${document.id}`);
    await expect(page.getByRole("alert")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Copy error details", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("article", { name: "Resume canvas", exact: true }),
    ).toHaveCount(0);
    await expect(page.locator("iframe")).toHaveCount(0);
    expect(await storedProject(page, document.id)).toEqual(original);
    await page.reload();
    await expect(page.getByRole("alert")).toBeVisible();
    expect(await storedProject(page, document.id)).toEqual(original);
  });
}

for (const template of publicTemplates) {
  test(`catalogue ${template.id} opens as real editable canvas layers`, async ({
    page,
  }) => {
    await page.goto(`/editor?template=${template.id}`);
    const canvas = page.getByRole("article", {
      name: "Resume canvas",
      exact: true,
    });
    await expect(
      canvas.getByRole("heading", {
        name: createResume(`identity-${template.id}`, template.id).blocks[
          "identity-0"
        ].text,
        exact: true,
      }),
    ).toBeVisible();
    await expect(page).toHaveURL(/\/editor\/[^/?#]+$/);
    await nativeTools(page);
    const saved = validateDocument((await storedProject(page)).document);
    expect(saved.source?.enabled).toBe(false);
    expect(saved.source?.format).toBe("react");
    const blocks = Object.values(saved.blocks);
    if (["maison", "linen", "polaroid"].includes(template.layout)) {
      const saturation = template.layout === "polaroid" ? 0.65 : 0;
      expect(
        blocks.some(
          (block) =>
            block.design?.type === "image" &&
            block.design.effects?.saturation === saturation,
        ),
      ).toBe(true);
    }
    expect(
      blocks.filter((block) => block.design?.type === "text").length,
    ).toBeGreaterThan(8);
    expect(saved.canvas?.order).toHaveLength(blocks.length);
    expect(saved.canvas?.groups.length).toBeGreaterThan(0);
    for (const block of blocks) {
      expect(block.design).toBeDefined();
      expect(block.design!.width).toBeGreaterThan(0);
      expect(block.design!.height).toBeGreaterThan(0);
      await expect(canvas.locator(`[data-layer-id="${block.id}"]`)).toHaveCount(
        1,
      );
    }
    await expectMaterializedGraphics(
      page,
      canvas,
      blocks,
      renderTemplateHtml(createResume(`expected-${template.id}`, template.id)),
    );
    await expect(page.getByRole("alert")).toHaveCount(0);
    await canvas.screenshot({
      path: `artifacts/visual/native-${template.layout}.png`,
    });
  });
}

test("native two-page HTML round trip", async ({ page, context }) => {
  const native = applyCommands(
    createDocument("two-page-source", "Synthetic two-page source"),
    {
      version: 1,
      actor: { kind: "agent", name: "Synthetic page fixture" },
      commands: [
        {
          type: "section.create",
          section: { id: "content", title: "Content", blockIds: [] },
        },
        { type: "canvas.enable", layers: {} },
        {
          type: "page.update",
          id: "page-1",
          patch: { width: 500, height: 700 },
        },
        {
          type: "page.create",
          page: {
            id: "second-source-page",
            name: "Page 2",
            width: 600,
            height: 800,
            background: "#ffffff",
          },
        },
        {
          type: "block.create",
          sectionId: "content",
          block: {
            id: "first-marker",
            kind: "heading",
            text: "PAGE ONE IMPORTED",
            design: makeLayer("text", {
              x: 48,
              y: 48,
              width: 400,
              height: 45,
              fontSize: 24,
            }),
          },
        },
        {
          type: "block.create",
          sectionId: "content",
          block: {
            id: "second-marker",
            kind: "heading",
            text: "PAGE TWO IMPORTED",
            design: makeLayer("text", {
              pageId: "second-source-page",
              x: 48,
              y: 48,
              width: 450,
              height: 45,
              fontSize: 24,
            }),
          },
        },
      ],
    },
  ).document;
  const code = renderHtml(native);
  expect(code.match(/data-page-id=/g)).toHaveLength(2);
  const source = applyCommand(native, {
    type: "source.set",
    source: { format: "html", code, enabled: true },
  });
  await page.goto("/");
  await seedProject(page, source);
  await page.goto(`/editor/${source.id}`);
  const canvas = page.getByRole("article", {
    name: "Resume canvas",
    exact: true,
  });
  await expect(
    page.getByRole("tab", { name: "Page 1", exact: true }),
  ).toBeVisible();
  const second = page.getByRole("tab", { name: "Page 2", exact: true });
  await expect(second).toBeVisible();
  await expect(
    canvas.getByRole("heading", { name: "PAGE ONE IMPORTED", exact: true }),
  ).toBeVisible();
  await expect(canvas).not.toContainText("PAGE TWO IMPORTED");
  const prepared = validateDocument((await storedProject(page)).document);
  expect(
    documentPages(prepared).map(({ width, height }) => ({ width, height })),
  ).toEqual([
    { width: 500, height: 700 },
    { width: 600, height: 800 },
  ]);
  expect(prepared.source).toEqual({ format: "html", code, enabled: false });
  expect(
    await page.evaluate(
      () => performance.getEntriesByName("resumi:materialize").length,
    ),
  ).toBe(1);
  await second.click();
  await expect(
    canvas.getByRole("heading", { name: "PAGE TWO IMPORTED", exact: true }),
  ).toBeVisible();
  await expect(canvas).not.toContainText("PAGE ONE IMPORTED");
  await canvas
    .getByRole("button", {
      name: "Edit heading: PAGE TWO IMPORTED",
      exact: true,
    })
    .dblclick();
  const input = page.getByRole("textbox", {
    name: "Edit text on canvas",
    exact: true,
  });
  await input.fill("PAGE TWO HUMAN EDIT");
  await input.press("Control+Enter");
  await expect(
    page.getByRole("status", { name: "Save status", exact: true }),
  ).toHaveText("Saved");
  const html = (await exportedText(page, "Portable HTML")).text;
  expect(html.match(/data-page-id=/g)).toHaveLength(2);
  expect(html).not.toContain("PAGE TWO IMPORTED");
  const offline = await context.newPage();
  await offline.route("**/*", (route) => route.abort());
  await offline.setContent(html);
  await expect(offline.locator("article[data-page-id]")).toHaveCount(2);
  await expect(
    offline.getByRole("heading", { name: "PAGE ONE IMPORTED", exact: true }),
  ).toBeVisible();
  await expect(
    offline.getByRole("heading", { name: "PAGE TWO HUMAN EDIT", exact: true }),
  ).toBeVisible();
  await offline.close();
  await page.reload();
  await second.click();
  await expect(
    canvas.getByRole("heading", { name: "PAGE TWO HUMAN EDIT", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => performance.getEntriesByName("resumi:materialize").length,
    ),
  ).toBe(0);
  await expect(page.locator("iframe")).toHaveCount(0);
  await expect(page.getByRole("alert")).toHaveCount(0);
});
