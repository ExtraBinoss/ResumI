import { Glob } from "bun";
import { mkdir } from "node:fs/promises";
const source = [
  ...new Glob("packages/engine/src/**/*.ts").scanSync("."),
].sort();
await mkdir("coverage", { recursive: true });
// Explicitly import EVERY source module; a new untested module cannot disappear from accounting.
const preload = `${process.cwd()}/coverage/all-engine.ts`;
await Bun.write(
  preload,
  source
    .map((path) => `import ${JSON.stringify(`${process.cwd()}/${path}`)};`)
    .join("\n"),
);
const run = Bun.spawn(
  [
    "bun",
    "test",
    "packages/engine/test",
    "--preload",
    preload,
    "--coverage",
    "--coverage-reporter=lcov",
    "--coverage-reporter=text",
    "--coverage-dir=coverage/engine",
  ],
  { stdout: "inherit", stderr: "inherit" },
);
if (await run.exited) process.exit(1);
const lcov = await Bun.file("coverage/engine/lcov.info").text();
let lines = 0,
  hitLines = 0,
  functions = 0,
  hitFunctions = 0;
const covered = new Set<string>();
for (const record of lcov.split("end_of_record")) {
  const path = record.match(/^SF:(.+)$/m)?.[1];
  if (!path || !path.includes("packages/engine/src/")) continue;
  covered.add(path.slice(path.indexOf("packages/engine/src/")));
  const count = (key: string) =>
    Number(record.match(new RegExp(`^${key}:(\\d+)$`, "m"))?.[1] ?? 0);
  lines += count("LF");
  hitLines += count("LH");
  functions += count("FNF");
  hitFunctions += count("FNH");
}
const missing = source.filter(
  (path) => !covered.has(path) && !path.endsWith("/index.ts"),
);
const lineRate = lines ? hitLines / lines : 0,
  functionRate = functions ? hitFunctions / functions : 0;
console.log(
  `Engine: ${(lineRate * 100).toFixed(2)}% lines; ${(functionRate * 100).toFixed(2)}% functions. Threshold: 85% each.`,
);
if (missing.length || lineRate < 0.85 || functionRate < 0.85) {
  console.error("Coverage gate failed.", { missing });
  process.exit(1);
}
