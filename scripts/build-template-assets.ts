import { templateSource } from "./template-source";
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
