import { test, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { createResume } from "@resumi/cv/sample";
import { renderHtml } from "@resumi/cv/renderer";
test("portable HTML renders the same synthetic CV independently of the application", async ({
  page,
}) => {
  const html = renderHtml(createResume("portable-render-test"));
  expect(html).not.toContain("<script");
  await page.setContent(html);
  await expect(
    page.getByRole("heading", { name: "Alex Morgan", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".resume")).toHaveCSS("width", "794px");
  await expect(page.locator(".resume")).toHaveCSS("--resume-accent", "#2563eb");
  expect(await page.locator("[data-block-id]").count()).toBe(14);
  await mkdir("artifacts/visual", { recursive: true });
  await page.screenshot({
    path: "artifacts/visual/portable-resume.png",
    fullPage: true,
  });
});
