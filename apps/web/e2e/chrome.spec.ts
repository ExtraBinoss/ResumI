import { expect, test } from "@playwright/test";

test("compact editor controls expose primary export, zoom steps and mode toggling", async ({
  page,
}) => {
  await page.goto("/editor");
  const canvas = page.getByRole("article", { name: "Resume canvas" });
  await expect(canvas).toBeVisible();
  const toolbar = page.locator("header").filter({
    has: page.getByRole("button", { name: "Export", exact: true }),
  });
  await expect(
    toolbar.getByRole("button", { name: "Export", exact: true }),
  ).toHaveAttribute("data-variant", "filled");
  await expect(
    page.getByRole("status", { name: "Save status", exact: true }),
  ).toHaveClass("srOnly");
  await expect(
    page.getByRole("button", { name: "Changes are not saved", exact: true }),
  ).toHaveCount(0);
  const zoom = page.getByRole("spinbutton", {
    name: "Canvas zoom",
    exact: true,
  });
  const initial = Number(await zoom.inputValue());
  await page.getByRole("button", { name: "Zoom in", exact: true }).click();
  await expect(zoom).toHaveValue(String(initial + 10));
  await page.getByRole("button", { name: "Zoom out", exact: true }).click();
  await expect(zoom).toHaveValue(String(initial));
  await page.getByRole("button", { name: "Visual", exact: true }).click();
  await expect(
    page.getByRole("textbox", { name: "Text content: Name", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Text", exact: true }).click();
  await expect(canvas).toBeVisible();
  const toolbarBox = (await toolbar.boundingBox())!;
  expect(toolbarBox.width).toBeLessThan(720);
  await expect
    .poll(
      async () =>
        (await page
          .getByRole("complementary", { name: "Layers panel" })
          .boundingBox())!.width,
    )
    .toBe(260);
  await expect
    .poll(
      async () =>
        (await page
          .getByRole("complementary", { name: "Properties inspector" })
          .boundingBox())!.width,
    )
    .toBe(300);
});

test("project names commit on blur or Enter and Escape discards an unfinished name", async ({
  page,
}) => {
  await page.goto("/editor");
  await expect(
    page.getByRole("article", { name: "Resume canvas" }),
  ).toBeVisible();
  await page.getByRole("button", { name: /^Project: / }).click();
  const name = page.getByRole("textbox", { name: "Project name", exact: true });
  await name.fill("Design application");
  await name.press("Tab");
  await expect(
    page.getByRole("button", {
      name: "Project: Design application",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Save name", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Edit source", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Import commands", exact: true }),
  ).toHaveCount(0);
  await page.keyboard.press("Escape");
  await page
    .getByRole("button", { name: "Project: Design application", exact: true })
    .click();
  await name.fill("Discard this name");
  await name.press("Escape");
  await expect(
    page.getByRole("button", {
      name: "Project: Design application",
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Project: Design application", exact: true })
    .click();
  await name.fill("Final application");
  await name.press("Enter");
  await expect(
    page.getByRole("button", {
      name: "Project: Final application",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("status", { name: "Save status", exact: true }),
  ).toHaveText("Saved");
  await page.reload();
  await expect(
    page.getByRole("button", {
      name: "Project: Final application",
      exact: true,
    }),
  ).toBeVisible();
});

test("unknown routes show a clear themed recovery page with working project navigation", async ({
  page,
}) => {
  const response = await page.goto("/this-resume-does-not-exist");
  expect(response?.status()).toBe(404);
  await expect(
    page.getByRole("heading", { name: "Page not found", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Check the address, or return to your projects.", {
      exact: true,
    }),
  ).toBeVisible();
  await page.getByRole("link", { name: "All projects", exact: true }).click();
  await expect(page).toHaveURL(/\/projects$/);
  await expect(
    page.getByRole("heading", { name: "Your resumes", exact: true }),
  ).toBeVisible();
});

test("missing resumes and denied storage use the same clear recovery with copyable errors", async ({
  page,
}) => {
  await page.goto("/editor/missing");
  await expect(
    page.getByRole("heading", { name: "Resume not found", exact: true }),
  ).toBeVisible();
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
  await page.goto("/editor");
  await expect(
    page.getByRole("heading", {
      name: "Could not open your workspace.",
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.getByRole("alert")).toContainText(
    "Could not access local storage.",
  );
  await expect(
    page.getByRole("button", { name: "Copy error details", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "All projects", exact: true }),
  ).toBeVisible();
});
