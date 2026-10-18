import type { DocumentSource } from "@resumi/engine";
import { transform } from "sucrase";
import runtime from "./runtime.generated.json" with { type: "json" };
import { sourcePolicy, escapeScript } from "./policy";
import { escapeHtml } from "../escape";

export function compileReact(code: string): string {
  try {
    return transform(code, {
      filePath: "Resume.tsx",
      transforms: ["typescript", "jsx", "imports"],
      jsxRuntime: "classic",
      production: true,
    }).code;
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "Could not compile the React resume.",
    );
  }
}

/** Transforms source without evaluating it. React executes only in the exported page. */
export function renderSourceHtml(
  source: DocumentSource,
  name = "Resume",
): string {
  const react = source.format === "react";
  const head = `<meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="${escapeHtml(sourcePolicy(react))}"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(name)}</title><style>html,body{margin:0;background:white}*{box-sizing:border-box}@page{size:A4;margin:0}</style>`;
  const body = react
    ? `<div id="resumi-root"></div><script id="resumi-source" type="application/json">${escapeScript(JSON.stringify({ code: compileReact(source.code) }))}</script><script>${runtime.replace(/<\/script/gi, "<\\/script")}</script>`
    : source.code;
  return `<!doctype html><html lang="en"><head>${head}</head><body>${body}</body></html>`;
}
