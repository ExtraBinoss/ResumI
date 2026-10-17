import { expect, test } from "bun:test";
import { orbFrame } from "../../../src/components/thinking-orb/frame";
import type {
  OrbVariant,
  OrbSize,
} from "../../../src/components/thinking-orb/presets";
import golden from "./golden.json";

test("both vendored orb variants retain the complete upstream golden geometry at both sizes and four phases", () => {
  expect(golden.cases).toHaveLength(16);
  for (const sample of golden.cases) {
    const frame = orbFrame(
      sample.state as OrbVariant,
      sample.size as OrbSize,
      sample.t,
    );
    expect(frame.dots.length, sample.key).toBe(sample.dotCount);
    const values = frame.dots.flatMap((dot) => [
      dot.x,
      dot.y,
      dot.z,
      dot.r,
      dot.white,
      dot.a ?? 1,
    ]);
    expect(values.length, sample.key).toBe(sample.dots.length);
    let maximumError = 0;
    for (let i = 0; i < values.length; i++)
      maximumError = Math.max(
        maximumError,
        Math.abs(values[i] - sample.dots[i]),
      );
    expect(maximumError, sample.key).toBeLessThan(golden.tolerance);
  }
});
