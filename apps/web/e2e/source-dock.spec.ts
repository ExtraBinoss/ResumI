import { expect, test } from "@playwright/test";

for (const width of [1440, 390]) {
  test(`visual: React templates open with native tools and human Text mode at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/editor?template=react-cobalt");
    const canvas = page.getByRole("article", {
      name: "Resume canvas",
      exact: true,
    });
    await expect(canvas).toBeVisible();
    for (const name of [
      "Select",
      "Text tool",
      "Add image",
      "Shapes",
      "Icons",
    ]) {
      const tool = page.getByRole("button", { name, exact: true });
      await expect(tool).toBeVisible();
      await expect(tool).toBeInViewport();
    }
    await expect(
      page.getByRole("button", { name: "Edit source", exact: true }),
    ).toHaveCount(0);
    await expect(canvas.locator("iframe")).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "Undo", exact: true }),
    ).toBeDisabled();
    await page.keyboard.press("Control+Shift+E");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    const modes = page.getByRole("group", {
      name: "Editing mode",
      exact: true,
    });
    await modes.getByRole("button", { name: "Text", exact: true }).click();
    const workspace = page.getByRole("article", {
      name: "Text workspace",
      exact: true,
    });
    await expect(workspace).toBeVisible();
    await expect(
      workspace.getByRole("textbox").filter({ hasText: "Alex Morgan" }).first(),
    ).toBeVisible();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await modes.getByRole("button", { name: "Visual", exact: true }).click();
    await expect(canvas).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Select", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Undo", exact: true }),
    ).toBeDisabled();
    await page.screenshot({
      path: `artifacts/visual/source-dock-${width}.png`,
      animations: "disabled",
    });
    await expect(
      page.getByRole("status", { name: "Save status", exact: true }),
    ).toHaveText("Saved");
    await page.reload();
    await expect(canvas).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Select", exact: true }),
    ).toBeVisible();
    await expect(
      canvas.getByRole("heading", { name: "Alex Morgan", exact: true }),
    ).toBeVisible();
  });
}
