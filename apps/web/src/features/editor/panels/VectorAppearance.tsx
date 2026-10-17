import { useSetAtom } from "jotai";
import type { Layer } from "@resumi/engine";
import { ColorInput } from "../../../ui";
import { designCommandAtom } from "../../../state/design";
import styles from "../styles/Inspector.module.css";

/** Compound vectors expose their actual paints rather than an unused parent fill. */
export function VectorAppearance({
  id,
  layer,
}: {
  id: string;
  layer: Extract<Layer, { type: "shape" }>;
}) {
  const dispatch = useSetAtom(designCommandAtom);
  const vector = layer.vector!;
  const parts = vector.parts!;
  const colors = [
    ...new Set(parts.flatMap((part) => [part.fill, part.stroke])),
  ].filter((color): color is string => !!color && color !== "transparent");
  return (
    <section>
      <h3>Colors</h3>
      {colors.map((color, index) => (
        <div key={index} className={styles.fieldRow}>
          <label>Color {index + 1}</label>
          <ColorInput
            aria-label={"Vector color " + (index + 1)}
            value={color}
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
        </div>
      ))}
    </section>
  );
}
