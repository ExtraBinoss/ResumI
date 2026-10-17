import { useAtomValue } from "jotai";
import { blockAtom } from "../../state/editor";
import { selectedIdsAtom } from "../../state/design";
import controls from "./styles/Controls.module.css";

/** Measurement chrome has its own final canvas plane, above every document layer. */
export function SelectionMeasurements() {
  const selected = useAtomValue(selectedIdsAtom),
    block = useAtomValue(blockAtom(selected.length === 1 ? selected[0] : ""));
  const layer = block?.design;
  if (!layer || layer.hidden || layer.locked) return null;
  return (
    <div
      aria-hidden
      className={controls.measurementPlane}
      style={{
        left: layer.x,
        top: layer.y,
        width: layer.width,
        height: layer.height,
        transform: `rotate(${layer.rotation}deg)`,
      }}
    >
      <span className={controls.size}>
        {Math.round(layer.width)} × {Math.round(layer.height)}
      </span>
    </div>
  );
}
