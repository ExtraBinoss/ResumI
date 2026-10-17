import { useEffect, useLayoutEffect, useRef, type PointerEvent } from "react";
import { useAtomValue, useStore } from "jotai";
import { zoomAtom } from "../../state/editor";
import { fitViewportAtom, zoomRequestAtom } from "../../state/canvas-view";

type Anchor = { x: number; y: number; clientX: number; clientY: number };
const surfaceSelector = "[data-zoom-surface]";

/** All workspaces share one pointer-anchored, compositor-only zoom gesture. */
export function useCanvasPan({
  contained = false,
  initialFit,
}: {
  contained?: boolean;
  initialFit?: { id: string; width: number; height: number };
} = {}) {
  const store = useStore(),
    zoom = useAtomValue(zoomAtom);
  const zoomAnchor = useRef<Anchor | null>(null);
  const settleZoom = useRef<(() => void) | null>(null);
  const viewport = useRef<HTMLDivElement>(null),
    space = useRef(false),
    pan = useRef<{ x: number; y: number; left: number; top: number } | null>(
      null,
    );
  const fitId = initialFit?.id,
    fitWidth = initialFit?.width,
    fitHeight = initialFit?.height;
  useLayoutEffect(() => {
    const node = viewport.current;
    if (!node || !fitId || !fitWidth || !fitHeight) return;
    store.set(fitViewportAtom, {
      id: fitId,
      width: fitWidth,
      height: fitHeight,
      availableWidth: node.clientWidth,
      availableHeight: node.clientHeight,
    });
  }, [fitId, fitWidth, fitHeight, store]);
  useEffect(() => {
    function reset() {
      space.current = false;
      pan.current = null;
      if (viewport.current) viewport.current.style.cursor = "";
    }
    function keydown(event: KeyboardEvent) {
      if (
        event.code !== "Space" ||
        (event.target instanceof HTMLElement &&
          (event.target.matches("input,textarea,select,button") ||
            event.target.isContentEditable))
      )
        return;
      event.preventDefault();
      space.current = true;
      if (viewport.current) viewport.current.style.cursor = "grab";
    }
    function keyup(event: KeyboardEvent) {
      if (event.code === "Space") reset();
    }
    window.addEventListener("keydown", keydown);
    window.addEventListener("keyup", keyup);
    window.addEventListener("blur", reset);
    const node = viewport.current;
    const usableHeight = () =>
      (node?.clientHeight ?? 0) *
      (!contained && window.matchMedia("(max-width: 700px)").matches ? 0.6 : 1);
    let previous = { width: node?.clientWidth ?? 0, height: usableHeight() };
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let zoomFrame = 0,
      targetZoom = store.get(zoomAtom),
      visualZoom = targetZoom,
      previousTime = 0;
    let anchor: Anchor | null = null,
      paper: HTMLElement | null = null;
    function settle() {
      cancelAnimationFrame(zoomFrame);
      zoomFrame = 0;
      if (!paper || !anchor) return;
      // Never remove the translated preview before the bounds and scroll offset commit.
      // That would expose one frame at the old scroll position with the new scale.
      zoomAnchor.current = anchor;
      paper.style.willChange = "";
      const finalZoom = Math.round(visualZoom * 100) / 100;
      store.set(zoomAtom, finalZoom);
      store.set(zoomRequestAtom, null);
      paper = null;
      anchor = null;
    }
    settleZoom.current = settle;
    function stepZoom(now: number) {
      if (!paper || !anchor || !node) return;
      const blend = reducedMotion.matches
        ? 1
        : 1 - Math.exp(-Math.min(32, Math.max(0, now - previousTime)) / 55);
      previousTime = now;
      visualZoom =
        Math.abs(targetZoom - visualZoom) < 0.05
          ? targetZoom
          : visualZoom + (targetZoom - visualZoom) * blend;
      const bounds = paper.parentElement!.getBoundingClientRect(),
        scale = visualZoom / 100;
      const x = anchor.clientX - anchor.x * scale - bounds.left,
        y = anchor.clientY - anchor.y * scale - bounds.top;
      paper.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
      if (visualZoom !== targetZoom)
        zoomFrame = requestAnimationFrame(stepZoom);
      else settle();
    }
    function request() {
      const next = store.get(zoomRequestAtom);
      const currentPaper = node?.querySelector<HTMLElement>(surfaceSelector);
      if (!next || !node || !currentPaper) return;
      const rect = currentPaper.getBoundingClientRect(),
        scale = paper ? visualZoom / 100 : store.get(zoomAtom) / 100;
      const viewportBounds = node.getBoundingClientRect();
      const clientX =
          next.clientX ?? viewportBounds.left + node.clientWidth / 2,
        clientY = next.clientY ?? viewportBounds.top + usableHeight() / 2;
      if (!paper) {
        visualZoom = scale * 100;
        paper = currentPaper;
      }
      targetZoom = next.value;
      anchor = {
        x: (clientX - rect.left) / scale,
        y: (clientY - rect.top) / scale,
        clientX,
        clientY,
      };
      currentPaper.style.willChange = "transform";
      if (!zoomFrame) {
        previousTime = performance.now();
        zoomFrame = requestAnimationFrame(stepZoom);
      }
    }
    function wheel(event: WheelEvent) {
      if (!node || (!event.ctrlKey && !event.metaKey)) return;
      event.preventDefault();
      const unit =
        event.deltaMode === 1
          ? 16
          : event.deltaMode === 2
            ? node.clientHeight
            : 1;
      const current = store.get(zoomRequestAtom)?.value ?? store.get(zoomAtom);
      store.set(zoomRequestAtom, {
        value:
          Math.round(
            Math.min(
              250,
              Math.max(15, current * Math.exp(-event.deltaY * unit * 0.002)),
            ) * 10,
          ) / 10,
        clientX: event.clientX,
        clientY: event.clientY,
      });
    }
    const unsubscribeRequest = store.sub(zoomRequestAtom, request);
    node?.addEventListener("wheel", wheel, { passive: false });
    if (node) {
      node.scrollLeft = (node.scrollWidth - node.clientWidth) / 2;
      node.scrollTop = (node.scrollHeight - usableHeight()) / 2;
    }
    const observer = new ResizeObserver(() => {
      if (!node) return;
      node.scrollLeft += (previous.width - node.clientWidth) / 2;
      node.scrollTop += (previous.height - usableHeight()) / 2;
      previous = { width: node.clientWidth, height: usableHeight() };
    });
    if (node) observer.observe(node);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(zoomFrame);
      settleZoom.current = null;
      unsubscribeRequest();
      if (paper) {
        paper.style.transform = `scale(${store.get(zoomAtom) / 100})`;
        paper.style.willChange = "";
      }
      store.set(zoomRequestAtom, null);
      node?.removeEventListener("wheel", wheel);
      window.removeEventListener("keydown", keydown);
      window.removeEventListener("keyup", keyup);
      window.removeEventListener("blur", reset);
    };
  }, [contained, store]);
  useLayoutEffect(() => {
    const node = viewport.current,
      anchor = zoomAnchor.current;
    if (!node || !anchor) return;
    const paper = node.querySelector<HTMLElement>(surfaceSelector);
    if (!paper) return;
    paper.style.transform = `scale(${zoom / 100})`;
    const rect = paper.getBoundingClientRect();
    node.scrollLeft += rect.left + anchor.x * (zoom / 100) - anchor.clientX;
    node.scrollTop += rect.top + anchor.y * (zoom / 100) - anchor.clientY;
    zoomAnchor.current = null;
  }, [zoom]);
  return {
    ref: viewport,
    onPointerDownCapture(event: PointerEvent<HTMLDivElement>) {
      settleZoom.current?.();
      if (
        (event.button !== 1 && !(space.current && event.button === 0)) ||
        !viewport.current
      )
        return;
      event.preventDefault();
      event.stopPropagation();
      const node = viewport.current;
      pan.current = {
        x: event.clientX,
        y: event.clientY,
        left: node.scrollLeft,
        top: node.scrollTop,
      };
      node.setPointerCapture(event.pointerId);
      node.style.cursor = "grabbing";
    },
    onPointerMoveCapture(event: PointerEvent<HTMLDivElement>) {
      const initial = pan.current,
        node = viewport.current;
      if (!initial || !node) return;
      event.preventDefault();
      event.stopPropagation();
      node.scrollLeft = initial.left - (event.clientX - initial.x);
      node.scrollTop = initial.top - (event.clientY - initial.y);
    },
    onPointerUpCapture(event: PointerEvent<HTMLDivElement>) {
      if (!pan.current) return;
      event.stopPropagation();
      pan.current = null;
      if (event.currentTarget.hasPointerCapture(event.pointerId))
        event.currentTarget.releasePointerCapture(event.pointerId);
      event.currentTarget.style.cursor = space.current ? "grab" : "";
    },
    onPointerCancelCapture() {
      pan.current = null;
    },
  };
}
