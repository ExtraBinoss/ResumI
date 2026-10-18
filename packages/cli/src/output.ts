import {
  documentPages,
  serializeDocument,
  type Document,
} from "@resumi/engine";
import { CliError, write, type IO } from "./io";
import {
  protectProjectPath,
  selectPages,
  sourceIsActive,
  splitPagePaths,
} from "./pages";

/** Canvas exports describe the current pages; source exports preserve exact authored code. */
export async function output(
  document: Document,
  flags: Map<string, string>,
  io: IO,
  input: string,
) {
  const requested = flags.get("--format") ?? "json",
    format = requested === "react" ? "tsx" : requested;
  if (!["json", "html", "source", "pdf", "tsx"].includes(format))
    throw new CliError(
      2,
      "output --format must be json, html, tsx (or react), source or pdf.",
    );
  const out = flags.get("--out"),
    directory = flags.get("--out-dir");
  if (out && directory)
    throw new CliError(2, "--out and --out-dir are mutually exclusive.");
  if (
    (flags.has("--pages") || directory) &&
    ["json", "source"].includes(format)
  )
    throw new CliError(
      2,
      `${format} preserves the whole project or exact saved code. Page selection and --out-dir require pdf, html or tsx.`,
    );
  const selected = selectPages(document, flags.get("--pages"));
  if (format === "tsx" && (sourceIsActive(document) || !document.canvas))
    throw new CliError(
      2,
      "Live-canvas TSX requires editable canvas pages with inactive source. For exact saved React code use --format source.",
    );
  if (directory) {
    if (sourceIsActive(document) || !document.canvas)
      throw new CliError(
        2,
        "Separate page files require editable canvas pages with inactive source. Export active source as one file with --out.",
      );
    const pageIds = selected ?? documentPages(document).map((page) => page.id);
    const paths = splitPagePaths(document, pageIds, directory, format);
    protectProjectPath(input, paths);
    const files = [];
    for (const [index, id] of pageIds.entries()) {
      const result = await one(document, format, paths[index], [id], io);
      if (typeof result === "string")
        throw new CliError(3, "Missing export destination.");
      files.push({ pageId: id, ...result });
    }
    return {
      format,
      outDir: directory,
      pageIds,
      files,
      ...(format === "pdf"
        ? {
            ats: {
              passed: files.every((file) => "ats" in file && file.ats.passed),
            },
          }
        : {}),
    };
  }
  if (out && format !== "json") protectProjectPath(input, [out]);
  return one(document, format, out, selected, io);
}

async function one(
  document: Document,
  format: string,
  out: string | undefined,
  pageIds: string[] | undefined,
  io: IO,
) {
  if (format === "pdf") {
    const { outputPdf } = await import("./pdf-output");
    return outputPdf(
      document,
      new Map(out ? [["--out", out]] : []),
      io,
      pageIds,
    );
  }
  let data: string;
  if (format === "json") data = serializeDocument(document);
  else if (format === "source") {
    if (!document.source)
      throw new CliError(
        3,
        "This project has no saved HTML/React source. Use --format html for its rendered layout or --format tsx for its live canvas.",
      );
    data = document.source.code;
  } else if (format === "tsx") {
    const { exportReactCanvas } = await import("@resumi/cv/react-export");
    data = exportReactCanvas(document, { pageIds });
  } else {
    const { renderDocumentHtml } = await import("@resumi/cv/document-render");
    data = await renderDocumentHtml(document, { pageIds });
  }
  if (!out)
    return format === "source" || data.endsWith("\n") ? data : data + "\n";
  await write(io, out, data);
  return { format, out, ...(pageIds ? { pageIds } : {}) };
}
