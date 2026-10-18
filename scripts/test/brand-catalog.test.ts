import { expect, test } from "bun:test";
import { vectorSchema } from "../../packages/engine/src/canvas/schema";
import catalog from "../../packages/assets/data/brands.json";
import agentSources from "../../packages/assets/data/agents/sources.json";
import { agentBrandCatalog } from "../agent-brand-catalog";

test("all local brand vectors validate and retain documented source licenses", () => {
  expect(catalog.icons).toHaveLength(51 + agentSources.length);
  expect(new Set(catalog.icons.map((icon) => icon.id)).size).toBe(
    catalog.icons.length,
  );
  expect(
    catalog.icons.find((icon) => icon.id === "brand-linkedin")?.parts,
  ).toHaveLength(2);
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
    const agentSource = agentSources.find((source) => source.id === icon.id);
    if (agentSource) expect(icon.source).toBe(agentSource.source);
    else
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

test("AI marks retain reviewed primary-source geometry and full provenance", async () => {
  const agents = await agentBrandCatalog();
  expect(agents.icons.map((icon) => icon.id)).toEqual(
    agentSources.map((item) => item.id),
  );
  for (const icon of agents.icons) {
    const stored = catalog.icons.find((item) => item.id === icon.id);
    expect(stored).toBeDefined();
    if (!stored) throw new Error(`Missing generated brand: ${icon.id}`);
    expect(stored.name).toBe(icon.name);
    expect(stored.source).toBe(icon.source);
    expect(stored.license).toBe(icon.license);
    expect(
      vectorSchema.parse({
        path: stored.path,
        viewBox: stored.viewBox,
        parts: stored.parts,
      }),
    ).toEqual(
      vectorSchema.parse({
        path: icon.path,
        viewBox: icon.viewBox,
        parts: icon.parts,
      }),
    );
    expect(agents.credits[icon.license]).toContain("Original SHA-256:");
    expect(agents.credits[icon.license]).toContain(
      "No affiliation or endorsement",
    );
  }
  expect(
    catalog.icons.find((icon) => icon.id === "brand-linkedin"),
  ).toBeDefined();
});
