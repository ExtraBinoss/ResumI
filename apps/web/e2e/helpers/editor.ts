import { expect, type Page } from "@playwright/test";

export async function openProjectMenu(page: Page) {
  await page.getByRole("button", { name: /^Project: / }).click();
}
export async function openDocumentSettings(page: Page) {
  await openProjectMenu(page);
  await page
    .getByRole("button", { name: "Document settings", exact: true })
    .click();
  const dialog = page.getByRole("dialog", {
    name: "Document settings",
    exact: true,
  });
  await expect(dialog).toBeVisible();
  return dialog;
}
export async function openCommands(page: Page) {
  await page.keyboard.press("Control+Alt+Enter");
  await expect(
    page.getByRole("dialog", { name: "Import commands", exact: true }),
  ).toBeVisible();
}
export async function closeDialog(
  page: Page,
  name: "Import commands" | "Document settings",
) {
  await page
    .getByRole("dialog", { name, exact: true })
    .getByRole("button", { name: "Close", exact: true })
    .click();
}
