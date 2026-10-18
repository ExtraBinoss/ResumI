import { expect, test } from "bun:test";
import {
  applyCommand,
  applyCommands,
  createSession,
  execute,
  undo,
  redo,
  localizedSection,
  localizedSectionTitle,
  serializeDocument,
  deserializeDocument,
  duplicateDocument,
  validateDocument,
} from "../../src";
import { visualDocument, batch, deepFreeze } from "../canvas/fixtures";

function french() {
  return applyCommands(
    visualDocument(),
    batch([
      { type: "locale.add", code: "fr", name: "Français" },
      { type: "locale.activate", code: "fr" },
    ]),
  ).document;
}
test("section title edits target the active language and preserve base, blocks and unrelated section identity", () => {
  const original = deepFreeze(french());
  expect(localizedSection(original, "content")).toBe(original.sections.content);
  const doc = applyCommand(original, {
    type: "section.update",
    id: "content",
    title: "Expériences",
  });
  expect(doc.sections.content.title).toBe("Content");
  expect(doc.sections.content.titleTranslations?.fr).toBe("Expériences");
  expect(localizedSectionTitle(doc, "content")).toBe("Expériences");
  const section = localizedSection(doc, "content");
  expect(section.title).toBe("Expériences");
  expect(localizedSection(doc, "content")).toBe(section);
  expect(localizedSection(doc, "extra")).toBe(original.sections.extra);
  expect(doc.blocks).toBe(original.blocks);
  const english = applyCommand(doc, {
    type: "section.translation.set",
    id: "content",
    locale: "en",
    title: "Experience",
  });
  expect(english.sections.content.title).toBe("Experience");
  expect(localizedSectionTitle(english, "content")).toBe("Expériences");
  const active = applyCommand(english, { type: "locale.activate", code: "en" });
  expect(localizedSectionTitle(active, "content")).toBe("Experience");
  const legacy = applyCommand(visualDocument(), {
    type: "section.update",
    id: "content",
    title: "Updated original",
  });
  expect(localizedSectionTitle(legacy, "content")).toBe("Updated original");
});
test("explicit section variants preserve empty headings, rename and remove with their language", () => {
  let doc = applyCommand(french(), {
    type: "section.translation.set",
    id: "content",
    locale: "fr",
    title: "",
  });
  expect(localizedSectionTitle(doc, "content")).toBe("");
  doc = applyCommand(doc, {
    type: "locale.update",
    code: "fr",
    nextCode: "fr-CA",
    name: "Français canadien",
  });
  expect(doc.sections.content.titleTranslations?.fr).toBeUndefined();
  expect(doc.sections.content.titleTranslations?.["fr-CA"]).toBe("");
  doc = applyCommand(doc, {
    type: "locale.update",
    code: "fr-CA",
    name: "French",
  });
  expect(localizedSectionTitle(doc, "content")).toBe("");
  doc = applyCommand(doc, {
    type: "section.translation.remove",
    id: "content",
    locale: "fr-CA",
  });
  expect(localizedSectionTitle(doc, "content")).toBe("Content");
  doc = applyCommand(doc, {
    type: "section.translation.set",
    id: "content",
    locale: "fr-CA",
    title: "Contenu",
  });
  doc = applyCommand(doc, { type: "locale.remove", code: "fr-CA" });
  expect(doc.sections.content.titleTranslations?.["fr-CA"]).toBeUndefined();
  expect(localizedSectionTitle(doc, "content")).toBe("Content");
});
test("section translations use canonical history, serialization and duplication", () => {
  const session = createSession(french());
  const next = execute(
    session,
    batch([
      {
        type: "section.translation.set",
        id: "content",
        locale: "fr",
        title: "Parcours",
      },
    ]),
  );
  expect(undo(next).document).toBe(session.document);
  expect(redo(undo(next)).document).toBe(next.document);
  const loaded = deserializeDocument(serializeDocument(next.document));
  expect(localizedSectionTitle(loaded, "content")).toBe("Parcours");
  let id = 0;
  const copied = duplicateDocument(loaded, "copy", () => `new-${++id}`);
  expect(localizedSectionTitle(copied, copied.sectionIds[0])).toBe("Parcours");
  const same = applyCommand(loaded, {
    type: "section.translation.set",
    id: "content",
    locale: "fr",
    title: "Content",
  });
  expect(localizedSection(same, "content")).toBe(same.sections.content);
});
test("section language commands reject unknown sections, locales, invalid titles and base removal", () => {
  const doc = deepFreeze(french());
  for (const command of [
    {
      type: "section.translation.set",
      id: "missing",
      locale: "fr",
      title: "No",
    },
    { type: "section.translation.remove", id: "missing", locale: "fr" },
    {
      type: "section.translation.set",
      id: "content",
      locale: "de",
      title: "No",
    },
    {
      type: "section.translation.set",
      id: "content",
      locale: "fr",
      title: "A".repeat(201),
    },
    { type: "section.translation.remove", id: "content", locale: "en" },
  ])
    expect(() => applyCommands(doc, batch([command]))).toThrow();
  expect(() => localizedSectionTitle(doc, "missing")).toThrow(
    "Section not found",
  );
  expect(() =>
    validateDocument({
      ...doc,
      sections: {
        ...doc.sections,
        content: { ...doc.sections.content, titleTranslations: { en: "No" } },
      },
    }),
  ).toThrow();
  expect(() =>
    validateDocument({
      ...visualDocument(),
      sections: {
        ...doc.sections,
        content: { ...doc.sections.content, titleTranslations: { fr: "No" } },
      },
    }),
  ).toThrow();
  expect(() =>
    applyCommand(visualDocument(), {
      type: "section.translation.remove",
      id: "content",
      locale: "en",
    }),
  ).toThrow();
});
