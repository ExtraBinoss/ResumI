import type { ResumeLayout } from "./types";
import type { SampleSection } from "./sample-content";

type Copy = [SampleSection["blocks"][number][0], string][];
const section = (id: string, title: string, blocks: Copy): SampleSection => ({
  id,
  title,
  blocks,
});
const identity = (role: string, location = "Paris, France") =>
  section("identity", "", [
    ["heading", "Alex Morgan"],
    ["subtitle", role],
    ["meta", `${location} · alex@example.com · alexmorgan.design`],
  ]);
const languages = () =>
  section("languages", "Languages", [
    ["text", "French — native\nEnglish — professional proficiency"],
  ]);
const education = () =>
  section("education", "Education", [
    ["subtitle", "MA, Interaction Design"],
    ["meta", "École des Gobelins · 2018 — 2020"],
    [
      "text",
      "Research-led design, visual systems and human-computer interaction.",
    ],
  ]);
const tools = (value = "Figma / Prototyping / HTML & CSS / Design systems") =>
  section("skills", "Selected skills", [["text", value]]);

/** Original illustrative career histories, never taken from a real person's resume. */
export function extendedSampleSections(
  layout: ResumeLayout,
): SampleSection[] | undefined {
  if (layout === "harvard")
    return [
      identity("Product Designer", "Cambridge, MA"),
      section("education", "Education", [
        ["subtitle", "Northeastern University"],
        ["meta", "Boston, MA · May 2020"],
        [
          "text",
          "Bachelor of Science in Design, concentration in Interaction Design. GPA: 3.8/4.0.",
        ],
        [
          "text",
          "Honors: Dean’s List, 2017–2020. Senior thesis: Accessible wayfinding in public libraries.",
        ],
        [
          "subtitle",
          "Study Abroad · Copenhagen Institute of Interaction Design",
        ],
        ["meta", "Copenhagen, Denmark · Fall 2018"],
        [
          "text",
          "Coursework in service design, physical prototyping and participatory research.",
        ],
      ]),
      section("experience", "Experience", [
        ["subtitle", "Forma · Senior Product Designer"],
        ["meta", "Boston, MA · 2022 — Present"],
        [
          "bullet",
          "Led research and interaction design for a collaboration platform used by 40,000 teams; partnered with eight engineers from discovery through release.",
        ],
        [
          "bullet",
          "Built a shared component library and accessibility checklist, reducing design-to-development delivery time by 30%.",
        ],
        [
          "bullet",
          "Conducted 24 customer interviews and translated findings into a prioritized roadmap for onboarding and team administration.",
        ],
        ["subtitle", "Northstar · Product Designer"],
        ["meta", "Remote · 2020 — 2022"],
        [
          "bullet",
          "Redesigned onboarding through prototype testing and funnel analysis, contributing to a 24% improvement in activation.",
        ],
        [
          "bullet",
          "Created reusable interaction patterns and worked with customer support to resolve recurring usability issues.",
        ],
      ]),
      section("projects", "Leadership & Activities", [
        ["subtitle", "Design for Everyone · Volunteer Design Lead"],
        ["meta", "Cambridge, MA · 2021 — Present"],
        [
          "bullet",
          "Coordinated a six-person volunteer team to improve registration and wayfinding for a neighborhood learning center.",
        ],
        [
          "bullet",
          "Mentored junior designers through monthly portfolio reviews and accessible-design workshops.",
        ],
      ]),
      section("skills", "Selected skills", [
        [
          "text",
          "Research: Interview planning, usability testing, synthesis. / Design: Interaction design, prototyping, Figma. / Technical: HTML, CSS, accessibility audits.",
        ],
      ]),
      section("interests", "Languages & Interests", [
        [
          "text",
          "French: native. English: professional proficiency. Interests: urban sketching, cycling and community libraries.",
        ],
      ]),
    ];
  if (layout === "cobalt")
    return [
      identity("Design Engineer"),
      section("profile", "Profile", [
        [
          "text",
          "Design engineer bridging product craft and front-end systems. I turn complex workflows into accessible interfaces, with equal care for the prototype and the production detail.",
        ],
      ]),
      section("experience", "Experience", [
        ["subtitle", "Senior Design Engineer · Forma"],
        ["meta", "2022 — Present / Paris, France"],
        [
          "bullet",
          "Built the product’s shared interaction system with design and engineering, supporting six product teams.",
        ],
        [
          "bullet",
          "Shipped keyboard-first workflows for the editor, command menu and data tables; documented behavior and accessibility requirements.",
        ],
        [
          "bullet",
          "Reduced design-to-development delivery time by 30% through reusable components and code-backed prototypes.",
        ],
        ["subtitle", "Product Designer · Northstar"],
        ["meta", "2020 — 2022 / Remote"],
        [
          "bullet",
          "Designed onboarding and prototyped critical flows with HTML, CSS and TypeScript before implementation.",
        ],
        [
          "bullet",
          "Partnered with customer support to turn recurring issues into focused product improvements.",
        ],
      ]),
      section("projects", "Selected project", [
        ["subtitle", "Forma UI · Component platform"],
        ["meta", "2023 — 2024 / Design engineering"],
        [
          "bullet",
          "Created a token architecture, interactive documentation and visual regression fixtures for shared components.",
        ],
        [
          "bullet",
          "Made interaction patterns testable across keyboard, touch and assistive technology.",
        ],
      ]),
      education(),
      tools(
        "Interaction design / Design systems / TypeScript / Accessibility / Prototyping / Component APIs",
      ),
      languages(),
      section("certifications", "Development", [
        ["subtitle", "Digital accessibility"],
        ["meta", "Deque University · 2023"],
      ]),
    ];
  if (layout === "atelier")
    return [
      identity("Brand & Digital Designer"),
      section("profile", "Approach", [
        [
          "text",
          "Thoughtful identities and digital experiences for people, places and independent businesses. My work connects editorial clarity, warm visual systems and practical interaction design.",
        ],
      ]),
      section("experience", "Experience", [
        ["subtitle", "Senior Designer · Atelier Forma"],
        ["meta", "2022 — Present / Paris"],
        [
          "bullet",
          "Led visual identity and website projects from discovery workshops to launch, working directly with founders and development partners.",
        ],
        [
          "bullet",
          "Created flexible brand systems spanning typography, art direction, motion guidance and digital components.",
        ],
        ["subtitle", "Digital Designer · Northstar"],
        ["meta", "2020 — 2022 / Remote"],
        [
          "bullet",
          "Designed editorial websites and commerce experiences for cultural organizations and independent retailers.",
        ],
        [
          "bullet",
          "Built high-fidelity prototypes and production-ready guidelines that kept the original design intent intact.",
        ],
      ]),
      section("projects", "Selected work", [
        ["subtitle", "Maison Commune"],
        ["meta", "2024 / Identity & digital experience"],
        [
          "text",
          "A warm, modular identity and an accessible booking experience for a neighborhood arts space.",
        ],
        ["subtitle", "Field Notes"],
        ["meta", "2023 / Editorial platform"],
        [
          "text",
          "An independent publication brought to life with a flexible type system and a quiet, image-led website.",
        ],
      ]),
      education(),
      tools(
        "Brand strategy / Art direction / Editorial design / Digital design / Prototyping / Typography",
      ),
      languages(),
    ];
  if (layout === "timeline")
    return [
      identity("Product Designer · Research & Systems"),
      section("profile", "Profile", [
        [
          "text",
          "Six years connecting user research with clear product decisions. I help teams make complex services feel approachable, from the first interview to the smallest interaction.",
        ],
      ]),
      section("experience", "Experience", [
        ["subtitle", "Senior Product Designer · Forma"],
        ["meta", "2022 — Present / Paris"],
        [
          "bullet",
          "Led design for collaboration and administration tools, aligning customer needs with product and engineering priorities.",
        ],
        [
          "bullet",
          "Introduced a repeatable research practice and shared insights library used by six product teams.",
        ],
        [
          "bullet",
          "Built accessible interaction patterns and worked alongside engineers through implementation reviews.",
        ],
        ["subtitle", "Product Designer · Northstar"],
        ["meta", "2020 — 2022 / Remote"],
        [
          "bullet",
          "Mapped the customer journey and redesigned onboarding, contributing to a 24% increase in activation.",
        ],
        [
          "bullet",
          "Ran weekly usability sessions and documented decisions with evidence teams could return to.",
        ],
      ]),
      section("projects", "Selected project", [
        ["subtitle", "Customer research program"],
        ["meta", "2023 — 2024 / Research operations"],
        [
          "text",
          "Established recruitment, interview templates and a searchable research repository so customer evidence could inform every planning cycle.",
        ],
      ]),
      education(),
      tools(
        "User research / Product strategy / Service design / Interaction design / Accessibility / Design systems",
      ),
      languages(),
    ];
  if (layout === "consultant")
    return [
      identity("Product Strategy & Design"),
      section("profile", "Profile", [
        [
          "text",
          "Product strategist and designer helping B2B teams clarify the problem, make focused decisions and deliver useful software. Experienced across research, service design and complex operational workflows.",
        ],
      ]),
      section("experience", "Experience", [
        ["subtitle", "Lead Product Designer · Forma"],
        ["meta", "2022 — Present / Paris"],
        [
          "bullet",
          "Defined the experience strategy for collaboration tools used by 40,000 teams, translating research into a staged product roadmap.",
        ],
        [
          "bullet",
          "Facilitated discovery workshops with product, engineering and customer-facing teams to align priorities and decision criteria.",
        ],
        [
          "bullet",
          "Established a design system and delivery practice that reduced handoff time by 30%.",
        ],
        ["subtitle", "Product Designer · Northstar"],
        ["meta", "2020 — 2022 / Remote"],
        [
          "bullet",
          "Combined customer interviews, journey mapping and funnel analysis to identify friction in onboarding and account management.",
        ],
        [
          "bullet",
          "Tested proposed workflows with customers before delivery; redesigned onboarding contributed to a 24% increase in activation.",
        ],
      ]),
      section("projects", "Selected engagement", [
        ["subtitle", "Operations workspace · Forma"],
        ["meta", "2024 / Strategy to delivery"],
        [
          "text",
          "Mapped a fragmented approval process, defined a shared interaction model and partnered with engineering to ship a coherent workspace for team administrators.",
        ],
      ]),
      education(),
      tools(
        "Product strategy / Discovery facilitation / Service design / Research synthesis / Interaction design / Stakeholder alignment",
      ),
      languages(),
    ];
  if (layout === "mosaic")
    return [
      identity("Multidisciplinary Designer"),
      section("profile", "Profile", [
        [
          "text",
          "I build expressive visual systems that stay useful in everyday life. My practice brings together brand identity, digital products and the small details that make an experience feel considered.",
        ],
      ]),
      section("experience", "Experience", [
        ["subtitle", "Senior Product Designer · Forma"],
        ["meta", "2022 — Present / Paris"],
        [
          "bullet",
          "Designed collaboration tools and a visual language that works across the product, website and customer communications.",
        ],
        [
          "bullet",
          "Developed a modular component system with engineering, bringing consistency to six product teams.",
        ],
        [
          "bullet",
          "Turned customer research into clear navigation, approachable onboarding and accessible interactions.",
        ],
        ["subtitle", "Designer · Northstar"],
        ["meta", "2020 — 2022 / Remote"],
        [
          "bullet",
          "Created digital experiences and brand applications for early-stage products and cultural organizations.",
        ],
        [
          "bullet",
          "Delivered prototypes, art direction and design guidelines in close partnership with developers.",
        ],
      ]),
      section("projects", "Selected projects", [
        ["subtitle", "Common Ground · Community platform"],
        ["meta", "2024 / Identity & product design"],
        [
          "text",
          "A flexible identity and a welcoming digital space for local events, workshops and shared resources.",
        ],
        ["subtitle", "Forma UI · Design system"],
        ["meta", "2023 / Digital toolkit"],
        [
          "text",
          "A connected system of components, illustration and usage guidance for a growing product suite.",
        ],
      ]),
      education(),
      tools(
        "Art direction / Digital products / Visual systems / Prototyping / Typography / Accessibility",
      ),
      languages(),
    ];
  return undefined;
}
