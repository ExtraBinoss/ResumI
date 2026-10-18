import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { applyCommands, createDocument, makeLayer } from "@resumi/engine";
import { renderHtml } from "@resumi/cv";
import type { Command } from "@resumi/engine";

const variableFontPath =
  "apps/web/node_modules/@fontsource-variable/source-sans-3/files/source-sans-3-latin-wght-normal.woff2";

test("variable font text wrapping matches the portable render at fitted widths", async ({
  page,
  context,
}) => {
  const font = await readFile(variableFontPath),
    fontUrl = `data:font/woff2;base64,${font.toString("base64")}`;
  const source = createDocument(
    "synthetic-font-layout",
    "Synthetic font layout",
  );
  const commands: Command[] = [
    {
      type: "section.create",
      section: { id: "layout", title: "", blockIds: [] },
    },
    { type: "canvas.enable", layers: {} },
    ...[
      {
        id: "qa-name",
        name: "QA name",
        text: "Beam",
        x: 60,
        y: 40,
        width: 500,
        height: 32,
      },
      {
        id: "qa-link",
        name: "QA link",
        text: "nodl.dev",
        x: 60,
        y: 80,
        width: 500,
        height: 32,
      },
      {
        id: "qa-metadata",
        name: "QA metadata",
        text: "42 étoiles",
        x: 60,
        y: 122,
        width: 500,
        height: 32,
      },
      {
        id: "qa-description",
        name: "QA description",
        text: "A concise synthetic profile description follows.",
        x: 60,
        y: 160,
        width: 420,
        height: 60,
      },
      {
        id: "font-loader",
        name: "Font Loader",
        text: "Font Loader",
        x: 60,
        y: 250,
        width: 240,
        height: 32,
        fontFamily: "Arial, sans-serif",
        fontSize: 14,
        fontWeight: 400,
      },
    ].map(({ id, name, text, x, y, width, height, ...font }) => ({
      type: "block.create" as const,
      sectionId: "layout",
      block: {
        id,
        kind: "text" as const,
        text,
        design: makeLayer("text", {
          name,
          x,
          y,
          width,
          height,
          fontFamily: "Source Sans 3, sans-serif",
          fontSize: 24,
          fontWeight: 650,
          lineHeight: 1.2,
          ...font,
          ...(id === "qa-link"
            ? {
                marks: [
                  {
                    id: "qa-link-mark",
                    start: 0,
                    end: 8,
                    href: "https://nodl.dev",
                  },
                ],
              }
            : {}),
        }),
      },
    })),
  ];
  let resumeDoc = applyCommands(source, {
    version: 1,
    actor: { kind: "human", name: "Synthetic layout fixture" },
    commands,
  }).document;
  const measuredDocument = {
    ...resumeDoc,
    canvas: {
      ...resumeDoc.canvas!,
      fonts: [
        {
          id: "qa-variable-source-sans",
          name: "Source Sans 3",
          dataUrl: fontUrl,
          format: "woff2" as const,
        },
      ],
    },
  };
  await page.setContent(renderHtml(measuredDocument));
  await page.evaluate(async () => {
    await document.fonts.load('650 24px "Source Sans 3"');
    await document.fonts.ready;
  });
  const fittedWidths = await page.evaluate(() => {
    const width = (id: string) => {
      const text = document.querySelector(
        `[data-block-id="${id}"] .design-content`,
      )!;
      const range = document.createRange();
      range.selectNodeContents(text.querySelector("a, span") ?? text);
      return Math.ceil(range.getBoundingClientRect().width * 100) / 100 + 0.25;
    };
    return {
      name: width("qa-name"),
      metadata: width("qa-metadata"),
      link: width("qa-link"),
    };
  });
  const finalCommands: Command[] = [
    {
      type: "layer.update",
      ids: ["qa-name"],
      patch: { width: fittedWidths.name },
    },
    {
      type: "layer.update",
      ids: ["qa-metadata"],
      patch: { width: fittedWidths.metadata },
    },
    {
      type: "layer.update",
      ids: ["qa-link"],
      patch: { width: fittedWidths.link },
    },
  ];
  resumeDoc = applyCommands(resumeDoc, {
    version: 1,
    actor: { kind: "human", name: "Synthetic exact-width fixture" },
    commands: finalCommands,
  }).document;
  const cliHtml = renderHtml(resumeDoc);
  await page.goto("/projects");
  await page.locator('input[type="file"]').setInputFiles({
    name: "synthetic-font-layout.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(resumeDoc)),
  });
  const canvas = page.getByRole("article", { name: "Resume canvas" });
  await expect(canvas).toBeVisible();
  await page.route("https://fonts.googleapis.com/**", (route) =>
    route.fulfill({
      contentType: "text/css",
      headers: { "access-control-allow-origin": "*" },
      body: "@font-face{font-family:'Source Sans 3';font-style:normal;font-weight:100 900;src:url(https://fonts.gstatic.com/resumi-layout/source-sans-3.woff2) format('woff2')}",
    }),
  );
  await page.route("https://fonts.gstatic.com/resumi-layout/**", (route) =>
    route.fulfill({
      contentType: "font/woff2",
      headers: { "access-control-allow-origin": "*" },
      body: font,
    }),
  );
  await page
    .getByRole("button", { name: "Select layer Font Loader", exact: true })
    .click();
  const inspector = page.getByRole("complementary", {
    name: "Properties inspector",
  });
  await inspector
    .getByRole("combobox", { name: "Font family", exact: true })
    .click();
  await page
    .getByRole("searchbox", { name: "Search fonts", exact: true })
    .fill("Source Sans 3");
  await page
    .getByRole("option", { name: "Source Sans 3", exact: true })
    .click();
  await expect(
    page.getByRole("status", { name: "Save status", exact: true }),
  ).toHaveText("Saved");
  await page.evaluate(async () => {
    await Promise.all(
      [...document.images].map((image) =>
        image.decode().catch(() => undefined),
      ),
    );
    await document.fonts.ready;
  });
  const appLines = await page.evaluate(() => {
    const button = (text: string) =>
      [
        ...document.querySelectorAll<HTMLElement>('[aria-label^="Edit text:"]'),
      ].find(
        (element) =>
          element.getAttribute("aria-label") ===
          `Edit text: ${text.slice(0, 45)}`,
      )!;
    const countLines = (text: string) => {
      const content = button(text).querySelector(".design-content")!;
      const range = document.createRange();
      range.selectNodeContents(content.querySelector("a, span") ?? content);
      return [...range.getClientRects()].map(({ y, height }) => ({
        y,
        height,
      }));
    };
    return {
      name: countLines("Beam"),
      metadata: countLines("42 étoiles"),
      link: countLines("nodl.dev"),
      description: button(
        "A concise synthetic profile description follows.",
      ).getBoundingClientRect().top,
      metadataBox: button("42 étoiles").getBoundingClientRect().top,
    };
  });
  const appExport = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export", exact: true }).click();
  await page
    .getByRole("menuitem", { name: "Portable HTML", exact: true })
    .click();
  const exportedHtml = await readFile(await (await appExport).path(), "utf8");
  const cliPage = await context.newPage();
  await cliPage.setContent(cliHtml);
  const cliLines = await cliPage.evaluate(async () => {
    await document.fonts.ready;
    const countLines = (id: string) => {
      const content = document.querySelector(
        `[data-block-id="${id}"] .design-content`,
      )!;
      const range = document.createRange();
      range.selectNodeContents(content.querySelector("a, span") ?? content);
      return [...range.getClientRects()].map(({ y, height }) => ({
        y,
        height,
      }));
    };
    return {
      name: countLines("qa-name"),
      metadata: countLines("qa-metadata"),
      link: countLines("qa-link"),
      description: document
        .querySelector('[data-block-id="qa-description"]')!
        .getBoundingClientRect().top,
      metadataBox: document
        .querySelector('[data-block-id="qa-metadata"]')!
        .getBoundingClientRect().top,
    };
  });
  const appHtmlPage = await context.newPage();
  await appHtmlPage.setContent(exportedHtml);
  const appExportLines = await appHtmlPage.evaluate(async () => {
    await document.fonts.ready;
    const contentFor = (text: string) =>
      [...document.querySelectorAll<HTMLElement>(".design-content")].find(
        (content) => content.textContent?.trim() === text,
      )!;
    const countLines = (text: string) => {
      const content = contentFor(text);
      const range = document.createRange();
      range.selectNodeContents(content.querySelector("a, span") ?? content);
      return [...range.getClientRects()].map(({ y, height }) => ({
        y,
        height,
      }));
    };
    return {
      name: countLines("Beam"),
      metadata: countLines("42 étoiles"),
      link: countLines("nodl.dev"),
      description: contentFor(
        "A concise synthetic profile description follows.",
      ).parentElement!.getBoundingClientRect().top,
      metadataBox:
        contentFor("42 étoiles").parentElement!.getBoundingClientRect().top,
    };
  });
  expect(cliLines.name).toHaveLength(1);
  expect(cliLines.metadata).toHaveLength(1);
  expect(cliLines.link).toHaveLength(1);
  expect(appLines.name).toHaveLength(cliLines.name.length);
  expect(appLines.metadata).toHaveLength(cliLines.metadata.length);
  expect(appLines.link).toHaveLength(cliLines.link.length);
  expect(
    appLines.metadata.at(-1)!.y + appLines.metadata.at(-1)!.height,
  ).toBeLessThanOrEqual(appLines.description);
  expect(appExportLines.name).toHaveLength(cliLines.name.length);
  expect(appExportLines.metadata).toHaveLength(cliLines.metadata.length);
  expect(appExportLines.link).toHaveLength(cliLines.link.length);
  await cliPage.close();
  await appHtmlPage.close();
});
