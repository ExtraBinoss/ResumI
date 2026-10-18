import { validateDocument, type Document } from "@resumi/engine";
import { renderHtml } from "./renderer";

/** Load source compilers and template rendering only when the document needs them. */
export async function renderDocumentHtml(document: Document): Promise<string> {
  validateDocument(document);
  if (!document.source || document.source.enabled === false) {
    if (document.canvas) return renderHtml(document);
    const { renderTemplateHtml } = await import("./templates/render");
    return renderTemplateHtml(document);
  }
  const { renderSourceHtml } = await import("./source/render");
  return renderSourceHtml(document.source, document.name);
}
