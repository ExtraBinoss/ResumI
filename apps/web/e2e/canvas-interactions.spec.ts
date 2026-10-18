import { expect, test, type Locator, type Page } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { createResume } from "../../../packages/cv/src/index";

async function open(page: Page) {
  await page.goto("/editor");
  await expect(
    page.getByRole("article", { name: "Resume canvas" }),
  ).toBeVisible();
}
async function capture(page: Page, name: string) {
  await mkdir("artifacts/visual", { recursive: true });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `artifacts/visual/${name}.png` });
}
async function startDrag(
  page: Page,
  source: Locator,
  target: Locator,
  edge: "top" | "bottom" = "top",
) {
  // Escape restores DOM order before Motion finishes its return. Wait for the
  // actual press point to settle, rather than pressing stale animated bounds.
  const press = (await source.boundingBox())!;
  await source.click({
    trial: true,
    position: { x: press.width / 2, y: Math.min(15, press.height / 2) },
  });
  const from = (await source.boundingBox())!,
    to = (await target.boundingBox())!;
  await page.mouse.move(
    from.x + from.width / 2,
    from.y + Math.min(15, from.height / 2),
  );
  await page.mouse.down();
  await page.mouse.move(
    from.x + from.width / 2 + 12,
    from.y + Math.min(15, from.height / 2),
    { steps: 4 },
  );
  await page.mouse.move(
    to.x + to.width / 2,
    edge === "top" ? to.y + 3 : to.y + to.height - 3,
    { steps: 12 },
  );
}
async function ids(rows: Locator, attribute: string) {
  return rows.evaluateAll(
    (nodes, attr) => nodes.map((node) => node.getAttribute(attr)),
    attribute,
  );
}

test("layer drag previews the stacking order, cancels cleanly, and drops as one undoable edit", async ({
  page,
}) => {
  await open(page);
  const rows = page.locator("[data-layer-row]"),
    original = await ids(rows, "data-layer-row");
  const first = rows.nth(0),
    third = rows.nth(2),
    thirdId = original[2]!;
  await startDrag(page, third, first);
  await expect(rows.first()).toHaveAttribute("data-layer-row", thirdId);
  await expect(page.locator('[data-drop-position="above"]')).toBeVisible();
  await capture(page, "editor-layer-drag-preview");
  await page.keyboard.press("Escape");
  await page.mouse.up();
  await expect.poll(() => ids(rows, "data-layer-row")).toEqual(original);
  await startDrag(page, rows.nth(2), rows.first());
  await expect(rows.first()).toHaveAttribute("data-layer-row", thirdId);
  await page.mouse.up();
  await expect(rows.first()).toHaveAttribute("data-layer-row", thirdId);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect.poll(() => ids(rows, "data-layer-row")).toEqual(original);
  await expect(page.locator("[data-drop-position]")).toHaveCount(0);
});

test("legacy document groups and their text reorder inside Layers and undo independently", async ({
  page,
}) => {
  await page.goto("/projects");
  await expect(
    page.getByRole("button", { name: "New resume", exact: true }),
  ).toBeVisible();
  await page.locator("input[type=file]").setInputFiles({
    name: "legacy-layers.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(createResume("legacy-layers"))),
  });
  await expect(
    page.getByRole("complementary", { name: "Layers panel", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("radio", { name: "Structure", exact: true }),
  ).toHaveCount(0);
  const rows = page.locator("[data-outline-section]");
  await expect(rows.first()).toBeVisible();
  expect(
    await rows.first().evaluate((node) => {
      const viewport = node.closest<HTMLElement>(
        '[data-slot="scroll-shadow-viewport"]',
      )!;
      return viewport.scrollWidth <= viewport.clientWidth + 1;
    }),
  ).toBe(true);
  const initial = await ids(rows, "data-outline-section");
  const undo = page.getByRole("button", { name: "Undo", exact: true });
  await expect(undo).toBeDisabled();
  await startDrag(
    page,
    rows.nth(1).locator("[data-outline-header] > button"),
    rows.nth(1).locator("[data-outline-header] > button"),
  );
  await page.mouse.up();
  await expect(undo).toBeDisabled();
  await expect.poll(() => ids(rows, "data-outline-section")).toEqual(initial);
  await startDrag(
    page,
    rows.nth(1).locator("[data-outline-header] > button"),
    rows.first().locator("[data-outline-header] > button"),
  );
  await expect(rows.first()).toHaveAttribute(
    "data-outline-section",
    initial[1]!,
  );
  await capture(page, "editor-outline-drag-preview");
  await page.mouse.up();
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect.poll(() => ids(rows, "data-outline-section")).toEqual(initial);
  const blocks = rows.first().locator("[data-outline-block]"),
    before = await ids(blocks, "data-outline-block");
  await startDrag(page, blocks.nth(1), blocks.first());
  await expect(blocks.first()).toHaveAttribute(
    "data-outline-block",
    before[1]!,
  );
  await page.mouse.up();
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect.poll(() => ids(blocks, "data-outline-block")).toEqual(before);
});

test("canvas and Text mode apply mixed styling only to the selected characters and end old edit focus", async ({
  page,
}) => {
  await open(page);
  const paper = page.getByRole("article", { name: "Resume canvas" });
  const originalWeight = await paper
    .getByRole("heading", { name: "Alex Morgan", exact: true })
    .evaluate((node) => getComputedStyle(node).fontWeight);
  await paper
    .getByRole("heading", { name: "Alex Morgan", exact: true })
    .dblclick();
  const input = page.getByRole("textbox", {
    name: "Edit text on canvas",
    exact: true,
  });
  await input.evaluate((node) => {
    const range = document.createRange(),
      text = node.firstChild!.firstChild!;
    range.setStart(text, 0);
    range.setEnd(text, 4);
    const selection = window.getSelection()!;
    selection.removeAllRanges();
    selection.addRange(range);
    node.dispatchEvent(new PointerEvent("pointerup", { bubbles: true }));
  });
  await page
    .getByRole("complementary", { name: "Properties inspector" })
    .getByRole("button", { name: "Italic", exact: true })
    .click();
  await expect(input.locator("span").first()).toHaveText("Alex");
  await expect(input.locator("span").first()).toHaveCSS("font-style", "italic");
  await expect(input.locator("span").last()).toHaveCSS("font-style", "normal");
  // A canvas pointer selection prevents browser focus by design; it must still finish the old editor.
  await paper
    .getByRole("button", {
      name: "Edit subtitle: Product Designer",
      exact: true,
    })
    .click();
  await expect(input).toHaveCount(0);
  await paper
    .getByRole("heading", { name: "Alex Morgan", exact: true })
    .click();
  await expect(input).toHaveCount(0);
  await page.getByRole("button", { name: "Text", exact: true }).click();
  const text = page.getByRole("textbox", {
    name: "Text content: Name",
    exact: true,
  });
  await text.focus();
  await text.evaluate((node) => {
    const range = document.createRange(),
      last = node.lastChild!.firstChild!;
    range.setStart(last, 1);
    range.setEnd(last, 7);
    const selection = window.getSelection()!;
    selection.removeAllRanges();
    selection.addRange(range);
    node.dispatchEvent(new PointerEvent("pointerup", { bubbles: true }));
  });
  await text.press("Control+b");
  await expect(text.locator("span").last()).toHaveText("Morgan");
  await expect(text.locator("span").last()).toHaveCSS("font-weight", "400");
  await expect(text.locator("span").first()).toHaveCSS(
    "font-weight",
    originalWeight,
  );
  await capture(page, "editor-mixed-text");
  await text.press("Escape");
  await page.getByRole("button", { name: "Visual", exact: true }).click();
  const content = paper.getByRole("heading", {
    name: "Alex Morgan",
    exact: true,
  });
  await expect(content.locator("span").first()).toHaveCSS(
    "font-style",
    "italic",
  );
  await expect(content.locator("span").last()).toHaveCSS("font-weight", "400");
});

test("wheel zoom animates by transform while the document layout commits once", async ({
  page,
}) => {
  await open(page);
  const paper = page.getByRole("article", { name: "Resume canvas" }),
    before = (await paper.boundingBox())!;
  await paper.evaluate((node) => {
    const bounds = node.parentElement!;
    const samples: {
      width: number;
      left: number;
      top: number;
      font: string;
      layout: string;
    }[] = [];
    Object.assign(window, { zoomSamples: samples });
    const started = performance.now();
    function sample() {
      const rect = node.getBoundingClientRect();
      samples.push({
        width: rect.width,
        left: rect.left,
        top: rect.top,
        font: getComputedStyle(node.querySelector("h1")!).fontSize,
        layout: bounds.style.width,
      });
      if (performance.now() - started < 1200) requestAnimationFrame(sample);
    }
    requestAnimationFrame(sample);
  });
  await page.mouse.move(
    before.x + before.width / 2,
    before.y + before.height / 2,
  );
  await page.keyboard.down("Control");
  await page.mouse.wheel(0, -150);
  await page.keyboard.up("Control");
  await expect(
    page.getByRole("spinbutton", { name: "Canvas zoom", exact: true }),
  ).toHaveValue("101.2");
  await expect
    .poll(() => paper.evaluate((node) => node.style.willChange))
    .toBe("");
  // Include layout commit and several subsequent paints, not just the animation frames.
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        setTimeout(resolve, 180);
      }),
  );
  const samples = await page.evaluate(
    () =>
      (
        window as unknown as {
          zoomSamples: {
            width: number;
            left: number;
            top: number;
            font: string;
            layout: string;
          }[];
        }
      ).zoomSamples,
  );
  expect(
    new Set(samples.map((sample) => sample.layout)).size,
  ).toBeLessThanOrEqual(2);
  expect(new Set(samples.map((sample) => sample.font)).size).toBe(1);
  expect(new Set(samples.map((sample) => sample.width)).size).toBeGreaterThan(
    3,
  );
  const maximumReverseStep = Math.max(
    0,
    ...samples
      .slice(1)
      .map((sample, index) => samples[index].width - sample.width),
  );
  expect(
    maximumReverseStep,
    "Zooming in must never step backwards",
  ).toBeLessThanOrEqual(0.02);
  const maximumAnchorError = Math.max(
    ...samples.map((sample) =>
      Math.hypot(
        sample.left + sample.width / 2 - before.x - before.width / 2,
        sample.top +
          (sample.width * 1123) / 794 / 2 -
          before.y -
          before.height / 2,
      ),
    ),
  );
  expect(maximumAnchorError).toBeLessThan(1.5);
  await mkdir("artifacts/performance", { recursive: true });
  await writeFile(
    "artifacts/performance/canvas-zoom.json",
    JSON.stringify(
      {
        frames: samples.length,
        distinctLayoutWidths: new Set(samples.map((sample) => sample.layout))
          .size,
        distinctFontSizes: new Set(samples.map((sample) => sample.font)).size,
        maximumAnchorErrorPx: maximumAnchorError,
        maximumReverseStepPx: maximumReverseStep,
        samples,
      },
      null,
      2,
    ),
  );
  const after = (await paper.boundingBox())!;
  expect(
    Math.abs(after.x + after.width / 2 - (before.x + before.width / 2)),
  ).toBeLessThan(1.5);
  expect(
    Math.abs(after.y + after.height / 2 - (before.y + before.height / 2)),
  ).toBeLessThan(1.5);
});
