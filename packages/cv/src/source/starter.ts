import {
  localizedBlock,
  localizedSectionTitle,
  type Document,
} from "@resumi/engine";
import type { ResumeData, ResumeLayout } from "../templates/types";
import assets from "../templates/assets.generated.json" with { type: "json" };
import template from "./template.generated.json" with { type: "json" };
export type ReactTemplateOptions = {
  layout?: ResumeLayout;
  portrait?: boolean | string;
};
const layouts: ResumeLayout[] = [
  "studio",
  "editorial",
  "classic",
  "profile",
  "harvard",
  "cobalt",
  "atelier",
  "timeline",
  "consultant",
  "mosaic",
];
function storedData(
  document: Document,
  kind: "data" | "assets",
): Record<string, unknown> | null {
  if (document.source?.format !== "react") return null;
  const match = document.source.code.match(
    new RegExp(
      `/\\* resumi-${kind} \\*/([\\s\\S]*?)/\\* resumi-${kind}-end \\*/`,
    ),
  );
  if (!match) return null;
  try {
    const data: unknown = JSON.parse(match[1]);
    return data && typeof data === "object" && !Array.isArray(data)
      ? (data as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}
function portraitValue(value: unknown): string | undefined {
  return typeof value === "string" &&
    /^data:image\/(png|jpeg|webp);base64,[\da-z+/]+=*$/i.test(value)
    ? value
    : undefined;
}
/** Keep the top of a human-editable file readable; binary assets live in one footer section. */
export function makeReactSource(
  document: Document,
  options: ReactTemplateOptions = {},
): string {
  const data = resumeData(document, options);
  const { font, portrait, license, brands, ...content } = data;
  return template
    .replace(
      /\/\* resumi-template:[a-z]+ \*\//,
      `/* resumi-template:${data.layout} */`,
    )
    .replace(
      /\/\* resume-data:start \*\/[\s\S]*?\/\* resume-data:end \*\//,
      () =>
        `/* resumi-data */${JSON.stringify({ ...content, ...(portrait ? { portraitAsset: true } : {}), ...(brands ? { brandAssets: true } : {}) }, null, 2)}/* resumi-data-end */`,
    )
    .replace(
      /\/\* resume-assets:start \*\/[\s\S]*?\/\* resume-assets:end \*\//,
      () =>
        `/* resumi-assets */${JSON.stringify({ font, ...(portrait ? { portrait } : {}), ...(brands ? { brands } : {}), license }, null, 2)}/* resumi-assets-end */`,
    );
}
export function resumeData(
  document: Document,
  options: ReactTemplateOptions = {},
): ResumeData {
  const stored = storedData(document, "data");
  const storedLayout = stored?.layout;
  const marker = document.source?.code.match(
    /\/\* resumi-template:([a-z]+) \*\//,
  )?.[1];
  const layout =
    options.layout ??
    (layouts.includes(storedLayout as ResumeLayout)
      ? (storedLayout as ResumeLayout)
      : layouts.includes(marker as ResumeLayout)
        ? (marker as ResumeLayout)
        : document.style.font === "serif"
          ? "editorial"
          : "studio");
  const existingImage = Object.values(document.blocks).find(
    (block) => block.design?.type === "image",
  )?.design;
  const portrait =
    options.portrait === true
      ? assets.portrait
      : options.portrait === false
        ? undefined
        : (portraitValue(options.portrait) ??
          portraitValue(stored?.portrait) ??
          (stored?.portraitAsset
            ? portraitValue(storedData(document, "assets")?.portrait)
            : undefined) ??
          (existingImage?.type === "image" ? existingImage.src : undefined));
  const brandNames =
    layout === "cobalt"
      ? ["Figma", "TypeScript", "HTML", "CSS", "Storybook"]
      : layout === "atelier"
        ? ["Figma", "Sketch", "Adobe Illustrator"]
        : layout === "mosaic"
          ? ["Figma", "Adobe Illustrator", "Blender"]
          : [];
  const brands = assets.brands.filter((brand) =>
    brandNames.includes(brand.name),
  );
  return {
    name: document.name,
    accent: document.style.accent,
    serif: document.style.font === "serif",
    layout,
    font: assets.font,
    license: `${assets.license}${brands.length ? `\n\n${assets.brandLicense}` : ""}`,
    ...(["profile", "atelier"].includes(layout) && portrait
      ? { portrait }
      : {}),
    ...(brands.length ? { brands } : {}),
    sections: document.sectionIds.map((id) => ({
      id,
      title: localizedSectionTitle(document, id),
      blocks: document.sections[id].blockIds
        .filter((blockId) => {
          const block = document.blocks[blockId],
            layer = block.design;
          const projectedTitle =
            layer?.type === "text" &&
            layer.uppercase &&
            layer.name === document.sections[id].title &&
            block.text === document.sections[id].title;
          return !["image", "shape"].includes(block.kind) && !projectedTitle;
        })
        .map((blockId) => ({
          id: blockId,
          kind: document.blocks[blockId].kind,
          text: localizedBlock(document, blockId).text,
        })),
    })),
  };
}
