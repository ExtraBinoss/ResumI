import { useAtomValue, useSetAtom } from "jotai";
import {
  TextInput,
  Textarea,
  Select,
  Slider,
  ActionIcon,
  Button,
  ColorInput,
} from "@mantine/core";
import { Plus, Trash2, ChevronUp, ChevronDown, X } from "lucide-react";
import {
  commandAtom,
  selectionAtom,
  styleAtom,
  sectionAtom,
  blockAtom,
} from "../state/editor";
import type { Block } from "@resumi/engine";
import styles from "../styles/Editor.module.css";
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
      <p className={styles.help}>
        Or double-click the text on the page.
        <br />⌘ / Ctrl + Enter to finish.
      </p>
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
export function Inspector({ close }: { close: () => void }) {
  const selection = useAtomValue(selectionAtom),
    style = useAtomValue(styleAtom),
    dispatch = useSetAtom(commandAtom),
    select = useSetAtom(selectionAtom);
  if (!style) return null;
  return (
    <aside className={styles.inspector} aria-label="Properties inspector">
      <div className={styles.panelHeading}>
        <h2>{selection ? "Properties" : "Document"}</h2>
        <ActionIcon
          size="sm"
          variant="subtle"
          color="gray"
          aria-label="Close properties"
          onClick={close}
        >
          <X size={15} />
        </ActionIcon>
      </div>
      {selection ? (
        <>
          <SectionFields id={selection.sectionId} blockId={selection.blockId} />
          <Button
            variant="subtle"
            size="xs"
            fullWidth
            mt="md"
            onClick={() => select(null)}
          >
            Document settings
          </Button>
        </>
      ) : (
        <div className={styles.fieldGroup}>
          <h3>Make your mark</h3>
          <p className={styles.help}>A few considered choices go a long way.</p>
          <Select
            label="Typography"
            size="xs"
            value={style.font}
            data={[
              { value: "sans", label: "Modern sans serif" },
              { value: "serif", label: "Classic serif" },
            ]}
            allowDeselect={false}
            onChange={(font) => {
              if (font)
                dispatch({
                  type: "style.update",
                  patch: { font: font as "sans" | "serif" },
                });
            }}
          />
          <ColorInput
            label="Accent color"
            size="xs"
            mt="lg"
            value={style.accent}
            format="hex"
            swatches={["#2563eb", "#181b22", "#475569", "#334e68"]}
            onChangeEnd={(accent) => {
              if (/^#[0-9a-fA-F]{6}$/.test(accent))
                dispatch({ type: "style.update", patch: { accent } });
            }}
          />
          <label className={styles.sliderLabel}>
            Text size <span>{style.fontSize} px</span>
          </label>
          <Slider
            aria-label="Text size"
            min={10}
            max={16}
            step={0.5}
            value={style.fontSize}
            onChange={(fontSize) =>
              dispatch({ type: "style.update", patch: { fontSize } })
            }
            size="xs"
          />
          <label className={styles.sliderLabel}>
            Section spacing <span>{style.spacing} px</span>
          </label>
          <Slider
            aria-label="Section spacing"
            min={12}
            max={40}
            value={style.spacing}
            onChange={(spacing) =>
              dispatch({ type: "style.update", patch: { spacing } })
            }
            size="xs"
          />
          <div className={styles.documentFacts}>
            <span>
              Page format<strong>A4</strong>
            </span>
            <span>
              Layout<strong>Single column</strong>
            </span>
            <span>
              Storage<strong>This browser</strong>
            </span>
          </div>
          <p className={styles.help}>
            Select a section on the page to edit its content and structure.
          </p>
        </div>
      )}
    </aside>
  );
}
