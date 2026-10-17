import { expect, test } from "bun:test";
import { runCli, type IO } from "../src/handler";
const io: IO = {
  read: async () => {
    throw Error("not available");
  },
  write: async () => {},
  id: () => "discovery",
};

test("agent help exposes authoring and visual feedback; command discovery follows engine schema", async () => {
  const general = await runCli(["--help"], io);
  for (const command of [
    "screenshot",
    "output",
    "templates",
    "assets",
    "capabilities",
    "document source",
  ])
    expect(general.stdout).toContain(command);
  for (const topic of ["design", "source", "assets", "commands", "screenshot"])
    expect((await runCli(["help", topic], io)).stdout.length).toBeGreaterThan(
      500,
    );
  const found = JSON.parse((await runCli(["commands"], io)).stdout)
    .commands as string[];
  expect(found).toContain("source.set");
  expect(found).toContain("text.range.format");
  expect(found).toContain("translation.set");
  expect(new Set(found).size).toBe(found.length);
  const capabilities = JSON.parse((await runCli(["capabilities"], io)).stdout);
  expect(capabilities.commands).toEqual(found);
  expect(capabilities.boundaries.projects).toContain("IndexedDB");
});

test("template and shared asset discovery returns usable artwork with original brand colors and credits", async () => {
  const templates = JSON.parse(
    (await runCli(["templates", "list"], io)).stdout,
  ).templates;
  expect(
    templates.some((entry: { id: string }) => entry.id === "react-classic"),
  ).toBe(true);
  expect(
    (await runCli(["templates", "inspect", "react-classic"], io)).stdout,
  ).toContain("complete editable TSX");
  const brands = JSON.parse(
    (await runCli(["assets", "list", "--kind", "brands"], io)).stdout,
  );
  expect(brands.total).toBe(50);
  const figma = JSON.parse(
    (
      await runCli(
        ["assets", "list", "--kind", "brands", "--search", "figma"],
        io,
      )
    ).stdout,
  );
  expect(figma.assets.map((item: { id: string }) => item.id)).toEqual([
    "brand-figma",
  ]);
  const svg = await runCli(
    ["assets", "show", "brand-figma", "--format", "svg"],
    io,
  );
  expect(svg.stdout).toContain("<svg");
  expect(svg.stdout).toContain("<metadata>");
  expect(svg.stdout).toContain("MIT License");
  expect(svg.stdout).toContain('fill="#f24e1e"');
  expect(svg.stdout).toContain('fill="#1abcfe"');
  expect(
    (await runCli(["assets", "show", "lucide:mail"], io)).stdout,
  ).toContain('"strokeOnly": true');
  expect((await runCli(["assets", "show", "rectangle"], io)).exit).toBe(0);
  for (const args of [
    ["templates", "inspect", "missing"],
    ["assets", "list", "--kind", "invented"],
    ["assets", "show", "missing"],
    ["assets", "list", "--limit", "0"],
    ["assets", "show", "brand-figma", "--limit", "2"],
  ])
    expect((await runCli(args, io)).exit).toBe(2);
});
