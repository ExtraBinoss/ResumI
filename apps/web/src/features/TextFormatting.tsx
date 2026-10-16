import { useState } from "react";
import {
  ActionIcon,
  Popover,
  TextInput,
  Button,
  Select,
  NumberInput,
  ColorInput,
} from "../ui";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Link2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  CaseUpper,
} from "lucide-react";
import { useAtomValue, useSetAtom } from "jotai";
import {
  textStyleAcrossRange,
  type Layer,
  type LayerPatch,
  type TextMarkStyle,
} from "@resumi/engine";
import { blockAtom } from "../state/editor";
import { designCommandAtom, textRangeAtom } from "../state/design";
import styles from "../styles/LayerPanels.module.css";
export function TextFormatting({
  id,
  layer,
}: {
  id: string;
  layer: Extract<Layer, { type: "text" }>;
}) {
  const block = useAtomValue(blockAtom(id)),
    range = useAtomValue(textRangeAtom),
    dispatch = useSetAtom(designCommandAtom),
    [link, setLink] = useState("https://"),
    [open, setOpen] = useState(false);
  const selected = range?.id === id && range.end > range.start ? range : null,
    style =
      selected && block
        ? textStyleAcrossRange(
            block.text,
            layer.marks,
            selected.start,
            selected.end,
            layer,
          ).style
        : layer;
  function format(style: TextMarkStyle) {
    if (selected)
      dispatch({
        type: "text.range.format",
        id,
        markId: crypto.randomUUID(),
        start: selected.start,
        end: selected.end,
        style,
      });
    else dispatch({ type: "layer.update", ids: [id], patch: style });
  }
  const toggles = [
    {
      label: "Bold",
      icon: Bold,
      active: (style.fontWeight ?? 400) >= 600,
      patch: { fontWeight: (style.fontWeight ?? 400) >= 600 ? 400 : 700 },
    },
    {
      label: "Italic",
      icon: Italic,
      active: style.fontStyle === "italic",
      patch: { fontStyle: style.fontStyle === "italic" ? "normal" : "italic" },
    },
    {
      label: "Underline",
      icon: Underline,
      active: !!style.underline,
      patch: { underline: !style.underline },
    },
    {
      label: "Strikethrough",
      icon: Strikethrough,
      active: !!style.strike,
      patch: { strike: !style.strike },
    },
  ] as const;
  return (
    <div className={styles.formatToolbar}>
      {toggles.map(({ label, icon: Icon, active, patch }) => (
        <ActionIcon
          key={label}
          aria-label={label}
          aria-pressed={active}
          size="sm"
          variant={active ? "light" : "subtle"}
          color={active ? "blue" : "gray"}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => format(patch)}
        >
          <Icon size={14} />
        </ActionIcon>
      ))}
      <ActionIcon
        aria-label="Uppercase"
        size="sm"
        variant={layer.uppercase ? "light" : "subtle"}
        color="gray"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() =>
          dispatch({
            type: "layer.update",
            ids: [id],
            patch: { uppercase: !layer.uppercase },
          })
        }
      >
        <CaseUpper size={14} />
      </ActionIcon>
      <span />
      <Popover
        opened={open}
        onChange={setOpen}
        width={240}
        position="bottom-end"
      >
        <Popover.Target>
          <ActionIcon
            aria-label="Add link to selection"
            size="sm"
            disabled={!selected}
            variant="subtle"
            color="gray"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setOpen(!open)}
          >
            <Link2 size={14} />
          </ActionIcon>
        </Popover.Target>
        <Popover.Dropdown>
          <TextInput
            label="Link URL"
            size="xs"
            value={link}
            onChange={(e) => setLink(e.currentTarget.value)}
          />
          <Button
            size="xs"
            mt="sm"
            disabled={!/^(https?:|mailto:|tel:)/i.test(link)}
            onClick={() => {
              format({ href: link, underline: true, color: "#2958e8" });
              setOpen(false);
            }}
          >
            Apply link
          </Button>
        </Popover.Dropdown>
      </Popover>
    </div>
  );
}
export function TypographyFields({
  id,
  layer,
  fonts = [],
}: {
  id: string;
  layer: Extract<Layer, { type: "text" }>;
  fonts?: string[];
}) {
  const dispatch = useSetAtom(designCommandAtom),
    range = useAtomValue(textRangeAtom);
  function patch(patch: LayerPatch) {
    const selected = range?.id === id && range.end > range.start;
    if (
      selected &&
      Object.keys(patch).every((key) =>
        ["fontFamily", "fontSize", "fontWeight", "color"].includes(key),
      )
    )
      dispatch({
        type: "text.range.format",
        id,
        markId: crypto.randomUUID(),
        start: range.start,
        end: range.end,
        style: patch as TextMarkStyle,
      });
    else dispatch({ type: "layer.update", ids: [id], patch });
  }
  const families = [
    ...new Set([
      "Arial, sans-serif",
      "Georgia, serif",
      "Inter, sans-serif",
      "Courier New, monospace",
      "Times New Roman, serif",
      ...fonts,
      layer.fontFamily,
    ]),
  ];
  return (
    <>
      <Select
        label="Font family"
        aria-label="Font family"
        size="xs"
        value={layer.fontFamily}
        allowDeselect={false}
        searchable
        data={families}
        onChange={(value) => {
          if (value) patch({ fontFamily: value });
        }}
      />
      <div className={styles.doubleGrid}>
        <NumberInput
          label="Font size"
          aria-label="Font size"
          size="xs"
          min={4}
          max={240}
          value={layer.fontSize}
          onChange={(value) => {
            if (typeof value === "number" && value >= 4 && value <= 240)
              patch({ fontSize: value });
          }}
        />
        <Select
          label="Font weight"
          size="xs"
          value={String(layer.fontWeight)}
          allowDeselect={false}
          data={[
            ...new Set([
              100,
              200,
              300,
              400,
              500,
              600,
              650,
              700,
              800,
              900,
              layer.fontWeight,
            ]),
          ]
            .sort((a, b) => a - b)
            .map((value) => ({ value: String(value), label: String(value) }))}
          onChange={(value) => {
            if (value) patch({ fontWeight: Number(value) });
          }}
        />
      </div>
      <TextFormatting id={id} layer={layer} />
      <div className={styles.alignRow}>
        {[
          { value: "left", icon: AlignLeft },
          { value: "center", icon: AlignCenter },
          { value: "right", icon: AlignRight },
        ].map(({ value, icon: Icon }) => (
          <ActionIcon
            key={value}
            size="sm"
            color="gray"
            variant={layer.align === value ? "light" : "subtle"}
            aria-label={`Align ${value}`}
            onClick={() => patch({ align: value as typeof layer.align })}
          >
            <Icon size={14} />
          </ActionIcon>
        ))}
      </div>
      <div className={styles.doubleGrid}>
        <NumberInput
          label="Line height"
          size="xs"
          value={layer.lineHeight}
          min={0.7}
          max={4}
          step={0.05}
          decimalScale={2}
          onChange={(value) => {
            if (typeof value === "number" && value >= 0.7 && value <= 4)
              patch({ lineHeight: value });
          }}
        />
        <NumberInput
          label="Letter spacing"
          size="xs"
          value={layer.letterSpacing}
          min={-10}
          max={40}
          step={0.1}
          decimalScale={2}
          onChange={(value) => {
            if (typeof value === "number" && value >= -10 && value <= 40)
              patch({ letterSpacing: value });
          }}
        />
      </div>
      <ColorInput
        label="Text color"
        size="xs"
        format="hex"
        withEyeDropper={false}
        value={layer.color}
        onChangeEnd={(value) => {
          if (/^#[0-9a-fA-F]{6}$/.test(value)) patch({ color: value });
        }}
      />
    </>
  );
}
