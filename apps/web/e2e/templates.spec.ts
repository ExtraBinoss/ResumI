import { test, expect } from "@playwright/test";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { openSource } from "./helpers/editor";

test("React collection renders four distinct professional A4 layouts without clipping", async ({
  page,
}) => {
  test.setTimeout(80000);
  await page.setViewportSize({ width: 1440, height: 1440 });
  await mkdir("artifacts/visual", { recursive: true });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const layout of ["classic", "editorial", "studio", "profile"]) {
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
    if (layout === "classic") {
      const region = page.getByRole("region", { name: "Source canvas" });
      const iframe = region.locator('iframe[title="React resume preview"]');
      const controls = page.getByRole("group", { name: "Source preview zoom" });
      for (const size of [
        { width: 1440, height: 1000 },
        { width: 390, height: 844 },
      ]) {
        await page.setViewportSize(size);
        await expect
          .poll(async () => {
            const bounds = await region.boundingBox();
            const paper = await iframe.boundingBox();
            return (
              !!bounds &&
              !!paper &&
              paper.x >= bounds.x &&
              paper.x + paper.width <= bounds.x + bounds.width + 1 &&
              paper.y + paper.height <= bounds.y + bounds.height + 1
            );
          })
          .toBe(true);
      }
      const fittedHeight = (await iframe.boundingBox())!.height;
      await controls
        .getByRole("button", { name: "Zoom source preview out", exact: true })
        .click();
      await expect
        .poll(async () => (await iframe.boundingBox())?.height ?? fittedHeight)
        .toBeLessThan(fittedHeight);
      await controls
        .getByRole("button", { name: "Fit page", exact: true })
        .click();
      await expect
        .poll(async () =>
          Math.abs(((await iframe.boundingBox())?.height ?? 0) - fittedHeight),
        )
        .toBeLessThan(1);
      await page.setViewportSize({ width: 1440, height: 1000 });
      await controls.getByRole("button", { name: "100%", exact: true }).click();
      await expect
        .poll(async () => (await iframe.boundingBox())?.height)
        .toBe(1123);
      await controls
        .getByRole("button", { name: "Fit page", exact: true })
        .click();
      await expect
        .poll(async () => (await iframe.boundingBox())?.height ?? 1123)
        .toBeLessThan(900);
      await page.setViewportSize({ width: 1440, height: 1440 });
    }
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
    .getByRole("textbox", { name: "Search templates", exact: true })
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
