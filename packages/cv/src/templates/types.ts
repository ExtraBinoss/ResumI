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
export const creativeLayoutNames = [
  ...digitalLayoutNames,
  ...expressiveLayoutNames,
] as const;
export type CreativeResumeLayout = (typeof creativeLayoutNames)[number];
export function isDigitalLayout(layout: ResumeLayout): boolean {
  return (digitalLayoutNames as readonly string[]).includes(layout);
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
