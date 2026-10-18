import { expect, test, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { openDocumentSettings, closeDialog } from "./helpers/editor";

async function loadedInterfaceFont(page: Page) {
  return page.evaluate(async () => {
    const heading = document.querySelector(
      'article[aria-label="Resume canvas"] h1',
    );
    // Recalculate styles before querying FontFaceSet; a CSS family name alone
    // would also pass when the browser is silently drawing a fallback font.
    const family = heading ? getComputedStyle(heading).fontFamily : "";
    const faces = await document.fonts.load(
      "650 38px Interface",
      "Alex Morgan",
    );
    return {
      family,
      loaded: faces.filter(
        (face) => face.family === "Interface" && face.status === "loaded",
      ).length,
    };
  });
}

test("imported font actually loads on canvas, remains embedded in HTML and survives reload", async ({
  page,
}) => {
  await page.goto("/projects");
  await page.getByRole("button", { name: "New resume", exact: true }).click();
  await expect(
    page.getByRole("article", { name: "Resume canvas" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Visual", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  const settings = await openDocumentSettings(page);
  await expect(
    settings.getByRole("button", { name: "Import font", exact: true }),
  ).toHaveCount(0);
  await expect(
    settings.getByRole("combobox", { name: "Typography", exact: true }),
  ).toHaveCount(0);
  await closeDialog(page, "Document settings");
  await page
    .getByRole("button", { name: "Select layer Name", exact: true })
    .click();
  const family = page.getByRole("combobox", {
    name: "Font family",
    exact: true,
  });
  await family.click();
  const chooser = page.waitForEvent("filechooser");
  await page.getByRole("button", { name: "Import font", exact: true }).click();
  const bytes = await readFile(
    "node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2",
  );
  await (
    await chooser
  ).setFiles({
    name: "Interface.woff2",
    mimeType: "font/woff2",
    buffer: bytes,
  });
  await expect(family).toContainText("Interface");
  await family.click();
  await page.getByRole("option", { name: "Interface", exact: true }).click();
  await expect
    .poll(async () => (await loadedInterfaceFont(page)).loaded)
    .toBeGreaterThan(0);
  expect((await loadedInterfaceFont(page)).family).toContain("Interface");
  await page.getByRole("button", { name: "Export", exact: true }).click();
  const pending = page.waitForEvent("download");
  await page
    .getByRole("menuitem", { name: "Portable HTML", exact: true })
    .click();
  const download = await pending;
  const path = await download.path();
  expect(path).toBeTruthy();
  const html = await readFile(path!, "utf8");
  expect(html).toContain(
    "font-family:'Interface';src:url('data:font/woff2;base64,",
  );
  expect(html.includes(bytes.toString("base64"))).toBe(true);
  await expect(
    page.getByRole("status", { name: "Save status", exact: true }),
  ).toHaveText("Saved");
  await page.reload();
  await expect(
    page.getByRole("article", { name: "Resume canvas" }),
  ).toBeVisible();
  await expect
    .poll(async () => (await loadedInterfaceFont(page)).loaded)
    .toBeGreaterThan(0);
  expect((await loadedInterfaceFont(page)).family).toContain("Interface");
});
