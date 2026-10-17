import { expect, test } from "@playwright/test";

for (const viewport of [
  { width: 1440, height: 1000 },
  { width: 390, height: 844 },
]) {
  test(`dashboard and templates share persistent navigation at ${viewport.width}px`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.setViewportSize(viewport);
    await page.goto("/editor");
    await expect(
      page.getByRole("article", { name: "Resume canvas" }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Back to projects", exact: true })
      .click();
    await expect(
      page.getByRole("link", {
        name: "Open Alex Morgan — Resume",
        exact: true,
      }),
    ).toBeVisible();
    const navigation = page.getByRole("navigation", {
      name: "Workspace navigation",
    });
    const handle = await navigation.elementHandle();
    expect(handle).toBeTruthy();
    const sort = page.getByRole("combobox", {
      name: "Sort resumes",
      exact: true,
    });
    const alignment = await sort.evaluate((node) => {
      const box = node.getBoundingClientRect();
      const text = node.querySelector('[data-slot="select-value"]')!;
      const range = document.createRange();
      range.selectNodeContents(text);
      const bounds = range.getBoundingClientRect();
      return {
        x: Math.abs(box.x + box.width / 2 - bounds.x - bounds.width / 2),
        y: Math.abs(box.y + box.height / 2 - bounds.y - bounds.height / 2),
      };
    });
    expect(alignment.x).toBeLessThan(2);
    expect(alignment.y).toBeLessThan(3);
    await navigation
      .getByRole("link", { name: "Templates", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: "Templates", exact: true }),
    ).toBeVisible();
    expect(await handle!.evaluate((node) => node.isConnected)).toBe(true);
    await expect(
      navigation.getByRole("link", { name: "Templates", exact: true }),
    ).toHaveAttribute("aria-current", "page");
    await navigation.getByRole("link", { name: /^Resumes/ }).click();
    await expect(
      page.getByRole("link", {
        name: "Open Alex Morgan — Resume",
        exact: true,
      }),
    ).toBeVisible();
    expect(await handle!.evaluate((node) => node.isConnected)).toBe(true);
    const settings = page.getByRole("button", {
      name: "Settings",
      exact: true,
    });
    const settingsBox = await settings.boundingBox();
    if (viewport.width > 760) {
      const row = await navigation
        .getByRole("link", { name: /^Resumes/ })
        .boundingBox();
      expect(settingsBox!.width).toBeCloseTo(row!.width, 0);
      await expect(settings).toHaveText("Settings");
    } else {
      expect(settingsBox!.width).toBeLessThanOrEqual(40);
      await expect(settings).toHaveText("");
    }
    expect(settingsBox!.height).toBeGreaterThanOrEqual(32);
    await settings.click();
    await expect(
      page.getByRole("button", { name: "System", exact: true }),
    ).toBeVisible();
    await page.keyboard.press("Escape");
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBe(viewport.width);
    expect(errors).toEqual([]);
  });
}
