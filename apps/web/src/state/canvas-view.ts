import { atom } from "jotai";
import { zoomAtom } from "./editor";

/** A pending view gesture is transient; the renderer commits its layout scale once. */
export const zoomRequestAtom = atom<{
  value: number;
  clientX?: number;
  clientY?: number;
} | null>(null);
export const zoomControlAtom = atom(
  (get) => get(zoomRequestAtom)?.value ?? get(zoomAtom),
  (get, set, next: number | ((current: number) => number)) => {
    const current = get(zoomRequestAtom)?.value ?? get(zoomAtom);
    const value = typeof next === "function" ? next(current) : next;
    if (Number.isFinite(value))
      set(zoomRequestAtom, { value: Math.min(250, Math.max(15, value)) });
  },
);

const fittedViewportsAtom = atom<ReadonlySet<string>>(new Set<string>());

/** Initial fitting belongs to this editor session, not a component's mounts. */
export const fitViewportAtom = atom(
  null,
  (
    get,
    set,
    fit: {
      id: string;
      width: number;
      height: number;
      availableWidth: number;
      availableHeight: number;
    },
  ) => {
    const fitted = get(fittedViewportsAtom);
    if (
      fitted.has(fit.id) ||
      ![fit.width, fit.height, fit.availableWidth, fit.availableHeight].every(
        (value) => Number.isFinite(value) && value > 0,
      )
    )
      return;
    const scale = Math.min(
      1,
      (fit.availableWidth - 32) / fit.width,
      (fit.availableHeight - 32) / fit.height,
    );
    set(zoomAtom, Math.max(15, Math.floor(scale * 100)));
    set(fittedViewportsAtom, new Set([...fitted, fit.id]));
  },
);
