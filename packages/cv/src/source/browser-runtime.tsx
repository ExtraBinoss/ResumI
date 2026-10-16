import * as React from "react";
import { createRoot } from "react-dom/client";

// Bundled as a self-contained production asset; never imported by the host app.
function showError(error: unknown) {
  const output = document.createElement("pre");
  output.setAttribute("role", "alert");
  output.style.cssText =
    "padding:24px;white-space:pre-wrap;color:#b42318;font:14px/1.6 monospace";
  output.textContent = error instanceof Error ? error.message : String(error);
  document.body.replaceChildren(output);
}
window.addEventListener("error", (event) =>
  showError(event.error ?? event.message),
);
window.addEventListener("unhandledrejection", (event) =>
  showError(event.reason),
);
try {
  const script = document.querySelector("#resumi-source");
  if (!script?.textContent) throw new Error("Missing resume source.");
  const { code } = JSON.parse(script.textContent) as { code: string };
  const module = { exports: {} as { default?: React.ComponentType } };
  function requireModule(name: string) {
    if (name === "react") return React;
    throw new Error(
      `Module “${name}” is unavailable. Only imports from “react” are supported; embed your styles and assets.`,
    );
  }
  const run = new Function("React", "exports", "module", "require", code);
  run(React, module.exports, module, requireModule);
  const Resume = module.exports.default;
  if (!Resume || !["function", "object"].includes(typeof Resume))
    throw new Error(
      "Export a React component: export default function Resume() { return <article>…</article>; }",
    );
  const container = document.querySelector("#resumi-root");
  if (!container) throw new Error("Missing resume container.");
  createRoot(container).render(<Resume />);
} catch (error) {
  showError(error);
}
