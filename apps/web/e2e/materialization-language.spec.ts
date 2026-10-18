import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { createResume } from "@resumi/cv/sample";
import { applyCommands, validateDocument } from "@resumi/engine";

test("English source preserves French content and section captions when becoming editable layers", async ({
  page,
}) => {
  const base = createResume("synthetic-locales", "react-studio");
  const name = Object.values(base.blocks).find(
    (block) => block.kind === "heading",
  )!;
  const profile = Object.values(base.sections).find(
    (section) => section.title === "Profile",
  )!;
  const source = base.source!.code;
  const document = applyCommands(base, {
    version: 1,
    actor: { kind: "agent", name: "Synthetic language fixture" },
    commands: [
      { type: "locale.add", code: "fr", name: "Français" },
      {
        type: "translation.set",
        id: name.id,
        locale: "fr",
        text: "Alix Synthétique",
        marks: [],
      },
      {
        type: "section.translation.set",
        id: profile.id,
        locale: "fr",
        title: "Profil",
      },
      { type: "locale.activate", code: "fr" },
    ],
  }).document;
  await page.goto("/projects");
  await page.locator('input[type="file"]').setInputFiles({
    name: "synthetic-languages.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(document)),
  });
  await expect(page).toHaveURL(/\/editor\/[^/?#]+$/);
  const canvas = page.getByRole("article", {
    name: "Resume canvas",
    exact: true,
  });
  await expect(
    canvas.getByRole("heading", { name: "Alix Synthétique", exact: true }),
  ).toBeVisible();
  await expect(canvas.getByText("Profil", { exact: true })).toBeVisible();
  await expect(page.locator("iframe")).toHaveCount(0);
  await page.getByRole("button", { name: "Export", exact: true }).click();
  const downloaded = page.waitForEvent("download");
  await page
    .getByRole("menuitem", { name: "JSON document", exact: true })
    .click();
  const file = await downloaded;
  const saved = validateDocument(
    JSON.parse(await readFile((await file.path())!, "utf8")),
  );
  expect(saved.localization?.activeLocale).toBe("fr");
  expect(saved.source).toEqual({
    format: "react",
    code: source,
    enabled: false,
  });
  const heading = Object.values(saved.blocks).find(
    (block) => block.kind === "heading",
  )!;
  expect(heading.text).toBe("Alex Morgan");
  expect(heading.translations?.fr.text).toBe("Alix Synthétique");
  const caption = Object.values(saved.blocks).find(
    (block) => block.text === "Profile",
  )!;
  expect(caption.translations?.fr.text).toBe("Profil");
  await page.reload();
  await expect(
    canvas.getByRole("heading", { name: "Alix Synthétique", exact: true }),
  ).toBeVisible();
  await expect(canvas.getByText("Profil", { exact: true })).toBeVisible();
  expect(
    await page.evaluate(
      () => performance.getEntriesByName("resumi:materialize").length,
    ),
  ).toBe(0);
  await expect(page.getByRole("alert")).toHaveCount(0);
});
