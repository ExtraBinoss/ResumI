import { expect, test, type Page, type BrowserContext } from "@playwright/test";
import { openCommands, closeDialog } from "./helpers/editor";

async function clipboard(context: BrowserContext, page: Page) {
  await context.grantPermissions(["clipboard-read", "clipboard-write"], {
    origin: new URL(page.url()).origin,
  });
  await page.bringToFront();
}
async function renameOnCanvas(page: Page, name: string) {
  await page
    .getByRole("button", { name: "Edit heading: Alex Morgan", exact: true })
    .dblclick();
  const editor = page.getByRole("textbox", {
    name: "Edit text on canvas",
    exact: true,
  });
  await editor.fill(name);
  await editor.press("Control+Enter");
}

test("source compiler errors expose complete copyable details and preserve the saved preview", async ({
  page,
  context,
}) => {
  await page.goto("/editor?template=react-classic");
  const canvas = page.getByRole("article", {
    name: "Resume canvas",
    exact: true,
  });
  await expect(canvas).toBeVisible();
  await clipboard(context, page);
  await openCommands(page);
  const dialog = page.getByRole("dialog", {
    name: "Import commands",
    exact: true,
  });
  await dialog
    .getByRole("textbox", { name: "Command proposal", exact: true })
    .fill(
      JSON.stringify({
        version: 1,
        actor: { kind: "agent", name: "Invalid synthetic source" },
        commands: [
          {
            type: "source.set",
            source: {
              format: "react",
              code: "export default function Resume( { return <p>",
              enabled: true,
            },
          },
        ],
      }),
    );
  await dialog
    .getByRole("button", { name: "Validate & preview", exact: true })
    .click();
  await dialog
    .getByRole("button", { name: "Apply changes", exact: true })
    .click();
  const error = dialog.getByRole("alert").filter({ has: page.locator("pre") });
  await expect(error).toContainText("Proposal rejected");
  await expect(error).toContainText(/Resume.tsx|Unexpected token|expected/i);
  const details = await error.locator("pre").innerText();
  await error
    .getByRole("button", { name: "Copy error details", exact: true })
    .click();
  await expect(
    error.getByRole("button", { name: "Error details copied", exact: true }),
  ).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => navigator.clipboard.readText()))
    .toBe(details);
  await closeDialog(page, "Import commands");
  await expect(
    canvas.getByRole("heading", { name: "Alex Morgan", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Undo", exact: true }),
  ).toBeDisabled();
});

test("saved state stays visually quiet; stale saves reveal warning details on hover and keyboard activation", async ({
  page,
  context,
}) => {
  await page.goto("/editor");
  await expect(
    page.getByRole("article", { name: "Resume canvas" }),
  ).toBeVisible();
  const saved = page.getByRole("status", { name: "Save status", exact: true });
  await expect(saved).toHaveText("Saved");
  await expect(saved).toHaveClass("srOnly");
  const savedBox = (await saved.boundingBox())!;
  expect(savedBox.width).toBeLessThanOrEqual(1);
  expect(savedBox.height).toBeLessThanOrEqual(1);
  await expect(
    page.getByRole("button", { name: "Changes are not saved", exact: true }),
  ).toHaveCount(0);
  const stale = await context.newPage();
  await stale.goto(page.url());
  await expect(
    stale.getByRole("article", { name: "Resume canvas" }),
  ).toBeVisible();
  await renameOnCanvas(page, "Newest synthetic version");
  await expect(saved).toHaveText("Saved");
  await renameOnCanvas(stale, "Unsaved synthetic version");
  await expect(
    stale.getByRole("status", { name: "Save status", exact: true }),
  ).toHaveText("Not saved");
  await clipboard(context, stale);
  const warning = stale.getByRole("button", {
    name: "Changes are not saved",
    exact: true,
  });
  await expect(warning.locator("svg")).toHaveCount(1);
  await warning.hover();
  const error = stale.getByRole("alert");
  await expect(error).toContainText("This resume changed in another tab.");
  const details = await error.locator("pre").innerText();
  await error
    .getByRole("button", { name: "Copy error details", exact: true })
    .click();
  await expect
    .poll(() => stale.evaluate(() => navigator.clipboard.readText()))
    .toBe(details);
  await stale.keyboard.press("Escape");
  await expect(error).toHaveCount(0);
  await warning.focus();
  await warning.press("Space");
  await expect(error).toContainText("This resume changed in another tab.");
  await expect(
    error.getByRole("button", { name: "Retry save", exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", {
      name: "Newest synthetic version",
      exact: true,
    }),
  ).toBeVisible();
  await stale.close();
});

test("font import failures use the same warning and clipboard action in an editor toast", async ({
  page,
  context,
}) => {
  await page.goto("/editor");
  await expect(
    page.getByRole("article", { name: "Resume canvas" }),
  ).toBeVisible();
  await clipboard(context, page);
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
  await (
    await chooser
  ).setFiles({
    name: "not-a-font.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("Synthetic invalid font"),
  });
  await page.keyboard.press("Escape");
  await expect(family).toHaveAttribute("aria-expanded", "false");
  const toast = page.getByRole("alert").filter({
    has: page.getByRole("button", { name: "Dismiss error", exact: true }),
  });
  await expect(toast).toContainText("Action failed");
  await toast
    .getByRole("button", { name: "Action failed", exact: true })
    .hover();
  const details = page.getByRole("alert").filter({ has: page.locator("pre") });
  await expect(details).toContainText("Choose a TTF, OTF, WOFF or WOFF2 font.");
  await details
    .getByRole("button", { name: "Copy error details", exact: true })
    .click();
  await expect
    .poll(() => page.evaluate(() => navigator.clipboard.readText()))
    .toBe("Choose a TTF, OTF, WOFF or WOFF2 font.");
  await page.keyboard.press("Escape");
  await toast
    .getByRole("button", { name: "Dismiss error", exact: true })
    .click();
  await expect(toast).toHaveCount(0);
});
