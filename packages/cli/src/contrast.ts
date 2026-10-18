import {
  applyCommand,
  auditDocumentContrast,
  documentLocale,
  defaultLocalization,
  type Document,
} from "@resumi/engine";
import { CliError, write, type IO } from "./io";
import { protectProjectPath, selectPages } from "./pages";

export async function contrast(
  document: Document,
  flags: Map<string, string>,
  io: IO,
  input: string,
) {
  const level = flags.get("--level") ?? "AA";
  if (level !== "AA" && level !== "AAA")
    throw new CliError(
      2,
      "Contrast level must be AA or AAA. See docs contrast.",
    );
  const available = (document.localization ?? defaultLocalization).locales.map(
      (locale) => locale.code,
    ),
    requested = flags.get("--locale") ?? documentLocale(document),
    locales = requested === "all" ? available : [requested],
    pageIds = selectPages(document, flags.get("--pages"));
  if (locales.some((locale) => !available.includes(locale)))
    throw new CliError(
      2,
      `Unknown document locale. Choose ${available.join("| ")} or all.`,
    );
  const out = flags.get("--out");
  if (out) protectProjectPath(input, [out]);
  const reports = locales.map((code) =>
    auditDocumentContrast(
      code === documentLocale(document)
        ? document
        : applyCommand(document, { type: "locale.activate", code }),
      { level, pageIds },
    ),
  );
  const report = {
    documentId: document.id,
    target: level,
    textPassed: reports.every((item) => item.textPassed),
    reports,
    ...(out ? { out } : {}),
  };
  if (out) await write(io, out, JSON.stringify(report, null, 2) + "\n");
  return report;
}
