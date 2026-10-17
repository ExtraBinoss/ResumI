import { useState } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { renderBlock, resumeCss, resumeStyle } from "@resumi/cv";
import {
  blockAtom,
  sectionAtom,
  sectionIdsAtom,
  selectionAtom,
  styleAtom,
  zoomAtom,
} from "../../state/editor";
import type { Document } from "@resumi/engine";
import styles from "./styles/Legacy.module.css";
import viewportStyles from "./styles/Viewport.module.css";
import { CanvasText } from "./CanvasText";

function CanvasBlock({ id, sectionId }: { id: string; sectionId: string }) {
  const block = useAtomValue(blockAtom(id)),
    select = useSetAtom(selectionAtom);
  const [editing, setEditing] = useState(false);
  if (!block) return null;
  return (
    <div className={styles.editableBlock} data-edit-block={id}>
      {editing ? (
        <CanvasText block={block} finish={() => setEditing(false)} />
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
      className={`${styles.canvasArea} ${viewportStyles.scroll}`}
      onClick={(e) => {
        if (e.currentTarget === e.target) select(null);
      }}
    >
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
            <p className={styles.emptyCanvas}>Add a section.</p>
          )}
        </article>
      </div>
    </div>
  );
}
