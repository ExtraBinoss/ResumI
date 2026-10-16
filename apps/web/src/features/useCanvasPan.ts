import { useEffect, useRef, type PointerEvent } from "react";
export function useCanvasPan() {
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
    let previous = {
      width: node?.clientWidth ?? 0,
      height: node?.clientHeight ?? 0,
    };
    if (node) {
      node.scrollLeft = (node.scrollWidth - node.clientWidth) / 2;
      node.scrollTop = (node.scrollHeight - node.clientHeight) / 2;
    }
    const observer = new ResizeObserver(() => {
      if (!node) return;
      node.scrollLeft += (previous.width - node.clientWidth) / 2;
      node.scrollTop += (previous.height - node.clientHeight) / 2;
      previous = { width: node.clientWidth, height: node.clientHeight };
    });
    if (node) observer.observe(node);
    return () => {
      observer.disconnect();
      window.removeEventListener("keydown", keydown);
      window.removeEventListener("keyup", keyup);
      window.removeEventListener("blur", reset);
    };
  }, []);
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
