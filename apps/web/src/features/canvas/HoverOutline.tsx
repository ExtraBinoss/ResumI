import { createPortal } from "react-dom";
import type { Layer } from "@resumi/engine";
import styles from "./styles/HoverOutline.module.css";

/** Hover feedback belongs to chrome, outside document blend and opacity groups. */
export function HoverOutline({
  id,
  layer,
  overlay,
}: {
  id: string;
  layer: Layer;
  overlay: HTMLDivElement;
}) {
  return createPortal(
    <div
      aria-hidden="true"
      data-hover-frame={id}
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
