import { expect, test } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { faqEn, faqFr } from "../src/i18n/faq";
import { seoEn, seoFr } from "../src/i18n/seo";

for (const locale of ["en", "fr"] as const) {
  for (const catalog of [false, true]) {
    const path =
      (locale === "fr" ? "/fr" : "") + (catalog ? "/templates" : "") || "/";
    test(`SSR: ${path} is indexable, localized and complete without JavaScript or a language cookie`, async ({
      browser,
      baseURL,
    }) => {
      const context = await browser.newContext({
        baseURL,
        javaScriptEnabled: false,
      });
      try {
        const page = await context.newPage();
        const response = await page.goto(path);
        expect(response!.status()).toBe(200);
        await expect(page.locator("html")).toHaveAttribute("lang", locale);
        const copy = locale === "fr" ? seoFr : seoEn;
        await expect(page).toHaveTitle(
          catalog ? copy.templatesTitle : copy.landingTitle,
        );
        await expect(page.locator('meta[name="description"]')).toHaveAttribute(
          "content",
          catalog ? copy.templatesDescription : copy.landingDescription,
        );
        await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
        await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
          "href",
          `https://resumi.plinka.eu${path}`,
        );
        for (const language of ["en", "fr", "x-default"]) {
          const alternate =
            (language === "fr" ? "/fr" : "") + (catalog ? "/templates" : "") ||
            "/";
          await expect(
            page.locator(`link[rel="alternate"][hreflang="${language}"]`),
          ).toHaveAttribute("href", `https://resumi.plinka.eu${alternate}`);
        }
        await expect(page.locator('meta[property="og:image"]')).toHaveCount(1);
        await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
          "content",
          "https://resumi.plinka.eu/og-image.png",
        );
        await expect(
          page.locator('meta[property="og:image:width"]'),
        ).toHaveAttribute("content", "1200");
        await expect(
          page.locator('meta[property="og:image:height"]'),
        ).toHaveAttribute("content", "630");
        await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
          "content",
          `https://resumi.plinka.eu${path}`,
        );
        await expect(
          page.locator('meta[name="twitter:title"]'),
        ).toHaveAttribute(
          "content",
          catalog ? copy.templatesTitle : copy.landingTitle,
        );
        await expect(
          page.locator('meta[name="robots"][content*="noindex"]'),
        ).toHaveCount(0);
        const graph = JSON.parse(
          (await page
            .locator('script[type="application/ld+json"]')
            .textContent())!,
        )["@graph"] as Array<Record<string, unknown>>;
        expect(
          graph.some(
            (node) => node["@type"] === "FAQPage" || "aggregateRating" in node,
          ),
        ).toBe(false);
        expect(
          graph.some(
            (node) =>
              node.url === `https://resumi.plinka.eu${path}` &&
              node.inLanguage === locale,
          ),
        ).toBe(true);
        if (catalog) {
          await expect(page.locator("[data-template-card]")).toHaveCount(40);
          await expect(page.getByRole("heading", { level: 1 })).toHaveText(
            locale === "fr" ? "Modèles" : "Templates",
          );
        } else {
          const faq = locale === "fr" ? faqFr : faqEn;
          for (const item of Object.values(faq.items)) {
            await expect(page.locator("#faq")).toContainText(item.question);
            await expect(page.locator("#faq")).toContainText(item.answer);
          }
          await expect(
            page.getByRole("main").getByRole("link", {
              name: locale === "fr" ? "Créer un CV" : "Create Resume",
              exact: true,
            }),
          ).toHaveAttribute(
            "href",
            locale === "fr" ? "/fr/templates" : "/templates",
          );
        }
        expect(await context.cookies()).toEqual([]);
      } finally {
        await context.close();
      }
    });
  }
}

test("SSR: URLs override a conflicting UI cookie; private workspaces and missing pages stay out of the index", async ({
  request,
}) => {
  for (const [path, cookie, locale] of [
    ["/fr", "en", "fr"],
    ["/", "fr", "en"],
    ["/fr/templates", "en", "fr"],
  ]) {
    const response = await request.get(path!, {
      headers: { Cookie: `resumi-ui-language=${cookie}` },
    });
    expect(await response.text()).toContain(`<html lang="${locale}"`);
  }
  for (const path of [
    "/projects",
    "/editor",
    "/editor/synthetic-document-does-not-exist",
    "/missing-public-page",
    "/fr/missing-public-page",
  ]) {
    const response = await request.get(path);
    expect(response.status()).toBe(path.includes("missing-public") ? 404 : 200);
    expect(await response.text()).toContain('name="robots" content="noindex"');
  }
  const robots = await request.get("/robots.txt");
  expect(robots.ok()).toBe(true);
  expect(await robots.text()).toContain(
    "Sitemap: https://resumi.plinka.eu/sitemap.xml",
  );
  expect(await robots.text()).not.toContain("Disallow: /editor");
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.ok()).toBe(true);
  const xml = await sitemap.text();
  const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
  expect(urls).toEqual([
    "https://resumi.plinka.eu/",
    "https://resumi.plinka.eu/fr",
    "https://resumi.plinka.eu/templates",
    "https://resumi.plinka.eu/fr/templates",
  ]);
});

test("visual: public language links, accessible FAQ and hydration preserve the CV sample", async ({
  page,
}) => {
  test.setTimeout(90000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.goto("/");
  await page
    .locator("footer")
    .getByRole("combobox", { name: "Interface language", exact: true })
    .click();
  await page.getByRole("option", { name: "Français", exact: true }).click();
  await expect(page).toHaveURL(/\/fr$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "fr");
  await expect(page).toHaveTitle(seoFr.landingTitle);
  await page.reload();
  const question = page.getByRole("button", {
    name: faqFr.items.privacy.question,
    exact: true,
  });
  await question.scrollIntoViewIfNeeded();
  await question.focus();
  await page.keyboard.press("Enter");
  await expect(question).toHaveAttribute("aria-expanded", "true");
  await expect(
    page.getByText(faqFr.items.privacy.answer, { exact: true }),
  ).toBeVisible();
  await mkdir("artifacts/visual", { recursive: true });
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.locator("#faq").scrollIntoViewIfNeeded();
    await page.screenshot({
      path: `artifacts/visual/faq-fr-${width}.png`,
      animations: "disabled",
    });
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width);
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page
    .getByRole("link", { name: "Parcourir tous les modèles", exact: true })
    .click();
  await expect(page).toHaveURL(/\/fr\/templates$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Modèles");
  await page
    .getByRole("link", { name: "Utiliser React Studio", exact: true })
    .click();
  const preview = page.getByRole("article", {
    name: "Canevas du CV",
    exact: true,
  });
  await expect(preview).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Sélectionner", exact: true }),
  ).toBeVisible();
  await expect(preview.locator("iframe")).toHaveCount(0);
  await expect(
    preview.getByRole("heading", { name: "Alex Morgan", exact: true }),
  ).toBeVisible();
  await expect(
    preview.getByText("Product Designer", { exact: true }),
  ).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "fr");
  expect(errors).toEqual([]);
});
