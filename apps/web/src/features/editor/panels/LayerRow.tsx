import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useTranslation } from "react-i18next";
import { useAtomValue, useSetAtom, useStore } from "jotai";
import { ActionIcon, Menu, TextInput } from "../../../ui";
import { Shortcut } from "../../../components/Shortcut";
import {
  Type,
  Image,
  Square,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Group,
  Ungroup,
  Copy,
  Trash2,
  ArrowUpToLine,
  ArrowDownToLine,
  MoreHorizontal,
} from "lucide-react";
import type { LayerReference, LayerGroup } from "@resumi/engine";
import {
  designCommandAtom,
  selectedIdsAtom,
  selectLayerAtom,
  selectLayersAtom,
  groupSelectionAtom,
  duplicateSelectionAtom,
  deleteSelectionAtom,
} from "../../../state/design";
import { blockAtom, selectionAtom } from "../../../state/editor";
import type { LayerDragBinding } from "./useLayerReorder";
import styles from "../styles/Composition.module.css";
export function LayerRow({
  id,
  group,
  drag,
}: {
  id: string;
  group?: LayerGroup;
  drag: LayerDragBinding;
}) {
  const { t } = useTranslation();
  const reduced = useReducedMotion();
  const { onDragStart, ...dragBinding } = drag;
  const block = useAtomValue(blockAtom(id)),
    selected = useAtomValue(selectedIdsAtom),
    selection = useAtomValue(selectionAtom),
    dispatch = useSetAtom(designCommandAtom),
    select = useSetAtom(selectLayersAtom),
    selectLayer = useSetAtom(selectLayerAtom),
    store = useStore();
  const [renaming, setRenaming] = useState(false),
    [draftName, setDraftName] = useState("");
  if (!block?.design) return null;
  const layer = block.design,
    ref: LayerReference = { kind: "element", id },
    locked = layer.locked || group?.locked,
    active = selected.includes(id);
  return (
    <motion.div
      layout="position"
      initial={false}
      transition={{
        layout: reduced
          ? { duration: 0 }
          : { type: "spring", stiffness: 650, damping: 45 },
      }}
      className={`${styles.layerRow} ${active ? styles.active : ""} ${group ? styles.member : ""}`}
      data-layer-row={id}
      {...dragBinding}
      onDragStartCapture={onDragStart}
      onPointerDown={locked ? undefined : dragBinding.onPointerDown}
      data-layer-reorder-locked={String(!!locked)}
      draggable={!locked && drag.draggable}
    >
      <div
        role="button"
        tabIndex={0}
        className={styles.layerName}
        data-layer-drag-handle
        aria-label={t("layers.selectLayer", { name: layer.name })}
        aria-pressed={active}
        onClick={(event) =>
          selectLayer({
            id,
            additive: event.shiftKey || event.ctrlKey || event.metaKey,
            wholeGroup: false,
            preserveSelection: false,
          })
        }
        onKeyDown={(event) => {
          if ((event.key === "Enter" || event.key === " ") && !renaming) {
            event.preventDefault();
            selectLayer({
              id,
              additive: event.shiftKey || event.ctrlKey || event.metaKey,
              wholeGroup: false,
              preserveSelection: false,
            });
          }
        }}
        onDoubleClick={() => {
          setDraftName(layer.name);
          setRenaming(true);
        }}
      >
        {layer.type === "text" ? (
          <Type size={13} />
        ) : layer.type === "image" ? (
          <Image size={13} />
        ) : (
          <Square size={12} />
        )}
        {renaming ? (
          <TextInput
            aria-label={t("layers.layerName")}
            value={draftName}
            size="xs"
            autoFocus
            onClick={(event) => event.stopPropagation()}
            onChange={(event) => setDraftName(event.currentTarget.value)}
            onBlur={() => {
              if (draftName.trim() && draftName.trim() !== layer.name)
                dispatch({
                  type: "layer.update",
                  ids: [id],
                  patch: { name: draftName.trim().slice(0, 120) },
                });
              setRenaming(false);
            }}
            onKeyDown={(event) => {
              if (event.nativeEvent.isComposing) return;
              if (event.key === "Enter") event.currentTarget.blur();
              if (event.key === "Escape") {
                setRenaming(false);
                event.stopPropagation();
              }
            }}
          />
        ) : (
          <span>{layer.name}</span>
        )}
      </div>
      <ActionIcon
        size="xs"
        color="gray"
        variant="subtle"
        aria-label={t(layer.hidden ? "layers.showLayer" : "layers.hideLayer", {
          name: layer.name,
        })}
        onClick={() =>
          dispatch({
            type: "layer.update",
            ids: [id],
            patch: { hidden: !layer.hidden },
          })
        }
      >
        {layer.hidden ? <EyeOff size={12} /> : <Eye size={12} />}
      </ActionIcon>
      <ActionIcon
        size="xs"
        color="gray"
        variant="subtle"
        aria-label={t(locked ? "layers.unlockLayer" : "layers.lockLayer", {
          name: layer.name,
        })}
        disabled={!!group?.locked}
        onClick={() =>
          dispatch({
            type: "layer.update",
            ids: [id],
            patch: { locked: !layer.locked },
          })
        }
      >
        {locked ? <Lock size={12} /> : <Unlock size={12} />}
      </ActionIcon>
      <Menu position="right-start">
        <Menu.Target>
          <ActionIcon
            size="xs"
            color="gray"
            variant="subtle"
            aria-label={t("layers.layerActions", { name: layer.name })}
            onClick={() => {
              if (selection?.groupId || !selected.includes(id))
                select({ ids: [id] });
            }}
          >
            <MoreHorizontal size={12} />
          </ActionIcon>
        </Menu.Target>
        <Menu.Dropdown className={styles.layerMenu}>
          <Menu.Item
            disabled={locked}
            leftSection={<ArrowUpToLine size={13} />}
            onClick={() =>
              dispatch({
                type: "layer.relocate",
                source: ref,
                placement: "front",
              })
            }
          >
            {t("layers.bringToFront")}
          </Menu.Item>
          <Menu.Item
            disabled={locked}
            leftSection={<ArrowDownToLine size={13} />}
            onClick={() =>
              dispatch({
                type: "layer.relocate",
                source: ref,
                placement: "back",
              })
            }
          >
            {t("layers.sendToBack")}
          </Menu.Item>
          <Menu.Item
            disabled={selected.length < 2 || locked}
            leftSection={<Group size={13} />}
            rightSection={<Shortcut keys={["Mod", "G"]} />}
            onClick={() => store.set(groupSelectionAtom)}
          >
            {t("layers.groupSelection")}
          </Menu.Item>
          <Menu.Item
            disabled={!group || group.locked}
            leftSection={<Ungroup size={13} />}
            rightSection={<Shortcut keys={["Mod", "Shift", "G"]} />}
            onClick={() => {
              if (group) {
                dispatch({ type: "group.ungroup", id: group.id });
                select({ ids: group.elementIds });
              }
            }}
          >
            {t("layers.ungroup")}
          </Menu.Item>
          <Menu.Item
            disabled={locked}
            leftSection={<Copy size={13} />}
            rightSection={<Shortcut keys={["Mod", "D"]} />}
            onClick={() => store.set(duplicateSelectionAtom)}
          >
            {t("layers.duplicate")}
          </Menu.Item>
          <Menu.Item
            disabled={locked}
            color="red"
            leftSection={<Trash2 size={13} />}
            onClick={() => store.set(deleteSelectionAtom)}
          >
            {t("layers.deleteLayer")}
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </motion.div>
  );
}
