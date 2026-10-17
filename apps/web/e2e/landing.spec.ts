import { test, expect } from "@playwright/test";

test("landing showcase and writing tabs work with reduced motion and hydrate cleanly", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (
      message.type() === "error" &&
      /hydration|hydrated|didn.t match|server rendered/i.test(message.text())
    )
      errors.push(message.text());
  });
  await page.goto("/");
  const choices = page.getByRole("group", { name: "Featured templates" });
  await choices.getByRole("button", { name: "Classic", exact: true }).click();
  await expect(
    choices.getByRole("button", { name: "Classic", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  const useTemplate = page.getByRole("link", {
    name: "Use Classic",
    exact: true,
  });
  await expect(useTemplate).toHaveAttribute(
    "href",
    "/editor?template=react-classic",
  );
  await page.getByRole("tab", { name: "Text", exact: true }).click();
  await expect(
    page.getByRole("article", { name: "Resume text preview" }),
  ).toBeVisible();
  await page.getByRole("tab", { name: "Visual", exact: true }).click();
  await expect(
    page.getByRole("tab", { name: "Visual", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    390,
  );
  await useTemplate.click();
  await expect(
    page.getByRole("region", { name: "Source canvas" }),
  ).toBeVisible();
  await expect(
    page
      .frameLocator('iframe[title="React resume preview"]')
      .locator('[data-template-layout="classic"]'),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
