import { validateDocument, type Document } from "../document/schema";
import { localizedBlock, documentLocale } from "../localization/document";
import { EngineError } from "../validation";
import {
  documentPages,
  canvasForPage,
  pageForLayer,
  INITIAL_PAGE_ID,
} from "./pages";
import { groupFor } from "./groups";
import type { Layer } from "./schema";
import {
  auditTextContrastRuns,
  contrastRequirement,
  type ContrastTarget,
} from "./contrast";
import {
  contrastReviewAdvice,
  textContrastRecommendations,
} from "./contrast-recommendations";

export interface DocumentContrastOptions {
  level?: ContrastTarget;
  pageIds?: readonly string[];
}

function layerColors(layer: Layer): string[] {
  if (layer.type === "text")
    return [
      ...new Set([
        layer.color,
        ...layer.marks.flatMap((mark) => (mark.color ? [mark.color] : [])),
      ]),
    ];
  if (layer.type === "image") return layer.border ? [layer.border.color] : [];
  return [
    ...new Set([
      layer.fill,
      layer.stroke,
      ...(layer.gradient?.stops.map((stop) => stop.color) ?? []),
      ...(layer.vector?.parts?.flatMap((part) =>
        [part.fill, part.stroke].filter((color): color is string => !!color),
      ) ?? []),
    ]),
  ];
}

/** Every block is inventoried; only resolved native text receives an automated grade. */
export function auditDocumentContrast(
  input: Document,
  options: DocumentContrastOptions = {},
) {
  const document = validateDocument(input),
    level = options.level ?? "AA",
    pages = documentPages(document),
    ids =
      options.pageIds ??
      (pages.length ? pages.map((page) => page.id) : [INITIAL_PAGE_ID]);
  if (!["AA", "AAA"].includes(level))
    throw new EngineError("INVALID_INPUT", "Contrast level must be AA or AAA.");
  if (
    options.pageIds &&
    (!ids.length ||
      new Set(ids).size !== ids.length ||
      ids.some((id) => !pages.some((page) => page.id === id)))
  )
    throw new EngineError(
      "INVALID_INPUT",
      "Select distinct existing page IDs for contrast analysis.",
    );
  const source = !!document.source && document.source.enabled !== false,
    mode = source ? "source" : document.canvas ? "canvas" : "structured";
  const order = [
    ...new Set([
      ...(document.canvas?.order ?? []),
      ...Object.keys(document.blocks),
    ]),
  ];
  const elements = order
    .filter((id) => ids.includes(pageForLayer(document, id)))
    .map((id) => {
      const block = localizedBlock(document, id),
        layer = block.design,
        group = groupFor(document, id),
        pageId = pageForLayer(document, id),
        page = document.canvas ? canvasForPage(document, pageId) : undefined,
        text = layer
          ? layer.type === "text"
          : !["image", "shape"].includes(block.kind);
      const common = {
        id,
        name: layer?.name ?? block.text.slice(0, 80),
        type: layer?.type ?? block.kind,
        pageId,
        groupId: group?.id ?? null,
        ...(layer
          ? {
              frame: {
                x: layer.x,
                y: layer.y,
                width: layer.width,
                height: layer.height,
                rotation: layer.rotation,
              },
              appearance: {
                opacity: layer.opacity,
                blendMode: layer.blendMode,
                ...(layer.type !== "text" ? { effects: layer.effects } : {}),
              },
              colors: layerColors(layer),
            }
          : {}),
      };
      const skipped =
        layer?.hidden ||
        group?.hidden ||
        layer?.opacity === 0 ||
        group?.opacity === 0
          ? "Hidden element"
          : mode === "canvas" && (!layer || !page?.order.includes(id))
            ? "Element is not rendered on the canvas"
            : text && !block.text.trim()
              ? "Empty text"
              : null;
      if (skipped)
        return {
          ...common,
          text,
          status: "skipped" as const,
          reason: skipped,
          runs: [],
          recommendations: [],
        };
      if (mode !== "canvas") {
        const reason = source ? "Source preview" : "No visual text layer";
        return {
          ...common,
          text,
          status: "review" as const,
          reason,
          runs: [],
          recommendations: [contrastReviewAdvice(reason)],
        };
      }
      if (!text || layer?.type !== "text")
        return {
          ...common,
          text: false,
          status: "review" as const,
          reason: "Non-text graphic",
          runs: [],
          recommendations: [
            {
              kind: "manual" as const,
              verified: false,
              message:
                "Decide whether this is decorative/a logo or conveys essential information. Meaningful graphics need at least 3:1 against adjacent colors (WCAG 1.4.11). Inspect every relevant vector paint or image region with screenshot PROJECT; recolor the meaningful shape/icon, add a contrasting outline or a solid backing. Do not recolor brand marks without checking their brand guidelines. Photos and decorative artwork have no automatic text-contrast grade.",
            },
          ],
        };
      const runs = auditTextContrastRuns(document, id).map((run) => ({
        ...run,
        requiredRatio: contrastRequirement(run.isLargeText, level),
        passed: run.reliable
          ? run.ratio! >= contrastRequirement(run.isLargeText, level)
          : null,
      }));
      return {
        ...common,
        text: true,
        status: runs.some((run) => !run.reliable)
          ? ("review" as const)
          : runs.some((run) => !run.passed)
            ? ("fail" as const)
            : ("pass" as const),
        runs,
        recommendations: textContrastRecommendations(document, id, runs, level),
      };
    });
  const counts = (text: boolean) => ({
    total: elements.filter((item) => item.text === text).length,
    pass: elements.filter(
      (item) => item.text === text && item.status === "pass",
    ).length,
    fail: elements.filter(
      (item) => item.text === text && item.status === "fail",
    ).length,
    review: elements.filter(
      (item) => item.text === text && item.status === "review",
    ).length,
    skipped: elements.filter(
      (item) => item.text === text && item.status === "skipped",
    ).length,
  });
  const summary = { text: counts(true), graphics: counts(false) };
  return {
    documentId: document.id,
    locale: documentLocale(document),
    target: level,
    mode,
    textPassed:
      mode === "canvas" && summary.text.fail === 0 && summary.text.review === 0,
    summary,
    pages: ids.flatMap((id) => pages.filter((page) => page.id === id)),
    groups: (document.canvas?.groups ?? []).filter((group) =>
      group.elementIds.some((id) => ids.includes(pageForLayer(document, id))),
    ),
    elements,
    ...(mode !== "canvas"
      ? {
          recommendations: [
            contrastReviewAdvice(
              source ? "Source preview" : "No visual text layer",
            ),
          ],
        }
      : {}),
    note: "Read-only audit. Text is checked against resolved solid backgrounds, including alpha, group opacity and mixed styling. Graphics require semantic/visual review; this report is not a WCAG certification. Recommendation patches target one text range; apply chosen patches and re-run the entire audit.",
    references: [
      "https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html",
      "https://www.w3.org/WAI/WCAG22/Understanding/contrast-enhanced.html",
      "https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html",
    ],
  };
}
