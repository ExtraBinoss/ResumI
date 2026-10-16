import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
test("portable CLI HTML renders the same synthetic CV independently of the application", async ({
  page,
}) => {
  const html = await readFile("artifacts/rendered/resume.html", "utf8");
  expect(html).not.toContain("<script");
  await page.setContent(html);
  await expect(
    page.getByRole("heading", { name: "Alex Morgan", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".resume")).toHaveCSS("width", "794px");
  await expect(page.locator(".resume")).toHaveCSS("--resume-accent", "#2563eb");
  expect(await page.locator("[data-block-id]").count()).toBe(14);
  await page.screenshot({
    path: "artifacts/visual/portable-resume.png",
    fullPage: true,
  });
});
