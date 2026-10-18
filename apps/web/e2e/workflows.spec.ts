import { test, expect, type Page } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { createResume } from "../../../packages/cv/src/index";
import {
  closeDialog,
  openCommands,
  openDocumentSettings,
} from "./helpers/editor";
const artifacts = "artifacts";
async function createLegacyFlow(page: Page) {
  await page.goto("/projects");
  await expect(
    page.getByRole("link", { name: "Choose a template", exact: true }),
  ).toBeVisible();
  await page.locator("input[type=file]").setInputFiles({
    name: "legacy-resume.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(createResume("legacy-resume"))),
  });
  await expect(
    page.getByRole("article", { name: "Resume canvas" }),
  ).toBeVisible();
}

async function create(page: Page) {
  await page.goto("/projects");
  await page.getByRole("button", { name: "New resume", exact: true }).click();
  await expect(
    page.getByRole("article", { name: "Resume canvas" }),
  ).toBeVisible();
}
async function saved(page: Page) {
  await expect(
    page.getByRole("status", { name: "Save status", exact: true }),
  ).toHaveText("Saved");
}
async function projectActions(page: Page, name: string) {
  await page
    .getByRole("button", { name: `Actions for ${name}`, exact: true })
    .click();
}
async function readableDashboardControls(
  page: Page,
  minimumSearchWidth: number,
) {
  const search = page.getByRole("searchbox", { name: "Search resumes" });
  await expect(search).toBeVisible();
  const searchBounds = await search.evaluate((input) => {
    const bounds = input.getBoundingClientRect();
    const parent = input.parentElement!.parentElement!.getBoundingClientRect();
    return {
      width: bounds.width,
      withinParent:
        bounds.left >= parent.left - 1 && bounds.right <= parent.right + 1,
    };
  });
  expect(searchBounds.width).toBeGreaterThanOrEqual(minimumSearchWidth);
  expect(searchBounds.withinParent).toBe(true);
  const sort = page.getByRole("combobox", {
    name: "Sort resumes",
    exact: true,
  });
  await expect(sort).toBeVisible();
  await expect(sort).toContainText("Last edited");
  const sortFits = await sort
    .locator('[data-slot="select-value"]')
    .evaluate((value) => {
      const range = document.createRange();
      range.selectNodeContents(value);
      const text = range.getBoundingClientRect(),
        bounds = value.getBoundingClientRect();
      return text.left >= bounds.left - 1 && text.right <= bounds.right + 1;
    });
  expect(sortFits, "The complete sort label must fit without clipping").toBe(
    true,
  );
}

test("SSR public pages and nested routes return meaningful server HTML; hydration is clean", async ({
  page,
  request,
}) => {
  const cases = [
    ["/", "Your resume"],
    ["/templates", "Templates"],
    ["/projects", "Your resumes"],
    ["/editor/missing", "Opening your resume"],
  ];
  for (const [route, text] of cases) {
    const response = await request.get(route);
    expect(response.status()).toBe(200);
    expect(await response.text()).toContain(text);
  }
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  await page.goto("/");
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Templates", exact: true })
    .click();
  await expect(page).toHaveURL(/#templates$/);
  await page
    .getByRole("main")
    .getByRole("link", { name: "Browse all templates", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Templates", exact: true }),
  ).toBeVisible();
  await page.goto("/editor/missing");
  await expect(
    page.getByRole("heading", { name: "Resume not found" }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test("human editor → save/reload → agent preview/undo → JSON round-trip", async ({
  page,
}) => {
  // This cold-dev journey includes several reloads, editing and import.
  // Keep individual assertion deadlines unchanged instead of retrying the flow.
  test.setTimeout(60000);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await create(page);
  await page
    .getByRole("button", { name: "Edit heading: Alex Morgan", exact: true })
    .dblclick();
  await page
    .getByRole("textbox", { name: "Edit text on canvas" })
    .fill("Sam Taylor");
  await page
    .getByRole("textbox", { name: "Edit text on canvas" })
    .press("Control+Enter");
  await expect(
    page.getByRole("heading", { name: "Sam Taylor", exact: true }),
  ).toBeVisible();
  await saved(page);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Sam Taylor", exact: true }),
  ).toBeVisible();
  await openCommands(page);
  await page.getByRole("button", { name: "Load example", exact: true }).click();
  await page.getByRole("button", { name: "Validate & preview" }).click();
  await expect(
    page.getByText("1 validated command", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Apply changes", exact: true })
    .click();
  await closeDialog(page, "Import commands");
  await expect(
    page.getByRole("article", { name: "Resume canvas" }),
  ).toContainText("Product designer focused on accessible software.");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(
    page.getByRole("article", { name: "Resume canvas" }),
  ).toContainText("I turn complex problems");
  await page.getByRole("button", { name: "Redo", exact: true }).click();
  await expect(
    page.getByRole("article", { name: "Resume canvas" }),
  ).toContainText("Product designer focused on accessible software.");
  await expect(
    page.getByRole("radio", { name: "Structure", exact: true }),
  ).toHaveCount(0);
  await page
    .getByRole("heading", { name: "Sam Taylor", exact: true })
    .dblclick();
  const heading = page.getByRole("textbox", {
    name: "Edit text on canvas",
    exact: true,
  });
  await heading.fill("Sam Taylor — Design");
  await heading.press("Control+Enter");
  await expect(
    page.getByRole("heading", { name: "Sam Taylor — Design", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Sam Taylor", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Export", exact: true }).click();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("menuitem", { name: "JSON document" }).click();
  const download = await downloadPromise;
  const jsonPath = await download.path();
  expect(jsonPath).toBeTruthy();
  await saved(page);
  await page.getByRole("button", { name: "Back to projects" }).click();
  await expect(
    page.getByRole("heading", { name: "Your resumes", exact: true }),
  ).toBeVisible();
  await page.locator("input[type=file]").setInputFiles(jsonPath!);
  await expect(
    page.getByRole("heading", { name: "Sam Taylor", exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Sam Taylor", exact: true }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test("project library renames, duplicates and confirms deletion across reloads", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await create(page);
  await saved(page);
  await page.getByRole("button", { name: "Back to projects" }).click();
  await expect(
    page.getByRole("heading", { name: "Your resumes", exact: true }),
  ).toBeVisible();
  await projectActions(page, "Alex Morgan — Resume");
  await page.getByRole("menuitem", { name: "Rename", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Resume name" })
    .fill("Design application");
  await page.getByRole("button", { name: "Save name", exact: true }).click();
  await expect(
    page.getByRole("link", { name: "Open Design application", exact: true }),
  ).toBeVisible();
  await projectActions(page, "Design application");
  await page.getByRole("menuitem", { name: "Duplicate", exact: true }).click();
  await expect(
    page.getByRole("link", {
      name: "Open Design application (copy)",
      exact: true,
    }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("link", {
      name: "Open Design application (copy)",
      exact: true,
    }),
  ).toBeVisible();
  await projectActions(page, "Design application (copy)");
  await page.getByRole("menuitem", { name: "Delete", exact: true }).click();
  await page.getByRole("button", { name: "Keep resume", exact: true }).click();
  await expect(
    page.getByRole("link", {
      name: "Open Design application (copy)",
      exact: true,
    }),
  ).toBeVisible();
  await projectActions(page, "Design application (copy)");
  await page.getByRole("menuitem", { name: "Delete", exact: true }).click();
  await page
    .getByRole("button", { name: "Delete resume", exact: true })
    .click();
  await expect(
    page.getByRole("link", {
      name: "Open Design application (copy)",
      exact: true,
    }),
  ).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("visual desktop/mobile screenshots, rendered DOM/CSS and real canvas", async ({
  page,
}) => {
  await mkdir(`${artifacts}/visual`, { recursive: true });
  await mkdir(`${artifacts}/rendered`, { recursive: true });
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await page.evaluate(async () => {
    await document.fonts.ready;
    for (const image of document.images) image.loading = "eager";
    await Promise.all(Array.from(document.images, (image) => image.decode()));
  });
  await page.screenshot({
    path: `${artifacts}/visual/landing-desktop.png`,
    fullPage: true,
  });
  expect(
    await page
      .locator("img")
      .evaluateAll((images) =>
        images.every(
          (img) =>
            img instanceof HTMLImageElement &&
            img.complete &&
            img.naturalWidth > 0,
        ),
      ),
  ).toBe(true);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await writeFile(`${artifacts}/rendered/landing.html`, await page.content());
  await create(page);
  await saved(page);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({
    path: `${artifacts}/visual/editor-desktop.png`,
    fullPage: true,
  });
  await writeFile(`${artifacts}/rendered/editor.html`, await page.content());
  const computed = await page
    .locator('.resume[aria-label="Resume canvas"]')
    .evaluate((element) => ({
      width: getComputedStyle(element).width,
      minHeight: getComputedStyle(element).minHeight,
      height: getComputedStyle(element).height,
      color: getComputedStyle(element).color,
      font: getComputedStyle(element).fontFamily,
      text: element.textContent,
    }));
  expect(computed.width).toBe("794px");
  expect(computed.height).toBe("1123px");
  await writeFile(
    `${artifacts}/rendered/canvas-computed.json`,
    JSON.stringify(computed, null, 2),
  );
  await page.getByRole("button", { name: "Back to projects" }).click();
  await expect(page.getByRole("link", { name: /Open Alex/ })).toBeVisible();
  await readableDashboardControls(page, 180);
  await page.screenshot({
    path: `${artifacts}/visual/projects-desktop.png`,
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.evaluate(async () => {
    await document.fonts.ready;
    for (const image of document.images) image.loading = "eager";
    await Promise.all(Array.from(document.images, (image) => image.decode()));
  });
  await page.screenshot({
    path: `${artifacts}/visual/landing-mobile.png`,
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.goto("/projects");
  await expect(page.getByRole("link", { name: /Open Alex/ })).toBeVisible();
  await readableDashboardControls(page, 300);
  await page.screenshot({
    path: `${artifacts}/visual/projects-mobile.png`,
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.goto("/templates");
  await page.screenshot({
    path: `${artifacts}/visual/templates-mobile.png`,
    fullPage: true,
  });
  expect(errors).toEqual([]);
});

test("block CRUD, style updates and keyboard history share engine semantics", async ({
  page,
}) => {
  await createLegacyFlow(page);
  await page
    .getByRole("complementary", { name: "Layers panel", exact: true })
    .getByRole("button", { name: "Profile", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Add text block", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "Content", exact: true })
    .fill("A new achievement.");
  await expect(
    page.locator('.resume[aria-label="Resume canvas"]'),
  ).toContainText("A new achievement.");
  await page.getByRole("button", { name: "Delete block", exact: true }).click();
  await expect(
    page.locator('.resume[aria-label="Resume canvas"]'),
  ).not.toContainText("A new achievement.");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(
    page.locator('.resume[aria-label="Resume canvas"]'),
  ).toContainText("A new achievement.");
  await openCommands(page);
  await page
    .getByRole("textbox", { name: "Command proposal", exact: true })
    .fill(
      JSON.stringify({
        version: 1,
        actor: { kind: "agent", name: "Legacy font QA" },
        commands: [{ type: "style.update", patch: { font: "serif" } }],
      }),
    );
  await page
    .getByRole("button", { name: "Validate & preview", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Apply changes", exact: true })
    .click();
  await closeDialog(page, "Import commands");
  await expect(page.locator('.resume[aria-label="Resume canvas"]')).toHaveCSS(
    "font-family",
    /Georgia/,
  );
  await page.getByRole("button", { name: /^Project: / }).focus();
  await page.keyboard.press("Control+z");
  await expect(page.locator('.resume[aria-label="Resume canvas"]')).toHaveCSS(
    "font-family",
    /Arial/,
  );
  await page.keyboard.press("Control+Shift+z");
  await expect(page.locator('.resume[aria-label="Resume canvas"]')).toHaveCSS(
    "font-family",
    /Georgia/,
  );
  await openDocumentSettings(page);
  await page.getByRole("button", { name: "Accent color", exact: true }).click();
  await page.getByRole("textbox", { name: "Hex", exact: true }).fill("334E68");
  await page.getByRole("textbox", { name: "Hex", exact: true }).press("Enter");
  await page.keyboard.press("Escape");
  await closeDialog(page, "Document settings");
  await expect(page.locator('.resume[aria-label="Resume canvas"]')).toHaveCSS(
    "--resume-accent",
    "#334e68",
  );
  await saved(page);
  await page.reload();
  await expect(page.locator('.resume[aria-label="Resume canvas"]')).toHaveCSS(
    "font-family",
    /Georgia/,
  );
  await expect(page.locator('.resume[aria-label="Resume canvas"]')).toHaveCSS(
    "--resume-accent",
    "#334e68",
  );
  await page
    .locator('[aria-label="Resume canvas"]')
    .click({ position: { x: 400, y: 740 } });
  await page.keyboard.press("Control+z");
  // History is deliberately session-local: reopening keeps content, not stale sessions.
  await expect(page.locator('.resume[aria-label="Resume canvas"]')).toHaveCSS(
    "font-family",
    /Georgia/,
  );
});

test("invalid imports and proposals are atomic; validated commands can rename a persisted project", async ({
  page,
}) => {
  await page.goto("/projects");
  await expect(
    page.getByRole("heading", { name: "No resumes yet", exact: true }),
  ).toBeVisible();
  await page.locator("input[type=file]").setInputFiles({
    name: "invalid.json",
    mimeType: "application/json",
    buffer: Buffer.from('{"schemaVersion":999}'),
  });
  await expect(
    page.getByText("Unsupported document version.", { exact: false }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: /Open Alex/ })).toHaveCount(0);
  await page.getByRole("button", { name: "New resume", exact: true }).click();
  await expect(
    page.locator('.resume[aria-label="Resume canvas"]'),
  ).toBeVisible();
  await openCommands(page);
  await page
    .getByRole("textbox", { name: "Command proposal" })
    .fill('{"version":1}');
  await page.getByRole("button", { name: "Validate & preview" }).click();
  await expect(
    page.getByText("Proposal rejected", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Apply changes", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.locator('.resume[aria-label="Resume canvas"]'),
  ).toContainText("Alex Morgan");
  await page.getByRole("textbox", { name: "Command proposal" }).fill(
    JSON.stringify({
      version: 1,
      actor: { kind: "agent", name: "Title editing agent" },
      commands: [{ type: "document.update", name: "Agent edited project" }],
    }),
  );
  await page
    .getByRole("button", { name: "Validate & preview", exact: true })
    .click();
  await expect(
    page.getByText("1 validated command", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Apply changes", exact: true })
    .click();
  await closeDialog(page, "Import commands");
  await expect(
    page.getByRole("button", {
      name: "Project: Agent edited project",
      exact: true,
    }),
  ).toBeVisible();
  await saved(page);
  await page.reload();
  await expect(
    page.getByRole("button", {
      name: "Project: Agent edited project",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.locator('.resume[aria-label="Resume canvas"]'),
  ).toContainText("Alex Morgan");
});
