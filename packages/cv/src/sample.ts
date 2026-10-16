import {
  applyCommands,
  createDocument,
  type Block,
  type Command,
  type Document,
} from "@resumi/engine";
import { makeReactSource } from "./source/starter";

export const templates = [
  {
    id: "studio",
    name: "Studio",
    description: "A clear voice. A considered layout.",
    accent: "#2563eb",
    font: "sans",
    format: "visual",
  },
  {
    id: "editorial",
    name: "Editorial",
    description: "Classic typography. Modern ambition.",
    accent: "#27272a",
    font: "serif",
    format: "visual",
  },
  {
    id: "react-studio",
    name: "React Studio",
    description: "A real TSX component. Your code, your layout.",
    accent: "#2563eb",
    font: "sans",
    format: "react",
  },
  {
    id: "react-editorial",
    name: "React Editorial",
    description: "Serif typography, CSS and reusable components.",
    accent: "#27272a",
    font: "serif",
    format: "react",
  },
] as const;
export function createResume(id: string, templateId = "studio"): Document {
  const template = templates.find((t) => t.id === templateId) ?? templates[0];
  const sections: {
    id: string;
    title: string;
    blocks: [Block["kind"], string][];
  }[] = [
    {
      id: "identity",
      title: "",
      blocks: [
        ["heading", "Alex Morgan"],
        ["subtitle", "Product Designer"],
        [
          "meta",
          "Paris, France   ·   alex@example.com   ·   alexmorgan.design",
        ],
      ],
    },
    {
      id: "profile",
      title: "Profile",
      blocks: [
        [
          "text",
          "I turn complex problems into clear, thoughtful digital experiences. A product designer with 6 years of experience bringing people, strategy, and craft together.",
        ],
      ],
    },
    {
      id: "experience",
      title: "Experience",
      blocks: [
        ["subtitle", "Senior Product Designer · Forma"],
        ["meta", "2022 — Present  /  Paris, France"],
        [
          "bullet",
          "Led the redesign of a workspace used by 40,000 teams, making everyday work simpler and more focused.",
        ],
        [
          "bullet",
          "Built a design system with engineering that reduced delivery time by 30%.",
        ],
        ["subtitle", "Product Designer · Northstar"],
        ["meta", "2020 — 2022  /  Remote"],
        [
          "bullet",
          "Shaped the onboarding experience from research to release, improving activation by 24%.",
        ],
      ],
    },
    {
      id: "education",
      title: "Education",
      blocks: [
        ["subtitle", "MA, Interaction Design"],
        ["meta", "École des Gobelins  ·  2018 — 2020"],
      ],
    },
    {
      id: "skills",
      title: "Selected skills",
      blocks: [
        [
          "text",
          "Product strategy   /   User research   /   Interaction design\nDesign systems   /   Prototyping   /   Figma   /   HTML & CSS",
        ],
      ],
    },
  ];
  const commands: Command[] = [
    {
      type: "style.update",
      patch: { accent: template.accent, font: template.font },
    },
  ];
  for (const section of sections) {
    commands.push({
      type: "section.create",
      section: { id: section.id, title: section.title, blockIds: [] },
    });
    section.blocks.forEach(([kind, text], i) =>
      commands.push({
        type: "block.create",
        sectionId: section.id,
        block: { id: `${section.id}-${i}`, kind, text },
      }),
    );
  }
  const document = applyCommands(createDocument(id, "Alex Morgan — Resume"), {
    version: 1,
    actor: { kind: "human", name: "Template" },
    commands,
  }).document;
  return template.format === "react"
    ? applyCommands(document, {
        version: 1,
        actor: { kind: "human", name: "React template" },
        commands: [
          {
            type: "source.set",
            source: { format: "react", code: makeReactSource(document) },
          },
        ],
      }).document
    : document;
}
