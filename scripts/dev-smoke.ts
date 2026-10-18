import { mkdtemp, mkdir, rm } from "node:fs/promises";
import { join, resolve } from "node:path";

const root = process.cwd(),
  web = join(root, "apps/web");
const cache = await mkdtemp(join(web, "node_modules/.vite-smoke-"));
const port = process.env.RESUMI_DEV_CHECK_PORT ?? "5189";
const url = `http://127.0.0.1:${port}`;
const server = Bun.spawn(
  [
    join(root, "node_modules/.bin/vite"),
    "--host",
    "127.0.0.1",
    "--port",
    port,
    "--strictPort",
  ],
  {
    cwd: web,
    env: { ...process.env, RESUMI_VITE_CACHE_DIR: cache },
    stdout: "pipe",
    stderr: "pipe",
  },
);
const stdout = new Response(server.stdout).text(),
  stderr = new Response(server.stderr).text();
let exit = 1;
try {
  const started = performance.now();
  // A fresh optimizer builds both SSR and browser graphs. Give that initial
  // compilation its own budget; browser hydration/editing keep their deadlines.
  const deadline = Date.now() + 120000;
  while (true) {
    const remaining = deadline - Date.now();
    if (remaining <= 0)
      throw new Error("Development server startup timed out.");
    if (server.exitCode !== null)
      throw new Error("Development server exited before first SSR request.");
    let response: Response;
    try {
      response = await fetch(url, {
        signal: AbortSignal.timeout(Math.min(90000, remaining)),
      });
    } catch {
      if (Date.now() > deadline)
        throw new Error("Development server startup timed out.");
      await Bun.sleep(150);
      continue;
    }
    // Do not hide first-render SSR errors behind warmup retries.
    if (!response.ok || !(await response.text()).includes("Your resume"))
      throw new Error(
        `First cold-cache SSR request failed: ${response.status}`,
      );
    break;
  }
  console.log(
    `Cold-cache first SSR: ${Math.round(performance.now() - started)} ms.`,
  );
  const tests = Bun.spawn(
    [
      join(root, "node_modules/.bin/playwright"),
      "test",
      "--grep",
      "SSR|human editor|HTML and React sources",
    ],
    {
      cwd: root,
      env: { ...process.env, BASE_URL: url },
      stdout: "inherit",
      stderr: "inherit",
    },
  );
  exit = await tests.exited;
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
} finally {
  if (server.exitCode !== null) exit = 1;
  server.kill("SIGTERM");
  await server.exited;
  const log = (await stdout) + "\n" + (await stderr);
  await mkdir(resolve("artifacts"), { recursive: true });
  await Bun.write("artifacts/dev-smoke.log", log.replace(/[ \t]+$/gm, ""));
  if (
    /Invalid hook call|reading 'useMemoCache'|A PostCSS plugin did not pass/.test(
      log,
    )
  ) {
    console.error("Development SSR/runtime or CSS regression detected.");
    exit = 1;
  }
  await rm(cache, { recursive: true, force: true });
}
console.log(
  `Cold-cache development check: ${exit === 0 ? "passed" : "failed"}. See artifacts/dev-smoke.log.`,
);
process.exitCode = exit;
