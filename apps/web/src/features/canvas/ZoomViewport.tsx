import { useAtomValue } from "jotai";
import type { ReactNode } from "react";
import { zoomAtom } from "../../state/editor";
import { useCanvasPan } from "./useCanvasPan";
import styles from "./styles/Canvas.module.css";
import viewportStyles from "./styles/Viewport.module.css";

/** Source, text and structured views use the canvas scale and gesture controller. */
export function ZoomViewport({
  children,
  width = 794,
  height = 900,
  className = "",
  onBlankClick,
  initialFit,
  contained = false,
}: {
  children: ReactNode;
  width?: number;
  height?: number;
  className?: string;
  onBlankClick?: () => void;
  initialFit?: string;
  contained?: boolean;
}) {
  const pan = useCanvasPan({
      initialFit: initialFit ? { id: initialFit, width, height } : undefined,
    }),
    zoom = useAtomValue(zoomAtom);
  return (
    <div
      className={`${styles.viewport} ${viewportStyles.scroll} ${className}`}
      data-contained-viewport={contained || undefined}
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
