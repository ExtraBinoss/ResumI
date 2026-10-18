import { expect, test, type Page } from "@playwright/test";

function gate() {
  let release!: () => void;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  return { pending, release: () => release() };
}

async function holdTemplates(page: Page) {
  const response = gate();
  const requested = gate();
  await page.route("**/templates.data*", async (route) => {
    requested.release();
    await response.pending;
    await route.continue();
  });
  return { requested: requested.pending, release: response.release };
}

for (const locale of ["en", "fr"] as const) {
  test(`visual: discreet route feedback preserves the public page in ${locale}`, async ({
    page,
    context,
    baseURL,
  }) => {
    if (locale === "fr") {
      await context.addCookies([
        { name: "resumi-ui-language", value: "fr", url: baseURL! },
      ]);
      await page.emulateMedia({ reducedMotion: "reduce" });
    }
    await page.goto(locale === "fr" ? "/fr" : "/");
    const link =
      locale === "en"
        ? page
            .getByRole("main")
            .getByRole("link", { name: "Create Resume", exact: true })
        : page.getByRole("link", {
            name: "Parcourir tous les modèles",
            exact: true,
          });
    await expect(link).toBeVisible();
    const templates = await holdTemplates(page);
    const click = link.click();
    try {
      await templates.requested;
      const pending = page.locator("[data-route-pending]");
      await expect(pending).toBeVisible();
      const status = pending;
      await expect(status).toHaveAttribute("role", "status");
      await expect(status).toHaveAttribute("aria-live", "polite");
      await expect(status).toHaveAttribute("aria-busy", "true");
      await expect(status).toHaveText(
        locale === "en" ? "Loading…" : "Chargement…",
      );
      await expect(pending.locator("canvas")).toHaveCount(0);
      await expect(pending).toHaveCSS("backdrop-filter", "none");
      await expect(pending).toHaveCSS("pointer-events", "none");
      const bounds = (await pending.boundingBox())!;
      expect(bounds.width).toBeLessThan(320);
      expect(bounds.height).toBeLessThan(60);
      await expect(link).toBeVisible();
      await expect(page.getByRole("main")).toBeVisible();
      if (locale === "fr") await expect(pending).toHaveCSS("opacity", "1");
      await page.screenshot({
        path: `artifacts/visual/route-pending-${locale}.png`,
        animations: "disabled",
      });
    } finally {
      templates.release();
      await click;
    }
    await expect(page).toHaveURL(/\/templates$/);
    await expect(page.locator("[data-template-card]").first()).toBeVisible();
    await expect(page.locator("[data-route-pending]")).toHaveCount(0);
  });
}

test("library tab navigation preserves its header without a page overlay while data is pending", async ({
  page,
}) => {
  await page.goto("/projects");
  const header = page.locator("[data-library-header]");
  await expect(header).toBeVisible();
  const originalHeader = await header.elementHandle();
  const observation = await page.evaluateHandle(() => {
    let overlays = 0;
    const observer = new MutationObserver((records) => {
      for (const record of records)
        for (const node of record.addedNodes)
          if (
            node instanceof Element &&
            (node.matches("[data-route-pending]") ||
              node.querySelector("[data-route-pending]"))
          ) {
            const status = node.matches("[data-route-pending]")
              ? node
              : node.querySelector("[data-route-pending]")!;
            const bounds = status.getBoundingClientRect();
            if (
              bounds.width > innerWidth * 0.8 &&
              bounds.height > innerHeight * 0.8
            )
              overlays++;
          }
    });
    observer.observe(document, { childList: true, subtree: true });
    return {
      stop: () => {
        observer.disconnect();
        return overlays;
      },
    };
  });
  const templates = await holdTemplates(page);
  const click = header.locator('nav a[href="/templates"]').click();
  try {
    await templates.requested;
    await expect(page.locator("[data-route-pending]")).toBeVisible();
    await expect(header).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Your resumes", exact: true }),
    ).toBeVisible();
  } finally {
    templates.release();
    await click;
  }
  await expect(page).toHaveURL(/\/templates$/);
  await expect(
    page.getByRole("heading", { name: "Templates", exact: true }),
  ).toBeVisible();
  await header.locator('nav a[href="/projects"]').click();
  await expect(page).toHaveURL(/\/projects$/);
  await expect(
    page.getByRole("heading", { name: "Your resumes", exact: true }),
  ).toBeVisible();
  expect(await originalHeader?.evaluate((node) => node.isConnected)).toBe(true);
  expect(await observation.evaluate((probe) => probe.stop())).toBe(0);
  await observation.dispose();
});

type EditorProbe = {
  editorMounted: boolean;
  overlays: number;
  lateLoaders: number;
};
declare global {
  interface Window {
    routeFeedbackProbe?: EditorProbe;
  }
}

test("creating a resume canonicalizes its editor address without another loading surface", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const probe: EditorProbe = {
      editorMounted: false,
      overlays: 0,
      lateLoaders: 0,
    };
    window.routeFeedbackProbe = probe;
    new MutationObserver((records) => {
      for (const record of records) {
        for (const node of record.addedNodes) {
          if (!(node instanceof Element)) continue;
          const contains = (selector: string) =>
            node.matches(selector) || !!node.querySelector(selector);
          if (contains('article[aria-label="Resume canvas"]'))
            probe.editorMounted = true;
          if (!probe.editorMounted) continue;
          if (contains("[data-route-pending]")) probe.overlays++;
          if (contains("[data-loading-state]")) probe.lateLoaders++;
        }
      }
    }).observe(document, { childList: true, subtree: true });
  });
  await page.goto("/editor");
  await expect(page).toHaveURL(/\/editor\/[^/?]+$/);
  await expect(
    page.getByRole("article", { name: "Resume canvas", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("status", { name: "Save status", exact: true }),
  ).toHaveText("Saved");
  await expect(page.locator("[data-route-pending]")).toHaveCount(0);
  const probe = await page.evaluate(() => window.routeFeedbackProbe);
  expect(probe?.editorMounted).toBe(true);
  expect(probe?.overlays).toBe(0);
  expect(probe?.lateLoaders).toBe(0);
});
