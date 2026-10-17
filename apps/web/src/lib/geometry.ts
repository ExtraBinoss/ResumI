export type Frame = { x: number; y: number; width: number; height: number };
export const resizeHandles = [
  "nw",
  "n",
  "ne",
  "e",
  "se",
  "s",
  "sw",
  "w",
] as const;
export type ResizeHandle = (typeof resizeHandles)[number];

/** Resize in the element's local axes, preserving the opposite rotated anchor. */
export function resizeFrame(
  frame: Frame & { rotation: number },
  handle: ResizeHandle,
  dx: number,
  dy: number,
  aspectLocked = false,
): Frame {
  const angle = (frame.rotation * Math.PI) / 180,
    cos = Math.cos(angle),
    sin = Math.sin(angle);
  const localX = dx * cos + dy * sin,
    localY = dy * cos - dx * sin;
  const hx = handle.includes("w") ? -1 : handle.includes("e") ? 1 : 0;
  const hy = handle.includes("n") ? -1 : handle.includes("s") ? 1 : 0;
  let width = Math.min(5000, Math.max(8, frame.width + hx * localX));
  let height = Math.min(5000, Math.max(8, frame.height + hy * localY));
  if (aspectLocked) {
    const ratio = frame.width / frame.height;
    if (
      !hy ||
      (hx &&
        Math.abs(width - frame.width) / frame.width >=
          Math.abs(height - frame.height) / frame.height)
    )
      height = Math.min(5000, Math.max(8, width / ratio));
    else width = Math.min(5000, Math.max(8, height * ratio));
  }
  const cx = ((width - frame.width) * hx) / 2,
    cy = ((height - frame.height) * hy) / 2;
  return {
    x: frame.x + frame.width / 2 + cx * cos - cy * sin - width / 2,
    y: frame.y + frame.height / 2 + cx * sin + cy * cos - height / 2,
    width,
    height,
  };
}
/** Interaction-only snapping; canonical coordinates are committed through engine commands. */
export function snapMovement(
  frame: Frame,
  dx: number,
  dy: number,
  targets: { x: number[]; y: number[] },
  tolerance: number,
) {
  function axis(start: number, size: number, delta: number, points: number[]) {
    let distance = tolerance + 0.0001,
      adjustment = 0,
      guide: number | undefined;
    for (const point of points)
      for (const offset of [0, size / 2, size]) {
        const difference = point - (start + delta + offset);
        if (Math.abs(difference) < distance) {
          distance = Math.abs(difference);
          adjustment = difference;
          guide = point;
        }
      }
    return { delta: delta + adjustment, guide };
  }
  const x = axis(frame.x, frame.width, dx, targets.x),
    y = axis(frame.y, frame.height, dy, targets.y);
  return { dx: x.delta, dy: y.delta, guideX: x.guide, guideY: y.guide };
}
