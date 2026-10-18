import {
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  type DragEvent,
} from "react";
import { useSetAtom, useStore } from "jotai";
import { applyCommand, type Command } from "@resumi/engine";
import { sessionAtom } from "../../../state/editor";
import { designCommandAtom } from "../../../state/design";
import { outlineDropTarget, type OutlineDropSlot } from "./outline-drop";

type Item =
  | { kind: "section"; id: string }
  | { kind: "block"; id: string; sectionId: string };
export function useOutlineReorder() {
  const store = useStore(),
    dispatch = useSetAtom(designCommandAtom),
    source = useRef<Item | null>(null),
    command = useRef<Command | null>(null),
    geometry = useRef<{
      slots: OutlineDropSlot[];
      viewport: HTMLElement;
      scrollTop: number;
      overflowAnchor: string;
    } | null>(null);
  const [preview, setPreview] = useState<{
      sections?: string[];
      sectionId?: string;
      blocks?: string[];
    } | null>(null),
    [target, setTarget] = useState<{ id: string; edge: string } | null>(null);
  function restoreScrollAnchor() {
    const current = geometry.current;
    if (current) current.viewport.style.overflowAnchor = current.overflowAnchor;
    geometry.current = null;
  }
  function clear() {
    restoreScrollAnchor();
    source.current = null;
    command.current = null;
    setPreview(null);
    setTarget(null);
  }
  const clearFromExternalEvent = useEffectEvent(clear);
  useEffect(() => {
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") clearFromExternalEvent();
    };
    document.addEventListener("dragend", clearFromExternalEvent);
    document.addEventListener("keydown", escape);
    window.addEventListener("blur", clearFromExternalEvent);
    return () => {
      restoreScrollAnchor();
      document.removeEventListener("dragend", clearFromExternalEvent);
      document.removeEventListener("keydown", escape);
      window.removeEventListener("blur", clearFromExternalEvent);
    };
  }, []);
  function bind(item: Item) {
    function hover(event: DragEvent<HTMLElement>) {
      const moving = source.current;
      if (
        !moving ||
        moving.kind !== item.kind ||
        (moving.kind === "block" &&
          item.kind === "block" &&
          moving.sectionId !== item.sectionId)
      )
        return;
      event.preventDefault();
      event.stopPropagation();
      event.dataTransfer.dropEffect = "move";
      const measured = geometry.current;
      if (!measured) return;
      const destination = outlineDropTarget(
        measured.slots,
        moving.id,
        event.clientY,
        measured.viewport.scrollTop - measured.scrollTop,
      );
      if (!destination) return;
      const { id: targetId, edge } = destination;
      if (target?.id === targetId && target.edge === edge) return;
      const doc = store.get(sessionAtom)!.document,
        ids =
          item.kind === "section"
            ? doc.sectionIds
            : doc.sections[item.sectionId].blockIds,
        rest = ids.filter((id) => id !== moving.id),
        index = rest.indexOf(targetId) + (edge === "below" ? 1 : 0),
        reordered = [...rest.slice(0, index), moving.id, ...rest.slice(index)],
        next: Command =
          item.kind === "section"
            ? { type: "section.reorder", ids: reordered }
            : {
                type: "block.reorder",
                sectionId: item.sectionId,
                ids: reordered,
              };
      try {
        applyCommand(doc, next);
        command.current = reordered.every((id, index) => id === ids[index])
          ? null
          : next;
        setTarget({ id: targetId, edge });
        setPreview(
          item.kind === "section"
            ? { sections: reordered }
            : { sectionId: item.sectionId, blocks: reordered },
        );
      } catch {
        command.current = null;
        setTarget(null);
        setPreview(null);
        event.dataTransfer.dropEffect = "none";
      }
    }
    return {
      draggable: true,
      "data-drop-position": target?.id === item.id ? target.edge : undefined,
      onDragStart(event: DragEvent<HTMLElement>) {
        event.stopPropagation();
        source.current = item;
        const viewport = event.currentTarget.closest<HTMLElement>(
          '[data-slot="scroll-shadow-viewport"]',
        );
        if (viewport) {
          const root =
            item.kind === "section"
              ? viewport
              : event.currentTarget.closest<HTMLElement>(
                  "[data-outline-section]",
                )!;
          const rows = root.querySelectorAll<HTMLElement>(
            item.kind === "section"
              ? "[data-outline-section]"
              : "[data-outline-block]",
          );
          geometry.current = {
            viewport,
            scrollTop: viewport.scrollTop,
            overflowAnchor: viewport.style.overflowAnchor,
            slots: [...rows].map((row) => {
              const header =
                row.querySelector<HTMLElement>(
                  ":scope > [data-outline-header], :scope > button",
                ) ?? row;
              const rect = header.getBoundingClientRect();
              return {
                id: row.getAttribute(
                  item.kind === "section"
                    ? "data-outline-section"
                    : "data-outline-block",
                )!,
                midpoint: rect.top + rect.height / 2,
              };
            }),
          };
          // Moving a DOM row must not make native scroll anchoring move the pointer's destination.
          viewport.style.overflowAnchor = "none";
        }
        event.dataTransfer.setData(
          "application/x-resumi-outline",
          JSON.stringify(item),
        );
        event.dataTransfer.effectAllowed = "move";
      },
      onDragEnter: hover,
      onDragOver: hover,
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
  return { preview, bind };
}
export type OutlineReorder = ReturnType<typeof useOutlineReorder>;
