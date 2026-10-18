import { atom } from "jotai";
import { boundsForElements, type LayerReference } from "@resumi/engine";
import { activePageIdAtom, canvasAtom } from "./design";
import { blockAtom, sessionAtom } from "./editor";

const targetAtom = atom<{
  reference: LayerReference;
  documentId: string;
  pageId: string;
} | null>(null);

/** Layer-list hover is transient chrome, scoped to the current document/page. */
export const layerHoverAtom = atom(
  (get) => {
    const target = get(targetAtom);
    return target?.documentId === get(sessionAtom)?.document.id &&
      target?.pageId === get(activePageIdAtom)
      ? target.reference
      : null;
  },
  (get, set, reference: LayerReference | null) => {
    const documentId = get(sessionAtom)?.document.id;
    set(
      targetAtom,
      reference && documentId
        ? { reference, documentId, pageId: get(activePageIdAtom) }
        : null,
    );
  },
);

export const layerHoverFrameAtom = atom((get) => {
  const reference = get(layerHoverAtom),
    canvas = get(canvasAtom);
  if (!reference || !canvas) return null;
  const group = canvas.groups.find((group) =>
    reference.kind === "group"
      ? group.id === reference.id
      : group.elementIds.includes(reference.id),
  );
  if (group?.hidden) return null;
  if (reference.kind === "element") {
    if (!canvas.order.includes(reference.id)) return null;
    const layer = get(blockAtom(reference.id))?.design;
    return layer && !layer.hidden ? { id: reference.id, layer } : null;
  }
  if (!group) return null;
  const layers = group.elementIds.flatMap((id) => {
    if (!canvas.order.includes(id)) return [];
    const layer = get(blockAtom(id))?.design;
    return layer && !layer.hidden ? [layer] : [];
  });
  const bounds = boundsForElements(layers);
  return bounds
    ? { id: group.id, layer: { ...bounds, rotation: 0, name: group.name } }
    : null;
});
