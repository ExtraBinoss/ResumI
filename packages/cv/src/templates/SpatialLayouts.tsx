import type { CreativeLayoutProps } from "./creative-types";
import type { ResumeSection } from "./types";
import { Contacts, Section } from "./TemplateContent";

function SpatialSections({ sections }: { sections: ResumeSection[] }) {
  return sections.map((section) => (
    <Section key={section.id ?? section.title} section={section} />
  ));
}

/** A hand-drawn contour family; every line remains a native editable vector. */
function ContourDrawing() {
  return (
    <svg
      className="cv-contour-drawing"
      viewBox="0 0 340 290"
      fill="none"
      aria-hidden="true"
    >
      {Array.from({ length: 16 }, (_, index) => (
        <path
          key={index}
          d={`M${-27 + index * 6} ${281 - index * 8}C${46 + index * 2} ${273 - index * 12},${26 + index * 8} ${177 - index * 4},${106 + index * 3} ${174 - index * 7}S${202 + index * 5} ${72 + index * 3},${213 + index * 4} ${30 - index * 6}S335 ${16 - index * 3},371 ${-21 + index * 5}`}
          stroke={index % 4 === 0 ? "#718573" : "#b8c4ad"}
          strokeWidth={index % 4 === 0 ? "1" : ".55"}
        />
      ))}
      <circle cx="179" cy="129" r="3" fill="#a66c43" />
      <path d="M179 129h45l14-14" stroke="#a66c43" strokeWidth=".8" />
      <path
        d="M40 50v-26m-5 7 5-7 5 7M24 254h68m-68-4v8m34-8v8m34-8v8"
        stroke="#49624c"
      />
    </svg>
  );
}

function NocturneDrawing() {
  return (
    <svg
      className="cv-nocturne-drawing"
      viewBox="0 0 290 290"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="145" cy="145" r="108" stroke="#6d607d" strokeWidth=".6" />
      <circle
        cx="145"
        cy="145"
        r="82"
        fill="#2c233d"
        stroke="#a998b8"
        strokeWidth=".6"
      />
      {Array.from({ length: 14 }, (_, index) => (
        <ellipse
          key={index}
          cx="145"
          cy="145"
          rx={14 + index * 6}
          ry="81"
          transform={`rotate(${index * 13} 145 145)`}
          stroke="#a496b7"
          strokeWidth=".55"
          opacity={0.25 + index * 0.035}
        />
      ))}
      <circle cx="145" cy="37" r="3" fill="#e4c7a5" />
      <circle cx="242" cy="192" r="5" fill="#e4c7a5" />
      <path
        d="M145 12v14m0 238v14M12 145h14m238 0h14M44 44l10 10m182 182 10 10"
        stroke="#b3a2c6"
        strokeWidth=".7"
      />
      <path d="M137 145h16m-8-8v16" stroke="#e4c7a5" />
    </svg>
  );
}

function SolsticeDrawing() {
  return (
    <svg
      className="cv-solstice-drawing"
      viewBox="0 0 225 250"
      aria-hidden="true"
    >
      <path d="M12 132a100 100 0 0 1 200 0z" fill="#c9572f" />
      <path
        d="M12 145h200v11H12zm0 24h200v6H12zm0 19h200v3H12z"
        fill="#c9572f"
      />
      <path d="M112 14v217M1 132h224" stroke="#8f7e63" strokeWidth=".6" />
      <circle cx="112" cy="132" r="3" fill="#2e302c" />
      <path
        d="M12 212h200m-200-5v10m200-10v10"
        stroke="#8f7e63"
        strokeWidth=".6"
      />
    </svg>
  );
}

function AerogramRoute() {
  return (
    <svg
      className="cv-aerogram-route"
      viewBox="0 0 250 145"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M20 115C100 130 65 19 144 42s18 61 83-19"
        stroke="#305c92"
        strokeWidth="1.2"
        strokeDasharray="3 4"
      />
      <circle cx="20" cy="115" r="4" fill="#c34d3e" />
      <circle cx="144" cy="42" r="4" fill="#c34d3e" />
      <path d="m225 19-8 8 5 1 1 5 8-17z" fill="#305c92" />
      <path
        d="M15 115h10m-5-5v10M139 42h10m-5-5v10"
        stroke="#fffdf7"
        strokeWidth=".7"
      />
    </svg>
  );
}

function GridlinePlan() {
  return (
    <svg
      className="cv-gridline-plan"
      viewBox="0 0 220 205"
      fill="none"
      aria-hidden="true"
    >
      <path d="M36 36h144v126H36z" stroke="#3c4b46" strokeWidth="2" />
      <path
        d="M36 91h56v71m0-71h88M129 36v55M36 128h56"
        stroke="#3c4b46"
        strokeWidth="1.5"
      />
      <path
        d="M92 91a37 37 0 0 1 37 37H92zm37-55a35 35 0 0 1 35 35h-35"
        stroke="#8b9c91"
        strokeWidth=".7"
      />
      <path d="M48 47h31v31H48zm95 58h24v44h-24z" fill="#e0e6df" />
      <path
        d="M45 155h35m-35-7h35m-35-7h35M26 36V15h154v11M36 15v11m48-11v11m48-11v11m48-11v11M195 36v126m-7-126h14m-14 126h14"
        stroke="#8b9c91"
        strokeWidth=".6"
      />
      <circle cx="111" cy="173" r="4" stroke="#c07041" />
      <path d="M108 173h6m-3-3v6" stroke="#c07041" strokeWidth=".7" />
    </svg>
  );
}

export function SpatialLayouts({
  data,
  name,
  role,
  contacts,
  sections,
  portrait,
}: CreativeLayoutProps) {
  const secondary = (section: ResumeSection) =>
    ["education", "skills", "languages"].includes(section.id ?? "") ||
    /education|formation|skills|toolkit|competenc|compétenc|languages|langues|certif/i.test(
      section.title,
    );
  const aside = sections.filter(secondary);
  const primary = sections.filter((section) => !secondary(section));
  const intro = primary.filter(
    (section) =>
      section.id === "profile" ||
      (!section.id &&
        /^(profile|summary|approach|perspective|practice|statement|profil)$/i.test(
          section.title,
        )),
  );
  const career = primary.filter((section) => !intro.includes(section));
  const identity = (
    <div className="cv-spatial-identity">
      <h1 className="cv-name">{name}</h1>
      {role && <p className="cv-role">{role}</p>}
    </div>
  );
  const footer = (
    <footer className="cv-spatial-footer">
      <span>{name}</span>
      <span>Curriculum vitae</span>
      <span>01</span>
    </footer>
  );

  if (data.layout === "contour")
    return (
      <>
        <header className="cv-contour-header">
          <div>
            <span className="cv-spatial-kicker">
              LANDSCAPE / ECOLOGY / PLACE
            </span>
            {identity}
            <Contacts values={contacts} icons={false} />
          </div>
          <ContourDrawing />
        </header>
        <div className="cv-contour-intro">
          <span className="cv-contour-index" aria-hidden="true">
            01 /<br />
            FIELD NOTES
          </span>
          <SpatialSections sections={intro} />
        </div>
        <div className="cv-contour-columns">
          <main>
            <SpatialSections sections={career} />
          </main>
          <aside>
            <SpatialSections sections={aside} />
            <div className="cv-contour-specimen" aria-hidden="true">
              <svg viewBox="0 0 150 110" fill="none">
                <path
                  d="M73 109C71 80 82 49 79 10M75 88C35 91 24 65 23 52c29-3 51 10 52 36M78 64c28 2 45-21 46-37-25-2-45 11-46 37M79 40C52 40 43 20 47 9c19 3 31 15 32 31"
                  stroke="#718573"
                  strokeWidth=".8"
                />
              </svg>
              <span>Observe. Restore. Connect.</span>
            </div>
          </aside>
        </div>
        {footer}
      </>
    );
  if (data.layout === "nocturne")
    return (
      <>
        <div className="cv-nocturne-topline">
          <span className="cv-spatial-kicker">ART × TECHNOLOGY</span>
          <span aria-hidden="true">SELECTED PRACTICE / 01</span>
        </div>
        <header className="cv-nocturne-header">
          {identity}
          <NocturneDrawing />
        </header>
        <div className="cv-nocturne-intro">
          <SpatialSections sections={intro} />
          <Contacts values={contacts} icons={false} />
        </div>
        <div className="cv-nocturne-columns">
          <main>
            <SpatialSections sections={career} />
          </main>
          <aside>
            <SpatialSections sections={aside} />
            <span className="cv-nocturne-star" aria-hidden="true">
              ✳
            </span>
          </aside>
        </div>
        {footer}
      </>
    );
  if (data.layout === "solstice")
    return (
      <>
        <div className="cv-solstice-topline">
          <span className="cv-spatial-kicker">FORM FOLLOWS FEELING.</span>
          <span aria-hidden="true">PORTFOLIO / CV</span>
        </div>
        <header className="cv-solstice-header">
          {identity}
          <SolsticeDrawing />
        </header>
        <div className="cv-solstice-rule" aria-hidden="true">
          <span>01 — PRACTICE</span>
          <span>SPACE, LIGHT & HUMAN EXPERIENCE</span>
        </div>
        <div className="cv-solstice-columns">
          <aside>
            <Contacts values={contacts} icons={false} />
            <SpatialSections sections={aside} />
          </aside>
          <main>
            <div className="cv-solstice-intro">
              <SpatialSections sections={intro} />
            </div>
            <SpatialSections sections={career} />
          </main>
        </div>
        {footer}
      </>
    );
  if (data.layout === "aerogram")
    return (
      <>
        <svg
          className="cv-aerogram-edge"
          viewBox="0 0 794 12"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {Array.from({ length: 33 }, (_, index) => (
            <path
              key={index}
              d={`M${index * 24 + 8} 0h13l-8 12h-13z`}
              fill={index % 2 ? "#c34d3e" : "#305c92"}
            />
          ))}
        </svg>
        <div className="cv-aerogram-topline">
          <span className="cv-spatial-kicker">IDEAS TRAVEL WELL.</span>
          <span aria-hidden="true">AIR MAIL / PAR AVION</span>
        </div>
        <header className="cv-aerogram-header">
          <div>
            {identity}
            <Contacts values={contacts} icons={false} />
          </div>
          <div className="cv-aerogram-postmark" aria-hidden="true">
            <span>
              OPEN TO
              <br />
              NEW ROUTES
            </span>
            <b>↗</b>
            <small>CREATIVE PRACTICE</small>
          </div>
        </header>
        <div className="cv-aerogram-intro">
          <SpatialSections sections={intro} />
          <AerogramRoute />
        </div>
        <div className="cv-aerogram-columns">
          <main>
            <SpatialSections sections={career} />
          </main>
          <aside>
            <SpatialSections sections={aside} />
            <div className="cv-aerogram-ticket" aria-hidden="true">
              <span>DESTINATION</span>
              <strong>What’s next.</strong>
              <span>SEAT 01 / CLASS CREATIVE</span>
            </div>
          </aside>
        </div>
        {footer}
      </>
    );
  if (data.layout === "gridline")
    return (
      <>
        <svg
          className="cv-gridline-paper"
          viewBox="0 0 794 1123"
          aria-hidden="true"
        >
          <path
            d={
              Array.from({ length: 63 }, (_, i) => `M0 ${i * 18}H794`).join(
                " ",
              ) +
              " " +
              Array.from({ length: 45 }, (_, i) => `M${i * 18} 0V1123`).join(
                " ",
              )
            }
            fill="none"
            stroke="#87998b"
            strokeOpacity=".04"
            strokeWidth="1"
          />
        </svg>
        <div className="cv-gridline-frame" aria-hidden="true">
          <span>A</span>
          <span>B</span>
          <span>C</span>
          <span>D</span>
        </div>
        <div className="cv-gridline-topline">
          <span className="cv-spatial-kicker">
            ARCHITECTURE / BUILT ENVIRONMENT
          </span>
          <span aria-hidden="true">DRAWING NO. CV—01</span>
        </div>
        <header className="cv-gridline-header">
          <div>
            {identity}
            <Contacts values={contacts} icons={false} />
          </div>
          <GridlinePlan />
        </header>
        <div className="cv-gridline-intro">
          <span className="cv-gridline-coordinate" aria-hidden="true">
            A.01
          </span>
          <SpatialSections sections={intro} />
        </div>
        <div className="cv-gridline-columns">
          <main>
            {career.map((section, index) => (
              <div
                className="cv-gridline-module"
                key={section.id ?? section.title}
              >
                <span className="cv-gridline-coordinate" aria-hidden="true">
                  B.0{index + 1}
                </span>
                <Section section={section} />
              </div>
            ))}
          </main>
          <aside>
            <SpatialSections sections={aside} />
          </aside>
        </div>
        <footer className="cv-gridline-titleblock">
          <span>
            {name}
            <small>{role}</small>
          </span>
          <span>
            DOCUMENT<small>Curriculum vitae</small>
          </span>
          <span>
            SCALE<small>A4 / 01</small>
          </span>
        </footer>
      </>
    );
  if (data.layout === "polaroid")
    return (
      <>
        <div className="cv-polaroid-topline">
          <span className="cv-spatial-kicker">IMAGE MAKING / STORYTELLING</span>
          <span aria-hidden="true">CONTACT SHEET Nº 01</span>
        </div>
        <header className="cv-polaroid-header">
          <div>
            {identity}
            <Contacts values={contacts} icons={false} />
          </div>
          <span className="cv-polaroid-mark" aria-hidden="true">
            look
            <br />
            <i>closer.</i>
          </span>
        </header>
        <div className="cv-polaroid-gallery">
          <figure className="cv-polaroid-print cv-polaroid-print-wide">
            {data.artwork && (
              <img
                src={data.artwork}
                alt="A quiet coastal landscape with warm afternoon light"
              />
            )}
            <figcaption>
              01 / Finding the extraordinary in the everyday.
            </figcaption>
          </figure>
          <figure className="cv-polaroid-print cv-polaroid-print-portrait">
            {portrait && <img src={portrait} alt={`Portrait of ${name}`} />}
            <figcaption>02 / Behind the lens.</figcaption>
          </figure>
          <figure className="cv-polaroid-print cv-polaroid-print-detail">
            {data.artwork && (
              <img
                src={data.artwork}
                alt="A close crop exploring architectural lines and natural textures"
              />
            )}
            <figcaption>03 / Light studies.</figcaption>
          </figure>
        </div>
        <div className="cv-polaroid-intro">
          <SpatialSections sections={intro} />
        </div>
        <div className="cv-polaroid-columns">
          <main>
            <SpatialSections sections={career} />
          </main>
          <aside>
            <SpatialSections sections={aside} />
          </aside>
        </div>
        {footer}
      </>
    );
  return null;
}
