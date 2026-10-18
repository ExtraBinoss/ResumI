import { expect, test } from "bun:test";
import { applyCommands, createDocument, makeLayer } from "@resumi/engine";
import { runCli, type IO } from "../src/handler";

function fixture() {
  const doc = applyCommands(createDocument("contrast-cli"), {
    version: 1,
    actor: { kind: "human", name: "Synthetic test" },
    commands: [
      {
        type: "section.create",
        section: { id: "content", title: "", blockIds: [] },
      },
      {
        type: "block.create",
        sectionId: "content",
        block: { id: "heading", kind: "text", text: "Hello" },
      },
      {
        type: "block.create",
        sectionId: "content",
        block: { id: "letter-text", kind: "text", text: "Letter" },
      },
      {
        type: "canvas.enable",
        layers: {
          heading: makeLayer("text", {
            color: "#aaaaaa",
            x: 30,
            y: 30,
            fontSize: 16,
          }),
          "letter-text": makeLayer("text", {
            color: "#111111",
            x: 30,
            y: 30,
            fontSize: 16,
          }),
        },
      },
      {
        type: "page.create",
        page: {
          id: "letter",
          name: "Cover letter",
          width: 700,
          height: 900,
          background: "#ffffff",
        },
      },
      { type: "layer.moveToPage", ids: ["letter-text"], pageId: "letter" },
      { type: "locale.add", code: "fr", name: "French" },
      {
        type: "translation.set",
        id: "heading",
        locale: "fr",
        text: "Bonjour",
        marks: [{ id: "french", start: 0, end: 7, color: "#111111" }],
      },
    ],
  }).document;
  const files = new Map([["application.json", JSON.stringify(doc)]]);
  let writes = 0;
  const io: IO = {
    id: () => "contrast-test",
    read: async (path) => {
      const file = files.get(path);
      if (file === undefined) throw Error("not found");
      return file;
    },
    write: async (path, content) => {
      files.set(path, content);
      writes++;
    },
    fetchText: async () => {
      throw Error("Audit must stay offline");
    },
  };
  return { io, files, writes: () => writes };
}

test("CLI global contrast feedback is offline, read-only and offers usable validated correction batches", async () => {
  const { io, files, writes } = fixture(),
    before = files.get("application.json");
  const result = await runCli(["contrast", "application"], io);
  expect(result.exit).toBe(0);
  expect(result.stderr).toBe("");
  const report = JSON.parse(result.stdout);
  expect(report.textPassed).toBe(false);
  expect(report.reports[0].summary.text.fail).toBe(1);
  const patch = report.reports[0].elements.find(
    (item: { id: string }) => item.id === "heading",
  ).recommendations[0].patch;
  expect(writes()).toBe(0);
  files.set("patch.json", JSON.stringify(patch));
  expect(
    (
      await runCli(
        [
          "document",
          "apply",
          "application",
          "patch.json",
          "--out",
          "corrected.json",
        ],
        io,
      )
    ).exit,
  ).toBe(0);
  expect(
    JSON.parse((await runCli(["contrast", "corrected"], io)).stdout).textPassed,
  ).toBe(true);
  expect(files.get("application.json")).toBe(before);
});

test("page/language selection, AAA and JSON report destinations are explicit and preserve the project", async () => {
  const { io, files } = fixture(),
    before = files.get("application.json");
  const result = await runCli(
    [
      "document",
      "contrast",
      "application",
      "--pages",
      "2,1",
      "--locale",
      "all",
      "--level",
      "AAA",
      "--out",
      "contrast-report.json",
    ],
    io,
  );
  expect(result.exit).toBe(0);
  const report = JSON.parse(result.stdout);
  expect(report.reports.map((item: { locale: string }) => item.locale)).toEqual(
    ["en", "fr"],
  );
  expect(
    report.reports[0].pages.map((item: { id: string }) => item.id),
  ).toEqual(["letter", "page-1"]);
  expect(report.reports[0].target).toBe("AAA");
  expect(report.reports[1].summary.text.fail).toBe(0);
  expect(JSON.parse(files.get("contrast-report.json")!)).toEqual(report);
  expect(files.get("application.json")).toBe(before);
  const letter = JSON.parse(
    (
      await runCli(
        ["contrast", "application", "--pages", "name:Cover letter"],
        io,
      )
    ).stdout,
  );
  expect(letter.textPassed).toBe(true);
  expect(
    letter.reports[0].elements.map((item: { id: string }) => item.id),
  ).toEqual(["letter-text"]);
});

test("invalid contrast options and dangerous output paths never overwrite the input", async () => {
  const { io, files, writes } = fixture(),
    before = files.get("application.json");
  for (const args of [
    ["--level", "A"],
    ["--locale", "xx"],
    ["--pages", "3"],
    ["--out", "application.json"],
    ["--out", "./application.json"],
    ["--level", "AA", "--level", "AAA"],
    ["--apply", "yes"],
  ])
    expect((await runCli(["contrast", "application", ...args], io)).exit).toBe(
      2,
    );
  expect(writes()).toBe(0);
  expect(files.get("application.json")).toBe(before);
  expect((await runCli(["contrast", "missing"], io)).exit).toBe(4);
});

test("help/docs and capabilities explain thresholds, all-element coverage, uncertainty and correction workflow", async () => {
  const { io } = fixture();
  const docs = await runCli(["docs", "contrast"], io);
  expect(docs.exit).toBe(0);
  for (const phrase of [
    "4.5:1",
    "7:1",
    "recommendations[].patch",
    "group opacity",
    "Unknown",
    "--locale all",
    "not all graphics",
    "w3.org",
    "never applies",
  ])
    expect(docs.stdout).toContain(phrase);
  expect((await runCli(["help", "contrast"], io)).stdout).toBe(docs.stdout);
  expect((await runCli(["capabilities"], io)).stdout).toContain(
    "contrast PROJECT",
  );
});
