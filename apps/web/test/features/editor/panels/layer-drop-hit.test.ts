import { expect, test } from "bun:test";
import {
  containsLayerPoint,
  layerLayoutBox,
} from "../../../../src/features/editor/panels/layer-drop-hit";

test("a moving row's logical slot stays hittable before its spring reaches the top", () => {
  const painted = { left: 20, top: 291, width: 240, height: 38 };
  const logical = layerLayoutBox(painted, [{ x: 0, y: 80 }]);
  const pointer = { x: 142, y: 214 };
  expect(containsLayerPoint(painted, pointer)).toBe(false);
  expect(logical).toEqual({ left: 20, top: 211, width: 240, height: 38 });
  expect(containsLayerPoint(logical, pointer)).toBe(true);
});

test("nested group and member translations cancel independently without widening drop bounds", () => {
  const logical = layerLayoutBox(
    { left: 22, top: 355, width: 230, height: 38 },
    [
      { x: 2, y: 100 },
      { x: 0, y: -35 },
    ],
  );
  expect(logical).toEqual({ left: 20, top: 290, width: 230, height: 38 });
  expect(containsLayerPoint(logical, { x: 25, y: 295 })).toBe(true);
  expect(containsLayerPoint(logical, { x: 19, y: 295 })).toBe(false);
  expect(containsLayerPoint(logical, { x: 25, y: 329 })).toBe(false);
});
