import {
  applyCommands,
  createDocument,
  type Command,
  type Document,
} from "@resumi/engine";
import { makeReactSource } from "./source/starter";
import {
  reactSampleSections,
  type SampleSection,
} from "./templates/sample-content";

import { templates } from "./templates/catalog";
export { templates } from "./templates/catalog";
export function createResume(id: string, templateId = "studio"): Document {
  const template = templates.find((t) => t.id === templateId) ?? templates[0];
  const sections: SampleSection[] = [
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
          template.format === "react"
            ? "Product designer with six years of experience in B2B software. Specializes in user research, interaction design and design systems, working with product and engineering teams from discovery to delivery."
            : "I turn complex problems into clear, thoughtful digital experiences. A product designer with 6 years of experience bringing people, strategy, and craft together.",
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
          template.format === "react"
            ? "Led end-to-end design for collaboration tools used by 40,000 teams, from research and prototyping to implementation."
            : "Led the redesign of a workspace used by 40,000 teams, making everyday work simpler and more focused.",
        ],
        [
          "bullet",
          template.format === "react"
            ? "Established a shared design system with engineering, reducing design-to-development delivery time by 30%."
            : "Built a design system with engineering that reduced delivery time by 30%.",
        ],
        ["subtitle", "Product Designer · Northstar"],
        ["meta", "2020 — 2022  /  Remote"],
        [
          "bullet",
          template.format === "react"
            ? "Conducted user research and redesigned onboarding, contributing to a 24% increase in activation."
            : "Shaped the onboarding experience from research to release, improving activation by 24%.",
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
  const content =
    template.format === "react"
      ? reactSampleSections(sections, template.layout)
      : sections;
  for (const section of content) {
    commands.push({
      type: "section.create",
      section: { id: section.id, title: section.title, blockIds: [] },
    });
    section.blocks.forEach(([kind, text, blockId], i) =>
      commands.push({
        type: "block.create",
        sectionId: section.id,
        block: { id: blockId ?? `${section.id}-${i}`, kind, text },
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
            source: {
              format: "react",
              code: makeReactSource(document, {
                layout: template.layout,
                portrait:
                  template.layout === "profile" ||
                  template.layout === "atelier",
              }),
            },
          },
        ],
      }).document
    : document;
}
