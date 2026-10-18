import { useTranslation } from "react-i18next";
import { useAtomValue, useSetAtom } from "jotai";
import { TextInput, Textarea, Select, ActionIcon, Button } from "../../../ui";
import { Plus, Trash2 } from "lucide-react";
import {
  commandAtom,
  selectionAtom,
  sectionAtom,
  blockAtom,
} from "../../../state/editor";
import type { Block } from "@resumi/engine";
import styles from "../styles/LegacyPanels.module.css";
function BlockFields({ id, sectionId }: { id: string; sectionId: string }) {
  const { t } = useTranslation();
  const block = useAtomValue(blockAtom(id)),
    dispatch = useSetAtom(commandAtom),
    select = useSetAtom(selectionAtom),
    section = useAtomValue(sectionAtom(sectionId));
  if (!block || !section) return null;
  return (
    <div className={styles.fieldGroup}>
      <div className={styles.fieldHeading}>
        <h3>{t("properties.selectedText")}</h3>
        <div className={styles.inlineActions}>
          <ActionIcon
            size="sm"
            variant="subtle"
            color="red"
            aria-label={t("properties.deleteBlock")}
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
        label={t("properties.textStyle")}
        value={block.kind}
        data={[
          { value: "heading", label: t("properties.heading") },
          { value: "subtitle", label: t("properties.subtitle") },
          { value: "text", label: t("properties.paragraph") },
          { value: "meta", label: t("properties.details") },
          { value: "bullet", label: t("properties.bulletPoint") },
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
        label={t("properties.content")}
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
  const { t } = useTranslation();
  const section = useAtomValue(sectionAtom(id)),
    dispatch = useSetAtom(commandAtom),
    select = useSetAtom(selectionAtom);
  if (!section) return null;
  return (
    <>
      <div className={styles.fieldGroup}>
        <h3>{t("properties.section")}</h3>
        <TextInput
          label={t("properties.sectionTitle")}
          size="xs"
          value={section.title}
          placeholder={t("properties.personalDetails")}
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
          {t("properties.addTextBlock")}
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
export function Inspector() {
  const { t } = useTranslation();
  const selection = useAtomValue(selectionAtom);
  return (
    <aside
      className={styles.inspector}
      aria-label={t("properties.propertiesInspector")}
    >
      <div className={styles.panelHeading}>
        <h2>{t("properties.properties")}</h2>
      </div>
      {selection && (
        <SectionFields id={selection.sectionId} blockId={selection.blockId} />
      )}
    </aside>
  );
}
