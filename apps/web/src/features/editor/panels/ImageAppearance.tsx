import { useSetAtom } from "jotai";
import { Plus, X } from "lucide-react";
import { type Layer, type LayerPatch } from "@resumi/engine";
import { designCommandAtom } from "../../../state/design";
import { ActionIcon, ColorInput, NumberInput, Select } from "../../../ui";
import styles from "../styles/Inspector.module.css";
import { useColorPreview } from "./useColorPreview";

export function ImageBorderFields({
  id,
  layer,
}: {
  id: string;
  layer: Extract<Layer, { type: "image" }>;
}) {
  const dispatch = useSetAtom(designCommandAtom);
  const preview = useColorPreview(id);
  const border = layer.border ?? {
    width: 0,
    color: "#151515",
    style: "solid" as const,
  };
  function patch(value: LayerPatch) {
    dispatch({ type: "layer.update", ids: [id], patch: value });
  }
  return (
    <section>
      <div className={styles.sectionHead}>
        <h3>Border</h3>
        <ActionIcon
          aria-label={border.width ? "Remove image border" : "Add image border"}
          variant="subtle"
          color="gray"
          size="xs"
          onClick={() =>
            patch({ border: { ...border, width: border.width ? 0 : 1 } })
          }
        >
          {border.width ? <X size={14} /> : <Plus size={14} />}
        </ActionIcon>
      </div>
      <div className={styles.fieldRow}>
        <label>Color</label>
        <ColorInput
          aria-label="Border color"
          value={border.color}
          onPreview={(color) => preview({ kind: "border", id, layer }, color)}
          onChangeEnd={(color) =>
            patch({ border: { ...border, color, width: border.width || 1 } })
          }
        />
      </div>
      <div className={styles.doubleGrid}>
        <NumberInput
          aria-label="Border width"
          label="Width"
          suffix="px"
          size="xs"
          min={0}
          max={100}
          value={border.width}
          onChange={(width) => {
            if (typeof width === "number" && width >= 0 && width <= 100)
              patch({ border: { ...border, width } });
          }}
        />
        <Select
          aria-label="Border style"
          label="Style"
          size="xs"
          data={[
            { value: "solid", label: "Solid" },
            { value: "dashed", label: "Dashed" },
            { value: "dotted", label: "Dotted" },
          ]}
          value={border.style}
          onChange={(value) => {
            if (value)
              patch({
                border: { ...border, style: value as typeof border.style },
              });
          }}
        />
      </div>
    </section>
  );
}
export function ShadowFields({
  id,
  layer,
}: {
  id: string;
  layer: Extract<Layer, { type: "shape" | "image" }>;
}) {
  const dispatch = useSetAtom(designCommandAtom);
  const preview = useColorPreview(id);
  const shadow = layer.shadow;
  function patch(value: LayerPatch) {
    dispatch({ type: "layer.update", ids: [id], patch: value });
  }
  return (
    <section>
      <div className={styles.sectionHead}>
        <h3>Shadow</h3>
        <ActionIcon
          aria-label={shadow ? "Remove shadow" : "Add shadow"}
          variant="subtle"
          color="gray"
          size="xs"
          onClick={() =>
            patch({
              shadow: shadow
                ? null
                : { x: 0, y: 8, blur: 24, spread: 0, color: "#00000033" },
            })
          }
        >
          {shadow ? <X size={14} /> : <Plus size={14} />}
        </ActionIcon>
      </div>
      {shadow && (
        <>
          <div className={styles.fieldRow}>
            <label>Color</label>
            <ColorInput
              aria-label="Shadow color"
              value={shadow.color}
              onPreview={(color) =>
                preview({ kind: "shadow", id, layer }, color)
              }
              onChangeEnd={(color) => patch({ shadow: { ...shadow, color } })}
            />
          </div>
          <div className={styles.doubleGrid}>
            {(
              [
                { key: "x", label: "X", min: -500, max: 500 },
                { key: "y", label: "Y", min: -500, max: 500 },
                { key: "blur", label: "Blur", min: 0, max: 200 },
                { key: "spread", label: "Spread", min: -200, max: 200 },
              ] as const
            ).map(({ key, label, min, max }) => (
              <NumberInput
                key={key}
                aria-label={`Shadow ${key}`}
                label={label}
                suffix="px"
                hideControls
                size="xs"
                min={min}
                max={max}
                value={shadow[key]}
                onChange={(value) => {
                  if (typeof value === "number" && value >= min && value <= max)
                    patch({ shadow: { ...shadow, [key]: value } });
                }}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
