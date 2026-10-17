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
  | "mosaic";
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
