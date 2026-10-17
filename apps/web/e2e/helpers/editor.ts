import { expect, type Page } from "@playwright/test";

export async function openProjectMenu(page: Page) {
  await page.getByRole("button", { name: /^Project: / }).click();
}
export async function openSource(page: Page) {
  await openProjectMenu(page);
  await page.getByRole("button", { name: "Edit source", exact: true }).click();
  await expect(
    page.getByRole("dialog", { name: "Source", exact: true }),
  ).toBeVisible();
}
export async function openCommands(page: Page) {
  await openProjectMenu(page);
  await page
    .getByRole("button", { name: "Import commands", exact: true })
    .click();
  await expect(
    page.getByRole("dialog", { name: "Import commands", exact: true }),
  ).toBeVisible();
}
export async function closeDialog(
  page: Page,
  name: "Source" | "Import commands",
) {
  await page
    .getByRole("dialog", { name, exact: true })
    .getByRole("button", { name: "Close", exact: true })
    .click();
}
