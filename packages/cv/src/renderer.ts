import { designCss, renderVisual, canvasFontCss } from "./design-renderer";
import { escapeHtml } from "./escape";
export { escapeHtml } from "./escape";
import {
  documentPages,
  localizedBlock,
  localizedSectionTitle,
  documentLocale,
  validateDocument,
  type Block,
  type Document,
} from "@resumi/engine";

export const resumeCss =
  designCss +
  `
.resume { box-sizing:border-box; width:794px; min-height:1123px; padding:62px 64px;
  background:white; color:#20252d; font-family:var(--resume-font,Arial,sans-serif);
  font-size:var(--resume-size,12px); line-height:1.65; text-align:left; }
.resume * {box-sizing:border-box;}
.resume-section {position:relative; margin:0 0 var(--resume-spacing,24px);}
.resume-section:last-child {margin-bottom:0;}
.resume-title {font-size:10px; text-transform:uppercase; letter-spacing:1.8px;
  color:var(--resume-accent,#2563eb); font-weight:700; margin:0 0 11px; padding-bottom:7px; border-bottom:1px solid #e4e7ed;}
.resume-block {margin:0 0 7px; white-space:pre-wrap; overflow-wrap:anywhere;}
.resume-heading {font-size:38px; line-height:1.15; letter-spacing:-1.3px; font-weight:650; margin-bottom:8px;}
.resume-subtitle {font-weight:650; font-size:1.1em; margin-top:10px;}
.resume-meta {font-size:.87em; color:#606a79;}
.resume-bullet {padding-left:13px; position:relative;}
.resume-bullet::before {content:'•'; position:absolute; left:0; color:var(--resume-accent);}
.resume-section:first-child {margin-bottom:32px;}
.resume-section:first-child .resume-subtitle {color:var(--resume-accent); font-size:15px; font-weight:500; margin:0 0 12px;}
@page {size:A4; margin:0;}
@media print {html,body {margin:0!important; background:white!important;} .resume{width:210mm;min-height:297mm;box-shadow:none!important;} .resume-section{break-inside:avoid;}}
`;
export function resumeStyle(doc: Document): Record<string, string> {
  return {
    "--resume-accent": doc.style.accent,
    "--resume-font":
      doc.style.font === "serif" ? "Georgia,serif" : "Arial,sans-serif",
    "--resume-size": `${doc.style.fontSize}px`,
    "--resume-spacing": `${doc.style.spacing}px`,
  };
}
export function renderBlock(block: Block): string {
  const tag = block.kind === "heading" ? "h1" : "p";
  return `<${tag} class="resume-block resume-${block.kind}" data-block-id="${escapeHtml(block.id)}">${escapeHtml(block.text)}</${tag}>`;
}
export function renderSection(doc: Document, id: string): string {
  const section = doc.sections[id],
    title = localizedSectionTitle(doc, id);
  return `<section class="resume-section" data-section-id="${escapeHtml(id)}">${title ? `<h2 class="resume-title">${escapeHtml(title)}</h2>` : ""}${section.blockIds.map((id) => renderBlock(localizedBlock(doc, id))).join("")}</section>`;
}
export function renderResume(doc: Document): string {
  validateDocument(doc);
  const style = Object.entries(resumeStyle(doc))
    .map(([key, value]) => `${key}:${value}`)
    .join(";");
  if (doc.canvas) {
    const pages = documentPages(doc);
    const pageCss = pages
      .map(
        (page, index) =>
          `@page resumi${index}{size:${page.width * 0.75}pt ${page.height * 0.75}pt;margin:0}`,
      )
      .join("");
    return `<style>${canvasFontCss(doc)}${pageCss}</style>${pages
      .map(
        (page, index) =>
          `<article class="resume freeform" data-page-id="${escapeHtml(page.id)}" aria-label="Resume" style="${style};page:resumi${index};width:${page.width}px;height:${page.height}px;background:${page.background}">${renderVisual(doc, page.id)}</article>`,
      )
      .join("")}`;
  }
  return `<article class="resume" aria-label="Resume" style="${style}">${doc.sectionIds.map((id) => renderSection(doc, id)).join("")}</article>`;
}
export function renderHtml(document: Document): string {
  return `<!doctype html><html lang="${escapeHtml(documentLocale(document))}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(document.name)}</title><style>${resumeCss}\nbody{margin:0;background:#eceef2}.resume{margin:auto}</style></head><body>${renderResume(document)}</body></html>`;
}
