import { documentPages, type Document } from "@resumi/engine";
import { boundedInteger } from "./arguments";
import { CliError, type IO } from "./io";
import { protectProjectPath, selectPages } from "./pages";

export async function screenshot(
  document: Document,
  flags: Map<string, string>,
  io: IO,
  input: string,
) {
  const out = flags.get("--out");
  if (!out || !/\.png$/i.test(out))
    throw new CliError(
      2,
      "screenshot requires --out FILE.png. See help screenshot.",
    );
  protectProjectPath(input, [out]);
  const selection = flags.get("--page");
  let pageIds = selectPages(document, selection);
  if (selection !== undefined) {
    pageIds ??= documentPages(document).map((page) => page.id);
    if (pageIds.length !== 1)
      throw new CliError(
        2,
        "screenshot --page must select exactly one editable canvas page.",
      );
  }
  const selected = pageIds
    ? documentPages(document).find((page) => page.id === pageIds[0])
    : undefined;
  const width = boundedInteger(
    flags.get("--width"),
    Math.ceil(selected?.width ?? document.canvas?.width ?? 794),
    100,
    5000,
  );
  const height = boundedInteger(
    flags.get("--height"),
    Math.ceil(selected?.height ?? document.canvas?.height ?? 1123),
    100,
    10000,
  );
  if (!io.capture || !io.writeBinary)
    throw new CliError(
      3,
      "Screenshot capture is unavailable in this adapter. Run the Bun CLI after bunx playwright install chromium.",
    );
  const { renderDocumentHtml } = await import("@resumi/cv/document-render");
  const capture = await io.capture(
    await renderDocumentHtml(document, { pageIds }),
    width,
    height,
  );
  try {
    await io.writeBinary(out, capture.bytes);
  } catch {
    throw new CliError(4, `Cannot write screenshot: ${out}`);
  }
  return {
    format: "png",
    out,
    width: capture.width,
    height: capture.height,
    blockedRequests: capture.blockedRequests,
    ...(pageIds ? { pageIds } : {}),
  };
}
