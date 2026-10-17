import { expect, test, type Page } from "@playwright/test";

async function openWorkspace(page: Page) {
  await page.goto("/editor");
  await expect(
    page.getByRole("article", { name: "Resume canvas" }),
  ).toBeVisible();
}

test("long blend menus keep the final mode reachable by wheel and undoable", async ({
  page,
}) => {
  await openWorkspace(page);
  await page
    .getByRole("button", { name: "Select layer Name", exact: true })
    .click();
  const blend = page.getByRole("combobox", {
    name: "Selection blend mode",
    exact: true,
  });
  await blend.click();
  const popup = page.locator('[data-slot="select-content"]');
  await expect(popup).toBeVisible();
  const last = page.getByRole("option", { name: "Luminosity", exact: true });
  await expect(last).not.toBeInViewport();
  const box = (await popup.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.wheel(0, 600);
  await expect(last).toBeInViewport({ ratio: 1 });
  await last.click();
  await expect(blend.locator('[data-slot="select-value"]')).toHaveText(
    "Luminosity",
  );
  const layer = page
    .getByRole("article", { name: "Resume canvas" })
    .locator("[data-layer-id]")
    .filter({
      has: page.getByRole("heading", { name: "Alex Morgan", exact: true }),
    });
  await expect(layer).toHaveCSS("mix-blend-mode", "luminosity");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(blend.locator('[data-slot="select-value"]')).toHaveText(
    "Normal",
  );
  await expect(layer).toHaveCSS("mix-blend-mode", "normal");
});

test("permanent panels and native styled text editing preserve content across reload", async ({
  page,
}) => {
  await openWorkspace(page);
  await expect(
    page.getByRole("complementary", { name: "Layers panel" }),
  ).toBeVisible();
  await expect(
    page.getByRole("complementary", { name: "Properties inspector" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", {
      name: /Toggle properties|Toggle outline|Teammate|^Code$/,
    }),
  ).toHaveCount(0);
  const heading = page
    .getByRole("article", { name: "Resume canvas" })
    .getByRole("heading", { name: "Alex Morgan", exact: true });
  const typography = await heading.evaluate((node) => {
    const style = getComputedStyle(node);
    return {
      family: style.fontFamily,
      size: style.fontSize,
      weight: style.fontWeight,
    };
  });
  await page
    .getByRole("button", { name: "Select layer Name", exact: true })
    .click();
  const inspector = page.getByRole("complementary", {
    name: "Properties inspector",
  });
  const size = inspector.getByRole("spinbutton", {
    name: "Font size",
    exact: true,
  });
  const initialSize = Number(await size.inputValue());
  await size.press("ArrowUp");
  await expect(size).toHaveValue(String(initialSize + 1));
  await expect(heading).toHaveCSS("font-size", `${initialSize + 1}px`);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(size).toHaveValue(String(initialSize));
  await heading.dblclick();
  const input = page.getByRole("textbox", {
    name: "Edit text on canvas",
    exact: true,
  });
  await expect(input).toHaveAttribute("contenteditable", "true");
  expect(
    await input.evaluate((node) => {
      const style = getComputedStyle(node);
      return {
        family: style.fontFamily,
        size: style.fontSize,
        weight: style.fontWeight,
      };
    }),
  ).toEqual(typography);
  await input.fill("Jordan Native Edit");
  await input.press("Control+Enter");
  await expect(input).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "Jordan Native Edit", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("status", { name: "Save status", exact: true }),
  ).toHaveText("Saved");
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Jordan Native Edit", exact: true }),
  ).toBeVisible();
});

for (const viewport of [
  { width: 1440, height: 1000 },
  { width: 390, height: 844 },
]) {
  test(`Ctrl-wheel anchors canvas zoom and keeps permanent panels at ${viewport.width}px`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await openWorkspace(page);
    const paper = page.getByRole("article", { name: "Resume canvas" });
    const before = (await paper.boundingBox())!;
    const initialZoom = Number(
      await page
        .getByRole("spinbutton", { name: "Canvas zoom", exact: true })
        .inputValue(),
    );
    const cursor = {
      x: before.x + before.width / 2,
      y: before.y + before.height / 2,
    };
    expect(cursor.y).toBeGreaterThan(60);
    expect(cursor.y).toBeLessThan(
      viewport.width <= 700 ? viewport.height * 0.6 : viewport.height - 60,
    );
    const browserScale = await page.evaluate(
      () => window.visualViewport!.scale,
    );
    await page.mouse.move(cursor.x, cursor.y);
    await page.keyboard.down("Control");
    await page.mouse.wheel(0, -150);
    await page.keyboard.up("Control");
    await expect
      .poll(async () => (await paper.boundingBox())!.width)
      .toBeGreaterThan(before.width * 1.2);
    const target = Math.round(initialZoom * Math.exp(0.3) * 10) / 10;
    await expect(
      page.getByRole("spinbutton", { name: "Canvas zoom", exact: true }),
    ).toHaveValue(String(target));
    await expect
      .poll(async () => (await paper.boundingBox())!.width)
      .toBeCloseTo((before.width * target) / initialZoom, 1);
    const after = (await paper.boundingBox())!;
    expect(
      Math.abs(
        (cursor.x - before.x) / before.width -
          (cursor.x - after.x) / after.width,
      ),
    ).toBeLessThan(0.005);
    expect(
      Math.abs(
        (cursor.y - before.y) / before.height -
          (cursor.y - after.y) / after.height,
      ),
    ).toBeLessThan(0.005);
    expect(await page.evaluate(() => window.visualViewport!.scale)).toBe(
      browserScale,
    );
    await page.keyboard.down("Space");
    await page.mouse.down();
    await page.mouse.move(cursor.x + 60, cursor.y + 30, { steps: 8 });
    await page.mouse.up();
    await page.keyboard.up("Space");
    const panned = (await paper.boundingBox())!;
    expect(Math.abs(panned.x - after.x - 60)).toBeLessThan(2);
    expect(Math.abs(panned.y - after.y - 30)).toBeLessThan(2);
    for (const name of ["Layers panel", "Properties inspector"]) {
      const panel = page.getByRole("complementary", { name });
      await expect(panel).toBeVisible();
      const box = (await panel.boundingBox())!;
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);
      if (viewport.width <= 700)
        expect(box.y).toBeGreaterThan(viewport.height * 0.55);
    }
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBe(viewport.width);
  });
}

test("appearance settings persist both themes and use the preset interface fonts", async ({
  page,
}) => {
  await page.goto("/projects");
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await page.getByRole("button", { name: "Dark", exact: true }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.keyboard.press("Escape");
  await page.reload();
  await expect(page.locator("html")).toHaveClass(/dark/);
  const fonts = await page.evaluate(async () => {
    await document.fonts.ready;
    const heading = document.querySelector("h1")!;
    return {
      heading: getComputedStyle(heading).fontFamily,
      body: getComputedStyle(document.body).fontFamily,
      source: (
        await document.fonts.load('400 16px "Source Sans 3 Variable"')
      ).filter((font) => font.status === "loaded").length,
      space: (
        await document.fonts.load('600 24px "Space Grotesk Variable"')
      ).filter((font) => font.status === "loaded").length,
    };
  });
  expect(fonts.heading).toContain("Space Grotesk");
  expect(fonts.body).toContain("Source Sans 3");
  expect(fonts.source).toBeGreaterThan(0);
  expect(fonts.space).toBeGreaterThan(0);
  await openWorkspace(page);
  await page.getByRole("button", { name: "Text", exact: true }).click();
  const text = page.getByRole("textbox", {
    name: "Text content: Name",
    exact: true,
  });
  await expect(text).toBeVisible();
  expect(await text.evaluate((node) => getComputedStyle(node).color)).toBe(
    await page.locator("body").evaluate((node) => getComputedStyle(node).color),
  );
  await page.getByRole("button", { name: "Visual", exact: true }).click();
  await expect(
    page
      .getByRole("article", { name: "Resume canvas" })
      .getByRole("heading", { name: "Alex Morgan", exact: true }),
  ).toHaveCSS("color", "rgb(32, 37, 45)");
  await page
    .getByRole("button", { name: "Select layer Name", exact: true })
    .click();
  const content = page
    .getByRole("complementary", { name: "Properties inspector" })
    .getByRole("textbox", { name: "Content", exact: true });
  const foreground = await page
    .locator("body")
    .evaluate((node) => getComputedStyle(node).color);
  await expect(content).toHaveCSS("color", foreground);
  await expect(content.locator("span").first()).toHaveCSS("color", foreground);
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await page.getByRole("button", { name: "Light", exact: true }).click();
  await expect(page.locator("html")).not.toHaveClass(/dark/);
  await page.keyboard.press("Escape");
  await page.reload();
  await expect(page.locator("html")).not.toHaveClass(/dark/);
});
