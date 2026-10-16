import { useAtomValue, useSetAtom, useStore, atom } from "jotai";
import { Lock } from "lucide-react";
import { isLocked, richTextSegments } from "@resumi/engine";
import {
  canvasAtom,
  designCommandAtom,
  selectLayersAtom,
  textRangeAtom,
  selectedIdsAtom,
} from "../state/design";
import { sessionAtom, blockAtom } from "../state/editor";
import { TextFormatting } from "./TextFormatting";
import styles from "../styles/Design.module.css";
const wordCountAtom = atom((get) =>
  Object.values(get(sessionAtom)?.document.blocks ?? {})
    .filter((block) => block.design?.type === "text")
    .reduce(
      (count, block) =>
        count + block.text.trim().split(/\s+/).filter(Boolean).length,
      0,
    ),
);
function TextEntry({ id }: { id: string }) {
  const canvas = useAtomValue(canvasAtom);
  const block = useAtomValue(blockAtom(id)),
    dispatch = useSetAtom(designCommandAtom),
    select = useSetAtom(selectLayersAtom),
    setRange = useSetAtom(textRangeAtom),
    store = useStore();
  if (!block || block.design?.type !== "text") return null;
  const layer = block.design,
    locked =
      isLocked(store.get(sessionAtom)!.document, id) ||
      !!canvas?.groups.find(
        (group) => group.locked && group.elementIds.includes(id),
      );
  return (
    <label className={styles.copyBlock}>
      <span className={styles.copyMeta}>
        {layer.name}
        <small>
          {locked ? (
            <>
              <Lock size={9} /> Locked
            </>
          ) : layer.hidden ? (
            "Hidden on canvas"
          ) : layer.marks.some((mark) => mark.href) ? (
            "Linked text"
          ) : (
            "Text layer"
          )}
        </small>
      </span>
      <div>
        <textarea
          className={styles.copyInput}
          aria-label={`Text content: ${layer.name}`}
          value={block.text}
          readOnly={locked}
          rows={Math.min(
            9,
            Math.max(
              1,
              block.text.split("\n").length +
                Math.floor(block.text.length / 50),
            ),
          )}
          maxLength={20000}
          style={{
            fontFamily: layer.fontFamily,
            fontSize: Math.min(layer.fontSize, 28),
            fontWeight: layer.fontWeight,
            fontStyle: layer.fontStyle,
            lineHeight: layer.lineHeight,
            letterSpacing: layer.letterSpacing,
            color: layer.color,
            textAlign: layer.align,
            textDecoration: [
              layer.underline ? "underline" : "",
              layer.strike ? "line-through" : "",
            ].join(" "),
          }}
          onFocus={() => select({ ids: [id] })}
          onSelect={(e) => {
            const node = e.currentTarget;
            setRange({
              id,
              start: node.selectionStart,
              end: node.selectionEnd,
            });
          }}
          onChange={(e) =>
            dispatch({
              type: "block.update",
              id,
              patch: { text: e.currentTarget.value },
            })
          }
        />
        {layer.marks.length > 0 && (
          <div
            style={{
              fontSize: 11,
              whiteSpace: "pre-wrap",
              padding: "4px 7px",
              color: "#78786e",
            }}
            aria-label={`Formatted preview: ${layer.name}`}
          >
            {richTextSegments(block.text, layer.marks).map((segment) => (
              <span
                key={segment.start}
                style={{
                  fontWeight: segment.style.fontWeight,
                  fontStyle: segment.style.fontStyle,
                  color: segment.style.color,
                  textDecoration: segment.style.underline
                    ? "underline"
                    : segment.style.strike
                      ? "line-through"
                      : undefined,
                }}
              >
                {segment.text}
              </span>
            ))}
          </div>
        )}
      </div>
    </label>
  );
}
function ActiveFormatting({ id }: { id: string }) {
  const block = useAtomValue(blockAtom(id));
  return block?.design?.type === "text" ? (
    <TextFormatting id={id} layer={block.design} />
  ) : null;
}
export function TextMode() {
  const canvas = useAtomValue(canvasAtom),
    selected = useAtomValue(selectedIdsAtom),
    words = useAtomValue(wordCountAtom);
  if (!canvas) return null;
  return (
    <div className={styles.textViewport}>
      <article className={styles.copyEditor} aria-label="Text workspace">
        <header className={styles.copyToolbar}>
          {selected[0] ? (
            <ActiveFormatting id={selected[0]} />
          ) : (
            <strong>Make every word count.</strong>
          )}
          <span>Layout stays in sync</span>
        </header>
        <div className={styles.copyList}>
          {canvas.order.length ? (
            canvas.order.map((id) => <TextEntry key={id} id={id} />)
          ) : (
            <p className={styles.textEmpty}>
              Add your first text block in Visual mode.
            </p>
          )}
        </div>
        <footer>{words} words · same content, same history</footer>
      </article>
    </div>
  );
}
