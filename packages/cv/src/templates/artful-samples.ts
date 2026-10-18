import type { ResumeLayout } from "./types";
import type { SampleSection } from "./sample-content";

type ArtfulProfile = {
  name: string;
  role: string;
  city: string;
  website: string;
  summary: string;
  jobs: [string, string, string, string, string, string, string, string];
  projects: [string, string, string, string, string, string];
  skills: string;
  degree: string;
  school: string;
  study: string;
  languages: string;
};

function ArtfulProfileSections(profile: ArtfulProfile): SampleSection[] {
  const section = (
    id: string,
    title: string,
    blocks: SampleSection["blocks"],
  ): SampleSection => ({
    id,
    title,
    blocks: blocks.map(([kind, text], index) => [kind, text, `${id}-${index}`]),
  });
  const j = profile.jobs;
  const p = profile.projects;
  return [
    section("identity", "", [
      ["heading", profile.name],
      ["subtitle", profile.role],
      [
        "meta",
        `${profile.city} · hello@${profile.website} · ${profile.website}`,
      ],
    ]),
    section("profile", "Approach", [["text", profile.summary]]),
    section("experience", "Experience", [
      ["subtitle", j[0]],
      ["meta", j[1]],
      ["bullet", j[2]],
      ["bullet", j[3]],
      ["subtitle", j[4]],
      ["meta", j[5]],
      ["bullet", j[6]],
      ["bullet", j[7]],
    ]),
    section("projects", "Selected work", [
      ["subtitle", p[0]],
      ["meta", p[1]],
      ["text", p[2]],
      ["subtitle", p[3]],
      ["meta", p[4]],
      ["text", p[5]],
    ]),
    section("education", "Education", [
      ["subtitle", profile.degree],
      ["meta", profile.school],
      ["text", profile.study],
    ]),
    section("skills", "Expertise", [["text", profile.skills]]),
    section("languages", "Languages", [["text", profile.languages]]),
  ];
}

/** Seven fictional, English-language profiles created specifically for these layouts. */
export function artfulSampleSections(
  layout: ResumeLayout,
): SampleSection[] | undefined {
  if (layout === "vellum")
    return ArtfulProfileSections({
      name: "Mira Vale",
      role: "Book designer & editorial art director",
      city: "London, UK",
      website: "miravale.design",
      summary:
        "I make books that invite a second look. Through thoughtful typography, material choices and a close reading of the content, I help publishers and cultural institutions turn complex ideas into quietly distinctive objects.",
      jobs: [
        "Independent art director",
        "2022 — Present / London",
        "Design artist monographs, exhibition catalogues and literary journals, from the first flatplan to the final press check.",
        "Build lasting relationships with editors, artists and specialist printers across Europe.",
        "Senior designer · Field Editions",
        "2019 — 2022 / London",
        "Led the design of twelve illustrated titles, balancing editorial ambition with production budgets.",
        "Established a flexible typographic system for the studio’s architecture list.",
      ],
      projects: [
        "The Shape of Silence",
        "2025 / Artist monograph",
        "A clothbound volume pairing a photographer’s archive with carefully paced essays. Three paper stocks create a tactile rhythm between image and text.",
        "Common Ground",
        "2024 / Editorial identity",
        "A quarterly journal exploring the changing landscape. A restrained grid gives photography, field notes and long-form writing room to breathe.",
      ],
      skills:
        "Editorial art direction\nTypography & book design\nPrint production\nInDesign · Illustrator\nImage sequencing",
      degree: "MA, Book Design",
      school: "University of Reading · 2019",
      study: "Editorial systems, type history and the material life of books.",
      languages: "English — native\nFrench — fluent",
    });
  if (layout === "chroma")
    return ArtfulProfileSections({
      name: "Jude Moreno",
      role: "Graphic designer / Brand identity / Art direction",
      city: "Barcelona, Spain",
      website: "judemoreno.studio",
      summary:
        "I turn a clear idea into a visual identity with a point of view. My work brings strategy, expressive typography and a hands-on approach to brands that want to feel unmistakably themselves.",
      jobs: [
        "Design director · Independent",
        "2022 — Present / Barcelona",
        "Create identities and campaigns for cultural venues, independent businesses and ambitious new brands.",
        "Lead small teams from initial research through brand guidelines, digital launches and print production.",
        "Brand designer · Otra Studio",
        "2019 — 2022 / Madrid",
        "Developed naming concepts, visual systems and launch campaigns for hospitality and lifestyle clients.",
        "Partnered with illustrators and developers to carry each idea consistently across touchpoints.",
      ],
      projects: [
        "Offbeat Festival",
        "2025 / Identity & campaign",
        "An exuberant identity for an independent music festival. A modular typographic system moves between street posters, tickets and digital stages.",
        "Good Company",
        "2024 / Brand strategy & design",
        "A warm, direct identity for a neighbourhood bakery, built around custom lettering and a playful family of packaging formats.",
      ],
      skills:
        "Brand strategy\nVisual identity\nArt direction\nTypography & lettering\nFigma · Adobe CC",
      degree: "BA, Graphic Design",
      school: "ELISAVA, Barcelona · 2019",
      study: "Visual communication and experimental typography.",
      languages: "Spanish — native\nEnglish — fluent\nCatalan — fluent",
    });
  if (layout === "terrazzo")
    return ArtfulProfileSections({
      name: "Clara Santos",
      role: "Interior & spatial designer",
      city: "Lisbon, Portugal",
      website: "clarasantos.design",
      summary:
        "Spaces should feel as good as they function. I work with natural materials, precise details and the stories of a place to create welcoming interiors for hospitality, culture and everyday life.",
      jobs: [
        "Spatial designer · Independent",
        "2022 — Present / Lisbon",
        "Design considered interiors for cafés, guesthouses and cultural spaces, from concept to installation.",
        "Coordinate architects, makers and suppliers to protect the design intent through delivery.",
        "Interior designer · Forma Atelier",
        "2019 — 2022 / Porto",
        "Developed material palettes, furniture details and technical drawings for boutique hospitality projects.",
        "Led site visits and built sample libraries with local ceramicists, carpenters and stone workshops.",
      ],
      projects: [
        "Casa do Pátio",
        "2025 / Guesthouse, 240 m²",
        "A quiet renovation organised around a planted courtyard. Limewashed walls, cork and locally made oak furniture connect old and new.",
        "The Everyday Table",
        "2024 / Café interior, 95 m²",
        "A neighbourhood meeting place shaped by a long communal table, warm light and a palette of salvaged stone and glazed tile.",
      ],
      skills:
        "Spatial concepts\nMaterial specification\nFurniture detailing\nAutoCAD · SketchUp\nSite coordination",
      degree: "BA, Interior Design",
      school: "ESAD, Porto · 2019",
      study: "Adaptive reuse, materials and spatial storytelling.",
      languages: "Portuguese — native\nEnglish — fluent\nSpanish — working",
    });
  if (layout === "spectrum")
    return ArtfulProfileSections({
      name: "Ava Laurent",
      role: "Senior product designer · Thoughtful digital experiences",
      city: "Amsterdam, NL",
      website: "avalaurent.design",
      summary:
        "I help teams make complex products feel simple and human. Equal parts research, systems thinking and visual craft, my practice connects the questions people ask with the tools they actually need.",
      jobs: [
        "Senior product designer · Orbit",
        "2022 — Present / Amsterdam",
        "Lead end-to-end design for a planning platform used by 18,000 independent businesses.",
        "Redesigned onboarding with product and engineering, improving first-week activation by 24%.",
        "Product designer · Common Studio",
        "2019 — 2022 / Rotterdam",
        "Turned field research into clear service journeys and accessible interfaces for public-sector teams.",
        "Created a component library that shortened design-to-development handoffs across four products.",
      ],
      projects: [
        "A calmer workday",
        "2025 / Product strategy & UX",
        "A new scheduling experience that helps small teams see what matters, plan together and protect time for focused work.",
        "One shared language",
        "2024 / Design system",
        "Tokens, accessible components and practical documentation that give designers and engineers a shared foundation for better decisions.",
      ],
      skills:
        "Product strategy\nResearch & facilitation\nInteraction design\nDesign systems\nFigma · Prototyping",
      degree: "MSc, Interaction Design",
      school: "TU Delft · 2019",
      study: "Human-centred design and prototyping for real-world use.",
      languages: "English — fluent\nFrench — native\nDutch — working",
    });
  if (layout === "bloom")
    return ArtfulProfileSections({
      name: "Iris Chen",
      role: "Illustrator & visual storyteller",
      city: "Melbourne, AU",
      website: "iriscreates.studio",
      summary:
        "I create characterful images for thoughtful people and purposeful brands. Inspired by gardens, everyday rituals and the beautifully imperfect, my work brings a tactile, human touch to stories worth sharing.",
      jobs: [
        "Illustrator · Independent",
        "2021 — Present / Melbourne",
        "Create editorial illustrations, packaging and visual identities for publishing, food and lifestyle clients.",
        "Translate open briefs into distinctive image worlds, guiding projects from early sketches to print-ready artwork.",
        "Designer & illustrator · Paperfolk",
        "2018 — 2021 / Melbourne",
        "Developed seasonal stationery collections and illustrated packaging for independent retailers.",
        "Worked closely with local printers on colour separation, paper choice and finishing details.",
      ],
      projects: [
        "A Season of Small Things",
        "2025 / Illustrated book",
        "Forty illustrations celebrating ordinary moments, made with paper cut-outs, painted textures and a warm, limited palette.",
        "The Good Seed",
        "2024 / Packaging & illustration",
        "A family of illustrated seed packets for an urban gardening collective, with expressive plant forms and friendly, practical information.",
      ],
      skills:
        "Editorial illustration\nVisual storytelling\nPackaging design\nGouache & paper collage\nProcreate · Illustrator",
      degree: "BA, Communication Design",
      school: "RMIT University · 2018",
      study: "Illustration, printmaking and visual narratives.",
      languages: "English — native\nMandarin — fluent",
    });
  if (layout === "kinetic")
    return ArtfulProfileSections({
      name: "Noah Reed",
      role: "Motion designer & creative director",
      city: "Berlin, Germany",
      website: "noahreed.motion",
      summary:
        "I give ideas a sense of rhythm. From brand motion systems to title sequences and product stories, I combine sharp graphic thinking with precise animation to make every frame earn its place.",
      jobs: [
        "Motion director · Independent",
        "2022 — Present / Berlin",
        "Direct motion identities and launch films for technology, culture and design-led brands.",
        "Bring designers, animators and sound artists together around a clear concept and a strong visual language.",
        "Senior motion designer · Frame",
        "2019 — 2022 / London",
        "Created title sequences, explainers and social campaigns for international clients.",
        "Built reusable animation systems that made brand expression consistent across teams and formats.",
      ],
      projects: [
        "Open / Close",
        "2025 / Motion identity",
        "A rhythmic motion language for a contemporary art institution, translating its modular identity into expressive transitions and dynamic typography.",
        "Future in Focus",
        "2024 / Film & art direction",
        "A sixty-second launch film combining tactile 3D objects, precise graphic sequences and a carefully composed soundscape.",
      ],
      skills:
        "Motion direction\n2D & 3D animation\nStoryboarding\nAfter Effects · Cinema 4D\nFigma · Rive",
      degree: "BA, Motion Design",
      school: "University of the Arts London · 2019",
      study: "Animation, graphic systems and moving-image storytelling.",
      languages: "English — native\nGerman — professional",
    });
  if (layout === "patina")
    return ArtfulProfileSections({
      name: "Luca Morel",
      role: "Industrial designer · Objects with purpose",
      city: "Copenhagen, DK",
      website: "lucamorel.design",
      summary:
        "I design useful objects with a clear reason to exist. My practice moves between material exploration, careful prototyping and production, creating honest products that feel intuitive in the hand and age with character.",
      jobs: [
        "Industrial designer · Independent",
        "2022 — Present / Copenhagen",
        "Develop furniture, lighting and everyday objects for design-led manufacturers and emerging brands.",
        "Guide projects from sketches and physical models through engineering reviews and production samples.",
        "Product designer · North Objects",
        "2019 — 2022 / Copenhagen",
        "Designed home accessories with an emphasis on repairable construction and responsible material use.",
        "Worked with European suppliers to resolve tooling, finishing and assembly details.",
      ],
      projects: [
        "Arc Task Light",
        "2025 / Lighting design",
        "A compact desk light with a tool-free hinge, spun aluminium shade and replaceable electronics. Developed from working prototypes to a pilot production run.",
        "Common Measure",
        "2024 / Home objects",
        "A collection of stackable vessels in recycled aluminium and cork, shaped by simple manufacturing processes and the rituals of everyday use.",
      ],
      skills:
        "Industrial design\nMaterial research\nPhysical prototyping\nRhino · SolidWorks\nKeyShot · DFM",
      degree: "MA, Product Design",
      school: "Royal Danish Academy · 2019",
      study: "Materials, manufacturing and circular product systems.",
      languages: "French — native\nEnglish — fluent\nDanish — working",
    });
  return undefined;
}
