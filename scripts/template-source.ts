/** Flatten trusted authoring modules into one readable, dependency-free TSX component. */
export async function templateSource(root: URL): Promise<string> {
  const files = [
    "types.ts",
    "TemplateContent.tsx",
    "extended-css.ts",
    "ExtendedLayouts.tsx",
    "CodeResume.tsx",
  ];
  const sources = await Promise.all(
    files.map((file) =>
      Bun.file(new URL(`packages/cv/src/templates/${file}`, root)).text(),
    ),
  );
  return sources
    .map((source) =>
      source
        .replace(/^import(?:[\s\S]*?)from\s+["'][^"']+["'];\n/gm, "")
        .replace(/^export (?=(?:type|function|const)\b)/gm, ""),
    )
    .join("\n");
}
