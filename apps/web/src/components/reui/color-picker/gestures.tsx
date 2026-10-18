// Imported with shadcn CLI from ReUI's Base UI registry (MIT); split by responsibility.
import type {
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
} from "react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ColorPickerContextValue } from "./context";
import { clamp } from "./conversion";

export function copyOnShortcut(
  event: ReactKeyboardEvent<HTMLElement>,
  context: ColorPickerContextValue,
) {
  if (
    !(event.metaKey || event.ctrlKey) ||
    event.altKey ||
    event.shiftKey ||
    event.key.toLowerCase() !== "c" ||
    !context.color
  ) {
    return false;
  }
  const target = event.target;
  const selected =
    target instanceof HTMLInputElement
      ? target.selectionStart !== target.selectionEnd
      : !!event.currentTarget.ownerDocument.getSelection()?.toString();
  if (selected) return false;
  event.preventDefault();
  context.copy();
  return true;
}

export function useEscapeRevert(
  field: { current: HTMLElement | null },
  editing: boolean,
  revert: () => void,
) {
  const revertRef = useRef(revert);
  useLayoutEffect(() => {
    revertRef.current = revert;
  });
  useEffect(() => {
    const view = field.current?.ownerDocument.defaultView;
    if (!editing || !view) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.target !== field.current) return;
      event.preventDefault();
      event.stopPropagation();
      revertRef.current();
    };
    view.addEventListener("keydown", onKeyDown, true);
    return () => view.removeEventListener("keydown", onKeyDown, true);
  }, [editing, field]);
}

export const THUMB_CLASS =
  "pointer-events-none absolute size-(--color-picker-thumb-size) -translate-x-1/2 -translate-y-1/2 border-2 border-white shadow-[0_0_0_1px_rgb(0_0_0/0.12),0_1px_3px_rgb(0_0_0/0.3)] transition-[box-shadow] rounded-full ring-ring/50 group-focus-visible/color-picker-control:ring-3 forced-colors:outline-2 forced-colors:outline-solid";

export const EDGE_CLASS =
  "after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:inset-ring after:inset-ring-foreground/10";

export const CONTROL_CLASS =
  "group/color-picker-control relative outline-none [--color-picker-thumb-size:calc(var(--spacing)*4)] select-none aria-disabled:pointer-events-none aria-disabled:opacity-50 data-dragging:cursor-grabbing";

export function pointerRatio(
  event: ReactPointerEvent<HTMLElement>,
  element: HTMLElement,
  inset = 0,
) {
  const rect = element.getBoundingClientRect();
  const ratio = (offset: number, size: number) =>
    size > inset ? clamp((offset - inset / 2) / (size - inset), 0, 1) : 0;
  return {
    x: ratio(event.clientX - rect.left, rect.width),
    y: ratio(event.clientY - rect.top, rect.height),
  };
}

export const travel = (fraction: number) =>
  `calc(var(--color-picker-thumb-size) / 2 + (100% - var(--color-picker-thumb-size)) * ${fraction})`;

export function useDrag(
  context: ColorPickerContextValue,
  update: (event: ReactPointerEvent<HTMLElement>, element: HTMLElement) => void,
) {
  const pointer = useRef<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const end = (event: ReactPointerEvent<HTMLElement>, cancel = false) => {
    if (pointer.current !== event.pointerId) return;
    pointer.current = null;
    setDragging(false);
    if (cancel) context.cancelInteraction();
    else context.endInteraction();
  };
  return {
    dragging,
    handlers: {
      onPointerDown: (event: ReactPointerEvent<HTMLElement>) => {
        if (event.button !== 0 || !context.editable) return;
        pointer.current = event.pointerId;
        event.currentTarget.setPointerCapture?.(event.pointerId);
        setDragging(true);
        context.startInteraction();
        update(event, event.currentTarget);
      },
      onPointerMove: (event: ReactPointerEvent<HTMLElement>) => {
        if (pointer.current === event.pointerId) {
          update(event, event.currentTarget);
        }
      },
      onPointerUp: (event: ReactPointerEvent<HTMLElement>) => end(event),
      onPointerCancel: (event: ReactPointerEvent<HTMLElement>) =>
        end(event, true),
      onLostPointerCapture: (event: ReactPointerEvent<HTMLElement>) =>
        end(event, true),
    },
  };
}

export function keyDelta(event: ReactKeyboardEvent, step: number) {
  const size = event.shiftKey ? step * 10 : step;
  switch (event.key) {
    case "ArrowUp":
    case "ArrowRight":
      return size;
    case "ArrowDown":
    case "ArrowLeft":
      return -size;
    case "PageUp":
      return step * 10;
    case "PageDown":
      return -step * 10;
    case "Home":
      return -Infinity;
    case "End":
      return Infinity;
  }
  return null;
}

export const snap = (value: number, step: number) =>
  Number((Math.round(value / step) * step).toFixed(4));
