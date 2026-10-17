import { expect, test } from "@playwright/test";

for (const viewport of [
  { width: 1440, height: 1000 },
  { width: 390, height: 844 },
]) {
  test(`visual source workspace has one selected mode and shared zoom at ${viewport.width}px`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.goto("/editor?template=react-cobalt");
    const region = page.getByRole("region", {
      name: "Source canvas",
      exact: true,
    });
    await expect(region).toBeVisible();
    const iframe = region.locator('iframe[title="React resume preview"]');
    await expect(
      page
        .frameLocator('iframe[title="React resume preview"]')
        .getByRole("heading", {
          name: "Alex Morgan",
          exact: true,
        }),
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
      page.getByRole("button", { name: "Select tool", exact: true }),
    ).toHaveCount(0);
    await expect
      .poll(async () => {
        const bounds = await region.boundingBox();
        const paper = await iframe.boundingBox();
        return (
          !!bounds &&
          !!paper &&
          paper.x >= bounds.x - 1 &&
          paper.x + paper.width <= bounds.x + bounds.width + 1 &&
          paper.y >= bounds.y - 1 &&
          paper.y + paper.height <= bounds.y + bounds.height + 1
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
      .poll(async () => (await iframe.boundingBox())?.height)
      .toBe(1123);
    await page.getByRole("button", { name: "Zoom out", exact: true }).click();
    await expect(zoom).toHaveValue("90");
    await expect
      .poll(async () => (await iframe.boundingBox())?.height ?? 1123)
      .toBeLessThan(1123);
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
      .poll(async () => (await iframe.boundingBox())?.height ?? 0)
      .toBeGreaterThan(1123 * 0.9);
    await zoom.fill("60");
    await expect
      .poll(async () =>
        Math.abs(((await iframe.boundingBox())?.height ?? 0) - 1123 * 0.6),
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
        Math.abs(((await iframe.boundingBox())?.height ?? 0) - 1123 * 0.6),
      )
      .toBeLessThan(1);
    await visual.click();
    await expect(
      page.getByRole("article", { name: "Text workspace", exact: true }),
    ).toBeVisible();
    await expect(text).toHaveAttribute("aria-pressed", "true");
    await expect(visual).toHaveAttribute("aria-pressed", "false");
    await page.getByRole("button", { name: "Undo", exact: true }).click();
    await expect(region).toBeVisible();
    await expect(visual).toHaveAttribute("aria-pressed", "true");
    await expect(text).toHaveAttribute("aria-pressed", "false");
    await expect(zoom).toHaveValue("60");
    await expect
      .poll(async () =>
        Math.abs(((await iframe.boundingBox())?.height ?? 0) - 1123 * 0.6),
      )
      .toBeLessThan(1);
    await page.screenshot({
      path: `artifacts/visual/source-workspace-restored-${viewport.width}.png`,
    });
  });
}
