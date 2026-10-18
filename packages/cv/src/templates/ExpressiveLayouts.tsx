import type { CreativeLayoutProps } from "./creative-types";
import type { ResumeSection } from "./types";
import { Contacts, Section } from "./TemplateContent";

function ExpressiveSections({ sections }: { sections: ResumeSection[] }) {
  return (
    <>
      {sections.map((section) => (
        <Section key={section.id ?? section.title} section={section} />
      ))}
    </>
  );
}

function ExpressiveSupport({ sections }: { sections: ResumeSection[] }) {
  return (
    <>
      {sections.map((section) => {
        if (!/skill|competenc|compétenc/i.test(section.title))
          return (
            <Section key={section.id ?? section.title} section={section} />
          );
        return (
          <section
            className="cv-section cv-skills-section"
            data-section-id={section.id}
            key={section.id ?? section.title}
          >
            <h2>{section.title}</h2>
            <div className="cv-section-content">
              {section.blocks.map((block, index) => (
                <p
                  className="cv-ex-skill"
                  data-block-id={block.id}
                  key={block.id ?? index}
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

function ExpressiveRisoArt() {
  const dots = Array.from({ length: 88 }, (_, i) => ({
    x: 16 + (i % 11) * 14,
    y: 10 + Math.floor(i / 11) * 14,
  }));
  return (
    <svg className="cv-ex-riso-art" viewBox="0 0 200 180" aria-hidden="true">
      <path d="M10 156V90a82 82 0 0 1 164 0v66Z" fill="#ef784b" />
      <path
        d="M48 175V93a72 72 0 0 1 144 0v82Z"
        fill="#dd4a83"
        fillOpacity=".8"
      />
      {dots.map(({ x, y }, i) => (
        <circle key={i} cx={x} cy={y + 28} r="1.4" fill="#772d46" />
      ))}
      <path
        d="M5 153h190M99 5v170"
        fill="none"
        stroke="#552b38"
        strokeWidth=".7"
      />
      <circle cx="99" cy="153" r="12" fill="#fff4db" />
    </svg>
  );
}

function ExpressiveBotanicArt() {
  return (
    <svg className="cv-ex-botanic-art" viewBox="0 0 170 270" aria-hidden="true">
      <path
        d="M85 258C52 199 123 118 78 20"
        fill="none"
        stroke="#456a53"
        strokeWidth="1.4"
      />
      {Array.from({ length: 7 }, (_, i) => {
        const y = 54 + i * 26;
        const right = i % 2 === 0;
        const x = 81 + Math.sin(i * 0.75) * 12;
        const direction = right ? 1 : -1;
        const endX = x + direction * (45 + (i % 3) * 6);
        return (
          <g key={i}>
            <path
              d={`M${x} ${y + 29} Q${endX + direction * 12} ${y + 17} ${endX} ${y - 13} Q${x - direction * 6} ${y - 9} ${x} ${y + 29}Z`}
              fill={i % 3 === 0 ? "#a9b89a" : "#64846b"}
            />
            <path
              d={`M${x} ${y + 29}L${endX} ${y - 13}`}
              fill="none"
              stroke="#f3f0e3"
              strokeWidth=".8"
            />
          </g>
        );
      })}
      <circle cx="79" cy="20" r="12" fill="#ce9a73" />
      <circle cx="79" cy="20" r="4" fill="#f3f0e3" />
      <path
        d="M18 257h136M85 250v14"
        fill="none"
        stroke="#a6b39c"
        strokeWidth=".7"
      />
    </svg>
  );
}

function ExpressiveCassetteArt() {
  return (
    <svg
      className="cv-ex-cassette-art"
      viewBox="0 0 270 190"
      aria-hidden="true"
    >
      <rect
        x="6"
        y="17"
        width="258"
        height="158"
        rx="14"
        fill="#f36e58"
        stroke="#29292b"
        strokeWidth="2"
      />
      <path
        d="M22 32h226v89H22Z"
        fill="#f8efd9"
        stroke="#29292b"
        strokeWidth="1.5"
      />
      <path d="M23 49h224M23 58h224" stroke="#f36e58" strokeWidth="4" />
      <rect x="45" y="72" width="180" height="38" rx="19" fill="#29292b" />
      <rect x="97" y="79" width="76" height="24" rx="4" fill="#827b6f" />
      {[72, 198].map((x) => (
        <g key={x}>
          <circle
            cx={x}
            cy="91"
            r="25"
            fill="#f8efd9"
            stroke="#29292b"
            strokeWidth="2"
          />
          <circle cx={x} cy="91" r="13" fill="#29292b" />
          {Array.from({ length: 8 }, (_, i) => (
            <path
              key={i}
              d={`M${x - 3} 78h6v8h-6Z`}
              fill="#f8efd9"
              transform={`rotate(${i * 45} ${x} 91)`}
            />
          ))}
          <circle cx={x} cy="91" r="5" fill="#f8efd9" />
        </g>
      ))}
      <path
        d="m75 174 13-40h94l13 40Z"
        fill="#f8efd9"
        stroke="#29292b"
        strokeWidth="1.5"
      />
      {[28, 242].flatMap((x) =>
        [36, 155].map((y) => (
          <g key={`${x}-${y}`}>
            <circle cx={x} cy={y} r="4" fill="#f8efd9" stroke="#29292b" />
            <path d={`M${x - 2} ${y}h4`} stroke="#29292b" />
          </g>
        )),
      )}
      <circle cx="100" cy="155" r="4" fill="#29292b" />
      <circle cx="170" cy="155" r="4" fill="#29292b" />
      <path d="M119 149h32v12h-32Z" fill="#29292b" />
    </svg>
  );
}

function ExpressiveWave() {
  return (
    <svg
      className="cv-ex-wave"
      viewBox="0 0 690 35"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {Array.from({ length: 173 }, (_, i) => {
        const amplitude =
          3 + Math.abs(Math.sin(i * 0.31) * Math.cos(i * 0.09)) * 27;
        return (
          <path
            key={i}
            d={`M${i * 4} ${17.5 - amplitude / 2}v${amplitude}`}
            stroke={i % 7 < 3 ? "#f36e58" : "#373331"}
            strokeWidth="1.5"
          />
        );
      })}
    </svg>
  );
}

function ExpressiveSignalArt() {
  return (
    <svg className="cv-ex-signal-art" viewBox="0 0 240 240" aria-hidden="true">
      {Array.from({ length: 36 }, (_, i) => {
        const angle = (i * Math.PI) / 18;
        const radius = 79 + Math.sin((i * Math.PI) / 6) * 15;
        const x = 120 + Math.cos(angle) * radius;
        const y = 120 + Math.sin(angle) * radius;
        return (
          <ellipse
            key={i}
            cx={x}
            cy={y}
            rx="28"
            ry="7"
            fill="none"
            stroke={i % 3 === 0 ? "#a3c66f" : "#6a45a2"}
            strokeWidth="1.2"
            transform={`rotate(${i * 10 + 45} ${x} ${y})`}
          />
        );
      })}
      <circle cx="120" cy="120" r="37" fill="#56338a" />
      <path d="M97 120h46M120 97v46" stroke="#eee9f5" strokeWidth="1.2" />
      <circle cx="120" cy="120" r="6" fill="#c9df9c" />
    </svg>
  );
}

/** Original, deterministic compositions; all substantive copy comes from document blocks. */
export function ExpressiveLayouts({
  data,
  name,
  role,
  contacts,
  sections,
}: CreativeLayoutProps) {
  if (
    !["risograph", "swiss", "botanica", "cassette", "signal"].includes(
      data.layout ?? "",
    )
  )
    return null;
  const support = sections.filter((section) =>
    /education|formation|skill|competenc|compétenc|language|langue|certif|outil/i.test(
      section.title,
    ),
  );
  const main = sections.filter((section) => !support.includes(section));
  const introduction = main.filter(
    (section) =>
      section.id === "profile" ||
      /profil|summary|approach|approche|propos|positionnement|bref|pratique/i.test(
        section.title,
      ),
  );
  const career = main.filter((section) => !introduction.includes(section));
  const identity = (
    <div className="cv-ex-identity">
      <h1 className="cv-name">{name}</h1>
      {role && <p className="cv-role">{role}</p>}
    </div>
  );

  if (data.layout === "risograph")
    return (
      <>
        <div className="cv-ex-riso-top" aria-hidden="true">
          <span>ÉDITION PERSONNELLE</span>
          <span>CURRICULUM VITÆ · 01</span>
        </div>
        <header className="cv-ex-riso-header">
          {identity}
          <ExpressiveRisoArt />
        </header>
        <Contacts values={contacts} icons={false} />
        <div className="cv-ex-riso-intro">
          <ExpressiveSections sections={introduction} />
        </div>
        <main className="cv-ex-riso-body">
          {career.map((section, index) => (
            <div
              key={section.id ?? index}
              className={`cv-ex-riso-column cv-ex-riso-column-${index}`}
            >
              <Section section={section} />
            </div>
          ))}
        </main>
        <aside className="cv-ex-riso-support">
          <ExpressiveSupport sections={support} />
        </aside>
        <footer className="cv-ex-riso-footer" aria-hidden="true">
          <span />
          <span />
          <span />
          <i>01</i>
        </footer>
      </>
    );

  if (data.layout === "swiss")
    return (
      <>
        <div className="cv-ex-swiss-top" aria-hidden="true">
          <span>CURRICULUM VITÆ</span>
          <span>DESIGN / SYSTÈMES / CULTURE</span>
          <span>01</span>
        </div>
        <header className="cv-ex-swiss-header">
          {identity}
          <div className="cv-ex-swiss-symbol" aria-hidden="true">
            <span />
            <span />
          </div>
        </header>
        <Contacts values={contacts} icons={false} />
        <main className="cv-ex-swiss-body">
          {main.map((section, index) => (
            <div className="cv-ex-swiss-row" key={section.id ?? index}>
              <span className="cv-ex-swiss-index" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <Section section={section} />
            </div>
          ))}
        </main>
        <aside className="cv-ex-swiss-support">
          <ExpressiveSupport sections={support} />
        </aside>
        <footer className="cv-ex-swiss-footer" aria-hidden="true">
          <span>CLARTÉ. STRUCTURE. CARACTÈRE.</span>
          <span>●</span>
        </footer>
      </>
    );

  if (data.layout === "botanica")
    return (
      <>
        <aside className="cv-ex-botanic-rail">
          <div className="cv-ex-botanic-label" aria-hidden="true">
            CULTIVER LES IDÉES
          </div>
          <ExpressiveBotanicArt />
          <Contacts values={contacts} icons={false} />
          <ExpressiveSupport sections={support} />
        </aside>
        <main className="cv-ex-botanic-main">
          <div className="cv-ex-botanic-kicker" aria-hidden="true">
            DESIGN & SENSIBILITÉ
          </div>
          <header className="cv-ex-botanic-header">{identity}</header>
          <ExpressiveSections sections={main} />
        </main>
        <footer className="cv-ex-botanic-footer" aria-hidden="true">
          <span>LES DÉTAILS FONT L’ENSEMBLE</span>
          <span>01</span>
        </footer>
      </>
    );

  if (data.layout === "cassette")
    return (
      <>
        <div className="cv-ex-cassette-top" aria-hidden="true">
          <span>ENREGISTREMENT ORIGINAL</span>
          <span>STÉRÉO / 01</span>
        </div>
        <header className="cv-ex-cassette-header">
          {identity}
          <ExpressiveCassetteArt />
        </header>
        <Contacts values={contacts} icons={false} />
        <div className="cv-ex-cassette-intro">
          <ExpressiveSections sections={introduction} />
        </div>
        <main className="cv-ex-cassette-body">
          {career.map((section, index) => (
            <div className="cv-ex-cassette-track" key={section.id ?? index}>
              <div className="cv-ex-cassette-side" aria-hidden="true">
                {String.fromCharCode(65 + index)}
                <span>FACE</span>
              </div>
              <Section section={section} />
            </div>
          ))}
        </main>
        <aside className="cv-ex-cassette-support">
          <ExpressiveSupport sections={support} />
        </aside>
        <footer className="cv-ex-cassette-footer">
          <ExpressiveWave />
        </footer>
      </>
    );

  return (
    <>
      <div className="cv-ex-signal-top" aria-hidden="true">
        <span>PRATIQUE CRÉATIVE / CURRICULUM VITÆ</span>
        <span>ÉDITION 01 ↗</span>
      </div>
      <header className="cv-ex-signal-header">
        <ExpressiveSignalArt />
        {identity}
      </header>
      <Contacts values={contacts} icons={false} />
      <div className="cv-ex-signal-intro">
        <ExpressiveSections sections={introduction} />
      </div>
      <main className="cv-ex-signal-body">
        {career.map((section, index) => (
          <div className="cv-ex-signal-column" key={section.id ?? index}>
            <span className="cv-ex-signal-index" aria-hidden="true">
              {String(index + 1).padStart(2, "0")} /
            </span>
            <Section section={section} />
          </div>
        ))}
      </main>
      <aside className="cv-ex-signal-support">
        <ExpressiveSupport sections={support} />
      </aside>
      <footer className="cv-ex-signal-footer" aria-hidden="true">
        <span>FORME ↔ FONCTION</span>
        <span className="cv-ex-signal-dots">● ● ● ● ● ●</span>
        <span>01</span>
      </footer>
    </>
  );
}
