import { expect, test } from "bun:test";
import { deserializeDocument } from "@resumi/engine";
import { runCli, type IO } from "../src/handler";

function memory() {
  const files = new Map<string, string>();
  const io: IO = {
    id: () => "cli-output",
    read: async (path) => {
      if (!files.has(path)) throw Error("missing");
      return files.get(path)!;
    },
    write: async (path, text) => {
      files.set(path, text);
    },
  };
  return { files, io };
}
test("new alias names via engine, project filename resolves, raw JSON/HTML/source output stays portable", async () => {
  const { io, files } = memory();
  expect(
    (
      await runCli(
        [
          "new",
          "--template",
          "react-classic",
          "--name",
          "Alex application",
          "--out",
          "Alex.json",
        ],
        io,
      )
    ).exit,
  ).toBe(0);
  const original = files.get("Alex.json")!;
  const raw = await runCli(["output", "Alex", "--format", "json"], io);
  expect(deserializeDocument(raw.stdout).name).toBe("Alex application");
  expect(
    (await runCli(["output", "Alex", "--format", "source"], io)).stdout,
  ).toContain("export default function");
  expect(
    (
      await runCli(
        ["output", "Alex", "--format", "html", "--out", "Alex.html"],
        io,
      )
    ).exit,
  ).toBe(0);
  expect(files.get("Alex.html")).toContain("Content-Security-Policy");
  expect(files.get("Alex.html")).toContain("Alex application");
  expect(files.get("Alex.json")).toBe(original);
  expect((await runCli(["output", "missing"], io)).stderr).toContain(
    "private IndexedDB",
  );
});
test("source file uses a validated atomic command; compile and engine errors never overwrite input", async () => {
  const { io, files } = memory();
  await runCli(["new", "--out", "Alex.json"], io);
  const original = files.get("Alex.json");
  files.set(
    "Resume.tsx",
    "export default function Resume() { return <main><h1>Alex</h1><p>Designer</p></main>; }",
  );
  const source = await runCli(
    [
      "document",
      "source",
      "Alex",
      "--file",
      "Resume.tsx",
      "--actor",
      "Designer agent",
      "--out",
      "edited.json",
    ],
    io,
  );
  expect(source.exit).toBe(0);
  expect(JSON.parse(source.stdout).actor.name).toBe("Designer agent");
  expect(deserializeDocument(files.get("edited.json")!).source?.format).toBe(
    "react",
  );
  files.set("bad.tsx", "export default function {");
  expect(
    (
      await runCli(
        [
          "document",
          "source",
          "Alex",
          "--file",
          "bad.tsx",
          "--out",
          "Alex.json",
        ],
        io,
      )
    ).exit,
  ).toBe(3);
  expect(files.get("Alex.json")).toBe(original);
  files.set("large.html", "x".repeat(200001));
  expect(
    (
      await runCli(
        [
          "document",
          "source",
          "Alex",
          "--file",
          "large.html",
          "--out",
          "Alex.json",
        ],
        io,
      )
    ).exit,
  ).toBe(3);
  expect(files.get("Alex.json")).toBe(original);
  expect(
    (await runCli(["output", "Alex", "--format", "source"], io)).exit,
  ).toBe(3);
  expect((await runCli(["output", "Alex", "--format", "pdf"], io)).exit).toBe(
    2,
  );
});
