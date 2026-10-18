import { expect, test } from "@playwright/test";
import { mkdir } from "node:fs/promises";

test("SSR catalogue retains 20 cards without embedding CV markup or global preview CSS", async ({
  request,
}) => {
  for (const path of ["/templates", "/fr/templates", "/projects"]) {
    const response = await request.get(path);
    expect(response.ok()).toBe(true);
    const html = await response.text();
    // Baseline payloads were 443,119 bytes /templates and 177,436 bytes /projects.
    expect(Buffer.byteLength(html)).toBeLessThan(
      path === "/projects" ? 85_000 : 160_000,
    );
    expect(html).not.toContain("data-template-preview-styles");
    expect(html).not.toContain("resumi-preview://portrait");
    expect(html).not.toContain("Alex Morgan");
    if (path.endsWith("templates")) {
      expect(html.match(/data-template-card=/g)).toHaveLength(20);
      expect(html).toContain('data-template-card="react-botanica"');
    }
  }
  const preview = await request.get(
    "/resources/template-preview/react-botanica",
  );
  expect(preview.ok()).toBe(true);
  expect(preview.headers()["x-robots-tag"]).toBe("noindex");
  const data = await preview.json();
  expect(data.id).toBe("react-botanica");
  expect(data.html).toContain('data-template-layout="botanica"');
  expect(data.css).toContain(".cv-botanica");
  for (const id of ["studio", "unknown", "private-project-123"]) {
    const response = await request.get(`/resources/template-preview/${id}`);
    expect(response.status()).toBe(404);
    expect(response.headers()["x-robots-tag"]).toBe("noindex");
    expect(await response.json()).toEqual({
      id,
      error: "Unknown public template.",
    });
  }
});

for (const locale of ["en", "fr"] as const) {
  test(`visual ${locale} template preview loads only on demand, searches and reopens`, async ({
    page,
  }) => {
    const previewRequests: string[] = [];
    page.on("request", (request) => {
      if (request.url().includes("/resources/template-preview/"))
        previewRequests.push(request.url());
    });
    await page.goto(locale === "fr" ? "/fr/templates" : "/templates");
    await expect(page.locator("[data-template-card]")).toHaveCount(20);
    expect(previewRequests).toHaveLength(0);
    expect(
      (await page.locator("style").allTextContents()).join("\n"),
    ).not.toContain("font-family:ResumeInter");
    const search = page.getByRole("searchbox", {
      name: locale === "fr" ? "Rechercher un modèle" : "Search templates",
      exact: true,
    });
    await search.fill("Botanica");
    await expect(page.locator("[data-template-card]")).toHaveCount(1);
    await page
      .getByRole("button", {
        name: locale === "fr" ? "Aperçu de Botanica" : "Preview Botanica",
        exact: true,
      })
      .click();
    const dialog = page.getByRole("dialog", { name: "Botanica", exact: true });
    const preview = dialog.locator('[data-template-preview="react-botanica"]');
    await expect(preview).toBeVisible();
    await expect(
      preview.locator('[data-template-layout="botanica"]'),
    ).toBeVisible();
    await expect(preview).toContainText("Alex Morgan");
    expect(await preview.locator("style").textContent()).toContain(
      "font-family:ResumeInter",
    );
    await preview.evaluate(async (node) => {
      await document.fonts.load("14px ResumeInter");
      await document.fonts.ready;
      await Promise.all(
        Array.from(node.querySelectorAll("img"), (image) => image.decode()),
      );
    });
    await mkdir("artifacts/visual", { recursive: true });
    await page.screenshot({
      path: `artifacts/visual/template-preview-${locale}-desktop.png`,
    });
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toBeHidden();
    await expect(page.locator("[data-template-preview]")).toHaveCount(0);
    await page
      .getByRole("button", {
        name: locale === "fr" ? "Aperçu de Botanica" : "Preview Botanica",
        exact: true,
      })
      .click();
    await expect(preview).toBeVisible();
    expect(previewRequests).toHaveLength(1);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({
      path: `artifacts/visual/template-preview-${locale}-mobile.png`,
    });
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await search.fill("");
    await expect(page.locator("[data-template-card]")).toHaveCount(20);
  });
}

test("preview always follows the latest rapid close/open intent without showing a previous CV", async ({
  page,
}) => {
  let releaseProfile!: () => void;
  const profileGate = new Promise<void>((resolve) => {
    releaseProfile = resolve;
  });
  let profileFinished!: () => void;
  const profileComplete = new Promise<void>((resolve) => {
    profileFinished = resolve;
  });
  await page.route(
    "**/resources/template-preview/react-profile*",
    async (route) => {
      const response = await route.fetch();
      await profileGate;
      await route.fulfill({ response });
      profileFinished();
    },
  );
  await page.goto("/templates");
  await page
    .getByRole("button", { name: "Preview Studio", exact: true })
    .click();
  await expect(
    page.locator('[data-template-preview="react-studio"]'),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await page
    .getByRole("button", { name: "Preview Profile", exact: true })
    .click();
  const profileDialog = page.getByRole("dialog", {
    name: "Profile",
    exact: true,
  });
  await expect(profileDialog.getByRole("status")).toContainText(
    "Preparing preview",
  );
  await expect(page.locator("[data-template-preview]")).toHaveCount(0);
  await page.keyboard.press("Escape");
  await page
    .getByRole("button", { name: "Preview Harvard", exact: true })
    .click();
  const finalPreview = page.locator('[data-template-preview="react-harvard"]');
  await expect(finalPreview).toBeVisible();
  releaseProfile();
  await profileComplete;
  await expect(
    page.getByRole("dialog", { name: "Harvard", exact: true }),
  ).toBeVisible();
  await expect(finalPreview).toBeVisible();
  await expect(
    page.locator('[data-template-preview="react-profile"]'),
  ).toHaveCount(0);
});

test("preview failure stays local, offers copyable details and retries in French", async ({
  page,
}) => {
  await page.route(
    "**/resources/template-preview/react-studio*",
    async (route) => {
      // Return a real resource-route error in React Router's own response format.
      const response = await route.fetch({
        url: route.request().url().replace("react-studio", "studio"),
      });
      const body = (await response.text()).replaceAll(
        '"studio"',
        '"react-studio"',
      );
      await route.fulfill({ response, body });
    },
  );
  await page.goto("/fr/templates");
  await page
    .getByRole("button", { name: "Aperçu de Studio", exact: true })
    .click();
  const dialog = page.getByRole("dialog", { name: "Studio", exact: true });
  await expect(dialog.getByRole("alert")).toContainText(
    "Impossible de charger cet aperçu",
  );
  await expect(dialog.getByRole("alert")).toContainText(
    "Unknown public template.",
  );
  await expect(dialog.getByRole("button", { name: /Copier/ })).toBeVisible();
  await expect(page.locator("[data-template-card]")).toHaveCount(20);
  await mkdir("artifacts/visual", { recursive: true });
  await page.screenshot({
    path: "artifacts/visual/template-preview-error-fr.png",
  });
  await page.unroute("**/resources/template-preview/react-studio*");
  await dialog
    .getByRole("button", { name: "Réessayer l’aperçu", exact: true })
    .click();
  await expect(
    dialog.locator('[data-template-preview="react-studio"]'),
  ).toBeVisible();
  await expect(dialog.getByRole("alert")).toHaveCount(0);
});

test("an unavailable preview connection keeps the catalogue open and can retry", async ({
  page,
}) => {
  await page.route("**/resources/template-preview/react-studio*", (route) =>
    route.abort("internetdisconnected"),
  );
  await page.goto("/templates");
  await page
    .getByRole("button", { name: "Preview Studio", exact: true })
    .click();
  const dialog = page.getByRole("dialog", { name: "Studio", exact: true });
  await expect(dialog.getByRole("alert")).toContainText(
    "Could not load this preview",
  );
  await expect(
    dialog.getByRole("button", { name: "Copy error details", exact: true }),
  ).toBeVisible();
  await expect(page.locator("[data-template-card]")).toHaveCount(20);
  await page.unroute("**/resources/template-preview/react-studio*");
  await dialog
    .getByRole("button", { name: "Retry preview", exact: true })
    .click();
  await expect(
    dialog.locator('[data-template-preview="react-studio"]'),
  ).toBeVisible();
});
