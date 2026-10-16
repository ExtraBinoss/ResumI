import { useAtomValue, useSetAtom, useStore } from "jotai";
import { Button, ActionIcon, Tooltip } from "@mantine/core";
import {
  Plus,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Trash2,
  PanelLeftClose,
} from "lucide-react";
import {
  sectionAtom,
  sectionIdsAtom,
  selectionAtom,
  commandAtom,
  sessionAtom,
} from "../state/editor";
import type { Command } from "@resumi/engine";
import styles from "../styles/Editor.module.css";
function SectionRow({
  id,
  index,
  count,
}: {
  id: string;
  index: number;
  count: number;
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
export function Structure({ close }: { close: () => void }) {
  const ids = useAtomValue(sectionIdsAtom),
    dispatch = useSetAtom(commandAtom),
    select = useSetAtom(selectionAtom),
    store = useStore();
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
        block: { id: blockId, kind: "text", text: "Tell your story." },
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
    <aside className={styles.structure} aria-label="Document structure">
      <div className={styles.panelHeading}>
        <h2>Outline</h2>
        <ActionIcon
          variant="subtle"
          color="gray"
          aria-label="Close outline"
          onClick={close}
        >
          <PanelLeftClose size={16} aria-hidden />
        </ActionIcon>
      </div>
      <div className={styles.outlineLabel}>
        RESUME SECTIONS <span>{ids.length}</span>
      </div>
      <div className={styles.rows}>
        {ids.map((id, i) => (
          <SectionRow key={id} id={id} index={i} count={ids.length} />
        ))}
      </div>
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
      <div className={styles.structureBottom}>
        <span className={styles.templateSwatch} />
        <div>
          <strong>Made to be yours</strong>
          <span>
            Change the type and accent
            <br />
            in Document settings.
          </span>
        </div>
        <Button
          size="compact-xs"
          variant="subtle"
          onClick={() => {
            if (store.get(sessionAtom)) select(null);
          }}
        >
          Edit
        </Button>
      </div>
    </aside>
  );
}
