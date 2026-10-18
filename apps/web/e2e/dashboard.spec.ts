import { expect, test } from "@playwright/test";

for (const viewport of [
  { width: 1440, height: 1000 },
  { width: 390, height: 844 },
  { width: 320, height: 740 },
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
    await expect(page).toHaveURL(/\/editor\/[^/?#]+$/);
    const projectUrl = page.url();
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
      const icon = node.querySelector("svg")!.getBoundingClientRect();
      const left = Math.min(bounds.left, icon.left);
      const right = Math.max(bounds.right, icon.right);
      return {
        x: Math.abs(box.x + box.width / 2 - left - (right - left) / 2),
        y: Math.abs(box.y + box.height / 2 - bounds.y - bounds.height / 2),
        gap: icon.left - bounds.right,
      };
    });
    expect(alignment.x).toBeLessThan(2);
    expect(alignment.y).toBeLessThan(3);
    expect(alignment.gap).toBeGreaterThanOrEqual(7.5);
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
    await navigation
      .getByRole("link", { name: "My Resumes", exact: true })
      .click();
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
    await expect(page.getByRole("complementary")).toHaveCount(0);
    await expect(navigation.getByRole("link")).toHaveCount(2);
    const navBox = (await navigation.boundingBox())!;
    const recents = page.getByRole("button", {
      name: "Recent projects",
      exact: true,
    });
    if (viewport.width > 760) {
      expect(
        Math.abs(navBox.x + navBox.width / 2 - viewport.width / 2),
      ).toBeLessThan(1);
      expect(viewport.width - settingsBox!.x - settingsBox!.width).toBe(18);
      expect(viewport.height - settingsBox!.y - settingsBox!.height).toBe(18);
    } else {
      const recentBox = (await recents.boundingBox())!;
      expect(viewport.height - navBox.y - navBox.height).toBe(12);
      expect(navBox.x).toBe(12);
      expect(recentBox.y).toBe(navBox.y);
      expect(settingsBox!.y).toBe(navBox.y);
      expect(recentBox.x - navBox.x - navBox.width).toBe(6);
      expect(settingsBox!.x - recentBox.x - recentBox.width).toBe(6);
      expect(viewport.width - settingsBox!.x - settingsBox!.width).toBe(12);
      expect(navBox.height).toBe(44);
      const material = await page
        .locator("[data-library-controls]")
        .evaluate((node) => ({
          width: node.getBoundingClientRect().width,
          bottom: node.getBoundingClientRect().bottom,
          blur: getComputedStyle(node).backdropFilter,
          background: getComputedStyle(node).backgroundColor,
        }));
      expect(material.width).toBe(viewport.width);
      expect(material.bottom).toBe(viewport.height);
      expect(material.blur).toContain("blur(24px)");
      expect(material.background).not.toBe("rgba(0, 0, 0, 0)");
    }
    expect(settingsBox!.width).toBe(viewport.width > 760 ? 36 : 44);
    await expect(settings).toHaveText("");
    expect(settingsBox!.height).toBeGreaterThanOrEqual(32);
    await settings.click();
    await expect(
      page.getByRole("button", { name: "System", exact: true }),
    ).toBeVisible();
    await page.keyboard.press("Escape");
    await recents.click();
    const recent = page.getByRole("menuitem", {
      name: "Recent: Alex Morgan — Resume",
      exact: true,
    });
    await expect(recent).toHaveAttribute("href", new URL(projectUrl).pathname);
    await expect(recent.locator("time")).toHaveAttribute(
      "datetime",
      /\d{4}-\d{2}-\d{2}T/,
    );
    if (viewport.width <= 760) {
      await expect
        .poll(async () => {
          const menuBox = (await page
            .getByRole("menu", { name: "Recent projects", exact: true })
            .boundingBox())!;
          return menuBox.y + menuBox.height;
        })
        .toBeLessThan(navBox.y);
    }
    await page.keyboard.type("Alex");
    await expect(
      page.getByRole("searchbox", { name: "Search resumes", exact: true }),
    ).toHaveValue("");
    await page.keyboard.press("Escape");
    await expect(recents).toBeFocused();
    await recents.press("ArrowDown");
    await expect(recent).toBeFocused();
    await recent.press("Enter");
    await expect(page).toHaveURL(projectUrl);
    await expect(
      page.getByRole("article", { name: "Resume canvas", exact: true }),
    ).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBe(viewport.width);
    expect(errors).toEqual([]);
  });
}
