import { expect, test } from "bun:test";
import { runCli, type IO } from "../src/handler";
import { githubDocsUrl } from "../src/docs";

const io: IO = {
  id: () => "docs",
  read: async () => {
    throw Error("no project");
  },
  write: async () => {
    throw Error("no writes");
  },
  fetchText: async () => {
    throw Error("offline docs attempted network");
  },
};
test("docs/help topics cover pages, exports and the agent workflow entirely offline", async () => {
  for (const topic of [
    "agent",
    "pages",
    "exports",
    "pdf",
    "source",
    "design",
    "assets",
    "commands",
    "screenshot",
    "all",
  ]) {
    const docs = await runCli(["docs", topic], io),
      help = await runCli(["help", topic], io);
    expect(docs.exit).toBe(0);
    expect(docs.stderr).toBe("");
    expect(docs.stdout).toBe(help.stdout);
  }
  const all = (await runCli(["docs", "all"], io)).stdout;
  for (const text of [
    "page.create",
    "--out-dir",
    "--pages 2,1",
    "--format tsx",
    "--format source",
    "--page",
    "--source github",
    "CV + cover letter",
  ])
    expect(all).toContain(text);
  expect((await runCli(["docs", "unknown"], io)).exit).toBe(2);
  expect((await runCli(["docs", "agent", "extra"], io)).exit).toBe(2);
  expect((await runCli(["docs", "--source", "other"], io)).exit).toBe(2);
});
test("GitHub docs fetch is explicit, fixed and fails with actionable offline fallback", async () => {
  let calls = 0;
  const remote = {
    ...io,
    fetchText: async (url: string) => {
      calls++;
      expect(url).toBe(githubDocsUrl);
      return "# Public agent guide\n";
    },
  };
  expect(
    (await runCli(["docs", "agent", "--source", "github"], remote)).stdout,
  ).toBe("# Public agent guide\n");
  expect(
    (await runCli(["docs", "pages", "--source", "github"], remote)).exit,
  ).toBe(2);
  expect(calls).toBe(1);
  const failed = await runCli(["docs", "--source", "github"], {
    ...io,
    fetchText: async () => {
      throw Error("HTTP 404 Not Found");
    },
  });
  expect(failed.exit).toBe(4);
  expect(failed.stderr).toContain("HTTP 404");
  expect(failed.stderr).toContain("docs agent");
  expect(failed.stderr).toContain("offline");
});
