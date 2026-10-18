import { expect, test } from "bun:test";
import { deserializeDocument } from "@resumi/engine";
import { runCli, type IO } from "../src/handler";

test("new --blank creates a validated native canvas ready for arbitrary pages and rejects template conflicts", async () => {
  const files = new Map<string, string>();
  const io: IO = {
    id: () => "blank-application",
    read: async (path) => {
      if (!files.has(path)) throw Error("missing");
      return files.get(path)!;
    },
    write: async (path, data) => {
      files.set(path, data);
    },
  };
  const result = await runCli(
    [
      "new",
      "--blank",
      "--name",
      "CV + cover letter",
      "--out",
      "application.json",
    ],
    io,
  );
  expect(result.stderr).toBe("");
  expect(result.exit).toBe(0);
  const document = deserializeDocument(files.get("application.json")!);
  expect(document.name).toBe("CV + cover letter");
  expect(document.source).toBeUndefined();
  expect(document.sectionIds).toEqual([]);
  expect(document.canvas?.order).toEqual([]);
  expect(document.canvas?.width).toBe(794);
  files.set(
    "letter.json",
    JSON.stringify({
      version: 1,
      actor: { kind: "agent", name: "Writer" },
      commands: [
        {
          type: "page.create",
          page: {
            id: "letter",
            name: "Cover letter",
            width: 794,
            height: 1123,
            background: "#ffffff",
          },
        },
      ],
    }),
  );
  expect(
    (
      await runCli(
        [
          "document",
          "apply",
          "application",
          "letter.json",
          "--out",
          "application.json",
        ],
        io,
      )
    ).exit,
  ).toBe(0);
  expect(
    JSON.parse((await runCli(["pages", "application"], io)).stdout).pages.map(
      (page: { id: string }) => page.id,
    ),
  ).toEqual(["page-1", "letter"]);
  const before = files.get("application.json");
  for (const args of [
    ["--blank", "--template", "studio"],
    ["--blank", "--blank"],
    ["--blank", "false"],
  ])
    expect(
      (await runCli(["new", ...args, "--out", "application.json"], io)).exit,
    ).toBe(2);
  expect(files.get("application.json")).toBe(before);
});
