import { useAtomValue, useSetAtom } from "jotai";
import { Link2, Unlink } from "lucide-react";
import {
  boundsForElements,
  type Command,
  type LayerPatch,
} from "@resumi/engine";
import { sessionAtom, blockAtom } from "../../../state/editor";
import { designCommandAtom, selectedIdsAtom } from "../../../state/design";
import { ActionIcon, NumberInput } from "../../../ui";
import styles from "../styles/Inspector.module.css";

export function FrameProperties({ id }: { id: string }) {
  const document = useAtomValue(sessionAtom)!.document;
  const block = useAtomValue(blockAtom(id));
  const ids = useAtomValue(selectedIdsAtom);
  const dispatch = useSetAtom(designCommandAtom);
  if (!block?.design) return null;
  const layer = block.design;
  const multi = ids.length > 1;
  const bounds = boundsForElements(
    ids.map((key) => document.blocks[key].design!),
  );
  if (!bounds) return null;
  function patch(patch: LayerPatch) {
    dispatch({ type: "layer.update", ids, patch });
  }
  function geometry(
    key: "x" | "y" | "width" | "height",
    value: string | number,
  ) {
    if (
      typeof value !== "number" ||
      !Number.isFinite(value) ||
      value > 5000 ||
      value < (key === "x" || key === "y" ? -5000 : 1)
    )
      return;
    if (!multi) {
      const other = key === "width" ? "height" : "width";
      patch({
        [key]: value,
        ...((key === "width" || key === "height") && layer.aspectLocked
          ? { [other]: (layer[other] * value) / layer[key] }
          : {}),
      });
    } else if (key === "x" || key === "y") {
      dispatch({
        type: "layer.translate",
        ids,
        dx: key === "x" ? value - bounds!.x : 0,
        dy: key === "y" ? value - bounds!.y : 0,
      });
    } else {
      const scale = value / bounds![key];
      const commands: Command[] = ids.map((keyId) => {
        const current = document.blocks[keyId].design!;
        return {
          type: "layer.update",
          ids: [keyId],
          patch:
            key === "width"
              ? {
                  x: bounds!.x + (current.x - bounds!.x) * scale,
                  width: current.width * scale,
                }
              : {
                  y: bounds!.y + (current.y - bounds!.y) * scale,
                  height: current.height * scale,
                },
        };
      });
      dispatch({
        version: 1,
        actor: { kind: "human", name: "Editor" },
        commands,
      });
    }
  }
  return (
    <section>
      <h3>Frame</h3>
      <div className={styles.quadGrid}>
        {(["x", "y", "width", "height"] as const).map((key) => (
          <div key={key} className={styles.frameField}>
            <span aria-hidden>
              {{ x: "X", y: "Y", width: "W", height: "H" }[key]}
            </span>
            <NumberInput
              aria-label={`Layer ${key}`}
              hideControls
              size="xs"
              value={Math.round((multi ? bounds[key] : layer[key]) * 100) / 100}
              min={key === "x" || key === "y" ? -5000 : 1}
              max={5000}
              onChange={(value) => geometry(key, value)}
            />
          </div>
        ))}
      </div>
      {!multi && (
        <>
          <div className={styles.inlineField}>
            <span>Proportions</span>
            <ActionIcon
              aria-label={
                layer.aspectLocked ? "Unlock aspect ratio" : "Lock aspect ratio"
              }
              aria-pressed={layer.aspectLocked}
              size="sm"
              variant={layer.aspectLocked ? "light" : "subtle"}
              color="gray"
              onClick={() => patch({ aspectLocked: !layer.aspectLocked })}
            >
              {layer.aspectLocked ? <Link2 size={14} /> : <Unlink size={14} />}
            </ActionIcon>
          </div>
          <div className={styles.fieldRow}>
            <label>Rotation</label>
            <NumberInput
              aria-label="Rotation"
              size="xs"
              suffix="°"
              min={-360}
              max={360}
              value={layer.rotation}
              onChange={(value) => {
                if (typeof value === "number" && value >= -360 && value <= 360)
                  patch({ rotation: value });
              }}
            />
          </div>
        </>
      )}
    </section>
  );
}
