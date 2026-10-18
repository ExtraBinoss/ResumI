import { createHash } from "node:crypto";
import { vectorSchema } from "../packages/engine/src/canvas/schema";
import sources from "../packages/assets/data/agents/sources.json";

const root = new URL("../packages/assets/data/agents/", import.meta.url);
const digest = (value: string) =>
  createHash("sha256").update(value).digest("hex");

/** Local, reviewed primary-source marks; regeneration never silently updates artwork. */
export async function agentBrandCatalog() {
  const credits: Record<string, string> = {};
  const icons = await Promise.all(
    sources.map(async (item) => {
      const [source, svg] = await Promise.all([
        Bun.file(new URL(item.sourceFile, root)).text(),
        Bun.file(new URL(item.file, root)).text(),
      ]);
      if (digest(source) !== item.sourceSha256 || digest(svg) !== item.sha256)
        throw new Error(`Pinned brand artwork changed: ${item.name}`);
      const viewBox = svg.match(/viewBox="([^"]+)"/)?.[1];
      const parts = Array.from(svg.matchAll(/<path\s+([^>]+)\/>/g), (match) => {
        const attributes = Object.fromEntries(
          Array.from(match[1].matchAll(/([\w-]+)="([^"]*)"/g), (attribute) => [
            attribute[1],
            attribute[2],
          ]),
        );
        return {
          path: attributes.d,
          fill: attributes.fill,
          ...(attributes["fill-rule"]
            ? { fillRule: attributes["fill-rule"] }
            : {}),
        };
      });
      credits[item.license] = [
        `${item.name} is a trademark of its respective owner.`,
        "Official brand artwork, retained for product identification. No affiliation or endorsement.",
        "No open artwork or trademark license is asserted; the owner's brand guidelines and terms apply.",
        `Brand resource: ${item.brandGuidelines}`,
        `Source: ${item.source}`,
        ...(item.archiveMember
          ? [`Archive member: ${item.archiveMember}`]
          : []),
        `Original SHA-256: ${item.sourceSha256}`,
        item.normalization,
      ].join("\n");
      return {
        id: item.id,
        name: item.name,
        category: item.category,
        source: item.source,
        license: item.license,
        ...vectorSchema.parse({ path: parts[0]?.path, viewBox, parts }),
      };
    }),
  );
  return { icons, credits };
}

/** Small public projections keep the full editor catalog out of the landing bundle. */
export async function writeAgentBrandAssets() {
  const publicRoot = new URL(
    "../apps/web/public/brands/agents/",
    import.meta.url,
  );
  for (const item of sources) {
    for (const variant of item.landingVariants) {
      const svg = await Bun.file(new URL(variant.file, root)).text();
      if (digest(svg) !== variant.sha256)
        throw new Error(`Pinned landing mark changed: ${variant.file}`);
      // A landing-only viewport removes source artboard padding without changing
      // painted paths or the canonical vectors used by the editor catalog.
      const viewport = "viewBox" in variant ? variant.viewBox : undefined;
      const projected = viewport
        ? svg.replace(/viewBox="[^"]+"/, `viewBox="${viewport}"`)
        : svg;
      const credit = `${item.name}. Source: ${item.source}. Brand resource: ${item.brandGuidelines}. Original SHA-256: ${variant.sha256}. Trademark of its owner; no affiliation or endorsement.`;
      const metadata = credit.replaceAll("&", "&amp;").replaceAll("<", "&lt;");
      await Bun.write(
        new URL(variant.output, publicRoot),
        projected.replace(
          /(<svg\b[^>]*>)/,
          `$1<metadata>${metadata}</metadata>`,
        ),
      );
    }
  }
}
