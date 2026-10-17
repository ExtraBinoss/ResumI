import type { CSSProperties } from "react";

export type ResumeLayout = "studio" | "editorial" | "classic" | "profile";
export type ResumeSection = {
  id?: string;
  title: string;
  blocks: { id?: string; kind: string; text: string }[];
};
export type ResumeData = {
  name: string;
  accent: string;
  serif: boolean;
  layout?: ResumeLayout;
  portrait?: string;
  portraitAsset?: boolean;
  font?: string;
  license?: string;
  sections: ResumeSection[];
};

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

// Vetted Lucide paths (ISC); the portable template embeds its licenses with the font.
function ContactIcon({
  type,
}: {
  type: "mail" | "location" | "web" | "phone";
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {type === "mail" ? (
        <>
          <path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" />
          <rect x="2" y="4" width="20" height="16" rx="2" />
        </>
      ) : type === "location" ? (
        <>
          <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
          <circle cx="12" cy="10" r="3" />
        </>
      ) : type === "web" ? (
        <>
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20M2 12h20" />
        </>
      ) : (
        <path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384" />
      )}
    </svg>
  );
}
function Contacts({ values }: { values: string[] }) {
  return (
    <address className="cv-contacts">
      {values.map((value, index) => {
        const type = value.includes("@")
          ? "mail"
          : /^\+?[\d ()-]{7,}$/.test(value)
            ? "phone"
            : /\.[a-z]{2,}/i.test(value)
              ? "web"
              : "location";
        const href =
          type === "mail"
            ? `mailto:${value}`
            : type === "web"
              ? /^https?:\/\//i.test(value)
                ? value
                : `https://${value}`
              : type === "phone"
                ? `tel:${value.replace(/[^+\d]/g, "")}`
                : undefined;
        return (
          <span key={index}>
            <ContactIcon type={type} />
            {href ? <a href={href}>{value}</a> : <span>{value}</span>}
          </span>
        );
      })}
    </address>
  );
}
function entries(section: ResumeSection) {
  const groups: {
    title?: ResumeSection["blocks"][number];
    meta?: ResumeSection["blocks"][number];
    body: ResumeSection["blocks"];
  }[] = [];
  for (const block of section.blocks) {
    if (block.kind === "subtitle") groups.push({ title: block, body: [] });
    else {
      if (!groups.length) groups.push({ body: [] });
      const current = groups[groups.length - 1];
      if (block.kind === "meta" && current.title && !current.meta)
        current.meta = block;
      else current.body.push(block);
    }
  }
  return groups;
}
function Section({ section }: { section: ResumeSection }) {
  const skills = /skill|competenc|compétenc/i.test(section.title);
  return (
    <section
      className={`cv-section${skills ? " cv-skills-section" : ""}`}
      data-section-id={section.id}
    >
      {section.title && <h2>{section.title}</h2>}
      <div className="cv-section-content">
        {skills ? (
          <ul className="cv-skill-list">
            {section.blocks
              .flatMap((block) => block.text.split(/\s+\/\s+|\n/))
              .filter(Boolean)
              .map((skill, index) => (
                <li key={index}>{skill.trim()}</li>
              ))}
          </ul>
        ) : (
          entries(section).map((entry, index) => (
            <div className="cv-entry" key={index}>
              {(entry.title || entry.meta) && (
                <div className="cv-entry-head">
                  {entry.title && (
                    <h3 data-block-id={entry.title.id}>{entry.title.text}</h3>
                  )}
                  {entry.meta && (
                    <p className="cv-meta" data-block-id={entry.meta.id}>
                      {entry.meta.text}
                    </p>
                  )}
                </div>
              )}
              {entry.body
                .filter((block) => block.kind !== "bullet")
                .map((block, blockIndex) => (
                  <p
                    className={
                      block.kind === "meta" ? "cv-meta" : "cv-paragraph"
                    }
                    data-block-id={block.id}
                    key={blockIndex}
                  >
                    {block.text}
                  </p>
                ))}
              {entry.body.some((block) => block.kind === "bullet") && (
                <ul className="cv-bullets">
                  {entry.body
                    .filter((block) => block.kind === "bullet")
                    .map((block, blockIndex) => (
                      <li data-block-id={block.id} key={blockIndex}>
                        {block.text}
                      </li>
                    ))}
                </ul>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  );
}

const css = `
.resume.cv-sheet,.cv-sheet *{box-sizing:border-box}
.resume.cv-sheet{position:relative;width:794px;min-height:1123px;margin:0;padding:56px 58px;background:#fff;color:#23272a;font:13px/1.6 ResumeInter,Arial,sans-serif;letter-spacing:-.08px;text-align:left;isolation:isolate}
.cv-sheet h1,.cv-sheet h2,.cv-sheet h3,.cv-sheet p,.cv-sheet ul{margin:0}
.cv-sheet a{color:inherit;text-decoration:none}
.cv-sheet .cv-header{position:relative;margin-bottom:34px;padding-bottom:29px;border-bottom:1px solid #dfe3e5}
.cv-sheet .cv-name{font:600 42px/1.1 ResumeInter,Arial,sans-serif;letter-spacing:-1.9px;color:#17232a}
.cv-sheet .cv-role{margin-top:10px;font-size:17px;font-weight:450;line-height:1.3;color:var(--cv-accent)}
.cv-sheet .cv-contacts{display:flex;flex-wrap:wrap;gap:9px 20px;margin-top:21px;font-size:10.6px;font-style:normal;color:#5b646a;line-height:1.45}
.cv-sheet .cv-contacts>span{display:flex;align-items:center;gap:7px;min-width:0}
.cv-sheet .cv-contacts svg{flex:0 0 14px;color:var(--cv-accent)}
.cv-sheet .cv-contacts a{overflow-wrap:anywhere}
.cv-sheet .cv-section{margin:0 0 28px;break-inside:avoid}
.cv-sheet .cv-section:last-child{margin-bottom:0}
.cv-sheet .cv-section h2{margin:0 0 13px;font-size:10.5px;line-height:1.3;font-weight:650;letter-spacing:1.55px;text-transform:uppercase;color:var(--cv-accent)}
.cv-sheet .cv-entry{margin-bottom:23px}
.cv-sheet .cv-entry:last-child{margin-bottom:0}
.cv-sheet .cv-entry-head{display:flex;justify-content:space-between;align-items:baseline;gap:16px;margin-bottom:8px}
.cv-sheet .cv-entry h3{font-size:13.3px;font-weight:620;line-height:1.45;color:#252c31}
.cv-sheet .cv-meta{color:#70787d;font-size:10.6px;line-height:1.55;white-space:pre-wrap}
.cv-sheet .cv-entry-head .cv-meta{flex:0 0 auto;max-width:42%;text-align:right}
.cv-sheet .cv-paragraph{font-size:12.5px;line-height:1.72;white-space:pre-wrap;color:#4b5359}
.cv-sheet .cv-bullets{padding-left:15px;font-size:12px;line-height:1.7;color:#4b5359}
.cv-sheet .cv-bullets li{padding-left:3px;margin-bottom:7px}
.cv-sheet .cv-bullets li:last-child{margin-bottom:0}
.cv-sheet .cv-bullets li::marker{font-size:8px;color:var(--cv-accent)}
.cv-sheet .cv-skill-list{display:grid;grid-template-columns:1fr 1fr;gap:8px 20px;padding:0;list-style:none;font-size:12px;color:#4b5359}
.cv-sheet .cv-columns{display:grid;grid-template-columns:minmax(0,1fr) 170px;gap:37px}
.cv-sheet .cv-aside{border-left:1px solid #e3e7e8;padding-left:25px}
.cv-sheet .cv-aside .cv-skill-list{grid-template-columns:1fr;gap:7px}
.cv-sheet .cv-aside .cv-entry-head{display:block;margin-bottom:7px}
.cv-sheet .cv-aside .cv-entry h3{font-size:12px}
.cv-sheet .cv-aside .cv-entry-head .cv-meta{max-width:none;text-align:left;margin-top:7px}
.cv-sheet .cv-aside .cv-section{margin-bottom:29px}
.cv-sheet .cv-portrait{display:block;width:126px;height:148px;object-fit:cover;object-position:50% 43%;background:#e7e9e6;border-radius:2px}
.cv-sheet.cv-classic{padding:57px 62px;font-family:Georgia,'Times New Roman',serif;font-size:13.5px}
.cv-sheet.cv-classic .cv-header{text-align:center;border-bottom:1.5px solid #26323a;margin-bottom:29px;padding-bottom:23px}
.cv-sheet.cv-classic .cv-name{font:400 39px/1.15 Georgia,'Times New Roman',serif;letter-spacing:-.6px;color:#20272c}
.cv-sheet.cv-classic .cv-role{font:450 14px/1.4 ResumeInter,Arial,sans-serif;color:#525b62;margin-top:9px}
.cv-sheet.cv-classic .cv-contacts{justify-content:center;gap:5px 17px;margin-top:17px;font-family:ResumeInter,Arial,sans-serif;font-size:10.2px}
.cv-sheet.cv-classic .cv-contacts svg{display:none}
.cv-sheet.cv-classic .cv-section{margin-bottom:24px}
.cv-sheet.cv-classic .cv-section h2{color:#26323a;font:600 10.8px/1.4 ResumeInter,Arial,sans-serif;letter-spacing:1.2px;padding-bottom:7px;border-bottom:1px solid #d8dde0;margin-bottom:13px}
.cv-sheet.cv-classic .cv-entry h3{font:600 13px/1.45 ResumeInter,Arial,sans-serif}
.cv-sheet.cv-classic .cv-entry{margin-bottom:19px}
.cv-sheet.cv-classic .cv-paragraph,.cv-sheet.cv-classic .cv-bullets{font-size:13.1px;line-height:1.62;color:#363c41}
.cv-sheet.cv-classic .cv-skill-list{font:12px/1.6 ResumeInter,Arial,sans-serif;grid-template-columns:1fr 1fr 1fr;gap:7px 18px}
.cv-sheet.cv-classic .cv-meta{font-family:ResumeInter,Arial,sans-serif}
.cv-sheet.cv-editorial{padding:58px 57px;color:#292b2b}
.cv-sheet.cv-editorial .cv-header{display:grid;grid-template-columns:minmax(0,1fr) 191px;gap:28px;align-items:end;border-bottom:1px solid #c9c6c0;padding-bottom:32px;margin-bottom:30px}
.cv-sheet.cv-editorial .cv-name{font:400 52px/1.03 Georgia,'Times New Roman',serif;letter-spacing:-2.2px;color:#2e3536;max-width:360px}
.cv-sheet.cv-editorial .cv-role{font-size:14px;letter-spacing:.3px;margin-top:14px}
.cv-sheet.cv-editorial .cv-contacts{display:grid;gap:10px;margin:0;padding-left:20px;border-left:1px solid #d7d4ce;font-size:10.5px}
.cv-sheet.cv-editorial .cv-section{display:grid;grid-template-columns:112px minmax(0,1fr);gap:20px;margin-bottom:22px}
.cv-sheet.cv-editorial .cv-section:last-child{margin-bottom:0}
.cv-sheet.cv-editorial .cv-section h2{font-size:10px;line-height:1.5;letter-spacing:1.2px;padding-top:3px}
.cv-sheet.cv-editorial .cv-entry-head{display:block;margin-bottom:9px}
.cv-sheet.cv-editorial .cv-entry h3{font:400 18px/1.35 Georgia,'Times New Roman',serif;letter-spacing:-.2px}
.cv-sheet.cv-editorial .cv-entry-head .cv-meta{max-width:none;text-align:left;margin-top:6px;font-size:10px;letter-spacing:.1px}
.cv-sheet.cv-editorial .cv-paragraph{font-size:12.8px;line-height:1.8}
.cv-sheet.cv-editorial .cv-skill-list{gap:7px 18px}
.cv-sheet.cv-profile{padding:0;display:grid;grid-template-columns:230px minmax(0,1fr);min-height:1123px}
.cv-sheet .cv-profile-rail{padding:54px 29px;background:#edf1ef;min-height:1123px}
.cv-sheet .cv-profile-rail .cv-portrait{margin-bottom:29px}
.cv-sheet .cv-profile-rail .cv-contacts{display:grid;gap:14px;margin:0 0 33px;font-size:10.5px}
.cv-sheet .cv-profile-rail .cv-contacts>span{align-items:flex-start}
.cv-sheet .cv-profile-rail .cv-contacts svg{margin-top:1px}
.cv-sheet .cv-profile-rail .cv-section{margin-bottom:31px}
.cv-sheet .cv-profile-rail .cv-entry-head{display:block}
.cv-sheet .cv-profile-rail .cv-entry h3{font-size:12.1px}
.cv-sheet .cv-profile-rail .cv-entry-head .cv-meta{max-width:none;text-align:left;margin-top:7px}
.cv-sheet .cv-profile-rail .cv-skill-list{grid-template-columns:1fr;gap:8px}
.cv-sheet .cv-profile-main{padding:63px 43px 50px}
.cv-sheet.cv-profile .cv-header{padding-bottom:27px;margin-bottom:29px;border-bottom:1px solid #d8dfdc}
.cv-sheet.cv-profile .cv-name{font-size:39px;letter-spacing:-1.45px;color:#263d37}
.cv-sheet.cv-profile .cv-role{font-size:15px;margin-top:12px}
.cv-sheet.cv-profile .cv-entry-head{display:block}
.cv-sheet.cv-profile .cv-entry-head .cv-meta{max-width:none;text-align:left;margin-top:6px}
.cv-sheet.cv-profile .cv-entry h3{font-size:13.6px}
.cv-sheet.cv-profile .cv-paragraph{font-size:12.4px;line-height:1.78}
@page{size:A4;margin:0}
@media print{.resume.cv-sheet{margin:0;width:210mm;min-height:297mm;box-shadow:none;print-color-adjust:exact;-webkit-print-color-adjust:exact}.cv-sheet .cv-profile-rail{min-height:297mm}}
`;

/** Ordinary, editable TSX: all copy, layout, assets, icons and print styles travel with the CV. */
export default function Resume({ data = resume }: { data?: ResumeData } = {}) {
  const layout = data.layout ?? (data.serif ? "editorial" : "studio");
  const font = data.font ?? templateAssets.font;
  const license = data.license ?? templateAssets.license;
  const portrait =
    data.portrait ?? (data.portraitAsset ? templateAssets.portrait : undefined);
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
      <style>{`${license ? `/* ${license.replace(/\*\//g, "* / ")} */` : ""}${font ? `@font-face{font-family:ResumeInter;src:url('${font}') format('woff2');font-style:normal;font-weight:100 900;font-display:swap}` : ""}${css}`}</style>
      <article
        className={`resume cv-sheet cv-${layout}`}
        aria-label="Resume"
        data-template-layout={layout}
        style={{ "--cv-accent": data.accent } as CSSProperties}
      >
        {layout === "profile" ? (
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
const templateAssets: { font?: string; portrait?: string; license?: string } =
  /* resume-assets:start */ {}; /* resume-assets:end */
