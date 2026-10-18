type Point = { x: number; y: number };
type Box = { left: number; top: number; width: number; height: number };

export function containsLayerPoint(box: Box, point: Point) {
  return (
    point.x >= box.left &&
    point.x <= box.left + box.width &&
    point.y >= box.top &&
    point.y <= box.top + box.height
  );
}

/** Motion position layouts translate paint, while their insertion slots stay in flow. */
export function layerLayoutBox(box: Box, translations: readonly Point[]): Box {
  return {
    left: box.left - translations.reduce((sum, point) => sum + point.x, 0),
    top: box.top - translations.reduce((sum, point) => sum + point.y, 0),
    width: box.width,
    height: box.height,
  };
}

/** Only fill animation gaps inside the tree; leaving the panel still cancels a drop. */
export function layerDropHit(tree: HTMLElement, point: Point) {
  const painted = document
    .elementFromPoint(point.x, point.y)
    ?.closest<HTMLElement>("[data-layer-reorder-id]");
  if (painted && tree.contains(painted))
    return { node: painted, box: painted.getBoundingClientRect() };
  if (!containsLayerPoint(tree.getBoundingClientRect(), point)) return null;
  const rows = [
    ...tree.querySelectorAll<HTMLElement>("[data-layer-reorder-id]"),
  ];
  // Descendants win over their containing group's inside-drop zone.
  for (const row of rows.reverse()) {
    const translations: Point[] = [];
    for (
      let node: HTMLElement | null = row;
      node && node !== tree;
      node = node.parentElement
    ) {
      if (!node.matches("[data-layer-row],[data-layer-group]")) continue;
      const transform = getComputedStyle(node).transform;
      if (transform !== "none") {
        const matrix = new DOMMatrixReadOnly(transform);
        translations.push({ x: matrix.e, y: matrix.f });
      }
    }
    const box = layerLayoutBox(row.getBoundingClientRect(), translations);
    if (containsLayerPoint(box, point)) return { node: row, box };
  }
  return null;
}
