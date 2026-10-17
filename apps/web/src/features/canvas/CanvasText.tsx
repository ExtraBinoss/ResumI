import { useEffect, useRef, type CSSProperties } from "react";
import type { Block } from "@resumi/engine";
import { useSetAtom } from "jotai";
import { designCommandAtom } from "../../state/design";

/** The canvas text itself is the editor; its frame and typography never change. */
export function CanvasText({
  block,
  finish,
}: {
  block: Block;
  finish: () => void;
}) {
  const input = useRef<HTMLDivElement>(null),
    dispatch = useSetAtom(designCommandAtom);
  const layer = block.design;
  useEffect(() => {
    const node = input.current;
    if (!node) return;
    node.focus();
    const selection = window.getSelection(),
      range = document.createRange();
    range.selectNodeContents(node);
    selection?.removeAllRanges();
    selection?.addRange(range);
  }, []);
  if (layer && layer.type !== "text") return null;
  function commit(value: string) {
    if (value !== block.text)
      dispatch({ type: "block.update", id: block.id, patch: { text: value } });
    finish();
  }
  const style: CSSProperties = layer
    ? {
        margin: 0,
        width: "100%",
        height: "100%",
        padding: block.kind === "bullet" ? "0 0 0 13px" : 0,
        outline: "none",
        background: "transparent",
        cursor: "text",
        whiteSpace: "pre-wrap",
        overflowWrap: "anywhere",
        fontFamily: layer.fontFamily,
        fontSize: layer.fontSize,
        fontWeight: layer.fontWeight,
        fontStyle: layer.fontStyle,
        lineHeight: layer.lineHeight,
        letterSpacing: layer.letterSpacing,
        textAlign: layer.align,
        color: layer.color,
        textTransform: layer.uppercase ? "uppercase" : undefined,
        textDecoration:
          [layer.underline && "underline", layer.strike && "line-through"]
            .filter(Boolean)
            .join(" ") || "none",
      }
    : { outline: "none", background: "transparent", cursor: "text" };
  return (
    <div
      ref={input}
      role="textbox"
      className={!layer ? `resume-block resume-${block.kind}` : undefined}
      aria-label="Edit text on canvas"
      aria-multiline="true"
      contentEditable="plaintext-only"
      suppressContentEditableWarning
      spellCheck
      style={style}
      onPointerDown={(e) => e.stopPropagation()}
      onBlur={(e) => commit(e.currentTarget.innerText)}
      onKeyDown={(e) => {
        e.stopPropagation();
        if (e.key === "Escape") {
          e.preventDefault();
          e.currentTarget.blur();
        }
        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          commit(e.currentTarget.innerText);
        }
      }}
    >
      {block.text}
    </div>
  );
}
