/** Embed the licensed font and synthetic portrait once for Worker and offline TSX rendering. */
const root = new URL("../", import.meta.url);
const font = await Bun.file(
  new URL(
    "node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2",
    root,
  ),
).arrayBuffer();
const portrait = await Bun.file(
  new URL("packages/cv/assets/alex-morgan-portrait.jpg", root),
).arrayBuffer();
const interLicense = await Bun.file(
  new URL("node_modules/@fontsource-variable/inter/LICENSE", root),
).text();
const lucideLicense = await Bun.file(
  new URL("node_modules/lucide-react/LICENSE", root),
).text();
await Bun.write(
  new URL("packages/cv/assets/inter-license.txt", root),
  interLicense,
);
await Bun.write(
  new URL("packages/cv/assets/lucide-license.txt", root),
  lucideLicense,
);
await Bun.write(
  new URL("packages/cv/src/templates/assets.generated.json", root),
  JSON.stringify({
    font: `data:font/woff2;base64,${Buffer.from(font).toString("base64")}`,
    portrait: `data:image/jpeg;base64,${Buffer.from(portrait).toString("base64")}`,
    license: `${interLicense.trim()}\n\n${lucideLicense.trim()}`,
  }) + "\n",
);
console.log(
  `Template assets: font ${font.byteLength} bytes; portrait ${portrait.byteLength} bytes.`,
);

const component = await Bun.file(
  new URL("packages/cv/src/templates/CodeResume.tsx", root),
).text();
await Bun.write(
  new URL("packages/cv/src/source/template.generated.json", root),
  JSON.stringify(component) + "\n",
);
