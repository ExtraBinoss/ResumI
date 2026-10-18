import { expect, test } from "bun:test";
import {
  applyCommands,
  createDocument,
  makeLayer,
  serializeDocument,
} from "@resumi/engine";
import { createResume, templates } from "@resumi/cv";
import { inspectPdfText } from "@resumi/cv/pdf-text";
import { runCli, type IO } from "../src/handler";
import { renderPdf } from "../src/pdf-capture";

function adapter(document = createResume("pdf-cli")) {
  const writes = new Map<string, Uint8Array>();
  const io: IO = {
    read: async (path) => {
      if (path !== "resume.json") throw Error("missing");
      return serializeDocument(document);
    },
    write: async () => {
      throw Error("binary expected");
    },
    writeBinary: async (path, bytes) => {
      writes.set(path, new Uint8Array(bytes));
    },
    capturePdf: renderPdf,
    id: () => "pdf-cli",
  };
  return { io, writes };
}

for (const template of templates.filter((template) => !template.legacy)) {
  test(`CLI PDF ${template.layout} uses the app renderer and verifies all real PDF text`, async () => {
    const { io, writes } = adapter(
      createResume(`pdf-${template.layout}`, template.id),
    );
    const result = await runCli(
      ["output", "resume", "--format", "pdf", "--out", "Resume.pdf"],
      io,
    );
    const report = JSON.parse(result.stdout);
    expect(result.stderr).toBe("");
    expect(result.exit).toBe(0);
    expect(report).toMatchObject({
      format: "pdf",
      out: "Resume.pdf",
      pageCount: 1,
      ats: {
        passed: true,
        coveragePassed: true,
        orderPassed: true,
        coherencePassed: true,
        replacementCharacters: 0,
      },
    });
    expect(report.ats.text.replace(/\s+/gu, " ")).toContain("Alex Morgan");
    expect(report.ats.pages[0].links.join(" ")).toContain(
      "mailto:alex@example.com",
    );
    expect(report.adjustedTracking).toBeGreaterThan(0);
    expect(writes.get("Resume.pdf")!.subarray(0, 5)).toEqual(
      new TextEncoder().encode("%PDF-"),
    );
  }, 30_000);
}

test("CLI PDF uses current custom source, CSS casing and links rather than old canonical content", async () => {
  const document = applyCommands(createResume("pdf-authored"), {
    version: 1,
    actor: { kind: "human", name: "Synthetic source" },
    commands: [
      {
        type: "source.set",
        source: {
          format: "html",
          code: '<!doctype html><html><head><style>.hidden{display:none}.caps{text-transform:uppercase;letter-spacing:3px}</style></head><body><form action="https://example.com/submit" onsubmit="throw Error()"><h1 class="caps">Éléonore Léon</h1><p>Une <strong>œuvre</strong> et des interfaces cohérentes.</p><p>Hel<strong>lo</strong> <a href="https://example.com/work">Portfolio</a></p><button type="submit" onclick="throw Error()">Designer</button></form><svg width="120" height="30"><text x="0" y="20">Vector text</text></svg><div aria-hidden="true">Visible decoration</div><p class="hidden">Hidden copy</p></body></html>',
        },
      },
    ],
  }).document;
  const { io, writes } = adapter(document);
  const result = await runCli(
    [
      "document",
      "render",
      "resume",
      "--format",
      "pdf",
      "--out",
      "Authored.pdf",
    ],
    io,
  );
  const report = JSON.parse(result.stdout);
  expect(result.stderr).toBe("");
  expect(result.exit).toBe(0);
  expect(report.ats.passed).toBe(true);
  expect(report.ats.text).toContain("ÉLÉONORE LÉON");
  expect(report.ats.text).toContain("œuvre");
  expect(report.ats.text).toContain("Hello");
  expect(report.ats.text).toContain("Designer");
  expect(report.ats.text).toContain("Vector text");
  expect(report.ats.text).toContain("Visible decoration");
  expect(report.ats.text).not.toContain("Hidden copy");
  expect(report.ats.text).not.toContain("Alex Morgan");
  expect(report.blockedRequests).toEqual([]);
  expect(
    (await inspectPdfText(writes.get("Authored.pdf")!)).pages[0].links,
  ).toContain("https://example.com/work");
}, 30_000);

test("PDF rejects editable fields rather than removing CV text and reporting success", async () => {
  for (const field of [
    '<input value="Important name">',
    "<select><option>Important name</option></select>",
    "<textarea>Important name</textarea>",
  ]) {
    const document = applyCommands(createResume("pdf-field"), {
      version: 1,
      actor: { kind: "human", name: "Synthetic source" },
      commands: [
        {
          type: "source.set",
          source: { format: "html", code: `<p>Engineer</p>${field}` },
        },
      ],
    }).document;
    const { io, writes } = adapter(document);
    const result = await runCli(
      ["output", "resume", "--format", "pdf", "--out", "Field.pdf"],
      io,
    );
    expect(result.exit).toBe(3);
    expect(result.stderr).toContain("editable form fields");
    expect(writes.size).toBe(0);
  }
}, 30_000);

test("text mismatches retain the complete reviewable PDF and return a failing CLI exit", async () => {
  const { io, writes } = adapter();
  const bytes = new Uint8Array(
    await Bun.file(
      new URL("../../cv/test/fixtures/pdf-text-chromium.pdf", import.meta.url),
    ).arrayBuffer(),
  );
  io.capturePdf = async () => ({
    bytes,
    expectedText: "Missing expected name",
    width: 794,
    height: 1123,
    blockedRequests: [],
  });
  const result = await runCli(
    ["output", "resume", "--format", "pdf", "--out", "Mismatch.pdf"],
    io,
  );
  expect(result.exit).toBe(3);
  expect(JSON.parse(result.stderr).error.code).toBe("PDF_TEXT_MISMATCH");
  expect(JSON.parse(result.stdout).ats).toMatchObject({
    passed: false,
    coveragePassed: false,
  });
  expect(writes.get("Mismatch.pdf")).toEqual(bytes);
});

test("PDF export rejects unavailable adapters, wrong output extensions and render errors before writing", async () => {
  for (const out of [undefined, "resume.json"]) {
    const { io, writes } = adapter();
    const result = await runCli(
      ["output", "resume", "--format", "pdf", ...(out ? ["--out", out] : [])],
      io,
    );
    expect(result.exit).toBe(2);
    expect(writes.size).toBe(0);
  }
  const { io, writes } = adapter();
  io.capturePdf = undefined;
  expect(
    (
      await runCli(
        ["output", "resume", "--format", "pdf", "--out", "Resume.pdf"],
        io,
      )
    ).exit,
  ).toBe(3);
  io.capturePdf = async () => {
    throw Error("Embedded image could not decode");
  };
  expect(
    (
      await runCli(
        ["output", "resume", "--format", "pdf", "--out", "Resume.pdf"],
        io,
      )
    ).stderr,
  ).toContain("Embedded image");
  expect(writes.size).toBe(0);
});

test("canvas PDF preserves active CV language, grouped rich text, links and its actual page size", async () => {
  const document = applyCommands(
    createDocument("pdf-canvas", "Synthetic canvas"),
    {
      version: 1,
      actor: { kind: "human", name: "PDF fixture" },
      commands: [
        {
          type: "section.create",
          section: { id: "identity", title: "", blockIds: [] },
        },
        {
          type: "block.create",
          sectionId: "identity",
          block: { id: "name", kind: "heading", text: "Alex Morgan" },
        },
        {
          type: "block.create",
          sectionId: "identity",
          block: { id: "profile", kind: "text", text: "Accessible interfaces" },
        },
        {
          type: "block.create",
          sectionId: "identity",
          block: { id: "link", kind: "text", text: "Portfolio" },
        },
        {
          type: "block.create",
          sectionId: "identity",
          block: { id: "hidden", kind: "text", text: "Hidden text" },
        },
        {
          type: "canvas.enable",
          layers: {
            name: makeLayer("text", {
              x: 30,
              y: 30,
              width: 350,
              height: 45,
              fontSize: 26,
              fontWeight: 700,
            }),
            profile: makeLayer("text", {
              x: 30,
              y: 100,
              width: 350,
              height: 60,
              fontSize: 13,
            }),
            link: makeLayer("text", {
              x: 30,
              y: 180,
              width: 300,
              height: 30,
              fontSize: 13,
            }),
            hidden: makeLayer("text", { hidden: true }),
          },
        },
        { type: "canvas.update", patch: { width: 420, height: 420 } },
        {
          type: "group.create",
          id: "introduction",
          ids: ["name", "profile"],
          name: "Introduction",
        },
        {
          type: "text.range.format",
          id: "link",
          markId: "portfolio",
          start: 0,
          end: 9,
          style: { href: "https://example.com/work", underline: true },
        },
        { type: "locale.add", code: "fr", name: "Français" },
        {
          type: "translation.set",
          id: "profile",
          locale: "fr",
          text: "Une œuvre accessible et cohérente.",
        },
        { type: "locale.activate", code: "fr" },
      ],
    },
  ).document;
  const before = serializeDocument(document);
  const { io } = adapter(document);
  const result = await runCli(
    ["output", "resume", "--format", "pdf", "--out", "Canvas.pdf"],
    io,
  );
  expect(result.stderr).toBe("");
  expect(result.exit).toBe(0);
  const report = JSON.parse(result.stdout);
  expect(report.ats.passed).toBe(true);
  expect(report.ats.text).toContain("Une œuvre accessible et cohérente.");
  expect(report.ats.text).not.toContain("Hidden text");
  expect(report.ats.pages[0].links).toContain("https://example.com/work");
  expect(report.ats.pages[0].width).toBeCloseTo(315, 0);
  expect(report.ats.pages[0].height).toBeCloseTo(315, 0);
  expect(serializeDocument(document)).toBe(before);
}, 30_000);
