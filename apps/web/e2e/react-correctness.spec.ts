import { expect, test, type Locator } from "@playwright/test";

async function compose(editor: Locator, text: string) {
  await editor.dispatchEvent("compositionstart", { data: "" });
  await editor.evaluate((node, value) => {
    node.textContent = value;
  }, text);
  await editor.dispatchEvent("input", {
    inputType: "insertCompositionText",
    data: text,
    isComposing: true,
  });
}

test("IME confirmation never inserts an extra newline or ends native canvas editing", async ({
  page,
}) => {
  await page.goto("/editor");
  const undo = page.getByRole("button", { name: "Undo", exact: true });
  await expect(
    page.getByRole("article", { name: "Resume canvas", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Text", exact: true }).click();
  const field = page.getByRole("textbox", {
    name: "Text content: Name",
    exact: true,
  });
  const original = await field.textContent();
  await field.focus();
  await compose(field, "日");
  await field.dispatchEvent("keydown", {
    key: "Enter",
    code: "Enter",
    isComposing: true,
    bubbles: true,
    cancelable: true,
  });
  await expect(field).toHaveText("日");
  await expect(undo).toBeDisabled();
  await field.dispatchEvent("compositionend", { data: "日" });
  await field.dispatchEvent("input", {
    inputType: "insertText",
    data: "日",
    isComposing: false,
  });
  await expect(undo).toBeEnabled();
  await undo.click();
  await expect(field).toHaveText(original!);
  await page.getByRole("button", { name: "Visual", exact: true }).click();
  await page
    .getByRole("button", { name: "Edit heading: Alex Morgan", exact: true })
    .dblclick();
  const canvasText = page.getByRole("textbox", {
    name: "Edit text on canvas",
    exact: true,
  });
  await compose(canvasText, "日本");
  await canvasText.dispatchEvent("keydown", {
    key: "Enter",
    code: "Enter",
    ctrlKey: true,
    isComposing: true,
    bubbles: true,
    cancelable: true,
  });
  await expect(canvasText).toBeFocused();
  await expect(canvasText).toHaveText("日本");
  await expect(undo).toBeDisabled();
  await canvasText.dispatchEvent("compositionend", { data: "日本" });
  await expect(undo).toBeEnabled();
  await canvasText.press("Control+Enter");
  await undo.click();
  await expect(
    page.getByRole("heading", { name: "Alex Morgan", exact: true }),
  ).toBeVisible();
});

test("locale drafts follow a saved rename, undo and redo while the language dialog stays open", async ({
  page,
}) => {
  await page.goto("/editor");
  await expect(
    page.getByRole("article", { name: "Resume canvas", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: /^Project:/ }).click();
  await page
    .getByRole("button", { name: "Manage languages", exact: true })
    .click();
  const dialog = page.getByRole("dialog", {
    name: "CV languages",
    exact: true,
  });
  const name = dialog.getByRole("textbox", {
    name: "Language name: English",
    exact: true,
  });
  const row = dialog
    .locator('input[value="en"]')
    .locator("xpath=ancestor::div[button][1]");
  await name.fill("Synthetic English");
  await row.getByRole("button", { name: "Save", exact: true }).click();
  const renamed = dialog.getByRole("textbox", {
    name: "Language name: Synthetic English",
    exact: true,
  });
  await expect(renamed).toHaveValue("Synthetic English");
  await expect(
    row.getByRole("button", { name: "Save", exact: true }),
  ).toBeDisabled();
  await dialog.getByRole("button", { name: "Close", exact: true }).focus();
  await page.keyboard.press("Control+z");
  await expect(name).toHaveValue("English");
  await expect(
    row.getByRole("button", { name: "Save", exact: true }),
  ).toBeDisabled();
  await page.keyboard.press("Control+Shift+z");
  await expect(renamed).toHaveValue("Synthetic English");
  await expect(
    row.getByRole("button", { name: "Save", exact: true }),
  ).toBeDisabled();
});

test("a layer row supports both Enter and Space selection without changing document history", async ({
  page,
}) => {
  await page.goto("/editor");
  const layer = page.getByRole("button", {
    name: "Select layer Name",
    exact: true,
  });
  await expect(layer).toBeVisible();
  await layer.focus();
  await page.keyboard.press("Space");
  await expect(layer).toHaveAttribute("aria-pressed", "true");
  await page.keyboard.press("Escape");
  await expect(layer).toHaveAttribute("aria-pressed", "false");
  await layer.focus();
  await page.keyboard.press("Enter");
  await expect(layer).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.getByRole("button", { name: "Undo", exact: true }),
  ).toBeDisabled();
});

for (const reducedMotion of ["no-preference", "reduce"] as const) {
  test(`native Dock toggles Visual and Text with visible tools and ${reducedMotion} motion`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion });
    await page.goto("/editor");
    const visual = page.getByRole("button", { name: "Visual", exact: true });
    const text = page.getByRole("button", { name: "Text", exact: true });
    const select = page.getByRole("button", { name: "Select", exact: true });
    await expect(select).toBeVisible();
    await expect(select).toBeInViewport();
    await visual.click();
    await expect(
      page.getByRole("article", { name: "Text workspace", exact: true }),
    ).toBeVisible();
    await expect(select).toHaveCount(0);
    await expect(text).toHaveAttribute("aria-pressed", "true");
    await text.click();
    await expect(
      page.getByRole("article", { name: "Resume canvas", exact: true }),
    ).toBeVisible();
    await expect(select).toBeVisible();
    await expect(select).toBeInViewport();
    await expect(visual).toHaveAttribute("aria-pressed", "true");
    await expect(
      page.getByRole("button", { name: "Undo", exact: true }),
    ).toBeDisabled();
  });
}
