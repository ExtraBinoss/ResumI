import { expect, test } from "@playwright/test";

test("library intent prepares the catalog with shared font assets and one preview stylesheet", async ({
  page,
  request,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/projects");
  const header = page.locator("[data-library-header]");
  const originalHeader = await header.elementHandle();
  const originalStyles = await page
    .locator("style[data-template-preview-styles]")
    .elementHandle();
  const templates = header.locator('nav a[href="/templates"]');
  const preparation = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname === "/templates.data" && response.ok(),
  );
  await templates.hover();
  await preparation;
  const response = await request.get("/templates.data");
  expect(response.ok()).toBe(true);
  const body = await response.text();
  expect(body).not.toContain("data:font/woff2;base64");
  expect(body).not.toContain("data:image/jpeg;base64");
  await templates.click();
  await expect(
    page.getByRole("heading", { name: "Templates", exact: true }),
  ).toBeVisible();
  await expect(page.locator("style[data-template-preview-styles]")).toHaveCount(
    1,
  );
  await expect(page.locator("[data-template-card] img")).toHaveCount(10);
  const imageUrls = await page
    .locator("[data-template-card] img")
    .evaluateAll((images) =>
      images.map((image) => (image as HTMLImageElement).src),
    );
  for (const url of imageUrls) {
    const image = await request.get(url);
    expect(image.status()).toBe(200);
    expect((await image.body()).subarray(8, 12).toString()).toBe("WEBP");
  }
  await expect(page.locator("[data-template-card] .cv-sheet")).toHaveCount(0);
  await page.locator("[data-template-card] img").evaluateAll(async (images) => {
    await Promise.all(
      images
        .filter((image) => {
          const box = image.getBoundingClientRect();
          return box.top < innerHeight && box.bottom > 0;
        })
        .map((image) => (image as HTMLImageElement).decode()),
    );
  });
  expect(await page.locator("main style").allTextContents()).not.toContainEqual(
    expect.stringContaining("@font-face"),
  );
  const fontFaces = await page
    .locator("style[data-template-preview-styles]")
    .textContent();
  expect(fontFaces?.match(/font-family:ResumeInter;/g)).toHaveLength(1);
  const fontUrl = fontFaces!.match(
    /@font-face\{font-family:ResumeInter;src:url\('([^']+)'\)/,
  )![1];
  const font = await request.get(fontUrl);
  expect(font.status()).toBe(200);
  expect((await font.body()).subarray(0, 4).toString()).toBe("wOF2");
  await page
    .getByRole("button", { name: "Preview Studio", exact: true })
    .click();
  await expect(
    page
      .getByRole("dialog", { name: "Studio", exact: true })
      .locator(".cv-sheet"),
  ).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  expect(
    await page.evaluate(() => document.fonts.check("13px ResumeInter")),
  ).toBe(true);
  await page.keyboard.press("Escape");
  await page
    .getByRole("button", { name: "Preview Profile", exact: true })
    .click();
  const portrait = page
    .getByRole("dialog", { name: "Profile", exact: true })
    .locator(".cv-portrait");
  await expect(portrait).toBeVisible();
  const portraitUrl = await portrait.evaluate(
    async (image: HTMLImageElement) => {
      await image.decode();
      return image.src;
    },
  );
  expect((await request.get(portraitUrl)).status()).toBe(200);
  await page.keyboard.press("Escape");
  await header.locator('nav a[href="/projects"]').click();
  await expect(
    page.getByRole("heading", { name: "Your resumes", exact: true }),
  ).toBeVisible();
  expect(await originalHeader?.evaluate((element) => element.isConnected)).toBe(
    true,
  );
  await expect(page.locator("style[data-template-preview-styles]")).toHaveCount(
    1,
  );
  expect(await originalStyles?.evaluate((element) => element.isConnected)).toBe(
    true,
  );
  expect(errors).toEqual([]);
});

test("mobile catalog retains its card geometry while skipped previews enter the viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/templates");
  await expect(page.locator("[data-template-card]").first()).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  const geometry = await page.evaluate(async () => {
    const cards = [
      ...document.querySelectorAll<HTMLElement>("[data-template-card]"),
    ];
    const viewport = cards[0].closest<HTMLElement>(
      '[data-slot="scroll-shadow-viewport"]',
    )!;
    const frame = () => new Promise(requestAnimationFrame);
    const initial = cards.map((card) => ({
      top: card.offsetTop,
      height: card.getBoundingClientRect().height,
    }));
    const scrollHeight = viewport.scrollHeight;
    const samples: {
      height: number;
      positions: number[];
      scrollHeight: number;
    }[] = [];
    for (let scroll = 0; scroll < scrollHeight; scroll += 600) {
      viewport.scrollTop = scroll;
      await frame();
      await frame();
      samples.push({
        height: cards[0].getBoundingClientRect().height,
        positions: cards.map((card) => card.offsetTop),
        scrollHeight: viewport.scrollHeight,
      });
    }
    return { initial, scrollHeight, samples };
  });
  expect(geometry.initial.length).toBeGreaterThanOrEqual(10);
  expect(geometry.initial.every((card) => card.height === 368)).toBe(true);
  for (const sample of geometry.samples) {
    expect(sample.scrollHeight).toBe(geometry.scrollHeight);
    expect(sample.positions).toEqual(geometry.initial.map((card) => card.top));
    expect(sample.height).toBe(368);
  }
});
