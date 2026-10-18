import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { openCommands, closeDialog } from "./helpers/editor";

test("a full proposal cannot exceed its 100-command budget during source preparation", async ({
  page,
}) => {
  await page.goto("/editor");
  const canvas = page.getByRole("article", {
    name: "Resume canvas",
    exact: true,
  });
  await expect(canvas).toBeVisible();
  await openCommands(page);
  const commands = [
    ...Array.from({ length: 99 }, () => ({
      type: "style.update",
      patch: { accent: "#123456" },
    })),
    {
      type: "source.set",
      source: {
        format: "html",
        code: "<h1>Unpublished source</h1>",
        enabled: true,
      },
    },
  ];
  await page
    .getByRole("textbox", { name: "Command proposal", exact: true })
    .fill(
      JSON.stringify({
        version: 1,
        actor: { kind: "agent", name: "Synthetic command limit" },
        commands,
      }),
    );
  await page
    .getByRole("button", { name: "Validate & preview", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Apply changes", exact: true })
    .click();
  await expect(
    page.getByRole("alert").filter({ has: page.locator("pre") }),
  ).toContainText("at most 100 commands");
  await closeDialog(page, "Import commands");
  await expect(
    canvas.getByRole("heading", { name: "Alex Morgan", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Undo", exact: true }),
  ).toBeDisabled();
});

for (const format of ["html", "react"] as const) {
  test(`${format} agent source becomes editable native layers in one history transaction`, async ({
    page,
    context,
  }) => {
    await page.goto("/editor");
    const canvas = page.getByRole("article", {
      name: "Resume canvas",
      exact: true,
    });
    await expect(canvas).toBeVisible();
    await openCommands(page);
    const code =
      format === "html"
        ? '<style>body{font-family:Arial;padding:48px}h1{color:#2563eb}</style><h1>Synthetic source resume</h1><p>Designed as editable layers.</p><script>parent.document.body.dataset.sourceEscaped="yes"</script>'
        : 'export default function Resume(){let isolated=false;try{parent.document.body.dataset.sourceEscaped="yes"}catch{isolated=true}return <article style={{padding:48,fontFamily:"Arial"}}><h1>Synthetic source resume</h1><p>{isolated?"Opaque sandbox":"Not isolated"}</p></article>}';
    await page
      .getByRole("textbox", { name: "Command proposal", exact: true })
      .fill(
        JSON.stringify({
          version: 1,
          actor: { kind: "agent", name: "Synthetic source import" },
          commands: [
            { type: "source.set", source: { format, code, enabled: true } },
          ],
        }),
      );
    await page
      .getByRole("button", { name: "Validate & preview", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Apply changes", exact: true })
      .click();
    await expect(
      page.getByRole("button", { name: "Apply changes", exact: true }),
    ).toHaveCount(0);
    await closeDialog(page, "Import commands");
    await expect(
      canvas.getByRole("heading", {
        name: "Synthetic source resume",
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Select", exact: true }),
    ).toBeVisible();
    await expect(canvas.locator("iframe")).toHaveCount(0);
    expect(
      await page.locator("body").getAttribute("data-source-escaped"),
    ).toBeNull();
    const undo = page.getByRole("button", { name: "Undo", exact: true });
    await undo.click();
    await expect(
      canvas.getByRole("heading", { name: "Alex Morgan", exact: true }),
    ).toBeVisible();
    await expect(undo).toBeDisabled();
    await page.getByRole("button", { name: "Redo", exact: true }).click();
    await expect(
      canvas.getByRole("heading", {
        name: "Synthetic source resume",
        exact: true,
      }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Text", exact: true }).click();
    const matchingField = page
      .getByRole("article", { name: "Text workspace", exact: true })
      .getByRole("textbox")
      .filter({ hasText: "Synthetic source resume" })
      .first();
    const fieldId = await matchingField.getAttribute("data-edit-field");
    expect(fieldId).not.toBeNull();
    const field = page
      .getByRole("article", { name: "Text workspace", exact: true })
      .locator(`[data-edit-field=${JSON.stringify(fieldId)}]`);
    await field.fill("Edited native resume");
    await field.press("Tab");
    await page.getByRole("button", { name: "Visual", exact: true }).click();
    await expect(
      canvas.getByRole("heading", {
        name: "Edited native resume",
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("status", { name: "Save status", exact: true }),
    ).toHaveText("Saved");
    await page.reload();
    await expect(
      canvas.getByRole("heading", {
        name: "Edited native resume",
        exact: true,
      }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Export", exact: true }).click();
    const pending = page.waitForEvent("download");
    await page
      .getByRole("menuitem", { name: "Portable HTML", exact: true })
      .click();
    const downloaded = await pending;
    const html = await readFile((await downloaded.path())!, "utf8");
    expect(html).toContain("Edited native resume");
    expect(html).not.toContain("<script");
    const offline = await context.newPage();
    await offline.route("**/*", (route) => route.abort());
    await offline.setContent(html);
    await expect(
      offline.getByRole("heading", {
        name: "Edited native resume",
        exact: true,
      }),
    ).toBeVisible();
    await offline.close();
  });
}

test("React template TSX export contains the current native canvas after human editing", async ({
  page,
}) => {
  await page.goto("/templates");
  await page
    .getByRole("link", { name: "Use React Studio", exact: true })
    .click();
  const canvas = page.getByRole("article", {
    name: "Resume canvas",
    exact: true,
  });
  await expect(
    canvas.getByRole("heading", { name: "Alex Morgan", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Text", exact: true }).click();
  const matchingField = page
    .getByRole("article", { name: "Text workspace", exact: true })
    .getByRole("textbox")
    .filter({ hasText: "Alex Morgan" })
    .first();
  const fieldId = await matchingField.getAttribute("data-edit-field");
  expect(fieldId).not.toBeNull();
  const field = page
    .getByRole("article", { name: "Text workspace", exact: true })
    .locator(`[data-edit-field=${JSON.stringify(fieldId)}]`);
  await field.fill("Current edited TSX name");
  await field.press("Tab");
  await page.getByRole("button", { name: "Visual", exact: true }).click();
  await expect(
    canvas.getByRole("heading", {
      name: "Current edited TSX name",
      exact: true,
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Export", exact: true }).click();
  const pending = page.waitForEvent("download");
  await page
    .getByRole("menuitem", { name: "React / TSX", exact: true })
    .click();
  const download = await pending;
  expect(download.suggestedFilename()).toMatch(/\.tsx$/);
  const tsx = await readFile((await download.path())!, "utf8");
  const markup = JSON.parse(tsx.match(/^const canvas = (.*);$/m)![1]) as string;
  expect(markup).toContain("Current edited TSX name");
  expect(markup).toContain("design-layer");
  expect(markup).not.toContain("Alex Morgan");
  expect(tsx).not.toContain("@resumi/");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
