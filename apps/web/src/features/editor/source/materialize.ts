import {
  applyCommand,
  INITIAL_PAGE_ID,
  makeLayer,
  type Document,
  type MaterializeCommand,
  type Section,
} from "@resumi/engine";
import { renderDocumentHtml } from "@resumi/cv/document-render";
import { sourcePolicy } from "@resumi/cv/source-policy";
import { importSvg } from "../../../lib/svg-import";
import { captureLayout } from "./capture-layout";
import { captureStyles } from "./capture-styles";
import type { CapturedLayout } from "./capture-types";
import { materializationLocalization } from "./materialize-localization";

/** Source executes once in an opaque frame. Only engine-validated geometry leaves it. */
function capture(
  html: string,
  react: boolean,
  signal?: AbortSignal,
): Promise<CapturedLayout> {
  return new Promise((resolve, reject) => {
    const frame = document.createElement("iframe");
    const request = crypto.randomUUID(),
      nonce = crypto.randomUUID();
    frame.title = "Preparing editable resume";
    frame.tabIndex = -1;
    frame.setAttribute("sandbox", "allow-scripts");
    frame.setAttribute("aria-hidden", "true");
    frame.style.cssText =
      "position:fixed;left:-20000px;top:0;width:794px;height:1123px;border:0;pointer-events:none";
    let settled = false;
    const timeout = window.setTimeout(
      () =>
        finish(
          new Error(
            "The resume did not finish rendering. Your original source is unchanged.",
          ),
        ),
      15000,
    );
    function abort() {
      finish(new DOMException("Resume preparation cancelled.", "AbortError"));
    }
    function finish(result: CapturedLayout | Error) {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      signal?.removeEventListener("abort", abort);
      window.removeEventListener("message", receive);
      frame.remove();
      if (result instanceof Error) reject(result);
      else resolve(result);
    }
    function receive(event: MessageEvent) {
      if (
        event.source !== frame.contentWindow ||
        event.data?.request !== request
      )
        return;
      if (typeof event.data.error === "string")
        finish(new Error(event.data.error));
      else if (event.data.layout && typeof event.data.layout === "object")
        finish(event.data.layout);
    }
    if (signal?.aborted) {
      abort();
      return;
    }
    signal?.addEventListener("abort", abort, { once: true });
    window.addEventListener("message", receive);
    const bridge = `<script nonce="${nonce}">(async()=>{try{const layout=await (${captureLayout.toString()})((${captureStyles.toString()})());parent.postMessage({request:${JSON.stringify(request)},layout},'*')}catch(error){parent.postMessage({request:${JSON.stringify(request)},error:String(error.message||error)},'*')}})()</script>`;
    const prepared = html.replace(
      /<meta\b[^>]*http-equiv="Content-Security-Policy"[^>]*>/gi,
      "",
    );
    const policy = react
      ? sourcePolicy(true)
      : sourcePolicy(false).replace(
          "script-src 'none'",
          `script-src 'nonce-${nonce}'`,
        );
    frame.srcdoc = prepared
      .replace(
        /<head[^>]*>/i,
        (head) =>
          `${head}<meta http-equiv="Content-Security-Policy" content="${policy}">`,
      )
      .replace(/<\/body>/i, bridge + "</body>");
    document.body.appendChild(frame);
  });
}

async function rasterSvg(svg: string, width: number, height: number) {
  const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = Math.min(2000, Math.max(1, Math.ceil(width * 2)));
    canvas.height = Math.min(2000, Math.max(1, Math.ceil(height * 2)));
    canvas
      .getContext("2d")!
      .drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/png");
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Returns one atomic command; callers publish only after rendering and validation succeed. */
export async function materializeSourceDocument(
  document: Document,
  signal?: AbortSignal,
): Promise<MaterializeCommand> {
  const started = performance.now();
  if (!document.source || document.source.enabled === false)
    throw new Error("This resume already has an editable canvas.");
  const html = await renderDocumentHtml(document);
  if (signal?.aborted)
    throw new DOMException("Resume preparation cancelled.", "AbortError");
  const captured = await capture(
    html,
    document.source.format === "react",
    signal,
  );
  if (
    !Array.isArray(captured.items) ||
    !Array.isArray(captured.pages) ||
    !captured.pages.length ||
    !captured.groups ||
    !Array.isArray(captured.fonts)
  )
    throw new Error("Invalid rendered resume layout.");
  const pages = captured.pages.map((page, index) => ({
    ...page,
    id: index ? crypto.randomUUID() : INITIAL_PAGE_ID,
    name: `Page ${index + 1}`,
  }));
  const command: MaterializeCommand = {
    type: "canvas.materialize",
    canvas: {
      width: pages[0].width,
      height: pages[0].height,
      background: pages[0].background,
      pages: pages.slice(1),
      order: [],
      groups: [],
      fonts: captured.fonts,
    },
    sectionIds: [],
    sections: {},
    blocks: {},
  };
  const sections = new Map<string, Section>();
  const localization = materializationLocalization(document);
  let priorGroup = "",
    members: string[] = [];
  function flushGroup() {
    if (members.length > 1)
      command.canvas.groups.push({
        id: crypto.randomUUID(),
        name: captured.groups[priorGroup.split(":")[0]]?.name || "Content",
        elementIds: members,
        opacity: 1,
        blendMode: "normal",
        collapsed: false,
        locked: false,
        hidden: false,
      });
    members = [];
  }
  for (const item of captured.items) {
    if (signal?.aborted)
      throw new DOMException("Resume preparation cancelled.", "AbortError");
    const page = pages[item.page];
    if (!page || !captured.groups[item.group])
      throw new Error("Invalid rendered page or group.");
    let section = sections.get(item.group);
    if (!section || section.blockIds.length >= 200) {
      const source = captured.groups[item.group];
      const original = localization.section(source.name, source.originalId);
      section = {
        id:
          original && !command.sections[original.id]
            ? original.id
            : crypto.randomUUID(),
        title: original ? original.title : source.name,
        blockIds: [],
        ...(original?.titleTranslations
          ? { titleTranslations: original.titleTranslations }
          : {}),
      };
      sections.set(item.group, section);
      command.sections[section.id] = section;
      command.sectionIds.push(section.id);
    }
    const match = localization.block(item.text, item.originalId, item.kind);
    const id = match.original?.id ?? crypto.randomUUID();
    const patch = { ...item.patch, ...(item.page ? { pageId: page.id } : {}) };
    let kind = item.kind;
    let design = makeLayer(
      kind === "image" ? "image" : kind === "shape" ? "shape" : "text",
      patch,
    );
    if (item.svg) {
      try {
        const asset = importSvg(item.svg, design.name);
        const vector = {
          path: asset.path,
          viewBox: asset.viewBox,
          colorMode: asset.colorMode,
          strokeOnly: asset.strokeOnly,
          parts: asset.parts,
          attribution: asset.attribution,
        };
        design = makeLayer("shape", { ...patch, vector });
      } catch {
        const src = await rasterSvg(item.svg, design.width, design.height);
        kind = "image";
        const { x, y, width, height, rotation, opacity, name, pageId } = patch;
        design = makeLayer("image", {
          x,
          y,
          width,
          height,
          rotation,
          opacity,
          name,
          pageId,
          src,
          objectFit: "contain",
        });
      }
    }
    command.blocks[id] = {
      id,
      kind,
      ...localization.content(
        match,
        item.text,
        design,
        item.kind === "subtitle" ? section : undefined,
      ),
    };
    section.blockIds.push(id);
    command.canvas.order.push(id);
    const group = `${item.group}:${item.page}`;
    if (priorGroup !== group) {
      flushGroup();
      priorGroup = group;
    }
    members.push(id);
  }
  flushGroup();
  if (signal?.aborted)
    throw new DOMException("Resume preparation cancelled.", "AbortError");
  localization.assertPreserved();
  // Full engine validation also checks budgets, paints, fonts, IDs, page/group references.
  applyCommand(document, command);
  performance.measure("resumi:materialize", {
    start: started,
    end: performance.now(),
    detail: { layers: command.canvas.order.length, pages: pages.length },
  });
  return command;
}
