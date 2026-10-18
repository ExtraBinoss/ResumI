import { expect, test } from "@playwright/test";
import type { Document } from "@resumi/engine";
import { mkdir, readFile } from "node:fs/promises";

test("CV language management in the project menu edits section translations and preserves them in JSON", async ({
  page,
}) => {
  await page.goto("/editor");
  await expect(
    page.getByRole("article", { name: "Resume canvas" }),
  ).toBeVisible();
  await page.getByRole("button", { name: /^Project:/ }).click();
  await page
    .getByRole("button", { name: "Manage languages", exact: true })
    .click();
  const manager = page.getByRole("dialog", {
    name: "CV languages",
    exact: true,
  });
  await manager
    .getByRole("textbox", { name: "Language name", exact: true })
    .fill("Français");
  await manager.getByRole("button", { name: "Add", exact: true }).click();
  await expect(page.locator('[data-slot="dialog-content"]')).toBeHidden();
  await page
    .getByRole("button", { name: "Manage languages", exact: true })
    .click();
  const title = manager.getByRole("textbox", {
    name: "Section title: Experience",
    exact: true,
  });
  await title.fill("Expériences");
  await expect(title).toHaveValue("Expériences");
  await expect(manager).toHaveCSS("opacity", "1");
  await mkdir("artifacts/visual", { recursive: true });
  await page.screenshot({ path: "artifacts/visual/cv-section-languages.png" });
  await manager.getByRole("button", { name: "Close", exact: true }).click();
  await expect(page.locator('[data-slot="dialog-content"]')).toBeHidden();
  await expect(
    page.getByRole("button", { name: "Manage languages", exact: true }),
  ).toBeFocused();
  await page.getByRole("button", { name: "Export", exact: true }).click();
  const pending = page.waitForEvent("download");
  await page
    .getByRole("menuitem", { name: "JSON document", exact: true })
    .click();
  const download = await pending;
  const doc = JSON.parse(
    await readFile((await download.path())!, "utf8"),
  ) as Document;
  const section = Object.values(doc.sections).find(
    (item) => item.title === "Experience",
  )!;
  expect(section.titleTranslations?.fr).toBe("Expériences");
  expect(doc.localization?.activeLocale).toBe("fr");
  await page.getByRole("button", { name: /^Project:/ }).click();
  await page
    .getByRole("button", { name: "Manage languages", exact: true })
    .click();
  await manager
    .getByRole("button", { name: "Use original text: Experience", exact: true })
    .click();
  await expect(title).toHaveValue("Experience");
});
