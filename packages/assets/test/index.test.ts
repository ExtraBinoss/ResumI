import { expect, test } from "bun:test";
import { vectorSchema } from "@resumi/engine";
import { assetSvg, loadAssets } from "../src";

test("all shared catalog vectors satisfy engine schema; original brand credits and compound paints survive SVG output", async () => {
  for (const kind of ["shapes", "icons", "brands"] as const) {
    const entries = await loadAssets(kind);
    expect(entries.length).toBeGreaterThan(0);
    expect(new Set(entries.map((entry) => entry.id)).size).toBe(entries.length);
    for (const entry of entries) {
      const { path, viewBox, strokeOnly, parts, attribution } = entry;
      expect(() =>
        vectorSchema.parse({ path, viewBox, strokeOnly, parts, attribution }),
      ).not.toThrow();
    }
  }
  const microsoft = (await loadAssets("brands")).find(
    (entry) => entry.id === "brand-microsoft",
  )!;
  expect(microsoft.parts?.length).toBe(4);
  const svg = assetSvg(microsoft);
  expect(svg).toContain("CC0 1.0");
  expect(svg).toContain(microsoft.source!);
  expect(svg.match(/<path /g)).toHaveLength(4);
  const linkedin = (await loadAssets("brands")).find(
    (entry) => entry.id === "brand-linkedin",
  )!;
  expect(linkedin.parts?.map((part) => part.fill)).toEqual([
    "#0076b2",
    "#ffffff",
  ]);
  expect(linkedin.license).toBe("MIT");
  expect(linkedin.source).toContain("devicon.json");
  expect(assetSvg(linkedin)).toContain(linkedin.source!);
});
