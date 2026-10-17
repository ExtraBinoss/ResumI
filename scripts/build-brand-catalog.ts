import { vectorSchema } from "../packages/engine/src/canvas/schema";

const iconifyRevision = "69ca5094ddd4aad6d797e689bb13ee8b692ae232";
const logosRevision = "4a5b550414be64d5c007574cd395d910d50e8950";
const sourceUrl = `https://raw.githubusercontent.com/iconify/icon-sets/${iconifyRevision}/json/devicon.json`;
const microsoftUrl = `https://raw.githubusercontent.com/gilbarbara/logos/${logosRevision}/logos/microsoft-icon.svg`;
const root = new URL("../packages/assets/data/", import.meta.url);
async function read(url: string) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${response.status}: ${url}`);
  return response.text();
}
const [source, microsoft, mit, cc0] = await Promise.all([
  read(sourceUrl),
  read(microsoftUrl),
  read(
    "https://raw.githubusercontent.com/devicons/devicon/6a37858047b0e8d9c9c0e68f4a071fc410652e89/LICENSE",
  ),
  read(
    `https://raw.githubusercontent.com/gilbarbara/logos/${logosRevision}/LICENSE.txt`,
  ),
]);
const catalog = JSON.parse(source) as {
  width: number;
  height: number;
  icons: Record<string, { body: string; width?: number; height?: number }>;
};
const choices: [string, string, string][] = [
  ["figma", "Figma", "Design"],
  ["google", "Google", "Platforms"],
  ["vuejs", "Vue", "Development"],
  ["svelte", "Svelte", "Development"],
  ["nuxtjs", "Nuxt", "Development"],
  ["typescript", "TypeScript", "Development"],
  ["javascript", "JavaScript", "Development"],
  ["rust", "Rust", "Development"],
  ["swift", "Swift", "Development"],
  ["java", "Java", "Development"],
  ["cplusplus", "C++", "Development"],
  ["csharp", "C#", "Development"],
  ["html5", "HTML", "Development"],
  ["css3", "CSS", "Development"],
  ["tailwindcss", "Tailwind CSS", "Development"],
  ["sass", "Sass", "Development"],
  ["bun", "Bun", "Development"],
  ["denojs", "Deno", "Development"],
  ["laravel", "Laravel", "Development"],
  ["flask", "Flask", "Development"],
  ["fastapi", "FastAPI", "Development"],
  ["postgresql", "PostgreSQL", "Development"],
  ["mysql", "MySQL", "Development"],
  ["mongodb", "MongoDB", "Development"],
  ["docker", "Docker", "Development"],
  ["kubernetes", "Kubernetes", "Development"],
  ["git", "Git", "Development"],
  ["github", "GitHub", "Platforms"],
  ["gitlab", "GitLab", "Platforms"],
  ["android", "Android", "Platforms"],
  ["apple", "Apple", "Platforms"],
  ["windows11", "Windows", "Platforms"],
  ["slack", "Slack", "Platforms"],
  ["notion", "Notion", "Platforms"],
  ["sketch", "Sketch", "Design"],
  ["photoshop", "Adobe Photoshop", "Design"],
  ["illustrator", "Adobe Illustrator", "Design"],
  ["xd", "Adobe XD", "Design"],
  ["premierepro", "Adobe Premiere Pro", "Design"],
  ["aftereffects", "Adobe After Effects", "Design"],
  ["blender", "Blender", "Design"],
  ["unity", "Unity", "Design"],
  ["cloudflare", "Cloudflare", "Platforms"],
  ["vercel", "Vercel", "Platforms"],
  ["netlify", "Netlify", "Platforms"],
  ["amazonwebservices", "AWS", "Platforms"],
  ["googlecloud", "Google Cloud", "Platforms"],
  ["npm", "npm", "Development"],
  ["storybook", "Storybook", "Development"],
];
function attributes(tag: string) {
  return Object.fromEntries(
    Array.from(tag.matchAll(/([\w-]+)="([^"]*)"/g), (match) => [
      match[1],
      match[2],
    ]),
  );
}
function color(value = "#000000") {
  if (value === "none") return "transparent";
  if (value === "white") return "#ffffff";
  if (value === "black") return "#000000";
  if (value === "gray") return "#808080";
  if (/^#[a-f\d]{3}$/i.test(value))
    return `#${value
      .slice(1)
      .split("")
      .map((char) => char + char)
      .join("")}`;
  return value;
}
/** Trusted, pinned catalog only: fail on any unexpected XML instead of dropping its appearance. */
function parts(body: string) {
  const allowed = new Set([
    "d",
    "fill",
    "stroke",
    "stroke-width",
    "fill-rule",
    "clip-rule",
    "opacity",
    "stroke-linecap",
    "stroke-linejoin",
  ]);
  const stack: Record<string, string>[] = [{}];
  const result = [];
  const tokens = /<\/?g\b[^>]*>|<path\b[^>]*\/>/g;
  if (body.replace(tokens, "").trim())
    throw new Error("Unexpected catalog SVG element");
  for (const match of body.matchAll(tokens)) {
    const tag = match[0];
    if (tag.startsWith("</g")) {
      stack.pop();
      continue;
    }
    const own = attributes(tag);
    if (Object.keys(own).some((key) => !allowed.has(key)))
      throw new Error(`Unexpected SVG attributes: ${tag.slice(0, 120)}`);
    const parent = stack[stack.length - 1];
    const paint = { ...parent, ...own };
    const opacity = Number(parent.opacity ?? 1) * Number(own.opacity ?? 1);
    paint.opacity = String(opacity);
    if (tag.startsWith("<g")) {
      stack.push(paint);
      continue;
    }
    result.push({
      path: own.d,
      fill: color(paint.fill),
      ...(paint.stroke ? { stroke: color(paint.stroke) } : {}),
      ...(paint["stroke-width"]
        ? { strokeWidth: Number(paint["stroke-width"]) }
        : {}),
      ...(opacity !== 1 ? { opacity } : {}),
      ...(paint["fill-rule"] ? { fillRule: paint["fill-rule"] } : {}),
      ...(paint["stroke-linecap"] ? { linecap: paint["stroke-linecap"] } : {}),
      ...(paint["stroke-linejoin"]
        ? { linejoin: paint["stroke-linejoin"] }
        : {}),
    });
  }
  return result;
}
const icons = choices.map(([id, name, category]) => {
  const icon = catalog.icons[id];
  if (!icon) throw new Error(`Missing brand: ${id}`);
  const layers = parts(icon.body);
  const vector = vectorSchema.parse({
    path: layers[0].path,
    viewBox: `0 0 ${icon.width ?? catalog.width} ${icon.height ?? catalog.height}`,
    parts: layers,
  });
  return {
    id: `brand-${id}`,
    name,
    category,
    source: `https://github.com/iconify/icon-sets/blob/${iconifyRevision}/json/devicon.json`,
    license: "MIT",
    ...vector,
  };
});
const microsoftLayers = parts(
  microsoft
    .replace(/^[\s\S]*?<svg[^>]*>/, "")
    .replace(/<\/svg>\s*$/, "")
    .replace(/<title>[\s\S]*?<\/title>/g, "")
    .replace(/<polygon\b([^>]*)><\/polygon>/g, (_tag, source: string) => {
      const values = attributes(source);
      const points = values.points.trim().split(/[\s,]+/);
      const pairs = Array.from(
        { length: points.length / 2 },
        (_, index) => `${points[index * 2]} ${points[index * 2 + 1]}`,
      );
      return `<path fill="${values.fill}" d="M${pairs.join("L")}Z"/>`;
    }),
);
const microsoftBox = attributes(microsoft.match(/<svg[^>]*>/)![0]).viewBox;
icons.push({
  id: "brand-microsoft",
  name: "Microsoft",
  category: "Platforms",
  source: microsoftUrl,
  license: "CC0-1.0",
  ...vectorSchema.parse({
    path: microsoftLayers[0].path,
    viewBox: microsoftBox,
    parts: microsoftLayers,
  }),
});
if (icons.length !== 50)
  throw new Error(`Expected 50 brands, got ${icons.length}`);
await Bun.write(
  new URL("brands.json", root),
  JSON.stringify({ credits: { MIT: mit, "CC0-1.0": cc0 }, icons }) + "\n",
);
await Bun.write(new URL("licenses/devicon-MIT.txt", root), mit);
await Bun.write(new URL("licenses/svg-logos-CC0.txt", root), cc0);
console.log(
  `Wrote ${icons.length} validated original-color brands from pinned sources.`,
);
