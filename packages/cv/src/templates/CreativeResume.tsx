import type { CSSProperties } from "react";
import type { ResumeData, TemplateBrand } from "./types";
import { CreativeLayouts, creativeCss } from "./CreativeLayouts";
import { baseCss } from "./base-css";

/* resumi-template:terminal */
const resume: ResumeData = /* resume-data:start */ {
  name: "Alex Morgan — Resume",
  accent: "#315a72",
  serif: false,
  layout: "terminal",
  sections: [
    {
      title: "",
      blocks: [
        { kind: "heading", text: "Alex Morgan" },
        { kind: "subtitle", text: "Product Designer" },
        {
          kind: "meta",
          text: "Paris, France · alex@example.com · alexmorgan.design",
        },
      ],
    },
    {
      title: "Profile",
      blocks: [
        {
          kind: "text",
          text: "Product designer working across research, interaction design and design systems.",
        },
      ],
    },
    {
      title: "Experience",
      blocks: [
        { kind: "subtitle", text: "Senior Product Designer · Forma" },
        { kind: "meta", text: "2022 — Present / Paris, France" },
        {
          kind: "bullet",
          text: "Led product design from research and prototyping through delivery with engineering.",
        },
      ],
    },
  ],
}; /* resume-data:end */

/** Editable offline TSX with deterministic, print-safe vector artwork. */
export default function Resume({ data = resume }: { data?: ResumeData } = {}) {
  const layout = data.layout ?? "terminal";
  const content = {
    ...data,
    portrait:
      data.portrait ??
      (data.portraitAsset ? templateAssets.portrait : undefined),
    artwork:
      data.artwork ?? (data.artworkAsset ? templateAssets.artwork : undefined),
  };
  const font = data.font ?? templateAssets.font;
  const license = data.license ?? templateAssets.license;
  const identity =
    data.sections.find((section) =>
      section.blocks.some((block) => block.kind === "heading"),
    ) ?? data.sections[0];
  const name =
    identity?.blocks.find((block) => block.kind === "heading")?.text ??
    data.name;
  const role = identity?.blocks.find(
    (block) => block.kind === "subtitle",
  )?.text;
  const contacts =
    identity?.blocks
      .filter((block) => block.kind === "meta")
      .flatMap((block) => block.text.split(/\s*·\s*|\n/))
      .filter(Boolean) ?? [];
  const sections = data.sections.filter((section) => section !== identity);
  return (
    <>
      <style>{`${license ? `/* ${license.replace(/\*\//g, "* / ")} */` : ""}${font ? `@font-face{font-family:ResumeInter;src:url('${font}') format('woff2');font-style:normal;font-weight:100 900;font-display:swap}` : ""}${baseCss}${creativeCss}`}</style>
      <article
        className={`resume cv-sheet cv-${layout}`}
        aria-label="Resume"
        data-template-layout={layout}
        style={{ "--cv-accent": data.accent } as CSSProperties}
      >
        <CreativeLayouts
          data={content}
          name={name}
          role={role}
          contacts={contacts}
          sections={sections}
          portrait={content.portrait}
        />
      </article>
    </>
  );
}

// Embedded assets stay at the end so the editable content and component remain readable.
const templateAssets: {
  font?: string;
  license?: string;
  brands?: TemplateBrand[];
  portrait?: string;
  artwork?: string;
} = /* resume-assets:start */ {}; /* resume-assets:end */
