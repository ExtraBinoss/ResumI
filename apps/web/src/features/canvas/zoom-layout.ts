export type ZoomLayout = {
  width: number;
  height: number;
  paperWidth: number;
  paperHeight: number;
  padding: { left: number; right: number; top: number; bottom: number };
  scrollbar: { width: number; height: number };
};

/** The stage contains only the scaled paper plus padding, centered when it fits. */
export function projectZoomLayout(layout: ZoomLayout, scale: number) {
  const paperWidth = layout.paperWidth * scale,
    paperHeight = layout.paperHeight * scale,
    contentWidth = paperWidth + layout.padding.left + layout.padding.right,
    contentHeight = paperHeight + layout.padding.top + layout.padding.bottom;
  let horizontal = false,
    vertical = false;
  // One scrollbar can make the other necessary. Starting without either gives
  // the smallest reachable layout, including the threshold where both disappear.
  for (let pass = 0; pass < 3; pass++) {
    horizontal ||=
      contentWidth > layout.width - (vertical ? layout.scrollbar.width : 0);
    vertical ||=
      contentHeight >
      layout.height - (horizontal ? layout.scrollbar.height : 0);
  }
  const width = layout.width - (vertical ? layout.scrollbar.width : 0),
    height = layout.height - (horizontal ? layout.scrollbar.height : 0),
    stageWidth = Math.max(width, contentWidth),
    stageHeight = Math.max(height, contentHeight);
  return {
    left: layout.padding.left + (stageWidth - contentWidth) / 2,
    top: layout.padding.top + (stageHeight - contentHeight) / 2,
    maxScrollLeft: stageWidth - width,
    maxScrollTop: stageHeight - height,
  };
}

/** Clamp during preview, rather than exposing an unreachable anchor at commit. */
export function projectZoomPosition(
  layout: ZoomLayout,
  scale: number,
  anchor: { x: number; y: number; viewportX: number; viewportY: number },
) {
  const projected = projectZoomLayout(layout, scale);
  const scrollLeft = Math.round(
      Math.max(
        0,
        Math.min(
          projected.maxScrollLeft,
          projected.left + anchor.x * scale - anchor.viewportX,
        ),
      ),
    ),
    scrollTop = Math.round(
      Math.max(
        0,
        Math.min(
          projected.maxScrollTop,
          projected.top + anchor.y * scale - anchor.viewportY,
        ),
      ),
    );
  return {
    left: projected.left - scrollLeft,
    top: projected.top - scrollTop,
    scrollLeft,
    scrollTop,
  };
}

/** Match the actual viewport's scrollbar styling, including overlay scrollbars. */
export function measureZoomScrollbars(node: HTMLElement) {
  const probe = node.cloneNode(false) as HTMLElement;
  Object.assign(probe.style, {
    position: "fixed",
    visibility: "hidden",
    width: "100px",
    height: "100px",
    minWidth: "0",
    minHeight: "0",
    maxWidth: "none",
    maxHeight: "none",
    overflow: "scroll",
    scrollbarGutter: "auto",
    boxSizing: "content-box",
    border: "0",
    padding: "0",
    flex: "none",
    contain: "strict",
  });
  node.ownerDocument.body.appendChild(probe);
  const dimensions = {
    width: probe.offsetWidth - probe.clientWidth,
    height: probe.offsetHeight - probe.clientHeight,
  };
  probe.remove();
  return dimensions;
}

export function readZoomLayout(
  node: HTMLElement,
  paper: HTMLElement,
  scrollbar: ZoomLayout["scrollbar"],
): ZoomLayout {
  const stage = paper.parentElement!.parentElement!,
    style = getComputedStyle(stage),
    viewportStyle = getComputedStyle(node),
    stableGutter = viewportStyle.scrollbarGutter.includes("stable");
  const number = (value: string) => Number.parseFloat(value) || 0;
  return {
    width:
      node.clientWidth +
      (!stableGutter && node.scrollHeight > node.clientHeight
        ? scrollbar.width
        : 0),
    height:
      node.clientHeight +
      (node.scrollWidth > node.clientWidth ? scrollbar.height : 0),
    paperWidth: paper.offsetWidth,
    paperHeight: paper.offsetHeight,
    padding: {
      left: number(style.paddingLeft),
      right: number(style.paddingRight),
      top: number(style.paddingTop),
      bottom: number(style.paddingBottom),
    },
    scrollbar: {
      width: stableGutter ? 0 : scrollbar.width,
      height: scrollbar.height,
    },
  };
}
