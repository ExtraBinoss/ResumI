import type { Block, Canvas, LayerPatch } from "@resumi/engine";

export type CapturedItem = {
  kind: Block["kind"];
  text: string;
  originalId?: string;
  group: string;
  page: number;
  patch: LayerPatch;
  svg?: string;
};
export type CapturedLayout = {
  pages: { width: number; height: number; background: string }[];
  groups: Record<string, { name: string; originalId?: string }>;
  items: CapturedItem[];
  fonts: Canvas["fonts"];
};
