import { expect, test, type Locator, type Page } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import {
  applyCommands,
  createDocument,
  makeLayer,
  type Command,
} from "../../../packages/engine/src";

function fixture() {
  const commands: Command[] = [
    {
      type: "section.create",
      section: { id: "content", title: "Content", blockIds: [] },
    },
    { type: "canvas.enable", layers: {} },
    ...["Name", "Role", "Email", "Location", "Headline"].map((name, index) => ({
      type: "block.create" as const,
      sectionId: "content",
      block: {
        id: name.toLowerCase(),
        kind: "text" as const,
        text: name,
        design: makeLayer("text", {
          name,
          x: 48,
          y: 48 + index * 40,
          width: 300,
          height: 28,
        }),
      },
    })),
    {
      type: "group.create",
      id: "identity",
      ids: ["name", "role"],
      name: "Identity",
    },
    {
      type: "group.create",
      id: "contact",
      ids: ["email", "location"],
      name: "Contact",
    },
    { type: "group.update", id: "identity", patch: { collapsed: true } },
    { type: "group.update", id: "contact", patch: { collapsed: true } },
  ];
  return applyCommands(
    createDocument("group-accordion", "Group interaction QA"),
    {
      version: 1,
      actor: { kind: "agent", name: "Synthetic QA" },
      commands,
    },
  ).document;
}
async function open(page: Page, document = fixture()) {
  await page.goto("/projects");
  await expect(
    page.getByRole("button", { name: "New resume", exact: true }),
  ).toBeVisible();
  await expect(page.locator("input[type=file]")).toBeEnabled();
  await page.locator("input[type=file]").setInputFiles({
    name: "synthetic-groups.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(document)),
  });
  await expect(
    page.getByRole("article", { name: "Resume canvas" }),
  ).toBeVisible();
  await expect(page.locator("[data-layer-group]")).toHaveCount(2);
}
const label = (id: string) => id.charAt(0).toUpperCase() + id.slice(1);
const group = (page: Page, id: string) =>
  page
    .getByRole("button", { name: `Select group ${label(id)}`, exact: true })
    .locator("xpath=ancestor::*[@data-layer-group][1]");
const row = (page: Page, id: string) =>
  page
    .getByRole("button", { name: `Select layer ${label(id)}`, exact: true })
    .locator("..");
const header = (page: Page, id: string) =>
  group(page, id).locator(`[data-layer-reorder-kind="group"]`).first();
async function drag(
  page: Page,
  source: Locator,
  target: Locator,
  edge: "middle" | "top" | "bottom" = "middle",
) {
  // An accordion row has its final box before its parent reveals its center.
  // Wait for the real press point to receive events after expansion/undo/redo.
  const press = (await source.boundingBox())!;
  await source.click({
    trial: true,
    position: { x: press.width * 0.4, y: press.height / 2 },
  });
  const from = (await source.boundingBox())!,
    to = (await target.boundingBox())!;
  await page.mouse.move(from.x + from.width * 0.4, from.y + from.height / 2);
  await page.mouse.down();
  await page.mouse.move(
    from.x + from.width * 0.4 + 10,
    from.y + from.height / 2,
    { steps: 3 },
  );
  await page.mouse.move(
    to.x + to.width * 0.4,
    edge === "middle"
      ? to.y + to.height / 2
      : edge === "top"
        ? to.y + 3
        : to.y + to.height - 3,
    { steps: 10 },
  );
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve());
      }),
  );
  // Rows move during the preview; keep the pointer over the actual destination.
  for (let i = 0; i < 3; i++) {
    await page.evaluate(
      () =>
        new Promise<void>((resolve) => {
          requestAnimationFrame(() => resolve());
        }),
    );
    const current = (await target.boundingBox())!;
    await page.mouse.move(
      current.x + current.width * 0.4,
      edge === "middle"
        ? current.y + current.height / 2
        : edge === "top"
          ? current.y + 3
          : current.y + current.height - 3,
      { steps: 2 },
    );
  }
}
async function saved(page: Page) {
  await expect(
    page.getByRole("status", { name: "Save status", exact: true }),
  ).toHaveText("Saved");
}

async function storedDocument(page: Page) {
  return page.evaluate(async () => {
    const id = location.pathname.split("/").at(-1)!;
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open("resumi-projects");
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    try {
      return await new Promise<string>((resolve, reject) => {
        const request = db
          .transaction("projects")
          .objectStore("projects")
          .get(id);
        request.onsuccess = () =>
          resolve(JSON.stringify(request.result.document));
        request.onerror = () => reject(request.error);
      });
    } finally {
      db.close();
    }
  });
}

test("page tabs scope layers and live reordering to the selected page", async ({
  page,
}) => {
  const document = applyCommands(fixture(), {
    version: 1,
    actor: { kind: "agent", name: "Synthetic pages QA" },
    commands: [
      ...[2, 3].map((number) => ({
        type: "page.create" as const,
        page: {
          id: `page-${number}`,
          name: `Page ${number}`,
          width: 595,
          height: 842,
          background: "#ffffff",
        },
      })),
      { type: "layer.moveToPage", ids: ["headline"], pageId: "page-2" },
      {
        type: "block.create",
        sectionId: "content",
        block: {
          id: "other",
          kind: "text",
          text: "Other",
          design: makeLayer("text", { name: "Other", pageId: "page-2" }),
        },
      },
    ],
  }).document;
  await open(page, document);
  await page
    .getByRole("button", { name: "Expand all groups", exact: true })
    .click();
  const rows = page.locator("[data-layer-row]");
  await expect(rows).toHaveCount(4);
  const pageOneOrder = await rows.evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute("data-layer-row")),
  );
  await page.getByRole("tab", { name: "Page 2", exact: true }).click();
  await expect(rows).toHaveCount(2);
  await expect(page.locator("[data-layer-group]")).toHaveCount(0);
  const pageTwoOrder = await rows.evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute("data-layer-row")),
  );
  const headlineId = (await row(page, "headline").getAttribute(
    "data-layer-row",
  ))!;
  await drag(page, row(page, "headline"), row(page, "other"), "top");
  await expect(rows.first()).toHaveAttribute("data-layer-row", headlineId);
  await page.mouse.up();
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect
    .poll(() =>
      rows.evaluateAll((nodes) =>
        nodes.map((node) => node.getAttribute("data-layer-row")),
      ),
    )
    .toEqual(pageTwoOrder);
  await page.getByRole("tab", { name: "Page 3", exact: true }).click();
  await expect(rows).toHaveCount(0);
  await page.getByRole("tab", { name: "Page 1", exact: true }).click();
  await expect
    .poll(() =>
      rows.evaluateAll((nodes) =>
        nodes.map((node) => node.getAttribute("data-layer-row")),
      ),
    )
    .toEqual(pageOneOrder);
  await page.screenshot({
    path: "artifacts/visual/layer-pages-tabs.png",
    animations: "disabled",
  });
});

test("native visual tools are visible immediately after import and reload", async ({
  page,
}) => {
  await open(page);
  const tools = page.getByRole("navigation", {
    name: "Editor tools",
    exact: true,
  });
  const select = page.getByRole("button", { name: "Select", exact: true });
  await expect(select).toBeVisible();
  await expect(select).toBeInViewport();
  await expect(
    select.locator('xpath=ancestor::*[contains(@class, "dockSection")][1]'),
  ).toHaveCSS("opacity", "1");
  await saved(page);
  await page.reload();
  await expect(tools).toBeVisible();
  await expect(select).toBeVisible();
});

test("layer clicks select and movement below six pixels does not start a drag", async ({
  page,
}) => {
  await open(page);
  const headline = page.getByRole("button", {
    name: "Select layer Headline",
    exact: true,
  });
  await headline.click();
  await expect(headline).toHaveAttribute("aria-pressed", "true");
  const bounds = (await headline.boundingBox())!;
  await page.mouse.move(bounds.x + 35, bounds.y + bounds.height / 2);
  await page.mouse.down();
  await page.mouse.move(bounds.x + 40, bounds.y + bounds.height / 2);
  await expect(page.locator("[data-reordering]")).toHaveCount(0);
  await page.mouse.move(bounds.x + 41, bounds.y + bounds.height / 2);
  await expect(page.locator("[data-reordering]")).toHaveCount(1);
  await expect(headline).toHaveAttribute("aria-pressed", "true");
  await page.keyboard.press("Escape");
  await page.mouse.up();
  await expect(
    page.getByRole("button", { name: "Undo", exact: true }),
  ).toBeDisabled();
});

test("dragged rows stay in hand while siblings arrange live, with cancellation and reduced motion", async ({
  page,
}) => {
  await open(page);
  await saved(page);
  const original = await storedDocument(page);
  const source = row(page, "headline");
  const sourceId = (await source.getAttribute("data-layer-row"))!;
  const bounds = (await source.boundingBox())!;
  const press = {
    x: bounds.x + bounds.width * 0.4,
    y: bounds.y + bounds.height / 2,
  };
  await page.mouse.move(press.x, press.y);
  await page.mouse.down();
  await page.mouse.move(press.x + 5, press.y);
  const ghost = page.locator("[data-layer-drag-ghost]");
  await expect(ghost).toHaveCount(0);
  await page.mouse.move(press.x + 34, press.y + 9, { steps: 4 });
  await expect(ghost).toHaveCount(1);
  await expect(ghost).toHaveAttribute("aria-hidden", "true");
  await expect(ghost).toHaveJSProperty("inert", true);
  await expect(
    ghost.locator("[data-layer-row],[data-layer-reorder-id],[id]"),
  ).toHaveCount(0);
  await expect
    .poll(async () => {
      const lifted = (await ghost.boundingBox())!;
      return Math.abs(lifted.x - bounds.x - 34);
    })
    .toBeLessThan(5);
  await expect(source).toHaveAttribute("data-layer-dragging", "true");
  await expect(
    page.getByRole("button", { name: "Undo", exact: true }),
  ).toBeDisabled();
  expect(await storedDocument(page)).toBe(original);
  await page.keyboard.press("Escape");
  await page.mouse.up();
  await expect(ghost).toHaveCount(0);
  await expect(source).not.toHaveAttribute("data-layer-dragging", "true");
  expect(await storedDocument(page)).toBe(original);
  await expect(
    page.getByRole("button", { name: "Undo", exact: true }),
  ).toBeDisabled();

  await page.emulateMedia({ reducedMotion: "reduce" });
  await drag(page, source, header(page, "contact"), "bottom");
  await expect(ghost).toHaveCount(1);
  await expect(page.locator('[data-drop-position="below"]')).toHaveCount(1);
  await expect
    .poll(() =>
      group(page, "contact").evaluate(
        (node, sourceId) =>
          !!(
            node.compareDocumentPosition(
              document.querySelector(
                `[data-layer-row="${CSS.escape(sourceId)}"]`,
              )!,
            ) & Node.DOCUMENT_POSITION_FOLLOWING
          ),
        sourceId,
      ),
    )
    .toBe(true);
  expect(await storedDocument(page)).toBe(original);
  const matrix = await ghost.evaluate((element) => {
    const transform = new DOMMatrixReadOnly(
      getComputedStyle(element).transform,
    );
    return { a: transform.a, b: transform.b };
  });
  expect(matrix.a).toBe(1);
  expect(matrix.b).toBe(0);
  await page.mouse.up();
  await expect(ghost).toHaveCount(0);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Undo", exact: true }),
  ).toBeDisabled();
  // A preference change during a gesture cancels its transient tree and ghost.
  const restored = (await source.boundingBox())!;
  await page.mouse.move(restored.x + 40, restored.y + restored.height / 2);
  await page.mouse.down();
  await page.mouse.move(restored.x + 58, restored.y + restored.height / 2);
  await expect(ghost).toHaveCount(1);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(ghost).toHaveCount(0);
  await expect(page.locator("[data-reordering]")).toHaveCount(0);
  await page.mouse.up();
  await expect(
    page.getByRole("button", { name: "Undo", exact: true }),
  ).toBeDisabled();
});

test("visual: imported groups have accessible accordion controls and retain their expansion", async ({
  page,
}) => {
  await open(page);
  const expand = page.getByRole("button", {
    name: "Expand group Identity",
    exact: true,
  });
  await expect(expand).toHaveAttribute("aria-expanded", "false");
  await expand.focus();
  await page.keyboard.press("Space");
  const collapse = page.getByRole("button", {
    name: "Collapse group Identity",
    exact: true,
  });
  await expect(collapse).toHaveAttribute("aria-expanded", "true");
  await expect(group(page, "identity").locator("[data-layer-row]")).toHaveCount(
    2,
  );
  await page
    .getByRole("button", { name: "Expand group Contact", exact: true })
    .click();
  await page.evaluate(() => document.fonts.ready);
  await mkdir("artifacts/visual", { recursive: true });
  await page.screenshot({
    path: "artifacts/visual/layer-groups-accordion.png",
    animations: "disabled",
  });
  await saved(page);
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Collapse group Identity", exact: true }),
  ).toHaveAttribute("aria-expanded", "true");
  await expect(group(page, "contact").locator("[data-layer-row]")).toHaveCount(
    2,
  );
  await page
    .getByRole("button", { name: "Collapse all groups", exact: true })
    .click();
  await expect(page.locator("[data-layer-row]")).toHaveCount(1);
  await page
    .getByRole("button", { name: "Expand all groups", exact: true })
    .click();
  await expect(page.locator("[data-layer-row]")).toHaveCount(5);
});

test("moving into, between, within and out of groups previews live and commits one undoable drop", async ({
  page,
}) => {
  await open(page);
  const undo = page.getByRole("button", { name: "Undo", exact: true });
  const headlineId = (await row(page, "headline").getAttribute(
    "data-layer-row",
  ))!;
  await drag(page, row(page, "headline"), header(page, "identity"));
  await expect(
    group(page, "identity").getByRole("button", {
      name: "Select layer Headline",
      exact: true,
    }),
  ).toBeVisible();
  await expect(undo).toBeDisabled();
  await page.keyboard.press("Escape");
  await page.mouse.up();
  await expect(
    row(page, "headline").locator("xpath=ancestor::*[@data-layer-group]"),
  ).toHaveCount(0);
  await expect(undo).toBeDisabled();

  await drag(page, row(page, "headline"), header(page, "identity"));
  await expect(
    group(page, "identity").getByRole("button", {
      name: "Select layer Headline",
      exact: true,
    }),
  ).toBeVisible();
  await page.mouse.up();
  await expect(group(page, "identity").locator("[data-layer-row]")).toHaveCount(
    3,
  );
  await undo.click();
  await expect(
    page.getByRole("button", { name: "Expand group Identity", exact: true }),
  ).toHaveAttribute("aria-expanded", "false");
  await expect(undo).toBeDisabled();
  await page.getByRole("button", { name: "Redo", exact: true }).click();
  await expect(
    group(page, "identity").getByRole("button", {
      name: "Select layer Headline",
      exact: true,
    }),
  ).toBeVisible();

  await drag(page, row(page, "headline"), header(page, "contact"));
  await expect(
    group(page, "contact").getByRole("button", {
      name: "Select layer Headline",
      exact: true,
    }),
  ).toBeVisible();
  await expect(group(page, "identity").locator("[data-layer-row]")).toHaveCount(
    2,
  );
  await page.mouse.up();
  await expect(group(page, "contact").locator("[data-layer-row]")).toHaveCount(
    3,
  );

  await drag(page, row(page, "headline"), row(page, "email"), "bottom");
  await expect(
    group(page, "contact").locator("[data-layer-row]").last(),
  ).toHaveAttribute("data-layer-row", headlineId);
  await page.mouse.up();
  await undo.click();
  await expect(
    group(page, "contact").locator("[data-layer-row]").first(),
  ).toHaveAttribute("data-layer-row", headlineId);

  await drag(page, row(page, "headline"), header(page, "contact"), "top");
  await page.mouse.up();
  await expect(
    row(page, "headline").locator("xpath=ancestor::*[@data-layer-group]"),
  ).toHaveCount(0);
  await undo.click();
  await expect(
    group(page, "contact").getByRole("button", {
      name: "Select layer Headline",
      exact: true,
    }),
  ).toBeVisible();
  await saved(page);
  await page.reload();
  await expect(
    group(page, "contact").getByRole("button", {
      name: "Select layer Headline",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page
      .getByRole("article", { name: "Resume canvas" })
      .locator("[data-layer-id]"),
  ).toHaveCount(5);
});

test("complete groups reorder together and a locked destination rejects a dropped layer", async ({
  page,
}) => {
  await open(page);
  await drag(
    page,
    group(page, "identity").getByRole("button", {
      name: "Select group Identity",
      exact: true,
    }),
    header(page, "contact"),
    "top",
  );
  await expect(
    page
      .locator("[data-layer-group]")
      .first()
      .getByRole("button", { name: "Select group Identity", exact: true }),
  ).toBeVisible();
  await page.mouse.up();
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(
    page
      .locator("[data-layer-group]")
      .first()
      .getByRole("button", { name: "Select group Contact", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Lock group Contact", exact: true })
    .click();
  await drag(page, row(page, "headline"), header(page, "contact"));
  await page.mouse.up();
  await expect(
    row(page, "headline").locator("xpath=ancestor::*[@data-layer-group]"),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Lock group Contact", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Undo", exact: true }),
  ).toBeDisabled();
});
