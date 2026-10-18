import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAtomValue, useSetAtom } from "jotai";
import { Button, ActionIcon, Tooltip } from "../../../ui";
import { Plus, ChevronRight, Trash2, Type } from "lucide-react";
import {
  sectionAtom,
  blockAtom,
  sectionIdsAtom,
  selectionAtom,
  commandAtom,
} from "../../../state/editor";
import type { Command } from "@resumi/engine";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "../../../components/ui/accordion";
import { ScrollShadow } from "../../../components/ScrollShadow";
import { useOutlineReorder, type OutlineReorder } from "./useOutlineReorder";
import styles from "../styles/LegacyPanels.module.css";
function SectionRow({ id, reorder }: { id: string; reorder: OutlineReorder }) {
  const { t } = useTranslation();
  const section = useAtomValue(sectionAtom(id)),
    selection = useAtomValue(selectionAtom),
    select = useSetAtom(selectionAtom),
    dispatch = useSetAtom(commandAtom);
  if (!section) return null;
  return (
    <AccordionItem
      value={id}
      data-outline-section={id}
      {...reorder.bind({ kind: "section", id })}
      className={`${styles.structureRow} ${selection?.sectionId === id ? styles.activeRow : ""}`}
    >
      <div className={styles.sectionHeader} data-outline-header>
        <AccordionTrigger
          className={styles.sectionToggle}
          aria-label={t("layers.toggleSection", {
            name: section.title || t("layers.personalDetails"),
          })}
        >
          <ChevronRight size={13} aria-hidden />
        </AccordionTrigger>
        <button
          className={styles.sectionButton}
          onClick={() => select({ sectionId: id })}
        >
          <span>{section.title || t("layers.personalDetails")}</span>
        </button>
      </div>
      <AccordionContent className={styles.outlineContent}>
        <div className={styles.outlineBlocks}>
          {(reorder.preview?.sectionId === id
            ? reorder.preview.blocks!
            : section.blockIds
          ).map((blockId) => (
            <OutlineBlock
              key={blockId}
              id={blockId}
              sectionId={id}
              reorder={reorder}
            />
          ))}
        </div>
      </AccordionContent>
      {selection?.sectionId === id && (
        <div className={styles.rowTools}>
          <Tooltip label={t("layers.deleteSectionUndo")}>
            <ActionIcon
              color="gray"
              variant="subtle"
              size="xs"
              aria-label={t("layers.deleteSelectedSection")}
              onClick={() => {
                dispatch({ type: "section.delete", id });
                select(null);
              }}
            >
              <Trash2 size={12} aria-hidden />
            </ActionIcon>
          </Tooltip>
        </div>
      )}
    </AccordionItem>
  );
}
function OutlineBlock({
  id,
  sectionId,
  reorder,
}: {
  id: string;
  sectionId: string;
  reorder: OutlineReorder;
}) {
  const { t } = useTranslation();
  const block = useAtomValue(blockAtom(id)),
    selection = useAtomValue(selectionAtom),
    select = useSetAtom(selectionAtom);
  if (!block) return null;
  return (
    <div
      data-outline-block={id}
      className={styles.outlineBlock}
      {...reorder.bind({ kind: "block", id, sectionId })}
    >
      <button
        className={selection?.blockId === id ? styles.activeBlock : undefined}
        onClick={() => select({ sectionId, blockId: id })}
      >
        <Type size={14} aria-hidden />{" "}
        <span>{block.design?.name || block.text || t("layers.emptyText")}</span>
      </button>
    </div>
  );
}
export function LegacyLayers({ embedded = false }: { embedded?: boolean }) {
  const { t } = useTranslation();
  const canonicalIds = useAtomValue(sectionIdsAtom),
    reorder = useOutlineReorder(),
    dispatch = useSetAtom(commandAtom),
    select = useSetAtom(selectionAtom);
  const [collapsed, setCollapsed] = useState<string[]>([]);
  const ids = reorder.preview?.sections ?? canonicalIds;
  function add() {
    const id = crypto.randomUUID(),
      blockId = crypto.randomUUID();
    const commands: Command[] = [
      {
        type: "section.create",
        section: { id, title: "New section", blockIds: [] },
      },
      {
        type: "block.create",
        sectionId: id,
        block: { id: blockId, kind: "text", text: "New text" },
      },
    ];
    dispatch({
      version: 1,
      actor: { kind: "human", name: "Editor" },
      commands,
    });
    select({ sectionId: id, blockId });
  }
  return (
    <aside
      className={`${styles.structure} ${embedded ? styles.embedded : ""}`}
      aria-label={t("layers.layersPanel")}
    >
      <div className={styles.panelHeading}>
        <h2>{t("layers.layers")}</h2>
      </div>
      <ScrollShadow
        className={styles.outlineScroll}
        contentClassName={styles.rows}
      >
        <Accordion
          multiple
          value={canonicalIds.filter((id) => !collapsed.includes(id))}
          onValueChange={(expanded) =>
            setCollapsed(canonicalIds.filter((id) => !expanded.includes(id)))
          }
          className={styles.outlineTree}
        >
          {ids.map((id) => (
            <SectionRow key={id} id={id} reorder={reorder} />
          ))}
        </Accordion>
      </ScrollShadow>
      <Button
        variant="subtle"
        color="gray"
        size="xs"
        fullWidth
        leftSection={<Plus size={14} aria-hidden />}
        onClick={add}
      >
        {t("layers.addSection")}
      </Button>
    </aside>
  );
}
