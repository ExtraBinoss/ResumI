import { createHash } from "node:crypto";
import { mkdir } from "node:fs/promises";
import { chromium } from "@playwright/test";
import { resumeCss } from "../packages/cv/src/index";
import {
  socialResume,
  socialSecondaryResume,
} from "../assets/ssr-image/resume";

// This build reads only the shipped, fictional Alex Morgan template and public
// brand assets. No workspace resume, browser profile or remote service is used.
const directory = new URL("../assets/ssr-image/", import.meta.url);
const assets = new URL("assets/", directory);
await mkdir(assets, { recursive: true });
const sources = {
  "resumi-tray.png": "apps/web/public/brand/resumi-tray-desktop.png",
  "space-grotesk-LICENSE.txt":
    "apps/web/node_modules/@fontsource-variable/space-grotesk/LICENSE",
  "source-sans-3-LICENSE.txt":
    "apps/web/node_modules/@fontsource-variable/source-sans-3/LICENSE",
  "space-grotesk.woff2":
    "apps/web/node_modules/@fontsource-variable/space-grotesk/files/space-grotesk-latin-wght-normal.woff2",
  "source-sans-3.woff2":
    "apps/web/node_modules/@fontsource-variable/source-sans-3/files/source-sans-3-latin-wght-normal.woff2",
  ...Object.fromEntries(
    ["claude", "openai", "grok", "cursor", "opencode", "meta"].map((id) => [
      `${id}.svg`,
      `apps/web/public/brands/agents/${id}.svg`,
    ]),
  ),
};
for (const [name, source] of Object.entries(sources))
  await Bun.write(
    new URL(name, assets),
    Bun.file(new URL(`../${source}`, import.meta.url)),
  );

const files = new Map(
  [
    "index.html",
    "styles.css",
    "assets/resume.png",
    "assets/resume-secondary.png",
    ...Object.keys(sources).map((name) => `assets/${name}`),
  ].map((name) => [`/${name}`, Bun.file(new URL(name, directory))]),
);
const server = Bun.serve({
  hostname: "127.0.0.1",
  port: 0,
  fetch(request) {
    const pathname = new URL(request.url).pathname;
    const file = files.get(pathname === "/" ? "/index.html" : pathname);
    return file
      ? new Response(file)
      : new Response("Not found", { status: 404 });
  },
});
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({
    viewport: { width: 794, height: 1123 },
    deviceScaleFactor: 1,
    reducedMotion: "reduce",
  });
  const sourceSans = Buffer.from(
    await Bun.file(new URL("source-sans-3.woff2", assets)).arrayBuffer(),
  ).toString("base64");
  const font = `data:font/woff2;base64,${sourceSans}`;
  for (const [name, resume] of [
    ["resume.png", socialResume(font)],
    ["resume-secondary.png", socialSecondaryResume(font)],
  ] as const) {
    await page.setContent(
      `<!doctype html><html><head><meta charset="utf-8"><style>${resumeCss}body{margin:0}.resume{margin:0}</style></head><body>${resume}</body></html>`,
    );
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all([...document.images].map((image) => image.decode()));
    });
    await page.locator(".resume.cv-sheet").screenshot({
      path: new URL(name, assets).pathname,
      animations: "disabled",
    });
  }
  await page.setViewportSize({ width: 1200, height: 630 });
  await page.goto(server.url.toString());
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].map((image) => image.decode()));
  });
  const output = new URL("../apps/web/public/og-image.png", import.meta.url);
  const png = await page.screenshot({
    path: output.pathname,
    animations: "disabled",
  });
  console.log(
    `og-image.png: 1200 × 630, ${png.length} bytes, sha256 ${createHash("sha256").update(png).digest("hex")}`,
  );
} finally {
  await browser.close();
  await server.stop(true);
}
