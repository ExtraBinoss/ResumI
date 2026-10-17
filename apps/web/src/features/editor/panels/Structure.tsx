import { useAtomValue, useSetAtom, useStore } from "jotai";
import { Button, ActionIcon, Tooltip } from "../../../ui";
import {
  Plus,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Trash2,
  Type,
} from "lucide-react";
import {
  sectionAtom,
  blockAtom,
  sectionIdsAtom,
  selectionAtom,
  commandAtom,
} from "../../../state/editor";
import type { Command } from "@resumi/engine";
import { ScrollShadow } from "../../../components/ScrollShadow";
import { useOutlineReorder, type OutlineReorder } from "./useOutlineReorder";
import styles from "../styles/LegacyPanels.module.css";
function SectionRow({
  id,
  index,
  count,
  reorder,
}: {
  id: string;
  index: number;
  count: number;
  reorder: OutlineReorder;
}) {
  const section = useAtomValue(sectionAtom(id)),
    selection = useAtomValue(selectionAtom),
    select = useSetAtom(selectionAtom),
    dispatch = useSetAtom(commandAtom),
    store = useStore();
  if (!section) return null;
  function move(offset: number) {
    const ids = [...store.get(sectionIdsAtom)];
    [ids[index], ids[index + offset]] = [ids[index + offset], ids[index]];
    dispatch({ type: "section.reorder", ids });
  }
  return (
    <div
      data-outline-section={id}
      {...reorder.bind({ kind: "section", id })}
      className={`${styles.structureRow} ${selection?.sectionId === id ? styles.activeRow : ""}`}
    >
      <button
        className={styles.sectionButton}
        onClick={() => select({ sectionId: id })}
      >
        <GripVertical size={13} aria-hidden />
        <span>{section.title || "Personal details"}</span>
        <small>{section.blockIds.length}</small>
      </button>
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
      {selection?.sectionId === id && (
        <div className={styles.rowTools}>
          <Tooltip label="Move section up">
            <ActionIcon
              variant="subtle"
              size="xs"
              aria-label="Move section up"
              disabled={!index}
              onClick={() => move(-1)}
            >
              <ChevronUp size={13} aria-hidden />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Move section down">
            <ActionIcon
              variant="subtle"
              size="xs"
              aria-label="Move section down"
              disabled={index === count - 1}
              onClick={() => move(1)}
            >
              <ChevronDown size={13} aria-hidden />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Delete section (undo available)">
            <ActionIcon
              color="gray"
              variant="subtle"
              size="xs"
              aria-label="Delete selected section"
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
    </div>
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
        <span>{block.design?.name || block.text || "Empty text"}</span>
      </button>
    </div>
  );
}
export function Structure({
  embedded = false,
  openSettings,
}: {
  embedded?: boolean;
  openSettings: () => void;
}) {
  const canonicalIds = useAtomValue(sectionIdsAtom),
    reorder = useOutlineReorder(),
    dispatch = useSetAtom(commandAtom),
    select = useSetAtom(selectionAtom);
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
      aria-label="Document structure"
    >
      <div className={styles.panelHeading}>
        <h2>Outline</h2>
      </div>
      <div className={styles.outlineLabel}>
        RESUME SECTIONS <span>{ids.length}</span>
      </div>
      <ScrollShadow
        className={styles.outlineScroll}
        contentClassName={styles.rows}
      >
        {ids.map((id, i) => (
          <SectionRow
            key={id}
            id={id}
            index={i}
            count={ids.length}
            reorder={reorder}
          />
        ))}
      </ScrollShadow>
      <Button
        variant="subtle"
        color="gray"
        size="xs"
        fullWidth
        leftSection={<Plus size={14} aria-hidden />}
        onClick={add}
      >
        Add section
      </Button>
      <Button
        size="xs"
        variant="subtle"
        onClick={() => {
          select(null);
          openSettings();
        }}
      >
        Document
      </Button>
    </aside>
  );
}
