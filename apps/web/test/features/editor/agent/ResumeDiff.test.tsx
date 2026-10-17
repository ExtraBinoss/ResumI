import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { applyCommand } from "@resumi/engine";
import { createResume } from "@resumi/cv";
import { ResumeDiff } from "../../../../src/features/editor/agent/ResumeDiff";

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
  const markup = renderToStaticMarkup(
    <ResumeDiff before={before} after={after} />,
  );
  expect(markup).toContain("fr: ");
  expect(markup).toContain("<ins>Camille Martin</ins>");
  expect(markup).toContain("<del>Original text</del>");
  expect(markup).toContain('data-block-id="identity-0">Alex Morgan');
  expect(markup).not.toContain('data-block-id="identity-0">Camille Martin');
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
  const markup = renderToStaticMarkup(
    <ResumeDiff before={before} after={after} />,
  );
  expect(markup).toContain("CV language: ");
  expect(markup).toContain("<del>en</del><ins>fr</ins>");
  expect(markup).toContain("Français (fr)");
  expect(markup).toContain('data-block-id="identity-0">Camille Martin');
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
  const markup = renderToStaticMarkup(
    <ResumeDiff before={before} after={after} />,
  );
  expect(markup).toContain("Experience");
  expect(markup).toContain("fr: ");
  expect(markup).toContain("<ins>Expériences</ins>");
  expect(after.blocks).toBe(before.blocks);
});
