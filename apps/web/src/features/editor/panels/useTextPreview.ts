import { useEffect, useRef } from "react";

/** Property-menu hover is a DOM preview, never a document or history entry. */
export function useTextPreview(id: string) {
  const saved = useRef<
    { node: HTMLElement; key: "fontFamily" | "fontSize"; value: string }[]
  >([]);
  function restore() {
    for (const entry of saved.current)
      entry.node.style[entry.key] = entry.value;
    saved.current = [];
  }
  useEffect(
    () => () => {
      for (const entry of saved.current)
        entry.node.style[entry.key] = entry.value;
      saved.current = [];
    },
    [id],
  );
  return (key: "fontFamily" | "fontSize", value: string | number | null) => {
    restore();
    if (value === null) return;
    const root = document.querySelector<HTMLElement>(`[data-layer-id="${id}"]`);
    if (!root) return;
    const nodes = root.querySelectorAll<HTMLElement>(
      ".design-content, .design-content span, .design-content a, [contenteditable=true]",
    );
    for (const node of nodes) {
      saved.current.push({ node, key, value: node.style[key] });
      node.style[key] = key === "fontSize" ? `${value}px` : String(value);
    }
  };
}
