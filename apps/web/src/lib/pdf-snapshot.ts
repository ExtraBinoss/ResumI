import { escapeHtml, sourcePolicy } from "@resumi/cv";

/** Preserve inert body presentation when moving a complete document through a template. */
export function printBodyAttributes(
  markup: string,
  tag: "body" | "html" = "body",
) {
  const attributes =
    new RegExp(`<${tag}\\b([^>]*)>`, "i").exec(markup)?.[1] ?? "";
  const template = document.createElement("template");
  template.innerHTML = `<div ${attributes}></div>`;
  const body = template.content.firstElementChild;
  return ["style", "class", "dir", "lang"]
    .flatMap((name) => {
      const value = body?.getAttribute(name);
      return value === null || value === undefined
        ? []
        : [` ${name}="${escapeHtml(value)}"`];
    })
    .join("");
}

/** Executes source only in an opaque, network-denied frame; the print document is inert. */
export function printSnapshot(
  html: string,
  width: number,
  height: number,
  react = false,
  signal?: AbortSignal,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const frame = document.createElement("iframe");
    const request = crypto.randomUUID();
    const nonce = crypto.randomUUID();
    frame.title = "Preparing PDF";
    frame.setAttribute("sandbox", "allow-scripts");
    frame.style.cssText = `position:fixed;left:-20000px;top:0;width:${width}px;height:${height}px;border:0;pointer-events:none`;
    const timeout = window.setTimeout(
      () => finish(new Error("The PDF preview did not finish rendering.")),
      15000,
    );
    let settled = false;
    function abort() {
      finish(new DOMException("PDF preparation cancelled.", "AbortError"));
    }
    function finish(result: string | Error) {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      signal?.removeEventListener("abort", abort);
      window.removeEventListener("message", receive);
      frame.remove();
      if (result instanceof Error) reject(result);
      else resolve(result);
    }
    if (signal?.aborted) {
      abort();
      return;
    }
    signal?.addEventListener("abort", abort, { once: true });
    function receive(event: MessageEvent) {
      if (
        event.source !== frame.contentWindow ||
        event.data?.request !== request
      )
        return;
      if (typeof event.data.error === "string")
        finish(new Error(event.data.error));
      else if (
        typeof event.data.html === "string" &&
        event.data.html.length < 32_000_000
      )
        finish(event.data.html);
    }
    window.addEventListener("message", receive);
    const bridge = `<script nonce="${nonce}">(async()=>{try{
      const root=document.getElementById('resumi-root');
      if(root&&!root.children.length)await new Promise(resolve=>{const observer=new MutationObserver(()=>{if(root.children.length){observer.disconnect();resolve()}});observer.observe(root,{childList:true})});
      await new Promise(resolve=>setTimeout(resolve,0));
      const error=document.querySelector('[role="alert"]');if(error)throw Error(error.textContent||'Source rendering failed.');
      void document.body.offsetHeight;
      await document.fonts.ready;
      await Promise.all([...document.images].map(image=>image.decode()));
      const copy=document.documentElement.cloneNode(true);copy.querySelectorAll('script').forEach(node=>node.remove());
      parent.postMessage({request:${JSON.stringify(request)},html:copy.outerHTML},'*');
    }catch(error){parent.postMessage({request:${JSON.stringify(request)},error:String(error.message||error)},'*')}})()</script>`;
    // Known exporter head: allow the bridge in this isolated render, never in the print document.
    const prepared = html.replace(
      /<meta\b[^>]*http-equiv="Content-Security-Policy"[^>]*>/gi,
      "",
    );
    const policy = `<meta http-equiv="Content-Security-Policy" content="${react ? sourcePolicy(true) : sourcePolicy(false).replace("script-src 'none'", `script-src 'nonce-${nonce}'`)}">`;
    frame.srcdoc = prepared
      .replace(/<head[^>]*>/i, (head) => head + policy)
      .replace(/<\/body>/i, bridge + "</body>");
    document.body.appendChild(frame);
  });
}

/** An opaque source may forge its snapshot: re-sanitize at the trusted boundary. */
export function inertPrintMarkup(markup: string) {
  const template = document.createElement("template");
  template.innerHTML = markup;
  template.content
    .querySelectorAll(
      "script,meta,base,link,iframe,object,embed,form,input,button,audio,video",
    )
    .forEach((node) => node.remove());
  for (const node of template.content.querySelectorAll("*")) {
    for (const attribute of [...node.attributes]) {
      const name = attribute.name.toLowerCase();
      if (
        name.startsWith("on") ||
        ["srcdoc", "srcset", "action", "formaction", "autofocus"].includes(name)
      )
        node.removeAttribute(attribute.name);
      else if (
        ["src", "href", "xlink:href"].includes(name) &&
        !/^(data:image\/(png|jpe?g|webp|svg\+xml);|#|https?:|mailto:|tel:)/i.test(
          attribute.value,
        )
      )
        node.removeAttribute(attribute.name);
    }
  }
  return template.innerHTML;
}
