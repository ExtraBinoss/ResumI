import { SHAPE_CATALOG, type LayerPatch } from "@resumi/engine";

export type AssetKind = "shapes" | "icons" | "brands";
export type Asset = NonNullable<LayerPatch["vector"]> & {
  id: string;
  name: string;
  category?: string;
  source?: string;
  license?: string;
};
type BrandCatalog = {
  credits: Record<string, string>;
  icons: (Asset & { source: string; license: string })[];
};

/** Shared immutable artwork. Catalog JSON is loaded only on demand, in any runtime. */
export async function loadAssets(kind: AssetKind): Promise<Asset[]> {
  if (kind === "icons") return (await import("../data/icons.json")).default;
  if (kind === "shapes")
    return [...SHAPE_CATALOG, ...(await import("../data/shapes.json")).default];
  const catalog = (await import("../data/brands.json")).default as BrandCatalog;
  return catalog.icons.map((item) => ({
    ...item,
    attribution: `${catalog.credits[item.license]}\nSource: ${item.source}`,
  }));
}

export function assetKind(id: string): AssetKind {
  return id.startsWith("brand-")
    ? "brands"
    : id.startsWith("lucide:")
      ? "icons"
      : "shapes";
}

function escape(value: string | number) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

/** Emits vetted catalog geometry with original brand paints and full credits. */
export function assetSvg(asset: Asset): string {
  const paths = asset.parts?.map((part) => {
    const attributes: Record<string, string | number | undefined> = {
      d: part.path,
      fill: part.fill,
      stroke: part.stroke,
      "stroke-width": part.strokeWidth,
      opacity: part.opacity,
      "fill-rule": part.fillRule,
      "stroke-linecap": part.linecap,
      "stroke-linejoin": part.linejoin,
      transform: part.matrix ? `matrix(${part.matrix.join(" ")})` : undefined,
    };
    return `<path ${Object.entries(attributes)
      .filter(([, value]) => value !== undefined)
      .map(([name, value]) => `${name}="${escape(value!)}"`)
      .join(" ")}/>`;
  });
  const geometry =
    paths?.join("") ??
    `<path d="${escape(asset.path)}" ${asset.strokeOnly ? 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"' : 'fill="currentColor"'}/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${escape(asset.viewBox)}" role="img" aria-label="${escape(asset.name)}"><title>${escape(asset.name)}</title>${asset.attribution ? `<metadata>${escape(asset.attribution)}</metadata>` : ""}${geometry}</svg>`;
}
