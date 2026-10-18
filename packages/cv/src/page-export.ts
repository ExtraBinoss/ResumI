import {
  documentPages,
  validateDocument,
  type CanvasPage,
  type Document,
} from "@resumi/engine";

export type PageExportOptions = {
  /** Omit to export all pages. Explicit selections retain the caller's order. */
  pageIds?: readonly string[];
};

/** Validate the original, then select views without changing its pages, layers or groups. */
export function selectedDocumentPages(
  document: Document,
  { pageIds }: PageExportOptions = {},
): CanvasPage[] {
  validateDocument(document);
  const pages = documentPages(document);
  if (pageIds === undefined) return pages;
  if (pageIds.length === 0)
    throw new Error("Select at least one page to export.");
  if (document.source && document.source.enabled !== false)
    throw new Error(
      "Page selection is unavailable while source is active. Prepare the document for editing before exporting selected pages.",
    );
  if (!document.canvas)
    throw new Error(
      "Page selection requires editable canvas pages. Prepare the document for editing first.",
    );
  if (new Set(pageIds).size !== pageIds.length)
    throw new Error("A page can only be selected once per export.");
  return pageIds.map((id) => {
    const page = pages.find((page) => page.id === id);
    if (!page)
      throw new Error(`Page not found for export: ${JSON.stringify(id)}`);
    return page;
  });
}
