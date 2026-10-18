import { useTranslation } from "react-i18next";
import { useAtomValue, useSetAtom } from "jotai";
import { motion } from "motion/react";
import {
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Ungroup,
  MousePointer2,
} from "lucide-react";
import { isLocked } from "@resumi/engine";
import { sessionAtom, selectionAtom, blockAtom } from "../../../state/editor";
import {
  canvasAtom,
  designCommandAtom,
  selectedIdsAtom,
  selectLayersAtom,
} from "../../../state/design";
import { ActionIcon, Button, TextInput } from "../../../ui";
import { ScrollShadow } from "../../../components/ScrollShadow";
import { TypographyFields } from "./TextFormatting";
import {
  ShapeFields,
  ImageFields,
  EffectsFields,
  ShadowFields,
} from "./VisualProperties";
import { FrameProperties } from "./FrameProperties";
import { RichTextField } from "./RichTextField";
import { ContrastProperties } from "./ContrastProperties";
import styles from "../styles/Inspector.module.css";

function SelectedProperties({ id }: { id: string }) {
  const { t } = useTranslation();
  const document = useAtomValue(sessionAtom)!.document;
  const block = useAtomValue(blockAtom(id));
  const ids = useAtomValue(selectedIdsAtom);
  const selection = useAtomValue(selectionAtom);
  const canvas = useAtomValue(canvasAtom);
  const dispatch = useSetAtom(designCommandAtom);
  if (!block?.design || !canvas) return null;
  const layer = block.design;
  const group = canvas.groups.find((item) => item.id === selection?.groupId);
  const locked = ids.some((key) => isLocked(document, key));
  if (locked)
    return (
      <div className={styles.lockedNotice}>
        <Lock size={18} aria-hidden />
        <strong>{t("properties.locked")}</strong>
      </div>
    );
  if (group)
    return (
      <section>
        <h3>{t("properties.group")}</h3>
        <TextInput
          className={styles.fieldRow}
          label={t("properties.name")}
          aria-label={t("properties.groupName")}
          size="xs"
          value={group.name}
          maxLength={120}
          onChange={(event) => {
            if (event.currentTarget.value)
              dispatch({
                type: "group.update",
                id: group.id,
                patch: { name: event.currentTarget.value },
              });
          }}
        />
      </section>
    );
  return (
    <>
      <FrameProperties id={id} />
      {ids.length === 1 && layer.type === "text" && (
        <>
          <section>
            <h3>{t("properties.typography")}</h3>
            <TypographyFields
              id={id}
              layer={layer}
              fonts={canvas.fonts.map((font) => font.name)}
            />
          </section>
          <section>
            <h3>{t("properties.content")}</h3>
            <RichTextField id={id} text={block.text} layer={layer} />
          </section>
          <ContrastProperties id={id} />
        </>
      )}
      {ids.length === 1 && layer.type === "shape" && (
        <ShapeFields id={id} layer={layer} />
      )}
      {ids.length === 1 && layer.type === "image" && (
        <ImageFields id={id} layer={layer} />
      )}
      {ids.length === 1 && layer.type !== "text" && (
        <>
          <ShadowFields id={id} layer={layer} />
          <EffectsFields id={id} layer={layer} />
        </>
      )}
    </>
  );
}

export function DesignInspector() {
  const { t } = useTranslation();
  const document = useAtomValue(sessionAtom)!.document;
  const selection = useAtomValue(selectionAtom);
  const ids = useAtomValue(selectedIdsAtom);
  const canvas = useAtomValue(canvasAtom);
  const dispatch = useSetAtom(designCommandAtom);
  const select = useSetAtom(selectLayersAtom);
  const block = document.blocks[ids[0]];
  const group = canvas?.groups.find((item) => item.id === selection?.groupId);
  const parentGroup = canvas?.groups.find((item) =>
    item.elementIds.includes(ids[0]),
  );
  const locked = ids.some((id) => isLocked(document, id));
  const hidden = !!(
    group?.hidden ||
    block?.design?.hidden ||
    parentGroup?.hidden
  );
  function state(patch: { hidden?: boolean; locked?: boolean }) {
    const inherited =
      parentGroup &&
      ((patch.locked !== undefined &&
        parentGroup.locked &&
        !block?.design?.locked) ||
        (patch.hidden !== undefined &&
          parentGroup.hidden &&
          !block?.design?.hidden));
    if (group || inherited)
      dispatch({ type: "group.update", id: (group ?? parentGroup)!.id, patch });
    else dispatch({ type: "layer.update", ids, patch });
  }
  return (
    <aside
      className={styles.inspector}
      aria-label={t("properties.propertiesInspector")}
    >
      <header className={styles.header}>
        <div className={styles.heading}>
          {block?.design && !group && ids.length === 1 ? (
            <TextInput
              aria-label={t("properties.layerName")}
              size="xs"
              className={styles.headerName}
              maxLength={120}
              value={block.design.name}
              disabled={locked}
              onChange={(event) =>
                dispatch({
                  type: "layer.update",
                  ids,
                  patch: { name: event.currentTarget.value },
                })
              }
            />
          ) : (
            <h2>
              {group?.name ??
                (ids.length > 1
                  ? t("properties.selection")
                  : t("properties.properties"))}
            </h2>
          )}
          <small>
            {group
              ? t("properties.group")
              : ids.length > 1
                ? t("properties.layerCount", { count: ids.length })
                : block?.design
                  ? t(`properties.kind.${block.design.type}`)
                  : ""}
          </small>
        </div>
        {ids.length > 0 && (
          <div className={styles.actions}>
            <ActionIcon
              aria-label={
                hidden
                  ? t("properties.showSelection")
                  : t("properties.hideSelection")
              }
              size="xs"
              variant="subtle"
              color="gray"
              onClick={() => state({ hidden: !hidden })}
            >
              {hidden ? <EyeOff size={14} /> : <Eye size={14} />}
            </ActionIcon>
            <ActionIcon
              aria-label={
                locked
                  ? t("properties.unlockSelection")
                  : t("properties.lockSelection")
              }
              size="xs"
              variant="subtle"
              color="gray"
              aria-pressed={locked}
              onClick={() => state({ locked: !locked })}
            >
              {locked ? <Lock size={14} /> : <Unlock size={14} />}
            </ActionIcon>
            {group && (
              <ActionIcon
                aria-label={t("properties.ungroup")}
                size="xs"
                variant="subtle"
                color="gray"
                disabled={locked}
                onClick={() => {
                  dispatch({ type: "group.ungroup", id: group.id });
                  select({ ids: group.elementIds });
                }}
              >
                <Ungroup size={14} />
              </ActionIcon>
            )}
          </div>
        )}
      </header>
      <ScrollShadow className={styles.scroll}>
        <motion.div
          key={group?.id ?? ids.join(",") ?? "document"}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.16 }}
        >
          {block ? (
            <SelectedProperties id={ids[0]} />
          ) : (
            <div className={styles.emptyProperties}>
              <MousePointer2 size={20} aria-hidden />
              <p>{t("pages.selectLayer")}</p>
            </div>
          )}
          {locked && (
            <Button
              className={styles.unlock}
              size="xs"
              variant="default"
              onClick={() => state({ locked: false })}
            >
              {t("properties.unlock")}
            </Button>
          )}
        </motion.div>
      </ScrollShadow>
    </aside>
  );
}
