import { useState } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  SlidersHorizontal,
  CaseUpper,
} from "lucide-react";
import {
  textStyleAcrossRange,
  type Layer,
  type LayerPatch,
  type TextMarkStyle,
  type TextSelectionStyle,
} from "@resumi/engine";
import { blockAtom } from "../../../state/editor";
import { designCommandAtom, textRangeAtom } from "../../../state/design";
import {
  ActionIcon,
  Popover,
  Select,
  NumberInput,
  ColorInput,
  Slider,
  Tooltip,
} from "../../../ui";
import { Shortcut } from "../../../components/Shortcut";
import { TextLinkButton } from "./TextLinkButton";
import { FontPicker } from "./FontPicker";
import { useTextPreview } from "./useTextPreview";
import { useColorPreview } from "./useColorPreview";
import styles from "../styles/Inspector.module.css";

type TextLayer = Extract<Layer, { type: "text" }>;
function useFormatting(id: string, layer: TextLayer) {
  const block = useAtomValue(blockAtom(id));
  const range = useAtomValue(textRangeAtom);
  const dispatch = useSetAtom(designCommandAtom);
  const selected = range?.id === id && range.end > range.start ? range : null;
  const current: TextSelectionStyle =
    selected && block
      ? textStyleAcrossRange(
          block.text,
          layer.marks,
          selected.start,
          selected.end,
          layer,
        )
      : { style: layer, mixed: [] };
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
  function patch(patch: LayerPatch) {
    dispatch({ type: "layer.update", ids: [id], patch });
  }
  return {
    selected,
    style: current.style,
    mixed: current.mixed,
    format,
    patch,
  };
}
function TypeSettings({
  layer,
  patch,
}: {
  layer: TextLayer;
  patch: (patch: LayerPatch) => void;
}) {
  return (
    <div className={styles.typeSettings}>
      {[
        {
          key: "lineHeight",
          label: "Line height",
          min: 0.7,
          max: 4,
          step: 0.05,
        },
        {
          key: "letterSpacing",
          label: "Letter spacing",
          min: -10,
          max: 40,
          step: 0.1,
        },
      ].map(({ key, label, min, max, step }) => (
        <div key={key}>
          <div>
            <NumberInput
              label={label}
              suffix={key === "lineHeight" ? "×" : "px"}
              aria-label={label}
              size="xs"
              hideControls
              min={min}
              max={max}
              step={step}
              value={layer[key as "lineHeight" | "letterSpacing"]}
              onChange={(value) => {
                if (typeof value === "number" && value >= min && value <= max)
                  patch({ [key]: value });
              }}
            />
          </div>
          <Slider
            aria-label={`${label} adjustment`}
            key={layer[key as "lineHeight" | "letterSpacing"]}
            defaultValue={layer[key as "lineHeight" | "letterSpacing"]}
            min={min}
            max={max}
            step={step}
            onChangeEnd={(value) => patch({ [key]: value })}
          />
        </div>
      ))}
      <div className={styles.alignRow}>
        {(
          [
            { value: "left", icon: AlignLeft },
            { value: "center", icon: AlignCenter },
            { value: "right", icon: AlignRight },
          ] as const
        ).map(({ value, icon: Icon }) => (
          <ActionIcon
            key={value}
            size="sm"
            color="gray"
            variant={layer.align === value ? "light" : "subtle"}
            aria-label={`Align ${value}`}
            aria-pressed={layer.align === value}
            onClick={() => patch({ align: value })}
          >
            <Icon size={16} />
          </ActionIcon>
        ))}
        <ActionIcon
          aria-label="Uppercase"
          aria-pressed={layer.uppercase}
          size="sm"
          variant={layer.uppercase ? "light" : "subtle"}
          color="gray"
          onClick={() => patch({ uppercase: !layer.uppercase })}
        >
          <CaseUpper size={16} />
        </ActionIcon>
      </div>
    </div>
  );
}
export function TextFormatting({
  id,
  layer,
}: {
  id: string;
  layer: TextLayer;
}) {
  const { style, mixed, format, patch } = useFormatting(id, layer);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const toggles = [
    {
      label: "Bold",
      icon: Bold,
      active: !mixed.includes("fontWeight") && (style.fontWeight ?? 400) >= 600,
      patch: { fontWeight: (style.fontWeight ?? 400) >= 600 ? 400 : 700 },
    },
    {
      label: "Italic",
      icon: Italic,
      active: !mixed.includes("fontStyle") && style.fontStyle === "italic",
      patch: { fontStyle: style.fontStyle === "italic" ? "normal" : "italic" },
    },
    {
      label: "Underline",
      icon: Underline,
      active: !mixed.includes("underline") && !!style.underline,
      patch: { underline: !style.underline },
    },
    {
      label: "Strikethrough",
      icon: Strikethrough,
      active: !mixed.includes("strike") && !!style.strike,
      patch: { strike: !style.strike },
    },
  ] as const;
  return (
    <div className={styles.formatToolbar}>
      {toggles.map(({ label, icon: Icon, active, patch }) => (
        <Tooltip
          key={label}
          label={
            <>
              {label}
              {label !== "Strikethrough" && (
                <Shortcut keys={["Mod", label.slice(0, 1)]} />
              )}
            </>
          }
        >
          <ActionIcon
            aria-label={label}
            aria-pressed={active}
            size="sm"
            variant={active ? "light" : "subtle"}
            color="gray"
            onPointerDown={(event) => event.preventDefault()}
            onClick={() => format(patch)}
          >
            <Icon size={16} />
          </ActionIcon>
        </Tooltip>
      ))}
      <TextLinkButton id={id} layer={layer} />
      <span />
      <Popover
        opened={settingsOpen}
        onChange={setSettingsOpen}
        width={250}
        position="bottom-end"
      >
        <Popover.Target>
          <ActionIcon
            aria-label="Typography settings"
            aria-pressed={settingsOpen}
            size="sm"
            variant={settingsOpen ? "light" : "subtle"}
            color="gray"
            onClick={() => setSettingsOpen(!settingsOpen)}
          >
            <SlidersHorizontal size={16} />
          </ActionIcon>
        </Popover.Target>
        <Popover.Dropdown>
          <TypeSettings layer={layer} patch={patch} />
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
  layer: TextLayer;
  fonts?: string[];
}) {
  const { style, mixed, format, selected } = useFormatting(id, layer);
  const preview = useTextPreview(id);
  const previewColor = useColorPreview(id);
  return (
    <>
      <FontPicker
        value={style.fontFamily ?? layer.fontFamily}
        fonts={fonts}
        mixed={mixed.includes("fontFamily")}
        onPreview={(value) => preview("fontFamily", value)}
        onChange={(value) => format({ fontFamily: value })}
      />
      <div className={styles.fontBasics}>
        <NumberInput
          label="Size"
          suffix="px"
          onPreview={(value) => preview("fontSize", value)}
          aria-label="Font size"
          size="xs"
          min={4}
          max={240}
          value={style.fontSize ?? layer.fontSize}
          onChange={(value) => {
            if (typeof value === "number" && value >= 4 && value <= 240)
              format({ fontSize: value });
          }}
        />
        <Select
          label="Weight"
          aria-label="Font weight"
          size="xs"
          value={
            mixed.includes("fontWeight")
              ? null
              : String(style.fontWeight ?? layer.fontWeight)
          }
          placeholder="Mixed"
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
            if (value) format({ fontWeight: Number(value) });
          }}
        />
      </div>
      <TextFormatting id={id} layer={layer} />
      <div className={styles.fieldRow}>
        <label>Color</label>
        <ColorInput
          aria-label="Text color"
          size="xs"
          value={style.color ?? layer.color}
          onPreview={(color) =>
            previewColor(
              { kind: "text", id, range: selected, marks: layer.marks },
              color,
            )
          }
          onChangeEnd={(color) => format({ color })}
        />
      </div>
    </>
  );
}
