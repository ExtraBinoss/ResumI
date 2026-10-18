import { documentPages, type Document } from "@resumi/engine";
import { resolve, join } from "node:path";
import { CliError } from "./io";

export function sourceIsActive(document: Document) {
  return !!document.source && document.source.enabled !== false;
}
export function listPages(document: Document) {
  const activeSource = sourceIsActive(document);
  return {
    selectionAvailable: !!document.canvas && !activeSource,
    pages: activeSource
      ? []
      : documentPages(document).map((page, index) => ({
          number: index + 1,
          ...page,
        })),
    ...(activeSource
      ? {
          note: "Active source is exported as a whole. Prepare editable canvas pages in the app before selecting or splitting pages.",
        }
      : {}),
  };
}

/** Resolve once before rendering or writing; preserve order and reject repeated pages. */
export function selectPages(
  document: Document,
  selector: string | undefined,
): string[] | undefined {
  if (selector === undefined || selector.trim() === "all") return undefined;
  if (sourceIsActive(document) || !document.canvas)
    throw new CliError(
      2,
      "Page selection requires editable canvas pages with inactive source. Prepare the project for editing in the app first.",
    );
  const pages = documentPages(document),
    ids: string[] = [];
  function add(index: number) {
    if (!Number.isSafeInteger(index) || index < 1 || index > pages.length)
      throw new CliError(
        2,
        `Page number ${index} is outside 1–${pages.length}. Use pages PROJECT.`,
      );
    const id = pages[index - 1].id;
    if (ids.includes(id))
      throw new CliError(2, `Page ${index} is selected more than once.`);
    ids.push(id);
  }
  for (const token of selector.split(",").map((part) => part.trim())) {
    if (!token || token === "all")
      throw new CliError(
        2,
        "Use --pages all, or a comma-separated list of page numbers, ranges, IDs or exact names.",
      );
    if (/^\d+$/.test(token)) {
      add(Number(token));
      continue;
    }
    const range = token.match(/^(\d+)-(\d+)$/);
    if (range) {
      const first = Number(range[1]),
        last = Number(range[2]);
      if (first < 1 || last < first || last > pages.length)
        throw new CliError(
          2,
          `Invalid page range: ${token}. Use an ascending range within 1–${pages.length}.`,
        );
      for (let number = first; number <= last; number++) add(number);
      continue;
    }
    const byId = token.startsWith("id:"),
      byName = token.startsWith("name:"),
      value = byId || byName ? token.slice(token.indexOf(":") + 1) : token;
    const matches = pages.flatMap((page, index) =>
      (
        byId
          ? page.id === value
          : byName
            ? page.name === value
            : page.id === value || page.name === value
      )
        ? [index + 1]
        : [],
    );
    if (matches.length !== 1)
      throw new CliError(
        2,
        matches.length
          ? `Ambiguous page: ${JSON.stringify(token)}. Use a page number or id:ID.`
          : `Unknown page: ${JSON.stringify(token)}. Use pages PROJECT.`,
      );
    add(matches[0]);
  }
  return ids;
}

export function splitPagePaths(
  document: Document,
  pageIds: readonly string[],
  directory: string,
  extension: string,
) {
  if (!directory.trim())
    throw new CliError(2, "--out-dir must name a directory.");
  const pages = documentPages(document);
  return pageIds.map((id) => {
    const index = pages.findIndex((page) => page.id === id),
      page = pages[index];
    const slug =
      page.name
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 60)
        .replace(/-+$/g, "") || "page";
    return join(
      directory,
      `${String(index + 1).padStart(2, "0")}-${slug}.${extension}`,
    );
  });
}

/** Export targets must not destroy the input project, even through normalized paths. */
export function protectProjectPath(input: string, outputs: readonly string[]) {
  const inputs = new Set([
    resolve(input),
    ...(!input.endsWith(".json") ? [resolve(`${input}.json`)] : []),
  ]);
  const seen = new Set<string>();
  for (const output of outputs) {
    const path = resolve(output);
    if (inputs.has(path))
      throw new CliError(
        2,
        `Output would overwrite the project: ${output}. Choose a different export path.`,
      );
    if (seen.has(path)) throw new CliError(2, `Export paths clash: ${output}.`);
    seen.add(path);
  }
}
