import type { CreativeLayoutProps } from "./creative-types";
import type { ResumeSection } from "./types";
import { Contacts, Section } from "./TemplateContent";

function CuratedSections({ sections }: { sections: ResumeSection[] }) {
  return sections.map((section) => (
    <Section key={section.id ?? section.title} section={section} />
  ));
}

function CuratedArch({ plan = false }: { plan?: boolean }) {
  return (
    <svg className="cv-cu-arch" viewBox="0 0 210 210" aria-hidden="true">
      {plan ? (
        <>
          <path
            d="M25 185V28h160v157H25Z M25 80h71v105 M96 28v52h89 M136 80v105 M136 135h49"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M96 133a38 38 0 0 0 38-38 M96 95h38 M43 43h38v22H43Z M155 99h16v22h-16Z M43 101h34v64H43Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          />
          <path
            d="M12 28v157 M7 28h10 M7 185h10 M25 198h160 M25 193v10 M185 193v10"
            fill="none"
            stroke="currentColor"
            strokeWidth=".6"
          />
          <circle cx="136" cy="135" r="3" fill="currentColor" />
        </>
      ) : (
        <>
          <path
            d="M18 203V97a87 87 0 0 1 174 0v106"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          />
          <path
            d="M34 203V99a71 71 0 0 1 142 0v104 M50 203V101a55 55 0 0 1 110 0v102 M66 203V103a39 39 0 0 1 78 0v100"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          />
          <circle cx="105" cy="142" r="27" fill="currentColor" />
        </>
      )}
    </svg>
  );
}

function CuratedFolio({ left, right }: { left: string; right?: string }) {
  return (
    <footer className="cv-cu-folio">
      <span>{left}</span>
      <span>{right ?? "CURRICULUM VITAE / 01"}</span>
    </footer>
  );
}

/** Seven original A4 compositions. All professional copy remains document-owned. */
export function CuratedLayouts({
  data,
  name,
  role,
  contacts,
  sections,
  portrait,
}: CreativeLayoutProps) {
  if (
    ![
      "maison",
      "gallery",
      "forma",
      "linen",
      "muse",
      "cinema",
      "panorama",
    ].includes(data.layout ?? "")
  )
    return null;
  const support = sections.filter((section) =>
    /education|formation|skill|expertise|language|langue|tool|recognition/i.test(
      section.title,
    ),
  );
  const main = sections.filter((section) => !support.includes(section));
  const introduction = main.filter(
    (section) =>
      section.id === "profile" ||
      /profile|approach|perspective|statement|about/i.test(section.title),
  );
  const career = main.filter((section) => !introduction.includes(section));
  const identity = (
    <div className="cv-cu-identity">
      <h1 className="cv-name">{name}</h1>
      {role && <p className="cv-role">{role}</p>}
    </div>
  );
  const photo = portrait ? (
    <img
      className="cv-cu-portrait"
      src={portrait}
      alt={`Portrait of ${name}`}
    />
  ) : (
    <CuratedArch />
  );

  if (data.layout === "maison")
    return (
      <>
        <div className="cv-cu-maison-top">
          <span>PRIVATE PORTFOLIO</span>
          <span>DESIGN & CULTURE</span>
          <span>01 — CV</span>
        </div>
        <header className="cv-cu-maison-header">
          {identity}
          <div className="cv-cu-maison-photo">
            {photo}
            <span className="cv-cu-photo-label">A PERSONAL PRACTICE</span>
          </div>
        </header>
        <div className="cv-cu-maison-contact">
          <Contacts values={contacts} icons={false} />
        </div>
        <div className="cv-cu-maison-intro">
          <CuratedSections sections={introduction} />
        </div>
        <div className="cv-cu-maison-body">
          <main>
            <CuratedSections sections={career} />
          </main>
          <aside>
            <CuratedSections sections={support} />
          </aside>
        </div>
        <CuratedFolio left="THOUGHTFUL BY DESIGN" />
      </>
    );

  if (data.layout === "gallery")
    return (
      <>
        <div className="cv-cu-gallery-top">
          <span>INDEPENDENT CREATIVE PRACTICE</span>
          <span>PORTFOLIO / CV / 01</span>
        </div>
        <header className="cv-cu-gallery-header">
          {identity}
          <div className="cv-cu-gallery-art" aria-hidden="true">
            <span className="cv-cu-gallery-circle" />
            <span className="cv-cu-gallery-cross-v" />
            <span className="cv-cu-gallery-cross-h" />
            <span className="cv-cu-gallery-dot" />
          </div>
        </header>
        <Contacts values={contacts} icons={false} />
        <div className="cv-cu-gallery-intro">
          <span className="cv-cu-big-index">01</span>
          <CuratedSections sections={introduction} />
        </div>
        <main className="cv-cu-gallery-body">
          {career.map((section, index) => (
            <div className="cv-cu-gallery-cell" key={section.id ?? index}>
              <span className="cv-cu-big-index">0{index + 2}</span>
              <Section section={section} />
            </div>
          ))}
        </main>
        <aside className="cv-cu-gallery-support">
          <CuratedSections sections={support} />
        </aside>
        <CuratedFolio
          left="IDEAS INTO IDENTITIES."
          right="OPEN TO NEW PERSPECTIVES ↗"
        />
      </>
    );

  if (data.layout === "forma")
    return (
      <>
        <div className="cv-cu-forma-band">
          <span>FORM / SPACE / PEOPLE</span>
          <span>PROFESSIONAL RECORD — 01</span>
        </div>
        <header className="cv-cu-forma-header">
          <div>
            <span className="cv-cu-forma-kicker">
              A PRACTICE IN PERSPECTIVE
            </span>
            {identity}
          </div>
          <CuratedArch plan />
        </header>
        <Contacts values={contacts} icons={false} />
        <div className="cv-cu-forma-body">
          <aside>
            <div className="cv-cu-forma-note">
              <span>DETAIL / 01</span>
              {data.artwork ? (
                <img
                  src={data.artwork}
                  alt="Sculptural white architectural forms against a clear sky"
                />
              ) : (
                <CuratedArch plan />
              )}
            </div>
            <CuratedSections sections={support} />
          </aside>
          <main>
            <CuratedSections sections={main} />
          </main>
        </div>
        <CuratedFolio left="PRECISION WITH PURPOSE" right="SCALE 1:1 / A4" />
      </>
    );

  if (data.layout === "linen")
    return (
      <>
        <div className="cv-cu-linen-top">
          <span>CURRICULUM VITAE</span>
          <span>A CONSIDERED PRACTICE</span>
        </div>
        <header className="cv-cu-linen-header">
          {identity}
          <div className="cv-cu-linen-photo">{photo}</div>
        </header>
        <div className="cv-cu-linen-contact">
          <Contacts values={contacts} icons={false} />
        </div>
        <div className="cv-cu-linen-body">
          <main>
            <CuratedSections sections={main} />
          </main>
          <aside>
            <span className="cv-cu-linen-aside-label">THE DETAILS</span>
            <CuratedSections sections={support} />
          </aside>
        </div>
        <CuratedFolio
          left="LESS, WITH INTENTION."
          right="PERSONAL EDITION / 01"
        />
      </>
    );

  if (data.layout === "muse")
    return (
      <>
        <div className="cv-cu-muse-orbit" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <header className="cv-cu-muse-header">
          <div>
            <span className="cv-cu-muse-kicker">
              CREATIVE THINKING. HUMAN FEELING.
            </span>
            {identity}
          </div>
          <div className="cv-cu-muse-photo">{photo}</div>
        </header>
        <Contacts values={contacts} icons={false} />
        <div className="cv-cu-muse-intro">
          <CuratedSections sections={introduction} />
        </div>
        <div className="cv-cu-muse-body">
          <main>
            <CuratedSections sections={career} />
          </main>
          <aside>
            <CuratedSections sections={support} />
          </aside>
        </div>
        <CuratedFolio
          left="A LITTLE CURIOSITY GOES A LONG WAY"
          right="LET’S MAKE SOMETHING MATTER ↗"
        />
      </>
    );

  if (data.layout === "cinema")
    return (
      <>
        <div className="cv-cu-cinema-perfs" aria-hidden="true">
          {Array.from({ length: 17 }, (_, index) => (
            <span key={index} />
          ))}
        </div>
        <div className="cv-cu-cinema-top">
          <span>A CREATIVE CAREER</span>
          <span>EST. 2017 / LONDON</span>
          <span>01:01</span>
        </div>
        <header className="cv-cu-cinema-header">
          <span className="cv-cu-cinema-presents">PROFESSIONAL PROFILE</span>
          {identity}
          <div className="cv-cu-cinema-line">
            <span />
            <span>SELECTED CREDITS & EXPERIENCE</span>
            <span />
          </div>
        </header>
        <Contacts values={contacts} icons={false} />
        <div className="cv-cu-cinema-intro">
          <CuratedSections sections={introduction} />
        </div>
        <main className="cv-cu-cinema-body">
          <CuratedSections sections={career} />
        </main>
        <aside className="cv-cu-cinema-support">
          <CuratedSections sections={support} />
        </aside>
        <CuratedFolio
          left="STORIES WORTH TELLING"
          right="CONTINUED IN CONVERSATION"
        />
      </>
    );

  return (
    <>
      <header className="cv-cu-panorama-header">
        <div className="cv-cu-panorama-top">
          <span>IMAGE MAKING / STORYTELLING</span>
          <span>SELECTED EXPERIENCE — 01</span>
        </div>
        {identity}
      </header>
      <div className="cv-cu-panorama-image">
        {data.artwork ? (
          <img
            src={data.artwork}
            alt="Atmospheric landscape from the photographer’s fictional portfolio"
          />
        ) : (
          <svg viewBox="0 0 794 260" aria-hidden="true">
            <rect width="794" height="260" fill="#cbd6d4" />
            <path
              d="M0 190 180 65 325 156 485 27 794 207v53H0Z"
              fill="#597775"
            />
            <path d="m0 260 265-155 180 155Z" fill="#244d4e" />
            <path d="m377 260 223-148 194 148Z" fill="#889c8b" />
          </svg>
        )}
        <div className="cv-cu-panorama-caption">
          <span>FIELD NOTES / A WAY OF SEEING</span>
          <span>LIGHT, PLACE & THE IN-BETWEEN</span>
        </div>
      </div>
      <Contacts values={contacts} icons={false} />
      <div className="cv-cu-panorama-body">
        <main>
          <CuratedSections sections={main} />
        </main>
        <aside>
          <CuratedSections sections={support} />
        </aside>
      </div>
      <CuratedFolio
        left="OBSERVE CLOSELY. TELL IT WELL."
        right="AVAILABLE FOR COMMISSIONS ↗"
      />
    </>
  );
}
