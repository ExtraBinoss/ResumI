import type { ResumeLayout } from "./types";
import type { SampleSection } from "./sample-content";

type DigitalCopy = [SampleSection["blocks"][number][0], string][];
const digitalSection = (
  id: string,
  title: string,
  blocks: DigitalCopy,
): SampleSection => ({ id, title, blocks });
const digitalIdentity = (role: string, location = "Paris, France") =>
  digitalSection("identity", "", [
    ["heading", "Alex Morgan"],
    ["subtitle", role],
    ["meta", `${location} · alex@example.com · alexmorgan.dev`],
  ]);
const digitalLanguages = () =>
  digitalSection("languages", "Languages", [
    ["text", "French — native\nEnglish — professional"],
  ]);
const digitalSkills = (skills: string) =>
  digitalSection("skills", "Toolkit", [["text", skills]]);
const digitalEducation = (degree: string, school: string, detail: string) =>
  digitalSection("education", "Education", [
    ["subtitle", degree],
    ["meta", school],
    ["text", detail],
  ]);

/** Five complete, synthetic histories tailored to the composition, never personal CV data. */
export function digitalSampleSections(
  layout: ResumeLayout,
): SampleSection[] | undefined {
  if (layout === "terminal")
    return [
      digitalIdentity("Software Engineer · Developer Tools"),
      digitalSection("profile", "README", [
        [
          "text",
          "I build reliable tools that make complex systems easier to understand. Six years working across developer experience, accessible interfaces and the infrastructure behind them.",
        ],
      ]),
      digitalSection("experience", "Experience", [
        ["subtitle", "Senior Software Engineer · Forma"],
        ["meta", "2022 — Present / Paris"],
        [
          "bullet",
          "Built a command-line toolkit and web console for internal deployments, replacing fragmented scripts with a documented workflow.",
        ],
        [
          "bullet",
          "Designed typed APIs and accessible diagnostics with platform teams; shortened the path from a failed build to a useful explanation.",
        ],
        ["subtitle", "Software Engineer · Northstar"],
        ["meta", "2020 — 2022 / Remote"],
        [
          "bullet",
          "Delivered data import tools with validation, resumable jobs and clear recovery paths for operations teams.",
        ],
        [
          "bullet",
          "Added integration tests and release checks, then wrote practical runbooks for the engineers maintaining the service.",
        ],
      ]),
      digitalSection("projects", "Selected projects", [
        ["subtitle", "Trace Garden · Observability explorer"],
        ["meta", "2024 / TypeScript, OpenTelemetry"],
        [
          "text",
          "A local-first interface that turns distributed traces into searchable timelines with keyboard navigation and readable error context.",
        ],
        ["subtitle", "Patch Notes · Release toolkit"],
        ["meta", "2023 / Node.js, Git"],
        [
          "text",
          "A small release assistant connecting change summaries, version checks and migration notes in one reviewable workflow.",
        ],
      ]),
      digitalSkills(
        "TypeScript / React / Node.js / PostgreSQL / Testing / Accessibility",
      ),
      digitalEducation(
        "MSc, Computer Science",
        "Université Paris Cité · 2020",
        "Distributed systems and human-computer interaction.",
      ),
      digitalLanguages(),
    ];
  if (layout === "mainframe")
    return [
      digitalIdentity(
        "Creative Technologist · Digital Archives",
        "Lyon, France",
      ),
      digitalSection("profile", "Abstract", [
        [
          "text",
          "Creative technologist connecting archival material, thoughtful interfaces and dependable software. I help cultural teams make collections accessible without losing their character or context.",
        ],
      ]),
      digitalSection("experience", "Experience", [
        ["subtitle", "Creative Technologist · Forma Studio"],
        ["meta", "2022 — Present / Lyon"],
        [
          "bullet",
          "Led the technical design of collection websites, from metadata workshops to searchable, accessible public interfaces.",
        ],
        [
          "bullet",
          "Built reusable publishing tools and documented preservation workflows with archivists, editors and developers.",
        ],
        ["subtitle", "Front-end Developer · Northstar"],
        ["meta", "2020 — 2022 / Remote"],
        [
          "bullet",
          "Developed editorial platforms with semantic HTML, responsive layouts and progressively enhanced interactions.",
        ],
        [
          "bullet",
          "Improved search, keyboard navigation and image descriptions across a growing digital collection.",
        ],
      ]),
      digitalSection("projects", "Selected work", [
        ["subtitle", "Common Memory · Community archive"],
        ["meta", "2024 / Research, design & development"],
        [
          "text",
          "A searchable oral-history collection with transcripts, contextual notes and a simple contribution workflow for local volunteers.",
        ],
        ["subtitle", "Paper Trails · Digital exhibition"],
        ["meta", "2023 / Web publishing"],
        [
          "text",
          "An editorial exhibition pairing scanned ephemera with accessible text, careful navigation and a lightweight content system.",
        ],
      ]),
      digitalSkills(
        "TypeScript / Web standards / Creative coding / Metadata / Accessibility / Editorial systems",
      ),
      digitalEducation(
        "MA, Digital Humanities",
        "Université Lyon 2 · 2020",
        "Digital collections, information design and cultural heritage.",
      ),
      digitalLanguages(),
    ];
  if (layout === "arcade")
    return [
      digitalIdentity(
        "Creative Developer · Playful Interfaces",
        "Nantes, France",
      ),
      digitalSection("profile", "Hello, world!", [
        [
          "text",
          "Creative developer making useful things feel joyful. I combine expressive visuals with accessible interaction, clear code and the small details that make a product welcoming.",
        ],
      ]),
      digitalSection("experience", "The journey", [
        ["subtitle", "Creative Developer · Forma"],
        ["meta", "2022 — Present / Nantes"],
        [
          "bullet",
          "Built interactive learning experiences with designers and educators, translating complex lessons into playful web activities.",
        ],
        [
          "bullet",
          "Created a reusable interaction library with keyboard controls, reduced-motion options and clear feedback states.",
        ],
        ["subtitle", "Front-end Developer · Northstar"],
        ["meta", "2020 — 2022 / Remote"],
        [
          "bullet",
          "Delivered responsive websites and prototypes for cultural events, independent shops and community projects.",
        ],
        [
          "bullet",
          "Paired with designers to preserve visual character while improving performance and everyday usability.",
        ],
      ]),
      digitalSection("projects", "Side quests", [
        ["subtitle", "Tiny Gardens · Creative coding tool"],
        ["meta", "2024 / TypeScript, SVG"],
        [
          "text",
          "An accessible tile editor for drawing miniature gardens, with a keyboard-first canvas and downloadable vector artwork.",
        ],
        ["subtitle", "Play Together · Workshop kit"],
        ["meta", "2023 / Interaction design"],
        [
          "text",
          "A browser-based collection of collaborative activities that helps first-time coders explore patterns, color and motion.",
        ],
      ]),
      digitalSkills(
        "TypeScript / React / SVG / Creative coding / Interaction design / Accessibility",
      ),
      digitalEducation(
        "BA, Digital Design",
        "L’École de design Nantes · 2020",
        "Interaction, visual systems and creative development.",
      ),
      digitalLanguages(),
    ];
  if (layout === "blueprint")
    return [
      digitalIdentity("Design Engineer · Systems & Interfaces"),
      digitalSection("profile", "Design intent", [
        [
          "text",
          "Design engineer turning complex product requirements into coherent, accessible systems. I work between design and engineering, from the first working prototype to the details of a dependable release.",
        ],
      ]),
      digitalSection("experience", "Professional experience", [
        ["subtitle", "Senior Design Engineer · Forma"],
        ["meta", "2022 — Present / Paris"],
        [
          "bullet",
          "Built a component platform spanning tokens, accessible primitives and interactive documentation for six product teams.",
        ],
        [
          "bullet",
          "Prototyped complex editor workflows in code and partnered with engineers to make interaction behavior testable.",
        ],
        ["subtitle", "Front-end Engineer · Northstar"],
        ["meta", "2020 — 2022 / Remote"],
        [
          "bullet",
          "Developed data-rich operational tools with clear hierarchy, keyboard navigation and resilient loading states.",
        ],
        [
          "bullet",
          "Introduced component review guidelines and visual regression fixtures to improve consistency across releases.",
        ],
      ]),
      digitalSection("projects", "Selected assemblies", [
        ["subtitle", "Forma UI · Component architecture"],
        ["meta", "2024 / Design systems"],
        [
          "text",
          "A documented set of composable primitives connecting product design decisions to typed component APIs and accessibility checks.",
        ],
        ["subtitle", "Signal Board · Operations console"],
        ["meta", "2023 / Data visualization"],
        [
          "text",
          "A configurable monitoring workspace with legible charts, meaningful status indicators and focused investigation flows.",
        ],
      ]),
      digitalSkills(
        "TypeScript / React / Component APIs / CSS architecture / Accessibility / Prototyping",
      ),
      digitalEducation(
        "MSc, Interaction Engineering",
        "Université Paris-Saclay · 2020",
        "Software systems and human-computer interaction.",
      ),
      digitalLanguages(),
    ];
  if (layout === "orbit")
    return [
      digitalIdentity("Data Visualization Engineer", "Toulouse, France"),
      digitalSection("profile", "Perspective", [
        [
          "text",
          "I turn complex datasets into clear, explorable stories. My work connects analytical thinking, careful visual design and accessible front-end engineering for research and public-interest teams.",
        ],
      ]),
      digitalSection("experience", "Experience", [
        ["subtitle", "Visualization Engineer · Forma Research"],
        ["meta", "2022 — Present / Toulouse"],
        [
          "bullet",
          "Designed interactive research dashboards with scientists, making uncertainty, comparisons and source context visible.",
        ],
        [
          "bullet",
          "Built reusable chart components with keyboard navigation, text alternatives and exportable publication views.",
        ],
        ["subtitle", "Front-end Engineer · Northstar"],
        ["meta", "2020 — 2022 / Remote"],
        [
          "bullet",
          "Developed exploratory data tools for product and operations teams, from dataset profiling to production interfaces.",
        ],
        [
          "bullet",
          "Worked with analysts to validate transformations and document the assumptions behind each visualization.",
        ],
      ]),
      digitalSection("projects", "Selected explorations", [
        ["subtitle", "Open Skies · Research atlas"],
        ["meta", "2024 / TypeScript, D3, SVG"],
        [
          "text",
          "An interactive atlas connecting observation sites, time series and research notes in a clear, source-linked narrative.",
        ],
        ["subtitle", "Common Measure · Chart toolkit"],
        ["meta", "2023 / Data design"],
        [
          "text",
          "A small chart library with considered defaults for scales, annotations, accessible labels and print-ready output.",
        ],
      ]),
      digitalSkills(
        "TypeScript / D3 & SVG / React / Data storytelling / Accessibility / Statistical thinking",
      ),
      digitalEducation(
        "MSc, Data & Interaction",
        "Université de Toulouse · 2020",
        "Data analysis, visual perception and interactive systems.",
      ),
      digitalLanguages(),
    ];
  return undefined;
}
