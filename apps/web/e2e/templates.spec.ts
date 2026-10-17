import { test, expect } from "@playwright/test";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { openSource } from "./helpers/editor";
import { createResume } from "@resumi/cv";
import { renderSourceHtml } from "../../../packages/cv/src/source/render";

test("six new TSX templates execute offline with embedded fonts, portrait and original-color tools", async ({
  page,
}) => {
  const errors: string[] = [];
  const requests: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route("**/*", (route) => {
    requests.push(route.request().url());
    return route.abort();
  });
  await page.setContent(
    '<iframe title="Offline resume" sandbox="allow-scripts" style="width:794px;height:1123px;border:0"></iframe>',
  );
  for (const layout of [
    "harvard",
    "cobalt",
    "atelier",
    "timeline",
    "consultant",
    "mosaic",
  ]) {
    const resumeDocument = createResume(`offline-${layout}`, `react-${layout}`);
    const html = renderSourceHtml(resumeDocument.source!);
    await page.locator("iframe").evaluate((node, source) => {
      (node as HTMLIFrameElement).srcdoc = source;
    }, html);
    const frame = page.frameLocator("iframe");
    const sheet = frame.getByRole("article", { name: "Resume", exact: true });
    await expect(sheet).toHaveAttribute("data-template-layout", layout);
    const assets = await sheet.evaluate(async (node) => {
      await document.fonts.load("14px ResumeInter");
      await document.fonts.ready;
      const photos = Array.from(node.querySelectorAll("img"));
      await Promise.all(photos.map((photo) => photo.decode()));
      return {
        fontsReady: document.fonts.check("14px ResumeInter"),
        photosReady: photos.every((photo) => photo.naturalWidth === 512),
        width: node.clientWidth,
        height: node.clientHeight,
      };
    });
    expect(assets).toEqual({
      fontsReady: true,
      photosReady: true,
      width: 794,
      height: 1123,
    });
    await expect(
      frame.getByRole("heading", { name: "Alex Morgan", exact: true }),
    ).toBeVisible();
    if (["cobalt", "atelier", "mosaic"].includes(layout)) {
      await expect(frame.getByLabel("Tools")).toContainText("Figma");
      await expect(frame.locator('.cv-tools path[fill="#0acf83"]')).toHaveCount(
        1,
      );
    }
    if (layout === "atelier") await expect(frame.locator("img")).toHaveCount(1);
    await page.emulateMedia({ media: "print" });
    const printSize = await sheet.evaluate((node) => ({
      width: node.clientWidth,
      height: node.clientHeight,
      scrollWidth: node.scrollWidth,
      scrollHeight: node.scrollHeight,
    }));
    expect(printSize.width).toBe(794);
    expect(printSize.height).toBeLessThanOrEqual(1123);
    expect(printSize.scrollWidth).toBeLessThanOrEqual(795);
    expect(printSize.scrollHeight).toBeLessThanOrEqual(1124);
    await page.emulateMedia({ media: "screen" });
    await mkdir("artifacts/rendered", { recursive: true });
    await writeFile(`artifacts/rendered/${layout}-offline.html`, html);
  }
  expect(requests).toEqual([]);
  expect(errors).toEqual([]);
});

test("visual React collection renders ten distinct professional A4 layouts without clipping", async ({
  page,
}) => {
  test.setTimeout(150000);
  await page.setViewportSize({ width: 1440, height: 1440 });
  await mkdir("artifacts/visual", { recursive: true });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const layout of [
    "classic",
    "editorial",
    "studio",
    "profile",
    "harvard",
    "cobalt",
    "atelier",
    "timeline",
    "consultant",
    "mosaic",
  ]) {
    await page.goto(`/editor?template=react-${layout}`);
    await expect(
      page.getByRole("region", { name: "Source canvas" }),
    ).toBeVisible();
    const frame = page.frameLocator('iframe[title="React resume preview"]');
    const sheet = frame.getByRole("article", { name: "Resume", exact: true });
    await expect(sheet).toHaveAttribute("data-template-layout", layout);
    await expect(
      frame.getByRole("heading", { name: "Alex Morgan", exact: true }),
    ).toBeVisible();
    const dimensions = await sheet.evaluate(async (node) => {
      await document.fonts.ready;
      const images = Array.from(node.querySelectorAll("img"));
      await Promise.all(images.map((image) => image.decode()));
      return {
        width: node.clientWidth,
        height: node.clientHeight,
        scrollWidth: node.scrollWidth,
        scrollHeight: node.scrollHeight,
        imagesReady: images.every((image) => image.naturalWidth > 0),
      };
    });
    expect(dimensions.width).toBe(794);
    expect(dimensions.height).toBe(1123);
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(795);
    expect(dimensions.scrollHeight).toBeLessThanOrEqual(1124);
    expect(dimensions.imagesReady).toBe(true);
    const textBounds = await sheet.evaluate((node) => {
      const bounds = node.getBoundingClientRect();
      return Array.from(
        node.querySelectorAll("h1,h2,h3,p,li,address,.cv-tool"),
      ).flatMap((element) => {
        const style = getComputedStyle(element);
        if (style.display === "none" || element.getClientRects().length === 0)
          return [];
        const rect = element.getBoundingClientRect();
        return rect.left < bounds.left - 1 ||
          rect.right > bounds.right + 1 ||
          rect.bottom > bounds.bottom + 1
          ? [element.textContent]
          : [];
      });
    });
    expect(textBounds, `${layout} text stays within A4`).toEqual([]);
    await sheet.screenshot({ path: `artifacts/visual/template-${layout}.png` });
  }
  expect(errors).toEqual([]);
});

test("portrait template preserves its photo and icons in saved editable TSX and offline export", async ({
  page,
  context,
}) => {
  await page.goto("/templates");
  await page
    .getByRole("searchbox", { name: "Search templates", exact: true })
    .fill("Profile");
  const choose = page.getByRole("link", { name: "Use Profile", exact: true });
  await expect(choose).toHaveCount(1);
  await choose.hover();
  await page
    .getByRole("button", { name: "Preview Profile", exact: true })
    .click();
  const preview = page.getByRole("dialog", { name: "Profile", exact: true });
  await expect(preview).toBeVisible();
  await expect
    .poll(() =>
      preview
        .locator("img")
        .evaluate((image) => (image as HTMLImageElement).naturalWidth),
    )
    .toBe(512);
  await preview.getByRole("link", { name: "Use Profile", exact: true }).click();
  const region = page.getByRole("region", { name: "Source canvas" });
  const frame = region.frameLocator('iframe[title="React resume preview"]');
  const portrait = frame.locator("img");
  await expect(portrait).toHaveAttribute("src", /^data:image\/jpeg;base64,/);
  await expect
    .poll(() =>
      portrait.evaluate((image) => (image as HTMLImageElement).naturalWidth),
    )
    .toBe(512);
  expect(await frame.locator("svg").count()).toBeGreaterThanOrEqual(3);
  await expect(
    page.getByRole("status", { name: "Save status", exact: true }),
  ).toHaveText("Saved");
  await page.reload();
  await expect(portrait).toHaveAttribute("src", /^data:image\/jpeg;base64,/);
  await openSource(page);
  const source = page.getByRole("textbox", {
    name: "React resume source",
    exact: true,
  });
  await expect(source).toHaveValue(/export default function Resume/);
  await expect(source).toHaveValue(/data:image\/jpeg;base64,/);
  const downloadPromise = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Export portable HTML", exact: true })
    .click();
  const download = await downloadPromise;
  const html = await readFile((await download.path())!, "utf8");
  const offline = await context.newPage();
  await offline.route("**/*", (route) => route.abort());
  await offline.setContent(
    '<iframe title="Offline resume" sandbox="allow-scripts" style="width:830px;height:1160px;border:0"></iframe>',
  );
  await offline.locator("iframe").evaluate((node, source) => {
    (node as HTMLIFrameElement).srcdoc = source;
  }, html);
  const exported = offline.frameLocator("iframe");
  await expect(
    exported.getByRole("heading", { name: "Alex Morgan", exact: true }),
  ).toBeVisible();
  await expect
    .poll(() =>
      exported
        .locator("img")
        .evaluate((image) => (image as HTMLImageElement).naturalWidth),
    )
    .toBe(512);
  expect(await exported.locator("svg").count()).toBeGreaterThanOrEqual(3);
  await mkdir("artifacts/rendered", { recursive: true });
  await writeFile("artifacts/rendered/profile-offline.html", html);
  await offline.screenshot({
    path: "artifacts/visual/template-profile-offline.png",
    fullPage: true,
  });
  await offline.close();
});
