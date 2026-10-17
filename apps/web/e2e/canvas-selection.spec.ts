import { expect, test, type Page, type Locator } from "@playwright/test";
import { applyCommands, createDocument, makeLayer } from "@resumi/engine";

async function openSelectionFixture(page: Page) {
  const document = applyCommands(
    createDocument("selection-fixture", "Selection study"),
    {
      version: 1,
      actor: { kind: "human", name: "Synthetic test" },
      commands: [
        {
          type: "section.create",
          section: { id: "content", title: "", blockIds: [] },
        },
        ...["alpha", "beta", "target"].map((id) => ({
          type: "block.create" as const,
          sectionId: "content",
          block: {
            id,
            kind: "text" as const,
            text:
              id === "alpha"
                ? "Alpha"
                : id === "beta"
                  ? "Beta"
                  : "Guide target",
          },
        })),
        {
          type: "canvas.enable",
          layers: {
            alpha: makeLayer("text", {
              name: "Alpha",
              x: 100,
              y: 100,
              width: 100,
              height: 60,
            }),
            beta: makeLayer("text", {
              name: "Beta",
              x: 250,
              y: 100,
              width: 100,
              height: 60,
            }),
            target: makeLayer("text", {
              name: "Guide target",
              x: 450,
              y: 320,
              width: 100,
              height: 60,
            }),
          },
        },
      ],
    },
  ).document;
  await page.goto("/projects");
  await page.locator("input[type=file]").setInputFiles({
    name: "selection-study.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(document)),
  });
  await expect(
    page.getByRole("article", { name: "Resume canvas" }),
  ).toBeVisible();
  const alpha = page.locator('[data-layer-name="Alpha"]'),
    beta = page.locator('[data-layer-name="Beta"]');
  await expect(alpha).toBeInViewport();
  return { alpha, beta };
}

async function position(layer: Locator) {
  return layer.evaluate((node) => ({
    x: Number.parseFloat((node as HTMLElement).style.left),
    y: Number.parseFloat((node as HTMLElement).style.top),
  }));
}

test("Ctrl/Cmd canvas selection groups layers and drags their shared bounds onto live guides in one undo step", async ({
  page,
}) => {
  const { alpha, beta } = await openSelectionFixture(page);
  const alphaButton = alpha.getByRole("button"),
    betaButton = beta.getByRole("button");
  await alphaButton.click();
  await betaButton.click({ modifiers: ["Control"] });
  await expect(alphaButton).toHaveAttribute("aria-pressed", "true");
  await expect(betaButton).toHaveAttribute("aria-pressed", "true");
  await betaButton.click({ modifiers: ["Meta"] });
  await expect(betaButton).toHaveAttribute("aria-pressed", "false");
  await betaButton.click({ modifiers: ["Meta"] });
  await page.keyboard.press("Control+g");
  const group = page.locator("[data-group-id]");
  await expect(group).toHaveCount(1);
  await expect(
    page.getByRole("textbox", { name: "Group name", exact: true }),
  ).toBeVisible();
  // Moving one member must retain both the selection and group inspector.
  const box = (await alpha.boundingBox())!,
    paper = (await page
      .getByRole("article", { name: "Resume canvas" })
      .boundingBox())!,
    scale = paper.width / 794;
  await page.mouse.move(box.x + 20 * scale, box.y + 20 * scale);
  await page.mouse.down();
  await page.mouse.move(box.x + 117 * scale, box.y + 50 * scale, { steps: 8 });
  await expect(alpha).toHaveCSS("translate", "100px 30px");
  await expect(beta).toHaveCSS("translate", "100px 30px");
  await expect(page.locator('[data-guide="x"]')).toHaveCSS("display", "block");
  await expect(page.locator('[data-guide="x"]')).toHaveCSS("left", "450px");
  expect(await position(alpha)).toEqual({ x: 100, y: 100 });
  expect(await position(beta)).toEqual({ x: 250, y: 100 });
  await page.screenshot({ path: "artifacts/visual/group-guides-live.png" });
  await page.mouse.up();
  await expect.poll(() => position(alpha)).toEqual({ x: 200, y: 130 });
  await expect.poll(() => position(beta)).toEqual({ x: 350, y: 130 });
  await expect(
    page.getByRole("textbox", { name: "Group name", exact: true }),
  ).toBeVisible();
  await expect(page.locator('[data-guide="x"]')).toHaveCSS("display", "none");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect.poll(() => position(alpha)).toEqual({ x: 100, y: 100 });
  await expect.poll(() => position(beta)).toEqual({ x: 250, y: 100 });
  await expect(group).toHaveCount(1);
  await page.keyboard.press("Control+Shift+g");
  await expect(group).toHaveCount(0);
  // Ungroup on an ordinary multi-selection must never accidentally create a group.
  await page.keyboard.press("Control+Shift+g");
  await expect(group).toHaveCount(0);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(group).toHaveCount(1);
});

test("Ctrl/Cmd layer-list selection matches the canvas and ends an active text editor before moving", async ({
  page,
}) => {
  const { alpha, beta } = await openSelectionFixture(page);
  const alphaRow = page.getByRole("button", {
      name: "Select layer Alpha",
      exact: true,
    }),
    betaRow = page.getByRole("button", {
      name: "Select layer Beta",
      exact: true,
    });
  await alphaRow.click();
  await betaRow.click({ modifiers: ["Control"] });
  await expect(alphaRow).toHaveAttribute("aria-pressed", "true");
  await expect(betaRow).toHaveAttribute("aria-pressed", "true");
  await betaRow.click({ modifiers: ["Meta"] });
  await expect(betaRow).toHaveAttribute("aria-pressed", "false");
  await alpha.getByRole("button").dblclick();
  const input = page.getByRole("textbox", {
    name: "Edit text on canvas",
    exact: true,
  });
  await expect(input).toBeFocused();
  await beta.getByRole("button").click({ modifiers: ["Control"] });
  await expect(input).toHaveCount(0);
  await expect(alphaRow).toHaveAttribute("aria-pressed", "true");
  await expect(betaRow).toHaveAttribute("aria-pressed", "true");
  // The old contenteditable cannot consume the group shortcut or subsequent arrows.
  await page.keyboard.press("Control+g");
  await expect(page.locator("[data-group-id]")).toHaveCount(1);
  await page.keyboard.press("Shift+ArrowRight");
  await expect.poll(() => position(alpha)).toEqual({ x: 110, y: 100 });
  await expect.poll(() => position(beta)).toEqual({ x: 260, y: 100 });
  await expect(alpha).toContainText("Alpha");
  await expect(beta).toContainText("Beta");
});
