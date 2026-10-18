import { expect, test } from "bun:test";
import {
  snapMovement,
  resizeFrame,
  resizeHandles,
} from "../../src/lib/geometry";

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

test("eight resize handles preserve the opposite anchor and aspect ratio, including rotated layers", () => {
  const frame = { x: 30, y: 40, width: 100, height: 60, rotation: 0 };
  expect(resizeFrame(frame, "nw", 20, 10)).toEqual({
    x: 50,
    y: 50,
    width: 80,
    height: 50,
  });
  expect(resizeFrame(frame, "e", 20, 10)).toEqual({
    x: 30,
    y: 40,
    width: 120,
    height: 60,
  });
  expect(resizeFrame(frame, "n", 0, 100).height).toBe(8);
  const locked = resizeFrame(frame, "se", 20, 0, true);
  expect(locked.width / locked.height).toBeCloseTo(frame.width / frame.height);
  const rotated = resizeFrame({ ...frame, rotation: 90 }, "e", 0, 20);
  expect(rotated.width).toBeCloseTo(120);
  expect(rotated.x).toBeCloseTo(20);
  expect(rotated.y).toBeCloseTo(50);
  for (const handle of resizeHandles) {
    const result = resizeFrame(frame, handle, 15, 12);
    expect(result.width).toBeGreaterThanOrEqual(8);
    expect(result.height).toBeGreaterThanOrEqual(8);
  }
});
