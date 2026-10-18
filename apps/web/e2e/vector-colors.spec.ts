import { expect, test } from "@playwright/test";
import { readFile, mkdir } from "node:fs/promises";
import type { Asset } from "../../../packages/assets/src";
import {
  applyCommands,
  createDocument,
  makeLayer,
} from "../../../packages/engine/src";

test("visual: brand vectors switch between original and monochrome paints without losing white details", async ({
  page,
}) => {
  const catalog = JSON.parse(
    await readFile(
      new URL("../../../packages/assets/data/brands.json", import.meta.url),
      "utf8",
    ),
  ) as { icons: Asset[]; credits: Record<string, string> };
  const brand = catalog.icons.find((item) => item.id === "brand-linkedin")!;
  const { path, viewBox, parts } = brand;
  const attribution = `${catalog.credits[brand.license!]}\nSource: ${brand.source}`;
  const document = applyCommands(
    createDocument("vector-colors", "Vector colour QA"),
    {
      version: 1,
      actor: { kind: "agent", name: "Synthetic QA" },
      commands: [
        {
          type: "section.create",
          section: { id: "content", title: "Content", blockIds: [] },
        },
        { type: "canvas.enable", layers: {} },
        {
          type: "block.create",
          sectionId: "content",
          block: {
            id: "linkedin",
            kind: "shape",
            text: "",
            design: makeLayer("shape", {
              name: "LinkedIn",
              x: 60,
              y: 60,
              width: 96,
              height: 96,
              fill: "#20252d",
              vector: { path, viewBox, parts, attribution },
            }),
          },
        },
      ],
    },
  ).document;
  await page.goto("/projects");
  await expect(page.locator("input[type=file]")).toBeEnabled();
  await page.locator("input[type=file]").setInputFiles({
    name: "synthetic-brand.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(document)),
  });
  const paper = page.getByRole("article", { name: "Resume canvas" });
  await expect(paper).toBeVisible();
  await page
    .getByRole("button", { name: "Select layer LinkedIn", exact: true })
    .click();
  const colors = page.getByRole("combobox", {
    name: "Vector colors",
    exact: true,
  });
  const paints = paper.locator('[data-layer-name="LinkedIn"] svg path');
  await expect(paints.first()).toHaveAttribute("fill", "#0076b2");
  await colors.click();
  await page.getByRole("option", { name: "Monochrome", exact: true }).click();
  await expect(paints.first()).toHaveAttribute("fill", "#20252d");
  await expect(paints.last()).toHaveAttribute("fill", "#ffffff");
  await mkdir("artifacts/visual", { recursive: true });
  await page.screenshot({
    path: "artifacts/visual/vector-monochrome-properties.png",
  });
  await page.getByRole("button", { name: "Export", exact: true }).click();
  const pending = page.waitForEvent("download");
  await page
    .getByRole("menuitem", { name: "Portable HTML", exact: true })
    .click();
  const download = await pending;
  const html = await readFile((await download.path())!, "utf8");
  expect(html).toContain('fill="#20252d"');
  expect(html).toContain('fill="#ffffff"');
  await expect(
    page.getByRole("status", { name: "Save status", exact: true }),
  ).toHaveText("Saved");
  await page.reload();
  await page
    .getByRole("button", { name: "Select layer LinkedIn", exact: true })
    .click();
  await expect(paints.first()).toHaveAttribute("fill", "#20252d");
  await colors.click();
  await page
    .getByRole("option", { name: "Original colors", exact: true })
    .click();
  await expect(paints.first()).toHaveAttribute("fill", "#0076b2");
  await expect(paints.last()).toHaveAttribute("fill", "#ffffff");
});
