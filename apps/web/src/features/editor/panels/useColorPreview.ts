import { useEffect, useRef } from "react";
import { useStore } from "jotai";
import { sessionAtom } from "../../../state/editor";
import { createColorPreview, type ColorPreviewTarget } from "./color-preview";

/** Capture once per gesture and update only its paint, synchronously with pointer input. */
export function useColorPreview(scope: string) {
  const store = useStore();
  const current = useRef<{
    key: string;
    bridge: ReturnType<typeof createColorPreview>;
  } | null>(null);
  useEffect(() => {
    const restore = () => {
      current.current?.bridge.restore();
      current.current = null;
    };
    // A concurrent canonical edit supersedes any paint before React reconciles it.
    const unsubscribe = store.sub(sessionAtom, restore);
    return () => {
      unsubscribe();
      restore();
    };
  }, [scope, store]);
  return (target: ColorPreviewTarget, color: string | null) => {
    if (color === null) {
      current.current?.bridge.restore();
      current.current = null;
      return;
    }
    const key = JSON.stringify({
      kind: target.kind,
      id: "id" in target ? target.id : null,
      detail:
        target.kind === "text"
          ? target.range
          : target.kind === "gradient"
            ? target.index
            : target.kind === "vector"
              ? { color: target.color, monochrome: target.monochrome ?? false }
              : null,
    });
    if (key !== current.current?.key) {
      current.current?.bridge.restore();
      current.current = { key, bridge: createColorPreview(target) };
    }
    current.current.bridge.paint(color);
  };
}
