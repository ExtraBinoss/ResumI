import type { Document } from "@resumi/engine";
import { validateDocument } from "@resumi/engine";
import { renderHtml } from "../renderer";
export { makeReactSource } from "./starter";
export { sourcePolicy } from "./policy";

/** Keeps the JSX compiler and offline runtime out of normal project creation. */
export async function renderDocumentHtml(document: Document): Promise<string> {
  validateDocument(document);
  if (!document.source || document.source.enabled === false) {
    if (document.canvas) return renderHtml(document);
    const { renderTemplateHtml } = await import("../templates/render");
    return renderTemplateHtml(document);
  }
  const { renderSourceHtml } = await import("./render");
  return renderSourceHtml(document.source, document.name);
}
