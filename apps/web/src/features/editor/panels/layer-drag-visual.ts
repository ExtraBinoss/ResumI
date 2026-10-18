import { motionValue, springValue, styleEffect } from "motion/react";
import styles from "../styles/LayerDrag.module.css";

type Point = { x: number; y: number };

/** An inert copy stays in hand even when the live tree reparents its original row. */
export function layerDragVisual(
  node: HTMLElement,
  start: Point,
  reduced: boolean,
) {
  const bounds = node.getBoundingClientRect();
  const ghost = node.cloneNode(true) as HTMLElement;
  for (const element of [ghost, ...ghost.querySelectorAll("*")]) {
    for (const name of element.getAttributeNames())
      if (
        name === "id" ||
        name.startsWith("data-layer-") ||
        name === "data-drop-position"
      )
        element.removeAttribute(name);
  }
  ghost.classList.add(styles.dragGhost);
  ghost.dataset.layerDragGhost = "true";
  ghost.setAttribute("aria-hidden", "true");
  ghost.inert = true;
  Object.assign(ghost.style, {
    left: `${bounds.left}px`,
    top: `${bounds.top}px`,
    width: `${bounds.width}px`,
    height: `${bounds.height}px`,
    transformOrigin: `${start.x - bounds.left}px ${start.y - bounds.top}px`,
  });
  document.body.appendChild(ghost);
  const x = motionValue(0),
    y = motionValue(0),
    tilt = motionValue(0),
    lift = motionValue(1);
  const spring = { stiffness: 1600, damping: 75, mass: 0.6 };
  const followLift = reduced ? lift : springValue(lift, spring);
  const followTilt = reduced ? tilt : springValue(tilt, spring);
  const detach = styleEffect(ghost, {
    x,
    y,
    rotate: followTilt,
    scale: followLift,
  });
  lift.set(reduced ? 1 : 1.025);
  let last = start,
    time = performance.now();
  return {
    move(point: Point) {
      const now = performance.now(),
        elapsed = Math.max(1, now - time);
      x.set(point.x - start.x);
      y.set(point.y - start.y);
      tilt.set(
        reduced
          ? 0
          : Math.max(-2, Math.min(2, ((point.x - last.x) / elapsed) * 0.8)),
      );
      last = point;
      time = now;
    },
    dispose() {
      detach();
      for (const value of new Set([x, y, tilt, lift, followLift, followTilt]))
        value.destroy();
      ghost.remove();
    },
  };
}
