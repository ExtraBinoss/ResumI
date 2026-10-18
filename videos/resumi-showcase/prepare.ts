import { copyFile, mkdir, writeFile } from "node:fs/promises";
import { chromium } from "@playwright/test";
import {
  createResume,
  resumeCss,
  templates,
} from "../../packages/cv/src/index";
import { renderTemplateResume } from "../../packages/cv/src/templates/render";

// All input is shipped, fictional demo content. Never uses an existing profile.
const root = new URL("./", import.meta.url);
const asset = new URL("assets/", root);
const capture = new URL("capture-local/", root);
await Promise.all(
  ["templates/", "fonts/", "brands/", "screens/"].map((dir) =>
    mkdir(new URL(dir, asset), { recursive: true }),
  ),
);
await mkdir(new URL("extracted/", capture), { recursive: true });
const runtime = await fetch(
  "https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js",
);
if (!runtime.ok) throw new Error(`GSAP download failed: ${runtime.status}`);
await writeFile(
  new URL("gsap.min.js", asset),
  new Uint8Array(await runtime.arrayBuffer()),
);
const brand = new URL("../../assets/ssr-image/assets/", root);
for (const name of ["space-grotesk", "source-sans-3"]) {
  await copyFile(
    new URL(`${name}.woff2`, brand),
    new URL(`fonts/${name}.woff2`, asset),
  );
  await copyFile(
    new URL(`${name}-LICENSE.txt`, brand),
    new URL(`fonts/${name}-LICENSE.txt`, asset),
  );
}
for (const name of ["claude", "openai", "grok", "cursor", "opencode", "meta"]) {
  await copyFile(
    new URL(`${name}.svg`, brand),
    new URL(`brands/${name}.svg`, asset),
  );
}
await copyFile(
  new URL("resumi-tray.png", brand),
  new URL("brands/resumi.png", asset),
);
const catalog = templates.filter((template) => !template.legacy);
const manifest = catalog.map((template) => ({
  id: template.id,
  name: template.name.replace(/^React /, ""),
  path: `assets/templates/${template.id}.webp`,
}));
for (const template of catalog) {
  await copyFile(
    new URL(`../../apps/web/src/assets/templates/${template.id}.webp`, root),
    new URL(`templates/${template.id}.webp`, asset),
  );
}
await writeFile(
  new URL("templates.json", asset),
  JSON.stringify(manifest, null, 2) + "\n",
);
const browser = await chromium.launch();
try {
  const page = await browser.newPage({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
    reducedMotion: "reduce",
    colorScheme: "light",
  });
  await page.goto("http://127.0.0.1:5173/", { waitUntil: "networkidle" });
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(
      [...document.images]
        .filter((image) => image.complete)
        .map((image) => image.decode().catch(() => undefined)),
    );
  });
  await page.screenshot({
    path: new URL("screens/landing.png", asset).pathname,
  });
  const text = await page.locator("body").innerText();
  await writeFile(new URL("extracted/visible-text.txt", capture), text);
  await page.goto("http://127.0.0.1:5173/editor?template=react-polaroid", {
    waitUntil: "networkidle",
  });
  await page.getByRole("article", { name: "Resume canvas" }).waitFor();
  await page.locator("[data-layer-id]").first().waitFor();
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(
      [...document.images].map((image) => image.decode().catch(() => {})),
    );
  });
  await page.screenshot({
    path: new URL("screens/editor.png", asset).pathname,
  });
  // Crisp A4 hero pages; the wall uses the existing smaller thumbnails.
  await page.setViewportSize({ width: 794, height: 1123 });
  for (const id of [
    "react-polaroid",
    "react-risograph",
    "react-nocturne",
    "react-cassette",
    "react-chroma",
  ]) {
    const html = renderTemplateResume(createResume(`video-${id}`, id));
    await page.setContent(
      `<!doctype html><html><head><meta charset="utf-8"><style>${resumeCss}body{margin:0}.resume{margin:0}</style></head><body>${html}</body></html>`,
    );
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all([...document.images].map((image) => image.decode()));
    });
    await page.locator(".resume.cv-sheet").screenshot({
      path: new URL(`templates/${id}.png`, asset).pathname,
      scale: "css",
    });
  }
} finally {
  await browser.close();
}
// The workflow's staging helper indexes basenames. Keep its aliases local too.
for (const path of [
  "screens/landing.png",
  "screens/editor.png",
  ...["polaroid", "cassette", "nocturne", "risograph", "chroma"].map(
    (name) => `templates/react-${name}.png`,
  ),
  "brands/resumi.png",
  ...["claude", "openai", "grok", "cursor", "opencode", "meta"].map(
    (name) => `brands/${name}.svg`,
  ),
]) {
  await copyFile(new URL(path, asset), new URL(path.split("/").at(-1)!, asset));
}
await writeFile(
  new URL("extracted/tokens.json", capture),
  JSON.stringify(
    {
      title: "ResumI",
      description: "Your resume just got a new teammate.",
      colors: ["#fafafa", "#202024", "#2563eb", "#63636d"],
      fonts: ["Space Grotesk", "Source Sans 3"],
    },
    null,
    2,
  ) + "\n",
);
await writeFile(
  new URL("extracted/asset-descriptions.md", capture),
  [
    "# Provided repository material, captured locally",
    "The HyperFrames URL capture returned HTTP 403 and its partial files are not used.",
    "Fresh Playwright browser captured the actual local repository application, no existing storage or profile.",
    "- assets/screens/landing.png — real landing viewport at 1920×1080",
    "- assets/screens/editor.png — real editor, fictional Polaroid template, 1920×1080",
    "- assets/brands/resumi.png — official shipped ResumI tray logo",
    "- assets/brands/{claude,openai,grok,cursor,opencode,meta}.svg — shipped vetted agent marks",
    ...manifest.map(
      (item) =>
        `- ${item.path} — ${item.name}, public fictional template, 440×622`,
    ),
    "- assets/templates/{react-polaroid,react-risograph,react-nocturne,react-cassette,react-chroma}.png — crisp render from the actual TSX template, 794×1123",
    "- assets/fonts/{space-grotesk,source-sans-3}.woff2 — site variable fonts, licenses alongside",
  ].join("\n") + "\n",
);
console.log(
  `Prepared ${manifest.length} templates and real, isolated UI screenshots.`,
);
