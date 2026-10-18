import { createPortal } from "react-dom";
import type { Layer } from "@resumi/engine";
import styles from "./styles/HoverOutline.module.css";

/** Hover feedback belongs to chrome, outside document blend and opacity groups. */
export function HoverOutline({
  id,
  layer,
  overlay,
  source = "canvas",
}: {
  id: string;
  layer: Pick<Layer, "x" | "y" | "width" | "height" | "rotation" | "name">;
  overlay: HTMLDivElement;
  source?: "canvas" | "layers";
}) {
  return createPortal(
    <div
      aria-hidden="true"
      data-hover-frame={id}
      data-hover-source={source}
      className={styles.frame}
      style={{
        left: layer.x,
        top: layer.y,
        width: layer.width,
        height: layer.height,
        transform: `rotate(${layer.rotation}deg)`,
      }}
    >
      <span className={styles.label}>{layer.name}</span>
    </div>,
    overlay,
  );
}
