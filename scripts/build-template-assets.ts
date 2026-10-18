import { templateSource } from "./template-source";
import { creativeFamilies } from "../packages/cv/src/templates/types";
/** Embed licensed assets once for Worker and editable offline TSX rendering. */
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
const creativePortrait = await Bun.file(
  new URL("packages/cv/assets/creative-portrait.webp", root),
).arrayBuffer();
const artwork = Object.fromEntries(
  await Promise.all(
    ["architecture", "coast"].map(async (name) => [
      name,
      `data:image/webp;base64,${Buffer.from(await Bun.file(new URL(`packages/cv/assets/${name}.webp`, root)).arrayBuffer()).toString("base64")}`,
    ]),
  ),
);
const photoLicense = await Bun.file(
  new URL("packages/cv/assets/photos.json", root),
).text();
const interLicense = await Bun.file(
  new URL("node_modules/@fontsource-variable/inter/LICENSE", root),
).text();
const lucideLicense = await Bun.file(
  new URL("node_modules/lucide-react/LICENSE", root),
).text();
const brands = (await Bun.file(
  new URL("packages/assets/data/brands.json", root),
).json()) as {
  credits: { MIT: string };
  icons: {
    id: string;
    name: string;
    viewBox: string;
    source: string;
    license: string;
    parts: { path: string; fill: string; fillRule?: "nonzero" | "evenodd" }[];
  }[];
};
const brandIds = [
  "brand-figma",
  "brand-typescript",
  "brand-html5",
  "brand-css3",
  "brand-storybook",
  "brand-sketch",
  "brand-illustrator",
  "brand-blender",
];
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
    creativePortrait: `data:image/webp;base64,${Buffer.from(creativePortrait).toString("base64")}`,
    artwork,
    photoLicense,
    license: `${interLicense.trim()}\n\n${lucideLicense.trim()}`,
    brandLicense: brands.credits.MIT.trim(),
    brands: brands.icons
      .filter((brand) => brandIds.includes(brand.id))
      .map(({ name, viewBox, source, license, parts }) => ({
        name,
        viewBox,
        source,
        license,
        parts,
      })),
  }) + "\n",
);
console.log(
  `Template assets: font ${font.byteLength} bytes; portrait ${portrait.byteLength} bytes.`,
);

const component = await templateSource(root);
await Bun.write(
  new URL("packages/cv/src/source/template.generated.json", root),
  JSON.stringify(component) + "\n",
);

const creative = Object.fromEntries(
  await Promise.all(
    creativeFamilies.map(async (family) => [
      family,
      await templateSource(root, family),
    ]),
  ),
);
await Bun.write(
  new URL("packages/cv/src/source/creative-template.generated.json", root),
  JSON.stringify(creative) + "\n",
);
