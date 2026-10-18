import { useTranslation } from "react-i18next";
import { motion, useReducedMotion } from "motion/react";
import { useSetAtom } from "jotai";
import {
  ChevronRight,
  Eye,
  EyeOff,
  Folder,
  FolderOpen,
  Lock,
  Unlock,
} from "lucide-react";
import type { LayerGroup as Group } from "@resumi/engine";
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "../../../components/ui/accordion";
import { ActionIcon } from "../../../ui";
import { designCommandAtom, selectLayersAtom } from "../../../state/design";
import { LayerRow } from "./LayerRow";
import type { LayerReorder } from "./useLayerReorder";
import styles from "../styles/Composition.module.css";

export function LayerGroup({
  group,
  ids,
  active,
  bind,
}: {
  group: Group;
  ids: string[];
  active: boolean;
  bind: LayerReorder["bind"];
}) {
  const { t } = useTranslation(),
    reduced = useReducedMotion();
  const dispatch = useSetAtom(designCommandAtom),
    select = useSetAtom(selectLayersAtom);
  return (
    <AccordionItem
      render={
        <motion.div
          layout="position"
          initial={false}
          transition={{
            layout: reduced
              ? { duration: 0 }
              : { type: "spring", stiffness: 650, damping: 45 },
          }}
        />
      }
      value={group.id}
      className={styles.groupShell}
      data-layer-group={group.id}
    >
      <div
        className={`${styles.groupRow} ${active ? styles.active : ""}`}
        {...bind({ kind: "group", id: group.id }, group.locked)}
      >
        <AccordionTrigger
          className={styles.groupToggle}
          aria-label={t(
            group.collapsed ? "layers.expandGroup" : "layers.collapseGroup",
            { name: group.name },
          )}
        >
          <motion.span
            animate={{ rotate: group.collapsed ? 0 : 90 }}
            transition={{ duration: reduced ? 0 : 0.14 }}
          >
            <ChevronRight size={14} aria-hidden />
          </motion.span>
        </AccordionTrigger>
        <button
          className={styles.layerName}
          data-layer-drag-handle
          aria-label={t("layers.selectGroup", { name: group.name })}
          aria-pressed={active}
          onClick={() => select({ ids: group.elementIds, groupId: group.id })}
          onDoubleClick={() =>
            dispatch({
              type: "group.update",
              id: group.id,
              patch: { collapsed: !group.collapsed },
            })
          }
        >
          {group.collapsed ? (
            <Folder size={16} aria-hidden />
          ) : (
            <FolderOpen size={16} aria-hidden />
          )}
          <span>{group.name}</span>
        </button>
        <ActionIcon
          size="xs"
          variant="subtle"
          color="gray"
          aria-label={t(
            group.hidden ? "layers.showGroup" : "layers.hideGroup",
            { name: group.name },
          )}
          onClick={() =>
            dispatch({
              type: "group.update",
              id: group.id,
              patch: { hidden: !group.hidden },
            })
          }
        >
          {group.hidden ? (
            <EyeOff size={14} aria-hidden />
          ) : (
            <Eye size={14} aria-hidden />
          )}
        </ActionIcon>
        <ActionIcon
          size="xs"
          variant="subtle"
          color="gray"
          aria-label={t(
            group.locked ? "layers.unlockGroup" : "layers.lockGroup",
            { name: group.name },
          )}
          onClick={() =>
            dispatch({
              type: "group.update",
              id: group.id,
              patch: { locked: !group.locked },
            })
          }
        >
          {group.locked ? (
            <Lock size={14} aria-hidden />
          ) : (
            <Unlock size={14} aria-hidden />
          )}
        </ActionIcon>
      </div>
      <AccordionContent className={styles.groupContent}>
        <div
          className={styles.groupChildren}
          {...bind({ kind: "group", id: group.id }, group.locked, true)}
        >
          {ids.map((id) => (
            <LayerRow
              key={id}
              id={id}
              group={group}
              drag={bind({ kind: "element", id }, group.locked)}
            />
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
