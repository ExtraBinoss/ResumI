// Uniform-background contrast analysis, adapted from the read-only Vue V1 engine.
// WCAG 1.4.3 / 1.4.6: https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum
import type { Document } from "../document/schema";
import { localizedBlock } from "../localization/document";
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
export type ContrastTarget = "AA" | "AAA";
export interface ContrastRun extends ContrastAudit {
  start: number;
  end: number;
  text: string;
  color: string;
}
export function contrastRequirement(large: boolean, target: ContrastTarget) {
  return target === "AAA" ? (large ? 4.5 : 7) : large ? 3 : 4.5;
}
export function auditTextContrastRuns(
  document: Document,
  id: string,
  range?: { start: number; end: number },
): ContrastRun[] {
  const block = document.blocks[id] ? localizedBlock(document, id) : undefined;
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
  const from = range?.start ?? 0,
    to = range?.end ?? block?.text.length ?? 0;
  const unknown = (reason?: string): ContrastRun[] => [
    {
      ...base,
      start: from,
      end: to,
      text: block?.text.slice(from, to) ?? "",
      color: base.foreground,
      ...(reason ? { reason } : {}),
    },
  ];
  if (!background.reliable) return unknown(background.reason);
  if (!block || layer?.type !== "text") return unknown();
  if (
    !Number.isInteger(from) ||
    !Number.isInteger(to) ||
    from < 0 ||
    to <= from ||
    to > block.text.length
  )
    return unknown("No text in this range");
  return richTextSegments(block.text, layer.marks)
    .filter((segment) => segment.start < to && segment.end > from)
    .map((segment): ContrastRun => {
      const style = { ...layer, ...segment.style };
      const foreground = background.foreground(colorPixel(style.color)!);
      const ratio = pixelContrast(foreground, background.background);
      const isLargeText =
        style.fontSize >= 24 ||
        (style.fontSize >= (14 * 96) / 72 && style.fontWeight >= 700);
      const aa = ratio >= contrastRequirement(isLargeText, "AA"),
        aaa = ratio >= contrastRequirement(isLargeText, "AAA");
      return {
        start: Math.max(from, segment.start),
        end: Math.min(to, segment.end),
        text: segment.text.slice(
          Math.max(0, from - segment.start),
          Math.min(segment.text.length, to - segment.start),
        ),
        color: style.color,
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
}
export function auditTextContrast(
  document: Document,
  id: string,
  range?: { start: number; end: number },
): ContrastAudit {
  const audits = auditTextContrastRuns(document, id, range);
  const rank = { Unknown: 0, Fail: 1, AA: 2, AAA: 3 };
  // The worst grade wins; a large heading must not hide a failing small marked range.
  return audits.sort(
    (first, second) =>
      rank[first.level] - rank[second.level] || first.ratio! - second.ratio!,
  )[0];
}
