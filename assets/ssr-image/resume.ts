import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createResume } from "../../packages/cv/src/index";
import { resumeData } from "../../packages/cv/src/source/starter";
import Resume from "../../packages/cv/src/templates/CodeResume";
import assets from "../../packages/cv/src/templates/assets.generated.json";
import type { ResumeData } from "../../packages/cv/src/templates/types";

/** Public sample portrait and template; every career detail below is fictional. */
export function socialResume(font: string): string {
  const sample = resumeData(createResume("social-preview", "react-profile"));
  const data: ResumeData = {
    ...sample,
    accent: "#2563eb",
    font,
    sections: [
      {
        title: "",
        blocks: [
          { kind: "heading", text: "Alex Morgan" },
          { kind: "subtitle", text: "Product & Front-end Engineer" },
          {
            kind: "meta",
            text: "Paris, France · alex@example.com · alexmorgan.dev",
          },
        ],
      },
      {
        title: "Profile",
        blocks: [
          {
            kind: "text",
            text: "I build thoughtful digital products. Six years connecting product craft, accessible interfaces and reliable front-end systems.",
          },
        ],
      },
      {
        title: "Experience",
        blocks: [
          { kind: "subtitle", text: "Senior Front-end Engineer · Forma" },
          { kind: "meta", text: "2022 — Present / Paris, France" },
          {
            kind: "bullet",
            text: "Built a collaborative workspace in React and TypeScript, from first prototype to polished production experience.",
          },
          {
            kind: "bullet",
            text: "Created an accessible component system shared by six product teams.",
          },
          { kind: "subtitle", text: "Product Engineer · Northstar" },
          { kind: "meta", text: "2020 — 2022 / Remote" },
          {
            kind: "bullet",
            text: "Shipped intuitive onboarding and developer tools with design and engineering partners.",
          },
        ],
      },
      {
        title: "Selected projects",
        blocks: [
          { kind: "subtitle", text: "Forma UI · Design system" },
          { kind: "meta", text: "React / TypeScript / Accessibility" },
          {
            kind: "text",
            text: "Reusable components, clear documentation and considered interaction details.",
          },
          { kind: "subtitle", text: "Open Studio · Developer workspace" },
          { kind: "meta", text: "2024 / Open-source side project" },
          {
            kind: "text",
            text: "A calm, fast workspace for building and sharing the next idea.",
          },
        ],
      },
      {
        title: "Selected skills",
        blocks: [
          {
            kind: "text",
            text: "React / TypeScript / HTML & CSS / Product thinking / Accessibility / Design systems",
          },
        ],
      },
      {
        title: "Education",
        blocks: [
          { kind: "subtitle", text: "MSc, Computer Science" },
          { kind: "meta", text: "Université de Lyon · 2018 — 2020" },
        ],
      },
      {
        title: "Languages",
        blocks: [
          { kind: "text", text: "French — native\nEnglish — professional" },
        ],
      },
    ],
  };
  const tools = assets.brands.filter((brand) =>
    ["TypeScript", "HTML", "CSS", "Figma"].includes(brand.name),
  );
  const icons = tools
    .map(
      (brand) =>
        `<svg viewBox="${brand.viewBox}" width="25" height="25" aria-label="${brand.name}">${brand.parts.map((part) => `<path d="${part.path}" fill="${part.fill}"/>`).join("")}</svg>`,
    )
    .join("");
  return (
    renderToStaticMarkup(
      createElement<{ data?: ResumeData }>(Resume, { data }),
    ).replace(
      "</aside>",
      `<section class="cv-section"><h2>Toolkit</h2><div style="display:flex;gap:13px;align-items:center">${icons}</div></section></aside>`,
    ) +
    `<style>
    .cv-sheet .cv-profile-rail{background:#edf4ff}
    .cv-sheet.cv-profile .cv-name{font-size:44px;color:#172b51;letter-spacing:-1.7px}
    .cv-sheet.cv-profile .cv-role{font-size:16px;line-height:1.4}
    .cv-sheet.cv-profile .cv-paragraph,.cv-sheet.cv-profile .cv-bullets{font-size:14px;line-height:1.8}
    .cv-sheet.cv-profile .cv-profile-main .cv-entry h3{font-size:15px}
    .cv-sheet .cv-portrait{width:148px;height:164px;border-radius:8px}
    .cv-sheet .cv-section h2{font-size:11px;letter-spacing:1.2px}
    .cv-sheet .cv-profile-main{padding-top:57px}
    .cv-sheet .cv-profile-rail .cv-contacts{font-size:11px}
  </style>`
  );
}
