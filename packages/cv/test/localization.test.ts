import { expect, test } from "bun:test";
import { applyCommands } from "@resumi/engine";
import { createResume, renderHtml, visualCommands } from "../src";
import { renderTemplateHtml } from "../src/templates/render";
import { resumeData } from "../src/source/starter";

test("portable and TSX renderers resolve the active language while JSON keeps every variant", () => {
  let doc = createResume("translated");
  doc = applyCommands(doc, {
    version: 1,
    actor: { kind: "agent", name: "Translator" },
    commands: [
      { type: "locale.add", code: "fr", name: "Français" },
      {
        type: "translation.set",
        id: "identity-0",
        locale: "fr",
        text: "Camille Martin",
      },
      { type: "locale.activate", code: "fr" },
    ],
  }).document;
  expect(renderHtml(doc)).toContain('lang="fr"');
  expect(renderHtml(doc)).toContain("Camille Martin");
  expect(renderHtml(doc)).not.toContain(">Alex Morgan<");
  expect(renderTemplateHtml(doc)).toContain("Camille Martin");
  expect(renderTemplateHtml(doc)).toContain('lang="fr"');
  expect(resumeData(doc).sections[0].blocks[0].text).toBe("Camille Martin");
  doc = applyCommands(doc, {
    version: 1,
    actor: { kind: "human", name: "Editor" },
    commands: visualCommands(doc),
  }).document;
  expect(renderHtml(doc)).toContain("Camille Martin");
  expect(doc.blocks["identity-0"].text).toBe("Alex Morgan");
});

test("structured and trusted TSX section headings resolve explicit translations and project into new visual labels", () => {
  const original = createResume("section-language");
  const sectionId = original.sectionIds.find(
    (id) => !!original.sections[id].title,
  )!;
  const doc = applyCommands(original, {
    version: 1,
    actor: { kind: "agent", name: "Section translator" },
    commands: [
      { type: "locale.add", code: "fr", name: "Français" },
      {
        type: "section.translation.set",
        id: sectionId,
        locale: "fr",
        title: "Parcours professionnel",
      },
      { type: "locale.activate", code: "fr" },
    ],
  }).document;
  expect(renderHtml(doc)).toContain(
    'class="resume-title">Parcours professionnel',
  );
  expect(renderTemplateHtml(doc)).toContain("Parcours professionnel");
  expect(
    resumeData(doc).sections.find((section) => section.id === sectionId)?.title,
  ).toBe("Parcours professionnel");
  const visual = applyCommands(doc, {
    version: 1,
    actor: { kind: "human", name: "Editor" },
    commands: visualCommands(doc),
  }).document;
  expect(renderHtml(visual)).toContain("Parcours professionnel");
  expect(visual.sections[sectionId].title).toBe(
    original.sections[sectionId].title,
  );
});
