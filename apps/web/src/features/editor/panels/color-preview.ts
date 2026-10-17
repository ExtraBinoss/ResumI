import { layerStyle } from "@resumi/cv";
import type { Layer } from "@resumi/engine";

export type ColorPreviewTarget =
  | { kind: "page" | "accent" }
  | { kind: "fill" | "stroke"; id: string; strokeOnly: boolean }
  | { kind: "gradient"; id: string; index: number }
  | { kind: "vector"; id: string; color: string }
  | { kind: "border"; id: string; layer: Extract<Layer, { type: "image" }> }
  | {
      kind: "shadow";
      id: string;
      layer: Extract<Layer, { type: "image" | "shape" }>;
    }
  | {
      kind: "text";
      id: string;
      range?: { start: number; end: number } | null;
      marks?: Extract<Layer, { type: "text" }>["marks"];
    };

type Paint = (color: string) => void;
type Undo = () => void;

/** Only paints existing DOM; the canonical document and its history stay untouched. */
export function createColorPreview(target: ColorPreviewTarget) {
  const undo: Undo[] = [],
    paints: Paint[] = [];
  const canvas = document.querySelector<HTMLElement>(
    'article[aria-label="Resume canvas"]',
  );
  const root =
    "id" in target
      ? canvas?.querySelector<HTMLElement>(
          `[data-layer-id="${CSS.escape(target.id)}"]`,
        )
      : canvas;
  function style(node: HTMLElement | SVGElement, key: string, paint: Paint) {
    const previous = node.style.getPropertyValue(key),
      priority = node.style.getPropertyPriority(key);
    undo.push(() => {
      if (previous) node.style.setProperty(key, previous, priority);
      else node.style.removeProperty(key);
    });
    paints.push(paint);
  }
  function attribute(node: Element, key: string) {
    const previous = node.getAttribute(key);
    undo.push(() => {
      if (previous === null) node.removeAttribute(key);
      else node.setAttribute(key, previous);
    });
    paints.push((color) => node.setAttribute(key, color));
  }
  if (root) {
    if (target.kind === "page" || target.kind === "accent") {
      const key = target.kind === "page" ? "background" : "--resume-accent";
      style(root, key, (color) => root.style.setProperty(key, color));
    } else if (target.kind === "fill" || target.kind === "stroke") {
      const svg = root.querySelector(".design-content > svg");
      if (svg) {
        if (target.kind === "fill")
          attribute(svg, target.strokeOnly ? "stroke" : "fill");
        else if (!target.strokeOnly) attribute(svg, "stroke");
        if (
          target.kind === "stroke" &&
          !Number(svg.getAttribute("stroke-width"))
        ) {
          const previous = svg.getAttribute("stroke-width");
          svg.setAttribute("stroke-width", "1");
          undo.push(() => {
            if (previous === null) svg.removeAttribute("stroke-width");
            else svg.setAttribute("stroke-width", previous);
          });
        }
      }
    } else if (target.kind === "gradient") {
      const stop = root.querySelectorAll("linearGradient > stop")[target.index];
      if (stop) attribute(stop, "stop-color");
    } else if (target.kind === "vector") {
      for (const path of root.querySelectorAll(".design-content > svg > path"))
        for (const key of ["fill", "stroke"])
          if (path.getAttribute(key) === target.color) attribute(path, key);
    } else if (target.kind === "border") {
      style(root, "border", (color) => {
        root.style.border = String(
          layerStyle({
            ...target.layer,
            border: {
              width: target.layer.border?.width || 1,
              style: target.layer.border?.style ?? "solid",
              color,
            },
          }).border,
        );
      });
    } else if (target.kind === "shadow" && target.layer.shadow) {
      style(root, "box-shadow", (color) => {
        root.style.boxShadow = String(
          layerStyle({
            ...target.layer,
            shadow: { ...target.layer.shadow!, color },
          }).boxShadow,
        );
      });
    } else if (target.kind === "text") {
      const content = root.querySelector<HTMLElement>(
        '[contenteditable="true"], .design-content',
      );
      if (content) {
        const range = target.range;
        if (range && range.end > range.start) {
          // Wrap only intersecting text, retaining the original styled parents.
          const walker = document.createTreeWalker(
            content,
            NodeFilter.SHOW_TEXT,
          );
          const nodes: { node: Text; start: number; end: number }[] = [];
          let offset = 0;
          while (walker.nextNode()) {
            const node = walker.currentNode as Text;
            if (node.parentElement?.closest('[aria-hidden="true"]')) continue;
            const length = node.length;
            if (range.start < offset + length && range.end > offset)
              nodes.push({
                node,
                start: Math.max(0, range.start - offset),
                end: Math.min(length, range.end - offset),
              });
            offset += length;
          }
          for (const { node, start, end } of nodes) {
            const original = node.data,
              span = document.createElement("span"),
              suffix = document.createTextNode(original.slice(end));
            // React may retain this exact Text in a Fiber. Keep it in place;
            // only the disposable paint span and suffix are inserted/removed.
            node.data = original.slice(0, start);
            span.textContent = original.slice(start, end);
            node.parentNode!.insertBefore(span, node.nextSibling);
            node.parentNode!.insertBefore(suffix, span.nextSibling);
            span.dataset.colorPreview = "";
            paints.push((color) => span.style.setProperty("color", color));
            undo.push(() => {
              node.data = original;
              span.remove();
              suffix.remove();
            });
          }
        } else {
          style(content, "color", (color) =>
            content.style.setProperty("color", color),
          );
          let offset = 0;
          for (const node of content.querySelectorAll<HTMLElement>("span, a")) {
            if (node.closest('[aria-hidden="true"]')) continue;
            const end = offset + (node.textContent?.length ?? 0);
            if (
              !target.marks?.some(
                (mark) => mark.color && mark.start < end && mark.end > offset,
              )
            )
              style(node, "color", (color) =>
                node.style.setProperty("color", color),
              );
            offset = end;
          }
        }
      }
    }
  }
  return {
    paint: (color: string) => {
      for (const paint of paints) paint(color);
    },
    restore: () => {
      for (const restore of undo.reverse()) restore();
    },
  };
}
