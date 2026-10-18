import { test, expect } from "bun:test";
import { runCli, type IO } from "../src/handler";
const files = new Map<string, string>();
const io: IO = {
  id: () => "cli-document",
  read: async (path) => {
    if (!files.has(path)) throw Error();
    return files.get(path)!;
  },
  write: async (path, data) => {
    files.set(path, data);
  },
};
test("CLI create → inspect → validate → atomic apply → real render", async () => {
  expect((await runCli(["--help"], io)).stdout).toContain("Exit codes");
  expect(
    (await runCli(["document", "create", "--out", "cv.json"], io)).exit,
  ).toBe(0);
  expect(
    JSON.parse((await runCli(["document", "inspect", "cv.json"], io)).stdout)
      .document.id,
  ).toBe("cli-document");
  expect(
    JSON.parse((await runCli(["document", "validate", "cv.json"], io)).stdout)
      .valid,
  ).toBe(true);
  files.set(
    "patch.json",
    JSON.stringify({
      version: 1,
      actor: { kind: "agent", name: "Codex" },
      commands: [{ type: "document.update", name: "CLI edited" }],
    }),
  );
  expect(
    (
      await runCli(
        ["document", "apply", "cv.json", "patch.json", "--out", "edited.json"],
        io,
      )
    ).exit,
  ).toBe(0);
  expect(files.get("cv.json")).not.toBe(files.get("edited.json"));
  expect(
    (
      await runCli(
        [
          "document",
          "render",
          "edited.json",
          "--format",
          "html",
          "--out",
          "preview.html",
        ],
        io,
      )
    ).exit,
  ).toBe(0);
  expect(files.get("preview.html")).toContain("<title>CLI edited</title>");
  expect(files.get("preview.html")).toContain("Alex Morgan");
  expect((await runCli(["document", "schema"], io)).stdout).toContain(
    "section.create",
  );
});
test("CLI errors are actionable JSON stderr with explicit exit codes", async () => {
  for (const args of [
    ["bad"],
    ["document", "bad"],
    ["document", "inspect"],
    ["document", "create", "extra"],
    ["document", "create", "--x", "y"],
    ["document", "create", "--out"],
    ["document", "create", "--template", "bad"],
    ["document", "inspect", "cv.json", "--out", "x"],
    ["document", "create", "--out", "a", "--out", "b"],
  ]) {
    const result = await runCli(args, io);
    expect(result.exit).toBe(2);
    expect(JSON.parse(result.stderr).error.message).toBeTruthy();
    expect(result.stdout).toBe("");
  }
  expect((await runCli(["document", "inspect", "missing.json"], io)).exit).toBe(
    4,
  );
  files.set("bad.json", "{}");
  expect((await runCli(["document", "validate", "bad.json"], io)).exit).toBe(3);
  files.set("invalid-patch.json", "{");
  expect(
    (await runCli(["document", "apply", "cv.json", "invalid-patch.json"], io))
      .exit,
  ).toBe(3);
  expect((await runCli(["document", "render", "cv.json"], io)).exit).toBe(2);
  expect(
    (
      await runCli(["document", "create", "--out", "bad"], {
        ...io,
        write: async () => {
          throw Error();
        },
      })
    ).exit,
  ).toBe(4);
});
