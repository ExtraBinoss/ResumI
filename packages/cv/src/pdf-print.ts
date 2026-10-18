/**
 * Print-copy typography: positive tracking makes Chromium encode gaps as word spaces.
 * Keep negative tracking and every source document unchanged. This function is self-contained
 * so a local browser adapter may serialize it into its isolated print page.
 */
export function normalizePdfTracking(doc: globalThis.Document = document): {
  adjustedElements: number;
} {
  const view = doc.defaultView;
  if (!view) return { adjustedElements: 0 };
  // Measure first: changing a parent's inherited spacing must not affect this selection.
  const elements = [...doc.querySelectorAll("*")].filter(
    (element) =>
      Number.parseFloat(view.getComputedStyle(element).letterSpacing) > 0,
  );
  let adjustedElements = 0;
  for (const element of elements) {
    const style = (element as HTMLElement | SVGElement).style;
    if (!style) continue;
    style.setProperty("letter-spacing", "0", "important");
    adjustedElements++;
  }
  return { adjustedElements };
}

/** Self-contained for local browser serialization; shared by app and CLI printing. */
export function createPdfPrintSnapshot(
  markup: string,
  doc: globalThis.Document = document,
) {
  const escape = (text: string) =>
    text.replace(
      /[&<>"']/g,
      (character) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[character]!,
    );
  const attributes = (tag: "html" | "body") => {
    const match = new RegExp(`<${tag}\\b([^>]*)>`, "i").exec(markup)?.[1] ?? "";
    const holder = doc.createElement("template");
    holder.innerHTML = `<div ${match}></div>`;
    return ["style", "class", "dir", "lang"]
      .flatMap((name) => {
        const value = holder.content.firstElementChild?.getAttribute(name);
        return value == null ? [] : [` ${name}="${escape(value)}"`];
      })
      .join("");
  };
  const holder = doc.createElement("template");
  holder.innerHTML = markup;
  // Form/button containers can hold real CV text and styling. Their actions are
  // stripped below; the print document also denies scripts and form submission.
  // Editable field values need a dedicated static representation, never silent removal.
  for (const field of holder.content.querySelectorAll(
    "input,select,textarea",
  )) {
    const hidden =
      field.tagName === "INPUT" &&
      field.getAttribute("type")?.toLowerCase() === "hidden";
    if (!hidden)
      throw new Error(
        "PDF export cannot preserve editable form fields. Use text elements for printable resume content.",
      );
    field.remove();
  }
  holder.content
    .querySelectorAll("script,meta,base,link,iframe,object,embed,audio,video")
    .forEach((node) => node.remove());
  for (const node of holder.content.querySelectorAll("*")) {
    // NamedNodeMap is live: removing one attribute must not skip the next one.
    const attributes = [...node.attributes];
    for (const attribute of attributes) {
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
  return {
    markup: holder.innerHTML,
    htmlAttributes: attributes("html"),
    bodyAttributes: attributes("body"),
  };
}
