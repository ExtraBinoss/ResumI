import type { Block } from "@resumi/engine";
import type { ResumeLayout } from "./CodeResume";
export type SampleSection = {
  id: string;
  title: string;
  blocks: [Block["kind"], string, string?][];
};

/** Synthetic professional sample copy; the document still enters through validated commands. */
export function reactSampleSections(
  sections: SampleSection[],
  layout: ResumeLayout,
): SampleSection[] {
  const result: SampleSection[] = sections.map((section): SampleSection => ({
    ...section,
    blocks: section.blocks.map(([kind, text], index) => [
      kind,
      text,
      `${section.id}-${index}`,
    ]),
  }));
  const experience = result.find((section) => section.id === "experience")!;
  experience.blocks.splice(
    4,
    0,
    [
      "bullet",
      "Partnered with engineers to audit keyboard navigation and screen-reader flows across key journeys.",
      "experience-senior-accessibility",
    ],
    [
      "bullet",
      "Introduced usability reviews and documented interaction patterns for six product teams.",
      "experience-senior-design-reviews",
    ],
  );
  experience.blocks.push([
    "bullet",
    "Mapped service journeys and tested prototypes with customers in weekly research sessions.",
    "experience-junior-research",
  ]);
  const projects: SampleSection = {
    id: "projects",
    title:
      layout === "studio" || layout === "profile"
        ? "Selected projects"
        : "Selected project",
    blocks: [
      ["subtitle", "Forma UI · Design system"],
      ["meta", "2023 — 2024 / Web platform"],
      [
        "bullet",
        "Created a component library, usage guidance and accessibility checklist adopted by six product teams.",
      ],
    ],
  };
  if (layout === "studio" || layout === "profile")
    projects.blocks.push(
      ["subtitle", "Customer research program"],
      ["meta", "2021 — 2022 / Northstar"],
      [
        "bullet",
        "Established a monthly customer interview program and a shared research repository for product and support teams.",
      ],
    );
  result.splice(
    result.findIndex((section) => section.id === "education"),
    0,
    projects,
  );
  result.push({
    id: "languages",
    title: "Languages",
    blocks: [
      ["text", "French — native\nEnglish — full professional proficiency"],
    ],
  });
  if (layout === "studio" || layout === "profile")
    result.push({
      id: "certifications",
      title: "Professional development",
      blocks: [
        ["subtitle", "Digital accessibility"],
        ["meta", "Deque University · 2023"],
      ],
    });
  return result;
}
