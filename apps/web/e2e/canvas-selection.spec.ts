import { expect, test, type Page, type Locator } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { applyCommands, createDocument, makeLayer } from "@resumi/engine";

async function openSelectionFixture(page: Page, photo = false) {
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
        ...(photo
          ? [
              {
                type: "block.create" as const,
                sectionId: "content",
                block: {
                  id: "photo",
                  kind: "image" as const,
                  text: "",
                  design: makeLayer("image", {
                    name: "Synthetic portrait",
                    x: 100,
                    y: 220,
                    width: 120,
                    height: 90,
                    src: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
                    alt: "Synthetic portrait",
                  }),
                },
              },
            ]
          : []),
        {
          type: "canvas.enable",
          layers: {
            ...(photo
              ? {
                  photo: makeLayer("image", {
                    name: "Synthetic portrait",
                    x: 100,
                    y: 220,
                    width: 120,
                    height: 90,
                    src: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
                    alt: "Synthetic portrait",
                  }),
                }
              : {}),
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
        ...(photo
          ? [
              {
                type: "group.create" as const,
                id: "portrait-group",
                ids: ["alpha", "photo"],
                name: "Portrait identity",
              },
              {
                type: "group.update" as const,
                id: "portrait-group",
                patch: { opacity: 0.6, blendMode: "multiply" as const },
              },
            ]
          : []),
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

test("visual hover chrome stays independent of selection and a grouped photo drills down without history", async ({
  page,
}) => {
  const { alpha, beta } = await openSelectionFixture(page, true);
  const photo = page.locator('[data-layer-name="Synthetic portrait"]');
  const photoId = (await photo.getAttribute("data-layer-id"))!;
  const betaId = (await beta.getAttribute("data-layer-id"))!;
  const frame = page.locator(`[data-hover-frame="${photoId}"]`);
  const selectedFrame = page.locator(`[data-layer-frame="${betaId}"]`);
  const undo = page.getByRole("button", { name: "Undo", exact: true });
  await beta.getByRole("button").click();
  await photo.hover();
  await expect(frame).toBeVisible();
  await expect(frame).toContainText("Synthetic portrait");
  await expect(frame.locator("button")).toHaveCount(0);
  await expect(selectedFrame.locator("[data-handle]")).toHaveCount(8);
  await expect(beta.getByRole("button")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(photo.getByRole("button")).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  expect(
    await frame.evaluate((node) => node.closest("[data-group-id]")),
  ).toBeNull();
  expect(await frame.evaluate((node) => getComputedStyle(node).zIndex)).toBe(
    "0",
  );
  expect(
    await selectedFrame.evaluate((node) => getComputedStyle(node).zIndex),
  ).toBe("1");
  await alpha.hover();
  await expect(frame).toHaveCount(0);
  await expect(page.locator("[data-hover-frame]")).toContainText("Alpha");
  await expect(undo).toBeDisabled();
  await mkdir("artifacts/visual", { recursive: true });
  await page.screenshot({
    path: "artifacts/visual/hover-alpha-beta-selected.png",
    animations: "disabled",
  });

  await page.emulateMedia({ reducedMotion: "reduce" });
  await photo.hover();
  expect(
    await frame.evaluate(
      (node) => getComputedStyle(node, "::after").animationName,
    ),
  ).toBe("none");
  await photo.getByRole("button").click();
  await expect(
    page.getByRole("textbox", { name: "Group name", exact: true }),
  ).toBeVisible();
  await photo.getByRole("button").dblclick();
  await expect(photo.getByRole("button")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(alpha.getByRole("button")).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  await expect(beta.getByRole("button")).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  await expect(
    page.getByRole("combobox", { name: "Image fit", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("textbox", { name: "Edit text on canvas", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.locator(`[data-layer-frame="${photoId}"] [data-handle]`),
  ).toHaveCount(8);
  await expect(page.locator("[data-group-id]")).toHaveCount(1);
  expect(await position(photo)).toEqual({ x: 100, y: 220 });
  await expect(undo).toBeDisabled();
  await page.screenshot({
    path: "artifacts/visual/grouped-photo-drilldown.png",
    animations: "disabled",
  });
});

test("visual: hovering Layers identifies the exact child or group on canvas without changing selection", async ({
  page,
}) => {
  const { alpha, beta } = await openSelectionFixture(page, true);
  await beta.getByRole("button").click();
  const photo = page.locator('[data-layer-name="Synthetic portrait"]'),
    photoId = (await photo.getAttribute("data-layer-id"))!,
    alphaId = (await alpha.getAttribute("data-layer-id"))!,
    frame = page.locator('[data-hover-source="layers"]'),
    photoRow = page.locator(`[data-layer-row="${photoId}"]`),
    groupRow = page.getByRole("button", {
      name: "Select group Portrait identity",
      exact: true,
    });
  const groupId = (await page
    .locator("[data-layer-group]")
    .filter({ has: groupRow })
    .getAttribute("data-layer-group"))!;
  await photoRow.hover();
  await expect(frame).toHaveCount(1);
  await expect(frame).toHaveAttribute("data-hover-frame", photoId);
  await expect(frame).toContainText("Synthetic portrait");
  const photoBox = (await photo.boundingBox())!,
    frameBox = (await frame.boundingBox())!;
  expect(Math.abs(frameBox.x - photoBox.x)).toBeLessThan(1);
  expect(Math.abs(frameBox.y - photoBox.y)).toBeLessThan(1);
  expect(Math.abs(frameBox.width - photoBox.width)).toBeLessThan(1);
  expect(Math.abs(frameBox.height - photoBox.height)).toBeLessThan(1);
  await expect(beta.getByRole("button")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(photo.getByRole("button")).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  await expect(frame.locator("[data-handle]")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Undo", exact: true }),
  ).toBeDisabled();
  await page.screenshot({
    path: "artifacts/visual/layers-photo-hover.png",
    animations: "disabled",
  });

  await groupRow.hover();
  await expect(frame).toHaveAttribute("data-hover-frame", groupId);
  await expect(frame).toContainText("Portrait identity");
  await expect(frame).toHaveCSS("left", "100px");
  await expect(frame).toHaveCSS("top", "100px");
  await expect(frame).toHaveCSS("width", "120px");
  await expect(frame).toHaveCSS("height", "210px");
  await page.locator(`[data-layer-row="${alphaId}"]`).hover();
  await expect(frame).toHaveCount(1);
  await expect(frame).toHaveAttribute("data-hover-frame", alphaId);
  await expect(frame).toContainText("Alpha");
  await expect(alpha.getByRole("button")).toHaveAttribute(
    "aria-pressed",
    "false",
  );

  await page.getByRole("heading", { name: "Layers", exact: true }).hover();
  await expect(frame).toHaveCount(0);
  await photoRow
    .getByRole("button", { name: "Hide layer Synthetic portrait", exact: true })
    .click();
  await photoRow.hover();
  await expect(frame).toHaveCount(0);
  await groupRow.hover();
  await expect(frame).toHaveAttribute("data-hover-frame", groupId);
  await expect(frame).toHaveCSS("height", "60px");
});
