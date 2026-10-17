import { readFile } from "node:fs/promises";
import { expect, test, type Page } from "@playwright/test";

async function icons(page: Page) {
  await page.getByRole("button", { name: "Icons", exact: true }).click();
  await expect(
    page.getByRole("textbox", { name: "Search icons", exact: true }),
  ).toBeVisible();
}
async function draw(page: Page, horizontal = 0.45) {
  const canvas = page.getByRole("article", { name: "Resume canvas" });
  const box = (await canvas.boundingBox())!;
  const x = box.x + box.width * horizontal,
    y = box.y + box.height * 0.72;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + 70, y + 70, { steps: 5 });
  await page.mouse.up();
  return canvas.locator("[data-layer-id]").last();
}
async function exportDocument(page: Page) {
  await page.getByRole("button", { name: "Export", exact: true }).click();
  const downloaded = page.waitForEvent("download");
  await page
    .getByRole("menuitem", { name: "JSON document", exact: true })
    .click();
  const file = await downloaded;
  return JSON.parse(await readFile((await file.path())!, "utf8"));
}

test("brand icons preserve original Figma and Microsoft colors through drawing, reload and portable export", async ({
  page,
}) => {
  await page.goto("/editor");
  await expect(
    page.getByRole("article", { name: "Resume canvas" }),
  ).toBeVisible();
  await icons(page);
  await page.getByRole("tab", { name: "Brands", exact: true }).click();
  const library = page.getByRole("region", {
    name: "Icon library",
    exact: true,
  });
  await expect(library.getByRole("button", { name: /^Use / })).toHaveCount(50);
  const figma = page.getByRole("button", { name: "Use Figma", exact: true });
  await expect(figma.locator("path")).toHaveCount(5);
  const figmaColors = ["#0acf83", "#1abcfe", "#a259ff", "#f24e1e", "#ff7262"];
  expect(
    (
      await figma
        .locator("path")
        .evaluateAll((nodes) =>
          nodes.map((node) => node.getAttribute("fill")!.toLowerCase()),
        )
    ).sort(),
  ).toEqual(figmaColors);
  await figma.click();
  const figmaLayer = await draw(page);
  await expect(figmaLayer.locator("svg path")).toHaveCount(5);
  const firstColor = await figmaLayer
    .locator("svg path")
    .first()
    .getAttribute("fill");
  await page
    .getByRole("button", { name: "Vector color 1", exact: true })
    .click();
  const hex = page.getByRole("textbox", { name: "Hex", exact: true });
  await hex.fill("#123456");
  await hex.press("Enter");
  await hex.press("Escape");
  await expect(figmaLayer.locator("svg path").first()).toHaveAttribute(
    "fill",
    "#123456",
  );
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(figmaLayer.locator("svg path").first()).toHaveAttribute(
    "fill",
    firstColor!,
  );
  await icons(page);
  await page
    .getByRole("textbox", { name: "Search icons", exact: true })
    .fill("Microsoft");
  await page
    .getByRole("button", { name: "Use Microsoft", exact: true })
    .click();
  const microsoftLayer = await draw(page, 0.65);
  await expect(microsoftLayer.locator("svg path")).toHaveCount(4);
  await expect(
    page.getByRole("status", { name: "Save status", exact: true }),
  ).toHaveText("Saved");
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Select layer Figma", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Select layer Microsoft", exact: true }),
  ).toBeVisible();
  const document = await exportDocument(page);
  const blocks = Object.values(document.blocks) as {
    design?: {
      name: string;
      vector?: { parts: { fill: string }[]; attribution: string };
    };
  }[];
  expect(
    blocks.find((block) => block.design?.name === "Figma")!.design!.vector!
      .parts,
  ).toHaveLength(5);
  expect(
    blocks.find((block) => block.design?.name === "Microsoft")!.design!.vector!
      .parts,
  ).toHaveLength(4);
  expect(
    blocks.find((block) => block.design?.name === "Figma")!.design!.vector!
      .attribution,
  ).toContain("MIT");
  await page.getByRole("button", { name: "Export", exact: true }).click();
  const download = page.waitForEvent("download");
  await page
    .getByRole("menuitem", { name: "Portable HTML", exact: true })
    .click();
  const html = await readFile((await (await download).path())!, "utf8");
  for (const color of figmaColors) expect(html.toLowerCase()).toContain(color);
  expect(html).toContain("Source:");
});

test("local SVG import keeps component paint and transforms, rejects active content, and is reusable after reload", async ({
  page,
}) => {
  await page.goto("/editor");
  await expect(
    page.getByRole("article", { name: "Resume canvas" }),
  ).toBeVisible();
  await icons(page);
  const input = page.getByLabel("Import SVG file", { exact: true });
  await input.setInputFiles({
    name: "Synthetic glyph.svg",
    mimeType: "image/svg+xml",
    buffer: Buffer.from(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><g transform="translate(10 5)"><rect width="20" height="30" fill="red" fill-opacity="0.5"/><circle cx="50" cy="50" r="10" fill="royalblue"/><path d="M0 0L80 80" fill="none" stroke="#008000" stroke-width="2"/></g></svg>',
    ),
  });
  const imported = page.getByRole("button", {
    name: "Use Synthetic glyph",
    exact: true,
  });
  await expect(imported).toBeVisible();
  await expect(imported.locator("path")).toHaveCount(3);
  await expect(imported.locator("path").first()).toHaveAttribute(
    "fill",
    "#ff000080",
  );
  await expect(imported.locator("path").nth(1)).toHaveAttribute(
    "fill",
    "#4169e1",
  );
  await expect(imported.locator("path").first()).toHaveAttribute(
    "transform",
    "matrix(1 0 0 1 10 5)",
  );
  await imported.click();
  const layer = await draw(page);
  await expect(layer.locator("svg path")).toHaveCount(3);
  await expect(
    page.getByRole("status", { name: "Save status", exact: true }),
  ).toHaveText("Saved");
  await page.reload();
  await expect(
    page.getByRole("button", {
      name: "Select layer Synthetic glyph",
      exact: true,
    }),
  ).toBeVisible();
  await icons(page);
  await page.getByRole("tab", { name: "Imported", exact: true }).click();
  await expect(imported).toBeVisible();
  const requests: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("svg-import.invalid"))
      requests.push(request.url());
  });
  for (const source of [
    '<svg viewBox="0 0 100 100"><script>window.__resumiInjected=true</script></svg>',
    '<svg viewBox="0 0 100 100"><image href="https://svg-import.invalid/track.png"/></svg>',
    '<!DOCTYPE svg [<!ENTITY external SYSTEM "https://svg-import.invalid/private">]><svg viewBox="0 0 100 100"/>',
  ]) {
    await input.setInputFiles({
      name: "Rejected.svg",
      mimeType: "image/svg+xml",
      buffer: Buffer.from(source),
    });
    await expect(page.getByRole("alert")).toContainText("SVG import:");
    await expect(
      page.getByRole("button", { name: "Copy error details", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Use Rejected", exact: true }),
    ).toHaveCount(0);
  }
  expect(await page.evaluate(() => "__resumiInjected" in window)).toBe(false);
  expect(requests).toEqual([]);
  await page.keyboard.press("Escape");
  const document = await exportDocument(page);
  const block = (
    Object.values(document.blocks) as {
      design?: {
        name: string;
        vector?: {
          parts: { fill: string; matrix: number[] }[];
          attribution: string;
        };
      };
    }[]
  ).find((block) => block.design?.name === "Synthetic glyph")!;
  expect(block.design!.vector!.parts[0].fill).toBe("#ff000080");
  expect(block.design!.vector!.parts[0].matrix).toEqual([1, 0, 0, 1, 10, 5]);
  expect(block.design!.vector!.attribution).toContain(
    "Imported SVG: Synthetic glyph.svg",
  );
});
