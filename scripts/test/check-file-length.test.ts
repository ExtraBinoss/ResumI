import { test, expect } from "bun:test";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { physicalLines, scanFiles } from "../check-file-length";
test("physical line counting respects terminal newlines and CRLF", () => {
  expect(physicalLines("")).toBe(0);
  expect(physicalLines("a")).toBe(1);
  expect(physicalLines("a\n")).toBe(1);
  expect(physicalLines("a\r\nb")).toBe(2);
  expect(physicalLines("\n\n")).toBe(2);
});
test("generic recursive scanner includes future packages, custom extensions, exclusions and exact thresholds", async () => {
  const root = await mkdtemp(join(tmpdir(), "resumi-scan-"));
  try {
    for (const folder of ["future/nested", "node_modules/deep", "generated"])
      await mkdir(join(root, folder), { recursive: true });
    await writeFile(join(root, "future/nested/pass.ts"), "x\n".repeat(599));
    await writeFile(join(root, "future/fail.css"), "x\n".repeat(600));
    await writeFile(
      join(root, "node_modules/deep/ignore.ts"),
      "x\n".repeat(700),
    );
    await writeFile(join(root, "generated/ignore.ts"), "x\n".repeat(700));
    await writeFile(join(root, "worker.d.ts"), "x\n".repeat(700));
    await writeFile(join(root, "extra.custom"), "x\n".repeat(601));
    const result = await scanFiles(root, {
      exclude: ["generated", "worker.d.ts"],
    });
    expect(
      result.filter((r) => r.status === "fail").map((r) => r.path),
    ).toEqual(["future/fail.css"]);
    expect(result.find((r) => r.path.endsWith("pass.ts"))?.status).toBe("warn");
    expect((await scanFiles(root, { extensions: [".custom"] }))[0].status).toBe(
      "fail",
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
