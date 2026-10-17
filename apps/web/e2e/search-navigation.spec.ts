import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";

test("typing searches the library immediately without stealing shortcuts, IME or dialog input", async ({
  page,
}) => {
  await page.goto("/templates");
  const search = page.getByRole("searchbox", {
    name: "Search templates",
    exact: true,
  });
  await page.locator("body").click({ position: { x: 1200, y: 700 } });
  await page.keyboard.type("Editorial");
  await expect(search).toBeFocused();
  await expect(search).toHaveValue("Editorial");
  await expect(
    page.getByRole("link", { name: "Use React Editorial", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Use React Studio", exact: true }),
  ).toHaveCount(0);
  await page.locator("body").click({ position: { x: 1200, y: 700 } });
  await page.evaluate(() => {
    for (const options of [
      { key: "x", ctrlKey: true },
      { key: "y", metaKey: true },
      { key: "z", altKey: true },
      { key: "あ", isComposing: true },
    ])
      document.body.dispatchEvent(
        new KeyboardEvent("keydown", {
          ...options,
          bubbles: true,
          cancelable: true,
        }),
      );
  });
  await expect(search).toHaveValue("Editorial");
  await page
    .getByRole("button", { name: "Preview Editorial", exact: true })
    .click();
  await page.keyboard.type("unused");
  await page.keyboard.press("Escape");
  await expect(search).toHaveValue("Editorial");
  await page
    .getByRole("link", { name: /^Resumes/ })
    .first()
    .click();
  const resumes = page.getByRole("searchbox", {
    name: "Search resumes",
    exact: true,
  });
  await page.locator("body").click({ position: { x: 1200, y: 700 } });
  await page.keyboard.type("Alex");
  await expect(resumes).toHaveValue("Alex");
  await expect(resumes).toBeFocused();
});

test("typewriter hints respect reduced motion and navigation never scales the text", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/templates");
  const search = page.getByRole("searchbox", {
    name: "Search templates",
    exact: true,
  });
  await expect(search).toHaveAttribute("placeholder", /Search \w.+…/);
  const placeholder = await search.getAttribute("placeholder");
  await page.waitForTimeout(180);
  await expect(search).toHaveAttribute("placeholder", placeholder!);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.evaluate(() => {
    const samples: string[] = [];
    Object.assign(window, { navigationTransforms: samples });
    const sample = () => {
      const heading = document.querySelector("main h1");
      const route = heading?.closest("main")?.parentElement;
      if (route) samples.push(getComputedStyle(route).transform);
      if (samples.length < 40) requestAnimationFrame(sample);
    };
    requestAnimationFrame(sample);
  });
  await page
    .getByRole("link", { name: /^Resumes/ })
    .first()
    .click();
  await expect(
    page.getByRole("heading", { name: "Your resumes", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Templates", exact: true })
    .first()
    .click();
  await expect(
    page.getByRole("heading", { name: "Templates", exact: true }),
  ).toBeVisible();
  const transforms = await page.evaluate(
    () =>
      (window as Window & { navigationTransforms?: string[] })
        .navigationTransforms ?? [],
  );
  expect(transforms.length).toBeGreaterThan(0);
  expect(transforms.every((transform) => transform === "none")).toBe(true);
});

test("palette typing uses a virtual catalog and visible font rows load before hover", async ({
  page,
}) => {
  const bytes = await readFile(
    "node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2",
  );
  await page.route("https://fonts.googleapis.com/**", (route) =>
    route.fulfill({
      contentType: "text/css",
      headers: { "access-control-allow-origin": "*" },
      body: "@font-face{src:url(https://fonts.gstatic.com/resumi-search/sample.woff2)}",
    }),
  );
  await page.route("https://fonts.gstatic.com/resumi-search/**", (route) =>
    route.fulfill({
      contentType: "font/woff2",
      body: bytes,
      headers: { "access-control-allow-origin": "*" },
    }),
  );
  await page.goto("/editor");
  await page.getByRole("button", { name: "Icons", exact: true }).click();
  const icons = page.getByRole("searchbox", {
    name: "Search icons",
    exact: true,
  });
  await expect(icons).toBeFocused();
  await page.keyboard.type("Message Square");
  await expect(icons).toHaveValue("Message Square");
  await expect(
    page.getByRole("button", { name: "Use Message Square", exact: true }),
  ).toBeVisible();
  await page.getByRole("radio", { name: "Brands", exact: true }).click();
  await expect(icons).toBeFocused();
  await page.keyboard.type("Figma");
  await expect(
    page.getByRole("button", { name: "Use Figma", exact: true }),
  ).toBeVisible();
  await page.getByRole("radio", { name: "Imported", exact: true }).click();
  const importButton = page
    .getByRole("region", { name: "Icon library", exact: true })
    .getByRole("button", { name: "Import SVG", exact: true });
  await expect(importButton).toBeVisible();
  await expect(importButton).toHaveCSS("background-color", "rgb(37, 99, 235)");
  await page.keyboard.press("Escape");
  await page
    .getByRole("button", { name: "Select layer Name", exact: true })
    .click();
  await page
    .getByRole("combobox", { name: "Font family", exact: true })
    .click();
  const fontSearch = page.getByRole("searchbox", {
    name: "Search fonts",
    exact: true,
  });
  await expect(fontSearch).toBeFocused();
  const list = page.getByRole("listbox", {
    name: "Font families",
    exact: true,
  });
  expect(await list.getByRole("option").count()).toBeLessThanOrEqual(11);
  await fontSearch.fill("Roboto");
  const roboto = list.getByRole("option", { name: "Roboto", exact: true });
  await expect(roboto.locator("[data-font-ready=true]")).toBeVisible();
  expect(
    await page.evaluate(() =>
      [...document.fonts].some(
        (face) => face.family === "Roboto" && face.status === "loaded",
      ),
    ),
  ).toBe(true);
  await page.screenshot({ path: "artifacts/visual/search-font-preview.png" });
});

test("rapid virtual font scrolling drops stale queued downloads before the current result", async ({
  page,
}) => {
  const bytes = await readFile(
    "node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2",
  );
  const families: string[] = [];
  const waiting: (() => Promise<void>)[] = [];
  let hold = true;
  await page.route("https://fonts.googleapis.com/**", (route) => {
    families.push(new URL(route.request().url()).searchParams.get("family")!);
    const fulfill = () =>
      route.fulfill({
        contentType: "text/css",
        headers: { "access-control-allow-origin": "*" },
        body: "@font-face{src:url(https://fonts.gstatic.com/resumi-search/queued.woff2)}",
      });
    if (hold) waiting.push(fulfill);
    else return fulfill();
  });
  await page.route("https://fonts.gstatic.com/resumi-search/**", (route) =>
    route.fulfill({
      contentType: "font/woff2",
      body: bytes,
      headers: { "access-control-allow-origin": "*" },
    }),
  );
  await page.goto("/editor");
  await page
    .getByRole("button", { name: "Select layer Name", exact: true })
    .click();
  await page
    .getByRole("combobox", { name: "Font family", exact: true })
    .click();
  const search = page.getByRole("searchbox", {
    name: "Search fonts",
    exact: true,
  });
  await search.fill("Noto");
  await expect.poll(() => families.length).toBe(3);
  const list = page.getByRole("listbox", {
    name: "Font families",
    exact: true,
  });
  const viewport = list.locator("xpath=..");
  await viewport.evaluate(async (element) => {
    const scroller = element.closest('[data-slot="scroll-shadow-viewport"]')!;
    scroller.scrollTop = 2400;
    await new Promise(requestAnimationFrame);
    await new Promise(requestAnimationFrame);
    scroller.scrollTop = 4800;
    await new Promise(requestAnimationFrame);
    await new Promise(requestAnimationFrame);
  });
  await search.fill("Roboto");
  await expect(
    list.getByRole("option", { name: "Roboto", exact: true }),
  ).toBeVisible();
  await page.evaluate(async () => {
    await new Promise(requestAnimationFrame);
    await new Promise(requestAnimationFrame);
  });
  hold = false;
  await Promise.all(waiting.map((finish) => finish()));
  await expect(
    list
      .getByRole("option", { name: "Roboto", exact: true })
      .locator('[data-font-ready="true"]'),
  ).toBeVisible();
  expect(families.slice(3).every((family) => family.startsWith("Roboto"))).toBe(
    true,
  );
  expect(families).toContain("Roboto");
});
