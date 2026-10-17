import { useAtomValue, useSetAtom } from "jotai";
import { motion } from "motion/react";
import {
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Ungroup,
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
import { DocumentProperties } from "./DocumentProperties";
import { FrameProperties } from "./FrameProperties";
import { RichTextField } from "./RichTextField";
import { ContrastProperties } from "./ContrastProperties";
import styles from "../styles/Inspector.module.css";

function SelectedProperties({ id }: { id: string }) {
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
        <strong>Locked</strong>
      </div>
    );
  if (group)
    return (
      <section>
        <h3>Group</h3>
        <div className={styles.fieldRow}>
          <label>Name</label>
          <TextInput
            aria-label="Group name"
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
        </div>
        <div className={styles.fieldRow}>
          <span>Layers</span>
          <span className={styles.formatStatic}>{group.elementIds.length}</span>
        </div>
      </section>
    );
  return (
    <>
      <FrameProperties id={id} />
      {ids.length === 1 && layer.type === "text" && (
        <>
          <section>
            <h3>Typography</h3>
            <TypographyFields
              id={id}
              layer={layer}
              fonts={canvas.fonts.map((font) => font.name)}
            />
          </section>
          <section>
            <h3>Content</h3>
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
  function move(forward: boolean) {
    if (!canvas || locked) return;
    const selected = new Set(group?.elementIds ?? ids);
    const positions = canvas.order
      .map((id, index) => (selected.has(id) ? index : -1))
      .filter((index) => index >= 0);
    const index = forward
      ? Math.max(...positions) + 1
      : Math.min(...positions) - 1;
    const targetId = canvas.order[index];
    if (!targetId) return;
    const targetGroup = canvas.groups.find((item) =>
      item.elementIds.includes(targetId),
    );
    dispatch({
      type: "layer.relocate",
      source: { kind: group ? "group" : "element", id: group?.id ?? ids[0] },
      target: {
        kind: targetGroup ? "group" : "element",
        id: targetGroup?.id ?? targetId,
      },
      placement: forward ? "above" : "below",
    });
  }
  return (
    <aside className={styles.inspector} aria-label="Properties inspector">
      <header className={styles.header}>
        <div className={styles.heading}>
          {block?.design && !group && ids.length === 1 ? (
            <TextInput
              aria-label="Layer name"
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
              {group?.name ?? (ids.length > 1 ? "Selection" : "Document")}
            </h2>
          )}
          <small>
            {group
              ? "group"
              : ids.length > 1
                ? `${ids.length} layers`
                : (block?.design?.type ?? "A4")}
          </small>
        </div>
        {ids.length > 0 && (
          <div className={styles.actions}>
            {!group && ids.length === 1 && (
              <>
                <ActionIcon
                  aria-label="Move layer backward"
                  size="xs"
                  variant="subtle"
                  color="gray"
                  disabled={locked}
                  onClick={() => move(false)}
                >
                  <ChevronDown size={15} />
                </ActionIcon>
                <ActionIcon
                  aria-label="Move layer forward"
                  size="xs"
                  variant="subtle"
                  color="gray"
                  disabled={locked}
                  onClick={() => move(true)}
                >
                  <ChevronUp size={15} />
                </ActionIcon>
              </>
            )}
            <ActionIcon
              aria-label={hidden ? "Show selection" : "Hide selection"}
              size="xs"
              variant="subtle"
              color="gray"
              onClick={() => state({ hidden: !hidden })}
            >
              {hidden ? <EyeOff size={14} /> : <Eye size={14} />}
            </ActionIcon>
            <ActionIcon
              aria-label={locked ? "Unlock selection" : "Lock selection"}
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
                aria-label="Ungroup"
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
          {block ? <SelectedProperties id={ids[0]} /> : <DocumentProperties />}
          {locked && (
            <Button
              className={styles.unlock}
              size="xs"
              variant="default"
              onClick={() => state({ locked: false })}
            >
              Unlock
            </Button>
          )}
        </motion.div>
      </ScrollShadow>
    </aside>
  );
}
