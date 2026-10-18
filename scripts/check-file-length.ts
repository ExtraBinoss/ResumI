import { readdir, readFile } from "node:fs/promises";
import { resolve, relative, extname } from "node:path";
export const defaultExcluded = [
  "node_modules",
  ".git",
  "build",
  "dist",
  "coverage",
  "artifacts",
  ".react-router",
  ".wrangler",
  "playwright-report",
  "test-results",
];
export interface ScanOptions {
  limit?: number;
  warn?: number;
  extensions?: string[];
  exclude?: string[];
}
/** A terminal newline terminates a physical line; it does not add an empty line. */
export function physicalLines(source: string): number {
  return source === ""
    ? 0
    : source.split("\n").length - (source.endsWith("\n") ? 1 : 0);
}
export async function scanFiles(root: string, options: ScanOptions = {}) {
  const limit = options.limit ?? 600,
    warn = options.warn ?? 500;
  const extensions = options.extensions ?? [
    ".ts",
    ".tsx",
    ".js",
    ".jsx",
    ".css",
  ];
  const excluded = new Set([...defaultExcluded, ...(options.exclude ?? [])]);
  const results: { path: string; lines: number; status: "fail" | "warn" }[] =
    [];
  async function visit(directory: string): Promise<void> {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const path = resolve(directory, entry.name),
        local = relative(root, path);
      if (excluded.has(entry.name) || excluded.has(local)) continue;
      if (entry.isDirectory()) await visit(path);
      else if (entry.isFile() && extensions.includes(extname(path))) {
        const lines = physicalLines(await readFile(path, "utf8"));
        if (lines >= warn || lines >= limit)
          results.push({
            path: local,
            lines,
            status: lines >= limit ? "fail" : "warn",
          });
      }
    }
  }
  await visit(resolve(root));
  return results;
}
if (import.meta.main) {
  const config = JSON.parse(
    await Bun.file(new URL("../source-policy.json", import.meta.url)).text(),
  ) as ScanOptions;
  const result = await scanFiles(process.cwd(), config);
  result.forEach((file) =>
    console.log(
      `${file.status.toUpperCase()} ${file.path}: ${file.lines} lines`,
    ),
  );
  console.log(
    `Source length: ${result.filter((f) => f.status === "fail").length} failures; limit is <${config.limit ?? 600}.`,
  );
  process.exitCode = result.some((file) => file.status === "fail") ? 1 : 0;
}
