import type { Document } from "@resumi/engine";
import { expect, test } from "@playwright/test";
import { mkdir, readFile, writeFile } from "node:fs/promises";

test("visual multilingual CV editing preserves the original, mixed ranges, fallback, reload and exports", async ({
  page,
  context,
}) => {
  test.setTimeout(60000);
  await context.addInitScript(() => {
    window.print = () => {};
  });
  await page.goto("/editor");
  await expect(
    page.getByRole("article", { name: "Resume canvas" }),
  ).toBeVisible();
  await page.getByRole("button", { name: /^Project:/ }).click();
  await page
    .getByRole("button", { name: "Manage languages", exact: true })
    .click();
  const manager = page.getByRole("dialog", {
    name: "CV languages",
    exact: true,
  });
  await expect(manager).toBeVisible();
  await manager
    .getByRole("textbox", { name: "Language name", exact: true })
    .fill("Français");
  await manager.getByRole("button", { name: "Add", exact: true }).click();
  await page.getByRole("button", { name: "Text", exact: true }).click();
  const workspace = page.getByRole("article", { name: "Text workspace" });
  await expect(workspace).toHaveAttribute("lang", "fr");
  const centered = (await workspace.boundingBox())!;
  expect(centered.x).toBeGreaterThan(280);
  expect(centered.x + centered.width).toBeLessThan(1120);
  expect(centered.y).toBeGreaterThan(70);
  expect(centered.y + centered.height).toBeLessThan(940);
  await expect(
    workspace.getByText("Original text", { exact: true }).first(),
  ).toBeVisible();
  const text = workspace.getByRole("textbox", {
    name: "Text content: Name",
    exact: true,
  });
  await text.fill("Camille Martin");
  await text.press("Home");
  await page.keyboard.down("Shift");
  for (let i = 0; i < 7; i++) await page.keyboard.press("ArrowRight");
  await page.keyboard.up("Shift");
  await text.press("Control+i");
  await expect(text.locator("span").first()).toHaveCSS("font-style", "italic");
  await expect(text.locator("span").last()).toHaveCSS("font-style", "normal");
  await expect(workspace.locator("footer")).toContainText("1 /");
  const afterFormatting = (await workspace.boundingBox())!;
  expect(afterFormatting.x).toBeCloseTo(centered.x, 1);
  expect(afterFormatting.y).toBeCloseTo(centered.y, 1);
  await mkdir("artifacts/visual", { recursive: true });
  await page.screenshot({ path: "artifacts/visual/cv-languages-text.png" });
  await page.getByRole("button", { name: "Visual", exact: true }).click();
  const paper = page.getByRole("article", { name: "Resume canvas" });
  await expect(paper).toHaveAttribute("lang", "fr");
  await expect(
    paper.getByRole("heading", { name: "Camille Martin", exact: true }),
  ).toBeVisible();
  await paper
    .getByRole("button", { name: "Edit heading: Camille Martin", exact: true })
    .dblclick();
  const nativeText = paper.getByRole("textbox", {
    name: "Edit text on canvas",
    exact: true,
  });
  await nativeText.fill("Camille Dubois");
  await nativeText.press("Control+Enter");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(
    paper.getByRole("heading", { name: "Camille Martin", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("status", { name: "Save status", exact: true }),
  ).toHaveText("Saved");
  await page.reload();
  await expect(
    paper.getByRole("heading", { name: "Camille Martin", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Export", exact: true }).click();
  const download = page.waitForEvent("download");
  await page
    .getByRole("menuitem", { name: "JSON document", exact: true })
    .click();
  const path = await (await download).path();
  const doc = JSON.parse(await readFile(path!, "utf8")) as Document;
  const translated = Object.values(doc.blocks).find(
    (block) => block.kind === "heading" && block.text === "Alex Morgan",
  )!;
  expect(translated.text).toBe("Alex Morgan");
  expect(translated.translations!.fr.text).toBe("Camille Martin");
  expect(translated.translations!.fr.marks[0].fontStyle).toBe("italic");
  await page.getByRole("button", { name: "Export", exact: true }).click();
  const htmlDownload = page.waitForEvent("download");
  await page
    .getByRole("menuitem", { name: "Portable HTML", exact: true })
    .click();
  const html = await readFile((await (await htmlDownload).path())!, "utf8");
  const exported = await page.evaluate((source) => {
    const parsed = new DOMParser().parseFromString(source, "text/html");
    return {
      lang: parsed.documentElement.lang,
      heading: parsed.querySelector("h1")?.textContent,
      italic: parsed.querySelector('h1 span[style*="font-style:italic"]')
        ?.textContent,
    };
  }, html);
  expect(exported).toEqual({
    lang: "fr",
    heading: "Camille Martin",
    italic: "Camille",
  });
  await writeFile("artifacts/rendered/cv-active-language-fr.html", html);
  const pendingPdf = page.waitForEvent("popup");
  await page.getByRole("button", { name: "Export PDF", exact: true }).click();
  const printPage = await pendingPdf;
  await expect(printPage.locator("html")).toHaveAttribute(
    "data-pdf-ready",
    "true",
  );
  await expect(printPage.locator("html")).toHaveAttribute("lang", "fr");
  await expect(
    printPage.getByRole("heading", { name: "Camille Martin", exact: true }),
  ).toBeVisible();
  await printPage.close();
  await page.getByRole("button", { name: "Text", exact: true }).click();
  const languageTools = page.getByRole("toolbar", {
    name: "Text editing tools",
    exact: true,
  });
  await expect(languageTools).toBeVisible();
  await languageTools
    .getByRole("combobox", { name: "CV language", exact: true })
    .click();
  await page.getByRole("option", { name: "English", exact: true }).click();
  await expect(text).toHaveText("Alex Morgan");
  await languageTools
    .getByRole("combobox", { name: "CV language", exact: true })
    .click();
  await page.getByRole("option", { name: "Français", exact: true }).click();
  await workspace
    .getByRole("button", { name: "Use original text: Name", exact: true })
    .click();
  await expect(text).toHaveText("Alex Morgan");
  await languageTools
    .getByRole("button", { name: "Manage languages", exact: true })
    .click();
  await manager
    .getByRole("button", { name: "Remove: Français", exact: true })
    .click();
  await expect(
    manager.getByRole("textbox", {
      name: "Language name: Français",
      exact: true,
    }),
  ).toHaveCount(0);
});

test("interface language is independent from CV language and hydrates from its cookie", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.goto("/projects");
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await page
    .getByRole("combobox", { name: "Interface language", exact: true })
    .click();
  await page.getByRole("option", { name: "Français", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Apparence", exact: true }),
  ).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "fr");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "fr");
  await page.getByRole("button", { name: "Réglages", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Apparence", exact: true }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await page.goto("/editor");
  const paper = page.getByRole("article", {
    name: "Canevas du CV",
    exact: true,
  });
  await expect(paper).toHaveAttribute("lang", "en");
  await expect(
    paper.getByRole("heading", { name: "Alex Morgan", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("complementary", {
      name: "Panneau des calques",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("complementary", {
      name: "Inspecteur des propriétés",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("radio", { name: /^(Structure|Outline)$/ }),
  ).toHaveCount(0);
  await page
    .locator("[data-layer-row]")
    .first()
    .getByRole("button", { name: /^Sélectionner le calque/ })
    .click();
  await expect(
    page.getByRole("heading", { name: "Typographie", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: /^Projet :/ }).click();
  await expect(
    page.getByRole("combobox", { name: "Langue du CV", exact: true }),
  ).toContainText("English");
  await expect(
    page.getByRole("textbox", { name: "Nom du projet", exact: true }),
  ).toBeVisible();
  await expect(
    page.locator('[data-slot="popover-content"]').filter({
      has: page.getByRole("textbox", { name: "Nom du projet", exact: true }),
    }),
  ).toHaveCSS("opacity", "1");
  await page.screenshot({
    path: "artifacts/visual/editor-interface-fr-project-language.png",
  });
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Réglages", exact: true }).click();
  await expect(
    page.getByRole("combobox", { name: "Langue de l’interface", exact: true }),
  ).toContainText("Français");
  await expect(
    page.getByRole("combobox", { name: "Langue du CV", exact: true }),
  ).toHaveCount(0);
  await page.keyboard.press("Escape");
  await page.goto("/fr");
  await expect(
    page.getByRole("heading", {
      name: /Votre CV.*coéquipier/,
    }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("navigation", {
      name: "Navigation principale",
      exact: true,
    }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
