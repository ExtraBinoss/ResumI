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
  const settleZoom = useRef<(() => void) | null>(null);
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
      visualZoom = targetZoom,
      previousTime = 0;
    let anchor: typeof zoomAnchor.current = null;
    let paper: HTMLElement | null = null;
    function settle() {
      cancelAnimationFrame(zoomFrame);
      zoomFrame = 0;
      if (!paper || !anchor) return;
      const finalZoom = Math.round(visualZoom * 100) / 100;
      // Keep the last composited position while React commits the final bounds once.
      zoomAnchor.current = anchor;
      paper.style.transform = `scale(${finalZoom / 100})`;
      paper.style.willChange = "";
      store.set(zoomAtom, finalZoom);
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
    function wheel(event: WheelEvent) {
      if (!node || (!event.ctrlKey && !event.metaKey)) return;
      event.preventDefault();
      const currentPaper = node.querySelector<HTMLElement>(
        'article[aria-label="Resume canvas"]',
      );
      if (!currentPaper) return;
      const rect = currentPaper.getBoundingClientRect(),
        scale = zoomFrame ? visualZoom / 100 : store.get(zoomAtom) / 100;
      const unit =
        event.deltaMode === 1
          ? 16
          : event.deltaMode === 2
            ? node.clientHeight
            : 1;
      if (!zoomFrame) {
        visualZoom = targetZoom = scale * 100;
        paper = currentPaper;
      }
      targetZoom =
        Math.round(
          Math.min(
            250,
            Math.max(15, targetZoom * Math.exp(-event.deltaY * unit * 0.002)),
          ) * 10,
        ) / 10;
      anchor = {
        x: (event.clientX - rect.left) / scale,
        y: (event.clientY - rect.top) / scale,
        clientX: event.clientX,
        clientY: event.clientY,
      };
      currentPaper.style.willChange = "transform";
      if (!zoomFrame) {
        previousTime = performance.now();
        zoomFrame = requestAnimationFrame(stepZoom);
      }
    }
    const unsubscribeZoom = store.sub(zoomAtom, () => {
      if (paper) {
        cancelAnimationFrame(zoomFrame);
        zoomFrame = 0;
        paper.style.willChange = "";
        paper = null;
        anchor = null;
      }
    });
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
      unsubscribeZoom();
      if (paper) {
        paper.style.transform = `scale(${store.get(zoomAtom) / 100})`;
        paper.style.willChange = "";
      }
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
