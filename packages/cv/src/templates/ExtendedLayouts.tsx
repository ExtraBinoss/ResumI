import type { ResumeData, ResumeSection, TemplateBrand } from "./types";
import { Contacts, Section } from "./TemplateContent";

function BrandTools({ brands }: { brands?: TemplateBrand[] }) {
  if (!brands?.length) return null;
  return (
    <div className="cv-tools" aria-label="Tools">
      {brands.map((brand) => (
        <span className="cv-tool" key={brand.name}>
          <svg
            viewBox={brand.viewBox}
            width="21"
            height="21"
            aria-hidden="true"
          >
            <metadata>{`${brand.name} · ${brand.source} · ${brand.license}`}</metadata>
            {brand.parts.map((part, index) => (
              <path
                key={index}
                d={part.path}
                fill={part.fill}
                fillRule={part.fillRule}
              />
            ))}
          </svg>
          <span>{brand.name}</span>
        </span>
      ))}
    </div>
  );
}

function SectionList({ sections }: { sections: ResumeSection[] }) {
  return (
    <>
      {sections.map((section) => (
        <Section key={section.id ?? section.title} section={section} />
      ))}
    </>
  );
}

/** Six repository-authored compositions, also bundled into the editable offline TSX. */
export function ExtendedLayouts({
  data,
  name,
  role,
  contacts,
  sections,
  portrait,
}: {
  data: ResumeData;
  name: string;
  role?: string;
  contacts: string[];
  sections: ResumeSection[];
  portrait?: string;
}) {
  const secondary = (section: ResumeSection) =>
    /education|formation|skill|competenc|language|langue|certif|tool|interest/i.test(
      section.title,
    );
  const primary = sections.filter((section) => !secondary(section));
  const aside = sections.filter(secondary);
  const introduction = primary.filter((section) =>
    /profile|summary|approach/i.test(section.title),
  );
  const career = primary.filter((section) => !introduction.includes(section));
  const identity = (
    <div className="cv-identity">
      <h1 className="cv-name">{name}</h1>
      {role && <p className="cv-role">{role}</p>}
    </div>
  );

  if (data.layout === "harvard") {
    const education = sections.filter((section) =>
      /education|formation/i.test(section.title),
    );
    return (
      <>
        <header className="cv-header">
          {identity}
          <Contacts values={contacts} icons={false} />
        </header>
        <main>
          <SectionList
            sections={[
              ...education,
              ...sections.filter((section) => !education.includes(section)),
            ]}
          />
        </main>
      </>
    );
  }

  if (data.layout === "cobalt")
    return (
      <>
        <header className="cv-cobalt-header">
          <div className="cv-cobalt-heading">
            {identity}
            <span className="cv-monogram" aria-hidden="true">
              {name
                .split(/\s+/)
                .map((part) => part[0])
                .slice(0, 2)
                .join("")}
            </span>
          </div>
          <Contacts values={contacts} />
        </header>
        <div className="cv-cobalt-body">
          <main>
            <SectionList sections={primary} />
          </main>
          <aside>
            <SectionList sections={aside} />
            <BrandTools brands={data.brands} />
          </aside>
        </div>
        <div className="cv-page-mark" aria-hidden="true">
          <span>{name}</span>
          <span>01</span>
        </div>
      </>
    );

  if (data.layout === "atelier")
    return (
      <>
        <aside className="cv-atelier-rail">
          {portrait && (
            <img
              className="cv-atelier-portrait"
              src={portrait}
              alt={`Portrait of ${name}`}
              width="164"
              height="188"
            />
          )}
          <Contacts values={contacts} />
          <SectionList sections={aside} />
          <BrandTools brands={data.brands} />
          <div className="cv-atelier-circle" aria-hidden="true" />
        </aside>
        <main className="cv-atelier-main">
          <header className="cv-header">{identity}</header>
          <SectionList sections={primary} />
        </main>
      </>
    );

  if (data.layout === "timeline")
    return (
      <>
        <header className="cv-timeline-header">
          <span className="cv-index-label">CURRICULUM VITAE / 2026</span>
          {identity}
          <Contacts values={contacts} />
          <span className="cv-orbit" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
        </header>
        <div className="cv-timeline-intro">
          <SectionList sections={introduction} />
        </div>
        <div className="cv-timeline-columns">
          <main>
            <SectionList sections={career} />
          </main>
          <aside>
            <SectionList sections={aside} />
            <BrandTools brands={data.brands} />
          </aside>
        </div>
        <div className="cv-page-mark" aria-hidden="true">
          <span>{role}</span>
          <span>{name} / 01</span>
        </div>
      </>
    );

  if (data.layout === "consultant")
    return (
      <>
        <header className="cv-consultant-header">
          <div>
            <span className="cv-index-label">STRATEGY / DESIGN / DELIVERY</span>
            {identity}
          </div>
          <Contacts values={contacts} />
        </header>
        <main>
          {primary.map((section, index) => (
            <div
              className="cv-consultant-section"
              key={section.id ?? section.title}
            >
              <span className="cv-section-number" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <Section section={section} />
            </div>
          ))}
          <div className="cv-consultant-footer">
            <SectionList sections={aside} />
          </div>
        </main>
        <div className="cv-page-mark" aria-hidden="true">
          <span>{name}</span>
          <span>01 / RÉSUMÉ</span>
        </div>
      </>
    );

  return (
    <>
      <header className="cv-mosaic-header">
        <div className="cv-mosaic-identity">
          {identity}
          <Contacts values={contacts} />
        </div>
        <div className="cv-mosaic-art" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
        </div>
      </header>
      <div className="cv-mosaic-summary">
        <SectionList sections={introduction} />
      </div>
      <div className="cv-mosaic-grid">
        <main>
          <SectionList sections={career} />
        </main>
        <aside>
          <SectionList sections={aside} />
          <BrandTools brands={data.brands} />
        </aside>
      </div>
      <div className="cv-page-mark" aria-hidden="true">
        <span>{name}</span>
        <span>DESIGN PORTFOLIO / 01</span>
      </div>
    </>
  );
}
