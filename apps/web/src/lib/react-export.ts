import type { Document } from "@resumi/engine";
import { renderResume, resumeCss } from "@resumi/cv/renderer";

/** A standalone React snapshot of the canonical canvas, including its pages and assets. */
export function exportReactCanvas(document: Document): string {
  if (document.source && document.source.enabled !== false)
    throw new Error(
      "Prepare the resume for editing before exporting its canvas.",
    );
  const markup = renderResume(document);
  return `import * as React from "react";

const css = ${JSON.stringify(resumeCss)};
const canvas = ${JSON.stringify(markup)};

export default function Resume() {
  return <>
    <style>{css}</style>
    <div dangerouslySetInnerHTML={{ __html: canvas }} />
  </>;
}
`;
}
