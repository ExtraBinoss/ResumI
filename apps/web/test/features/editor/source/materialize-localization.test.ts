import { describe, expect, test } from "bun:test";
import { makeLayer, type Document } from "@resumi/engine";
import { materializationLocalization } from "../../../../src/features/editor/source/materialize-localization";

function fixture(): Document {
  return {
    schemaVersion: 1,
    id: "document",
    name: "Synthetic languages",
    style: { accent: "#112233", font: "sans", fontSize: 12, spacing: 24 },
    localization: {
      baseLocale: "en",
      activeLocale: "fr",
      locales: [
        { code: "en", name: "English" },
        { code: "fr", name: "Français" },
        { code: "de", name: "Deutsch" },
      ],
    },
    sectionIds: ["section"],
    sections: {
      section: {
        id: "section",
        title: "Experience",
        titleTranslations: { fr: "Expérience", de: "Erfahrung" },
        blockIds: ["block"],
      },
    },
    blocks: {
      block: {
        id: "block",
        kind: "text",
        text: "Engineer",
        design: makeLayer("text"),
        translations: {
          fr: { text: "Ingénieur", marks: [] },
          de: { text: "Ingenieur", marks: [] },
        },
      },
    },
  };
}
const design = makeLayer("text", {
  marks: [{ id: "captured", start: 0, end: 3, fontWeight: 700 }],
});

describe("materialization language preservation", () => {
  test("raw base source keeps every translation with another language active", () => {
    const doc = fixture(),
      resolver = materializationLocalization(doc);
    const match = resolver.block("Engineer");
    const result = resolver.content(match, "Engineer", design);
    expect(match.original?.id).toBe("block");
    expect(result.text).toBe("Engineer");
    expect(result.translations).toBe(doc.blocks.block.translations);
    expect(result.design).toBe(design);
    expect(
      doc.blocks.block.design?.type === "text" && doc.blocks.block.design.marks,
    ).toEqual([]);
  });
  test("raw translated source updates only that language's marks", () => {
    const doc = fixture(),
      resolver = materializationLocalization(doc);
    const result = resolver.content(
      resolver.block("Ingenieur"),
      "Ingenieur",
      design,
    );
    expect(result.text).toBe("Engineer");
    expect(result.translations?.de.marks).toEqual(
      design.type === "text" ? design.marks : [],
    );
    expect(result.translations?.fr).toBe(doc.blocks.block.translations?.fr);
    expect(result.design.type === "text" && result.design.marks).toEqual([]);
  });
  test("explicit ID with changed text edits the active locale", () => {
    const resolver = materializationLocalization(fixture());
    const result = resolver.content(
      resolver.block("Nouvelle fonction", "block"),
      "Nouvelle fonction",
      design,
    );
    expect(result.text).toBe("Engineer");
    expect(result.translations?.fr.text).toBe("Nouvelle fonction");
    expect(result.translations?.de.text).toBe("Ingenieur");
  });
  test("explicit ID still recognizes unchanged base text", () => {
    const doc = fixture(),
      resolver = materializationLocalization(doc);
    expect(
      resolver.content(resolver.block("Engineer", "block"), "Engineer", design)
        .translations,
    ).toBe(doc.blocks.block.translations);
  });
  test("ambiguous translated blocks refuse instead of picking the first", () => {
    const doc = fixture();
    doc.blocks.other = { ...doc.blocks.block, id: "other" };
    expect(() => materializationLocalization(doc).block("Engineer")).toThrow(
      "unique block",
    );
    expect(
      materializationLocalization(doc).block("Engineer", "block").original?.id,
    ).toBe("block");
  });
  test("unmatched translated blocks refuse final publication", () => {
    const resolver = materializationLocalization(fixture());
    resolver.block("Unknown source text");
    expect(() => resolver.assertPreserved()).toThrow("block “block”");
  });
  test("translated sections match any variant and retain all titles", () => {
    const doc = fixture(),
      resolver = materializationLocalization(doc);
    expect(resolver.section("Erfahrung")).toBe(doc.sections.section);
    resolver.block("Engineer");
    expect(() => resolver.assertPreserved()).not.toThrow();
  });
  test("unmatched translated titles refuse final publication", () => {
    const resolver = materializationLocalization(fixture());
    resolver.block("Engineer");
    expect(() => resolver.assertPreserved()).toThrow("section “section”");
  });
  test("ambiguous translated sections require explicit identity", () => {
    const doc = fixture();
    doc.sections.other = { ...doc.sections.section, id: "other" };
    expect(() =>
      materializationLocalization(doc).section("Experience"),
    ).toThrow("translated section");
    expect(
      materializationLocalization(doc).section("Custom title", "section")?.id,
    ).toBe("section");
  });
  for (const title of ["Experience", "Expérience"]) {
    test(`section caption from ${title} projects every title language`, () => {
      const doc = fixture(),
        resolver = materializationLocalization(doc);
      const result = resolver.content({}, title, design, doc.sections.section);
      expect(result.text).toBe("Experience");
      expect(result.translations).toEqual({
        fr: { text: "Expérience", marks: [] },
        de: { text: "Erfahrung", marks: [] },
      });
      expect(result.design.type === "text" && result.design.marks).toEqual(
        title === "Experience" && design.type === "text" ? design.marks : [],
      );
      expect(design.type === "text" && design.marks).toHaveLength(1);
    });
  }
  test("section caption projection requires an exact title and a text layer", () => {
    const doc = fixture(),
      resolver = materializationLocalization(doc);
    expect(
      resolver.content({}, "Experience summary", design, doc.sections.section)
        .translations,
    ).toBeUndefined();
    expect(
      resolver.content(
        {},
        "Experience",
        makeLayer("shape"),
        doc.sections.section,
      ).translations,
    ).toBeUndefined();
  });
  test("untranslated removed content is permitted and identities cannot be reused", () => {
    const doc = fixture();
    delete doc.blocks.block.translations;
    delete doc.sections.section.titleTranslations;
    const resolver = materializationLocalization(doc);
    expect(resolver.block("Engineer").original?.id).toBe("block");
    expect(resolver.block("Engineer").original).toBeUndefined();
    expect(() => resolver.assertPreserved()).not.toThrow();
  });
});
