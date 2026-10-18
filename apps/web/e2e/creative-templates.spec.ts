import { test, expect } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { createResume } from "@resumi/cv";
import { applyCommand } from "@resumi/engine";
import { makeReactSource } from "../../../packages/cv/src/source/starter";
import { renderSourceHtml } from "../../../packages/cv/src/source/render";
import { creativeLayoutNames } from "../../../packages/cv/src/templates/types";

for (const layout of creativeLayoutNames) {
  test(`visual creative ${layout} executes edited TSX offline and prints one A4 page`, async ({
    page,
  }) => {
    const errors: string[] = [];
    const requests: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.route("**/*", (route) => {
      requests.push(route.request().url());
      return route.abort();
    });
    const resumeDocument = createResume(
      `creative-${layout}`,
      `react-${layout}`,
    );
    const changed = applyCommand(resumeDocument, {
      type: "block.update",
      id: "identity-0",
      patch: { text: "Jordan Avery" },
    });
    const html = renderSourceHtml({
      format: "react",
      code: makeReactSource(changed),
    });
    await page.setViewportSize({ width: 830, height: 1160 });
    await page.setContent(
      '<iframe title="Offline resume" sandbox="allow-scripts" style="width:794px;height:1123px;border:0"></iframe>',
    );
    await page.locator("iframe").evaluate((node, source) => {
      (node as HTMLIFrameElement).srcdoc = source;
    }, html);
    const frame = page.frameLocator("iframe");
    const sheet = frame.getByRole("article", { name: "Resume", exact: true });
    await expect(sheet).toHaveAttribute("data-template-layout", layout);
    await expect(
      frame.getByRole("heading", { name: "Jordan Avery", exact: true }),
    ).toBeVisible();
    const geometry = await sheet.evaluate(async (node) => {
      await document.fonts.load("14px ResumeInter");
      await document.fonts.ready;
      const rect = node.getBoundingClientRect();
      const overflow = Array.from(
        node.querySelectorAll("h1,h2,h3,p,li,address"),
      ).flatMap((element) => {
        if (!element.getClientRects().length) return [];
        const bounds = element.getBoundingClientRect();
        return bounds.left < rect.left - 1 ||
          bounds.right > rect.right + 1 ||
          bounds.bottom > rect.bottom + 1
          ? [element.textContent]
          : [];
      });
      return {
        width: node.clientWidth,
        height: node.clientHeight,
        scrollWidth: node.scrollWidth,
        scrollHeight: node.scrollHeight,
        overflow,
        fontsReady: document.fonts.check("14px ResumeInter"),
      };
    });
    expect(geometry).toEqual({
      width: 794,
      height: 1123,
      scrollWidth: 794,
      scrollHeight: 1123,
      overflow: [],
      fontsReady: true,
    });
    await mkdir("artifacts/visual", { recursive: true });
    await sheet.screenshot({
      path: `artifacts/visual/template-${layout}-offline.png`,
    });
    // The real portable page executes arbitrary authored TSX without the app or network.
    await page.unroute("**/*");
    await page.setContent(html);
    await expect(
      page.getByRole("heading", { name: "Jordan Avery", exact: true }),
    ).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    await page.emulateMedia({ media: "print" });
    const pdf = await page.pdf({
      preferCSSPageSize: true,
      printBackground: true,
    });
    expect(pdf.toString("latin1").match(/\/Type \/Page\b/g)).toHaveLength(1);
    await mkdir("output/pdf", { recursive: true });
    await writeFile(`output/pdf/creative-${layout}.pdf`, pdf);
    expect(requests).toEqual([]);
    expect(errors).toEqual([]);
  });
}

test("creative collection shares real previews and opens the chosen template in the editor", async ({
  page,
}) => {
  await page.goto("/templates");
  await expect(page.locator("[data-template-card]")).toHaveCount(40);
  for (const layout of creativeLayoutNames) {
    const card = page.locator(`[data-template-card="react-${layout}"]`);
    await card.scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        card
          .locator("img")
          .evaluate((image) => (image as HTMLImageElement).naturalWidth),
      )
      .toBe(440);
  }
  await page
    .getByRole("searchbox", { name: "Search templates", exact: true })
    .fill("Arcade");
  await page.getByRole("link", { name: "Use Arcade", exact: true }).click();
  const canvas = page.getByRole("article", {
    name: "Resume canvas",
    exact: true,
  });
  await expect(canvas).toBeVisible();
  await expect(canvas.locator("svg rect")).not.toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Select", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Text", exact: true }).click();
  await expect(
    page
      .getByRole("article", { name: "Text workspace", exact: true })
      .getByRole("textbox")
      .first(),
  ).toBeVisible();
});
