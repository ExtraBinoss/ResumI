import { useTranslation } from "react-i18next";
import { useLayoutEffect, useRef } from "react";
import { useSetAtom, useStore } from "jotai";
import {
  richTextSegments,
  localizedBlock,
  textStyleAcrossRange,
  type Layer,
  type TextMarkStyle,
} from "@resumi/engine";
import { sessionAtom } from "../../../state/editor";
import { designCommandAtom, textRangeAtom } from "../../../state/design";
import {
  selectionOffsets,
  restoreSelection,
} from "../../../lib/text-selection";
import styles from "../styles/Inspector.module.css";

type TextLayer = Extract<Layer, { type: "text" }>;
/** Reconcile external commands into the DOM without replacing the caret on local keystrokes. */
export function RichTextField({
  id,
  text,
  layer,
  ariaLabel,
  className,
  showLabel = true,
  readOnly = false,
  onFocus,
}: {
  id: string;
  text: string;
  layer: TextLayer;
  ariaLabel?: string;
  className?: string;
  showLabel?: boolean;
  readOnly?: boolean;
  onFocus?: () => void;
}) {
  const { t } = useTranslation();
  const actualAriaLabel = ariaLabel ?? t("properties.content");
  const editor = useRef<HTMLDivElement>(null);
  const pending = useRef<string | null>(null);
  const composing = useRef(false);
  const dispatch = useSetAtom(designCommandAtom);
  const store = useStore();
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
    const snapshot = store.get(sessionAtom)?.document;
    if (snapshot?.blocks[id] && value !== localizedBlock(snapshot, id).text) {
      pending.current = value;
      dispatch({ type: "block.update", id, patch: { text: value } });
    }
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
      {showLabel && <span>{t("properties.textLabel")}</span>}
      <div
        ref={editor}
        data-edit-field={id}
        className={className ?? styles.richEditor}
        contentEditable={!readOnly}
        suppressContentEditableWarning
        role="textbox"
        aria-label={actualAriaLabel}
        aria-readonly={readOnly || undefined}
        aria-multiline
        spellCheck
        style={{
          fontFamily: "var(--font-ui)",
          fontSize: 14,
          lineHeight: 1.5,
        }}
        onFocus={() => {
          onFocus?.();
          capture();
        }}
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
          if (readOnly || composing.current || event.nativeEvent.isComposing)
            return;
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
