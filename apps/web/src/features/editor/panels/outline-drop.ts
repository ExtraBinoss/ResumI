export type OutlineDropSlot = { id: string; midpoint: number };

/** Original header slots stay stable while the preview moves their rendered rows. */
export function outlineDropTarget(
  slots: readonly OutlineDropSlot[],
  sourceId: string,
  clientY: number,
  scrollDelta: number,
): { id: string; edge: "above" | "below" } | null {
  const remaining = slots.filter((slot) => slot.id !== sourceId);
  const next = remaining.find((slot) => clientY < slot.midpoint - scrollDelta);
  if (next) return { id: next.id, edge: "above" };
  const last = remaining.at(-1);
  return last ? { id: last.id, edge: "below" } : null;
}
