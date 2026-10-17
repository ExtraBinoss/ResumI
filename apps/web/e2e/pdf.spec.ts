import { expect, test, type Page } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { closeDialog, openCommands, openSource } from "./helpers/editor";

async function preparePdf(page: Page) {
  const pending = page.waitForEvent("popup");
  await page.getByRole("button", { name: "Export PDF", exact: true }).click();
  const popup = await pending;
  await expect(popup.locator("html")).toHaveAttribute("data-pdf-ready", "true");
  await expect(popup.locator("html")).toHaveAttribute(
    "data-print-requested",
    "true",
  );
  expect(await popup.evaluate(() => window.opener)).toBeNull();
  await expect(
    popup.locator("script,iframe,object,[onclick],[onerror]"),
  ).toHaveCount(0);
  return popup;
}

test.beforeEach(async ({ context }) => {
  // Intercept the native dialog, then generate the actual Chromium PDF from the same print page.
  await context.addInitScript(() => {
    window.print = () => {
      document.documentElement.dataset.printRequested = "true";
    };
  });
});

test("PDF primary export preserves selectable document text and optimizes only the photographic print copy", async ({
  page,
}) => {
  await page.goto("/editor");
  await expect(
    page.getByRole("article", { name: "Resume canvas" }),
  ).toBeVisible();
  const source = await page.evaluate(() => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1800;
    const ctx = canvas.getContext("2d")!;
    const gradient = ctx.createLinearGradient(0, 0, 1800, 1800);
    gradient.addColorStop(0, "#2563eb");
    gradient.addColorStop(1, "#f97316");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1800, 1800);
    ctx.fillStyle = "#fff";
    ctx.fillRect(100, 100, 300, 300);
    return canvas.toDataURL("image/jpeg", 0.98);
  });
  await page.getByRole("button", { name: "Add image", exact: true }).click();
  await page.getByLabel("Upload image", { exact: true }).setInputFiles({
    name: "Synthetic photograph.jpg",
    mimeType: "image/jpeg",
    buffer: Buffer.from(source.split(",")[1], "base64"),
  });
  const original = page
    .getByRole("article", { name: "Resume canvas" })
    .getByRole("img", { name: "Synthetic photograph.jpg", exact: true });
  await expect(original).toHaveJSProperty("naturalWidth", 1800);
  for (const [field, value] of [
    ["width", "100"],
    ["height", "100"],
    ["x", "620"],
    ["y", "960"],
  ]) {
    await page
      .getByRole("spinbutton", { name: `Layer ${field}`, exact: true })
      .fill(value);
  }
  const originalData = await original.getAttribute("src");
  const popup = await preparePdf(page);
  await expect(
    popup.getByRole("heading", { name: "Alex Morgan", exact: true }),
  ).toBeVisible();
  const copy = popup.getByRole("img", {
    name: "Synthetic photograph.jpg",
    exact: true,
  });
  const dimensions = await copy.evaluate((image: HTMLImageElement) => ({
    width: image.naturalWidth,
    length: image.src.length,
    rendered: image.getBoundingClientRect().width,
  }));
  expect(dimensions.width).toBeLessThanOrEqual(
    Math.ceil(dimensions.rendered * 3),
  );
  expect(dimensions.length).toBeLessThan(originalData!.length);
  await expect(original).toHaveAttribute("src", originalData!);
  await mkdir("output/pdf", { recursive: true });
  const pdf = await popup.pdf({
    path: "output/pdf/resumi-visual.pdf",
    preferCSSPageSize: true,
    printBackground: true,
  });
  expect(pdf.subarray(0, 5).toString()).toBe("%PDF-");
  await writeFile(
    "artifacts/rendered/pdf-image-optimization.json",
    JSON.stringify(
      {
        sourceBytes: originalData!.length,
        printBytes: dimensions.length,
        printWidth: dimensions.width,
      },
      null,
      2,
    ),
  );
  await popup.close();
});

test("React portrait PDF renders source in isolation and prints its inert offline snapshot", async ({
  page,
}) => {
  await page.goto("/editor?template=react-profile");
  const frame = page.frameLocator('iframe[title="React resume preview"]');
  await expect(
    frame.getByRole("heading", { name: "Alex Morgan", exact: true }),
  ).toBeVisible();
  const popup = await preparePdf(page);
  await expect(
    popup.getByRole("heading", { name: "Alex Morgan", exact: true }),
  ).toBeVisible();
  await expect(
    popup.getByRole("img", { name: "Portrait of Alex Morgan", exact: true }),
  ).toBeVisible();
  await expect(popup.locator("svg")).not.toHaveCount(0);
  await mkdir("output/pdf", { recursive: true });
  await popup.pdf({
    path: "output/pdf/resumi-profile.pdf",
    preferCSSPageSize: true,
    printBackground: true,
  });
  await popup.close();
});

test("HTML PDF strips active source and never lets it access application state", async ({
  page,
}) => {
  await page.goto("/editor");
  await expect(
    page.getByRole("article", { name: "Resume canvas" }),
  ).toBeVisible();
  await openSource(page);
  await page
    .getByRole("button", { name: "Start with HTML", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "HTML resume source", exact: true })
    .fill(
      '<body style="background:#f8fafc;color:#123456"><h1 onclick="document.body.dataset.executed=1">Safe print</h1><p>Selectable content</p><script>parent.document.body.dataset.pdfEscaped="yes"</script></body>',
    );
  await page
    .getByRole("button", { name: "Apply & preview", exact: true })
    .click();
  await closeDialog(page, "Source");
  const popup = await preparePdf(page);
  await expect(
    popup.getByRole("heading", { name: "Safe print", exact: true }),
  ).toBeVisible();
  await expect(popup.locator("body")).toHaveCSS("color", "rgb(18, 52, 86)");
  await expect(popup.locator("body")).toHaveCSS(
    "background-color",
    "rgb(248, 250, 252)",
  );
  expect(
    await page.locator("body").getAttribute("data-pdf-escaped"),
  ).toBeNull();
  expect(await popup.locator("body").getAttribute("data-executed")).toBeNull();
  await popup.close();
});

test("custom canvas PDF keeps its actual print dimensions instead of forcing A4", async ({
  page,
}) => {
  await page.goto("/editor");
  await expect(
    page.getByRole("article", { name: "Resume canvas" }),
  ).toBeVisible();
  await openCommands(page);
  await page
    .getByRole("textbox", { name: "Command proposal", exact: true })
    .fill(
      JSON.stringify({
        version: 1,
        actor: { kind: "agent", name: "Page size" },
        commands: [
          { type: "canvas.update", patch: { width: 420, height: 420 } },
        ],
      }),
    );
  await page
    .getByRole("button", { name: "Validate & preview", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Apply changes", exact: true })
    .click();
  await closeDialog(page, "Import commands");
  const popup = await preparePdf(page);
  await popup.emulateMedia({ media: "print" });
  const article = popup.getByRole("article", { name: "Resume", exact: true });
  await expect(article).toHaveCSS("width", "420px");
  await expect(article).toHaveCSS("height", "420px");
  const pdf = await popup.pdf({
    preferCSSPageSize: true,
    printBackground: true,
  });
  const box = /\/MediaBox\s*\[([\d.\s]+)\]/.exec(pdf.toString("latin1"));
  expect(box).not.toBeNull();
  const values = box![1].trim().split(/\s+/).map(Number);
  expect(values[2]).toBeCloseTo(315, 0);
  expect(values[3]).toBeCloseTo(315, 0);
  await popup.close();
});

test("PDF popup denial is copyable and closing preparation leaves no render frame", async ({
  page,
}) => {
  await page.goto("/editor");
  await expect(
    page.getByRole("article", { name: "Resume canvas" }),
  ).toBeVisible();
  await page.evaluate(() => {
    window.open = () => null;
  });
  await page.getByRole("button", { name: "Export PDF", exact: true }).click();
  await page
    .getByRole("alert")
    .getByRole("button", { name: "Action failed", exact: true })
    .click();
  await expect(
    page.getByText("Allow this page to open the PDF preview, then try again.", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Copy error details", exact: true }),
  ).toBeVisible();
  await page.reload();
  const pending = page.waitForEvent("popup");
  await page.getByRole("button", { name: "Export PDF", exact: true }).click();
  await (await pending).close();
  await expect(page.locator('iframe[title="Preparing PDF"]')).toHaveCount(0);
  await expect(
    page.getByText("The PDF could not be prepared.", { exact: true }),
  ).toHaveCount(0);
});
