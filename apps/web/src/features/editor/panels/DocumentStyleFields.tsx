import { useAtomValue, useSetAtom } from "jotai";
import { Select, Slider, ColorInput } from "../../../ui";
import { styleAtom, commandAtom } from "../../../state/editor";
import styles from "../styles/LegacyPanels.module.css";
export function DocumentStyleFields() {
  const style = useAtomValue(styleAtom),
    dispatch = useSetAtom(commandAtom);
  if (!style) return null;
  return (
    <div className={styles.fieldGroup}>
      <h3>Document</h3>
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
        eyeDropperButtonProps={{
          "aria-label": "Pick accent color from screen",
        }}
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
    </div>
  );
}
