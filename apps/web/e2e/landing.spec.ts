import { test, expect, type Page } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { templates } from "../../../packages/cv/src";

function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  return errors;
}
async function readyImages(page: Page) {
  await page.evaluate(async () => {
    await Promise.all([
      document.fonts.load('650 22px "Source Sans 3 Variable"'),
      document.fonts.load('500 90px "Space Grotesk Variable"'),
    ]);
    await document.fonts.ready;
    await Promise.all(
      Array.from(document.images)
        .filter((image) => getComputedStyle(image).opacity !== "0")
        .map((image) => image.decode()),
    );
    window.scrollTo({ top: 0, behavior: "instant" });
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });
  });
}
async function footerCrop(page: Page) {
  const footer = page.locator("footer");
  const wordmark = footer.locator('a[href="#top"]').last();
  await wordmark.scrollIntoViewIfNeeded();
  const geometry = await wordmark.evaluate((element) => {
    window.scrollTo(0, document.documentElement.scrollHeight);
    const word = element.getBoundingClientRect();
    const clip = element.parentElement!.getBoundingClientRect();
    return {
      overflow: getComputedStyle(element.parentElement!).overflow,
      clippedPixels: word.bottom - clip.bottom,
      clipBottom: clip.bottom + window.scrollY,
      documentHeight: document.documentElement.scrollHeight,
      scrollBottom: window.scrollY + window.innerHeight,
    };
  });
  expect(geometry.overflow).toBe("hidden");
  expect(geometry.clippedPixels).toBeGreaterThan(15);
  expect(Math.abs(geometry.clipBottom - geometry.documentHeight)).toBeLessThan(
    2,
  );
  expect(
    Math.abs(geometry.scrollBottom - geometry.documentHeight),
  ).toBeLessThan(2);
  await wordmark.click();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  await expect(page.locator("header#top")).toBeFocused();
}

test("visual: teammate landing cycles the real catalog and opens its selected template", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const errors = collectErrors(page);
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Your resume just got a new teammate",
  );
  await expect(
    page.getByRole("main").getByRole("link", {
      name: "Create Resume",
      exact: true,
    }),
  ).toHaveCSS("color", "rgb(255, 255, 255)");
  await expect(
    page
      .getByRole("navigation", { name: "Main navigation", exact: true })
      .getByRole("link", { name: "Create Resume", exact: true }),
  ).toHaveAttribute("href", "/templates");
  const showcase = page.locator("[data-template-showcase]");
  const selected = page.locator("[data-current-template]");
  await showcase.scrollIntoViewIfNeeded();
  const catalog = templates.filter((template) => !template.legacy);
  const seen = new Set<string>();
  for (let index = 0; index < catalog.length; index++) {
    const id = (await selected.getAttribute("data-current-template"))!;
    seen.add(id);
    await expect(
      page.locator(`#templates a[href="/editor?template=${id}"]`),
    ).toBeVisible();
    await showcase.click();
    await expect(selected).not.toHaveAttribute("data-current-template", id);
  }
  expect([...seen].sort()).toEqual(
    catalog.map((template) => template.id).sort(),
  );
  await showcase.focus();
  await page.keyboard.press("End");
  await expect(selected).toHaveAttribute(
    "data-current-template",
    catalog.at(-1)!.id,
  );
  await page.keyboard.press("ArrowRight");
  await expect(selected).toHaveAttribute(
    "data-current-template",
    catalog[0]!.id,
  );
  await page.keyboard.press("ArrowLeft");
  await expect(selected).toHaveAttribute(
    "data-current-template",
    catalog.at(-1)!.id,
  );
  await page.keyboard.press("Home");
  await expect(selected).toHaveAttribute(
    "data-current-template",
    catalog[0]!.id,
  );
  await expect(page.locator('a[href="https://plinka.eu"]')).toBeVisible();
  await footerCrop(page);
  await readyImages(page);
  await mkdir("artifacts/visual", { recursive: true });
  await page.screenshot({
    path: "artifacts/visual/landing-teammate-desktop.png",
    fullPage: true,
    animations: "disabled",
  });
  await page
    .locator(`#templates a[href="/editor?template=${catalog[0]!.id}"]`)
    .click();
  await expect(
    page.getByRole("article", { name: "Resume canvas", exact: true }),
  ).toBeVisible();
  await expect(
    page
      .getByRole("article", { name: "Resume canvas", exact: true })
      .locator("[data-layer-id]")
      .first(),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

for (const width of [320, 390]) {
  test(`visual: mobile navigation, clipped footer and page language work at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    const errors = collectErrors(page);
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Your resume just got a new teammate",
    );
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBe(width);
    await page
      .getByRole("button", { name: "Open navigation", exact: true })
      .click();
    await page
      .getByRole("menuitem", { name: "Templates", exact: true })
      .click();
    await expect(page).toHaveURL(/#templates$/);
    await expect(page.locator("#templates")).toBeInViewport();
    await footerCrop(page);
    const locale = page
      .locator("footer")
      .getByRole("combobox", { name: "Interface language", exact: true });
    await locale.scrollIntoViewIfNeeded();
    await locale.click();
    await page.getByRole("option", { name: "Français", exact: true }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Votre CV a trouvé un nouveau coéquipier",
    );
    await page.reload();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Votre CV a trouvé un nouveau coéquipier",
    );
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBe(width);
    await readyImages(page);
    await mkdir("artifacts/visual", { recursive: true });
    await page.screenshot({
      path: `artifacts/visual/landing-teammate-${width}.png`,
      fullPage: true,
      animations: "disabled",
    });
    expect(errors).toEqual([]);
  });
}

test("touch swipes cycle templates once and keep vertical page scrolling native", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    baseURL,
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
    reducedMotion: "reduce",
  });
  try {
    const page = await context.newPage();
    await page.goto("/");
    const stage = page.locator("[data-template-showcase]");
    const selected = page.locator("[data-current-template]");
    await stage.scrollIntoViewIfNeeded();
    const id = await selected.getAttribute("data-current-template");
    const bounds = (await stage.boundingBox())!;
    const x = bounds.x + bounds.width * 0.7;
    const y = bounds.y + bounds.height / 2;
    const cdp = await context.newCDPSession(page);
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [{ x, y }],
    });
    for (let step = 1; step <= 8; step++)
      await cdp.send("Input.dispatchTouchEvent", {
        type: "touchMove",
        touchPoints: [{ x: x - step * 14, y }],
      });
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchEnd",
      touchPoints: [],
    });
    await expect(selected).not.toHaveAttribute("data-current-template", id!);
    const next = await selected.getAttribute("data-current-template");
    await stage.focus();
    await page.keyboard.press("ArrowLeft");
    await expect(selected).toHaveAttribute("data-current-template", id!);
    expect(next).not.toBe(id);
    expect(
      await stage.evaluate((element) => getComputedStyle(element).touchAction),
    ).toContain("pan-y");
    const before = await page.evaluate(() => window.scrollY);
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [{ x, y }],
    });
    for (let step = 1; step <= 8; step++)
      await cdp.send("Input.dispatchTouchEvent", {
        type: "touchMove",
        touchPoints: [{ x, y: y - step * 14 }],
      });
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchEnd",
      touchPoints: [],
    });
    await expect
      .poll(() => page.evaluate(() => window.scrollY))
      .toBeGreaterThan(before + 20);
    await expect(selected).toHaveAttribute("data-current-template", id!);
  } finally {
    await context.close();
  }
});

test("visual: brand animation keeps navigation steady and respects reduced motion in dark mode", async ({
  page,
}) => {
  await page.emulateMedia({
    colorScheme: "dark",
    reducedMotion: "no-preference",
  });
  const errors = collectErrors(page);
  await page.goto("/");
  await readyImages(page);
  const brand = page
    .getByRole("navigation", { name: "Main navigation", exact: true })
    .getByRole("link", { name: "ResumI home", exact: true });
  const before = (await brand.boundingBox())!;
  await brand.hover();
  await expect(brand).toHaveAttribute("data-brand-animation", /.+/);
  const widths = await brand.evaluate(async (element) => {
    const samples: number[] = [];
    for (let index = 0; index < 18; index++) {
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve());
      });
      samples.push(element.getBoundingClientRect().width);
    }
    return samples;
  });
  expect(Math.max(...widths) - Math.min(...widths)).toBeLessThan(0.1);
  expect(Math.abs(widths[0]! - before.width)).toBeLessThan(0.1);
  await expect(brand).not.toHaveAttribute("data-brand-animation");
  await brand.click();
  await expect(brand).toHaveAttribute("data-brand-animation", /.+/);
  await expect(brand).not.toHaveAttribute("data-brand-animation");
  await expect(brand.locator("[data-brand-glyph]")).toHaveText([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  const cta = page
    .getByRole("navigation", { name: "Main navigation", exact: true })
    .getByRole("link", { name: "Create Resume", exact: true });
  await expect(cta).toHaveCSS("color", "rgb(255, 255, 255)");
  for (const name of [
    "Claude",
    "Codex / ChatGPT",
    "Grok / Grok Bot",
    "Cursor",
    "OpenCode",
    "Muse Code",
  ])
    await expect(
      page.getByRole("group", { name: "Your AI tools", exact: true }),
    ).toContainText(name);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.mouse.move(5, 5);
  await brand.hover();
  await expect(brand).not.toHaveAttribute("data-brand-animation");
  await footerCrop(page);
  await readyImages(page);
  await mkdir("artifacts/visual", { recursive: true });
  await page.screenshot({
    path: "artifacts/visual/landing-teammate-dark.png",
    fullPage: true,
    animations: "disabled",
  });
  expect(errors).toEqual([]);
});

test("visual: section indicator tracks scroll and public creation opens the catalog", async ({
  page,
}) => {
  await page.goto("/");
  const navigation = page.getByRole("navigation", {
    name: "Main navigation",
    exact: true,
  });
  await expect(
    navigation.getByRole("link", { name: "Dashboard", exact: true }),
  ).toHaveCount(0);
  await expect(page.locator("footer a[href='/projects']")).toHaveCount(0);
  await expect(navigation.locator("[data-active-section]")).toHaveCount(0);
  for (const id of ["how-it-works", "templates", "how-it-works"]) {
    await page
      .locator(`#${id}`)
      .evaluate((element) =>
        element.scrollIntoView({ behavior: "instant", block: "start" }),
      );
    await expect(
      navigation.locator("[aria-current='location']"),
    ).toHaveAttribute("href", `/#${id}`);
    await expect(navigation.locator("[data-active-section]")).toHaveCount(1);
    await expect(navigation.locator("[data-active-section]")).toHaveAttribute(
      "data-active-section",
      id,
    );
  }
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await expect(navigation.locator("[data-active-section]")).toHaveCount(0);
  await page
    .getByRole("link", { name: "Create Resume", exact: true })
    .last()
    .click();
  await expect(page).toHaveURL(/\/templates$/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator("[data-template-layout]")).toHaveCount(0);
});

test("rapid carousel changes interrupt motion and settle on the latest selection", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  const stage = page.locator("[data-template-showcase]");
  const selected = page.locator("[data-current-template]");
  const catalog = templates.filter((template) => !template.legacy);
  await stage.scrollIntoViewIfNeeded();
  await stage.focus();
  await page.keyboard.press("Home");
  for (let index = 0; index < 9; index++)
    await page.keyboard.press("ArrowRight");
  for (let index = 0; index < 4; index++)
    await page.keyboard.press("ArrowLeft");
  await expect(selected).toHaveAttribute(
    "data-current-template",
    catalog[5]!.id,
  );
  await expect(stage.locator("[data-template-card]")).toHaveCount(
    catalog.length,
  );
  const current = stage.locator(`[data-template-card="${catalog[5]!.id}"]`);
  await expect(current).toHaveCSS("z-index", "20", { timeout: 1000 });
  await expect(current).toHaveCSS("opacity", "1", { timeout: 1000 });
  const centers = await current.evaluate((element) => {
    const paper = element.getBoundingClientRect();
    const stage = element.closest("button")!.getBoundingClientRect();
    return Math.abs(paper.x + paper.width / 2 - stage.x - stage.width / 2);
  });
  expect(centers).toBeLessThan(1);
  await expect(
    page.locator(`#templates a[href="/editor?template=${catalog[5]!.id}"]`),
  ).toBeVisible();
  for (let index = 0; index < 7; index++) await stage.click({ delay: 0 });
  await page.keyboard.press("End");
  await page.keyboard.press("ArrowLeft");
  await expect(selected).toHaveAttribute(
    "data-current-template",
    catalog.at(-2)!.id,
  );
  await expect(
    stage.locator(`[data-template-card="${catalog.at(-2)!.id}"]`),
  ).toHaveCSS("opacity", "1", { timeout: 1000 });
});

test("rapid alternating swipes keep the last intended template", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    baseURL,
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
    reducedMotion: "no-preference",
  });
  try {
    const page = await context.newPage();
    await page.goto("/");
    const stage = page.locator("[data-template-showcase]");
    const selected = page.locator("[data-current-template]");
    await stage.scrollIntoViewIfNeeded();
    const catalog = templates.filter((template) => !template.legacy);
    const initial = await selected.getAttribute("data-current-template");
    const initialIndex = catalog.findIndex(
      (template) => template.id === initial,
    );
    const bounds = (await stage.boundingBox())!;
    const center = {
      x: bounds.x + bounds.width / 2,
      y: bounds.y + bounds.height / 2,
    };
    const cdp = await context.newCDPSession(page);
    for (const direction of [1, 1, 1, -1, -1]) {
      await cdp.send("Input.dispatchTouchEvent", {
        type: "touchStart",
        touchPoints: [{ x: center.x + direction * 65, y: center.y }],
      });
      await cdp.send("Input.dispatchTouchEvent", {
        type: "touchMove",
        touchPoints: [{ x: center.x - direction * 65, y: center.y }],
      });
      await cdp.send("Input.dispatchTouchEvent", {
        type: "touchEnd",
        touchPoints: [],
      });
    }
    const expected = catalog[(initialIndex + 1) % catalog.length]!.id;
    await expect(selected).toHaveAttribute("data-current-template", expected);
    await expect(stage.locator(`[data-template-card="${expected}"]`)).toHaveCSS(
      "opacity",
      "1",
      { timeout: 1000 },
    );
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBe(390);
  } finally {
    await context.close();
  }
});

test("the catalogue link stays clickable when its heading reflows during pointer activation", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Templates", exact: true })
    .click();
  await expect(page).toHaveURL(/#templates$/);
  const browse = page.getByRole("main").getByRole("link", {
    name: "Browse all templates",
    exact: true,
  });
  await browse.evaluate((link) => {
    link.addEventListener(
      "pointerdown",
      () => {
        const heading = link.parentElement!.querySelector("h2")!;
        const before = heading.getBoundingClientRect().height;
        // A font swap can change the title's line count between down and up.
        heading.style.maxWidth = "150px";
        document.documentElement.dataset.headingReflow = String(
          heading.getBoundingClientRect().height - before,
        );
      },
      { once: true },
    );
  });
  await browse.click();
  await expect(
    page.getByRole("heading", { name: "Templates", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(() =>
      Number(document.documentElement.dataset.headingReflow),
    ),
  ).toBeGreaterThan(0);
});
