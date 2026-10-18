import { expect, test } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { createResume, templates } from "../../../packages/cv/src/index";
const publicTemplateCount = templates.filter(
  (template) => !template.legacy,
).length;

test("visual library preserves search identity and queries while results move without scaling text", async ({
  page,
}) => {
  await page.goto("/projects");
  await expect(
    page.getByRole("heading", { name: "No resumes yet", exact: true }),
  ).toBeVisible();
  const search = page.getByRole("searchbox");
  const original = await search.elementHandle();
  await expect(
    page.getByRole("button", { name: "Import", exact: true }),
  ).toHaveCount(0);
  await search.fill("Alex");
  await page.locator('nav a[href="/templates"]').click();
  await expect(page.locator("[data-template-card]")).toHaveCount(
    publicTemplateCount,
  );
  expect(await original!.evaluate((node) => node.isConnected)).toBe(true);
  await expect(search).toHaveValue("");
  const field = await search.evaluate((node) => ({
    background: getComputedStyle(node).backgroundColor,
    border: getComputedStyle(node).borderTopWidth,
    opacity: getComputedStyle(node).opacity,
  }));
  expect(field.background).not.toBe("rgba(0, 0, 0, 0)");
  expect(field.border).toBe("1px");
  expect(field.opacity).toBe("1");
  await search.fill("Studio");
  await expect(page.locator("[data-template-card]")).toHaveCount(1);
  await expect(
    page.getByRole("button", { name: "Preview Studio", exact: true }),
  ).toHaveCSS("color", "rgb(29, 29, 31)");
  await page.locator('nav a[href="/projects"]').click();
  await expect(search).toHaveValue("Alex");
  expect(await original!.evaluate((node) => node.isConnected)).toBe(true);
  await search.fill("");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('nav a[href="/templates"]').hover();
  const observation = page.evaluate(async () => {
    await document.fonts.ready;
    const field = document.querySelector<HTMLInputElement>(
      'input[type="search"]',
    )!;
    const results = document.querySelector<HTMLElement>(
      "[data-library-results]",
    )!;
    const samples: {
      y: number;
      scaleX: number;
      scaleY: number;
      searchX: number;
      searchY: number;
      connected: boolean;
    }[] = [];
    const start = performance.now();
    await new Promise<void>((resolve) => {
      function frame(now: number) {
        const matrix = new DOMMatrixReadOnly(
          getComputedStyle(results).transform,
        );
        const box = field.getBoundingClientRect();
        samples.push({
          y: results.getBoundingClientRect().y,
          scaleX: matrix.a,
          scaleY: matrix.d,
          searchX: box.x,
          searchY: box.y,
          connected: field.isConnected,
        });
        if (now - start < 650) requestAnimationFrame(frame);
        else resolve();
      }
      requestAnimationFrame(frame);
    });
    return samples;
  });
  await page.locator('nav a[href="/templates"]').click();
  await expect(search).toHaveValue("Studio");
  const samples = await observation;
  expect(samples.length).toBeGreaterThan(2);
  expect(
    samples.every(
      (sample) =>
        sample.connected && sample.scaleX === 1 && sample.scaleY === 1,
    ),
  ).toBe(true);
  expect(
    new Set(samples.map((sample) => `${sample.searchX}:${sample.searchY}`))
      .size,
  ).toBe(1);
  expect(
    new Set(samples.map((sample) => Math.round(sample.y * 10))).size,
  ).toBeGreaterThan(2);
  await expect(page.locator("[data-template-card]")).toHaveCount(1);
  await page
    .locator("[data-template-card] img")
    .first()
    .evaluate((image: HTMLImageElement) => image.decode());
  await mkdir("artifacts/performance", { recursive: true });
  await mkdir("artifacts/visual", { recursive: true });
  await writeFile(
    "artifacts/performance/library-content-motion.json",
    JSON.stringify(samples, null, 2) + "\n",
  );
  await page.screenshot({
    path: "artifacts/visual/library-overlay-mobile.png",
  });
  await page.locator('nav a[href="/projects"]').click();
  await expect(
    page.getByRole("heading", { name: "No resumes yet", exact: true }),
  ).toBeVisible();
  const pending = page.waitForEvent("filechooser");
  await page.keyboard.press("Control+o");
  await (
    await pending
  ).setFiles({
    name: "synthetic-resume.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(createResume("keyboard-open"))),
  });
  await expect(
    page.getByRole("article", { name: "Resume canvas", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Back to projects", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: /^Preview Alex Morgan/ }),
  ).toHaveCSS("color", "rgb(29, 29, 31)");
});
