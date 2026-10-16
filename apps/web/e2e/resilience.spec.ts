import { test, expect } from "@playwright/test";
import { createResume } from "@resumi/cv";
import { mkdir, writeFile } from "node:fs/promises";

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
  await expect(page.locator(".resume")).toBeVisible();
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
  await expect(page.getByRole("status")).toHaveText("Saved");
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
  await expect(page.locator(".resume")).toBeVisible();
  const openMs = performance.now() - opened;
  await page.getByRole("button", { name: "Profile 1", exact: true }).click();
  await page.getByRole("button", { name: /Edit text: I turn/ }).click();
  const input = page.getByRole("textbox", { name: "Content", exact: true });
  const samples: number[] = [];
  for (let i = 0; i < 10; i++) {
    const started = performance.now();
    await input.fill(`Responsiveness check ${i}`);
    await expect(page.locator(".resume")).toContainText(
      `Responsiveness check ${i}`,
    );
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

test("mobile editor keeps the canvas visible and opens one contextual panel at a time", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/editor");
  await expect(page.locator(".resume")).toBeVisible();
  await expect(
    page.getByRole("complementary", { name: "Document structure" }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("complementary", { name: "Properties inspector" }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Toggle outline" }).click();
  await expect(
    page.getByRole("complementary", { name: "Document structure" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Profile 1", exact: true }).click();
  await page.getByRole("button", { name: "Toggle properties" }).click();
  await expect(
    page.getByRole("complementary", { name: "Document structure" }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("textbox", { name: "Section title" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Close properties" }).click();
  await page.screenshot({
    path: "artifacts/visual/editor-mobile.png",
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("two browser tabs cannot overwrite a newer save and can still export the unsaved edit", async ({
  page,
  context,
}) => {
  await page.goto("/editor");
  await expect(page.locator(".resume")).toBeVisible();
  const other = await context.newPage();
  await other.goto(page.url());
  await expect(other.locator(".resume")).toBeVisible();
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
  await expect(page.getByRole("status")).toHaveText("Saved");
  await editName(other, "Uncommitted tab version");
  await expect(other.getByRole("status")).toHaveText("Not saved");
  await expect(
    other.getByText("This resume changed in another tab.", { exact: false }),
  ).toBeVisible();
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

test("a proposal preview becomes stale after a human canvas edit and requires fresh review", async ({
  page,
}) => {
  await page.goto("/editor");
  await expect(page.locator(".resume")).toBeVisible();
  await page.getByRole("button", { name: "Teammate", exact: true }).click();
  await page.getByRole("button", { name: "Load a working example" }).click();
  await page.getByRole("button", { name: "Validate & preview" }).click();
  await expect(
    page.getByRole("button", { name: "Apply changes", exact: true }),
  ).toBeEnabled();
  await page
    .getByRole("button", { name: "Edit heading: Alex Morgan", exact: true })
    .dblclick();
  await page
    .getByRole("textbox", { name: "Edit text on canvas" })
    .fill("Human change after preview");
  await page
    .getByRole("textbox", { name: "Edit text on canvas" })
    .press("Control+Enter");
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
  await expect(
    page.getByRole("heading", {
      name: "Human change after preview",
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.locator(".resume")).toContainText(
    "I design thoughtful digital products",
  );
});
