import type { Document } from "../document/schema";
import { EngineError } from "../validation";
import type { Canvas, CanvasPage } from "./schema";

/** Existing documents keep their original canvas without a migration or ID rewrite. */
export const INITIAL_PAGE_ID = "page-1";

export function documentPages(doc: Pick<Document, "canvas">): CanvasPage[] {
  const canvas = doc.canvas;
  return canvas
    ? [
        {
          id: INITIAL_PAGE_ID,
          name: "Page 1",
          width: canvas.width,
          height: canvas.height,
          background: canvas.background,
        },
        ...(canvas.pages ?? []),
      ]
    : [];
}

export function pageForLayer(
  doc: Pick<Document, "blocks">,
  layerId: string,
): string {
  const block = doc.blocks[layerId];
  if (!block) throw new EngineError("NOT_FOUND", `Layer not found: ${layerId}`);
  return block.design?.pageId ?? INITIAL_PAGE_ID;
}

/** Page-local view; canonical layer order, groups and fonts remain on the document. */
export function canvasForPage(doc: Document, pageId: string): Canvas {
  const page = documentPages(doc).find((page) => page.id === pageId);
  if (!page) throw new EngineError("NOT_FOUND", `Page not found: ${pageId}`);
  const canvas = doc.canvas!;
  if (pageId === INITIAL_PAGE_ID && !canvas.pages?.length) return canvas;
  return {
    ...canvas,
    width: page.width,
    height: page.height,
    background: page.background,
    order: canvas.order.filter((id) => pageForLayer(doc, id) === pageId),
    groups: canvas.groups.filter(
      (group) => pageForLayer(doc, group.elementIds[0]!) === pageId,
    ),
  };
}
