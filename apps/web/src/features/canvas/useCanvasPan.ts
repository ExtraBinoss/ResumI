import { useEffect, useLayoutEffect, useRef, type PointerEvent } from "react";
import { useAtomValue, useStore } from "jotai";
import { zoomAtom } from "../../state/editor";
export function useCanvasPan() {
  const store = useStore(),
    zoom = useAtomValue(zoomAtom);
  const zoomAnchor = useRef<{
    x: number;
    y: number;
    clientX: number;
    clientY: number;
  } | null>(null);
  const viewport = useRef<HTMLDivElement>(null),
    space = useRef(false),
    pan = useRef<{ x: number; y: number; left: number; top: number } | null>(
      null,
    );
  useEffect(() => {
    function keydown(event: KeyboardEvent) {
      if (
        event.code === "Space" &&
        !(
          event.target instanceof HTMLElement &&
          (event.target.matches("input,textarea,select,button") ||
            event.target.isContentEditable)
        )
      ) {
        event.preventDefault();
        space.current = true;
        if (viewport.current) viewport.current.style.cursor = "grab";
      }
    }
    function reset() {
      space.current = false;
      pan.current = null;
      if (viewport.current) viewport.current.style.cursor = "";
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
      (window.matchMedia("(max-width: 700px)").matches ? 0.6 : 1);
    let previous = {
      width: node?.clientWidth ?? 0,
      height: usableHeight(),
    };
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let zoomFrame = 0,
      targetZoom = store.get(zoomAtom),
      lastZoom = targetZoom,
      previousTime = 0;
    let anchor: typeof zoomAnchor.current = null;
    function stepZoom(now: number) {
      const current = store.get(zoomAtom);
      // A numeric zoom edit supersedes an in-flight wheel gesture.
      if (current !== lastZoom) {
        zoomFrame = 0;
        anchor = null;
        return;
      }
      const blend = reducedMotion.matches
        ? 1
        : 1 - Math.exp(-Math.min(32, now - previousTime) / 55);
      previousTime = now;
      const next =
        Math.abs(targetZoom - current) < 0.1
          ? targetZoom
          : Math.round((current + (targetZoom - current) * blend) * 100) / 100;
      zoomAnchor.current = anchor;
      lastZoom = next;
      store.set(zoomAtom, next);
      if (next !== targetZoom) zoomFrame = requestAnimationFrame(stepZoom);
      else {
        zoomFrame = 0;
        anchor = null;
      }
    }
    function wheel(event: WheelEvent) {
      if (!node || (!event.ctrlKey && !event.metaKey)) return;
      event.preventDefault();
      const paper = node.querySelector<HTMLElement>(
        'article[aria-label="Resume canvas"]',
      );
      if (!paper) return;
      const rect = paper.getBoundingClientRect(),
        scale = store.get(zoomAtom) / 100;
      const unit =
        event.deltaMode === 1
          ? 16
          : event.deltaMode === 2
            ? node.clientHeight
            : 1;
      targetZoom = Math.min(
        250,
        Math.max(
          15,
          (zoomFrame ? targetZoom : scale * 100) *
            Math.exp(-event.deltaY * unit * 0.002),
        ),
      );
      targetZoom = Math.round(targetZoom * 10) / 10;
      anchor = {
        x: (event.clientX - rect.left) / scale,
        y: (event.clientY - rect.top) / scale,
        clientX: event.clientX,
        clientY: event.clientY,
      };
      if (!zoomFrame) {
        lastZoom = store.get(zoomAtom);
        previousTime = performance.now();
        zoomFrame = requestAnimationFrame(stepZoom);
      }
    }
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
      node?.removeEventListener("wheel", wheel);
      window.removeEventListener("keydown", keydown);
      window.removeEventListener("keyup", keyup);
      window.removeEventListener("blur", reset);
    };
  }, [store]);
  useLayoutEffect(() => {
    const node = viewport.current,
      anchor = zoomAnchor.current;
    if (!node || !anchor) return;
    const paper = node.querySelector<HTMLElement>(
      'article[aria-label="Resume canvas"]',
    );
    if (!paper) return;
    const rect = paper.getBoundingClientRect();
    node.scrollLeft += rect.left + anchor.x * (zoom / 100) - anchor.clientX;
    node.scrollTop += rect.top + anchor.y * (zoom / 100) - anchor.clientY;
    zoomAnchor.current = null;
  }, [zoom]);
  return {
    ref: viewport,
    onPointerDownCapture(event: PointerEvent<HTMLDivElement>) {
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
