import {
  documentLocale,
  validateDocument,
  type Document,
} from "@resumi/engine";
import { renderResume, resumeCss } from "./renderer";
import type { PageExportOptions } from "./page-export";
export type { PageExportOptions } from "./page-export";

/** A standalone React snapshot of selected canonical pages, with embedded fonts and assets. */
export function exportReactCanvas(
  document: Document,
  options: PageExportOptions = {},
): string {
  validateDocument(document);
  if (document.source && document.source.enabled !== false)
    throw new Error(
      "Prepare the resume for editing before exporting its canvas.",
    );
  const markup = renderResume(document, options);
  return `import * as React from "react";

const css = ${JSON.stringify(resumeCss)};
const canvas = ${JSON.stringify(markup)};
const language = ${JSON.stringify(documentLocale(document))};

export default function Resume() {
  return <>
    <style>{css}</style>
    <div lang={language} dangerouslySetInnerHTML={{ __html: canvas }} />
  </>;
}
`;
}
