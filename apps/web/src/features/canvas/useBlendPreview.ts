import { useEffect, useRef } from "react";
import { useStore } from "jotai";
import { blendModes, type Document, type LayerGroup } from "@resumi/engine";
import { sessionAtom } from "../../state/editor";

type BlendMode = LayerGroup["blendMode"];
type Target = {
  node: HTMLElement;
  id: string;
  kind: "group" | "layer";
  previous: string;
};
type Preview = { targets: Target[]; value: string };
type Property = "mixBlendMode" | "opacity";
function restore(
  preview: Preview | null,
  document: Document | undefined,
  property: Property,
) {
  for (const target of preview?.targets ?? []) {
    const layer =
      target.kind === "group"
        ? document?.canvas?.groups.find((group) => group.id === target.id)
        : document?.blocks[target.id]?.design;
    const canonical =
      property === "opacity" ? layer?.opacity : layer?.blendMode;
    target.node.style[property] = String(canonical ?? target.previous);
  }
}

/** A hover is a disposable DOM preview; only choosing an option issues an engine command. */
function useAppearancePreview({
  ids,
  groupId,
  property,
}: {
  ids: readonly string[];
  groupId?: string;
  property: Property;
}) {
  const store = useStore();
  const preview = useRef<Preview | null>(null);
  const selectionKey = groupId ? `group:${groupId}` : ids.join(",");
  useEffect(
    () => () => {
      restore(preview.current, store.get(sessionAtom)?.document, property);
      preview.current = null;
    },
    [store, selectionKey, property],
  );
  return (value: string | null) => {
    if (preview.current?.value === value) return;
    restore(preview.current, store.get(sessionAtom)?.document, property);
    preview.current = null;
    if (
      value === null ||
      (property === "mixBlendMode" && !blendModes.includes(value as BlendMode))
    )
      return;
    const canvas = document.querySelector<HTMLElement>(
      'article[aria-label="Resume canvas"]',
    );
    if (!canvas) return;
    const targets: Target[] = [];
    const keys = groupId ? [groupId] : ids;
    for (const id of keys) {
      const attribute = groupId ? "data-group-id" : "data-layer-id";
      const node = canvas.querySelector<HTMLElement>(
        `[${attribute}="${CSS.escape(id)}"]`,
      );
      if (node)
        targets.push({
          node,
          id,
          kind: groupId ? "group" : "layer",
          previous: node.style[property],
        });
    }
    for (const target of targets) target.node.style[property] = value;
    preview.current = { targets, value };
  };
}

export function useBlendPreview(target: {
  ids: readonly string[];
  groupId?: string;
}) {
  return useAppearancePreview({ ...target, property: "mixBlendMode" });
}
export function useOpacityPreview(target: {
  ids: readonly string[];
  groupId?: string;
}) {
  const preview = useAppearancePreview({ ...target, property: "opacity" });
  return (value: number | null) =>
    preview(value === null ? null : String(value / 100));
}
