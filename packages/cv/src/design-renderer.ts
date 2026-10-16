import {
  richTextSegments,
  safeTextHref,
  shapeDefinition,
  svgGradientVector,
  visualEffectFilterMarkup,
  visualEffectFilterValue,
  type Block,
  type Document,
  type Layer,
  type LayerGroup,
} from "@resumi/engine";
import { escapeHtml } from "./escape";
const escape = escapeHtml;
export const designCss = `
.resume.freeform{position:relative;padding:0;min-height:0;overflow:hidden;isolation:isolate;line-height:normal;}
.design-layer{position:absolute;transform-origin:center;box-sizing:border-box;}
.design-content{display:block;margin:0;width:100%;height:100%;white-space:pre-wrap;overflow-wrap:anywhere;}
.design-content svg{display:block;width:100%;height:100%;overflow:visible;}
.design-content img{display:block;width:100%;height:100%;}
.design-group{position:absolute;inset:0;pointer-events:none;}
.design-group>.design-layer{pointer-events:auto;}
@media print{.resume.freeform{width:210mm!important;height:297mm!important;min-height:0;print-color-adjust:exact;-webkit-print-color-adjust:exact;}}
`;
export function layerStyle(layer: Layer): Record<string, string | number> {
  const frame = {
    left: layer.x,
    top: layer.y,
    width: layer.width,
    height: layer.height,
    transform: `rotate(${layer.rotation}deg)`,
    opacity: layer.opacity,
    mixBlendMode: layer.blendMode,
  };
  return frame;
}
export function groupStyle(group: LayerGroup): Record<string, string | number> {
  return { opacity: group.opacity, mixBlendMode: group.blendMode };
}
function css(style: Record<string, string | number>) {
  return Object.entries(style)
    .map(
      ([key, value]) =>
        `${key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}:${typeof value === "number" && ["left", "top", "width", "height"].includes(key) ? `${value}px` : escape(String(value))}`,
    )
    .join(";");
}
function textCss(style: {
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: number;
  fontStyle?: string;
  color?: string;
  underline?: boolean;
  strike?: boolean;
}) {
  return css({
    ...(style.fontFamily ? { fontFamily: style.fontFamily } : {}),
    ...(style.fontSize ? { fontSize: `${style.fontSize}px` } : {}),
    ...(style.fontWeight ? { fontWeight: style.fontWeight } : {}),
    ...(style.fontStyle ? { fontStyle: style.fontStyle } : {}),
    ...(style.color ? { color: style.color } : {}),
    textDecoration:
      [style.underline ? "underline" : "", style.strike ? "line-through" : ""]
        .filter(Boolean)
        .join(" ") || "none",
  });
}
export function renderLayerContent(block: Block): string {
  const layer = block.design!;
  if (layer.type === "text") {
    const tag = block.kind === "heading" ? "h1" : "p";
    const body = richTextSegments(block.text, layer.marks)
      .map((segment) => {
        const text = escape(segment.text),
          href = safeTextHref(segment.style.href),
          style = textCss({ ...layer, ...segment.style });
        return href
          ? `<a href="${escape(href)}" style="${style}" rel="noopener noreferrer">${text}</a>`
          : `<span style="${style}">${text}</span>`;
      })
      .join("");
    return `<${tag} class="design-content" style="${textCss({ ...layer, underline: false, strike: false })};line-height:${layer.lineHeight};letter-spacing:${layer.letterSpacing}px;text-align:${layer.align};text-transform:${layer.uppercase ? "uppercase" : "none"};${block.kind === "bullet" ? "position:relative;padding-left:13px" : ""}">${block.kind === "bullet" ? '<span aria-hidden="true" style="position:absolute;left:0">•</span>' : ""}${body}</${tag}>`;
  }
  const effects = visualEffectFilterMarkup(block.id, layer.effects),
    filter = visualEffectFilterValue(block.id, layer.effects);
  if (layer.type === "image")
    return `${effects}<div class="design-content" style="overflow:hidden;border-radius:${layer.borderRadius}px;${filter ? `filter:${filter}` : ""}"><img src="${escape(layer.src)}" alt="${escape(layer.alt)}" draggable="false" style="object-fit:${layer.objectFit};object-position:${layer.objectPosition.x}% ${layer.objectPosition.y}%;transform:scale(${layer.imageScale});transform-origin:${layer.objectPosition.x}% ${layer.objectPosition.y}%"></div>`;
  const shape = layer.vector ?? shapeDefinition(layer.shape)!;
  const gradient = layer.gradient,
    gradientId = `gradient-${block.id}`,
    vector = gradient ? svgGradientVector(gradient.angle) : undefined;
  const defs =
    gradient && vector
      ? `<defs><linearGradient id="${gradientId}" x1="${vector.x1}" y1="${vector.y1}" x2="${vector.x2}" y2="${vector.y2}">${gradient.stops.map((stop) => `<stop offset="${stop.offset}" stop-color="${escape(stop.color)}"/>`).join("")}</linearGradient></defs>`
      : "";
  const strokeOnly = "strokeOnly" in shape && shape.strokeOnly;
  const path =
    layer.shape === "rectangle" && !layer.vector
      ? `<rect width="100" height="100" rx="${(layer.borderRadius * 100) / layer.width}" ry="${(layer.borderRadius * 100) / layer.height}"/>`
      : `<path d="${escape(shape.path)}"/>`;
  return `${effects}<div class="design-content" style="${filter ? `filter:${filter}` : ""}"><svg viewBox="${escape(shape.viewBox)}" preserveAspectRatio="none" fill="${strokeOnly ? "none" : gradient ? `url(#${gradientId})` : escape(layer.fill)}" stroke="${strokeOnly ? escape(layer.fill) : escape(layer.stroke)}" stroke-width="${strokeOnly ? layer.strokeWidth || 2 : layer.strokeWidth}" stroke-linejoin="round" stroke-linecap="round">${defs}${path}</svg></div>`;
}
export function canvasFontCss(doc: Pick<Document, "canvas">) {
  return (
    doc.canvas?.fonts
      .map(
        (font) =>
          `@font-face{font-family:'${font.name.replace(/['"]/g, "")}';src:url('${font.dataUrl}') format('${font.format}');font-weight:100 1000;font-display:swap;}`,
      )
      .join("") ?? ""
  );
}
export function renderVisual(doc: Document): string {
  const canvas = doc.canvas!,
    seen = new Set<string>();
  function element(id: string) {
    const block = doc.blocks[id],
      layer = block.design!;
    return layer.hidden
      ? ""
      : `<div class="design-layer" data-block-id="${escape(id)}" style="${css(layerStyle(layer))}">${renderLayerContent(block)}</div>`;
  }
  return canvas.order
    .map((id) => {
      const group = canvas.groups.find((g) => g.elementIds.includes(id));
      if (!group) return element(id);
      if (seen.has(group.id) || group.hidden) return "";
      seen.add(group.id);
      return `<div class="design-group" data-group-id="${group.id}" style="${css(groupStyle(group))}">${canvas.order
        .filter((id) => group.elementIds.includes(id))
        .map(element)
        .join("")}</div>`;
    })
    .join("");
}
