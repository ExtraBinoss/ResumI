import { useTranslation } from "react-i18next";
import { useSetAtom } from "jotai";
import type { Layer } from "@resumi/engine";
import { ColorInput, Select } from "../../../ui";
import { designCommandAtom } from "../../../state/design";
import styles from "../styles/Inspector.module.css";
import { useColorPreview } from "./useColorPreview";

/** Compound vectors expose their actual paints rather than an unused parent fill. */
export function VectorAppearance({
  id,
  layer,
}: {
  id: string;
  layer: Extract<Layer, { type: "shape" }>;
}) {
  const { t } = useTranslation();
  const dispatch = useSetAtom(designCommandAtom);
  const preview = useColorPreview(id);
  const vector = layer.vector!;
  const parts = vector.parts!;
  const colorMode = vector.colorMode ?? "original";
  // A paint slot keeps its identity when its color changes. Using the color as
  // the key remounts the open picker on commit; palette positions also shift
  // when paints merge. The first canonical SVG part/channel identifies a row.
  const paints = new Map<string, { color: string; key: string }>();
  for (const [partIndex, part] of parts.entries()) {
    for (const channel of ["fill", "stroke"] as const) {
      const color = part[channel];
      if (color && color !== "transparent" && !paints.has(color))
        paints.set(color, { color, key: `${partIndex}:${channel}` });
    }
  }
  const colors = [...paints.values()];
  return (
    <section>
      <h3>{t("properties.colorsHeading")}</h3>
      <Select
        label={t("properties.vectorColorMode")}
        aria-label={t("properties.vectorColorMode")}
        size="xs"
        value={colorMode}
        allowDeselect={false}
        data={[
          { value: "original", label: t("properties.originalColors") },
          { value: "monochrome", label: t("properties.monochrome") },
        ]}
        onChange={(value) => {
          if (value === "original" || value === "monochrome")
            dispatch({
              type: "layer.update",
              ids: [id],
              patch: {
                vector: { ...vector, colorMode: value },
              },
            });
        }}
      />
      {colorMode === "monochrome" ? (
        <ColorInput
          className={styles.fieldRow}
          label={t("properties.monochromeColor")}
          aria-label={t("properties.monochromeColor")}
          value={layer.fill}
          onPreview={(next) =>
            preview(
              { kind: "vector", id, color: layer.fill, monochrome: true },
              next,
            )
          }
          onChangeEnd={(fill) =>
            dispatch({
              type: "layer.update",
              ids: [id],
              patch: { fill },
            })
          }
        />
      ) : (
        colors.map(({ color, key }, index) => (
          <ColorInput
            key={key}
            className={styles.fieldRow}
            label={t("properties.colorNumber", { number: index + 1 })}
            aria-label={t("properties.vectorColor", { number: index + 1 })}
            value={color}
            onPreview={(next) => preview({ kind: "vector", id, color }, next)}
            onChangeEnd={(next) => {
              if (!/^#[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/.test(next)) return;
              dispatch({
                type: "layer.update",
                ids: [id],
                patch: {
                  vector: {
                    ...vector,
                    parts: parts.map((part) => ({
                      ...part,
                      fill: part.fill === color ? next : part.fill,
                      ...(part.stroke === color ? { stroke: next } : {}),
                    })),
                  },
                },
              });
            }}
          />
        ))
      )}
    </section>
  );
}
