/** Flatten trusted authoring modules into one readable, dependency-free TSX component. */
export async function templateSource(
  root: URL,
  family?: "digital" | "expressive",
): Promise<string> {
  const files = family
    ? [
        "types.ts",
        "creative-types.ts",
        "TemplateContent.tsx",
        "base-css.ts",
        `${family}-css.ts`,
        `${family === "digital" ? "Digital" : "Expressive"}Layouts.tsx`,
        "CreativeResume.tsx",
      ]
    : [
        "types.ts",
        "TemplateContent.tsx",
        "base-css.ts",
        "extended-css.ts",
        "ExtendedLayouts.tsx",
        "CodeResume.tsx",
      ];
  const sources = await Promise.all(
    files.map((file) =>
      Bun.file(new URL(`packages/cv/src/templates/${file}`, root)).text(),
    ),
  );
  if (family) {
    sources.splice(
      sources.length - 1,
      0,
      `const CreativeLayouts = ${family === "digital" ? "Digital" : "Expressive"}Layouts;\nconst creativeCss = ${family}Css;`,
    );
  }
  return sources
    .map((source) =>
      source
        .replace(/^import(?:[\s\S]*?)from\s+["'][^"']+["'];\n/gm, "")
        .replace(/^export (?=(?:type|function|const)\b)/gm, "")
        .trim(),
    )
    .join("\n\n");
}
