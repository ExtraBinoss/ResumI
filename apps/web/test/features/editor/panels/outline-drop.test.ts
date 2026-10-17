import { expect, test } from "bun:test";
import { outlineDropTarget } from "../../../../src/features/editor/panels/outline-drop";

const slots = [
  { id: "personal", midpoint: 179 },
  { id: "profile", midpoint: 321 },
  { id: "experience", midpoint: 433 },
];

test("outline insertion follows header slots regardless of a section's child height or preview order", () => {
  expect(outlineDropTarget(slots, "profile", 163, 0)).toEqual({
    id: "personal",
    edge: "above",
  });
  // Returning to the original slot restores the original order instead of sticking to a moved DOM row.
  expect(outlineDropTarget(slots, "profile", 322, 0)).toEqual({
    id: "experience",
    edge: "above",
  });
  expect(outlineDropTarget(slots, "profile", 460, 0)).toEqual({
    id: "experience",
    edge: "below",
  });
});

test("native scrolling shifts original slots without remeasuring the reordered preview", () => {
  expect(outlineDropTarget(slots, "profile", 163, 100)).toEqual({
    id: "experience",
    edge: "above",
  });
  expect(outlineDropTarget(slots, "profile", 60, 100)).toEqual({
    id: "personal",
    edge: "above",
  });
  expect(
    outlineDropTarget([{ id: "only", midpoint: 20 }], "only", 10, 0),
  ).toBeNull();
});
