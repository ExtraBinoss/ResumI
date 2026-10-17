import { expect, type Page, type Locator } from "@playwright/test";
import { readFile } from "node:fs/promises";

const canvas = (page: Page) =>
  page.getByRole("article", { name: "Resume canvas" });
const inspector = (page: Page) =>
  page.getByRole("complementary", { name: "Properties inspector" });
const layers = (page: Page) =>
  page.getByRole("complementary", { name: "Layers panel" });
const saved = (page: Page) =>
  expect(
    page.getByRole("status", { name: "Save status", exact: true }),
  ).toHaveText("Saved");

async function createVisual(page: Page) {
  await page.goto("/");
  await page
    .getByRole("link", { name: "Create a resume", exact: true })
    .click();
  await expect(canvas(page)).toBeVisible();
  await page.getByRole("button", { name: "Visual", exact: true }).click();
  await expect(canvas(page).locator("[data-layer-id]").first()).toBeVisible();
}

async function selectOption(page: Page, field: Locator, option: string) {
  await field.click();
  await page.getByRole("option", { name: option, exact: true }).click();
}

async function coordinates(layer: Locator) {
  return layer.evaluate((node) => ({
    x: parseFloat((node as HTMLElement).style.left),
    y: parseFloat((node as HTMLElement).style.top),
  }));
}

async function exportHtml(page: Page) {
  await page.getByRole("button", { name: "Export", exact: true }).click();
  const pending = page.waitForEvent("download");
  await page
    .getByRole("menuitem", { name: "Portable HTML", exact: true })
    .click();
  const download = await pending;
  const path = await download.path();
  expect(path).toBeTruthy();
  return readFile(path!, "utf8");
}

export async function groupedLayerJourney(page: Page) {
  await createVisual(page);
  await layers(page)
    .getByRole("button", { name: "Select layer Name", exact: true })
    .click();
  await layers(page)
    .getByRole("button", { name: "Select layer Product Designer", exact: true })
    .click({ modifiers: ["Shift"] });
  await expect(
    layers(page).getByRole("button", {
      name: "Select layer Name",
      exact: true,
    }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(
    layers(page).getByRole("button", {
      name: "Select layer Product Designer",
      exact: true,
    }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.keyboard.press("Control+g");
  await expect(
    inspector(page).getByRole("textbox", { name: "Group name", exact: true }),
  ).toBeVisible();
  await inspector(page)
    .getByRole("textbox", { name: "Group name", exact: true })
    .fill("Identity");
  await layers(page)
    .getByRole("spinbutton", { name: "Selection opacity", exact: true })
    .fill("65");
  await selectOption(
    page,
    layers(page).getByRole("combobox", {
      name: "Selection blend mode",
      exact: true,
    }),
    "Multiply",
  );
  const group = canvas(page).locator("[data-group-id]");
  await expect(group).toHaveCSS("opacity", "0.65");
  await expect(group).toHaveCSS("mix-blend-mode", "multiply");
  const blend = layers(page).getByRole("combobox", {
    name: "Selection blend mode",
    exact: true,
  });
  await blend.click();
  await page.getByRole("option", { name: "Screen", exact: true }).hover();
  await expect(group).toHaveCSS("mix-blend-mode", "screen");
  await page.keyboard.press("Escape");
  await expect(group).toHaveCSS("mix-blend-mode", "multiply");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(group).toHaveCSS("mix-blend-mode", "normal");
  await page.getByRole("button", { name: "Redo", exact: true }).click();
  await expect(group).toHaveCSS("mix-blend-mode", "multiply");

  const name = canvas(page)
    .getByRole("button", { name: "Edit heading: Alex Morgan", exact: true })
    .locator("..");
  const role = canvas(page)
    .getByRole("button", {
      name: "Edit subtitle: Product Designer",
      exact: true,
    })
    .locator("..");
  const beforeName = await coordinates(name),
    beforeRole = await coordinates(role);
  await layers(page)
    .getByRole("button", { name: "Select group Identity", exact: true })
    .focus();
  await page.keyboard.press("Shift+ArrowRight");
  await page.keyboard.press("ArrowDown");
  await expect
    .poll(() => coordinates(name))
    .toEqual({ x: beforeName.x + 10, y: beforeName.y + 1 });
  await expect
    .poll(() => coordinates(role))
    .toEqual({ x: beforeRole.x + 10, y: beforeRole.y + 1 });
  await layers(page)
    .getByRole("button", { name: "Lock group Identity", exact: true })
    .click();
  await expect(
    inspector(page).getByText("Locked", { exact: true }),
  ).toBeVisible();
  await layers(page)
    .getByRole("button", { name: "Hide group Identity", exact: true })
    .click();
  await expect(group).toHaveCount(0);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(group).toHaveCount(1);
  await saved(page);
  await page.reload();
  await layers(page)
    .getByRole("button", { name: "Select group Identity", exact: true })
    .click();
  await expect(group).toHaveCSS("opacity", "0.65");
  await expect(group).toHaveCSS("mix-blend-mode", "multiply");
  await expect
    .poll(() => coordinates(name))
    .toEqual({ x: beforeName.x + 10, y: beforeName.y + 1 });
  await expect(
    inspector(page).getByText("Locked", { exact: true }),
  ).toBeVisible();
  await layers(page)
    .getByRole("button", { name: "Unlock group Identity", exact: true })
    .click();
  await page.getByRole("button", { name: "Text", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Text content: Name", exact: true })
    .fill("Sam Layer QA");
  await page.getByRole("button", { name: "Visual", exact: true }).click();
  await expect(
    canvas(page).getByRole("heading", { name: "Sam Layer QA", exact: true }),
  ).toBeVisible();
  await expect(group).toHaveCSS("opacity", "0.65");
  await saved(page);
}

export async function shapeAppearanceJourney(page: Page) {
  await createVisual(page);
  await page.getByRole("button", { name: "Shapes", exact: true }).click();
  await page
    .getByRole("button", { name: "Use Rectangle", exact: true })
    .click();
  const paper = await canvas(page).boundingBox();
  expect(paper).toBeTruthy();
  const scale = paper!.width / 794;
  await page.mouse.move(paper!.x + 200 * scale, paper!.y + 850 * scale);
  await page.mouse.down();
  await page.mouse.move(paper!.x + 380 * scale, paper!.y + 950 * scale, {
    steps: 5,
  });
  await page.mouse.up();
  const shape = canvas(page)
    .getByRole("button", { name: "Edit shape: Rectangle", exact: true })
    .locator("..");
  await expect(shape).toBeVisible();
  const id = await shape.getAttribute("data-layer-id");
  expect(id).toBeTruthy();
  await inspector(page)
    .getByRole("textbox", { name: "Layer name", exact: true })
    .fill("QA shape");
  await inspector(page)
    .getByRole("spinbutton", { name: "Brightness", exact: true })
    .fill("140");
  await inspector(page)
    .getByRole("spinbutton", { name: "Blur", exact: true })
    .fill("2");
  await inspector(page)
    .getByRole("heading", { name: "Linear gradient", exact: true })
    .locator("..")
    .getByRole("button", { name: "Add", exact: true })
    .click();
  await inspector(page)
    .getByRole("spinbutton", { name: "Gradient angle", exact: true })
    .fill("30");
  const endColor = inspector(page).getByRole("button", {
    name: "Gradient stop 2 color",
    exact: true,
  });
  await endColor.click();
  const hex = page.getByRole("textbox", { name: "Hex", exact: true });
  await hex.fill("#123456");
  await hex.press("Enter");
  await hex.press("Escape");
  const selectedShape = canvas(page).locator(`[data-layer-id="${id}"]`);
  await expect(selectedShape.locator("feGaussianBlur")).toHaveAttribute(
    "stdDeviation",
    "2",
  );
  await expect(selectedShape.locator("feFuncR").first()).toHaveAttribute(
    "slope",
    "1.4",
  );
  await expect(
    selectedShape.locator("linearGradient stop").last(),
  ).toHaveAttribute("stop-color", "#123456");
  const html = await exportHtml(page);
  expect(html).toContain(`id="gradient-${id}"`);
  expect(html).toContain('stdDeviation="2"');
  expect(html).toContain('slope="1.4"');
  expect(html).toContain('stop-color="#123456"');
  expect(html).toContain(`filter:url(#folio-fx-${id})`);
  await saved(page);
}

export async function imageCropJourney(page: Page) {
  await createVisual(page);
  const data = await page.evaluate(() => {
    const swatch = document.createElement("canvas");
    swatch.width = 120;
    swatch.height = 80;
    const context = swatch.getContext("2d")!;
    context.fillStyle = "#d0e2ff";
    context.fillRect(0, 0, 120, 80);
    context.fillStyle = "#2958e8";
    context.fillRect(20, 20, 40, 40);
    return swatch.toDataURL("image/png").split(",")[1];
  });
  const pending = page.waitForEvent("filechooser");
  await page.getByRole("button", { name: "Add image", exact: true }).click();
  await (
    await pending
  ).setFiles({
    name: "synthetic-swatch.png",
    mimeType: "image/png",
    buffer: Buffer.from(data, "base64"),
  });
  await expect(
    inspector(page).getByRole("textbox", { name: "Layer name", exact: true }),
  ).toHaveValue("Image");
  await inspector(page)
    .getByRole("textbox", { name: "Layer name", exact: true })
    .fill("QA image");
  const imageLayer = canvas(page)
    .getByRole("button", { name: "Edit image: QA image", exact: true })
    .locator("..");
  const id = await imageLayer.getAttribute("data-layer-id");
  expect(id).toBeTruthy();
  await selectOption(
    page,
    inspector(page).getByRole("combobox", { name: "Image fit", exact: true }),
    "contain",
  );
  await inspector(page)
    .getByRole("spinbutton", { name: "Image zoom", exact: true })
    .fill("180");
  await inspector(page)
    .getByRole("spinbutton", { name: "Horizontal crop", exact: true })
    .fill("25");
  await inspector(page)
    .getByRole("spinbutton", { name: "Vertical crop", exact: true })
    .fill("75");
  const handle = canvas(page).getByRole("button", {
    name: "Resize QA image",
    exact: true,
  });
  const box = await handle.boundingBox();
  expect(box).toBeTruthy();
  await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
  await page.mouse.down();
  await page.mouse.move(
    box!.x + box!.width / 2 + 45,
    box!.y + box!.height / 2 + 30,
    { steps: 5 },
  );
  await page.mouse.up();
  const dimensions = await imageLayer.evaluate((node) => ({
    width: parseFloat((node as HTMLElement).style.width),
    height: parseFloat((node as HTMLElement).style.height),
  }));
  expect(dimensions.width).toBeGreaterThan(160);
  expect(dimensions.height).toBeGreaterThan(100);
  const image = imageLayer.locator("img");
  await expect(image).toHaveJSProperty("naturalWidth", 120);
  await expect(image).toHaveCSS("object-fit", "contain");
  await expect(image).toHaveCSS("object-position", "25% 75%");
  await expect(image).toHaveAttribute("style", /scale\(1\.8\)/);
  await inspector(page)
    .getByRole("spinbutton", { name: "Border width", exact: true })
    .fill("3");
  await selectOption(
    page,
    inspector(page).getByRole("combobox", {
      name: "Border style",
      exact: true,
    }),
    "dashed",
  );
  await inspector(page)
    .getByRole("button", { name: "Add shadow", exact: true })
    .click();
  await inspector(page)
    .getByRole("spinbutton", { name: "Shadow blur", exact: true })
    .fill("18");
  await expect(imageLayer).toHaveCSS("border-width", "3px");
  await expect(imageLayer).toHaveCSS("border-style", "dashed");
  await expect(imageLayer).toHaveCSS(
    "box-shadow",
    "rgba(0, 0, 0, 0.2) 0px 8px 18px 0px",
  );
  const html = await exportHtml(page);
  expect(html).toContain("border:3px dashed #151515");
  expect(html).toContain("box-shadow:0px 8px 18px 0px #00000033");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(imageLayer).toHaveCSS(
    "box-shadow",
    "rgba(0, 0, 0, 0.2) 0px 8px 24px 0px",
  );
  await page.getByRole("button", { name: "Redo", exact: true }).click();
  await saved(page);
  await page.reload();
  const restored = canvas(page).locator(`[data-layer-id="${id}"]`);
  await expect(restored).toHaveCSS("width", `${dimensions.width}px`);
  await expect(restored).toHaveCSS("height", `${dimensions.height}px`);
  await expect(restored.locator("img")).toHaveCSS("object-position", "25% 75%");
  await expect(restored.locator("img")).toHaveCSS("object-fit", "contain");
  await expect(restored).toHaveCSS("border", "3px dashed rgb(21, 21, 21)");
  await expect(restored).toHaveCSS(
    "box-shadow",
    "rgba(0, 0, 0, 0.2) 0px 8px 18px 0px",
  );
}
