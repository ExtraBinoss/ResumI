import type { ResumeLayout } from "./types";
import type { SampleSection } from "./sample-content";

function CuratedSampleSection(
  id: string,
  title: string,
  blocks: SampleSection["blocks"],
): SampleSection {
  return {
    id,
    title,
    blocks: blocks.map(([kind, text], index) => [kind, text, `${id}-${index}`]),
  };
}
function CuratedSampleIdentity(
  name: string,
  role: string,
  city: string,
  site: string,
) {
  return CuratedSampleSection("identity", "", [
    ["heading", name],
    ["subtitle", role],
    ["meta", `${city} · hello@${site} · ${site}`],
  ]);
}
function CuratedSampleSupport(
  degree: string,
  school: string,
  skills: string,
  languages: string,
): SampleSection[] {
  return [
    CuratedSampleSection("education", "Education", [
      ["subtitle", degree],
      ["meta", school],
    ]),
    CuratedSampleSection("skills", "Expertise", [["text", skills]]),
    CuratedSampleSection("languages", "Languages", [["text", languages]]),
  ];
}

/** Fictional English-language profiles written for these seven visual compositions. */
export function curatedSampleSections(
  layout: ResumeLayout,
): SampleSection[] | undefined {
  if (layout === "maison")
    return [
      CuratedSampleIdentity(
        "Camille Laurent",
        "Brand strategist & creative director",
        "Paris, France",
        "camillelaurent.example",
      ),
      CuratedSampleSection("profile", "Perspective", [
        [
          "text",
          "I help thoughtful brands find their voice. With a background in culture and hospitality, I bring clear strategy, an editorial eye and a lasting sense of place to every collaboration.",
        ],
      ]),
      CuratedSampleSection("experience", "Professional experience", [
        ["subtitle", "Creative Director · Maison Bureau"],
        ["meta", "2022 — Present / Paris"],
        [
          "bullet",
          "Lead a team of five across brand strategy, visual identity and editorial commissions for independent hotels and cultural institutions.",
        ],
        [
          "bullet",
          "Shape each engagement from research and positioning to art direction, print production and a considered digital presence.",
        ],
        ["subtitle", "Brand Designer · Atelier North"],
        ["meta", "2019 — 2022 / London"],
        [
          "bullet",
          "Developed identity systems, packaging and launch campaigns for emerging lifestyle brands, working closely with founders and local makers.",
        ],
      ]),
      CuratedSampleSection("projects", "Selected commissions", [
        ["subtitle", "The Orme Collection"],
        ["meta", "2025 / Hospitality identity"],
        [
          "text",
          "A quiet, tactile identity for three coastal guesthouses: custom typography, linen-bound guest books and a shared editorial language.",
        ],
        ["subtitle", "Objects of Everyday Life"],
        ["meta", "2024 / Exhibition & publication"],
        [
          "text",
          "Art direction for a design exhibition and its accompanying catalogue, developed with curators, photographers and an independent press.",
        ],
      ]),
      ...CuratedSampleSupport(
        "MA, Visual Communication",
        "École des Arts Visuels\n2017 — 2019",
        "Brand positioning\nCreative direction\nEditorial design\nVisual identity\nPrint & production\nFigma · InDesign",
        "French — Native\nEnglish — Fluent",
      ),
    ];
  if (layout === "gallery")
    return [
      CuratedSampleIdentity(
        "Riley Park",
        "Art director / Graphic designer",
        "Berlin, Germany",
        "rileypark.example",
      ),
      CuratedSampleSection("profile", "The practice", [
        [
          "text",
          "Distinctive identities for people with something to say. I work at the intersection of culture, typography and digital design, turning complex ideas into bold, useful visual systems.",
        ],
      ]),
      CuratedSampleSection("experience", "Experience", [
        ["subtitle", "Art Director · Studio Interval"],
        ["meta", "2023 — Present / Berlin"],
        [
          "text",
          "Direct identities and campaigns for galleries, festivals and independent publishers. Lead concept workshops and a small team of designers.",
        ],
        ["subtitle", "Designer · Common Ground"],
        ["meta", "2020 — 2023 / Amsterdam"],
        [
          "text",
          "Built flexible design systems across print, web and wayfinding. Partnered with developers to bring expressive editorial ideas online.",
        ],
      ]),
      CuratedSampleSection("projects", "Selected work", [
        ["subtitle", "Open City Festival"],
        ["meta", "2025 / Identity & campaign"],
        [
          "text",
          "A modular typographic language for a city-wide programme of talks, installations and performances.",
        ],
        ["subtitle", "Form / Field"],
        ["meta", "2024 / Publication"],
        [
          "text",
          "Art direction and design of a journal exploring the relationships between contemporary art, place and public life.",
        ],
      ]),
      ...CuratedSampleSupport(
        "BA, Graphic Design",
        "Rhine School of Art\n2016 — 2020",
        "Art direction\nTypography\nIdentity systems\nEditorial & digital\nFigma · Adobe CC",
        "English — Native\nGerman — Fluent\nDutch — Working",
      ),
    ];
  if (layout === "forma")
    return [
      CuratedSampleIdentity(
        "Adrian Cole",
        "Architect & spatial designer",
        "Copenhagen, Denmark",
        "adriancole.example",
      ),
      CuratedSampleSection("profile", "Design approach", [
        [
          "text",
          "Architecture begins with the way people live. I design calm, adaptable spaces through careful observation, material honesty and close collaboration with the people who will use them.",
        ],
      ]),
      CuratedSampleSection("experience", "Practice", [
        ["subtitle", "Project Architect · Form & Field"],
        ["meta", "2022 — Present / Copenhagen"],
        [
          "bullet",
          "Lead residential and cultural projects from concept to technical design, coordinating consultants, budgets and client reviews.",
        ],
        [
          "bullet",
          "Develop material strategies that prioritise reuse, natural light and long-term flexibility.",
        ],
        ["subtitle", "Architectural Designer · Studio Vale"],
        ["meta", "2019 — 2022 / London"],
        [
          "bullet",
          "Produced planning packages, physical models and detailed interiors for housing and community projects across the UK.",
        ],
      ]),
      CuratedSampleSection("projects", "Selected projects", [
        ["subtitle", "Courtyard House"],
        ["meta", "2025 / Residential retrofit · 180 m²"],
        [
          "text",
          "Reorganised a compact family home around a planted courtyard, retaining its brick structure and adding a timber extension.",
        ],
        ["subtitle", "The Reading Room"],
        ["meta", "2024 / Community space · 420 m²"],
        [
          "text",
          "An adaptable neighbourhood library with a shared workshop, daylight-led reading spaces and furniture made from reclaimed oak.",
        ],
      ]),
      ...CuratedSampleSupport(
        "MArch, Architecture",
        "Northern School of Architecture\n2017 — 2019",
        "Concept & detail\nAdaptive reuse\nSpatial planning\nRevit · Rhino\nAutoCAD · Adobe CC",
        "English — Native\nDanish — Working",
      ),
    ];
  if (layout === "linen")
    return [
      CuratedSampleIdentity(
        "Elena Rossi",
        "Fashion stylist & image consultant",
        "Milan, Italy",
        "elenarossi.example",
      ),
      CuratedSampleSection("profile", "A considered approach", [
        [
          "text",
          "I create images with a quiet point of view. Rooted in research, material and proportion, my styling connects the character of a collection with the people who wear it.",
        ],
      ]),
      CuratedSampleSection("experience", "Experience", [
        ["subtitle", "Independent Fashion Stylist"],
        ["meta", "2021 — Present / Milan & Paris"],
        [
          "bullet",
          "Style editorial stories, seasonal lookbooks and campaigns for independent fashion and lifestyle labels.",
        ],
        [
          "bullet",
          "Build visual research, source garments and coordinate fittings with photographers, casting teams and designers.",
        ],
        ["subtitle", "Styling Assistant · Studio Sera"],
        ["meta", "2018 — 2021 / Milan"],
        [
          "bullet",
          "Supported editorial and runway production, managing sample collections and maintaining relationships with showrooms and emerging designers.",
        ],
      ]),
      CuratedSampleSection("projects", "Selected stories", [
        ["subtitle", "Soft Structure"],
        ["meta", "2025 / Editorial, Still Journal"],
        [
          "text",
          "A study of sculptural tailoring and everyday movement, photographed on location in a restored Milanese apartment.",
        ],
        ["subtitle", "A Season of Less"],
        ["meta", "2024 / Campaign, Studio Onda"],
        [
          "text",
          "A restrained wardrobe narrative for a traceable linen collection, bringing together natural textures and the soft light of the coast.",
        ],
      ]),
      ...CuratedSampleSupport(
        "BA, Fashion Communication",
        "Istituto di Design Milano\n2015 — 2018",
        "Editorial styling\nCampaign direction\nVisual research\nWardrobe planning\nOn-set production",
        "Italian — Native\nEnglish — Fluent\nFrench — Working",
      ),
    ];
  if (layout === "muse")
    return [
      CuratedSampleIdentity(
        "Nora Bennett",
        "Experience designer & creative facilitator",
        "Amsterdam, Netherlands",
        "norabennett.example",
      ),
      CuratedSampleSection("profile", "Hello, I’m Nora", [
        [
          "text",
          "I turn tangled problems into experiences that feel simple and human. My practice brings research, playful exploration and clear systems together — with a little room for the unexpected.",
        ],
      ]),
      CuratedSampleSection("experience", "Where I’ve made an impact", [
        ["subtitle", "Senior Experience Designer · Kindred"],
        ["meta", "2022 — Present / Amsterdam"],
        [
          "bullet",
          "Lead discovery and service design for education and wellbeing organisations, from interviews and journey maps to tested prototypes.",
        ],
        [
          "bullet",
          "Facilitate collaborative workshops that help multidisciplinary teams agree on priorities and move ideas into delivery.",
        ],
        ["subtitle", "Product Designer · Everyday Studio"],
        ["meta", "2019 — 2022 / Bristol"],
        [
          "bullet",
          "Designed accessible digital products and component libraries in close partnership with engineers, researchers and content designers.",
        ],
      ]),
      CuratedSampleSection("projects", "A couple of good things", [
        ["subtitle", "Learning, together"],
        ["meta", "2025 / Education service"],
        [
          "text",
          "A welcoming enrolment journey for adult learners, co-designed with students and tested in three community learning centres.",
        ],
        ["subtitle", "Room to Reset"],
        ["meta", "2024 / Wellbeing platform"],
        [
          "text",
          "An approachable digital toolkit that helps small teams build healthier everyday routines without adding more work.",
        ],
      ]),
      ...CuratedSampleSupport(
        "MA, Interaction Design",
        "Westbridge School of Design\n2017 — 2019",
        "Service design\nUser research\nWorkshop facilitation\nPrototyping\nAccessible interfaces\nFigma · FigJam",
        "English — Native\nDutch — Working",
      ),
    ];
  if (layout === "cinema")
    return [
      CuratedSampleIdentity(
        "Theo Marshall",
        "Film editor & documentary storyteller",
        "London, United Kingdom",
        "theomarshall.example",
      ),
      CuratedSampleSection("profile", "The story so far", [
        [
          "text",
          "I shape documentary stories with patience, rhythm and a close ear for the human voice. From the first assembly to the final frame, I work with directors to find the emotional truth in the material.",
        ],
      ]),
      CuratedSampleSection("experience", "Professional credits", [
        ["subtitle", "Editor · Independent"],
        ["meta", "2021 — Present / London"],
        [
          "text",
          "Edit documentary features, short films and artist commissions. Build narrative structures with directors and supervise sound, grade and delivery.",
        ],
        ["subtitle", "Assistant Editor · Framehouse"],
        ["meta", "2017 — 2021 / London"],
        [
          "text",
          "Managed editorial workflows, archive research and conform preparation for documentary series and independent features.",
        ],
      ]),
      CuratedSampleSection("projects", "Selected films", [
        ["subtitle", "After the Last Train"],
        ["meta", "2025 / Documentary · 68 minutes"],
        [
          "text",
          "An intimate portrait of night workers and the hidden rhythms of a changing city. Editor and story consultant.",
        ],
        ["subtitle", "A Place to Return"],
        ["meta", "2024 / Short documentary · 22 minutes"],
        [
          "text",
          "Three generations trace their family history through a garden on the edge of the sea. Editor.",
        ],
      ]),
      ...CuratedSampleSupport(
        "BA, Film & Moving Image",
        "Southbank School of Arts\n2014 — 2017",
        "Narrative editing\nArchive storytelling\nPost-production\nPremiere Pro · Avid\nDaVinci Resolve",
        "English — Native\nFrench — Working",
      ),
    ];
  if (layout === "panorama")
    return [
      CuratedSampleIdentity(
        "Jamie Rivers",
        "Photographer & visual storyteller",
        "Edinburgh, Scotland",
        "jamierivers.example",
      ),
      CuratedSampleSection("profile", "A way of seeing", [
        [
          "text",
          "I make photographs about people and their relationship with place. My work combines patient observation with an editorial instinct, finding small, human stories in the wider landscape.",
        ],
      ]),
      CuratedSampleSection("experience", "Experience", [
        ["subtitle", "Photographer · Independent"],
        ["meta", "2020 — Present / UK & Europe"],
        [
          "bullet",
          "Create editorial and commissioned stories for travel, culture and environmental organisations, from research to final image selection.",
        ],
        [
          "bullet",
          "Manage location planning, production and sensitive portrait sessions with small, collaborative crews.",
        ],
        ["subtitle", "Photography Assistant · Fieldwork Studio"],
        ["meta", "2017 — 2020 / Glasgow"],
        [
          "bullet",
          "Supported location shoots, lighting and post-production for portrait and architectural commissions.",
        ],
      ]),
      CuratedSampleSection("projects", "Recent stories", [
        ["subtitle", "Where the Land Meets Water"],
        ["meta", "2025 / Personal series"],
        [
          "text",
          "Portraits and landscapes documenting communities along Scotland’s shifting coastline, developed over four seasons.",
        ],
        ["subtitle", "Working Ground"],
        ["meta", "2024 / Editorial commission"],
        [
          "text",
          "An extended photo essay following the craftspeople restoring a network of community gardens.",
        ],
      ]),
      ...CuratedSampleSupport(
        "BA, Photography",
        "Caledonia College of Art\n2014 — 2017",
        "Editorial photography\nEnvironmental portraiture\nLocation production\nDigital & analogue\nCapture One · Lightroom",
        "English — Native\nSpanish — Working",
      ),
    ];
  return undefined;
}
