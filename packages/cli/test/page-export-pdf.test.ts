import { expect, test } from "bun:test";
import { runCli } from "../src/handler";
import { renderPdf } from "../src/pdf-capture";
import { pageMemory } from "./page-fixture";

test("CLI selected, reordered and separate PDF pages retain independent size and verify text including blank pages", async () => {
  const { io, binaries, files, original } = pageMemory();
  io.capturePdf = renderPdf;
  const combined = await runCli(
    [
      "output",
      "application",
      "--format",
      "pdf",
      "--pages",
      "2,1",
      "--out",
      "combined.pdf",
    ],
    io,
  );
  expect(combined.stderr).toBe("");
  expect(combined.exit).toBe(0);
  const report = JSON.parse(combined.stdout);
  expect(report.width).toBe(600);
  expect(report.height).toBe(840);
  expect(report.pageCount).toBe(2);
  expect(report.ats.pageChecks.map((page: { id: string }) => page.id)).toEqual([
    "letter",
    "page-1",
  ]);
  expect(report.ats.pages[0].text).toContain("Dear hiring team");
  expect(report.ats.pages[0].text).not.toContain("curriculum vitae");
  expect(report.ats.pages[0].links).toContain("https://example.com/work");
  expect(report.ats.pages[0].width).toBeCloseTo(450, 0);
  expect(report.ats.pages[0].height).toBeCloseTo(630, 0);
  expect(report.ats.pages[1].width).toBeCloseTo(315, 0);
  expect(report.ats.pages[1].height).toBeCloseTo(445.5, 0);
  const one = await runCli(
    [
      "output",
      "application",
      "--format",
      "pdf",
      "--pages",
      "2",
      "--out",
      "letter.pdf",
    ],
    io,
  );
  expect(one.exit).toBe(0);
  expect(JSON.parse(one.stdout).pageCount).toBe(1);
  const separate = await runCli(
    ["output", "application", "--format", "pdf", "--out-dir", "pdf-pages"],
    io,
  );
  expect(separate.stderr).toBe("");
  expect(separate.exit).toBe(0);
  const split = JSON.parse(separate.stdout);
  expect(split.ats.passed).toBe(true);
  expect(split.files).toHaveLength(3);
  for (const file of split.files) {
    expect(file.pageCount).toBe(1);
    expect(file.ats.passed).toBe(true);
    expect(file.ats.pageCountPassed).toBe(true);
    expect(binaries.get(file.out)!.subarray(0, 5)).toEqual(
      new TextEncoder().encode("%PDF-"),
    );
  }
  expect(split.files[2].ats.text).toBe("");
  expect(split.files[2].ats.pageChecks[0].passed).toBe(true);
  expect(files.get("application.json")).toBe(original);
}, 60_000);

test("separate PDFs aggregate ATS failures into exit 3 while retaining every completed output", async () => {
  const { io, binaries } = pageMemory();
  let captureNumber = 0;
  io.capturePdf = async (...args) => {
    const captured = await renderPdf(...args);
    captureNumber++;
    return captureNumber === 1
      ? {
          ...captured,
          expectedText: `${captured.expectedText} deliberately missing words`,
        }
      : captured;
  };
  const result = await runCli(
    [
      "output",
      "application",
      "--format",
      "pdf",
      "--pages",
      "1,2",
      "--out-dir",
      "reports",
    ],
    io,
  );
  expect(result.exit).toBe(3);
  expect(result.stderr).toContain("PDF_TEXT_MISMATCH");
  const report = JSON.parse(result.stdout);
  expect(report.ats.passed).toBe(false);
  expect(report.files[0].ats.passed).toBe(false);
  expect(report.files[1].ats.passed).toBe(true);
  expect(binaries.size).toBe(2);
}, 60_000);
