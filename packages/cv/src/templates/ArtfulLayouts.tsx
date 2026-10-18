import type { CreativeLayoutProps } from "./creative-types";
import type { ResumeSection } from "./types";
import { Contacts, Section } from "./TemplateContent";
import {
  ArtfulBloomArt,
  ArtfulChromaMark,
  ArtfulKineticArt,
  ArtfulPatinaArt,
  ArtfulSpectrumArt,
  ArtfulTerrazzoArt,
} from "./ArtfulArt";

function ArtfulSections({ sections }: { sections: ResumeSection[] }) {
  return (
    <>
      {sections.map((section) => {
        if (!/skill|competenc|compétenc|expertise/i.test(section.title))
          return (
            <Section key={section.id ?? section.title} section={section} />
          );
        return (
          <section
            className="cv-section"
            data-section-id={section.id}
            key={section.id ?? section.title}
          >
            <h2>{section.title}</h2>
            <div className="cv-section-content">
              {section.blocks.map((block, i) => (
                <p
                  className="cv-af-skills"
                  data-block-id={block.id}
                  key={block.id ?? i}
                >
                  {block.text}
                </p>
              ))}
            </div>
          </section>
        );
      })}
    </>
  );
}

/** Seven original art-directed A4 compositions using editable text and vector marks. */
export function ArtfulLayouts({
  data,
  name,
  role,
  contacts,
  sections,
}: CreativeLayoutProps) {
  const layout: string = data.layout ?? "";
  if (
    ![
      "vellum",
      "chroma",
      "terrazzo",
      "spectrum",
      "bloom",
      "kinetic",
      "patina",
    ].includes(layout)
  )
    return null;
  const support = sections.filter((section) =>
    /education|formation|skill|competenc|compétenc|expertise|language|langue|certif|outil/i.test(
      section.title,
    ),
  );
  const main = sections.filter((section) => !support.includes(section));
  const introduction = main.filter(
    (section) =>
      section.id === "profile" ||
      /profil|summary|approach|about|statement/i.test(section.title),
  );
  const career = main.filter((section) => !introduction.includes(section));
  const identity = (
    <div className="cv-af-identity">
      <h1 className="cv-name">{name}</h1>
      {role && <p className="cv-role">{role}</p>}
    </div>
  );
  const renderSections = (items: ResumeSection[]) => (
    <ArtfulSections sections={items} />
  );
  if (layout === "vellum")
    return (
      <div className="cv-af cv-af-vellum">
        <div className="cv-af-vellum-spine" aria-hidden="true">
          <span>SELECTED EXPERIENCE</span>
          <span>MMXXVI</span>
        </div>
        <div className="cv-af-vellum-page">
          <div className="cv-af-vellum-masthead" aria-hidden="true">
            <span>THE PRACTICE OF DESIGN</span>
            <span>CURRICULUM VITÆ / VOL. 01</span>
          </div>
          <header className="cv-af-vellum-header">
            {identity}
            <span className="cv-af-vellum-asterisk" aria-hidden="true">
              ✳
            </span>
          </header>
          <Contacts values={contacts} icons={false} />
          <div className="cv-af-vellum-intro">
            {renderSections(introduction)}
          </div>
          <main className="cv-af-vellum-main">
            {career.map((section, i) => (
              <div className="cv-af-vellum-chapter" key={section.id ?? i}>
                <span className="cv-af-vellum-index" aria-hidden="true">
                  {i + 1}.
                </span>
                <Section section={section} />
              </div>
            ))}
          </main>
          <aside className="cv-af-vellum-support">
            {renderSections(support)}
          </aside>
          <footer className="cv-af-vellum-footer" aria-hidden="true">
            <span>FORM, MEANING & THE SPACE BETWEEN.</span>
            <span>01</span>
          </footer>
        </div>
      </div>
    );
  if (layout === "chroma")
    return (
      <div className="cv-af cv-af-chroma">
        <div className="cv-af-chroma-top" aria-hidden="true">
          <span>INDEPENDENT MIND. DISTINCTIVE WORK.</span>
          <span>CV / 2026</span>
        </div>
        <header className="cv-af-chroma-header">
          {identity}
          <ArtfulChromaMark />
        </header>
        <Contacts values={contacts} icons={false} />
        <main className="cv-af-chroma-paper">
          <div className="cv-af-chroma-intro">
            {renderSections(introduction)}
          </div>
          <div className="cv-af-chroma-body">
            {career.map((section, i) => (
              <div className="cv-af-chroma-column" key={section.id ?? i}>
                <span className="cv-af-chroma-index" aria-hidden="true">
                  0{i + 1}
                  <span> / </span>
                </span>
                <Section section={section} />
              </div>
            ))}
          </div>
          <aside className="cv-af-chroma-support">
            {renderSections(support)}
          </aside>
        </main>
        <footer className="cv-af-chroma-footer" aria-hidden="true">
          <span>IDEAS WITH CHARACTER.</span>
          <span>↗</span>
        </footer>
      </div>
    );
  if (layout === "terrazzo")
    return (
      <div className="cv-af cv-af-terrazzo">
        <div className="cv-af-terrazzo-strip">
          <ArtfulTerrazzoArt />
          <span aria-hidden="true">MATERIAL / SPACE / EXPERIENCE</span>
        </div>
        <div className="cv-af-terrazzo-page">
          <div className="cv-af-terrazzo-top" aria-hidden="true">
            <span>DESIGN PRACTICE</span>
            <span>PORTFOLIO & CURRICULUM</span>
          </div>
          <header className="cv-af-terrazzo-header">{identity}</header>
          <Contacts values={contacts} icons={false} />
          <div className="cv-af-terrazzo-intro">
            {renderSections(introduction)}
          </div>
          <main className="cv-af-terrazzo-body">{renderSections(career)}</main>
          <aside className="cv-af-terrazzo-support">
            {renderSections(support)}
          </aside>
          <footer className="cv-af-terrazzo-footer" aria-hidden="true">
            <span>CONSIDERED IN EVERY DIMENSION.</span>
            <span>01</span>
          </footer>
        </div>
      </div>
    );
  if (layout === "spectrum")
    return (
      <div className="cv-af cv-af-spectrum">
        <header className="cv-af-spectrum-header">
          <div className="cv-af-spectrum-top" aria-hidden="true">
            <span>A LITTLE CURIOSITY GOES A LONG WAY.</span>
            <span>2026 ↗</span>
          </div>
          <div className="cv-af-spectrum-heading">
            {identity}
            <ArtfulSpectrumArt />
          </div>
          <Contacts values={contacts} icons={false} />
        </header>
        <div className="cv-af-spectrum-intro">
          {renderSections(introduction)}
          <span className="cv-af-spectrum-spark" aria-hidden="true">
            ✳
          </span>
        </div>
        <main className="cv-af-spectrum-body">
          {career.map((section, i) => (
            <div
              className={`cv-af-spectrum-panel cv-af-spectrum-panel-${i}`}
              key={section.id ?? i}
            >
              <Section section={section} />
            </div>
          ))}
        </main>
        <aside className="cv-af-spectrum-support">
          {renderSections(support)}
        </aside>
        <footer className="cv-af-spectrum-footer" aria-hidden="true">
          <span>GOOD QUESTIONS. THOUGHTFUL PRODUCTS.</span>
          <span>01 / CV</span>
        </footer>
      </div>
    );
  if (layout === "bloom")
    return (
      <div className="cv-af cv-af-bloom">
        <div className="cv-af-bloom-top" aria-hidden="true">
          <span>A CREATIVE PRACTICE</span>
          <span>ROOTED IN CURIOSITY</span>
        </div>
        <header className="cv-af-bloom-header">
          {identity}
          <ArtfulBloomArt />
        </header>
        <Contacts values={contacts} icons={false} />
        <div className="cv-af-bloom-intro">{renderSections(introduction)}</div>
        <div className="cv-af-bloom-body">
          <main>{renderSections(career)}</main>
          <aside>
            {renderSections(support)}
            <div className="cv-af-bloom-seed" aria-hidden="true">
              <span>GROW</span>
              <span>WITH</span>
              <span>INTENTION.</span>
              <i>✳</i>
            </div>
          </aside>
        </div>
        <footer className="cv-af-bloom-footer" aria-hidden="true">
          <span>THOUGHTFULLY MADE, FROM THE FIRST SEED.</span>
          <span>01</span>
        </footer>
      </div>
    );
  if (layout === "kinetic")
    return (
      <div className="cv-af cv-af-kinetic">
        <div className="cv-af-kinetic-top" aria-hidden="true">
          <span>DESIGN IN MOTION</span>
          <span>FRAME 001 / 2026</span>
        </div>
        <header className="cv-af-kinetic-header">
          {identity}
          <ArtfulKineticArt />
        </header>
        <Contacts values={contacts} icons={false} />
        <div className="cv-af-kinetic-intro">
          <span className="cv-af-kinetic-arrow" aria-hidden="true">
            ↗
          </span>
          {renderSections(introduction)}
        </div>
        <main className="cv-af-kinetic-main">
          {career.map((section, i) => (
            <div className="cv-af-kinetic-row" key={section.id ?? i}>
              <span className="cv-af-kinetic-number" aria-hidden="true">
                0{i + 1}
              </span>
              <Section section={section} />
            </div>
          ))}
        </main>
        <aside className="cv-af-kinetic-support">
          {renderSections(support)}
        </aside>
        <footer className="cv-af-kinetic-footer" aria-hidden="true">
          <div>
            {Array.from({ length: 21 }, (_, i) => (
              <span key={i} style={{ width: `${2 + i * 0.36}px` }} />
            ))}
          </div>
          <span>ALWAYS MOVING FORWARD. →</span>
        </footer>
      </div>
    );
  return (
    <div className="cv-af cv-af-patina">
      <aside className="cv-af-patina-rail">
        <div className="cv-af-patina-label" aria-hidden="true">
          OBJECT / PROCESS / PURPOSE
        </div>
        <ArtfulPatinaArt />
        <div className="cv-af-patina-caption" aria-hidden="true">
          <span>FIG. 01</span>
          <span>ASSEMBLY STUDY</span>
        </div>
        <Contacts values={contacts} icons={false} />
        {renderSections(support)}
        <div className="cv-af-patina-stamp" aria-hidden="true">
          <span>MADE TO</span>
          <strong>LAST.</strong>
        </div>
      </aside>
      <main className="cv-af-patina-main">
        <div className="cv-af-patina-top" aria-hidden="true">
          <span>INDUSTRIAL DESIGN</span>
          <span>CV—01</span>
        </div>
        <header className="cv-af-patina-header">{identity}</header>
        <div className="cv-af-patina-intro">{renderSections(introduction)}</div>
        <div className="cv-af-patina-career">{renderSections(career)}</div>
        <footer className="cv-af-patina-footer" aria-hidden="true">
          <span>HONEST MATERIALS. USEFUL OBJECTS.</span>
          <span>01</span>
        </footer>
      </main>
    </div>
  );
}
