#!/usr/bin/env bun
import { runCli } from "./handler";
const result = await runCli(Bun.argv.slice(2), {
  read: (path) => Bun.file(path).text(),
  write: async (path, data) => {
    await Bun.write(path, data);
  },
  writeBinary: async (path, data) => {
    await Bun.write(path, data);
  },
  capture: async (html, width, height) => {
    const { captureScreenshot } = await import("./screenshot");
    return captureScreenshot(html, width, height);
  },
  id: () => crypto.randomUUID(),
});
if (result.stdout) process.stdout.write(result.stdout);
if (result.stderr) process.stderr.write(result.stderr);
process.exitCode = result.exit;
