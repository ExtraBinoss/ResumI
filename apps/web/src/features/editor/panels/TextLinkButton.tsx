import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { Link2, Trash2 } from "lucide-react";
import { textStyleAcrossRange, type Command, type Layer } from "@resumi/engine";
import { blockAtom } from "../../../state/editor";
import { designCommandAtom, textRangeAtom } from "../../../state/design";
import {
  ActionIcon,
  Popover,
  TextInput,
  Button,
  ColorInput,
} from "../../../ui";
import { Shortcut } from "../../../components/Shortcut";
import styles from "../styles/Inspector.module.css";
import { useColorPreview } from "./useColorPreview";

export function TextLinkButton({
  id,
  layer,
}: {
  id: string;
  layer: Extract<Layer, { type: "text" }>;
}) {
  const { t } = useTranslation();
  const block = useAtomValue(blockAtom(id));
  const selection = useAtomValue(textRangeAtom);
  const setSelection = useSetAtom(textRangeAtom);
  const dispatch = useSetAtom(designCommandAtom);
  const preview = useColorPreview(id);
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [href, setHref] = useState("https://");
  const [color, setColor] = useState("#2958e8");
  const range =
    selection?.id === id && selection.end > selection.start
      ? selection
      : { id, start: 0, end: block?.text.length ?? 0 };
  const current = block
    ? textStyleAcrossRange(
        block.text,
        layer.marks,
        range.start,
        range.end,
        layer,
      )
    : null;
  const linkMarks = layer.marks.filter(
    (mark) => mark.href && mark.start <= range.start && mark.end >= range.end,
  );
  function prepare() {
    if (!block) return;
    setSelection(range);
    setLabel(block.text.slice(range.start, range.end));
    setHref(current?.style.href ?? "https://");
    setColor(current?.style.color ?? "#2958e8");
    setOpen(!open);
  }
  function apply() {
    if (!block || !label || !/^(https?:|mailto:|tel:)/i.test(href)) return;
    const text =
      block.text.slice(0, range.start) + label + block.text.slice(range.end);
    const commands: Command[] = [];
    if (text !== block.text)
      commands.push({ type: "block.update", id, patch: { text } });
    commands.push({
      type: "text.range.format",
      id,
      markId: crypto.randomUUID(),
      start: range.start,
      end: range.start + label.length,
      style: { href, color, underline: true },
    });
    dispatch({ version: 1, actor: { kind: "human", name: "Link" }, commands });
    setSelection({ id, start: range.start, end: range.start + label.length });
    setOpen(false);
  }
  return (
    <Popover opened={open} onChange={setOpen} width={260} position="bottom-end">
      <Popover.Target>
        <ActionIcon
          aria-label={t("properties.addLink")}
          size="sm"
          disabled={!block?.text.length}
          aria-pressed={!!current?.style.href}
          variant={current?.style.href ? "light" : "subtle"}
          color="gray"
          onMouseDown={(event) => event.preventDefault()}
          onClick={prepare}
        >
          <Link2 size={15} />
        </ActionIcon>
      </Popover.Target>
      <Popover.Dropdown>
        <div className={styles.linkFields}>
          <TextInput
            label={t("properties.textLabel")}
            aria-label={t("properties.linkText")}
            size="xs"
            value={label}
            onChange={(event) => setLabel(event.currentTarget.value)}
          />
          <TextInput
            label={
              <>
                {t("properties.link")} <Shortcut keys={["Mod", "K"]} />
              </>
            }
            aria-label={t("properties.linkUrl")}
            size="xs"
            value={href}
            onChange={(event) => setHref(event.currentTarget.value)}
          />
          <ColorInput
            label={t("properties.color")}
            aria-label={t("properties.linkColor")}
            size="xs"
            value={color}
            onPreview={(value) => preview({ kind: "text", id, range }, value)}
            onChangeEnd={setColor}
          />
          <div className={styles.linkActions}>
            {linkMarks.length > 0 && (
              <ActionIcon
                aria-label={t("properties.removeLink")}
                size="sm"
                variant="subtle"
                color="gray"
                onClick={() => {
                  dispatch({
                    version: 1,
                    actor: { kind: "human", name: "Link" },
                    commands: linkMarks.map((mark) => ({
                      type: "text.mark.remove",
                      id,
                      markId: mark.id,
                    })),
                  });
                  setOpen(false);
                }}
              >
                <Trash2 size={14} />
              </ActionIcon>
            )}
            <span />
            <Button
              size="xs"
              disabled={!label || !/^(https?:|mailto:|tel:)/i.test(href)}
              onClick={apply}
            >
              {t("properties.apply")}
            </Button>
          </div>
        </div>
      </Popover.Dropdown>
    </Popover>
  );
}
