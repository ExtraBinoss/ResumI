import { expect, test } from "@playwright/test";

for (const viewport of [
  { width: 1440, height: 1000 },
  { width: 390, height: 844 },
]) {
  test(`visual materialized workspace has native modes and shared zoom at ${viewport.width}px`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.goto("/editor?template=react-cobalt");
    const paper = page.getByRole("article", {
      name: "Resume canvas",
      exact: true,
    });
    await expect(paper).toBeVisible();
    const region = paper.locator("xpath=ancestor::div[3]");
    const unscaledHeight = await paper.evaluate((node) =>
      parseFloat((node as HTMLElement).style.height),
    );
    expect(unscaledHeight).toBeGreaterThan(900);
    await expect(
      paper.getByRole("heading", { name: "Alex Morgan", exact: true }),
    ).toBeVisible();
    const modes = page.getByRole("group", {
      name: "Editing mode",
      exact: true,
    });
    const visual = modes.getByRole("button", { name: "Visual", exact: true });
    const text = modes.getByRole("button", { name: "Text", exact: true });
    await expect(visual).toHaveAttribute("aria-pressed", "true");
    await expect(text).toHaveAttribute("aria-pressed", "false");
    await expect(
      page.getByRole("group", { name: "Source preview zoom" }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "Fit page", exact: true }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "Select", exact: true }),
    ).toBeVisible();
    await expect
      .poll(async () => {
        const bounds = await region.boundingBox();
        const boundsPaper = await paper.boundingBox();
        return (
          !!bounds &&
          !!boundsPaper &&
          boundsPaper.x >= bounds.x - 1 &&
          boundsPaper.x + boundsPaper.width <= bounds.x + bounds.width + 1 &&
          boundsPaper.y >= bounds.y - 1 &&
          boundsPaper.y + boundsPaper.height <= bounds.y + bounds.height + 1
        );
      })
      .toBe(true);
    await page.screenshot({
      path: `artifacts/visual/source-workspace-${viewport.width}.png`,
    });
    const zoom = page.getByRole("spinbutton", {
      name: "Canvas zoom",
      exact: true,
    });
    await expect(zoom).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Export", exact: true }).locator("svg"),
    ).toBeVisible();
    const controls = await page
      .locator("header")
      .filter({
        has: page.getByRole("button", { name: "Export", exact: true }),
      })
      .getByRole("button")
      .evaluateAll((buttons) =>
        buttons.map((button) => {
          const box = button.getBoundingClientRect();
          return { left: box.left, right: box.right };
        }),
      );
    for (let i = 1; i < controls.length; i++)
      expect(controls[i].left).toBeGreaterThanOrEqual(controls[i - 1].right);
    await zoom.fill("100");
    await expect
      .poll(async () => (await paper.boundingBox())?.height)
      .toBe(unscaledHeight);
    await page.getByRole("button", { name: "Zoom out", exact: true }).click();
    await expect(zoom).toHaveValue("90");
    await expect
      .poll(async () => (await paper.boundingBox())?.height ?? unscaledHeight)
      .toBeLessThan(unscaledHeight);
    const bounds = (await region.boundingBox())!;
    await page.mouse.move(
      bounds.x + bounds.width / 2,
      bounds.y + bounds.height / 2,
    );
    await page.keyboard.down("Control");
    await page.mouse.wheel(0, -100);
    await page.keyboard.up("Control");
    await expect
      .poll(async () => Number(await zoom.inputValue()))
      .toBeGreaterThan(90);
    await expect
      .poll(async () => (await paper.boundingBox())?.height ?? 0)
      .toBeGreaterThan(unscaledHeight * 0.9);
    await zoom.fill("60");
    await expect
      .poll(async () =>
        Math.abs(
          ((await paper.boundingBox())?.height ?? 0) - unscaledHeight * 0.6,
        ),
      )
      .toBeLessThan(1);
    await page.setViewportSize({
      width: viewport.width + 20,
      height: viewport.height + 30,
    });
    await page.evaluate(async () => {
      await new Promise(requestAnimationFrame);
      await new Promise(requestAnimationFrame);
    });
    await expect(zoom).toHaveValue("60");
    await expect
      .poll(async () =>
        Math.abs(
          ((await paper.boundingBox())?.height ?? 0) - unscaledHeight * 0.6,
        ),
      )
      .toBeLessThan(1);
    await text.click();
    const workspace = page.getByRole("article", {
      name: "Text workspace",
      exact: true,
    });
    await expect(workspace).toBeVisible();
    await expect(
      workspace.getByRole("textbox").filter({ hasText: "Alex Morgan" }).first(),
    ).toBeVisible();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(text).toHaveAttribute("aria-pressed", "true");
    await visual.click();
    await expect(paper).toBeVisible();
    await expect(visual).toHaveAttribute("aria-pressed", "true");
    await expect(text).toHaveAttribute("aria-pressed", "false");
    await expect(zoom).toHaveValue("60");
    await expect(
      page.getByRole("button", { name: "Undo", exact: true }),
    ).toBeDisabled();
    await page.screenshot({
      path: `artifacts/visual/source-workspace-restored-${viewport.width}.png`,
    });
  });
}
