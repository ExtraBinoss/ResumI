import { test } from "@playwright/test";
import {
  groupedLayerJourney,
  shapeAppearanceJourney,
  imageCropJourney,
} from "./helpers/layer-journeys";

test("layers multi-select → group appearance/movement → lock/hide/undo → persisted text/visual editing", async ({
  page,
}) => {
  await groupedLayerJourney(page);
});

test("shape picker → drawn canvas shape → brightness/blur/gradient → faithful portable HTML", async ({
  page,
}) => {
  await shapeAppearanceJourney(page);
});

test("synthetic image upload → crop and pointer resize → persistent visual document", async ({
  page,
}) => {
  await imageCropJourney(page);
});
