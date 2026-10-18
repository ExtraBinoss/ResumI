import { expect, test } from "bun:test";
import { runCli, type IO } from "../src/handler";

test("screenshot validates before capture, uses portable source, and writes binary only after successful rendering", async () => {
  const files = new Map<string, string>();
  let captures = 0,
    writes = 0;
  const io: IO = {
    id: () => "screenshot-document",
    read: async (path) => files.get(path)!,
    write: async (path, text) => {
      files.set(path, text);
    },
    capture: async (html, width, height) => {
      captures++;
      expect(html).toContain("Content-Security-Policy");
      expect(html).toContain("resumi-source");
      return {
        bytes: new Uint8Array([137, 80, 78, 71]),
        width,
        height,
        blockedRequests: [],
      };
    },
    writeBinary: async (_path, bytes) => {
      writes++;
      expect(bytes[0]).toBe(137);
    },
  };
  await runCli(
    ["new", "--template", "react-classic", "--out", "Alex.json"],
    io,
  );
  for (const extra of [
    [],
    ["--out", "bad.jpg"],
    ["--out", "Alex.png", "--width", "0"],
    ["--out", "Alex.png", "--height", "10001"],
  ])
    expect((await runCli(["screenshot", "Alex.json", ...extra], io)).exit).toBe(
      2,
    );
  expect(captures).toBe(0);
  const result = await runCli(
    ["screenshot", "Alex.json", "--out", "Alex.png"],
    io,
  );
  expect(result.exit).toBe(0);
  expect(JSON.parse(result.stdout)).toMatchObject({
    width: 794,
    height: 1123,
    out: "Alex.png",
    blockedRequests: [],
  });
  expect(writes).toBe(1);
  expect(
    (
      await runCli(["screenshot", "Alex.json", "--out", "failed.png"], {
        ...io,
        capture: async () => {
          throw Error("Render failed");
        },
      })
    ).exit,
  ).toBe(3);
  expect(writes).toBe(1);
  expect(
    (
      await runCli(["screenshot", "Alex.json", "--out", "failed.png"], {
        ...io,
        writeBinary: async () => {
          throw Error("Read-only disk");
        },
      })
    ).exit,
  ).toBe(4);
});
