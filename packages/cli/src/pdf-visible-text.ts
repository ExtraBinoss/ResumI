/** Self-contained for Playwright serialization; reads the already rendered inert print DOM. */
export function extractPrintedText(
  context: globalThis.Document | { pageId: string } = document,
): string {
  const doc = "pageId" in context ? document : context;
  const root =
    "pageId" in context
      ? [...doc.querySelectorAll("[data-page-id]")].find(
          (element) => element.getAttribute("data-page-id") === context.pageId,
        )
      : doc.body;
  const view = doc.defaultView;
  if (!view || !root) throw new Error("The PDF print document is unavailable.");
  const chunks: string[] = [];
  let previousBlock: Element | null = null;
  let visits = 0;
  let characters = 0;
  const hidden = (element: Element, style: CSSStyleDeclaration) =>
    [
      "SCRIPT",
      "STYLE",
      "NOSCRIPT",
      "TEMPLATE",
      "TITLE",
      "META",
      "HEAD",
      "defs",
      "metadata",
      "title",
      "desc",
    ].includes(element.tagName) ||
    style.display === "none" ||
    style.opacity === "0" ||
    style.contentVisibility === "hidden";
  const blockOf = (element: Element): Element | null => {
    let current: Element | null = element;
    while (current) {
      if (
        current.tagName === "text" ||
        /^(block|flex|grid|list-item|table-cell|flow-root)$/.test(
          view.getComputedStyle(current).display,
        )
      )
        return current;
      current = current.parentElement;
    }
    return null;
  };
  const append = (
    raw: string,
    element: Element,
    style: CSSStyleDeclaration,
  ) => {
    let value = raw.replace(/\r\n?/g, "\n");
    if (!/^(pre|pre-wrap|break-spaces)$/.test(style.whiteSpace))
      value =
        style.whiteSpace === "pre-line"
          ? value.replace(/[\t\f\v ]+/g, " ")
          : value.replace(/\s+/gu, " ");
    if (style.textTransform === "uppercase") value = value.toUpperCase();
    else if (style.textTransform === "lowercase") value = value.toLowerCase();
    else if (style.textTransform === "capitalize")
      value = value.replace(
        /(^|[^\p{L}\p{N}])(\p{L})/gu,
        (_, prefix: string, letter: string) => prefix + letter.toUpperCase(),
      );
    if (!value) return;
    characters += value.length;
    if (characters > 150_000)
      throw new Error("Resume contains too much text to inspect.");
    const block = blockOf(element);
    if (chunks.length && block !== previousBlock) chunks.push("\n");
    chunks.push(value);
    previousBlock = block;
  };
  const ordinal = (element: Element) => {
    const parent = element.parentElement;
    const siblings = parent
      ? [...parent.children].filter((child) => child.tagName === "LI")
      : [element];
    const reversed = parent?.hasAttribute("reversed") ?? false;
    const start = parent?.getAttribute("start");
    let number =
      start !== null && start !== undefined
        ? Number.parseInt(start, 10)
        : reversed
          ? siblings.length
          : 1;
    if (!Number.isFinite(number)) number = 1;
    for (const sibling of siblings) {
      const value = sibling.getAttribute("value");
      if (value !== null && Number.isFinite(Number.parseInt(value, 10)))
        number = Number.parseInt(value, 10);
      if (sibling === element) return number;
      number += reversed ? -1 : 1;
    }
    return number;
  };
  const formatCounter = (number: number, type: string) => {
    if (type === "decimal") return String(number);
    if (type === "decimal-leading-zero")
      return number < 0
        ? `-${String(-number).padStart(2, "0")}`
        : String(number).padStart(2, "0");
    if (
      ["lower-alpha", "lower-latin", "upper-alpha", "upper-latin"].includes(
        type,
      )
    ) {
      if (number < 1) return String(number);
      let result = "";
      for (let value = number; value > 0; value = Math.floor((value - 1) / 26))
        result = String.fromCharCode(97 + ((value - 1) % 26)) + result;
      return type.startsWith("upper") ? result.toUpperCase() : result;
    }
    if (type === "lower-roman" || type === "upper-roman") {
      if (number < 1 || number > 3999) return String(number);
      const units: [number, string][] = [
        [1000, "M"],
        [900, "CM"],
        [500, "D"],
        [400, "CD"],
        [100, "C"],
        [90, "XC"],
        [50, "L"],
        [40, "XL"],
        [10, "X"],
        [9, "IX"],
        [5, "V"],
        [4, "IV"],
        [1, "I"],
      ];
      let result = "",
        remaining = number;
      for (const [value, symbol] of units)
        while (remaining >= value) {
          result += symbol;
          remaining -= value;
        }
      return type === "lower-roman" ? result.toLowerCase() : result;
    }
    throw new Error(
      `PDF text inspection does not support list counter style: ${type}.`,
    );
  };
  const cssString = (value: string) =>
    value
      .slice(1, -1)
      .replace(
        /\\(?:([\da-fA-F]{1,6})[ \t\r\n\f]?|\r?\n|(.))/gs,
        (_, hex: string | undefined, literal: string | undefined) => {
          if (!hex) return literal ?? "";
          const point = Number.parseInt(hex, 16);
          return point > 0 && point <= 0x10ffff
            ? String.fromCodePoint(point)
            : "\ufffd";
        },
      );
  const generated = (
    element: Element,
    pseudo: "::before" | "::after" | "::marker",
  ) => {
    const style = view.getComputedStyle(element, pseudo);
    if (
      style.display === "none" ||
      style.visibility === "hidden" ||
      style.visibility === "collapse" ||
      style.opacity === "0"
    )
      return;
    const content = style.content;
    if (pseudo === "::marker" && content === "normal") {
      const ownStyle = view.getComputedStyle(element);
      if (
        ownStyle.display !== "list-item" ||
        ["none", "disc", "circle", "square", ""].includes(
          ownStyle.listStyleType,
        )
      )
        return;
      append(
        `${formatCounter(ordinal(element), ownStyle.listStyleType)}. `,
        element,
        style,
      );
      return;
    }
    if (!content || content === "normal" || content === "none") return;
    // Chromium resolves attr() to strings. Preserve literal escapes; ignore image content.
    const tokens =
      content.match(
        /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|url\((?:[^)"']|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')*\)|counter\([^)]*\)|counters\([^)]*\)|\/|[^\s]+/g,
      ) ?? [];
    let value = "";
    for (const token of tokens) {
      if (token === "/") break; // Accessibility replacement after '/', not painted text.
      if (token.startsWith('"') || token.startsWith("'"))
        value += cssString(token);
      else if (token.startsWith("url(")) continue;
      else if (/^counter\(list-item(?:,\s*([\w-]+))?\)$/.test(token)) {
        const type =
          /^counter\(list-item(?:,\s*([\w-]+))?\)$/.exec(token)?.[1] ??
          "decimal";
        value += formatCounter(ordinal(element), type);
      } else
        throw new Error(
          `PDF text inspection cannot resolve generated CSS text: ${token}.`,
        );
    }
    if (!value) return;
    if (
      pseudo === "::before" &&
      (Number.parseFloat(style.marginRight) > 0 ||
        Number.parseFloat(style.paddingRight) > 0)
    )
      value += " ";
    if (
      pseudo === "::after" &&
      (Number.parseFloat(style.marginLeft) > 0 ||
        Number.parseFloat(style.paddingLeft) > 0)
    )
      value = " " + value;
    append(value, element, style);
  };
  function visit(node: Node, depth: number) {
    if (++visits > 50_000 || depth > 80)
      throw new Error("Resume contains too many text nodes to inspect.");
    if (node.nodeType === Node.TEXT_NODE) {
      const element = node.parentElement;
      if (!element || !node.textContent) return;
      const style = view!.getComputedStyle(element);
      if (style.visibility === "hidden" || style.visibility === "collapse")
        return;
      const range = doc.createRange();
      range.selectNodeContents(node);
      if (
        ![...range.getClientRects()].some(
          (bounds) => bounds.width > 0 && bounds.height > 0,
        )
      )
        return;
      append(node.textContent, element, style);
      return;
    }
    if (!(node instanceof Element)) return;
    const style = view!.getComputedStyle(node);
    if (hidden(node, style)) return;
    if (node.tagName === "BR") {
      chunks.push("\n");
      return;
    }
    generated(node, "::marker");
    generated(node, "::before");
    for (const child of node.childNodes) visit(child, depth + 1);
    generated(node, "::after");
  }
  visit(root, 0);
  return chunks.join("").trim();
}
