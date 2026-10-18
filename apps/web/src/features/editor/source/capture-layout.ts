import type { CapturedItem, CapturedLayout } from "./capture-types";
import type { LayerPatch } from "@resumi/engine";
import type { captureStyles } from "./capture-styles";

/** Serialized into an opaque frame. Keep every runtime dependency inside this function. */
export async function captureLayout(
  paints: ReturnType<typeof captureStyles>,
): Promise<CapturedLayout> {
  const {
    style,
    color,
    px,
    round,
    clamp,
    family,
    textStyle,
    gradient,
    shadow,
    imageEffects,
    pseudoText,
    decoration,
    roundedBorder,
  } = paints;
  const root = document.getElementById("resumi-root");
  if (
    root &&
    !root.children.length &&
    !document.querySelector('[role="alert"]')
  )
    await new Promise<void>((resolve) => {
      const observer = new MutationObserver(() => {
        if (root.children.length || document.querySelector('[role="alert"]')) {
          observer.disconnect();
          resolve();
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
    });
  const freeze = document.createElement("style");
  freeze.textContent =
    "*,*::before,*::after{animation:none!important;transition:none!important}html,body{overflow:hidden!important}";
  document.head.appendChild(freeze);
  // Let React's committed passive drawing effects run once; this is a task turn,
  // not a minimum display delay. No work is gated on an offscreen paint.
  await new Promise<void>((resolve) => {
    setTimeout(resolve, 0);
  });
  // Offscreen frames may suspend animation frames. A single layout flush starts
  // font loading without waiting for a paint that this capture never needs.
  void document.body.offsetHeight;
  const error = document.querySelector('[role="alert"]');
  if (error) throw new Error(error.textContent || "Source rendering failed.");
  for (const image of document.images) image.loading = "eager";
  await document.fonts.ready;
  await Promise.all([...document.images].map((image) => image.decode()));
  const output: CapturedLayout = {
    pages: [],
    groups: {},
    items: [],
    fonts: [],
  };
  const groups = new Map<Element, string>();
  function group(element: Element, page: number) {
    const owner =
      element.closest("section,[data-section-id],[data-group],header,aside") ??
      roots[page];
    let key = groups.get(owner);
    if (!key) {
      key = `section-${groups.size}`;
      groups.set(owner, key);
      output.groups[key] = {
        name:
          (
            owner.getAttribute("data-group") ||
            owner.getAttribute("aria-label") ||
            owner.querySelector("h2,h1,h3")?.textContent ||
            "Content"
          )
            .trim()
            .slice(0, 120) || "Content",
        originalId: owner.getAttribute("data-section-id") ?? undefined,
      };
    }
    return key;
  }
  function visible(element: Element) {
    const css = style(element);
    return (
      css.display !== "none" &&
      css.visibility !== "hidden" &&
      css.visibility !== "collapse" &&
      Number(css.opacity) !== 0
    );
  }
  function opacity(element: Element, page: Element) {
    let value = 1;
    for (let node: Element | null = element; node; node = node.parentElement) {
      value *= Number(style(node).opacity);
      if (node === page) break;
    }
    return value;
  }
  const topLevel = (selector: string) =>
    [...document.querySelectorAll<HTMLElement>(selector)].filter(
      (element) => !element.parentElement?.closest(selector),
    );
  const explicit = topLevel("[data-resumi-page],[data-page-id]");
  const sheets = topLevel(".resume");
  const articles = topLevel("article");
  const roots = explicit.length
    ? explicit
    : sheets.length
      ? sheets
      : articles.length
        ? articles
        : [root ?? document.body];
  if (roots.length > 20)
    throw new Error("A document can contain at most 20 pages.");
  function frame(element: Element, page: number): LayerPatch {
    const rect = element.getBoundingClientRect(),
      origin = roots[page].getBoundingClientRect();
    const css = style(element);
    let matrix = new DOMMatrixReadOnly();
    for (let node: Element | null = element; node; node = node.parentElement) {
      const transform = style(node).transform;
      if (transform !== "none")
        matrix = new DOMMatrixReadOnly(transform).multiply(matrix);
      if (node === roots[page]) break;
    }
    const rotation = round((Math.atan2(matrix.b, matrix.a) * 180) / Math.PI);
    const width =
      element instanceof HTMLElement && rotation
        ? element.offsetWidth * Math.hypot(matrix.a, matrix.b)
        : rect.width;
    const height =
      element instanceof HTMLElement && rotation
        ? element.offsetHeight * Math.hypot(matrix.c, matrix.d)
        : rect.height;
    return {
      x: round(rect.x - origin.x + (rect.width - width) / 2),
      y: round(rect.y - origin.y + (rect.height - height) / 2),
      width: round(Math.max(1, width)),
      height: round(Math.max(1, height)),
      rotation,
      blendMode: css.mixBlendMode as LayerPatch["blendMode"],
      opacity: opacity(element, roots[page]),
      name: (
        element.getAttribute("aria-label") ||
        element.getAttribute("alt") ||
        element.localName
      ).slice(0, 120),
    };
  }
  function push(
    element: Element,
    page: number,
    item: Omit<CapturedItem, "group" | "page">,
  ) {
    if (output.items.length >= 1000)
      throw new Error("The rendered document exceeds 1000 editable layers.");
    output.items.push({ ...item, group: group(element, page), page });
  }
  function background(element: Element, page: number) {
    const css = style(element),
      box = frame(element, page),
      fill = color(css.backgroundColor),
      paint = gradient(css.backgroundImage),
      shade = shadow(css.boxShadow);
    if ((element !== roots[page] && fill !== "transparent") || paint || shade)
      push(element, page, {
        kind: "shape",
        text: "",
        patch: {
          ...box,
          name: "Background",
          shape: (
            ["TopLeft", "TopRight", "BottomLeft", "BottomRight"] as const
          ).every((corner) => css[`border${corner}Radius`] === "50%")
            ? "circle"
            : "rectangle",
          fill,
          gradient: paint,
          shadow: shade,
          borderRadius:
            px(css.borderTopLeftRadius) *
            (css.borderTopLeftRadius.endsWith("%")
              ? Math.min(box.width ?? 0, box.height ?? 0) / 100
              : 1),
        },
      });
    const curved = roundedBorder(element, roots[page].getBoundingClientRect());
    if (curved !== undefined) {
      if (curved) {
        const { svg, ...geometry } = curved;
        push(element, page, {
          kind: "shape",
          text: "",
          svg,
          patch: {
            ...box,
            ...geometry,
            rotation: 0,
            name: "Border",
            shape: "rectangle",
            fill: "transparent",
          },
        });
      }
      return;
    }
    const sides = ["Top", "Right", "Bottom", "Left"] as const;
    for (const side of sides) {
      const width = px(css[`border${side}Width`]),
        paint = color(css[`border${side}Color`]);
      if (
        !width ||
        paint === "transparent" ||
        css[`border${side}Style`] === "none"
      )
        continue;
      const horizontal = side === "Top" || side === "Bottom";
      push(element, page, {
        kind: "shape",
        text: "",
        patch: {
          ...box,
          name: "Border",
          shape: "rectangle",
          fill: paint,
          x: (box.x ?? 0) + (side === "Right" ? (box.width ?? 0) - width : 0),
          y: (box.y ?? 0) + (side === "Bottom" ? (box.height ?? 0) - width : 0),
          width: horizontal ? box.width : width,
          height: horizontal ? width : box.height,
        },
      });
    }
  }
  function text(element: Element, page: number, nodes: Node[]) {
    const css = style(element),
      base = textStyle(element),
      box = frame(element, page);
    const marks: NonNullable<LayerPatch["marks"]> = [];
    let content = pseudoText(element, "::before");
    if (content)
      marks.push({
        id: "before",
        start: 0,
        end: content.length,
        ...textStyle(element, "::before"),
      });
    for (const node of nodes) {
      if (node.nodeName === "BR") {
        content += "\n";
        continue;
      }
      const parent = node.parentElement!;
      const whiteSpace = style(parent).whiteSpace;
      let value = node.textContent ?? "";
      if (!whiteSpace.startsWith("pre") && whiteSpace !== "break-spaces")
        value = value.replace(/\s+/g, " ");
      if (!content || /\s$/.test(content)) value = value.replace(/^ +/, "");
      if (!value) continue;
      const start = content.length;
      content += value;
      const paint = textStyle(parent);
      const href = parent.closest("a")?.getAttribute("href");
      const differences = Object.fromEntries(
        Object.entries(paint).filter(
          ([key, value]) => value !== base[key as keyof typeof base],
        ),
      );
      if (href && /^(https?:|mailto:|tel:)/i.test(href))
        differences.href = href;
      if (Object.keys(differences).length)
        marks.push({
          id: `mark-${marks.length}`,
          start,
          end: content.length,
          ...differences,
        });
    }
    const suffix = pseudoText(element, "::after");
    if (suffix) {
      marks.push({
        id: "after",
        start: content.length,
        end: content.length + suffix.length,
        ...textStyle(element, "::after"),
      });
      content += suffix;
    }
    content = content.trimEnd();
    if (!content.trim()) return;
    const left = px(css.paddingLeft) + px(css.borderLeftWidth),
      top = px(css.paddingTop) + px(css.borderTopWidth);
    const bullet = element.localName === "li" && css.listStyleType !== "none";
    const marker = bullet ? 13 : 0;
    push(element, page, {
      kind: /^h[1-6]$/.test(element.localName)
        ? element.localName === "h1"
          ? "heading"
          : "subtitle"
        : bullet
          ? "bullet"
          : "text",
      text: content,
      originalId: element.getAttribute("data-block-id") ?? undefined,
      patch: {
        ...box,
        ...base,
        name: content.slice(0, 90),
        x: (box.x ?? 0) + left - marker,
        y: (box.y ?? 0) + top,
        width: Math.max(
          1,
          (box.width ?? 1) -
            left -
            px(css.paddingRight) -
            px(css.borderRightWidth) +
            marker +
            0.1,
        ),
        height: Math.max(
          1,
          (box.height ?? 1) -
            top -
            px(css.paddingBottom) -
            px(css.borderBottomWidth),
        ),
        lineHeight: clamp(px(css.lineHeight) / base.fontSize || 1.2, 0.7, 4),
        letterSpacing: clamp(px(css.letterSpacing), -10, 40),
        align:
          css.textAlign === "center"
            ? "center"
            : ["right", "end"].includes(css.textAlign)
              ? "right"
              : "left",
        uppercase: css.textTransform === "uppercase",
        marks: marks
          .filter((mark) => mark.start < content.length)
          .map((mark) => ({
            ...mark,
            end: Math.min(mark.end, content.length),
          })),
      },
    });
  }
  function svg(element: SVGSVGElement, page: number) {
    const copy = element.cloneNode(true) as SVGSVGElement;
    const sourceNodes = [element, ...element.querySelectorAll("*")],
      copies = [copy, ...copy.querySelectorAll("*")];
    for (let i = 0; i < copies.length; i++) {
      const css = style(sourceNodes[i]);
      for (const attribute of copies[i].getAttributeNames())
        if (
          attribute === "style" ||
          attribute.startsWith("on") ||
          attribute === "class"
        )
          copies[i].removeAttribute(attribute);
      for (const property of [
        "fill",
        "stroke",
        "stroke-width",
        "fill-rule",
        "stroke-linecap",
        "stroke-linejoin",
        "opacity",
        "fill-opacity",
        "stroke-opacity",
        "stroke-dasharray",
        "stop-color",
        "stop-opacity",
        "filter",
      ]) {
        if (property.startsWith("stop-") && copies[i].localName !== "stop")
          continue;
        if (
          ["stroke-dasharray", "filter"].includes(property) &&
          css.getPropertyValue(property) === "none"
        )
          continue;
        copies[i].setAttribute(
          property,
          ["fill", "stroke", "stop-color"].includes(property) &&
            !css.getPropertyValue(property).startsWith("url(")
            ? color(css.getPropertyValue(property))
            : css
                .getPropertyValue(property)
                .replace(/url\(["']?[^#)]*#([^"')]+)["']?\)/g, "url(#$1)"),
        );
      }
    }
    copy.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    const rect = element.getBoundingClientRect();
    copy.setAttribute("width", String(rect.width));
    copy.setAttribute("height", String(rect.height));
    push(element, page, {
      kind: "shape",
      text: "",
      svg: new XMLSerializer().serializeToString(copy),
      patch: {
        ...frame(element, page),
        name:
          element.getAttribute("aria-label") ||
          element.querySelector("title")?.textContent ||
          "Icon",
        fill: color(style(element).color),
        shape: "rectangle",
      },
    });
  }
  async function image(
    element: HTMLImageElement | HTMLCanvasElement,
    page: number,
  ) {
    let src: string;
    if (
      element instanceof HTMLImageElement &&
      /^data:image\/(png|jpeg|webp);base64,/.test(
        element.currentSrc || element.src,
      )
    )
      src = element.currentSrc || element.src;
    else {
      const bitmap = document.createElement("canvas");
      bitmap.width =
        element instanceof HTMLImageElement
          ? element.naturalWidth
          : element.width;
      bitmap.height =
        element instanceof HTMLImageElement
          ? element.naturalHeight
          : element.height;
      bitmap.getContext("2d")!.drawImage(element, 0, 0);
      src = bitmap.toDataURL("image/png");
    }
    const css = style(element),
      position = css.objectPosition.split(" ").map(px),
      effects = imageEffects(css.filter);
    push(element, page, {
      kind: "image",
      text: "",
      patch: {
        ...frame(element, page),
        src,
        alt: element.getAttribute("alt") ?? "",
        borderRadius: px(css.borderTopLeftRadius),
        shadow: shadow(css.boxShadow),
        objectFit: css.objectFit === "contain" ? "contain" : "cover",
        ...(effects ? { effects } : {}),
        objectPosition: {
          x: clamp(position[0] ?? 50, 0, 100),
          y: clamp(position[1] ?? 50, 0, 100),
        },
      },
    });
  }
  function inline(element: Element): boolean {
    return (
      visible(element) &&
      !["img", "svg", "canvas"].includes(element.localName) &&
      (element.localName === "br" ||
        (style(element).display.startsWith("inline") &&
          [...element.children].every(inline)))
    );
  }
  async function visit(element: Element, page: number) {
    if (
      ["style", "script", "noscript", "template", "link", "meta"].includes(
        element.localName,
      ) ||
      !visible(element)
    )
      return;
    const bounds = element.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    background(element, page);
    for (const pseudo of ["::before", "::after"]) {
      const patch = decoration(
        element,
        pseudo,
        roots[page].getBoundingClientRect(),
      );
      if (patch)
        push(element, page, {
          kind: "shape",
          text: "",
          patch: { ...patch, opacity: opacity(element, roots[page]) },
        });
    }
    if (element instanceof SVGSVGElement) {
      svg(element, page);
      return;
    }
    if (
      element instanceof HTMLImageElement ||
      element instanceof HTMLCanvasElement
    ) {
      await image(element, page);
      return;
    }
    if ([...element.children].every(inline)) {
      const walker = document.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
      );
      const nodes: Node[] = [];
      while (walker.nextNode())
        if (
          walker.currentNode.nodeType === Node.TEXT_NODE ||
          walker.currentNode.nodeName === "BR"
        )
          nodes.push(walker.currentNode);
      text(element, page, nodes);
      return;
    }
    for (const child of element.childNodes) {
      if (child instanceof Element) await visit(child, page);
      else if (child.nodeType === Node.TEXT_NODE && child.textContent?.trim()) {
        const range = document.createRange();
        range.selectNodeContents(child);
        const rect = range.getBoundingClientRect(),
          origin = roots[page].getBoundingClientRect();
        const start = output.items.length;
        text(element, page, [child]);
        const item = output.items[start];
        if (item)
          item.patch = {
            ...item.patch,
            x: round(rect.x - origin.x),
            y: round(rect.y - origin.y),
            width: round(rect.width + 0.1),
            height: Math.max(1, round(rect.height)),
          };
      }
    }
  }
  for (const sheet of document.styleSheets)
    for (const rule of sheet.cssRules)
      if (rule instanceof CSSFontFaceRule) {
        const src = rule.style
          .getPropertyValue("src")
          .match(/url\(["']?(data:[^"')]+)["']?\)/)?.[1];
        if (
          src &&
          /^data:(font\/(ttf|otf|woff|woff2)|application\/(octet-stream|font-woff));base64,/.test(
            src,
          )
        ) {
          const name = family(
            rule.style.getPropertyValue("font-family"),
          ).replace(/^['"]|['"]$/g, "");
          const format = src.includes("woff2")
            ? "woff2"
            : src.includes("woff")
              ? "woff"
              : src.includes("otf")
                ? "opentype"
                : "truetype";
          if (!output.fonts.some((font) => font.name === name))
            output.fonts.push({
              id: `font-${output.fonts.length}`,
              name,
              dataUrl: src,
              format,
            });
        }
      }
  for (let page = 0; page < roots.length; page++) {
    const rect = roots[page].getBoundingClientRect();
    output.pages.push({
      width: round(rect.width),
      height: round(rect.height || 1123),
      background: color(style(roots[page]).backgroundColor),
    });
    await visit(roots[page], page);
  }
  if (!output.items.some((item) => item.text.trim()))
    throw new Error("The source has no rendered editable text.");
  return output;
}
