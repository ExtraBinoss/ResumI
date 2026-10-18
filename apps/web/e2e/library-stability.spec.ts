import { expect, test, type Page } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";

async function compareHeader(page: Page, before: Buffer, after: Buffer) {
  const pixels = await page.evaluate(
    async ([first, second]) => {
      async function decode(value: string) {
        const response = await fetch(`data:image/png;base64,${value}`);
        const bitmap = await createImageBitmap(await response.blob());
        const canvas = document.createElement("canvas");
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        const context = canvas.getContext("2d")!;
        context.drawImage(bitmap, 0, 0);
        bitmap.close();
        return context.getImageData(0, 0, canvas.width, canvas.height).data;
      }
      const [a, b] = await Promise.all([decode(first!), decode(second!)]);
      let changedPixels = 0,
        maxChannelDifference = 0;
      for (let pixel = 0; pixel < a.length; pixel += 4) {
        let changed = false;
        for (let channel = 0; channel < 4; channel++) {
          const difference = Math.abs(
            a[pixel + channel]! - b[pixel + channel]!,
          );
          maxChannelDifference = Math.max(maxChannelDifference, difference);
          changed ||= difference !== 0;
        }
        if (changed) changedPixels++;
      }
      return { changedPixels, maxChannelDifference };
    },
    [before.toString("base64"), after.toString("base64")],
  );
  // Chromium can quantize a couple of soft-shadow pixels by one channel level
  // when the scrolling surface changes. This permits no displaced text pixels.
  expect(pixels.changedPixels).toBeLessThanOrEqual(4);
  expect(pixels.maxChannelDifference).toBeLessThanOrEqual(1);
  return pixels;
}

test("visual library search keeps header pixels stable when results add and remove overflow", async ({
  page,
}) => {
  await page.goto("/editor");
  await expect(page).toHaveURL(/\/editor\/[^/?#]+$/);
  await page
    .getByRole("button", { name: "Back to projects", exact: true })
    .click();
  const cards = page.getByRole("link", { name: /^Open Alex Morgan/ });
  await expect(cards).toHaveCount(1);
  // Real UI actions create the overflow fixture through the validated repository.
  for (let count = 2; count <= 6; count++) {
    const actions = page
      .getByRole("button", { name: /^Actions for Alex Morgan/ })
      .first();
    const name = (await actions.getAttribute("aria-label"))!;
    await actions.click();
    const menu = page.getByRole("menu", { name, exact: true });
    await menu
      .getByRole("menuitem", { name: "Duplicate", exact: true })
      .click();
    await expect(menu).toBeHidden();
    await expect(cards).toHaveCount(count);
  }
  const header = page.locator("[data-library-header]");
  const search = page.getByRole("searchbox", {
    name: "Search resumes",
    exact: true,
  });
  const viewport = page
    .getByRole("region", { name: "Library content", exact: true })
    .locator('[data-slot="scroll-shadow-viewport"]')
    .first();
  const reports = [];
  await mkdir("artifacts/visual", { recursive: true });
  await mkdir("artifacts/performance", { recursive: true });
  for (const theme of ["light", "dark"]) {
    await page.getByRole("button", { name: "Settings", exact: true }).click();
    await page
      .getByRole("button", {
        name: theme === "light" ? "Light" : "Dark",
        exact: true,
      })
      .click();
    await page.keyboard.press("Escape");
    await search.click();
    await page.evaluate(async () => {
      await document.fonts.ready;
      await new Promise(requestAnimationFrame);
      await new Promise(requestAnimationFrame);
    });
    await expect
      .poll(() =>
        header.evaluate((node) => {
          let opacity = 1;
          for (
            let parent: Element | null = node;
            parent;
            parent = parent.parentElement
          )
            opacity *= Number(getComputedStyle(parent).opacity);
          return opacity;
        }),
      )
      .toBe(1);
    await page.waitForFunction(() =>
      document
        .querySelector("[data-library-header]")!
        .getAnimations({ subtree: true })
        .every((animation) => animation.playState !== "running"),
    );
    const before = (await header.boundingBox())!;
    const image = await header.screenshot({
      path: `artifacts/visual/library-header-${theme}.png`,
    });
    await expect
      .poll(() =>
        viewport.evaluate((node) => node.scrollHeight > node.clientHeight),
      )
      .toBe(true);
    const results = [];
    for (const query of ["A", "Alex", "No match", ""]) {
      await search.fill(query);
      await expect(cards).toHaveCount(query === "No match" ? 0 : 6);
      await page.evaluate(async () => {
        await new Promise(requestAnimationFrame);
        await new Promise(requestAnimationFrame);
      });
      const next = (await header.boundingBox())!;
      const currentImage = await header.screenshot();
      const pixelDifference = await compareHeader(page, image, currentImage);
      expect(next).toEqual(before);
      results.push({
        query,
        pixelDifference,
        header: next,
        overflow: await viewport.evaluate(
          (node) => node.scrollHeight > node.clientHeight,
        ),
      });
    }
    expect(results.map((result) => result.overflow)).toEqual([
      true,
      true,
      false,
      true,
    ]);
    await viewport.evaluate((node) => {
      node.scrollTop = node.scrollHeight;
    });
    expect(await header.boundingBox()).toEqual(before);
    const scrollPixelDifference = await compareHeader(
      page,
      image,
      await header.screenshot(),
    );
    await viewport.evaluate((node) => {
      node.scrollTop = 0;
    });
    await page.screenshot({
      path: `artifacts/visual/library-centered-projects-${theme}.png`,
    });
    reports.push({
      theme,
      viewport: page.viewportSize(),
      results,
      scrollPixelDifference,
    });
  }
  await writeFile(
    "artifacts/performance/library-search-stability.json",
    JSON.stringify(reports, null, 2) + "\n",
  );
});

test("library search has the same position in both routes and translated sorting stays compact", async ({
  page,
}) => {
  await page.goto("/editor");
  await expect(page).toHaveURL(/\/editor\/[^/?#]+$/);
  await page
    .getByRole("button", { name: "Back to projects", exact: true })
    .click();
  await expect(page.getByRole("link", { name: /^Open Alex/ })).toBeVisible();
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const locale of ["en", "fr"] as const) {
      await page.locator('nav[aria-label] a[href="/projects"]').click();
      await page.getByRole("button", { name: /^(Settings|Réglages)$/ }).click();
      const settings = page.locator('[data-slot="popover-content"]');
      await settings.getByRole("combobox").click();
      await page
        .getByRole("option", {
          name: locale === "fr" ? "Français" : "English",
          exact: true,
        })
        .click();
      await page.keyboard.press("Escape");
      const label = locale === "fr" ? "Rechercher un CV" : "Search resumes";
      const search = page.getByRole("searchbox", { name: label, exact: true });
      const before = (await search.boundingBox())!;
      const sort = page.getByRole("combobox", {
        name: locale === "fr" ? "Trier les CV" : "Sort resumes",
        exact: true,
      });
      // Collection preferences survive sibling navigation; reset this fixture.
      await sort.click();
      await page
        .getByRole("option", {
          name: locale === "fr" ? "Modifié" : "Last edited",
          exact: true,
        })
        .click();
      await expect(sort).toContainText(
        locale === "fr" ? "Modifié" : "Last edited",
      );
      expect((await sort.boundingBox())!.width).toBe(104);
      await sort.click();
      await expect
        .poll(
          async () =>
            (
              await page
                .locator('[data-slot="select-content"]')
                .last()
                .boundingBox()
            )?.width,
        )
        .toBe(104);
      await expect(
        page.getByText("dashboard.sortName", { exact: true }),
      ).toHaveCount(0);
      await expect(
        page.getByText("dashboard.import", { exact: true }),
      ).toHaveCount(0);
      const optionSpacing = await page
        .getByRole("option", {
          name: locale === "fr" ? "Modifié" : "Last edited",
          exact: true,
        })
        .evaluate((node) => {
          const range = document.createRange();
          range.selectNodeContents(node.firstElementChild!);
          return (
            node.querySelector("svg")!.getBoundingClientRect().left -
            range.getBoundingClientRect().right
          );
        });
      expect(optionSpacing).toBeGreaterThanOrEqual(4);
      await page
        .getByRole("option", {
          name: locale === "fr" ? "Nom A–Z" : "Name A–Z",
          exact: true,
        })
        .click();
      await search.fill("Missing");
      await expect(
        page.getByRole("heading", {
          name: locale === "fr" ? "Aucun résultat" : "No results",
          exact: true,
        }),
      ).toBeVisible();
      await search.fill("");
      await page
        .locator(
          `nav[aria-label] a[href="${locale === "fr" ? "/fr/templates" : "/templates"}"]`,
        )
        .click();
      const templates = page.getByRole("searchbox", {
        name: locale === "fr" ? "Rechercher un modèle" : "Search templates",
        exact: true,
      });
      const after = (await templates.boundingBox())!;
      expect(after).toEqual(before);
      await expect(
        page.getByRole("button", {
          name: locale === "fr" ? "Aperçu de Studio" : "Preview Studio",
          exact: true,
        }),
      ).toBeVisible();
      await templates.fill("Missing");
      await expect(
        page.getByRole("heading", {
          name: locale === "fr" ? "Aucun modèle trouvé" : "No templates found",
          exact: true,
        }),
      ).toBeVisible();
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
      ).toBe(width);
      await templates.fill("");
    }
  }
});
