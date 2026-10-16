import { renderToStaticMarkup } from "react-dom/server";
import { validateDocument, type Document } from "@resumi/engine";
import { ResumeTemplate } from "./ResumeTemplate";
import { resumeStyle, resumeCss } from "../renderer";
import { escapeHtml } from "../escape";

/** SSR-only trusted template renderer, separate from the lightweight canvas renderer. */
export function renderTemplateResume(document: Document): string {
  validateDocument(document);
  return renderToStaticMarkup(
    <ResumeTemplate document={document} style={resumeStyle(document)} />,
  );
}
export function renderTemplateHtml(document: Document): string {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(document.name)}</title><style>${resumeCss}\nbody{margin:0;background:#eceef2}.resume{margin:auto}</style></head><body>${renderTemplateResume(document)}</body></html>`;
}
