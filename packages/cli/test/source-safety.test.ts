import { expect, test } from "bun:test";
import {
  applyCommand,
  createDocument,
  serializeDocument,
} from "@resumi/engine";
import { runCli, type IO } from "../src/handler";

test("CLI validates, inspects and exports React or HTML source without executing it", async () => {
  const marker = globalThis as typeof globalThis & {
    __resumiCliSourceExecuted?: boolean;
  };
  marker.__resumiCliSourceExecuted = false;
  try {
    for (const source of [
      {
        format: "react" as const,
        code: "globalThis.__resumiCliSourceExecuted = true; export default function Resume() { return <main>Safe export</main>; }",
      },
      {
        format: "html" as const,
        code: "<script>globalThis.__resumiCliSourceExecuted = true</script><main>Safe export</main>",
      },
    ]) {
      const doc = applyCommand(createDocument("source-document"), {
        type: "source.set",
        source,
      });
      const files = new Map<string, string>([
        ["source.json", serializeDocument(doc)],
      ]);
      const io: IO = {
        id: () => "unused",
        read: async (path) => files.get(path)!,
        write: async (path, value) => {
          files.set(path, value);
        },
      };
      for (const command of [
        ["document", "validate", "source.json"],
        ["document", "inspect", "source.json"],
        [
          "document",
          "render",
          "source.json",
          "--format",
          "html",
          "--out",
          "resume.html",
        ],
      ]) {
        const result = await runCli(command, io);
        expect(result.exit).toBe(0);
        expect(result.stderr).toBe("");
        expect(marker.__resumiCliSourceExecuted).toBeFalse();
      }
      expect(files.get("resume.html")).toContain("Content-Security-Policy");
      expect(files.get("resume.html")).toContain("Safe export");
    }
  } finally {
    delete marker.__resumiCliSourceExecuted;
  }
});
