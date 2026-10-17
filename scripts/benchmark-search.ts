import { cpus } from "node:os";
import { mkdir } from "node:fs/promises";
import { createSearchIndex } from "../apps/web/src/lib/search-index";
import googleFonts from "../apps/web/src/features/editor/panels/google-fonts.generated.json";
import icons from "../apps/web/src/data/icons.json";
import shapes from "../apps/web/src/data/shapes.json";
import brands from "../apps/web/src/data/brands.json";
import { templates } from "../packages/cv/src/templates/catalog";

type Item = { name: string; category: string };
const cases: { name: string; items: Item[]; queries: string[] }[] = [
  {
    name: "templates",
    items: templates
      .filter((template) => !template.legacy)
      .map((template) => ({
        name: template.name.replace(/^React /, ""),
        category: template.font,
      })),
    queries: [
      "s",
      "st",
      "studio",
      "editorial",
      "serif",
      "classic",
      "profile",
      "sans",
      "edit",
      "zzmissing",
    ],
  },
  {
    name: "google-fonts",
    items: googleFonts.map((font) => ({
      name: font.family,
      category: font.category,
    })),
    queries: [
      "r",
      "ro",
      "roboto",
      "noto sans",
      "mono",
      "serif",
      "playfair",
      "space",
      "école",
      "zzmissing",
    ],
  },
  {
    name: "icons-shapes-brands",
    items: [...icons, ...shapes, ...brands.icons].map((item) => ({
      name: item.name,
      category: "category" in item ? (item.category ?? "") : "",
    })),
    queries: [
      "m",
      "me",
      "message",
      "arrow left",
      "circle",
      "figma",
      "microsoft",
      "box",
      "heart",
      "zzmissing",
    ],
  },
  {
    name: "synthetic-files-50000",
    items: Array.from({ length: 50_000 }, (_, index) => ({
      name: `${["Alex Morgan", "Éditorial", "Studio", "Design Portfolio", "Resume"][index % 5]} — ${2020 + (index % 7)} — ${index}`,
      category: `resume project ${index % 13}`,
    })),
    queries: [
      "a",
      "al",
      "alex morgan",
      "studio",
      "2025",
      "design portfolio",
      "resume",
      "morgan 123",
      "edit 2023",
      "zzmissing",
    ],
  },
];
function percentile(samples: number[], ratio: number) {
  const sorted = [...samples].sort((a, b) => a - b);
  return sorted[
    Math.min(sorted.length - 1, Math.ceil(sorted.length * ratio) - 1)
  ];
}
const results = cases.map(({ name, items, queries }) => {
  const builds = [];
  for (let round = 0; round < 3; round++) {
    const start = performance.now();
    createSearchIndex(items, {
      text: (item) => item.name,
      keywords: (item) => item.category,
    });
    builds.push(performance.now() - start);
  }
  const index = createSearchIndex(items, {
    text: (item) => item.name,
    keywords: (item) => item.category,
  });
  const firstQueries = queries.map((query) => {
    const start = performance.now();
    const result = index.search(query, { limit: 100 });
    return {
      query,
      milliseconds: performance.now() - start,
      results: result.length,
    };
  });
  // No query-result cache: rotate queries each round and include broad and absent matches.
  for (let round = 0; round < 5; round++)
    for (const query of queries) index.search(query, { limit: 100 });
  const samples = [];
  for (let round = 0; round < 30; round++)
    for (const query of queries) {
      const start = performance.now();
      index.search(query, { limit: 100 });
      samples.push(performance.now() - start);
    }
  return {
    name,
    count: items.length,
    limit: 100,
    buildMedianMs: percentile(builds, 0.5),
    firstQueries,
    queryMedianMs: percentile(samples, 0.5),
    queryP95Ms: percentile(samples, 0.95),
    queryMaximumMs: Math.max(...samples),
    samples: samples.length,
  };
});
await mkdir("artifacts/performance", { recursive: true });
const report = {
  measuredAt: new Date().toISOString(),
  runtime: Bun.version,
  cpu: cpus()[0]?.model,
  methodology:
    "Bun in-process, 3 cold index builds; new final index, timed first queries; 5 untimed warm rounds; 30 timed rounds of 10 distinct queries, limit 100. Queries are not cached. Includes 1/2-character broad matches and misses. CPU search only; excludes rendering, DOM, I/O and network.",
  results,
};
await Bun.write(
  "artifacts/performance/search-index.json",
  JSON.stringify(report, null, 2) + "\n",
);
for (const result of results)
  console.log(
    JSON.stringify({
      name: result.name,
      count: result.count,
      buildMedianMs: result.buildMedianMs,
      queryMedianMs: result.queryMedianMs,
      queryP95Ms: result.queryP95Ms,
    }),
  );
