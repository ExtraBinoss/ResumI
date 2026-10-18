import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { renderBlock, resumeCss, resumeStyle } from "@resumi/cv/renderer";
import {
  blockAtom,
  sectionAtom,
  sectionIdsAtom,
  selectionAtom,
  styleAtom,
  localeAtom,
} from "../../state/editor";
import type { Document } from "@resumi/engine";
import styles from "./styles/Legacy.module.css";
import { ZoomViewport } from "./ZoomViewport";
import { CanvasText } from "./CanvasText";

function CanvasBlock({ id, sectionId }: { id: string; sectionId: string }) {
  const { t } = useTranslation();
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
          aria-label={t("properties.editText", {
            kind: t(`properties.kind.${block.kind}`),
            text: block.text.slice(0, 45),
          })}
          onClick={(e) => {
            e.stopPropagation();
            select({ sectionId, blockId: id });
          }}
          onDoubleClick={() => setEditing(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              e.stopPropagation();
              select({ sectionId, blockId: id });
              if (e.key === "Enter") setEditing(true);
            }
          }}
          dangerouslySetInnerHTML={{ __html: renderBlock(block) }}
        />
      )}
    </div>
  );
}
function CanvasSection({ id }: { id: string }) {
  const { t } = useTranslation();
  const section = useAtomValue(sectionAtom(id)),
    selected = useAtomValue(selectionAtom),
    select = useSetAtom(selectionAtom);
  if (!section) return null;
  return (
    <section
      className={`resume-section ${styles.canvasSection} ${selected?.sectionId === id ? styles.selected : ""}`}
      data-section-id={id}
      role="group"
      aria-label={section.title || t("properties.section")}
    >
      {section.title ? (
        <h2 className="resume-title">
          <button
            type="button"
            className={styles.sectionHeading}
            aria-pressed={selected?.sectionId === id}
            onClick={() => select({ sectionId: id })}
          >
            {section.title}
          </button>
        </h2>
      ) : (
        <button
          type="button"
          className="srOnly"
          aria-pressed={selected?.sectionId === id}
          onClick={() => select({ sectionId: id })}
        >
          {t("properties.section")}
        </button>
      )}
      {section.blockIds.map((blockId) => (
        <CanvasBlock key={blockId} id={blockId} sectionId={id} />
      ))}
    </section>
  );
}
export function Canvas() {
  const { t } = useTranslation();
  const ids = useAtomValue(sectionIdsAtom),
    style = useAtomValue(styleAtom),
    locale = useAtomValue(localeAtom),
    select = useSetAtom(selectionAtom);
  return (
    <ZoomViewport height={1123} onBlankClick={() => select(null)}>
      <style>{resumeCss}</style>
      <article
        aria-label={t("properties.canvas")}
        lang={locale}
        className={`resume ${styles.canvasPaper}`}
        style={resumeStyle({ style } as Document)}
      >
        {ids.length ? (
          ids.map((id) => <CanvasSection key={id} id={id} />)
        ) : (
          <p className={styles.emptyCanvas}>{t("properties.emptyCanvas")}</p>
        )}
      </article>
    </ZoomViewport>
  );
}
