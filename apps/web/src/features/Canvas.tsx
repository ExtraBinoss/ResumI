import { useState } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { renderBlock, resumeCss, resumeStyle } from "@resumi/cv";
import {
  blockAtom,
  commandAtom,
  sectionAtom,
  sectionIdsAtom,
  selectionAtom,
  styleAtom,
  zoomAtom,
} from "../state/editor";
import type { Document } from "@resumi/engine";
import styles from "../styles/Editor.module.css";

function CanvasBlock({ id, sectionId }: { id: string; sectionId: string }) {
  const block = useAtomValue(blockAtom(id)),
    dispatch = useSetAtom(commandAtom),
    select = useSetAtom(selectionAtom);
  const [editing, setEditing] = useState(false);
  if (!block) return null;
  function commit(text: string) {
    if (text !== block!.text)
      dispatch({ type: "block.update", id, patch: { text } });
    setEditing(false);
  }
  return (
    <div className={styles.editableBlock} data-edit-block={id}>
      {editing ? (
        <textarea
          aria-label="Edit text on canvas"
          className={styles.directInput}
          defaultValue={block.text}
          autoFocus
          onFocus={(e) => {
            const node = e.currentTarget;
            node.selectionStart = node.selectionEnd = node.value.length;
          }}
          onBlur={(e) => commit(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setEditing(false);
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey))
              commit(e.currentTarget.value);
          }}
        />
      ) : (
        <div
          tabIndex={0}
          role="button"
          aria-label={`Edit ${block.kind}: ${block.text.slice(0, 45)}`}
          onClick={(e) => {
            e.stopPropagation();
            select({ sectionId, blockId: id });
          }}
          onDoubleClick={() => setEditing(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              select({ sectionId, blockId: id });
              setEditing(true);
            }
          }}
          dangerouslySetInnerHTML={{ __html: renderBlock(block) }}
        />
      )}
    </div>
  );
}
function CanvasSection({ id }: { id: string }) {
  const section = useAtomValue(sectionAtom(id)),
    selected = useAtomValue(selectionAtom),
    select = useSetAtom(selectionAtom);
  if (!section) return null;
  return (
    <section
      className={`resume-section ${styles.canvasSection} ${selected?.sectionId === id ? styles.selected : ""}`}
      data-section-id={id}
      onClick={() => select({ sectionId: id })}
    >
      {section.title && <h2 className="resume-title">{section.title}</h2>}
      {section.blockIds.map((blockId) => (
        <CanvasBlock key={blockId} id={blockId} sectionId={id} />
      ))}
    </section>
  );
}
export function Canvas() {
  const ids = useAtomValue(sectionIdsAtom),
    style = useAtomValue(styleAtom),
    zoom = useAtomValue(zoomAtom),
    select = useSetAtom(selectionAtom);
  return (
    <div
      className={styles.canvasArea}
      onClick={(e) => {
        if (e.currentTarget === e.target) select(null);
      }}
    >
      <div className={styles.canvasHint}>
        Double-click any text to edit <span>·</span> A4 / 210 × 297 mm
      </div>
      <style>{resumeCss}</style>
      <div
        className={styles.pageBounds}
        style={{ width: (794 * zoom) / 100, minHeight: (1123 * zoom) / 100 }}
      >
        <article
          aria-label="Resume canvas"
          className={`resume ${styles.canvasPaper}`}
          style={{ ...resumeStyle({ style } as Document), zoom: zoom / 100 }}
        >
          {ids.length ? (
            ids.map((id) => <CanvasSection key={id} id={id} />)
          ) : (
            <p className={styles.emptyCanvas}>
              Your story starts with a section. Add one from the outline.
            </p>
          )}
        </article>
      </div>
      <p className={styles.canvasFoot}>
        Real text. Thoughtful details. All yours.
      </p>
    </div>
  );
}
