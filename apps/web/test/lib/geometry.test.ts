import { expect, test } from "bun:test";
import { snapMovement } from "../../src/lib/geometry";

test("moving layers snaps the nearest edge or center independently on each axis", () => {
  const frame = { x: 10, y: 20, width: 100, height: 60 };
  expect(snapMovement(frame, 5, 7, { x: [118], y: [56] }, 4)).toEqual({
    dx: 8,
    dy: 6,
    guideX: 118,
    guideY: 56,
  });
  expect(snapMovement(frame, 5, 7, { x: [500], y: [500] }, 4)).toEqual({
    dx: 5,
    dy: 7,
    guideX: undefined,
    guideY: undefined,
  });
  expect(snapMovement(frame, 0, 0, { x: [14], y: [20] }, 4)).toEqual({
    dx: 4,
    dy: 0,
    guideX: 14,
    guideY: 20,
  });
  const targets = { x: [63, 64], y: [] };
  expect(snapMovement(frame, 0, 0, targets, 5).dx).toBe(3);
  expect(frame).toEqual({ x: 10, y: 20, width: 100, height: 60 });
  expect(targets).toEqual({ x: [63, 64], y: [] });
});
