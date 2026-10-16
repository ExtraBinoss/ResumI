import { test, expect } from "@playwright/test";

for (const viewport of [
  { width: 1440, height: 1000 },
  { width: 390, height: 844 },
]) {
  test(`SSR document hydration replaces the loading screen at ${viewport.width}px after direct open and reload`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    await page.setViewportSize(viewport);
    await page.goto("/editor");
    for (const reload of [false, true]) {
      if (reload) await page.reload();
      await expect(
        page.getByRole("article", { name: "Resume canvas", exact: true }),
      ).toBeVisible();
      await expect(
        page.getByRole("heading", {
          name: "Opening your resume…",
          exact: true,
        }),
      ).toHaveCount(0);
      await expect(page.getByRole("main")).toHaveCount(1);
      await expect(page.locator("#app > main")).toHaveCount(1);
      await expect
        .poll(() =>
          page.evaluate(() => ({
            height: document.documentElement.scrollHeight,
            viewport: window.innerHeight,
            top: document.querySelector("#app > main")?.getBoundingClientRect()
              .top,
          })),
        )
        .toEqual({
          height: viewport.height,
          viewport: viewport.height,
          top: 0,
        });
      expect(
        errors,
        "Document hydration must not recover from an SSR mismatch",
      ).toEqual([]);
    }
  });
}
