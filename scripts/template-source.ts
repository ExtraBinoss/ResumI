import type { CreativeFamily } from "../packages/cv/src/templates/types";
const familyComponents = {
  digital: "Digital",
  expressive: "Expressive",
  curated: "Curated",
  artful: "Artful",
  spatial: "Spatial",
} as const;
/** Flatten trusted authoring modules into one readable, dependency-free TSX component. */
export async function templateSource(
  root: URL,
  family?: CreativeFamily,
): Promise<string> {
  const files = family
    ? [
        "types.ts",
        "creative-types.ts",
        "TemplateContent.tsx",
        "base-css.ts",
        `${family}-css.ts`,
        ...(family === "artful" ? ["ArtfulArt.tsx"] : []),
        `${familyComponents[family]}Layouts.tsx`,
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
      `const CreativeLayouts = ${familyComponents[family]}Layouts;\nconst creativeCss = ${family}Css;`,
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
