import { useEffect, useRef, useState, type DragEvent } from "react";
import { useSetAtom, useStore } from "jotai";
import {
  applyCommand,
  type Command,
  type LayerReference,
} from "@resumi/engine";
import { sessionAtom } from "../../../state/editor";
import { designCommandAtom } from "../../../state/design";

type Relocate = Extract<Command, { type: "layer.relocate" }>;
const mime = "application/x-resumi-layer";

/** A drag is a reversible preview; only drop enters the validated undo history. */
export function useLayerReorder() {
  const store = useStore(),
    dispatch = useSetAtom(designCommandAtom);
  const source = useRef<LayerReference | null>(null),
    command = useRef<Relocate | null>(null);
  const restores = useRef<(() => void)[]>([]);
  const [preview, setPreview] =
    useState<ReturnType<typeof applyCommand>["canvas"]>();
  const [target, setTarget] = useState<{
    id: string;
    placement: string;
  } | null>(null);
  function restore() {
    [...restores.current].reverse().forEach((reset) => reset());
    restores.current = [];
  }
  function clear() {
    restore();
    source.current = null;
    command.current = null;
    setPreview(undefined);
    setTarget(null);
  }
  useEffect(() => {
    function cancel() {
      clear();
    }
    function escape(event: KeyboardEvent) {
      if (event.key === "Escape") clear();
    }
    document.addEventListener("dragend", cancel);
    document.addEventListener("keydown", escape);
    window.addEventListener("blur", cancel);
    return () => {
      restore();
      document.removeEventListener("dragend", cancel);
      document.removeEventListener("keydown", escape);
      window.removeEventListener("blur", cancel);
    };
  }, []);
  function bind(reference: LayerReference, locked = false) {
    return {
      draggable: !locked,
      "data-drop-position":
        target?.id === reference.id ? target.placement : undefined,
      onDragStart(event: DragEvent<HTMLElement>) {
        if (
          locked ||
          (event.target instanceof HTMLElement && event.target.closest("input"))
        ) {
          event.preventDefault();
          return;
        }
        event.stopPropagation();
        source.current = reference;
        event.dataTransfer.setData(mime, JSON.stringify(reference));
        event.dataTransfer.effectAllowed = "move";
      },
      onDragOver(event: DragEvent<HTMLElement>) {
        if (!source.current || locked) return;
        event.preventDefault();
        event.stopPropagation();
        event.dataTransfer.dropEffect = "move";
        if (source.current.id === reference.id) return;
        const rect = event.currentTarget.getBoundingClientRect(),
          ratio = (event.clientY - rect.top) / rect.height;
        const placement =
          reference.kind === "group" &&
          source.current.kind === "element" &&
          ratio > 0.25 &&
          ratio < 0.75
            ? "inside"
            : ratio < 0.5
              ? "above"
              : "below";
        const next: Relocate = {
          type: "layer.relocate",
          source: source.current,
          target: reference,
          placement,
        };
        if (
          command.current?.target?.id === reference.id &&
          command.current.placement === placement
        )
          return;
        try {
          const doc = applyCommand(store.get(sessionAtom)!.document, next);
          command.current = next;
          setPreview(doc.canvas);
          setTarget({ id: reference.id, placement });
          restore();
          // Absolute layers can preview stacking without publishing a document or running React on the canvas.
          doc.canvas!.order.forEach((id, index) => {
            const group = doc.canvas!.groups.find((item) =>
              item.elementIds.includes(id),
            );
            const layer = document.querySelector<HTMLElement>(
              `[data-layer-id="${id}"]`,
            );
            const groupNode = group
              ? document.querySelector<HTMLElement>(
                  `[data-group-id="${group.id}"]`,
                )
              : null;
            for (const node of [layer, groupNode]) {
              if (!node) continue;
              const previous = node.style.zIndex;
              node.style.zIndex = String(index + 1);
              restores.current.push(() => {
                node.style.zIndex = previous;
              });
            }
          });
        } catch {
          command.current = null;
          restore();
          setPreview(undefined);
          setTarget(null);
          event.dataTransfer.dropEffect = "none";
        }
      },
      onDrop(event: DragEvent<HTMLElement>) {
        if (!source.current) return;
        event.preventDefault();
        event.stopPropagation();
        const next = command.current;
        clear();
        if (next) dispatch(next);
      },
    };
  }
  return { preview, bind, clear };
}
export type LayerDragBinding = ReturnType<
  ReturnType<typeof useLayerReorder>["bind"]
>;
