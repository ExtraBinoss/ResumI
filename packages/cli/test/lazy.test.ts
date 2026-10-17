import { expect, test } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createDocument, serializeDocument } from "@resumi/engine";

test("help and JSON output work when browser, React renderer and source compiler imports are denied", async () => {
  const directory = await mkdtemp(join(tmpdir(), "resumi-cli-lazy-"));
  try {
    const guard = join(directory, "guard.ts"),
      project = join(directory, "project.json");
    await Bun.write(
      guard,
      `import {plugin} from "bun";
plugin({name:"deny-heavy-cli-imports",setup(build){
  build.onResolve({filter:/^(?:react|react-dom|@playwright\\/test|sucrase)(?:\\/.*)?$/},({path})=>{throw Error("Eager heavy import: "+path)})
}});`,
    );
    await Bun.write(
      project,
      serializeDocument(createDocument("lazy-document", "Synthetic lazy CV")),
    );
    const main = new URL("../src/main.ts", import.meta.url).pathname;
    for (const args of [["--help"], ["output", project, "--format", "json"]]) {
      const process = Bun.spawn(["bun", "--preload", guard, main, ...args], {
        stdout: "pipe",
        stderr: "pipe",
      });
      const [stdout, stderr, exit] = await Promise.all([
        new Response(process.stdout).text(),
        new Response(process.stderr).text(),
        process.exited,
      ]);
      expect(exit).toBe(0);
      expect(stderr).toBe("");
      expect(stdout).toContain(
        args[0] === "--help" ? "screenshot" : "Synthetic lazy CV",
      );
    }
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
