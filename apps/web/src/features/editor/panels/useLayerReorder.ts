import {
  useEffect,
  useRef,
  useState,
  type PointerEvent,
  type DragEvent,
} from "react";
import { useSetAtom, useStore } from "jotai";
import { layerDragVisual } from "./layer-drag-visual";
import { layerDropHit } from "./layer-drop-hit";
import {
  applyCommand,
  groupFor,
  canvasForPage,
  type Command,
  type Document,
  type LayerReference,
} from "@resumi/engine";
import { sessionAtom } from "../../../state/editor";
import {
  activePageIdAtom,
  designCommandAtom,
  selectLayersAtom,
} from "../../../state/design";

type Relocate = Extract<Command, { type: "layer.relocate" }>;
type Point = { x: number; y: number };
type Gesture = {
  source: LayerReference;
  start: Point;
  point: Point;
  pointerId: number;
  active: boolean;
};
function destination(document: Document, command: Relocate) {
  if (command.source.kind !== "element") return;
  return command.placement === "inside"
    ? command.target?.id
    : command.target?.kind === "element"
      ? groupFor(document, command.target.id)?.id
      : undefined;
}

/** The stable tree captures the pointer, so reparenting a row cannot interrupt a drag. */
export function useLayerReorder() {
  const store = useStore(),
    dispatch = useSetAtom(designCommandAtom);
  const treeRef = useRef<HTMLDivElement>(null);
  const gesture = useRef<Gesture | null>(null);
  const [preview, setPreview] = useState<Document["canvas"]>();
  const [dragging, setDragging] = useState(false);
  const [target, setTarget] = useState<{
    id: string;
    placement: string;
  } | null>(null);
  useEffect(() => {
    let command: Relocate | null = null,
      frame = 0,
      expandTimer = 0;
    let expanded: string | undefined,
      suppressClick = false;
    let restores: (() => void)[] = [];
    let previousUserSelect: string | undefined;
    let visual: ReturnType<typeof layerDragVisual> | undefined;
    function restore() {
      restores.reverse().forEach((reset) => reset());
      restores = [];
    }
    function cancelExpansion() {
      window.clearTimeout(expandTimer);
      expandTimer = 0;
    }
    function clear(publish = true) {
      const current = gesture.current;
      gesture.current = null;
      if (current && treeRef.current?.hasPointerCapture(current.pointerId))
        treeRef.current.releasePointerCapture(current.pointerId);
      cancelAnimationFrame(frame);
      frame = 0;
      visual?.dispose();
      visual = undefined;
      cancelExpansion();
      restore();
      if (previousUserSelect !== undefined)
        document.body.style.userSelect = previousUserSelect;
      previousUserSelect = undefined;
      command = null;
      expanded = undefined;
      if (publish) {
        setPreview(undefined);
        setTarget(null);
        setDragging(false);
      }
    }
    function render(next: Relocate) {
      const started = performance.now();
      try {
        const base = store.get(sessionAtom)!.document;
        let doc = applyCommand(base, next);
        if (expanded && destination(base, next) === expanded)
          doc = applyCommand(doc, {
            type: "group.update",
            id: expanded,
            patch: { collapsed: false },
          });
        command = next;
        setPreview(canvasForPage(doc, store.get(activePageIdAtom)));
        setTarget({ id: next.target!.id, placement: next.placement });
        restore();
        const seen = new Set<HTMLElement>();
        doc.canvas!.order.forEach((id, index) => {
          const group = groupFor(doc, id);
          const nodes = [
            document.querySelector<HTMLElement>(
              `[data-layer-id="${CSS.escape(id)}"]`,
            ),
            group
              ? document.querySelector<HTMLElement>(
                  `[data-group-id="${CSS.escape(group.id)}"]`,
                )
              : null,
          ];
          for (const node of nodes) {
            if (!node) continue;
            if (!seen.has(node)) {
              const before = node.style.zIndex;
              restores.push(() => {
                node.style.zIndex = before;
              });
              seen.add(node);
            }
            node.style.zIndex = String(index + 1);
          }
        });
        performance.measure("resumi:layer-preview", {
          start: started,
          end: performance.now(),
          detail: { layers: base.canvas!.order.length },
        });
      } catch {
        command = null;
        restore();
        setPreview(undefined);
        setTarget(null);
      }
    }
    function update() {
      frame = 0;
      const current = gesture.current;
      if (!current?.active || !treeRef.current) return;
      const { point, source } = current;
      const viewport = treeRef.current.closest<HTMLElement>(
        '[data-slot="scroll-shadow-viewport"]',
      );
      let scrollAgain = false;
      if (viewport) {
        const bounds = viewport.getBoundingClientRect(),
          before = viewport.scrollTop;
        const dy =
          point.y < bounds.top + 24
            ? -12
            : point.y > bounds.bottom - 24
              ? 12
              : 0;
        if (dy) viewport.scrollTop += dy;
        scrollAgain = viewport.scrollTop !== before;
      }
      const hit = layerDropHit(treeRef.current, point);
      const node = hit?.node;
      if (
        node &&
        treeRef.current.contains(node) &&
        node.dataset.layerReorderLocked !== "true"
      ) {
        const reference: LayerReference = {
          id: node.dataset.layerReorderId!,
          kind: node.dataset.layerReorderKind as LayerReference["kind"],
        };
        const sourceGroupMember =
          source.kind === "group" &&
          reference.kind === "element" &&
          groupFor(store.get(sessionAtom)!.document, reference.id)?.id ===
            source.id;
        if (source.id !== reference.id && !sourceGroupMember) {
          const rect = hit!.box,
            ratio = (point.y - rect.top) / rect.height;
          const placement =
            reference.kind === "group" &&
            source.kind === "element" &&
            (node.dataset.layerReorderInside === "true" ||
              (ratio > 0.25 && ratio < 0.75))
              ? "inside"
              : ratio < 0.5
                ? "above"
                : "below";
          if (
            command?.target?.id !== reference.id ||
            command.placement !== placement
          ) {
            cancelExpansion();
            const next: Relocate = {
              type: "layer.relocate",
              source,
              target: reference,
              placement,
            };
            render(next);
            if (
              command &&
              placement === "inside" &&
              store
                .get(sessionAtom)!
                .document.canvas!.groups.find((g) => g.id === reference.id)
                ?.collapsed
            ) {
              expandTimer = window.setTimeout(() => {
                expanded = reference.id;
                if (command?.target?.id === reference.id) render(command);
              }, 350);
            }
          }
        }
      } else {
        cancelExpansion();
        command = null;
        restore();
        setPreview(undefined);
        setTarget(null);
      }
      if (scrollAgain) frame = requestAnimationFrame(update);
    }
    function move(event: globalThis.PointerEvent) {
      const current = gesture.current;
      if (!current || current.pointerId !== event.pointerId) return;
      current.point = { x: event.clientX, y: event.clientY };
      if (!current.active) {
        if (
          Math.hypot(
            event.clientX - current.start.x,
            event.clientY - current.start.y,
          ) < 6
        )
          return;
        performance.clearMeasures("resumi:layer-preview");
        current.active = true;
        const row = treeRef.current?.querySelector<HTMLElement>(
          `[data-layer-reorder-id="${CSS.escape(current.source.id)}"]`,
        );
        if (row)
          visual = layerDragVisual(
            row,
            current.start,
            window.matchMedia("(prefers-reduced-motion: reduce)").matches,
          );
        const group =
          current.source.kind === "group"
            ? store
                .get(sessionAtom)
                ?.document.canvas?.groups.find(
                  (group) => group.id === current.source.id,
                )
            : undefined;
        store.set(selectLayersAtom, {
          ids: group?.elementIds ?? [current.source.id],
          groupId: group?.id,
        });
        previousUserSelect = document.body.style.userSelect;
        document.body.style.userSelect = "none";
        treeRef.current?.setPointerCapture(event.pointerId);
        setDragging(true);
      }
      visual?.move(current.point);
      event.preventDefault();
      if (!frame) frame = requestAnimationFrame(update);
    }
    function finish(event: globalThis.PointerEvent) {
      const current = gesture.current;
      if (!current || current.pointerId !== event.pointerId) return;
      if (current.active) {
        current.point = { x: event.clientX, y: event.clientY };
        cancelAnimationFrame(frame);
        update();
        suppressClick = true;
      }
      const next = command,
        base = store.get(sessionAtom)!.document;
      const groupId = next && destination(base, next);
      const open =
        groupId && base.canvas!.groups.find((g) => g.id === groupId)?.collapsed;
      clear();
      if (next)
        dispatch({
          version: 1,
          actor: { kind: "human", name: "Layer order" },
          commands: [
            next,
            ...(open
              ? [
                  {
                    type: "group.update" as const,
                    id: groupId!,
                    patch: { collapsed: false },
                  },
                ]
              : []),
          ],
        });
    }
    function cancel() {
      if (gesture.current?.active) suppressClick = true;
      clear();
    }
    function escape(event: KeyboardEvent) {
      if (event.key === "Escape") cancel();
    }
    function click(event: MouseEvent) {
      if (gesture.current?.active || suppressClick) {
        event.preventDefault();
        event.stopPropagation();
        suppressClick = false;
      }
    }
    function press() {
      suppressClick = false;
    }
    document.addEventListener("pointerdown", press, true);
    document.addEventListener("pointermove", move, { passive: false });
    document.addEventListener("pointerup", finish);
    document.addEventListener("pointercancel", cancel);
    document.addEventListener("keydown", escape);
    document.addEventListener("click", click, true);
    window.addEventListener("blur", cancel);
    const unsubscribePage = store.sub(activePageIdAtom, cancel);
    // Changing the preference ends an in-flight spring without committing its preview.
    const motionPreference = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    motionPreference.addEventListener("change", cancel);
    return () => {
      unsubscribePage();
      motionPreference.removeEventListener("change", cancel);
      clear(false);
      document.removeEventListener("pointerdown", press, true);
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerup", finish);
      document.removeEventListener("pointercancel", cancel);
      document.removeEventListener("keydown", escape);
      document.removeEventListener("click", click, true);
      window.removeEventListener("blur", cancel);
    };
  }, [store, dispatch]);
  function bind(reference: LayerReference, locked = false, inside = false) {
    return {
      draggable: false,
      "data-layer-reorder-id": reference.id,
      "data-layer-reorder-kind": reference.kind,
      "data-layer-reorder-locked": String(locked),
      "data-layer-reorder-inside": String(inside),
      "data-layer-dragging":
        !inside &&
        gesture.current?.active &&
        gesture.current.source.id === reference.id
          ? "true"
          : undefined,
      "data-drop-position":
        target?.id === reference.id ? target.placement : undefined,
      onDragStart(event: DragEvent<HTMLElement>) {
        event.preventDefault();
      },
      onPointerDown(event: PointerEvent<HTMLElement>) {
        if (inside || locked || event.button !== 0 || !event.isPrimary) return;
        const node = event.target;
        if (
          node instanceof Element &&
          node.closest('input,textarea,[contenteditable="true"]')
        )
          return;
        if (
          node instanceof Element &&
          node.closest('input,textarea,button,[role="button"]') &&
          !node.closest("[data-layer-drag-handle]")
        )
          return;
        event.stopPropagation();
        gesture.current = {
          source: reference,
          start: { x: event.clientX, y: event.clientY },
          point: { x: event.clientX, y: event.clientY },
          pointerId: event.pointerId,
          active: false,
        };
      },
    };
  }
  return { preview, bind, dragging, treeRef };
}
export type LayerDragBinding = ReturnType<
  ReturnType<typeof useLayerReorder>["bind"]
>;
export type LayerReorder = ReturnType<typeof useLayerReorder>;
