import { expect, test } from "bun:test";
import {
  applyCommands,
  createDocument,
  makeLayer,
  serializeDocument,
} from "@resumi/engine";
import { renderDocumentHtml } from "@resumi/cv";
import { runCli, type IO } from "../src/handler";
import { renderPdf } from "../src/pdf-capture";

const document = () =>
  applyCommands(createDocument("multi-page", "Synthetic multi-page CV"), {
    version: 1,
    actor: { kind: "agent", name: "Pages PDF QA" },
    commands: [
      {
        type: "section.create",
        section: { id: "content", title: "", blockIds: [] },
      },
      { type: "canvas.enable", layers: {} },
      { type: "canvas.update", patch: { width: 420, height: 594 } },
      {
        type: "page.create",
        page: {
          id: "second",
          name: "Experience",
          width: 600,
          height: 840,
          background: "#eeeeee",
        },
      },
      {
        type: "page.create",
        page: {
          id: "third",
          name: "Empty notes page",
          width: 500,
          height: 500,
          background: "#ffffff",
        },
      },
      {
        type: "block.create",
        sectionId: "content",
        block: {
          id: "one",
          kind: "text",
          text: "Alex Morgan first page",
          design: makeLayer("text", {
            x: 30,
            y: 30,
            width: 350,
            height: 50,
            fontSize: 20,
          }),
        },
      },
      {
        type: "block.create",
        sectionId: "content",
        block: {
          id: "two",
          kind: "text",
          text: "Deuxième page expérience",
          design: makeLayer("text", {
            pageId: "second",
            x: 30,
            y: 30,
            width: 500,
            height: 50,
            fontSize: 20,
          }),
        },
      },
      {
        type: "block.create",
        sectionId: "content",
        block: {
          id: "link",
          kind: "text",
          text: "Portfolio",
          design: makeLayer("text", {
            pageId: "second",
            x: 30,
            y: 100,
            width: 300,
            height: 40,
          }),
        },
      },
      {
        type: "text.range.format",
        id: "link",
        markId: "portfolio",
        start: 0,
        end: 9,
        style: { href: "https://example.com/work" },
      },
      {
        type: "group.create",
        id: "experience",
        ids: ["two", "link"],
        name: "Experience",
      },
    ],
  }).document;

test("portable HTML contains each native page and only its own layers", async () => {
  const html = await renderDocumentHtml(document());
  const articles = [
    ...html.matchAll(
      /<article[^>]*data-page-id="([^"]+)"[^>]*>(.*?)<\/article>/gs,
    ),
  ];
  expect(articles.map((match) => match[1])).toEqual([
    "page-1",
    "second",
    "third",
  ]);
  expect(articles[0][2]).toContain("Alex Morgan first page");
  expect(articles[0][2]).not.toContain("Deuxième");
  expect(articles[1][2]).toContain("Deuxième page expérience");
  expect(articles[1][2]).not.toContain("Alex Morgan");
  expect(articles[2][2]).toBe("");
  expect(html).toContain("@page resumi1{size:450pt 630pt;margin:0}");
});

test("CLI exports every native PDF page with independent size and verified per-page text", async () => {
  const doc = document();
  const before = serializeDocument(doc);
  const written = new Map<string, Uint8Array>();
  const io: IO = {
    read: async () => before,
    write: async () => {
      throw Error("binary expected");
    },
    writeBinary: async (path, bytes) => {
      written.set(path, bytes);
    },
    capturePdf: renderPdf,
    id: () => "multi-page",
  };
  const result = await runCli(
    ["output", "resume", "--format", "pdf", "--out", "Pages.pdf"],
    io,
  );
  expect(result.stderr).toBe("");
  expect(result.exit).toBe(0);
  const report = JSON.parse(result.stdout);
  expect(report.pageCount).toBe(3);
  expect(report.ats.passed).toBe(true);
  expect(report.ats.pageCountPassed).toBe(true);
  expect(
    report.ats.pageChecks.map((page: { id: string; passed: boolean }) => [
      page.id,
      page.passed,
    ]),
  ).toEqual([
    ["page-1", true],
    ["second", true],
    ["third", true],
  ]);
  expect(report.ats.pages[0].text).toContain("Alex Morgan first page");
  expect(report.ats.pages[0].text).not.toContain("Deuxième");
  expect(report.ats.pages[1].text).toContain("Deuxième page expérience");
  expect(report.ats.pages[1].text).not.toContain("Alex Morgan");
  expect(report.ats.pages[1].links).toContain("https://example.com/work");
  expect(report.ats.pages[2].text).toBe("");
  for (const [index, width, height] of [
    [0, 315, 445.5],
    [1, 450, 630],
    [2, 375, 375],
  ]) {
    expect(report.ats.pages[index].width).toBeCloseTo(width, 0);
    expect(report.ats.pages[index].height).toBeCloseTo(height, 0);
  }
  expect(written.get("Pages.pdf")!.byteLength).toBeGreaterThan(1000);
  expect(serializeDocument(doc)).toBe(before);
}, 30_000);
