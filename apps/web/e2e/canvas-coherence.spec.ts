import { expect, test, type Page } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";

async function settled(page: Page) {
  await expect
    .poll(() =>
      page
        .locator("[data-zoom-surface]")
        .evaluate((node) => (node as HTMLElement).style.willChange),
    )
    .toBe("");
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );
}

test("native word selection retains a visual mixed-style range through inspector controls", async ({
  page,
}) => {
  await page.goto("/editor");
  const paper = page.getByRole("article", { name: "Resume canvas" });
  await paper
    .getByRole("heading", { name: "Alex Morgan", exact: true })
    .dblclick();
  const input = page.getByRole("textbox", {
    name: "Edit text on canvas",
    exact: true,
  });
  const box = (await input.boundingBox())!;
  // A second native double-click selects a word inside the existing editor.
  await page.mouse.dblclick(box.x + 25, box.y + 14, { delay: 80 });
  await expect
    .poll(() => page.evaluate(() => window.getSelection()?.toString()))
    .toBe("Alex");
  const inspector = page.getByRole("complementary", {
    name: "Properties inspector",
  });
  await inspector.getByRole("button", { name: "Italic", exact: true }).click();
  await expect(input.locator("span").first()).toHaveText("Alex");
  await expect(input.locator("span").first()).toHaveCSS("font-style", "italic");
  await expect(input.locator("span").last()).toHaveCSS("font-style", "normal");
  await input.press("End");
  await page.keyboard.down("Shift");
  for (let i = 0; i < 6; i++) await page.keyboard.press("ArrowLeft");
  await page.keyboard.up("Shift");
  await expect
    .poll(() => page.evaluate(() => window.getSelection()?.toString()))
    .toBe("Morgan");
  await inspector
    .getByRole("spinbutton", { name: "Font size", exact: true })
    .fill("26");
  const content = paper.getByRole("heading", {
    name: "Alex Morgan",
    exact: true,
  });
  await expect(content.locator("span").first()).toHaveCSS("font-size", "38px");
  await expect(content.locator("span").last()).toHaveCSS("font-size", "26px");
  await inspector
    .getByRole("button", { name: "Text color", exact: true })
    .click();
  const hex = page.locator(
    '[data-slot="popover-content"] [data-channel="hex"]',
  );
  await hex.fill("C53030");
  await expect(hex).toBeFocused();
  await expect(content.locator("span").last()).toHaveCSS(
    "color",
    "rgb(197, 48, 48)",
  );
  await expect(content.locator("span").first()).not.toHaveCSS(
    "color",
    "rgb(197, 48, 48)",
  );
  await hex.press("Enter");
  await page.keyboard.press("Escape");
  await expect(
    page.locator('[data-slot="popover-content"] [data-channel="hex"]'),
  ).toHaveCount(0);
  await expect(content.locator("span").last()).toHaveCSS(
    "color",
    "rgb(197, 48, 48)",
  );
  await expect(content.locator("span").first()).not.toHaveCSS(
    "color",
    "rgb(197, 48, 48)",
  );
  await content.dblclick();
  const edited = page.getByRole("textbox", {
    name: "Edit text on canvas",
    exact: true,
  });
  await edited.press("End");
  await page.keyboard.type("!");
  await expect(edited).toHaveText("Alex Morgan!");
  await edited.press("Backspace");
  await expect(edited).toHaveText("Alex Morgan");
  await inspector
    .getByRole("heading", { name: "Typography", exact: true })
    .click();
  await mkdir("artifacts/visual", { recursive: true });
  await page.screenshot({ path: "artifacts/visual/native-mixed-visual.png" });
  await page.reload();
  await expect(content.locator("span").last()).toHaveCSS("font-size", "26px");
  await expect(content.locator("span").last()).toHaveCSS(
    "color",
    "rgb(197, 48, 48)",
  );
});

test("wheel, toolbar and Text workspace preserve their zoom anchor through the final layout paint", async ({
  page,
}) => {
  await page.goto("/editor");
  await expect(
    page.getByRole("article", { name: "Resume canvas" }),
  ).toBeVisible();
  const zoom = page.getByRole("spinbutton", {
    name: "Canvas zoom",
    exact: true,
  });
  const minus = (await page
    .getByRole("button", { name: "Zoom out", exact: true })
    .boundingBox())!;
  const plus = (await page
    .getByRole("button", { name: "Zoom in", exact: true })
    .boundingBox())!;
  const field = (await zoom.locator("..").boundingBox())!;
  expect(
    Math.abs(
      (minus.x + minus.width / 2 + plus.x + plus.width / 2) / 2 -
        (field.x + field.width / 2),
    ),
  ).toBeLessThan(0.5);
  await expect(zoom).toHaveCSS("padding-left", "0px");
  const measurements = [];
  for (const mode of ["visual", "text"] as const) {
    if (mode === "text")
      await page.getByRole("button", { name: "Text", exact: true }).click();
    if (mode === "text")
      await expect(
        page.getByRole("article", { name: "Text workspace", exact: true }),
      ).toBeVisible();
    await page.evaluate(
      () =>
        new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        ),
    );
    const surface = page.locator("[data-zoom-surface]");
    await expect(surface.locator("../../../..")).toHaveCSS("transform", "none");
    const viewport = surface.locator("../../..");
    // Observe the whole cycle, including the first frame after the single bounds commit.
    const before = (await surface.boundingBox())!;
    const viewportBox = (await viewport.boundingBox())!;
    const anchor = {
      x: viewportBox.x + viewportBox.width / 2,
      y: viewportBox.y + viewportBox.height / 2,
    };
    const fraction = {
      x: (anchor.x - before.x) / before.width,
      y: (anchor.y - before.y) / before.height,
    };
    await surface.evaluate((node) => {
      const samples: {
        left: number;
        top: number;
        width: number;
        height: number;
      }[] = [];
      Object.assign(window, { coherenceZoomSamples: samples });
      const end = performance.now() + 1000;
      function frame() {
        const rect = node.getBoundingClientRect();
        samples.push({
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
        });
        if (performance.now() < end) requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    });
    const previous = Number(await zoom.inputValue());
    await page.getByRole("button", { name: "Zoom in", exact: true }).click();
    await expect(zoom).toHaveValue(String(previous + 10));
    await settled(page);
    await page.evaluate(
      () => new Promise((resolve) => setTimeout(resolve, 1100)),
    );
    const samples = await page.evaluate(
      () =>
        (
          window as unknown as {
            coherenceZoomSamples: {
              left: number;
              top: number;
              width: number;
              height: number;
            }[];
          }
        ).coherenceZoomSamples,
    );
    const error = Math.max(
      ...samples.map((sample) =>
        Math.hypot(
          sample.left + sample.width * fraction.x - anchor.x,
          sample.top + sample.height * fraction.y - anchor.y,
        ),
      ),
    );
    expect(
      error,
      `${mode} toolbar zoom must retain the viewport center through layout commit`,
    ).toBeLessThan(1.5);
    expect(
      Math.max(
        0,
        ...samples
          .slice(1)
          .map((sample, index) => samples[index].width - sample.width),
      ),
    ).toBeLessThan(0.02);
    measurements.push({
      mode,
      toolbarFrames: samples.length,
      maximumToolbarAnchorErrorPx: error,
    });
    const wheelBefore = (await surface.boundingBox())!;
    const point = {
      x: wheelBefore.x + wheelBefore.width * 0.4,
      y: wheelBefore.y + wheelBefore.height * 0.4,
    };
    await page.mouse.move(point.x, point.y);
    await page.keyboard.down("Control");
    await page.mouse.wheel(0, 70);
    await page.keyboard.up("Control");
    await expect(zoom).not.toHaveValue(String(previous + 10));
    await settled(page);
    const after = (await surface.boundingBox())!;
    expect(
      Math.hypot(
        after.x + after.width * 0.4 - point.x,
        after.y + after.height * 0.4 - point.y,
      ),
    ).toBeLessThan(1.5);
    // Direct numeric editing shares the controller, not a second scale transform.
    await zoom.fill("90");
    await settled(page);
    await expect(surface).toHaveCSS(
      "transform",
      "matrix(0.9, 0, 0, 0.9, 0, 0)",
    );
  }
  await mkdir("artifacts/performance", { recursive: true });
  await writeFile(
    "artifacts/performance/canvas-coherence.json",
    JSON.stringify(measurements, null, 2),
  );
  await page.screenshot({ path: "artifacts/visual/text-zoom-workspace.png" });
});

test("group and layer blends never composite selection chrome or resize handles", async ({
  page,
}) => {
  await page.goto("/editor");
  await page
    .getByRole("button", { name: "Select layer Name", exact: true })
    .click();
  const frame = page.locator("[data-layer-frame]");
  await expect(frame).toBeVisible();
  const blend = page.getByRole("combobox", {
    name: "Selection blend mode",
    exact: true,
  });
  await blend.click();
  await page.getByRole("option", { name: "Multiply", exact: true }).hover();
  await expect(page.locator('[data-layer-name="Name"]')).toHaveCSS(
    "mix-blend-mode",
    "multiply",
  );
  expect(
    await frame.evaluate((node) => {
      let current: Element | null = node;
      while (
        current &&
        current.getAttribute("aria-label") !== "Resume canvas"
      ) {
        const style = getComputedStyle(current);
        if (style.mixBlendMode !== "normal" || style.opacity !== "1")
          return false;
        current = current.parentElement;
      }
      return true;
    }),
  ).toBe(true);
  await page.getByRole("option", { name: "Multiply", exact: true }).click();
  await expect(
    frame.getByRole("button", { name: "Resize Name", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(page.locator('[data-layer-name="Name"]')).toHaveCSS(
    "mix-blend-mode",
    "normal",
  );
});

test("composite group opacity and blends leave every interaction frame unchanged", async ({
  page,
}) => {
  await page.goto("/editor");
  await page
    .getByRole("button", { name: "Select layer Name", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Select layer Product Designer", exact: true })
    .click({ modifiers: ["Shift"] });
  await page.keyboard.press("Control+g");
  const group = page.locator(
    'article[aria-label="Resume canvas"] [data-group-id]',
  );
  await expect(group).toHaveCount(1);
  await expect(page.locator("[data-layer-frame]")).toHaveCount(2);
  await page
    .getByRole("spinbutton", { name: "Selection opacity", exact: true })
    .fill("45");
  await expect(group).toHaveCSS("opacity", "0.45");
  await page
    .getByRole("combobox", { name: "Selection blend mode", exact: true })
    .click();
  await page.getByRole("option", { name: "Screen", exact: true }).hover();
  await expect(group).toHaveCSS("mix-blend-mode", "screen");
  expect(
    await page.locator("[data-layer-frame]").evaluateAll((nodes) =>
      nodes.every((node) => {
        let current: Element | null = node;
        while (
          current &&
          current.getAttribute("aria-label") !== "Resume canvas"
        ) {
          const style = getComputedStyle(current);
          if (style.mixBlendMode !== "normal" || style.opacity !== "1")
            return false;
          current = current.parentElement;
        }
        return true;
      }),
    ),
  ).toBe(true);
  await page.keyboard.press("Escape");
  await expect(group).toHaveCSS("mix-blend-mode", "normal");
  // Base UI pre-mounts hidden items when focus returns to its trigger, for typeahead.
  await expect(
    page.getByRole("combobox", { name: "Selection blend mode", exact: true }),
  ).toHaveAttribute("aria-expanded", "false");
  await expect(page.locator('[data-slot="select-content"]')).toBeHidden();
  await page.screenshot({ path: "artifacts/visual/group-blend-selection.png" });
});

test("imported structured resumes use the same anchored zoom controller", async ({
  page,
}) => {
  const { createResume } = await import("@resumi/cv");
  await page.goto("/projects");
  await page.locator("input[type=file]").setInputFiles({
    name: "structured-zoom.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(createResume("structured-zoom"))),
  });
  const paper = page.getByRole("article", {
    name: "Resume canvas",
    exact: true,
  });
  await expect(paper).toBeVisible();
  const before = (await paper.boundingBox())!;
  await page.getByRole("button", { name: "Zoom in", exact: true }).click();
  await expect(
    page.getByRole("spinbutton", { name: "Canvas zoom", exact: true }),
  ).toHaveValue("85");
  await settled(page);
  const after = (await paper.boundingBox())!;
  expect(after.width / before.width).toBeCloseTo(85 / 75, 3);
  await expect(
    paper.getByRole("heading", { name: "Alex Morgan", exact: true }),
  ).toBeVisible();
});
