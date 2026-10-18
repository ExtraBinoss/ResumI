import { useEffect, useRef, type CSSProperties } from "react";
import { useReducedMotion } from "motion/react";
import { mountOrb } from "./thinking-orb/mount";
import type { OrbVariant, OrbSize } from "./thinking-orb/presets";
import styles from "./ThinkingOrb.module.css";
export type { OrbVariant, OrbSize } from "./thinking-orb/presets";

/** Locally vendored monochrome Canvas2D variants; no provider or remote assets. */
export function ThinkingOrb({
  variant = "breathing",
  size = 64,
  speed = 1,
  paused = false,
  className = "",
  style,
}: {
  variant?: OrbVariant;
  size?: OrbSize;
  speed?: number;
  paused?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  const canvas = useRef<HTMLCanvasElement>(null),
    reduced = useReducedMotion();
  useEffect(() => {
    if (!canvas.current) return;
    return mountOrb(canvas.current, {
      variant,
      size,
      speed,
      paused,
      reduced:
        reduced ?? matchMedia("(prefers-reduced-motion: reduce)").matches,
    });
  }, [variant, size, speed, paused, reduced]);
  return (
    <canvas
      ref={canvas}
      width={size}
      height={size}
      className={`${styles.orb} ${className}`}
      style={{ width: size, height: size, ...style }}
      data-thinking-orb={variant}
      data-running="false"
      aria-hidden="true"
    />
  );
}
