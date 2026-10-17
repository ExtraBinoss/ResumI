import { useAtomValue, useSetAtom } from "jotai";
import { TextInput, Textarea, Select, ActionIcon, Button } from "../../../ui";
import { Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import {
  commandAtom,
  selectionAtom,
  sectionAtom,
  blockAtom,
} from "../../../state/editor";
import type { Block } from "@resumi/engine";
import styles from "../styles/LegacyPanels.module.css";
import { DocumentStyleFields } from "./DocumentStyleFields";
function BlockFields({ id, sectionId }: { id: string; sectionId: string }) {
  const block = useAtomValue(blockAtom(id)),
    dispatch = useSetAtom(commandAtom),
    select = useSetAtom(selectionAtom),
    section = useAtomValue(sectionAtom(sectionId));
  if (!block || !section) return null;
  const index = section.blockIds.indexOf(id);
  function move(offset: number) {
    if (!section) return;
    const ids = [...section.blockIds];
    [ids[index], ids[index + offset]] = [ids[index + offset], ids[index]];
    dispatch({ type: "block.reorder", sectionId, ids });
  }
  return (
    <div className={styles.fieldGroup}>
      <div className={styles.fieldHeading}>
        <h3>Selected text</h3>
        <div className={styles.inlineActions}>
          <ActionIcon
            size="sm"
            variant="subtle"
            aria-label="Move block up"
            disabled={index === 0}
            onClick={() => move(-1)}
          >
            <ChevronUp size={14} />
          </ActionIcon>
          <ActionIcon
            size="sm"
            variant="subtle"
            aria-label="Move block down"
            disabled={index === section.blockIds.length - 1}
            onClick={() => move(1)}
          >
            <ChevronDown size={14} />
          </ActionIcon>
          <ActionIcon
            size="sm"
            variant="subtle"
            color="red"
            aria-label="Delete block"
            onClick={() => {
              dispatch({ type: "block.delete", id });
              select({ sectionId });
            }}
          >
            <Trash2 size={13} />
          </ActionIcon>
        </div>
      </div>
      <Select
        label="Text style"
        value={block.kind}
        data={[
          { value: "heading", label: "Name / heading" },
          { value: "subtitle", label: "Subtitle" },
          { value: "text", label: "Paragraph" },
          { value: "meta", label: "Details" },
          { value: "bullet", label: "Bullet point" },
        ]}
        allowDeselect={false}
        onChange={(kind) => {
          if (kind)
            dispatch({
              type: "block.update",
              id,
              patch: { kind: kind as Block["kind"] },
            });
        }}
        size="xs"
      />
      <Textarea
        label="Content"
        value={block.text}
        maxLength={20000}
        autosize
        minRows={4}
        maxRows={14}
        onChange={(e) =>
          dispatch({
            type: "block.update",
            id,
            patch: { text: e.currentTarget.value },
          })
        }
        size="xs"
        mt="md"
      />
    </div>
  );
}
function SectionFields({ id, blockId }: { id: string; blockId?: string }) {
  const section = useAtomValue(sectionAtom(id)),
    dispatch = useSetAtom(commandAtom),
    select = useSetAtom(selectionAtom);
  if (!section) return null;
  return (
    <>
      <div className={styles.fieldGroup}>
        <h3>Section</h3>
        <TextInput
          label="Section title"
          size="xs"
          value={section.title}
          placeholder="Personal details"
          maxLength={200}
          onChange={(e) =>
            dispatch({
              type: "section.update",
              id,
              title: e.currentTarget.value,
            })
          }
        />
        <div className={styles.blockList}>
          {section.blockIds.map((block, i) => (
            <BlockLink
              key={block}
              id={block}
              index={i}
              sectionId={id}
              selected={blockId === block}
            />
          ))}
        </div>
        <Button
          size="xs"
          variant="light"
          fullWidth
          leftSection={<Plus size={13} />}
          onClick={() => {
            const blockId = crypto.randomUUID();
            dispatch({
              type: "block.create",
              sectionId: id,
              block: { id: blockId, kind: "text", text: "New paragraph" },
            });
            select({ sectionId: id, blockId });
          }}
        >
          Add text block
        </Button>
      </div>
      {blockId && <BlockFields id={blockId} sectionId={id} />}
    </>
  );
}
function BlockLink({
  id,
  sectionId,
  selected,
  index,
}: {
  id: string;
  sectionId: string;
  selected: boolean;
  index: number;
}) {
  const block = useAtomValue(blockAtom(id)),
    select = useSetAtom(selectionAtom);
  return (
    <button
      className={`${styles.blockLink} ${selected ? styles.activeBlock : ""}`}
      onClick={() => select({ sectionId, blockId: id })}
    >
      <span>{String(index + 1).padStart(2, "0")}</span>
      {block?.text || "(empty)"}
    </button>
  );
}
export function Inspector({ showDocument }: { showDocument: () => void }) {
  const selection = useAtomValue(selectionAtom),
    select = useSetAtom(selectionAtom);
  return (
    <aside className={styles.inspector} aria-label="Properties inspector">
      <div className={styles.panelHeading}>
        <h2>{selection ? "Properties" : "Document"}</h2>
      </div>
      {selection ? (
        <>
          <SectionFields id={selection.sectionId} blockId={selection.blockId} />
          <Button
            variant="subtle"
            size="xs"
            fullWidth
            mt="md"
            onClick={() => {
              select(null);
              showDocument();
            }}
          >
            Document settings
          </Button>
        </>
      ) : (
        <DocumentStyleFields />
      )}
    </aside>
  );
}
