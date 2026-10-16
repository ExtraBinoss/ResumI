export type Frame = { x: number; y: number; width: number; height: number };
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
