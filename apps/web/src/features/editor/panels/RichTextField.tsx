import { useLayoutEffect, useRef } from "react";
import { useSetAtom } from "jotai";
import {
  richTextSegments,
  textStyleAcrossRange,
  type Layer,
  type TextMarkStyle,
} from "@resumi/engine";
import { designCommandAtom, textRangeAtom } from "../../../state/design";
import styles from "../styles/Inspector.module.css";

type TextLayer = Extract<Layer, { type: "text" }>;
function selectionOffsets(root: HTMLElement) {
  const selection = window.getSelection();
  if (!selection?.rangeCount) return null;
  const range = selection.getRangeAt(0);
  if (
    !root.contains(range.startContainer) ||
    !root.contains(range.endContainer)
  )
    return null;
  const prefix = document.createRange();
  prefix.selectNodeContents(root);
  prefix.setEnd(range.startContainer, range.startOffset);
  const suffix = document.createRange();
  suffix.selectNodeContents(root);
  suffix.setEnd(range.endContainer, range.endOffset);
  return { start: prefix.toString().length, end: suffix.toString().length };
}
function restoreSelection(
  root: HTMLElement,
  range: { start: number; end: number },
) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const native = document.createRange();
  let offset = 0,
    startSet = false,
    node = walker.nextNode();
  while (node) {
    const length = node.textContent?.length ?? 0;
    if (!startSet && range.start <= offset + length) {
      native.setStart(node, Math.max(0, range.start - offset));
      startSet = true;
    }
    if (range.end <= offset + length) {
      if (!startSet) native.setStart(node, 0);
      native.setEnd(node, Math.max(0, range.end - offset));
      window.getSelection()?.removeAllRanges();
      window.getSelection()?.addRange(native);
      return;
    }
    offset += length;
    node = walker.nextNode();
  }
}

/** Reconcile external commands into the DOM without replacing the caret on local keystrokes. */
export function RichTextField({
  id,
  text,
  layer,
}: {
  id: string;
  text: string;
  layer: TextLayer;
}) {
  const editor = useRef<HTMLDivElement>(null);
  const pending = useRef<string | null>(null);
  const composing = useRef(false);
  const dispatch = useSetAtom(designCommandAtom);
  const setRange = useSetAtom(textRangeAtom);
  useLayoutEffect(() => {
    const root = editor.current;
    if (!root || composing.current) return;
    if (pending.current === text) {
      pending.current = null;
      return;
    }
    const range = selectionOffsets(root);
    const nodes = richTextSegments(text, layer.marks).map((segment) => {
      const span = document.createElement("span");
      const style = { ...layer, ...segment.style };
      span.textContent = segment.text;
      Object.assign(span.style, {
        fontFamily: "var(--font-ui)",
        fontSize: "14px",
        fontWeight: String(style.fontWeight),
        fontStyle: style.fontStyle,
        color: "inherit",
        textDecoration:
          [
            style.underline ? "underline" : "",
            style.strike ? "line-through" : "",
          ]
            .filter(Boolean)
            .join(" ") || "none",
      });
      if (segment.style.href) span.title = segment.style.href;
      return span;
    });
    root.replaceChildren(...nodes);
    if (range) restoreSelection(root, range);
  }, [text, layer]);
  function capture() {
    const root = editor.current;
    const range = root && selectionOffsets(root);
    if (range) setRange({ id, ...range });
  }
  function sync() {
    const root = editor.current;
    if (!root || composing.current) return;
    const value = root.textContent ?? "";
    if (value.length > 20000) {
      root.textContent = text;
      return;
    }
    pending.current = value;
    dispatch({ type: "block.update", id, patch: { text: value } });
    capture();
  }
  function insert(value: string) {
    const root = editor.current;
    const selection = window.getSelection();
    if (!root || !selection?.rangeCount) return;
    const range = selection.getRangeAt(0);
    if (!root.contains(range.commonAncestorContainer)) return;
    range.deleteContents();
    const node = document.createTextNode(value);
    range.insertNode(node);
    range.setStartAfter(node);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
    sync();
  }
  return (
    <div className={styles.stackedField}>
      <span>Text</span>
      <div
        ref={editor}
        data-edit-field={id}
        className={styles.richEditor}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-label="Content"
        aria-multiline
        spellCheck
        style={{
          fontFamily: "var(--font-ui)",
          fontSize: 14,
          lineHeight: 1.5,
        }}
        onFocus={capture}
        onInput={sync}
        onKeyUp={capture}
        onPointerUp={capture}
        onCompositionStart={() => {
          composing.current = true;
        }}
        onCompositionEnd={() => {
          composing.current = false;
          sync();
        }}
        onKeyDown={(event) => {
          event.stopPropagation();
          const key = event.key.toLowerCase();
          if (
            (event.ctrlKey || event.metaKey) &&
            ["b", "i", "u", "k"].includes(key)
          ) {
            event.preventDefault();
            if (key === "k") {
              event.currentTarget
                .closest("aside")
                ?.querySelector<HTMLButtonElement>(
                  '[aria-label="Add link to selection"]',
                )
                ?.click();
              return;
            }
            const root = editor.current;
            const range = root && selectionOffsets(root);
            const selected = range && range.end > range.start;
            const current = selected
              ? textStyleAcrossRange(
                  text,
                  layer.marks,
                  range.start,
                  range.end,
                  layer,
                ).style
              : layer;
            const style: TextMarkStyle =
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
                id,
                markId: crypto.randomUUID(),
                start: range.start,
                end: range.end,
                style,
              });
            else dispatch({ type: "layer.update", ids: [id], patch: style });
            return;
          }
          if (event.key === "Escape") {
            event.preventDefault();
            event.currentTarget.blur();
          }
          if (event.key === "Enter" && !event.ctrlKey && !event.metaKey) {
            event.preventDefault();
            insert("\n");
          }
        }}
        onPaste={(event) => {
          event.preventDefault();
          insert(event.clipboardData.getData("text/plain"));
        }}
      />
    </div>
  );
}
