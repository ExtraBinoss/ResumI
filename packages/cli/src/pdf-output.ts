import type { Document } from "@resumi/engine";
import { CliError, type IO } from "./io";

/** Faithful app rendering, followed by independent extraction from the actual PDF bytes. */
export async function outputPdf(
  document: Document,
  flags: Map<string, string>,
  io: IO,
) {
  const out = flags.get("--out");
  if (!out || !/\.pdf$/i.test(out))
    throw new CliError(2, "PDF output requires --out FILE.pdf. See help pdf.");
  if (!io.capturePdf || !io.writeBinary)
    throw new CliError(
      3,
      "PDF rendering is unavailable in this adapter. Run the Bun CLI after bunx playwright install chromium.",
    );
  const { renderDocumentHtml } = await import("@resumi/cv");
  const { inspectPdfText, comparePdfText } =
    await import("@resumi/cv/pdf-text");
  const sourceActive = !!document.source && document.source.enabled !== false;
  const width = sourceActive ? 794 : (document.canvas?.width ?? 794);
  const height = sourceActive ? 1123 : (document.canvas?.height ?? 1123);
  const capture = await io.capturePdf(
    await renderDocumentHtml(document),
    width,
    height,
    sourceActive && document.source?.format === "react",
  );
  const inspection = await inspectPdfText(capture.bytes);
  const ats = comparePdfText(capture.expectedText, inspection.text);
  const pageChecks = capture.expectedPages?.map((page, index) => {
    const actual = inspection.pages[index]?.text ?? "";
    const comparison = comparePdfText(page.text, actual);
    // A deliberately empty page is still verified by its position and page count.
    const empty = !page.text.trim() && !actual.trim();
    return {
      id: page.id,
      number: index + 1,
      ...comparison,
      ...(empty ? { passed: true, coherencePassed: true } : {}),
    };
  });
  const pageCountPassed =
    !capture.expectedPages?.length ||
    capture.expectedPages.length === inspection.pageCount;
  try {
    await io.writeBinary(out, capture.bytes);
  } catch {
    throw new CliError(4, `Cannot write PDF: ${out}`);
  }
  return {
    format: "pdf" as const,
    out,
    pageCount: inspection.pageCount,
    width: capture.width,
    height: capture.height,
    blockedRequests: capture.blockedRequests,
    adjustedTracking: capture.adjustedTracking ?? 0,
    ats: {
      ...ats,
      passed:
        ats.passed &&
        pageCountPassed &&
        (pageChecks?.every((page) => page.passed) ?? true),
      pageCountPassed,
      ...(pageChecks?.length ? { pageChecks } : {}),
      text: inspection.text,
      pages: inspection.pages.map(({ number, text, links, width, height }) => ({
        number,
        text,
        links,
        width,
        height,
      })),
    },
  };
}
