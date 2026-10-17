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
type Preview = { targets: Target[]; value: BlendMode };
function restore(preview: Preview | null, document: Document | undefined) {
  for (const target of preview?.targets ?? []) {
    const canonical =
      target.kind === "group"
        ? document?.canvas?.groups.find((group) => group.id === target.id)
            ?.blendMode
        : document?.blocks[target.id]?.design?.blendMode;
    const value = canonical ?? target.previous;
    if (value) target.node.style.mixBlendMode = value;
    else target.node.style.removeProperty("mix-blend-mode");
  }
}

/** A hover is a disposable DOM preview; only choosing an option issues an engine command. */
export function useBlendPreview({
  ids,
  groupId,
}: {
  ids: readonly string[];
  groupId?: string;
}) {
  const store = useStore();
  const preview = useRef<Preview | null>(null);
  const selectionKey = groupId ? `group:${groupId}` : ids.join(",");
  useEffect(
    () => () => {
      restore(preview.current, store.get(sessionAtom)?.document);
      preview.current = null;
    },
    [store, selectionKey],
  );
  return (value: string | null) => {
    if (preview.current?.value === value) return;
    restore(preview.current, store.get(sessionAtom)?.document);
    preview.current = null;
    if (!value || !blendModes.includes(value as BlendMode)) return;
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
          previous: node.style.mixBlendMode,
        });
    }
    for (const target of targets) target.node.style.mixBlendMode = value;
    preview.current = { targets, value: value as BlendMode };
  };
}
