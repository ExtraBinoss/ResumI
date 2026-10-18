// Layer relocation and bounds adapted from the V1 groups module. Flat groups,
// contiguous z-order and explicit IDs; all functions return immutable snapshots.
import type { Document } from "../document/schema";
import { EngineError } from "../validation";
import type { LayerGroup } from "./schema";
export type LayerReference = { kind: "element" | "group"; id: string };
export type LayerPlacement = "above" | "below" | "inside" | "front" | "back";
export function boundsForElements(
  elements: { x: number; y: number; width: number; height: number }[],
) {
  if (!elements.length) return null;
  const x = Math.min(...elements.map((e) => e.x)),
    y = Math.min(...elements.map((e) => e.y));
  return {
    x,
    y,
    width: Math.max(...elements.map((e) => e.x + e.width)) - x,
    height: Math.max(...elements.map((e) => e.y + e.height)) - y,
  };
}
export function groupFor(doc: Document, id: string) {
  return doc.canvas?.groups.find((group) => group.elementIds.includes(id));
}
export function isLocked(doc: Document, id: string) {
  return !!(doc.blocks[id]?.design?.locked || groupFor(doc, id)?.locked);
}
export function requireUnlocked(doc: Document, ids: string[]) {
  if (new Set(ids).size !== ids.length)
    throw new EngineError("INVALID_INPUT", "Layer IDs must be distinct.");
  for (const id of ids) {
    if (!doc.blocks[id])
      throw new EngineError("NOT_FOUND", `Layer not found: ${id}`);
    if (isLocked(doc, id))
      throw new EngineError("CONFLICT", `Layer is locked: ${id}`);
  }
}
export function referenceIds(doc: Document, ref: LayerReference) {
  if (ref.kind === "element") {
    if (!doc.blocks[ref.id])
      throw new EngineError("NOT_FOUND", `Layer not found: ${ref.id}`);
    return [ref.id];
  }
  const group = doc.canvas!.groups.find((g) => g.id === ref.id);
  if (!group) throw new EngineError("NOT_FOUND", `Group not found: ${ref.id}`);
  return doc.canvas!.order.filter((id) => group.elementIds.includes(id));
}
export function removeMembers(groups: LayerGroup[], ids: string[]) {
  return groups
    .map((g) => ({
      ...g,
      elementIds: g.elementIds.filter((id) => !ids.includes(id)),
    }))
    .filter((g) => g.elementIds.length);
}
export function relocateLayer(
  doc: Document,
  source: LayerReference,
  target: LayerReference | undefined,
  placement: LayerPlacement,
): Document {
  const canvas = doc.canvas!,
    moving = referenceIds(doc, source);
  requireUnlocked(doc, moving);
  if (placement === "front" || placement === "back" ? !!target : !target)
    throw new EngineError("INVALID_INPUT", "Invalid relocation target.");
  if (
    placement === "inside" &&
    (source.kind === "group" || target?.kind !== "group")
  )
    throw new EngineError(
      "INVALID_INPUT",
      "Only a layer can be moved inside a flat group.",
    );
  const targetIds = target ? referenceIds(doc, target) : [];
  const leavingOwnGroup =
    source.kind === "element" &&
    target?.kind === "group" &&
    targetIds.includes(source.id) &&
    (placement === "above" || placement === "below");
  if (targetIds.some((id) => moving.includes(id)) && !leavingOwnGroup)
    return doc;
  if (
    source.kind === "group" &&
    target?.kind === "element" &&
    groupFor(doc, target.id)
  )
    throw new EngineError("CONFLICT", "Groups cannot be nested.");
  const destination =
    source.kind === "element"
      ? placement === "inside"
        ? target!.id
        : target?.kind === "element"
          ? groupFor(doc, target.id)?.id
          : undefined
      : undefined;
  const destinationGroup = canvas.groups.find((g) => g.id === destination);
  if (destinationGroup?.locked)
    throw new EngineError("CONFLICT", "Destination group is locked.");
  let groups =
    source.kind === "element"
      ? removeMembers(canvas.groups, moving)
      : canvas.groups;
  if (destinationGroup) {
    groups = groups.filter((g) => g.id !== destination);
    groups = [
      ...groups,
      {
        ...destinationGroup,
        elementIds: [
          ...destinationGroup.elementIds.filter((id) => !moving.includes(id)),
          ...moving,
        ],
      },
    ];
  }
  const remaining = canvas.order.filter((id) => !moving.includes(id));
  let index = remaining.length;
  if (placement === "back") index = 0;
  else if (placement === "above" || placement === "below") {
    const positions = remaining
      .map((id, i) => (targetIds.includes(id) ? i : -1))
      .filter((i) => i >= 0);
    index = positions.length
      ? placement === "above"
        ? Math.max(...positions) + 1
        : Math.min(...positions)
      : canvas.order.indexOf(moving[0]!);
  } else if (placement === "inside")
    index =
      Math.max(...remaining.map((id, i) => (targetIds.includes(id) ? i : -1))) +
      1;
  const order = [
    ...remaining.slice(0, index),
    ...moving,
    ...remaining.slice(index),
  ];
  return {
    ...doc,
    canvas: {
      ...canvas,
      order,
      groups: groups.map((g) => ({
        ...g,
        elementIds: order.filter((id) => g.elementIds.includes(id)),
      })),
    },
  };
}
