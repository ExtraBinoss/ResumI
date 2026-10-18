import {
  assetKind,
  assetSvg,
  loadAssets,
  type AssetKind,
} from "@resumi/assets";
import { commandContract } from "@resumi/adapters/schema";
import { CliError, write, type IO } from "./io";
import { boundedInteger } from "./arguments";

export function commands() {
  const contract = commandContract as unknown as {
    properties: {
      commands: {
        items: { oneOf: { properties: { type: { const: string } } }[] };
      };
    };
  };
  return contract.properties.commands.items.oneOf.map(
    (variant) => variant.properties.type.const,
  );
}
export function capabilities() {
  return {
    schemaVersion: 1,
    commands: commands(),
    representations: [
      "visual canvas",
      "structured sections",
      "HTML/CSS",
      "single-file React TSX",
    ],
    features: [
      "freeform geometry",
      "new --blank creates an empty editable canvas with no saved source",
      "multiple visual pages with per-page size and background",
      "ordered page selection and separate per-page PDF/HTML/TSX exports",
      "offline docs/help and optional explicit public GitHub guide fetch",
      "flat groups",
      "z-order",
      "mixed text styling",
      "links",
      "16 blend modes",
      "gradients",
      "image borders",
      "shadows",
      "blur/grain/dither",
      "embedded fonts",
      "embedded images",
      "CV language variants",
    ],
    discovery: [
      "templates list",
      "templates inspect ID",
      "assets list",
      "assets show ID",
      "document schema",
      "pages PROJECT",
      "docs all",
    ],
    feedback: [
      "output PROJECT --format json",
      "output PROJECT --format html",
      "output PROJECT --format source",
      "screenshot PROJECT --out preview.png",
      "output PROJECT --format pdf --out Resume.pdf",
      "output PROJECT --format pdf --pages 1,2 --out Application.pdf",
      "output PROJECT --format html --pages 2 --out Letter.html",
      "output PROJECT --format tsx --out-dir react-pages",
      "screenshot PROJECT --page 2 --out Letter.png",
    ],
    exports: {
      formats: ["json", "html", "pdf", "tsx", "react", "source"],
      pages:
        "--pages all|2|2,1|1-3|id:ID|name:Exact name; caller order retained, unique selections only",
      destinations:
        "--out FILE combines; --out-dir DIR writes each selected page separately; mutually exclusive",
      source:
        "source is exact saved code; tsx/react snapshots live canvas. Active source supports whole export only.",
      docs: "docs [topic] is offline; docs agent --source github explicitly fetches the public guide without credentials",
    },
    boundaries: {
      projects:
        "Explicit filesystem JSON only; browser IndexedDB must be exported first.",
      source:
        "Single-file TSX, React imports only; no arbitrary npm modules. Source is not converted back into layers.",
      assets:
        "Embedded assets only; screenshot network is blocked. Brand collection licenses do not grant trademark rights.",
      layout:
        "Up to 20 visual pages (100–5000 CSS pixels per dimension), flat groups limited to one page; no automatic pagination or nested groups. Page commands require an enabled canvas with source explicitly deactivated.",
      pdf: "Local PDF rendering uses the app renderer; PDF.js checks extracted text, spacing and reading order. A failed check retains the PDF and exits 3; it does not certify universal ATS acceptance.",
    },
  };
}
export async function templateDiscovery(args: string[]) {
  const { templates } = await import("@resumi/cv");
  if (args.length === 0 || (args.length === 1 && args[0] === "list"))
    return {
      templates: templates.map((template) => ({
        ...template,
        create: `new --template ${template.id} --out resume.json`,
      })),
    };
  if (args.length === 2 && args[0] === "inspect") {
    const template = templates.find((item) => item.id === args[1]);
    if (template)
      return {
        template,
        source:
          template.format === "react"
            ? "Create then output --format source for its complete editable TSX."
            : "Create then inspect for section/block IDs.",
        preview: `new --template ${template.id} --out resume.json && screenshot resume --out resume.png`,
      };
    throw new CliError(2, `Unknown template: ${args[1]}. Use templates list.`);
  }
  throw new CliError(2, "Use templates list or templates inspect ID.");
}
export async function assetDiscovery(
  args: string[],
  flags: Map<string, string>,
  io: IO,
) {
  if (args[0] === "list" && args.length === 1) {
    if (flags.has("--format") || flags.has("--out"))
      throw new CliError(
        2,
        "assets list uses --kind, --search and --limit; assets show exports artwork.",
      );
    const kind = flags.get("--kind"),
      query = (flags.get("--search") ?? "").toLocaleLowerCase();
    if (kind && !["shapes", "icons", "brands"].includes(kind))
      throw new CliError(2, "Choose --kind shapes, icons or brands.");
    const kinds: AssetKind[] = kind
      ? [kind as AssetKind]
      : ["shapes", "icons", "brands"];
    const limit = boundedInteger(flags.get("--limit"), 50, 1, 2500);
    const entries = (
      await Promise.all(
        kinds.map(async (type) =>
          (await loadAssets(type)).map((item) => ({
            id: item.id,
            name: item.name,
            kind: type,
            category: item.category,
            source: item.source,
            license: item.license,
          })),
        ),
      )
    )
      .flat()
      .filter((item) =>
        `${item.id} ${item.name} ${item.category ?? ""}`
          .toLocaleLowerCase()
          .includes(query),
      );
    return {
      total: entries.length,
      assets: entries.slice(0, limit),
      truncated: entries.length > limit,
    };
  }
  if (args[0] === "show" && args.length === 2) {
    if (["--kind", "--search", "--limit"].some((flag) => flags.has(flag)))
      throw new CliError(
        2,
        "assets show accepts --format json|svg and --out only.",
      );
    const item = (await loadAssets(assetKind(args[1]))).find(
      (asset) => asset.id === args[1],
    );
    if (!item)
      throw new CliError(
        2,
        `Unknown asset: ${args[1]}. Use assets list --search TEXT.`,
      );
    const format = flags.get("--format") ?? "json";
    if (!["json", "svg"].includes(format))
      throw new CliError(2, "assets show --format must be json or svg.");
    const data =
      format === "svg"
        ? assetSvg(item)
        : JSON.stringify({ asset: item }, null, 2);
    if (flags.has("--out")) {
      await write(io, flags.get("--out")!, data + "\n");
      return { id: item.id, format, out: flags.get("--out") };
    }
    return format === "svg" ? data + "\n" : { asset: item };
  }
  throw new CliError(2, "Use assets list or assets show ID. See help assets.");
}
