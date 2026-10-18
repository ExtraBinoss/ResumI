import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { applyCommand, type Document } from "@resumi/engine";
import { createResume } from "@resumi/cv";
import { ResumeDiff } from "../../../../src/features/editor/agent/ResumeDiff";
import { InterfaceLanguage } from "../../../../src/i18n/InterfaceLanguage";

function renderDiff(before: Document, after: Document, locale = "en") {
  return renderToStaticMarkup(
    <InterfaceLanguage locale={locale}>
      <ResumeDiff before={before} after={after} />
    </InterfaceLanguage>,
  );
}

test("agent review exposes a translation-only change without changing the rendered active language", () => {
  const before = applyCommand(createResume("agent-languages"), {
    type: "locale.add",
    code: "fr",
    name: "Français",
  });
  const after = applyCommand(before, {
    type: "translation.set",
    id: "identity-0",
    locale: "fr",
    text: "Camille Martin",
  });
  for (const [locale, original] of [
    ["en", "Original text"],
    ["fr", "Texte d’origine"],
  ]) {
    const markup = renderDiff(before, after, locale);
    expect(markup).toContain("fr: ");
    expect(markup).toContain("<ins>Camille Martin</ins>");
    expect(markup).toContain(`<del>${original}</del>`);
    expect(markup).toContain('data-block-id="identity-0">Alex Morgan');
    expect(markup).not.toContain('data-block-id="identity-0">Camille Martin');
  }
});
test("agent review separately shows activating a language and its translated rendered proposal", () => {
  let before = applyCommand(createResume("agent-activate"), {
    type: "locale.add",
    code: "fr",
    name: "Français",
  });
  before = applyCommand(before, {
    type: "translation.set",
    id: "identity-0",
    locale: "fr",
    text: "Camille Martin",
  });
  const after = applyCommand(before, { type: "locale.activate", code: "fr" });
  for (const [locale, label] of [
    ["en", "CV language"],
    ["fr", "Langue du CV"],
  ]) {
    const markup = renderDiff(before, after, locale);
    expect(markup).toContain(`${label}: `);
    expect(markup).toContain("<del>en</del><ins>fr</ins>");
    expect(markup).toContain("Français (fr)");
    expect(markup).toContain('data-block-id="identity-0">Camille Martin');
  }
});

test("agent review exposes semantic section-title variants independently from visual text blocks", () => {
  const before = applyCommand(createResume("agent-section-title"), {
    type: "locale.add",
    code: "fr",
    name: "Français",
  });
  const after = applyCommand(before, {
    type: "section.translation.set",
    id: "experience",
    locale: "fr",
    title: "Expériences",
  });
  const markup = renderDiff(before, after);
  expect(markup).toContain("Experience");
  expect(markup).toContain("fr: ");
  expect(markup).toContain("<ins>Expériences</ins>");
  expect(after.blocks).toBe(before.blocks);
});
