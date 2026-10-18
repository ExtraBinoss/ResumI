import type { ResumeLayout } from "./types";
import type { SampleSection } from "./sample-content";

type SpatialCopy = [SampleSection["blocks"][number][0], string][];
const section = (
  id: string,
  title: string,
  blocks: SpatialCopy,
): SampleSection => ({
  id,
  title,
  blocks: blocks.map(([kind, text], index): SampleSection["blocks"][number] => [
    kind,
    text,
    `${id}-${index}`,
  ]),
});
const identity = (
  name: string,
  role: string,
  location: string,
  email: string,
  website: string,
) =>
  section("identity", "", [
    ["heading", name],
    ["subtitle", role],
    ["meta", `${location} · ${email} · ${website}`],
  ]);
const skills = (copy: string) =>
  section("skills", "Skills & methods", [["text", copy]]);
const education = (degree: string, school: string, detail: string) =>
  section("education", "Education", [
    ["subtitle", degree],
    ["meta", school],
    ["text", detail],
  ]);
const languages = (copy: string) =>
  section("languages", "Languages", [["text", copy]]);

/** Fictional English CVs, individually edited for the rhythm of each A4 composition. */
export function spatialSampleSections(
  layout: ResumeLayout,
): SampleSection[] | undefined {
  if (layout === "contour")
    return [
      identity(
        "Rowan Ellis",
        "Landscape Architect · Ecological Design",
        "Bristol, United Kingdom",
        "rowan@example.com",
        "rowanellis.studio",
      ),
      section("profile", "Practice", [
        [
          "text",
          "I design landscapes that bring people closer to nature. My practice connects ecological thinking, careful observation and the quiet poetry of everyday public space.",
        ],
      ]),
      section("experience", "Professional practice", [
        ["subtitle", "Senior Landscape Architect · Fieldwork"],
        ["meta", "2022 — Present / Bristol"],
        [
          "bullet",
          "Lead public-realm and ecological restoration projects from site research through detailed design and delivery.",
        ],
        [
          "bullet",
          "Develop planting strategies with ecologists and communities, creating resilient habitats with a distinct sense of place.",
        ],
        ["subtitle", "Landscape Architect · Ground Studio"],
        ["meta", "2019 — 2022 / Bath"],
        [
          "bullet",
          "Designed civic gardens, school grounds and small urban parks within multidisciplinary teams.",
        ],
        [
          "bullet",
          "Prepared construction packages and coordinated site reviews with engineers, contractors and local authorities.",
        ],
      ]),
      section("projects", "Selected landscapes", [
        ["subtitle", "The Common Ground"],
        ["meta", "2024 / Community park · 2.4 hectares"],
        [
          "text",
          "A former car park reimagined as a rain garden, meadow and gathering place. Co-designed with residents, with accessible paths and year-round habitat.",
        ],
        ["subtitle", "River Room"],
        ["meta", "2023 / Riverside restoration"],
        [
          "text",
          "A gentle sequence of flood-tolerant planting and timber terraces, reconnecting a neighbourhood with its river edge.",
        ],
      ]),
      education(
        "MLA, Landscape Architecture",
        "University of Sheffield · 2019",
        "Distinction. Research in urban ecology and community stewardship.",
      ),
      skills(
        "Landscape strategy / Ecological planting / Public consultation / AutoCAD & GIS / Rhino / Construction detail",
      ),
      languages("English — native\nFrench — conversational"),
    ];
  if (layout === "nocturne")
    return [
      identity(
        "Iris Okafor",
        "Creative Technologist · Interaction & Installation",
        "London, United Kingdom",
        "iris@example.com",
        "irisokafor.design",
      ),
      section("profile", "At the intersection", [
        [
          "text",
          "I turn emerging technology into meaningful human experiences. My work moves between expressive interfaces, responsive spaces and installations that invite a little curiosity.",
        ],
      ]),
      section("experience", "Experience", [
        ["subtitle", "Creative Technologist · Studio Elsewhere"],
        ["meta", "2022 — Present / London"],
        [
          "bullet",
          "Lead prototypes and technical direction for interactive exhibitions, from the first physical sketch to opening night.",
        ],
        [
          "bullet",
          "Collaborate with artists and engineers on accessible experiences using real-time graphics, sensors and spatial sound.",
        ],
        ["subtitle", "Interaction Developer · Parallel Practice"],
        ["meta", "2019 — 2022 / London"],
        [
          "bullet",
          "Built expressive digital experiences for cultural organisations, balancing visual ambition with robust implementation.",
        ],
        [
          "bullet",
          "Created a reusable prototyping toolkit that helped designers test ideas with audiences earlier.",
        ],
      ]),
      section("projects", "Selected explorations", [
        ["subtitle", "A Chorus of Light"],
        ["meta", "2024 / Interactive installation"],
        [
          "text",
          "A room-scale constellation that responds to collective movement. Developed the sensor system and generative visual language with a team of four.",
        ],
        ["subtitle", "Soft Signals"],
        ["meta", "2023 / Experimental web experience"],
        [
          "text",
          "An accessible collection of browser-based instruments exploring the relationship between gesture, colour and sound.",
        ],
      ]),
      education(
        "MA, Computational Arts",
        "Goldsmiths, London · 2019",
        "Creative coding, physical computing and participatory practice.",
      ),
      skills(
        "Creative direction / TypeScript / Three.js & WebGL / TouchDesigner / Physical computing / Prototyping",
      ),
      languages("English — native\nFrench — working proficiency"),
    ];
  if (layout === "solstice")
    return [
      identity(
        "Milo Bennett",
        "Interior Architect · Spaces for Everyday Life",
        "Copenhagen, Denmark",
        "milo@example.com",
        "milobennett.studio",
      ),
      section("profile", "Design intent", [
        [
          "text",
          "Considered spaces. Honest materials. A belief that good design makes ordinary moments feel extraordinary. I work at the meeting point of architecture, furniture and human experience.",
        ],
      ]),
      section("experience", "Experience", [
        ["subtitle", "Interior Architect · Studio Common"],
        ["meta", "2022 — Present / Copenhagen"],
        [
          "bullet",
          "Lead interior concepts for hospitality and residential projects, shaping material palettes, spatial narratives and custom furniture.",
        ],
        [
          "bullet",
          "Carry projects from concept to completion with clients, makers and contractors, maintaining clarity at every scale.",
        ],
        ["subtitle", "Designer · Form & Function"],
        ["meta", "2019 — 2022 / Amsterdam"],
        [
          "bullet",
          "Developed interiors and furniture for independent retail and cultural spaces across the Netherlands.",
        ],
        [
          "bullet",
          "Produced detailed drawings, material studies and physical models to connect creative decisions with practical delivery.",
        ],
      ]),
      section("projects", "Selected spaces", [
        ["subtitle", "House of Quiet"],
        ["meta", "2024 / Residential · 185 m²"],
        [
          "text",
          "A light-filled home composed around oak joinery, soft mineral surfaces and a garden-facing kitchen. Design lead from concept through installation.",
        ],
        ["subtitle", "Daybreak Café"],
        ["meta", "2023 / Hospitality · Copenhagen"],
        [
          "text",
          "A neighbourhood café with warm terracotta, a sculptural communal table and a material palette designed to age gracefully.",
        ],
      ]),
      education(
        "MA, Interior Architecture",
        "Royal Danish Academy · 2019",
        "Spatial design and material culture.",
      ),
      skills(
        "Spatial concepts / Material research / Custom furniture / Rhino & AutoCAD / Adobe Creative Suite / Site coordination",
      ),
      languages(
        "English — native\nDanish — professional\nDutch — conversational",
      ),
    ];
  if (layout === "aerogram")
    return [
      identity(
        "Avery Laurent",
        "Brand Strategist · Creative Direction",
        "Amsterdam, Netherlands",
        "avery@example.com",
        "averylaurent.work",
      ),
      section("profile", "A point of departure", [
        [
          "text",
          "I help ambitious brands find their direction. Equal parts strategy and storytelling, my work connects cultural insight with identities that travel confidently across markets.",
        ],
      ]),
      section("experience", "The journey so far", [
        ["subtitle", "Brand Strategy Director · Common North"],
        ["meta", "2022 — Present / Amsterdam"],
        [
          "bullet",
          "Lead positioning, naming and brand narratives for organisations across travel, hospitality and the creative economy.",
        ],
        [
          "bullet",
          "Bring research into the room through focused workshops, helping teams make confident creative decisions.",
        ],
        ["subtitle", "Senior Strategist · Studio Meridian"],
        ["meta", "2019 — 2022 / London"],
        [
          "bullet",
          "Developed brand platforms and campaign strategies for independent businesses entering new markets.",
        ],
        [
          "bullet",
          "Partnered with designers and writers to carry a clear idea from initial insight to a coherent customer experience.",
        ],
      ]),
      section("projects", "Selected destinations", [
        ["subtitle", "Roam Together"],
        ["meta", "2024 / Travel & hospitality"],
        [
          "text",
          "Brand positioning and a welcoming voice for a new collection of independent guesthouses. A shared story with room for local character.",
        ],
        ["subtitle", "New Ground"],
        ["meta", "2023 / Culture & community"],
        [
          "text",
          "A clear mission, name and launch narrative for a creative workspace connecting makers, neighbours and emerging businesses.",
        ],
      ]),
      education(
        "MA, Brand Development",
        "Goldsmiths, London · 2019",
        "Cultural research and strategic storytelling.",
      ),
      skills(
        "Brand positioning / Cultural insight / Naming & narrative / Workshop facilitation / Creative direction / Go-to-market strategy",
      ),
      languages("English — native\nFrench — fluent\nDutch — conversational"),
    ];
  if (layout === "gridline")
    return [
      identity(
        "Jules Navarro",
        "Architect · Thoughtful Buildings, Lasting Places",
        "Barcelona, Spain",
        "jules@example.com",
        "julesnavarro.studio",
      ),
      section("profile", "Design approach", [
        [
          "text",
          "Architect working across adaptive reuse, housing and public space. I combine a rigorous understanding of construction with an interest in how buildings support everyday life, community and change.",
        ],
      ]),
      section("experience", "Practice", [
        ["subtitle", "Project Architect · Taller Común"],
        ["meta", "2022 — Present / Barcelona"],
        [
          "bullet",
          "Lead adaptive reuse and collective housing projects from feasibility through technical coordination and site delivery.",
        ],
        [
          "bullet",
          "Coordinate consultants and contractors around clear drawings, low-impact materials and practical environmental strategies.",
        ],
        ["subtitle", "Architect · North Assembly"],
        ["meta", "2019 — 2022 / Rotterdam"],
        [
          "bullet",
          "Developed spatial concepts, planning submissions and construction details for public and residential buildings.",
        ],
        [
          "bullet",
          "Built physical and digital models to test daylight, circulation and the relationship between private and shared space.",
        ],
      ]),
      section("projects", "Selected projects", [
        ["subtitle", "Courtyard Commons"],
        ["meta", "2024 / Collective housing · 3,200 m²"],
        [
          "text",
          "Twenty-four homes organised around a planted courtyard, with shared circulation and flexible ground-floor spaces. Project architect through technical design.",
        ],
        ["subtitle", "The Open Workshop"],
        ["meta", "2023 / Adaptive reuse · 860 m²"],
        [
          "text",
          "A former warehouse converted into a neighbourhood workshop and learning centre, preserving its industrial structure and generous daylight.",
        ],
      ]),
      education(
        "MArch, Architecture",
        "ETSAB, Barcelona · 2019",
        "Honours. Adaptive reuse and collective housing.",
      ),
      skills(
        "Concept & technical design / Adaptive reuse / Revit & BIM / Rhino / Construction detail / Consultant coordination",
      ),
      languages("Spanish — native\nEnglish — professional\nCatalan — fluent"),
    ];
  if (layout === "polaroid")
    return [
      identity(
        "Sage Wilson",
        "Photographer · Art Direction & Visual Stories",
        "Brighton, United Kingdom",
        "sage@example.com",
        "sagewilson.photo",
      ),
      section("profile", "Perspective", [
        [
          "text",
          "I make images with a sense of place and a human point of view. Working between editorial, travel and independent brands, I look for honest moments, considered colour and stories worth telling.",
        ],
      ]),
      section("experience", "Experience", [
        ["subtitle", "Photographer & Art Director · Independent"],
        ["meta", "2021 — Present / Brighton & beyond"],
        [
          "bullet",
          "Create visual stories for editorial and hospitality clients, from research and treatment to shoot direction and final edit.",
        ],
        [
          "bullet",
          "Build small, collaborative crews and manage production with a thoughtful, resourceful approach.",
        ],
        ["subtitle", "Studio Photographer · Paper House"],
        ["meta", "2018 — 2021 / London"],
        [
          "bullet",
          "Produced portraits, still life and location work for independent publications and lifestyle brands.",
        ],
      ]),
      section("projects", "Selected stories", [
        ["subtitle", "The Long Way Home"],
        ["meta", "2024 / Personal series · Coastal communities"],
        [
          "text",
          "A slow journey along the British coastline, documenting the people, landscapes and quiet rituals that give a place its character.",
        ],
        ["subtitle", "At the Table"],
        ["meta", "2023 / Editorial · Food & hospitality"],
        [
          "text",
          "Portraits of independent chefs and their spaces, told through natural light, shared meals and the details of daily work.",
        ],
      ]),
      education(
        "BA, Photography",
        "University of Brighton · 2018",
        "Documentary practice and visual communication.",
      ),
      skills(
        "Photography / Art direction / Visual storytelling / Lightroom & Photoshop / Shoot production / Editorial sequencing",
      ),
      languages("English — native\nFrench — conversational"),
    ];
  return undefined;
}
