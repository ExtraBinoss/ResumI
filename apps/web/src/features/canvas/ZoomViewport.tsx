import { useAtomValue } from "jotai";
import type { ReactNode } from "react";
import { zoomAtom } from "../../state/editor";
import { useCanvasPan } from "./useCanvasPan";
import styles from "./styles/Canvas.module.css";
import viewportStyles from "./styles/Viewport.module.css";

/** The text workspace uses exactly the canvas scale, anchoring and pan controller. */
export function ZoomViewport({
  children,
  width = 794,
  height = 900,
  className = "",
  onBlankClick,
}: {
  children: ReactNode;
  width?: number;
  height?: number;
  className?: string;
  onBlankClick?: () => void;
}) {
  const pan = useCanvasPan(),
    zoom = useAtomValue(zoomAtom);
  return (
    <div
      className={`${styles.viewport} ${viewportStyles.scroll} ${className}`}
      {...pan}
      onClick={(event) => {
        if (event.target === event.currentTarget) onBlankClick?.();
      }}
    >
      <div
        className={styles.stage}
        onClick={(event) => {
          if (event.target === event.currentTarget) onBlankClick?.();
        }}
      >
        <div
          className={styles.paperBounds}
          style={{ width: (width * zoom) / 100, height: (height * zoom) / 100 }}
        >
          <div
            data-zoom-surface
            className={styles.zoomSurface}
            style={{ width, height, transform: `scale(${zoom / 100})` }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
