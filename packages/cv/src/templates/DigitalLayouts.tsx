import type { CreativeLayoutProps } from "./creative-types";
import type { ResumeSection } from "./types";
import { Contacts, Section } from "./TemplateContent";

function DigitalSections({ sections }: { sections: ResumeSection[] }) {
  return sections.map((section) => (
    <Section key={section.id ?? section.title} section={section} />
  ));
}

/** Original pixel landscape, assembled from an integer tile map rather than an image. */
function DigitalPixelGarden() {
  const flower = [
    "00100",
    "01310",
    "13431",
    "01310",
    "00200",
    "02220",
    "00200",
  ];
  const palette = ["none", "#f5747f", "#375a43", "#f8c853", "#fff9e9"];
  return (
    <svg
      viewBox="0 0 240 152"
      className="cv-pixel-garden"
      aria-hidden="true"
      shapeRendering="crispEdges"
    >
      <rect width="240" height="152" fill="#c8c4ee" />
      <rect x="171" y="17" width="31" height="31" fill="#f8c853" />
      {[15, 73, 122].map((x, i) => (
        <path
          key={x}
          d={`M${x} ${23 + i * 9}h28v6h9v7h-46v-7h9z`}
          fill="#fff9e9"
        />
      ))}
      <path
        d="M0 98h24V86h24V75h24v23h24V86h24v12h24V75h24V63h24v23h24v12h24v54H0z"
        fill="#7e8e74"
      />
      <path
        d="M0 121h37v-11h39v11h37v-11h39v11h38v-11h50v42H0z"
        fill="#375a43"
      />
      {[23, 105, 173].flatMap((x, flowerIndex) =>
        flower.flatMap((row, y) =>
          [...row].map((cell, column) =>
            cell !== "0" ? (
              <rect
                key={`${flowerIndex}-${y}-${column}`}
                x={x + column * 5}
                y={94 + y * 5}
                width="5"
                height="5"
                fill={palette[Number(cell)]}
              />
            ) : null,
          ),
        ),
      )}
      <path d="M0 143h240v9H0z" fill="#24362d" />
      {Array.from({ length: 20 }, (_, i) => (
        <rect key={i} x={i * 13} y="146" width="5" height="2" fill="#7e8e74" />
      ))}
    </svg>
  );
}

/** Concentric ellipses and computed nodes form a quiet, reproducible orbital drawing. */
function DigitalOrbitDiagram() {
  return (
    <svg
      viewBox="0 0 290 262"
      className="cv-orbit-diagram"
      aria-hidden="true"
      fill="none"
    >
      <path d="M145 7v248M18 131h254" stroke="#c8cdc9" strokeDasharray="2 5" />
      {[0, 1, 2, 3].map((index) => (
        <ellipse
          key={index}
          cx="145"
          cy="131"
          rx={40 + index * 25}
          ry={22 + index * 13}
          transform={`rotate(${-34 + index * 28} 145 131)`}
          stroke={index === 2 ? "#bb6144" : "#79938c"}
          strokeWidth={index === 2 ? "1.4" : ".8"}
        />
      ))}
      {Array.from({ length: 36 }, (_, index) => {
        const angle = (index * Math.PI) / 18;
        return (
          <path
            key={index}
            d={`M${145 + Math.cos(angle) * 122} ${131 + Math.sin(angle) * 122}l${Math.cos(angle) * (index % 3 ? 3 : 7)} ${Math.sin(angle) * (index % 3 ? 3 : 7)}`}
            stroke="#a6b4ad"
            strokeWidth=".8"
          />
        );
      })}
      <circle cx="145" cy="131" r="12" fill="#203f39" />
      <circle
        cx="237"
        cy="95"
        r="6"
        fill="#bb6144"
        stroke="#f5f5ed"
        strokeWidth="3"
      />
      <circle cx="93" cy="85" r="4" fill="#203f39" />
      <circle cx="190" cy="173" r="4" fill="#203f39" />
      <path d="M237 95h34M145 143v38h-28" stroke="#bb6144" strokeWidth=".8" />
    </svg>
  );
}

/** Isometric assembly: every edge is computed from the same projection. */
function DigitalBlueprintDiagram() {
  const project = (x: number, y: number, z: number) =>
    `${122 + (x - y) * 0.84},${114 + (x + y) * 0.42 - z}`;
  const edge = (a: [number, number, number], b: [number, number, number]) =>
    `M${project(...a)}L${project(...b)}`;
  return (
    <svg
      viewBox="0 0 250 220"
      className="cv-blueprint-diagram"
      aria-hidden="true"
      fill="none"
    >
      {Array.from({ length: 6 }, (_, i) => (
        <g key={i} stroke="#78c9dd" strokeWidth=".5" opacity=".35">
          <path d={edge([i * 20, 0, 0], [i * 20, 100, 0])} />
          <path d={edge([0, i * 20, 0], [100, i * 20, 0])} />
        </g>
      ))}
      {[0, 38, 76].map((z) => (
        <path
          key={z}
          d={`M${project(0, 0, z)}L${project(100, 0, z)}L${project(100, 100, z)}L${project(0, 100, z)}Z`}
          stroke="#b1eff7"
          strokeWidth="1.1"
        />
      ))}
      {(
        [
          [0, 0],
          [100, 0],
          [100, 100],
          [0, 100],
        ] as const
      ).map(([x, y]) => (
        <path
          key={`${x}-${y}`}
          d={edge([x, y, 0], [x, y, 76])}
          stroke="#b1eff7"
          strokeWidth="1.1"
        />
      ))}
      <path
        d={edge([0, 0, 76], [100, 100, 76]) + edge([100, 0, 76], [0, 100, 76])}
        stroke="#7ccbdd"
        strokeDasharray="3 3"
      />
      <path
        d="M25 123v-76M21 47h8M21 123h8M32 43l84-42M116 1l84 42"
        stroke="#f2cc82"
        strokeWidth=".8"
      />
      <circle cx="122" cy="80" r="12" stroke="#f2cc82" />
      <path d="M106 80h32M122 64v32" stroke="#f2cc82" strokeWidth=".7" />
    </svg>
  );
}

export function DigitalLayouts({
  data,
  name,
  role,
  contacts,
  sections,
}: CreativeLayoutProps) {
  const secondary = (section: ResumeSection) =>
    ["education", "skills", "languages"].includes(section.id ?? "") ||
    /education|formation|skill|toolkit|competenc|compétenc|language|langue|certif/i.test(
      section.title,
    );
  const aside = sections.filter(secondary);
  const primary = sections.filter((section) => !secondary(section));
  const intro = primary.filter(
    (section) =>
      section.id === "profile" ||
      /profile|summary|approach|profil|README|abstract|hello|design intent|perspective/i.test(
        section.title,
      ),
  );
  const career = primary.filter((section) => !intro.includes(section));
  const identity = (
    <div className="cv-digital-identity">
      <h1 className="cv-name">{name}</h1>
      {role && <p className="cv-role">{role}</p>}
    </div>
  );

  if (data.layout === "terminal")
    return (
      <>
        <div className="cv-terminal-bar" aria-hidden="true">
          <span>● ● ●</span>
          <span>~/curriculum/vitae</span>
          <span>UTF-8</span>
        </div>
        <div className="cv-terminal-body">
          <aside className="cv-terminal-rail">
            <pre className="cv-terminal-ascii" aria-hidden="true">
              {"   /\\\n  /  \\\n / /\\ \\\n/_/  \\_\\"}
            </pre>
            <div className="cv-terminal-tree" aria-hidden="true">
              <span>~/curriculum</span>
              <span>├── profile.md</span>
              <span>├── experience/</span>
              <span>├── projects/</span>
              <span>└── toolkit.json</span>
            </div>
            <Contacts values={contacts} icons={false} />
            <DigitalSections sections={aside} />
          </aside>
          <main className="cv-terminal-main">
            <header>
              <span className="cv-digital-label" aria-hidden="true">
                $ whoami
              </span>
              {identity}
            </header>
            <div className="cv-terminal-intro">
              <DigitalSections sections={intro} />
            </div>
            <DigitalSections sections={career} />
          </main>
        </div>
        <div className="cv-digital-footer">
          <span aria-hidden="true">~/curriculum/vitae</span>
          <span>01</span>
        </div>
      </>
    );

  if (data.layout === "mainframe")
    return (
      <>
        <div className="cv-mainframe-perforations" aria-hidden="true">
          {Array.from({ length: 26 }, (_, index) => (
            <i key={index} />
          ))}
        </div>
        <div className="cv-mainframe-page">
          <header className="cv-mainframe-header">
            <div className="cv-mainframe-stamp" aria-hidden="true">
              PERSONNEL
              <br />
              RECORD / 01
            </div>
            {identity}
            <Contacts values={contacts} icons={false} />
          </header>
          <main>
            <DigitalSections sections={primary} />
          </main>
          <div className="cv-mainframe-bottom">
            <DigitalSections sections={aside} />
          </div>
          <div className="cv-mainframe-rule" aria-hidden="true">
            END OF RECORD <span>════════════════════════════════════</span> 01
          </div>
        </div>
      </>
    );

  if (data.layout === "arcade")
    return (
      <>
        <header className="cv-arcade-header">
          <div>
            <span className="cv-digital-label" aria-hidden="true">
              A NEW ADVENTURE
            </span>
            {identity}
            <Contacts values={contacts} icons={false} />
          </div>
          <DigitalPixelGarden />
        </header>
        <div className="cv-arcade-intro">
          <DigitalSections sections={intro} />
          <span className="cv-arcade-spark" aria-hidden="true">
            ✦
          </span>
        </div>
        <div className="cv-arcade-grid">
          <main>
            <DigitalSections sections={career} />
          </main>
          <aside>
            <DigitalSections sections={aside} />
            <div className="cv-arcade-mini-art" aria-hidden="true">
              {Array.from({ length: 7 }, (_, i) => (
                <i key={i} style={{ height: `${16 + ((i * 13) % 43)}px` }} />
              ))}
            </div>
          </aside>
        </div>
        <div className="cv-digital-footer">
          <span>{name}</span>
          <span>01</span>
        </div>
      </>
    );

  if (data.layout === "blueprint")
    return (
      <>
        <header className="cv-blueprint-header">
          <div>
            <span className="cv-digital-label" aria-hidden="true">
              DESIGN / ENGINEERING
            </span>
            {identity}
            <Contacts values={contacts} icons={false} />
          </div>
          <DigitalBlueprintDiagram />
        </header>
        <div className="cv-blueprint-intro">
          <span className="cv-blueprint-coordinate" aria-hidden="true">
            A—01
          </span>
          <DigitalSections sections={intro} />
        </div>
        <div className="cv-blueprint-grid">
          <main>
            {career.map((section, index) => (
              <div
                className="cv-blueprint-module"
                key={section.id ?? section.title}
              >
                <span className="cv-blueprint-coordinate" aria-hidden="true">
                  {String(index + 2).padStart(2, "0")}
                </span>
                <Section section={section} />
              </div>
            ))}
          </main>
          <aside>
            <DigitalSections sections={aside} />
          </aside>
        </div>
        <div className="cv-blueprint-titleblock">
          <span>{name}</span>
          <span>{role}</span>
          <span aria-hidden="true">A4 / 01</span>
        </div>
      </>
    );

  if (data.layout === "orbit")
    return (
      <>
        <header className="cv-orbit-header">
          <div>
            <span className="cv-digital-label" aria-hidden="true">
              CURIOSITY IN PRACTICE
            </span>
            {identity}
            <Contacts values={contacts} icons={false} />
          </div>
          <DigitalOrbitDiagram />
        </header>
        <div className="cv-orbit-intro">
          <DigitalSections sections={intro} />
        </div>
        <main className="cv-orbit-main">
          <DigitalSections sections={career} />
        </main>
        <aside className="cv-orbit-bottom">
          <DigitalSections sections={aside} />
        </aside>
        <div className="cv-digital-footer">
          <span>
            {name} · {role}
          </span>
          <span>01</span>
        </div>
      </>
    );
  return null;
}
