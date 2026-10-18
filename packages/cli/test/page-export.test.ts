import { expect, test } from "bun:test";
import { applyCommands } from "@resumi/engine";
import { renderSourceHtml } from "@resumi/cv/source-render";
import { runCli } from "../src/handler";
import { applicationDocument, pageMemory } from "./page-fixture";

function articleIds(html: string) {
  return [...html.matchAll(/<article[^>]*data-page-id="([^"]+)"/g)].map(
    (match) => match[1],
  );
}

test("pages lists stable selectors; HTML selection retains query order and source JSON", async () => {
  const { io, files, original } = pageMemory();
  const listing = JSON.parse(
    (await runCli(["pages", "application"], io)).stdout,
  );
  expect(listing.selectionAvailable).toBe(true);
  expect(
    listing.pages.map((page: { number: number; id: string }) => [
      page.number,
      page.id,
    ]),
  ).toEqual([
    [1, "page-1"],
    [2, "letter"],
    [3, "notes"],
  ]);
  for (const selector of ["2,1", "letter,page-1", "id:letter,1"]) {
    const result = await runCli(
      ["output", "application", "--format", "html", "--pages", selector],
      io,
    );
    expect(result.stderr).toBe("");
    expect(articleIds(result.stdout)).toEqual(["letter", "page-1"]);
  }
  expect(
    articleIds(
      (
        await runCli(
          ["output", "application", "--format", "html", "--pages", "2-3"],
          io,
        )
      ).stdout,
    ),
  ).toEqual(["letter", "notes"]);
  expect(
    articleIds(
      (
        await runCli(
          ["output", "application", "--format", "html", "--pages", "all"],
          io,
        )
      ).stdout,
    ),
  ).toEqual(["page-1", "letter", "notes"]);
  expect(files.get("application.json")).toBe(original);
});

test("HTML and TSX split exports have safe unique deterministic names and contain only their selected page", async () => {
  const { io, files, original } = pageMemory();
  for (const format of ["html", "tsx", "react"]) {
    const result = await runCli(
      [
        "output",
        "application",
        "--format",
        format,
        "--pages",
        "3,2,1",
        "--out-dir",
        "exports",
      ],
      io,
    );
    expect(result.stderr).toBe("");
    const report = JSON.parse(result.stdout),
      extension = format === "react" ? "tsx" : format;
    expect(report.files.map((file: { out: string }) => file.out)).toEqual([
      `exports/03-cover-letter.${extension}`,
      `exports/02-cover-letter.${extension}`,
      `exports/01-page-1.${extension}`,
    ]);
    for (const file of report.files) {
      const content = files.get(file.out)!;
      const html =
        extension === "tsx"
          ? renderSourceHtml({ format: "react", code: content })
          : content;
      if (extension === "tsx") {
        expect(content).toContain('import * as React from "react"');
        expect(content).toContain(`data-page-id=\\"${file.pageId}\\"`);
      } else expect(articleIds(html)).toEqual([file.pageId]);
      if (file.pageId === "letter") {
        expect(content).toContain("Dear hiring team");
        expect(content).not.toContain("curriculum vitae");
      }
      if (file.pageId === "notes") {
        expect(content).not.toContain("Dear hiring team");
        expect(content).not.toContain("curriculum vitae");
      }
    }
  }
  expect(files.get("application.json")).toBe(original);
});

test("bad ranges, duplicate/ambiguous/unknown selectors, incompatible formats and path clashes fail before writes", async () => {
  const { io, files, binaries } = pageMemory();
  let captures = 0;
  io.capturePdf = async () => {
    captures++;
    throw Error("must not capture");
  };
  for (const selector of [
    "0",
    "4",
    "3-2",
    "1-4",
    "1,1",
    "2,letter",
    "1,",
    "all,2",
    "missing",
    "../../Cover letter ?",
    "name:../../Cover letter ?",
  ]) {
    const result = await runCli(
      [
        "output",
        "application",
        "--format",
        "pdf",
        "--pages",
        selector,
        "--out-dir",
        "exports",
      ],
      io,
    );
    expect(result.exit).toBe(2);
    expect(result.stderr).toContain("error");
  }
  for (const flags of [
    ["--format", "html", "--out", "out.html", "--out-dir", "exports"],
    ["--format", "json", "--pages", "1"],
    ["--format", "source", "--out-dir", "exports"],
    ["--format", "html", "--out", "./application.json"],
    ["--format", "tsx", "--out", "folder/../application.json"],
    ["--format", "other"],
  ])
    expect((await runCli(["output", "application", ...flags], io)).exit).toBe(
      2,
    );
  expect(files.size).toBe(1);
  expect(binaries.size).toBe(0);
  expect(captures).toBe(0);
});

test("exact saved source differs from current canvas TSX; source subsets are rejected", async () => {
  const code =
    "export default function Original() { return <p>Saved original source</p>; }";
  const withSource = applyCommands(applicationDocument(), {
    version: 1,
    actor: { kind: "agent", name: "Source QA" },
    commands: [{ type: "source.set", source: { format: "react", code } }],
  }).document;
  const { io, files } = pageMemory(withSource);
  expect(
    (await runCli(["output", "application", "--format", "source"], io)).stdout,
  ).toBe(code);
  const listing = JSON.parse(
    (await runCli(["pages", "application"], io)).stdout,
  );
  expect(listing.selectionAvailable).toBe(false);
  expect(listing.pages).toEqual([]);
  for (const flags of [
    ["--format", "html", "--pages", "1"],
    ["--format", "html", "--out-dir", "exports"],
    ["--format", "tsx"],
  ])
    expect((await runCli(["output", "application", ...flags], io)).exit).toBe(
      2,
    );
  const inactive = applyCommands(withSource, {
    version: 1,
    actor: { kind: "agent", name: "Source QA" },
    commands: [{ type: "source.activate", enabled: false }],
  }).document;
  const next = pageMemory(inactive);
  const live = await runCli(
    ["output", "application", "--format", "tsx", "--pages", "2"],
    next.io,
  );
  expect(live.exit).toBe(0);
  expect(live.stdout).toContain("Dear hiring team");
  expect(live.stdout).not.toContain("Saved original source");
  expect(files.size).toBe(1);
});

test("screenshot --page captures only that page with its own default dimensions", async () => {
  const { io, binaries } = pageMemory();
  let captures = 0;
  io.capture = async (html, width, height) => {
    captures++;
    expect(articleIds(html)).toEqual(["letter"]);
    return {
      bytes: new Uint8Array([137, 80]),
      width,
      height,
      blockedRequests: [],
    };
  };
  const result = await runCli(
    ["screenshot", "application", "--page", "2", "--out", "letter.png"],
    io,
  );
  expect(result.exit).toBe(0);
  expect(JSON.parse(result.stdout)).toMatchObject({
    width: 600,
    height: 840,
    pageIds: ["letter"],
  });
  expect(binaries.has("letter.png")).toBe(true);
  for (const selector of ["all", "2-3", "missing"])
    expect(
      (
        await runCli(
          [
            "screenshot",
            "application",
            "--page",
            selector,
            "--out",
            "invalid.png",
          ],
          io,
        )
      ).exit,
    ).toBe(2);
  expect(captures).toBe(1);
});
