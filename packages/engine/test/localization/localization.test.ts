import { expect, test } from "bun:test";
import {
  applyCommand,
  applyCommands,
  createSession,
  execute,
  undo,
  redo,
  serializeDocument,
  deserializeDocument,
  duplicateDocument,
  documentLocale,
  localizedBlock,
  validateDocument,
} from "../../src";
import { visualDocument, batch, deepFreeze } from "../canvas/fixtures";

const french = () =>
  applyCommands(
    visualDocument(),
    batch([
      { type: "locale.add", code: "fr", name: "Français" },
      { type: "locale.activate", code: "fr" },
    ]),
  ).document;
test("language commands preserve base text, canonical history and serialized translations", () => {
  const original = deepFreeze(visualDocument());
  expect(documentLocale(original)).toBe("en");
  expect(localizedBlock(original, "a")).toBe(original.blocks.a);
  let session = createSession(original);
  session = execute(
    session,
    batch([
      { type: "locale.add", code: "fr", name: "Français" },
      { type: "locale.activate", code: "fr" },
    ]),
  );
  expect(localizedBlock(session.document, "a").text).toBe("Sample a");
  const before = session.document;
  session = execute(
    session,
    batch([
      { type: "block.update", id: "a", patch: { text: "Bonjour" } },
      {
        type: "text.range.format",
        id: "a",
        markId: "bold-fr",
        start: 0,
        end: 3,
        style: { fontWeight: 700 },
      },
    ]),
  );
  expect(session.document.blocks.a.text).toBe("Sample a");
  const block = localizedBlock(session.document, "a");
  expect(block.text).toBe("Bonjour");
  expect(
    block.design?.type === "text" && block.design.marks[0]?.fontWeight,
  ).toBe(700);
  expect(localizedBlock(session.document, "a")).toBe(block);
  expect(localizedBlock(session.document, "b")).toBe(before.blocks.b);
  expect(undo(session).document).toBe(before);
  expect(redo(undo(session)).document).toBe(session.document);
  const loaded = deserializeDocument(serializeDocument(session.document));
  expect(localizedBlock(loaded, "a").text).toBe("Bonjour");
  const english = applyCommand(loaded, { type: "locale.activate", code: "en" });
  expect(localizedBlock(english, "a").text).toBe("Sample a");
  let id = 0;
  const copy = duplicateDocument(loaded, "copy", () => `copy-${++id}`);
  expect(
    localizedBlock(copy, copy.sections[copy.sectionIds[0]].blockIds[0]).text,
  ).toBe("Bonjour");
  expect(original.blocks.a.translations).toBeUndefined();
});
test("explicit agent translations, range marks, removal, rename and base edits share validation", () => {
  let doc = french();
  doc = applyCommand(doc, {
    type: "translation.set",
    id: "a",
    locale: "fr",
    text: "Salut toi",
    marks: [{ id: "italic", start: 0, end: 5, fontStyle: "italic" }],
  });
  doc = applyCommand(doc, {
    type: "block.update",
    id: "a",
    patch: { text: "Oh Salut toi" },
  });
  expect(doc.blocks.a.translations?.fr.marks[0].start).toBe(3);
  doc = applyCommand(doc, {
    type: "text.mark.remove",
    id: "a",
    markId: "italic",
  });
  expect(doc.blocks.a.translations?.fr.marks).toEqual([]);
  doc = applyCommand(doc, {
    type: "locale.update",
    code: "fr",
    nextCode: "fr-CA",
    name: "Français canadien",
  });
  expect(documentLocale(doc)).toBe("fr-CA");
  expect(doc.blocks.a.translations?.fr).toBeUndefined();
  expect(localizedBlock(doc, "a").text).toBe("Oh Salut toi");
  doc = applyCommand(doc, {
    type: "locale.update",
    code: "fr-CA",
    name: "French",
  });
  doc = applyCommand(doc, {
    type: "translation.remove",
    id: "a",
    locale: "fr-CA",
  });
  expect(localizedBlock(doc, "a").text).toBe("Sample a");
  doc = applyCommand(doc, {
    type: "locale.update",
    code: "en",
    nextCode: "de",
    name: "Deutsch",
  });
  expect(doc.localization?.baseLocale).toBe("de");
  doc = applyCommand(doc, {
    type: "translation.set",
    id: "a",
    locale: "de",
    text: "Hallo",
  });
  expect(doc.blocks.a.text).toBe("Hallo");
  doc = applyCommand(doc, { type: "locale.remove", code: "fr-CA" });
  expect(documentLocale(doc)).toBe("de");
  expect(doc.localization?.locales).toEqual([{ code: "de", name: "Deutsch" }]);
});
test("language mutations reject malformed languages, unknown blocks, collisions, locked edits and invalid marks atomically", () => {
  const doc = deepFreeze(french());
  for (const command of [
    { type: "locale.add", code: "fr", name: "Duplicate" },
    { type: "locale.add", code: "<script>", name: "Bad" },
    { type: "locale.activate", code: "es" },
    { type: "locale.remove", code: "en" },
    { type: "locale.update", code: "fr", nextCode: "en", name: "Duplicate" },
    { type: "translation.remove", id: "a", locale: "en" },
    { type: "translation.set", id: "missing", locale: "fr", text: "Missing" },
    {
      type: "translation.set",
      id: "a",
      locale: "fr",
      text: "A",
      marks: [{ id: "bad", start: 0, end: 2 }],
    },
  ])
    expect(() => applyCommands(doc, batch([command]))).toThrow();
  expect(() => localizedBlock(doc, "missing")).toThrow("Block not found");
  expect(() =>
    validateDocument({
      ...doc,
      localization: { ...doc.localization, activeLocale: "es" },
    }),
  ).toThrow();
  expect(() =>
    validateDocument({
      ...doc,
      localization: {
        ...doc.localization,
        locales: [
          { code: "en", name: "English" },
          { code: "en", name: "Duplicate" },
        ],
      },
    }),
  ).toThrow();
  expect(() =>
    validateDocument({
      ...doc,
      blocks: {
        ...doc.blocks,
        a: { ...doc.blocks.a, translations: { en: { text: "No", marks: [] } } },
      },
    }),
  ).toThrow();
  expect(() =>
    validateDocument({
      ...visualDocument(),
      blocks: {
        ...doc.blocks,
        a: { ...doc.blocks.a, translations: { fr: { text: "No", marks: [] } } },
      },
    }),
  ).toThrow();
  const shape = applyCommand(doc, {
    type: "block.create",
    sectionId: "content",
    block: { id: "shape", kind: "shape", text: "" },
  });
  expect(() =>
    applyCommand(shape, {
      type: "translation.set",
      id: "shape",
      locale: "fr",
      text: "No",
    }),
  ).toThrow("Only text");
  const locked = applyCommand(doc, {
    type: "layer.update",
    ids: ["a"],
    patch: { locked: true },
  });
  expect(() =>
    applyCommand(locked, {
      type: "translation.set",
      id: "a",
      locale: "fr",
      text: "Non",
    }),
  ).toThrow();
  expect(doc.blocks.a.translations).toBeUndefined();
});
test("removing a language purges its variants and formatting creates independent fallback marks", () => {
  let doc = french();
  doc = applyCommand(doc, {
    type: "text.range.format",
    id: "b",
    markId: "translated",
    start: 0,
    end: 6,
    style: { underline: true },
  });
  expect(doc.blocks.b.translations?.fr.text).toBe("Sample b");
  expect(
    doc.blocks.b.design?.type === "text" && doc.blocks.b.design.marks,
  ).toEqual([]);
  expect(() =>
    applyCommand(doc, {
      type: "text.range.format",
      id: "b",
      markId: "bad",
      start: 0,
      end: 100,
      style: {},
    }),
  ).toThrow();
  doc = applyCommand(doc, { type: "locale.remove", code: "fr" });
  expect(doc.blocks.b.translations?.fr).toBeUndefined();
  expect(documentLocale(doc)).toBe("en");
});
