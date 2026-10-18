import { expect, test, type Locator, type Page } from "@playwright/test";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import {
  applyCommands,
  createDocument,
  documentPages,
  makeLayer,
  validateDocument,
} from "../../../packages/engine/src";
import { inspectPdfText } from "@resumi/cv/pdf-text";
import { openDocumentSettings } from "./helpers/editor";

const paper = (page: Page) =>
  page.getByRole("article", { name: "Resume canvas", exact: true });
const dimensions = (page: Page) =>
  page.locator("article[data-active-page]").evaluate((element) => ({
    width: parseFloat((element as HTMLElement).style.width),
    height: parseFloat((element as HTMLElement).style.height),
  }));
const saved = (page: Page) =>
  expect(
    page.getByRole("status", { name: "Save status", exact: true }),
  ).toHaveText("Saved");

async function openSynthetic(page: Page, width = 794, height = 1123) {
  const document = applyCommands(
    createDocument("document-pages-qa", "Synthetic page QA"),
    {
      version: 1,
      actor: { kind: "agent", name: "Synthetic QA" },
      commands: [
        {
          type: "section.create",
          section: { id: "content", title: "Content", blockIds: [] },
        },
        { type: "canvas.enable", layers: {} },
        { type: "page.update", id: "page-1", patch: { width, height } },
        {
          type: "block.create",
          sectionId: "content",
          block: {
            id: "page-one-marker",
            kind: "text",
            text: "PAGE ONE SYNTHETIC",
            design: makeLayer("text", {
              name: "Page one marker",
              x: 48,
              y: 48,
              width: 450,
              height: 42,
              fontSize: 24,
            }),
          },
        },
      ],
    },
  ).document;
  await page.goto("/projects");
  await expect(
    page.getByRole("button", { name: "New resume", exact: true }),
  ).toBeVisible();
  await page.locator("input[type=file]").setInputFiles({
    name: "synthetic-pages.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(document)),
  });
  await expect(paper(page)).toBeVisible();
  await expect(paper(page)).toHaveAttribute("data-active-page", "page-1");
}

async function chooseFormat(page: Page, dialog: Locator, name: string) {
  await dialog.getByRole("combobox", { name: "Format", exact: true }).click();
  await page.getByRole("option", { name, exact: true }).click();
}
async function customSize(page: Page, width: number, height: number) {
  const dialog = await openDocumentSettings(page);
  const lock = dialog.getByRole("button", {
    name: "Keep aspect ratio",
    exact: true,
  });
  if ((await lock.getAttribute("aria-pressed")) === "true") await lock.click();
  await dialog
    .getByRole("spinbutton", { name: "Page width", exact: true })
    .fill(String(width));
  await dialog
    .getByRole("spinbutton", { name: "Page height", exact: true })
    .fill(String(height));
  await dialog.getByRole("button", { name: "Apply", exact: true }).click();
  await expect(dialog).toBeHidden();
  await expect.poll(() => dimensions(page)).toEqual({ width, height });
}
async function drawText(page: Page, text: string) {
  await page.getByRole("button", { name: "Text tool", exact: true }).click();
  await paper(page).scrollIntoViewIfNeeded();
  const box = (await paper(page).boundingBox())!;
  const size = await dimensions(page);
  const scale = box.width / size.width;
  await page.mouse.move(box.x + 60 * scale, box.y + 70 * scale);
  await page.mouse.down();
  await page.mouse.move(box.x + 350 * scale, box.y + 120 * scale, { steps: 4 });
  await page.mouse.up();
  const inspector = page.getByRole("complementary", {
    name: "Properties inspector",
    exact: true,
  });
  await inspector
    .getByRole("textbox", { name: "Content", exact: true })
    .fill(text);
  await inspector
    .getByRole("textbox", { name: "Layer name", exact: true })
    .fill(text);
  await expect(paper(page)).toContainText(text);
  await expect(paper(page).locator("[data-layer-id]")).toHaveCount(1);
  return paper(page).locator("[data-layer-id]").getAttribute("data-layer-id");
}

test("visual: document settings offer all formats, ratio, orientation and one undoable apply", async ({
  page,
}) => {
  test.setTimeout(90000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await openSynthetic(page);
  const dialog = await openDocumentSettings(page);
  const width = dialog.getByRole("spinbutton", {
    name: "Page width",
    exact: true,
  });
  const height = dialog.getByRole("spinbutton", {
    name: "Page height",
    exact: true,
  });
  for (const [format, w, h] of [
    ["A0", 3179, 4494],
    ["A1", 2245, 3179],
    ["A2", 1587, 2245],
    ["A3", 1123, 1587],
    ["A4", 794, 1123],
    ["A5", 559, 794],
    ["A6", 397, 559],
    ["Letter", 816, 1056],
  ] as const) {
    await chooseFormat(page, dialog, format);
    await expect(width).toHaveValue(String(w));
    await expect(height).toHaveValue(String(h));
    await expect
      .poll(() => dimensions(page))
      .toEqual({ width: 794, height: 1123 });
  }
  await chooseFormat(page, dialog, "A4");
  await expect(
    dialog.getByRole("button", { name: "Keep aspect ratio", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await width.fill("397");
  await expect(height).toHaveValue("562");
  await expect(
    dialog.getByRole("combobox", { name: "Format", exact: true }),
  ).toContainText("Custom");
  await dialog
    .getByRole("button", { name: "Swap width and height", exact: true })
    .click();
  await expect(width).toHaveValue("562");
  await expect(height).toHaveValue("397");
  await dialog
    .getByRole("button", { name: "Keep aspect ratio", exact: true })
    .click();
  await width.fill("640");
  await expect(height).toHaveValue("397");
  await height.fill("480");
  await width.fill("5001");
  await expect(dialog.getByRole("alert")).toHaveText(
    "Dimensions must be between 100 and 5,000 px.",
  );
  await expect(
    dialog.getByRole("button", { name: "Apply", exact: true }),
  ).toBeDisabled();
  await width.fill("640");
  await expect(
    dialog.getByRole("button", { name: "Apply", exact: true }),
  ).toBeEnabled();
  await mkdir("artifacts/visual", { recursive: true });
  await page.screenshot({
    path: "artifacts/visual/document-settings-desktop.png",
    animations: "disabled",
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(width).toBeInViewport();
  await expect(height).toBeInViewport();
  await page.screenshot({
    path: "artifacts/visual/document-settings-mobile.png",
    animations: "disabled",
  });
  await dialog.getByRole("button", { name: "Apply", exact: true }).click();
  await expect(dialog).toBeHidden();
  await page.setViewportSize({ width: 1440, height: 1000 });
  await expect
    .poll(() => dimensions(page))
    .toEqual({ width: 640, height: 480 });
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect
    .poll(() => dimensions(page))
    .toEqual({ width: 794, height: 1123 });
  await page.getByRole("button", { name: "Redo", exact: true }).click();
  await expect
    .poll(() => dimensions(page))
    .toEqual({ width: 640, height: 480 });
  await saved(page);
});

test("visual: page tools isolate layers, save mixed sizes and export three selectable PDF pages", async ({
  page,
  context,
}, testInfo) => {
  test.setTimeout(90000);
  await context.addInitScript(() => {
    window.print = () => {
      document.documentElement.dataset.printRequested = "true";
    };
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await openSynthetic(page, 600, 800);
  const add = paper(page)
    .locator("..")
    .getByRole("button", { name: "Add page", exact: true });
  const plus = (await add.boundingBox())!,
    firstPaper = (await paper(page).boundingBox())!;
  expect(plus.y).toBeGreaterThanOrEqual(firstPaper.y + firstPaper.height - 1);
  expect(plus.width).toBeLessThanOrEqual(44);
  await add.click();
  await expect(
    page.getByRole("tab", { name: "Page 2", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  const secondId = (await paper(page).getAttribute("data-active-page"))!;
  await expect(paper(page).locator("[data-layer-id]")).toHaveCount(0);
  await customSize(page, 400, 300);
  const secondLayer = await drawText(page, "PAGE TWO SYNTHETIC");
  await add.click();
  await expect(
    page.getByRole("tab", { name: "Page 3", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  const thirdId = (await paper(page).getAttribute("data-active-page"))!;
  await expect(paper(page).locator("[data-layer-id]")).toHaveCount(0);
  const dialog = await openDocumentSettings(page);
  await chooseFormat(page, dialog, "Letter");
  // New pages inherit the landscape size; presets preserve that orientation.
  // Select portrait explicitly for the mixed-size export fixture.
  await expect(
    dialog.getByRole("spinbutton", { name: "Page width", exact: true }),
  ).toHaveValue("1056");
  await dialog
    .getByRole("button", { name: "Swap width and height", exact: true })
    .click();
  await expect(
    dialog.getByRole("spinbutton", { name: "Page width", exact: true }),
  ).toHaveValue("816");
  await expect(
    dialog.getByRole("spinbutton", { name: "Page height", exact: true }),
  ).toHaveValue("1056");
  await dialog.getByRole("button", { name: "Apply", exact: true }).click();
  const thirdLayer = await drawText(page, "PAGE THREE SYNTHETIC");
  for (const [number, text] of [
    [1, "PAGE ONE SYNTHETIC"],
    [2, "PAGE TWO SYNTHETIC"],
    [3, "PAGE THREE SYNTHETIC"],
  ] as const) {
    await page
      .getByRole("tab", { name: `Page ${number}`, exact: true })
      .click();
    await expect(paper(page).locator("[data-layer-id]")).toHaveCount(1);
    await expect(paper(page)).toContainText(text);
    await expect(page.locator("[data-layer-row]")).toHaveCount(1);
  }
  await saved(page);
  await page.reload();
  await expect(
    page.getByRole("tab", { name: "Page 3", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("tab", { name: "Page 1", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await expect
    .poll(() => dimensions(page))
    .toEqual({ width: 600, height: 800 });
  await page.getByRole("tab", { name: "Page 2", exact: true }).click();
  await expect
    .poll(() => dimensions(page))
    .toEqual({ width: 400, height: 300 });
  await expect(paper(page)).toContainText("PAGE TWO SYNTHETIC");
  await page.getByRole("tab", { name: "Page 3", exact: true }).click();
  await expect
    .poll(() => dimensions(page))
    .toEqual({ width: 816, height: 1056 });
  await expect(paper(page)).toContainText("PAGE THREE SYNTHETIC");
  await mkdir("artifacts/visual", { recursive: true });
  await page.screenshot({
    path: "artifacts/visual/document-pages-layers.png",
    animations: "disabled",
  });

  await page.getByRole("button", { name: "Export", exact: true }).click();
  const pending = page.waitForEvent("download");
  await page
    .getByRole("menuitem", { name: "JSON document", exact: true })
    .click();
  const exported = validateDocument(
    JSON.parse(await readFile((await (await pending).path())!, "utf8")),
  );
  expect(
    documentPages(exported).map(({ width, height }) => ({ width, height })),
  ).toEqual([
    { width: 600, height: 800 },
    { width: 400, height: 300 },
    { width: 816, height: 1056 },
  ]);
  expect(exported.blocks[secondLayer!]!.design?.pageId).toBe(secondId);
  expect(exported.blocks[thirdLayer!]!.design?.pageId).toBe(thirdId);
  const popupPromise = page.waitForEvent("popup");
  await page.getByRole("button", { name: "Export PDF", exact: true }).click();
  const popup = await popupPromise;
  await expect(popup.locator("html")).toHaveAttribute("data-pdf-ready", "true");
  await expect(popup.locator("html")).toHaveAttribute(
    "data-print-requested",
    "true",
  );
  await expect(popup.locator("[data-page-id]")).toHaveCount(3);
  const bytes = await popup.pdf({
    path: testInfo.outputPath("mixed-pages.pdf"),
    preferCSSPageSize: true,
    printBackground: true,
  });
  const inspection = await inspectPdfText(new Uint8Array(bytes));
  expect(inspection.pageCount).toBe(3);
  for (const [index, [w, h, text]] of [
    [450, 600, "PAGE ONE SYNTHETIC"],
    [300, 225, "PAGE TWO SYNTHETIC"],
    [612, 792, "PAGE THREE SYNTHETIC"],
  ].entries()) {
    const pdfPage = inspection.pages[index]!;
    expect(pdfPage.width).toBeCloseTo(w as number, 0);
    expect(pdfPage.height).toBeCloseTo(h as number, 0);
    expect(pdfPage.text).toBe(text);
    expect(pdfPage.items.some((item) => item.text === text)).toBe(true);
  }
  await writeFile(
    testInfo.outputPath("mixed-pages-text.json"),
    JSON.stringify(inspection, null, 2),
  );
  await popup.close();
});

test("SSR social metadata references the local 1200 by 630 share image", async ({
  request,
}) => {
  const response = await request.get("/");
  expect(response.ok()).toBe(true);
  const html = await response.text();
  expect(html).toContain(
    'property="og:image" content="https://resumi.plinka.eu/og-image.png"',
  );
  expect(html).toContain('property="og:image:width" content="1200"');
  expect(html).toContain('property="og:image:height" content="630"');
  expect(html).toContain('name="twitter:card" content="summary_large_image"');
  const png = await request.get("/og-image.png");
  expect(png.headers()["content-type"]).toContain("image/png");
  const bytes = await png.body();
  expect(bytes.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
  expect(bytes.readUInt32BE(16)).toBe(1200);
  expect(bytes.readUInt32BE(20)).toBe(630);
});
