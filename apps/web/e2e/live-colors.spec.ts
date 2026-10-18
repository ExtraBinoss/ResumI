import { expect, test, type Page } from "@playwright/test";
import { applyCommands, createDocument, makeLayer } from "@resumi/engine";

async function colorControls(page: Page) {
  await page
    .getByRole("button", { name: "Select layer Name", exact: true })
    .click();
  const heading = page
    .getByRole("article", { name: "Resume canvas" })
    .getByRole("heading", { name: "Alex Morgan", exact: true });
  const original = await heading.evaluate(
    (node) => getComputedStyle(node).color,
  );
  await page.getByRole("button", { name: "Text color", exact: true }).click();
  const popup = page
    .locator('[data-slot="popover-content"]')
    .filter({ has: page.locator('[data-slot="color-picker-area"]') });
  await expect(popup.locator('[data-slot="color-picker-area"]')).toBeVisible();
  return { heading, original, popup };
}

test("visual color drag paints before release and commits exactly one undoable edit", async ({
  page,
}) => {
  await page.goto("/editor");
  const undo = page.getByRole("button", { name: "Undo", exact: true });
  const { heading, original, popup } = await colorControls(page);
  await expect(undo).toBeDisabled();
  const area = (await popup
    .locator('[data-slot="color-picker-area"]')
    .boundingBox())!;
  await page.mouse.move(area.x + area.width * 0.35, area.y + area.height * 0.3);
  await page.mouse.down();
  await page.mouse.move(area.x + area.width * 0.8, area.y + area.height * 0.2, {
    steps: 6,
  });
  await expect(heading).not.toHaveCSS("color", original);
  await expect(undo).toBeDisabled();
  const preview = await heading.evaluate(
    (node) => getComputedStyle(node).color,
  );
  await page.screenshot({
    path: "artifacts/visual/live-color-before-release.png",
  });
  await page.mouse.up();
  await expect(heading).toHaveCSS("color", preview);
  await expect(undo).toBeEnabled();
  await page.keyboard.press("Escape");
  await undo.click();
  await expect(heading).toHaveCSS("color", original);
  await expect(undo).toBeDisabled();
  await page.getByRole("button", { name: "Redo", exact: true }).click();
  await expect(heading).toHaveCSS("color", preview);
});

test("valid HEX typing previews before blur and Escape restores an imported uppercase color without history", async ({
  page,
}) => {
  const document = applyCommands(createDocument("color-study", "Color study"), {
    version: 1,
    actor: { kind: "human", name: "Synthetic test" },
    commands: [
      {
        type: "section.create",
        section: { id: "identity", title: "", blockIds: [] },
      },
      {
        type: "block.create",
        sectionId: "identity",
        block: { id: "name", kind: "heading", text: "Alex Morgan" },
      },
      {
        type: "canvas.enable",
        layers: {
          name: makeLayer("text", {
            name: "Name",
            x: 64,
            y: 64,
            width: 400,
            height: 70,
            fontSize: 38,
            color: "#C53030",
          }),
        },
      },
    ],
  }).document;
  await page.goto("/projects");
  await page.locator("input[type=file]").setInputFiles({
    name: "color-study.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(document)),
  });
  await expect(
    page.getByRole("article", { name: "Resume canvas" }),
  ).toBeVisible();
  const { heading, original, popup } = await colorControls(page);
  expect(original).toBe("rgb(197, 48, 48)");
  const hex = popup.locator('[data-channel="hex"]');
  await hex.fill("2563EB");
  await expect(hex).toBeFocused();
  await expect(heading).toHaveCSS("color", "rgb(37, 99, 235)");
  const undo = page.getByRole("button", { name: "Undo", exact: true });
  await expect(undo).toBeDisabled();
  await page.keyboard.press("Escape");
  await expect(heading).toHaveCSS("color", original);
  await expect(undo).toBeDisabled();
});
