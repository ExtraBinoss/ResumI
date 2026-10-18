// Uniform-background contrast analysis, adapted from the read-only Vue V1 engine.
// WCAG 1.4.3 / 1.4.6: https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum
import type { Document } from "../document/schema";
import { contrastBackground } from "./contrast-background";
import { colorPixel, pixelContrast, pixelHex } from "./contrast-colors";
import { richTextSegments } from "./marks";
export { contrastRatio, relativeLuminance } from "./contrast-colors";
export interface ContrastAudit {
  ratio: number | null;
  foreground: string;
  background: string;
  isLargeText: boolean;
  aa: boolean;
  aaa: boolean;
  reliable: boolean;
  reason?: string;
  level: "AAA" | "AA" | "Fail" | "Unknown";
}
export function auditTextContrast(
  document: Document,
  id: string,
  range?: { start: number; end: number },
): ContrastAudit {
  const block = document.blocks[id];
  const layer = block?.design;
  const background = contrastBackground(document, id);
  const base: ContrastAudit = {
    ratio: null,
    foreground: layer?.type === "text" ? layer.color : "#000000",
    background: pixelHex(background.background),
    isLargeText: false,
    aa: false,
    aaa: false,
    reliable: false,
    level: "Unknown",
  };
  if (!background.reliable) return { ...base, reason: background.reason };
  if (layer?.type !== "text") return base;
  const from = range?.start ?? 0,
    to = range?.end ?? block.text.length;
  if (from < 0 || to <= from || to > block.text.length)
    return { ...base, reason: "No text in this range" };
  const audits = richTextSegments(block.text, layer.marks)
    .filter((segment) => segment.start < to && segment.end > from)
    .map((segment): ContrastAudit => {
      const style = { ...layer, ...segment.style };
      const foreground = background.foreground(colorPixel(style.color)!);
      const ratio = pixelContrast(foreground, background.background);
      const isLargeText =
        style.fontSize >= 24 ||
        (style.fontSize >= (14 * 96) / 72 && style.fontWeight >= 700);
      const aa = ratio >= (isLargeText ? 3 : 4.5),
        aaa = ratio >= (isLargeText ? 4.5 : 7);
      return {
        ratio,
        foreground: pixelHex(foreground),
        background: pixelHex(background.background),
        isLargeText,
        aa,
        aaa,
        reliable: true,
        level: aaa ? "AAA" : aa ? "AA" : "Fail",
      };
    });
  const rank = { Unknown: 0, Fail: 1, AA: 2, AAA: 3 };
  // The worst grade wins; a large heading must not hide a failing small marked range.
  return (
    audits.sort(
      (first, second) =>
        rank[first.level] - rank[second.level] || first.ratio! - second.ratio!,
    )[0] ?? base
  );
}
