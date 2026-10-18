import { expect, test } from "bun:test";
import {
  projectZoomLayout,
  projectZoomPosition,
  type ZoomLayout,
} from "../../src/features/canvas/zoom-layout";

const layout: ZoomLayout = {
  width: 1000,
  height: 800,
  paperWidth: 794,
  paperHeight: 1123,
  padding: { left: 32, right: 32, top: 32, bottom: 76 },
  scrollbar: { width: 10, height: 10 },
};

test("small pages occupy the centered bounded stage with no invented scroll range", () => {
  expect(projectZoomLayout(layout, 0.5)).toEqual({
    left: 301.5,
    top: 97.25,
    maxScrollLeft: 0,
    maxScrollTop: 0,
  });
  expect(
    projectZoomPosition(layout, 0.5, {
      x: 100,
      y: 100,
      viewportX: 150,
      viewportY: 150,
    }),
  ).toEqual({
    left: 301.5,
    top: 97.25,
    scrollLeft: 0,
    scrollTop: 0,
  });
});

test("large pages retain reachable pointer anchors in both axes", () => {
  expect(
    projectZoomPosition(layout, 2, {
      x: 400,
      y: 500,
      viewportX: 400,
      viewportY: 300,
    }),
  ).toEqual({
    left: -400,
    top: -700,
    scrollLeft: 432,
    scrollTop: 732,
  });
});

test("unreachable anchors finish at the real start or end of the scroll range", () => {
  expect(
    projectZoomPosition(layout, 2, {
      x: 0,
      y: 0,
      viewportX: 500,
      viewportY: 400,
    }),
  ).toEqual({
    left: 32,
    top: 32,
    scrollLeft: 0,
    scrollTop: 0,
  });
  expect(
    projectZoomPosition(layout, 2, {
      x: 794,
      y: 1123,
      viewportX: 0,
      viewportY: 0,
    }),
  ).toEqual({
    left: -630,
    top: -1532,
    scrollLeft: 662,
    scrollTop: 1564,
  });
});

test("future scrollbar coupling is included before the layout commits", () => {
  expect(projectZoomLayout({ ...layout, width: 860 }, 1)).toEqual({
    left: 32,
    top: 32,
    maxScrollLeft: 8,
    maxScrollTop: 441,
  });
  expect(
    projectZoomLayout({ ...layout, scrollbar: { width: 0, height: 0 } }, 1),
  ).toEqual({
    left: 103,
    top: 32,
    maxScrollLeft: 0,
    maxScrollTop: 431,
  });
});
