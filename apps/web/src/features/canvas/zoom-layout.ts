export type ZoomLayout = {
  width: number;
  height: number;
  paperWidth: number;
  paperHeight: number;
  padding: { left: number; right: number; top: number; bottom: number };
  scrollbar: { width: number; height: number };
  panGutter?: boolean;
};

/** Overflowing pages gain room to bring an edge into the usable workspace. */
export function zoomPanPadding(layout: ZoomLayout, scale: number) {
  if (!layout.panGutter) return layout.padding;
  const availableX = Math.max(
      0,
      layout.width - layout.padding.left - layout.padding.right,
    ),
    availableY = Math.max(
      0,
      layout.height - layout.padding.top - layout.padding.bottom,
    ),
    extraX = Math.min(
      availableX / 2,
      Math.max(0, (layout.paperWidth * scale - availableX) / 2),
    ),
    extraY = Math.min(
      availableY / 2,
      Math.max(0, (layout.paperHeight * scale - availableY) / 2),
    );
  return {
    left: layout.padding.left + extraX,
    right: layout.padding.right + extraX,
    top: layout.padding.top + extraY,
    bottom: layout.padding.bottom + extraY,
  };
}

/** Fit stays compact; preview and committed scroll bounds use the same padding. */
export function projectZoomLayout(layout: ZoomLayout, scale: number) {
  const paperWidth = layout.paperWidth * scale,
    paperHeight = layout.paperHeight * scale,
    padding = zoomPanPadding(layout, scale),
    contentWidth = paperWidth + padding.left + padding.right,
    contentHeight = paperHeight + padding.top + padding.bottom;
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
    left: padding.left + (stageWidth - contentWidth) / 2,
    top: padding.top + (stageHeight - contentHeight) / 2,
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
  const extraX = number(style.getPropertyValue("--pan-extra-x")),
    extraY = number(style.getPropertyValue("--pan-extra-y"));
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
      left: number(style.paddingLeft) - extraX,
      right: number(style.paddingRight) - extraX,
      top: number(style.paddingTop) - extraY,
      bottom: number(style.paddingBottom) - extraY,
    },
    scrollbar: {
      width: stableGutter ? 0 : scrollbar.width,
      height: scrollbar.height,
    },
    panGutter: true,
  };
}

/** Only zoom/viewport changes write layout; wheel/drag frames remain transforms. */
export function syncZoomPanPadding(
  node: HTMLElement,
  paper: HTMLElement,
  scale: number,
  scrollbar: ZoomLayout["scrollbar"],
) {
  const layout = readZoomLayout(node, paper, scrollbar),
    padding = zoomPanPadding(layout, scale),
    stage = paper.parentElement!.parentElement!;
  stage.style.setProperty(
    "--pan-extra-x",
    `${padding.left - layout.padding.left}px`,
  );
  stage.style.setProperty(
    "--pan-extra-y",
    `${padding.top - layout.padding.top}px`,
  );
}
