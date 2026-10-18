import type { CSSProperties } from "react";
import type { ResumeData, ResumeSection, TemplateBrand } from "./types";
import { Contacts, Section } from "./TemplateContent";
import { ExtendedLayouts } from "./ExtendedLayouts.tsx";
import { extendedCss } from "./extended-css";
import { baseCss } from "./base-css";

/* resumi-template:studio */
const resume: ResumeData = /* resume-data:start */ {
  name: "Alex Morgan — Resume",
  accent: "#315a72",
  serif: false,
  layout: "studio",
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

/** Ordinary, editable TSX: all copy, layout, assets, icons and print styles travel with the CV. */
export default function Resume({ data = resume }: { data?: ResumeData } = {}) {
  const layout = data.layout ?? (data.serif ? "editorial" : "studio");
  const font = data.font ?? templateAssets.font;
  const license = data.license ?? templateAssets.license;
  const portrait =
    data.portrait ?? (data.portraitAsset ? templateAssets.portrait : undefined);
  const brands =
    data.brands ?? (data.brandAssets ? templateAssets.brands : undefined);
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
  const inAside = (section: ResumeSection) =>
    /education|formation|skill|competenc|compétenc|language|langue|development|certif/i.test(
      section.title,
    );
  const primary = sections.filter((section) => !inAside(section));
  const aside = sections.filter(inAside);
  const header = (
    <header className="cv-header">
      <div>
        <h1 className="cv-name">{name}</h1>
        {role && <p className="cv-role">{role}</p>}
      </div>
      {layout !== "profile" && <Contacts values={contacts} />}
    </header>
  );
  return (
    <>
      <style>{`${license ? `/* ${license.replace(/\*\//g, "* / ")} */` : ""}${font ? `@font-face{font-family:ResumeInter;src:url('${font}') format('woff2');font-style:normal;font-weight:100 900;font-display:swap}` : ""}${baseCss}${extendedCss}`}</style>
      <article
        className={`resume cv-sheet cv-${layout}`}
        aria-label="Resume"
        data-template-layout={layout}
        style={{ "--cv-accent": data.accent } as CSSProperties}
      >
        {[
          "harvard",
          "cobalt",
          "atelier",
          "timeline",
          "consultant",
          "mosaic",
        ].includes(layout) ? (
          <ExtendedLayouts
            data={{ ...data, brands }}
            name={name}
            role={role}
            contacts={contacts}
            sections={sections}
            portrait={portrait}
          />
        ) : layout === "profile" ? (
          <>
            <aside className="cv-profile-rail">
              {portrait && (
                <img
                  className="cv-portrait"
                  src={portrait}
                  alt={`Portrait of ${name}`}
                  width="126"
                  height="148"
                />
              )}
              <Contacts values={contacts} />
              {aside.map((section, index) => (
                <Section key={index} section={section} />
              ))}
            </aside>
            <main className="cv-profile-main">
              {header}
              {primary.map((section, index) => (
                <Section key={index} section={section} />
              ))}
            </main>
          </>
        ) : (
          <>
            {header}
            {layout === "studio" ? (
              <div className="cv-columns">
                <main>
                  {primary.map((section, index) => (
                    <Section key={index} section={section} />
                  ))}
                </main>
                <aside className="cv-aside">
                  {aside.map((section, index) => (
                    <Section key={index} section={section} />
                  ))}
                </aside>
              </div>
            ) : (
              <main>
                {sections.map((section, index) => (
                  <Section key={index} section={section} />
                ))}
              </main>
            )}
          </>
        )}
      </article>
    </>
  );
}

// Embedded assets stay at the end so the editable content and component remain readable.
const templateAssets: {
  font?: string;
  portrait?: string;
  license?: string;
  brands?: TemplateBrand[];
} = /* resume-assets:start */ {}; /* resume-assets:end */
