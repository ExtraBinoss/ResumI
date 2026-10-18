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
  capturePdf: async (html, width, height, react) => {
    const { renderPdf } = await import("./pdf-capture");
    return renderPdf(html, width, height, react);
  },
  fetchText: async (url) => {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(10_000),
      credentials: "omit",
      redirect: "error",
    });
    if (!response.ok)
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    const text = await response.text();
    if (text.length > 1_000_000)
      throw new Error("Documentation exceeds the 1 MB limit");
    return text;
  },
  id: () => crypto.randomUUID(),
});
if (result.stdout) process.stdout.write(result.stdout);
if (result.stderr) process.stderr.write(result.stderr);
process.exitCode = result.exit;
