import type { Document } from "@resumi/engine";
import { selectedDocumentPages, type PageExportOptions } from "./page-export";
export type { PageExportOptions } from "./page-export";
import { renderHtml } from "./renderer";

/** Load source compilers and template rendering only when the document needs them. */
export async function renderDocumentHtml(
  document: Document,
  options: PageExportOptions = {},
): Promise<string> {
  selectedDocumentPages(document, options);
  if (!document.source || document.source.enabled === false) {
    if (document.canvas) return renderHtml(document, options);
    const { renderTemplateHtml } = await import("./templates/render");
    return renderTemplateHtml(document);
  }
  const { renderSourceHtml } = await import("./source/render");
  return renderSourceHtml(document.source, document.name);
}
