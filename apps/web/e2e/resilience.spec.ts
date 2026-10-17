import { test, expect } from "@playwright/test";
import { createResume } from "@resumi/cv";
import { mkdir, writeFile } from "node:fs/promises";
import { closeDialog, openCommands } from "./helpers/editor";

test("browser IndexedDB v1 migration survives reopen and offline editing", async ({
  page,
  context,
}) => {
  const document = createResume("migrated-browser");
  await page.goto("/");
  await page.evaluate(async (document) => {
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.open("resumi-projects", 1);
      request.onupgradeneeded = () => {
        request.result.createObjectStore("projects", { keyPath: "id" });
      };
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result,
          tx = db.transaction("projects", "readwrite");
        tx.objectStore("projects").put({
          id: document.id,
          document,
          createdAt: "2026-01-01",
          updatedAt: "2026-01-01",
        });
        tx.oncomplete = () => {
          db.close();
          resolve();
        };
        tx.onerror = () => reject(tx.error);
      };
    });
  }, document);
  await page.goto("/projects");
  await expect(
    page.getByRole("link", { name: "Open Alex Morgan — Resume", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Open Alex Morgan — Resume", exact: true })
    .click();
  await expect(
    page.locator('.resume[aria-label="Resume canvas"]'),
  ).toBeVisible();
  await context.setOffline(true);
  await page
    .getByRole("button", { name: "Edit heading: Alex Morgan", exact: true })
    .dblclick();
  await page
    .getByRole("textbox", { name: "Edit text on canvas" })
    .fill("Offline edit");
  await page
    .getByRole("textbox", { name: "Edit text on canvas" })
    .press("Control+Enter");
  await expect(
    page.getByRole("status", { name: "Save status", exact: true }),
  ).toHaveText("Saved");
  await context.setOffline(false);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Offline edit", exact: true }),
  ).toBeVisible();
  const metadata = await page.evaluate(
    async () =>
      new Promise<{ version: number; revision: number }>((resolve, reject) => {
        const request = indexedDB.open("resumi-projects");
        request.onsuccess = () => {
          const db = request.result,
            tx = db.transaction("projects"),
            get = tx.objectStore("projects").get("migrated-browser");
          get.onsuccess = () => {
            resolve({ version: db.version, revision: get.result.revision });
            db.close();
          };
          get.onerror = () => reject(get.error);
        };
      }),
  );
  expect(metadata.version).toBe(2);
  expect(metadata.revision).toBeGreaterThan(0);
});

test("storage denial yields actionable error without creating a project", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "indexedDB", {
      configurable: true,
      value: {
        open() {
          throw new DOMException("Storage blocked", "SecurityError");
        },
      },
    });
  });
  await page.goto("/projects");
  await expect(
    page.getByText("Could not access local storage.", { exact: false }),
  ).toBeVisible();
  await page.getByRole("button", { name: "New resume", exact: true }).click();
  await expect(
    page.getByText("Could not access local storage.", { exact: false }),
  ).toBeVisible();
  await expect(page).toHaveURL(/\/projects$/);
});

test("measured editor opening and text-input latency on a synthetic document", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  const opened = performance.now();
  await page
    .getByRole("link", { name: "Create a resume", exact: true })
    .click();
  await expect(
    page.locator('.resume[aria-label="Resume canvas"]'),
  ).toBeVisible();
  const openMs = performance.now() - opened;
  await page.getByRole("button", { name: /Edit text: I turn/ }).click();
  const input = page.getByRole("textbox", { name: "Content", exact: true });
  const samples: number[] = [];
  for (let i = 0; i < 10; i++) {
    const started = performance.now();
    await input.fill(`Responsiveness check ${i}`);
    await expect(
      page.locator('.resume[aria-label="Resume canvas"]'),
    ).toContainText(`Responsiveness check ${i}`);
    samples.push(performance.now() - started);
  }
  const timing = {
    environment:
      "Local Chromium, production Worker preview; Playwright round trips included",
    projectOpenMs: Math.round(openMs),
    inputRoundTripMs: samples.map(Math.round),
    inputP95Ms: Math.round([...samples].sort((a, b) => a - b)[9]),
  };
  await mkdir("artifacts/performance", { recursive: true });
  await writeFile(
    "artifacts/performance/interactions.json",
    JSON.stringify(timing, null, 2),
  );
  expect(openMs).toBeLessThan(10000);
  expect(Math.max(...samples)).toBeLessThan(1000);
  expect(errors).toEqual([]);
});

test("mobile editor keeps the canvas and both composition and properties available", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/editor");
  await expect(
    page.locator('.resume[aria-label="Resume canvas"]'),
  ).toBeVisible();
  await expect(page.locator("body main.recovery")).toHaveCount(0);
  await expect(page.locator("#app main")).toHaveCount(1);
  await expect(
    page.getByRole("complementary", { name: "Layers panel" }),
  ).toBeVisible();
  await expect(
    page.getByRole("complementary", { name: "Properties inspector" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /^Toggle (outline|properties)$/ }),
  ).toHaveCount(0);
  await page.getByRole("radio", { name: "Structure", exact: true }).click();
  await expect(
    page.getByRole("complementary", { name: "Document structure" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Profile 2", exact: true }).click();
  await expect(
    page.getByRole("complementary", { name: "Document structure" }),
  ).toBeVisible();
  await expect(
    page.getByRole("textbox", { name: "Section title" }),
  ).toBeVisible();
  await expect(
    page.getByRole("complementary", { name: "Properties inspector" }),
  ).toBeVisible();
  await page.screenshot({
    path: "artifacts/visual/editor-mobile.png",
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollHeight <= innerHeight + 1,
    ),
  ).toBe(true);
  const dock = await page
    .getByRole("navigation", { name: "Editor tools" })
    .boundingBox();
  expect(dock?.height).toBeLessThanOrEqual(90);
});

test("two browser tabs cannot overwrite a newer save and can still export the unsaved edit", async ({
  page,
  context,
}) => {
  await page.goto("/editor");
  await expect(
    page.locator('.resume[aria-label="Resume canvas"]'),
  ).toBeVisible();
  // Creation renders the canvas before the route synchronizes its project ID.
  // Both tabs must open that canonical URL to exercise a real revision conflict.
  await expect(page).toHaveURL(/\/editor\/[^/?#]+$/);
  const canonicalUrl = page.url();
  const other = await context.newPage();
  await other.goto(canonicalUrl);
  await expect(other).toHaveURL(canonicalUrl);
  await expect(
    other.locator('.resume[aria-label="Resume canvas"]'),
  ).toBeVisible();
  async function editName(target: typeof page, name: string) {
    await target
      .getByRole("button", { name: "Edit heading: Alex Morgan", exact: true })
      .dblclick();
    await target
      .getByRole("textbox", { name: "Edit text on canvas" })
      .fill(name);
    await target
      .getByRole("textbox", { name: "Edit text on canvas" })
      .press("Control+Enter");
  }
  await editName(page, "Newest saved version");
  await expect(
    page.getByRole("status", { name: "Save status", exact: true }),
  ).toHaveText("Saved");
  await editName(other, "Uncommitted tab version");
  await expect(
    other.getByRole("status", { name: "Save status", exact: true }),
  ).toHaveText("Not saved");
  await other
    .getByRole("button", { name: "Changes are not saved", exact: true })
    .hover();
  await expect(
    other.getByText("This resume changed in another tab.", { exact: false }),
  ).toBeVisible();
  await other.keyboard.press("Escape");
  await other.getByRole("button", { name: "Export", exact: true }).click();
  const downloaded = other.waitForEvent("download");
  await other.getByRole("menuitem", { name: "JSON document" }).click();
  expect((await downloaded).suggestedFilename()).toMatch(/\.json$/);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Newest saved version", exact: true }),
  ).toBeVisible();
  await other.close();
});

test("a proposal preview becomes stale after a human history edit and requires fresh review", async ({
  page,
}) => {
  await page.goto("/editor");
  await expect(
    page.locator('.resume[aria-label="Resume canvas"]'),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Edit heading: Alex Morgan", exact: true })
    .dblclick();
  await page
    .getByRole("textbox", { name: "Edit text on canvas" })
    .fill("Human edit before review");
  await page
    .getByRole("textbox", { name: "Edit text on canvas" })
    .press("Control+Enter");
  await expect(
    page.getByRole("heading", {
      name: "Human edit before review",
      exact: true,
    }),
  ).toBeVisible();
  await openCommands(page);
  await page.getByRole("button", { name: "Load example", exact: true }).click();
  await page.getByRole("button", { name: "Validate & preview" }).click();
  await expect(
    page.getByRole("button", { name: "Apply changes", exact: true }),
  ).toBeEnabled();
  await page
    .getByRole("button", { name: "Validate & preview", exact: true })
    .focus();
  await page.keyboard.press("Control+z");
  await expect(
    page.getByRole("button", { name: "Apply changes", exact: true }),
  ).toBeDisabled();
  await expect(
    page.getByText("The resume changed after this preview.", { exact: false }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Validate & preview" }).click();
  await page
    .getByRole("button", { name: "Apply changes", exact: true })
    .click();
  await closeDialog(page, "Import commands");
  await expect(
    page.getByRole("heading", {
      name: "Alex Morgan",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.locator('.resume[aria-label="Resume canvas"]'),
  ).toContainText("Product designer focused on accessible software.");
});

test("editor intent preloads code without creating a resume; one click creates exactly one record", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("link", { name: "Create a resume", exact: true })
    .hover();
  await page.waitForTimeout(300);
  const before = await page.evaluate(async () => {
    const databases = await indexedDB.databases();
    return databases.some((db) => db.name === "resumi-projects");
  });
  expect(before).toBe(false);
  await page
    .getByRole("link", { name: "Create a resume", exact: true })
    .click();
  await expect(
    page.getByRole("article", { name: "Resume canvas" }),
  ).toBeVisible();
  await expect(page).toHaveURL(/\/editor\/[^/?]+$/);
  expect(
    await page.evaluate(
      () =>
        new Promise<number>((resolve, reject) => {
          const req = indexedDB.open("resumi-projects");
          req.onsuccess = () => {
            const db = req.result,
              tx = db.transaction("projects"),
              count = tx.objectStore("projects").count();
            count.onsuccess = () => {
              resolve(count.result);
              db.close();
            };
            count.onerror = () => reject(count.error);
          };
        }),
    ),
  ).toBe(1);
  await expect(
    page.getByText("Creating your local resume…", { exact: true }),
  ).toHaveCount(0);
});

test("dashboard centers previews, opens an eye preview and supports search, sorting and list view", async ({
  page,
}) => {
  await page.goto("/editor");
  await expect(
    page.getByRole("article", { name: "Resume canvas" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Back to projects" }).click();
  await expect(
    page.getByRole("heading", { name: "Your resumes", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Open Alex Morgan — Resume", exact: true }),
  ).toBeVisible();
  const card = page.getByRole("link", {
    name: "Open Alex Morgan — Resume",
    exact: true,
  });
  const cardBounds = await card.boundingBox();
  const paperBounds = await card.locator(".resume").boundingBox();
  expect(cardBounds).toBeTruthy();
  expect(paperBounds).toBeTruthy();
  expect(
    Math.abs(
      cardBounds!.x +
        cardBounds!.width / 2 -
        (paperBounds!.x + paperBounds!.width / 2),
    ),
  ).toBeLessThan(2);
  await card.hover();
  await page
    .getByRole("button", { name: "Preview Alex Morgan — Resume", exact: true })
    .click();
  const preview = page.getByRole("dialog", {
    name: "Alex Morgan — Resume",
    exact: true,
  });
  await expect(preview).toBeVisible();
  await expect(preview.locator(".resume")).toContainText("Alex Morgan");
  const previewBounds = await preview.locator(".resume").boundingBox();
  expect(previewBounds!.width).toBeGreaterThan(paperBounds!.width);
  await expect(
    preview.getByRole("link", { name: "Edit resume", exact: true }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(preview).toHaveCount(0);
  await page
    .getByRole("button", {
      name: "Actions for Alex Morgan — Resume",
      exact: true,
    })
    .click();
  await page.getByRole("menuitem", { name: "Duplicate", exact: true }).click();
  await expect(
    page.getByRole("link", {
      name: "Open Alex Morgan — Resume (copy)",
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByRole("radio", { name: "List view", exact: true })
    .press("Space");
  await expect(
    page.getByRole("radio", { name: "List view", exact: true }),
  ).toBeChecked();
  await page
    .getByRole("combobox", { name: "Sort resumes", exact: true })
    .click();
  await page.getByRole("option", { name: "Name A–Z", exact: true }).click();
  await page.getByRole("searchbox", { name: "Search resumes" }).fill("(copy)");
  await expect(page.getByRole("link", { name: /^Open / })).toHaveCount(1);
  await page.getByRole("searchbox", { name: "Search resumes" }).fill("");
  await page
    .getByRole("link", {
      name: "Open Alex Morgan — Resume (copy)",
      exact: true,
    })
    .click();
  await expect(
    page.getByRole("article", { name: "Resume canvas" }),
  ).toBeVisible();
});
