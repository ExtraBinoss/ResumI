export const digitalLayoutNames = [
  "terminal",
  "mainframe",
  "arcade",
  "blueprint",
  "orbit",
] as const;
export const expressiveLayoutNames = [
  "risograph",
  "swiss",
  "botanica",
  "cassette",
  "signal",
] as const;
export const curatedLayoutNames = [
  "maison",
  "gallery",
  "forma",
  "linen",
  "muse",
  "cinema",
  "panorama",
] as const;
export const artfulLayoutNames = [
  "vellum",
  "chroma",
  "terrazzo",
  "spectrum",
  "bloom",
  "kinetic",
  "patina",
] as const;
export const spatialLayoutNames = [
  "contour",
  "nocturne",
  "solstice",
  "aerogram",
  "gridline",
  "polaroid",
] as const;
export const creativeFamilies = [
  "digital",
  "expressive",
  "curated",
  "artful",
  "spatial",
] as const;
export type CreativeFamily = (typeof creativeFamilies)[number];
export const portraitLayoutNames: readonly string[] = [
  "profile",
  "atelier",
  "maison",
  "linen",
  "muse",
  "polaroid",
];
export const creativeLayoutNames = [
  ...digitalLayoutNames,
  ...expressiveLayoutNames,
  ...curatedLayoutNames,
  ...artfulLayoutNames,
  ...spatialLayoutNames,
] as const;
export type CreativeResumeLayout = (typeof creativeLayoutNames)[number];
export function isDigitalLayout(layout: ResumeLayout): boolean {
  return (digitalLayoutNames as readonly string[]).includes(layout);
}
export function creativeFamily(layout: CreativeResumeLayout): CreativeFamily {
  if ((digitalLayoutNames as readonly string[]).includes(layout))
    return "digital";
  if ((expressiveLayoutNames as readonly string[]).includes(layout))
    return "expressive";
  if ((curatedLayoutNames as readonly string[]).includes(layout))
    return "curated";
  if ((artfulLayoutNames as readonly string[]).includes(layout))
    return "artful";
  return "spatial";
}
export type ResumeLayout =
  | "studio"
  | "editorial"
  | "classic"
  | "profile"
  | "harvard"
  | "cobalt"
  | "atelier"
  | "timeline"
  | "consultant"
  | "mosaic"
  | CreativeResumeLayout;

export function isCreativeLayout(
  layout: ResumeLayout,
): layout is CreativeResumeLayout {
  return (creativeLayoutNames as readonly string[]).includes(layout);
}
export type ResumeSection = {
  id?: string;
  title: string;
  blocks: { id?: string; kind: string; text: string }[];
};
export type ResumeData = {
  name: string;
  accent: string;
  serif: boolean;
  layout?: ResumeLayout;
  portrait?: string;
  portraitAsset?: boolean;
  artwork?: string;
  artworkAsset?: boolean;
  font?: string;
  license?: string;
  brands?: TemplateBrand[];
  brandAssets?: boolean;
  sections: ResumeSection[];
};

export type TemplateBrand = {
  name: string;
  viewBox: string;
  source: string;
  license: string;
  parts: { path: string; fill: string; fillRule?: "nonzero" | "evenodd" }[];
};
