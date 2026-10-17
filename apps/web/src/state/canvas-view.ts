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
