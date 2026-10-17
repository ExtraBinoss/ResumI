import { useEffect, useLayoutEffect, useRef, type CSSProperties } from "react";
import {
  richTextSegments,
  localizedBlock,
  textStyleAcrossRange,
  type Block,
  type TextMarkStyle,
} from "@resumi/engine";
import { useSetAtom, useStore } from "jotai";
import { designCommandAtom, textRangeAtom } from "../../state/design";
import { selectionAtom, sessionAtom } from "../../state/editor";
import { selectionOffsets, restoreSelection } from "../../lib/text-selection";

/** The actual text remains editable, including range marks, in its original frame. */
export function CanvasText({
  block,
  finish,
}: {
  block: Block;
  finish: () => void;
}) {
  const input = useRef<HTMLDivElement>(null),
    pending = useRef<string | null>(null),
    composing = useRef(false),
    dispatch = useSetAtom(designCommandAtom),
    setRange = useSetAtom(textRangeAtom),
    store = useStore();
  const layer = block.design;
  useLayoutEffect(() => {
    const root = input.current;
    if (!root || composing.current) return;
    if (pending.current === block.text) {
      pending.current = null;
      return;
    }
    const range = selectionOffsets(root);
    const spans = richTextSegments(
      block.text,
      layer?.type === "text" ? layer.marks : [],
    ).map((segment) => {
      const span = document.createElement("span");
      span.textContent = segment.text;
      const style =
        layer?.type === "text" ? { ...layer, ...segment.style } : segment.style;
      Object.assign(span.style, {
        fontFamily: style.fontFamily ?? "inherit",
        fontSize: style.fontSize ? `${style.fontSize}px` : "inherit",
        fontWeight: style.fontWeight ? String(style.fontWeight) : "inherit",
        fontStyle: style.fontStyle ?? "inherit",
        color: style.color ?? "inherit",
        textDecoration:
          style.underline || style.strike
            ? [style.underline && "underline", style.strike && "line-through"]
                .filter(Boolean)
                .join(" ")
            : "inherit",
      });
      if (style.href) span.title = style.href;
      return span;
    });
    root.replaceChildren(...spans);
    if (range) restoreSelection(root, range);
  }, [block.text, layer]);
  useEffect(() => {
    const node = input.current;
    if (!node) return;
    node.focus({ preventScroll: true });
    const selection = window.getSelection(),
      range = document.createRange();
    range.selectNodeContents(node);
    selection?.removeAllRanges();
    selection?.addRange(range);
    setRange({ id: block.id, start: 0, end: node.textContent?.length ?? 0 });
  }, [block.id, setRange]);
  useEffect(
    () =>
      store.sub(selectionAtom, () => {
        const selected = store.get(selectionAtom);
        if (
          selected?.blockId !== block.id ||
          (selected.blockIds?.length ?? 1) !== 1
        ) {
          input.current?.blur();
          finish();
        }
      }),
    [block.id, finish, store],
  );
  if (layer && layer.type !== "text") return null;
  function capture() {
    const range = input.current && selectionOffsets(input.current);
    if (range) setRange({ id: block.id, ...range });
  }
  function sync() {
    const node = input.current;
    if (!node || composing.current) return;
    const value = node.textContent ?? "";
    if (value.length > 20000) {
      node.textContent = block.text;
      return;
    }
    const snapshot = store.get(sessionAtom)?.document;
    if (
      snapshot?.blocks[block.id] &&
      value !== localizedBlock(snapshot, block.id).text
    ) {
      pending.current = value;
      dispatch({ type: "block.update", id: block.id, patch: { text: value } });
    }
    capture();
  }
  function insert(value: string) {
    const selection = window.getSelection(),
      node = input.current;
    if (!node || !selection?.rangeCount) return;
    const range = selection.getRangeAt(0);
    if (!node.contains(range.commonAncestorContainer)) return;
    range.deleteContents();
    const text = document.createTextNode(value);
    range.insertNode(text);
    range.setStartAfter(text);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
    sync();
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
        textDecoration: "none",
      }
    : { outline: "none", background: "transparent", cursor: "text" };
  return (
    <div
      ref={input}
      role="textbox"
      className={!layer ? `resume-block resume-${block.kind}` : undefined}
      aria-label="Edit text on canvas"
      aria-multiline="true"
      contentEditable
      suppressContentEditableWarning
      spellCheck
      style={style}
      onPointerDown={(event) => {
        if (!event.ctrlKey && !event.metaKey) event.stopPropagation();
      }}
      onPointerUp={capture}
      onKeyUp={capture}
      onInput={sync}
      onCompositionStart={() => {
        composing.current = true;
      }}
      onCompositionEnd={() => {
        composing.current = false;
        sync();
      }}
      onBlur={() => {
        sync();
        finish();
      }}
      onKeyDown={(event) => {
        event.stopPropagation();
        const key = event.key.toLowerCase();
        if (
          (event.ctrlKey || event.metaKey) &&
          ["b", "i", "u"].includes(key) &&
          layer
        ) {
          event.preventDefault();
          capture();
          const range = input.current && selectionOffsets(input.current),
            selected = range && range.end > range.start;
          const current = selected
            ? textStyleAcrossRange(
                block.text,
                layer.marks,
                range.start,
                range.end,
                layer,
              ).style
            : layer;
          const patch: TextMarkStyle =
            key === "b"
              ? { fontWeight: (current.fontWeight ?? 400) >= 600 ? 400 : 700 }
              : key === "i"
                ? {
                    fontStyle:
                      current.fontStyle === "italic" ? "normal" : "italic",
                  }
                : { underline: !current.underline };
          if (selected)
            dispatch({
              type: "text.range.format",
              id: block.id,
              markId: crypto.randomUUID(),
              ...range,
              style: patch,
            });
          else dispatch({ type: "layer.update", ids: [block.id], patch });
        } else if (
          event.key === "Escape" ||
          (event.key === "Enter" && (event.ctrlKey || event.metaKey))
        ) {
          event.preventDefault();
          event.currentTarget.blur();
        } else if (event.key === "Enter") {
          event.preventDefault();
          insert("\n");
        }
      }}
      onPaste={(event) => {
        event.preventDefault();
        insert(event.clipboardData.getData("text/plain"));
      }}
    />
  );
}
