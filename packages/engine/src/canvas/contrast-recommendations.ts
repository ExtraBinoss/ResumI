import type { Document } from "../document/schema";
import type { Command, CommandBatch } from "../commands/schema";
import { applyCommands } from "../commands/apply";
import { documentLocale, localizedBlock } from "../localization/document";
import { groupFor } from "./groups";
import { contrastBackground } from "./contrast-background";
import {
  colorPixel,
  pixelContrast,
  pixelHex,
  type Rgba,
} from "./contrast-colors";
import {
  auditTextContrast,
  contrastRequirement,
  type ContrastRun,
  type ContrastTarget,
} from "./contrast";

export interface ContrastRecommendation {
  kind: "color" | "opacity-and-color" | "manual";
  message: string;
  verified: boolean;
  start?: number;
  end?: number;
  color?: string;
  ratio?: number;
  patch?: CommandBatch;
}

/** Unknown means review is needed; it never means a successful contrast test. */
export function contrastReviewAdvice(reason?: string): ContrastRecommendation {
  const advice: Record<string, string> = {
    "Image background":
      "Move text off the image or add an opaque solid rectangle behind it, then audit again. If keeping the image, inspect the darkest and lightest regions behind every glyph.",
    "Gradient background":
      "Use an opaque solid backing behind the text, or manually verify every part of the gradient beneath it; do not rely on the average color.",
    "Transparent page background":
      "Set an opaque page background with page.update before measuring; an unknown viewing background has no reliable contrast ratio.",
    "Blended background":
      "Use normal blending for the affected background/group, or put text on a separate opaque backing and verify the rendered result.",
    "Blended text":
      "Use normal blending on the text or isolate it on an opaque backing, then audit again.",
    "Overlapping text":
      "Separate overlapping text frames or resize them to their actual content before checking contrast again.",
    "Overlapping foreground layer":
      "Move the covering layer behind the text or separate the overlapping frames; verify the result with screenshot PROJECT.",
    "Source preview":
      "Open the source project in the app, prepare its editable canvas layers and export JSON, then audit that file. The CLI does not infer rendered HTML/TSX contrast from source code.",
    "No visual text layer":
      "Prepare editable canvas layers in the app, export JSON and audit again; structured blocks alone have no resolved visual geometry.",
    "Formatting budget":
      "The text formatting budget prevents adding a safe correction mark. Merge or remove redundant marks with validated text commands, then audit again; no proposed patch was applied.",
  };
  return {
    kind: "manual",
    verified: false,
    message:
      advice[reason ?? ""] ??
      "Use a solid opaque text backing, remove overlapping shapes/shadows/filters, or inspect the rendered result manually. Re-run the audit after editing.",
  };
}

function nearestColor(
  original: Rgba,
  ratioFor: (color: Rgba) => number,
  required: number,
) {
  const candidates: { color: string; ratio: number; distance: number }[] = [];
  for (const endpoint of [0, 255]) {
    const mix = (amount: number): Rgba => ({
      r: Math.round(original.r + (endpoint - original.r) * amount),
      g: Math.round(original.g + (endpoint - original.g) * amount),
      b: Math.round(original.b + (endpoint - original.b) * amount),
      a: 1,
    });
    if (ratioFor(mix(1)) < required) continue;
    let low = 0,
      high = 1;
    if (ratioFor(mix(0)) >= required) high = 0;
    for (let step = 0; step < 14 && high > 0; step++) {
      const middle = (low + high) / 2;
      if (ratioFor(mix(middle)) >= required) high = middle;
      else low = middle;
    }
    const color = mix(high);
    candidates.push({
      color: pixelHex(color),
      ratio: ratioFor(color),
      distance:
        (color.r - original.r) ** 2 +
        (color.g - original.g) ** 2 +
        (color.b - original.b) ** 2,
    });
  }
  return candidates.sort((a, b) => a.distance - b.distance)[0];
}

function batch(commands: Command[]): CommandBatch {
  return {
    version: 1,
    actor: { kind: "agent", name: "ResumI contrast recommendation" },
    commands,
  };
}

/** Suggestions are independently applicable validated batches, never silent edits. */
export function textContrastRecommendations(
  document: Document,
  id: string,
  runs: ContrastRun[],
  target: ContrastTarget,
): ContrastRecommendation[] {
  const layer = localizedBlock(document, id).design!;
  const group = groupFor(document, id);
  const lockedIds = (group?.elementIds ?? [id]).filter(
    (key) => document.blocks[key].design?.locked,
  );
  const unlock: Command[] = [
    ...(group?.locked
      ? [
          {
            type: "group.update" as const,
            id: group.id,
            patch: { locked: false },
          },
        ]
      : []),
    ...(lockedIds.length
      ? [
          {
            type: "layer.update" as const,
            ids: lockedIds,
            patch: { locked: false },
          },
        ]
      : []),
  ];
  const relock: Command[] = [
    ...(lockedIds.length
      ? [
          {
            type: "layer.update" as const,
            ids: lockedIds,
            patch: { locked: true },
          },
        ]
      : []),
    ...(group?.locked
      ? [
          {
            type: "group.update" as const,
            id: group.id,
            patch: { locked: true },
          },
        ]
      : []),
  ];
  const background = contrastBackground(document, id);
  return runs.flatMap((run): ContrastRecommendation[] => {
    const required = contrastRequirement(run.isLargeText, target);
    if (!run.reliable) return [contrastReviewAdvice(run.reason)];
    if (run.ratio! >= required) return [];
    const original = colorPixel(run.color)!;
    let context = background,
      opacity: Command[] = [],
      candidate = context.reliable
        ? nearestColor(
            original,
            (color) =>
              pixelContrast(
                context.reliable ? context.foreground(color) : color,
                context.background,
              ),
            required,
          )
        : undefined;
    if (!candidate && (layer.opacity < 1 || (group?.opacity ?? 1) < 1)) {
      opacity = [
        { type: "layer.update", ids: [id], patch: { opacity: 1 } },
        ...(group && group.opacity < 1
          ? [
              {
                type: "group.update" as const,
                id: group.id,
                patch: { opacity: 1 },
              },
            ]
          : []),
      ];
      const opaque = applyCommands(
        document,
        batch([...unlock, ...opacity, ...relock]),
      ).document;
      context = contrastBackground(opaque, id);
      if (context.reliable)
        candidate = nearestColor(
          original,
          (color) =>
            pixelContrast(
              context.reliable ? context.foreground(color) : color,
              context.background,
            ),
          required,
        );
    }
    if (!candidate) return [contrastReviewAdvice("No sufficient color")];
    const marks = layer.type === "text" ? layer.marks : [];
    const prefix = `contrast-${id.slice(0, 48)}-${run.start}-${run.end}`;
    let markId = prefix,
      suffix = 0;
    while (marks.some((mark) => mark.id === markId))
      markId = `${prefix}-${++suffix}`;
    const patch = batch([
      ...(document.localization
        ? [{ type: "locale.activate" as const, code: documentLocale(document) }]
        : []),
      ...unlock,
      ...opacity,
      {
        type: "text.range.format",
        id,
        markId,
        start: run.start,
        end: run.end,
        style: { color: candidate.color },
      },
      ...relock,
    ]);
    try {
      const changed = applyCommands(document, patch).document;
      const verified = auditTextContrast(changed, id, run);
      if (!verified.reliable || verified.ratio! < required)
        return [contrastReviewAdvice("Unverified correction")];
      return [
        {
          kind: opacity.length ? "opacity-and-color" : "color",
          message: `Set this text range to ${candidate.color} for at least ${required}:1 (${target}).${opacity.length ? " This also makes the text opaque; a group opacity change affects every member of that group." : ""} Other text styles and original locks are preserved. Apply this patch, then audit the whole project again.`,
          verified: true,
          start: run.start,
          end: run.end,
          color: candidate.color,
          ratio: verified.ratio!,
          patch,
        },
      ];
    } catch {
      return [contrastReviewAdvice("Formatting budget")];
    }
  });
}
