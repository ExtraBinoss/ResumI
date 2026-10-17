import { expect, test } from "bun:test";
import { vectorSchema } from "../../packages/engine/src/canvas/schema";
import catalog from "../../apps/web/src/data/brands.json";

test("all fifty local brand vectors validate and retain pinned source licenses", () => {
  expect(catalog.icons).toHaveLength(50);
  expect(new Set(catalog.icons.map((icon) => icon.id)).size).toBe(50);
  for (const icon of catalog.icons) {
    expect(() =>
      vectorSchema.parse({
        path: icon.path,
        viewBox: icon.viewBox,
        parts: icon.parts,
        attribution:
          catalog.credits[icon.license as keyof typeof catalog.credits],
      }),
    ).not.toThrow();
    expect(icon.source).toMatch(
      /^https:\/\/(github.com|raw.githubusercontent.com)\//,
    );
  }
  expect(
    new Set(
      catalog.icons
        .find((icon) => icon.name === "Figma")!
        .parts.map((part) => part.fill),
    ).size,
  ).toBe(5);
  expect(
    new Set(
      catalog.icons
        .find((icon) => icon.name === "Microsoft")!
        .parts.map((part) => part.fill),
    ).size,
  ).toBe(4);
  expect(catalog.credits.MIT).toContain("MIT License");
  expect(catalog.credits["CC0-1.0"]).toContain("CC0");
});
