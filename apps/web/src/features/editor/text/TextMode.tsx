import { useAtomValue, useSetAtom, useStore, atom } from "jotai";
import { selectAtom } from "jotai/utils";
import type { CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import { ZoomViewport } from "../../canvas/ZoomViewport";
import { ActionIcon, Tooltip } from "../../../ui";
import { Lock, RotateCcw } from "lucide-react";
import { RichTextField } from "../panels/RichTextField";
import { ScrollShadow } from "../../../components/ScrollShadow";
import layout from "../styles/TextFields.module.css";
import { isLocked, localizedBlock, makeLayer } from "@resumi/engine";
import {
  canvasAtom,
  selectLayersAtom,
  selectedIdsAtom,
  designCommandAtom,
} from "../../../state/design";
import {
  sessionAtom,
  blockAtom,
  localeAtom,
  documentLanguagesAtom,
  zoomAtom,
} from "../../../state/editor";
import { TextFormatting } from "../panels/TextFormatting";
import { DocumentLanguages } from "./DocumentLanguages";
import styles from "../styles/Text.module.css";
const idleTextLayer = makeLayer("text");
const wordCountAtom = atom((get) =>
  Object.keys(get(sessionAtom)?.document.blocks ?? {})
    .map((id) => localizedBlock(get(sessionAtom)!.document, id))
    .filter((block) => block.design?.type === "text")
    .reduce(
      (count, block) =>
        count + block.text.trim().split(/\s+/).filter(Boolean).length,
      0,
    ),
);
const translationProgressAtom = selectAtom(
  sessionAtom,
  (session) => {
    const doc = session?.document;
    const texts = Object.values(doc?.blocks ?? {}).filter(
      (block) => !["image", "shape"].includes(block.kind),
    );
    const locale = doc?.localization?.activeLocale ?? "en";
    return {
      translated: texts.filter((block) => block.translations?.[locale]).length,
      total: texts.length,
    };
  },
  (a, b) => a.translated === b.translated && a.total === b.total,
);
function TextEntry({ id }: { id: string }) {
  const { t } = useTranslation();
  const localization = useAtomValue(documentLanguagesAtom);
  const dispatch = useSetAtom(designCommandAtom);
  const canvas = useAtomValue(canvasAtom);
  const block = useAtomValue(blockAtom(id)),
    select = useSetAtom(selectLayersAtom),
    store = useStore();
  if (!block || block.design?.type !== "text") return null;
  const layer = block.design,
    locked =
      isLocked(store.get(sessionAtom)!.document, id) ||
      !!canvas?.groups.find(
        (group) => group.locked && group.elementIds.includes(id),
      );
  return (
    <div className={styles.copyBlock}>
      <span className={styles.copyMeta} title={layer.name}>
        {layer.name}
        <small>
          {locked ? (
            <>
              <Lock size={12} aria-hidden /> {t("editor.locked")}
            </>
          ) : layer.hidden ? (
            t("editor.hidden")
          ) : layer.marks.some((mark) => mark.href) ? (
            t("editor.linked")
          ) : localization.activeLocale !== localization.baseLocale &&
            !block.translations?.[localization.activeLocale] ? (
            t("languages.fallback")
          ) : null}
        </small>
      </span>
      <div>
        <RichTextField
          id={id}
          text={block.text}
          layer={layer}
          showLabel={false}
          className={styles.copyInput}
          ariaLabel={t("workspace.text.content", { name: layer.name })}
          readOnly={locked}
          onFocus={() => select({ ids: [id] })}
        />
      </div>
      {localization.activeLocale !== localization.baseLocale &&
        block.translations?.[localization.activeLocale] &&
        !locked && (
          <Tooltip label={t("languages.reset")}>
            <ActionIcon
              className={styles.resetTranslation}
              variant="subtle"
              aria-label={`${t("languages.reset")}: ${layer.name}`}
              onClick={() =>
                dispatch({
                  type: "translation.remove",
                  id,
                  locale: localization.activeLocale,
                })
              }
            >
              <RotateCcw size={14} aria-hidden />
            </ActionIcon>
          </Tooltip>
        )}
    </div>
  );
}
function ActiveFormatting({ id }: { id: string | undefined }) {
  const { t } = useTranslation();
  const block = useAtomValue(blockAtom(id ?? ""));
  const store = useStore();
  const canvas = useAtomValue(canvasAtom);
  const layer = block?.design?.type === "text" ? block.design : idleTextLayer;
  if (layer.type !== "text") return null;
  const enabled =
    !!id &&
    block?.design?.type === "text" &&
    !isLocked(store.get(sessionAtom)!.document, id) &&
    !canvas?.groups.some(
      (group) => group.locked && group.elementIds.includes(id),
    );
  return (
    <fieldset
      className={styles.formatFields}
      disabled={!enabled}
      aria-label={t("properties.typography")}
    >
      <TextFormatting id={enabled ? id : ""} layer={layer} />
    </fieldset>
  );
}
export function TextMode() {
  const { t } = useTranslation();
  const locale = useAtomValue(localeAtom);
  const canvas = useAtomValue(canvasAtom),
    selected = useAtomValue(selectedIdsAtom),
    words = useAtomValue(wordCountAtom);
  const localization = useAtomValue(documentLanguagesAtom);
  const progress = useAtomValue(translationProgressAtom);
  const zoom = useAtomValue(zoomAtom);
  if (!canvas) return null;
  return (
    <div
      className={styles.textWorkspace}
      style={{ "--text-scale": zoom / 100 } as CSSProperties}
    >
      <header
        className={styles.copyToolbar}
        role="toolbar"
        aria-label={t("workspace.text.tools")}
      >
        <ActiveFormatting id={selected[0]} />
        <DocumentLanguages />
      </header>
      <ZoomViewport width={canvas.width} height={canvas.height}>
        <article
          className={styles.copyEditor}
          aria-label={t("workspace.text.workspace")}
          lang={locale}
        >
          <div className={styles.toolbarSpace} aria-hidden />
          <ScrollShadow
            className={layout.scroll}
            viewportClassName={styles.copyScroll}
            contentClassName={styles.copyList}
          >
            {canvas.order.length ? (
              canvas.order.map((id) => <TextEntry key={id} id={id} />)
            ) : (
              <p className={styles.textEmpty}>{t("editor.addText")}</p>
            )}
          </ScrollShadow>
          <footer>
            <span>{t("editor.words", { count: words })}</span>
            {localization.activeLocale !== localization.baseLocale && (
              <span title={t("languages.hint")}>
                {t("languages.progress", progress)}
              </span>
            )}
          </footer>
        </article>
      </ZoomViewport>
    </div>
  );
}
