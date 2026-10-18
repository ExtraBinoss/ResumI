import { useId } from "react";
import { useTranslation } from "react-i18next";
import { useAtomValue, useSetAtom } from "jotai";
import { Slider, ColorInput } from "../../../ui";
import { styleAtom, commandAtom } from "../../../state/editor";
import styles from "../styles/LegacyPanels.module.css";
import { useColorPreview } from "./useColorPreview";
export function DocumentStyleFields() {
  const { t } = useTranslation();
  const sizeLabel = useId(),
    spacingLabel = useId();
  const style = useAtomValue(styleAtom),
    dispatch = useSetAtom(commandAtom);
  const preview = useColorPreview("document-style");
  if (!style) return null;
  return (
    <div className={styles.fieldGroup}>
      <h3>{t("properties.document")}</h3>
      <ColorInput
        label={t("properties.accentColor")}
        eyeDropperButtonProps={{
          "aria-label": t("properties.pickAccent"),
        }}
        size="xs"
        mt="lg"
        value={style.accent}
        onPreview={(value) => preview({ kind: "accent" }, value)}
        format="hex"
        swatches={["#2563eb", "#181b22", "#475569", "#334e68"]}
        onChangeEnd={(accent) => {
          if (/^#[0-9a-fA-F]{6}$/.test(accent))
            dispatch({ type: "style.update", patch: { accent } });
        }}
      />
      <div className={styles.sliderLabel}>
        <span id={sizeLabel}>{t("properties.textSize")}</span>
        <span>{style.fontSize} px</span>
      </div>
      <Slider
        aria-label={t("properties.textSize")}
        aria-labelledby={sizeLabel}
        min={10}
        max={16}
        step={0.5}
        value={style.fontSize}
        onChange={(fontSize) =>
          dispatch({ type: "style.update", patch: { fontSize } })
        }
        size="xs"
      />
      <div className={styles.sliderLabel}>
        <span id={spacingLabel}>{t("properties.sectionSpacing")}</span>
        <span>{style.spacing} px</span>
      </div>
      <Slider
        aria-label={t("properties.sectionSpacing")}
        aria-labelledby={spacingLabel}
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
