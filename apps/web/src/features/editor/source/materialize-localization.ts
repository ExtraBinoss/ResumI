import type { Block, Document, Layer, Section } from "@resumi/engine";

type BlockMatch = { original?: Block; locale?: string };
const unchanged = "Your original resume is unchanged.";
const translated = (block: Block) =>
  Object.keys(block.translations ?? {}).length > 0;

/** Match a rendered snapshot without silently discarding any saved language. */
export function materializationLocalization(document: Document) {
  const blocks = Object.values(document.blocks);
  const sections = Object.values(document.sections);
  const usedBlocks = new Set<string>();
  const usedSections = new Set<string>();
  const base = document.localization?.baseLocale ?? "en";
  const active = document.localization?.activeLocale ?? base;

  function block(
    text: string,
    originalId?: string,
    kind?: Block["kind"],
  ): BlockMatch {
    const compatible = (candidate: Block) =>
      !usedBlocks.has(candidate.id) &&
      (!kind ||
        ["image", "shape"].includes(kind) ===
          ["image", "shape"].includes(candidate.kind));
    const explicit = originalId
      ? blocks.find(
          (candidate) => candidate.id === originalId && compatible(candidate),
        )
      : undefined;
    const matches = explicit
      ? [explicit]
      : blocks.filter(
          (candidate) =>
            compatible(candidate) &&
            (candidate.text === text ||
              Object.values(candidate.translations ?? {}).some(
                (variant) => variant.text === text,
              )),
        );
    if (matches.length > 1 && matches.some(translated))
      throw new Error(
        `Cannot safely match translated text “${text.slice(0, 80)}” to a unique block. ${unchanged}`,
      );
    const original = matches[0];
    if (!original) return {};
    usedBlocks.add(original.id);
    if (original.text === text) return { original, locale: base };
    const locales = Object.entries(original.translations ?? {})
      .filter(([, variant]) => variant.text === text)
      .map(([locale]) => locale);
    if (locales.includes(active)) return { original, locale: active };
    if (locales.length > 1)
      throw new Error(
        `Cannot safely identify the language of block “${original.id}”. ${unchanged}`,
      );
    return { original, locale: locales[0] ?? active };
  }

  function section(title: string, originalId?: string): Section | undefined {
    const explicit = originalId
      ? sections.find(
          (candidate) =>
            candidate.id === originalId && !usedSections.has(candidate.id),
        )
      : undefined;
    const matches = explicit
      ? [explicit]
      : sections.filter(
          (candidate) =>
            !usedSections.has(candidate.id) &&
            (candidate.title === title ||
              Object.values(candidate.titleTranslations ?? {}).includes(title)),
        );
    if (
      matches.length > 1 &&
      matches.some(
        (candidate) => Object.keys(candidate.titleTranslations ?? {}).length,
      )
    )
      throw new Error(
        `Cannot safely match translated section “${title}”. ${unchanged}`,
      );
    const original = matches[0];
    if (original) usedSections.add(original.id);
    return original;
  }

  function content(
    match: BlockMatch,
    text: string,
    design: Layer,
    section?: Section,
  ) {
    const { original, locale } = match;
    if (!original) {
      if (
        design.type === "text" &&
        section &&
        (section.title === text ||
          Object.values(section.titleTranslations ?? {}).includes(text))
      ) {
        return {
          text: section.title,
          design: text === section.title ? design : { ...design, marks: [] },
          ...(section.titleTranslations
            ? {
                translations: Object.fromEntries(
                  Object.entries(section.titleTranslations).map(
                    ([locale, title]) => [locale, { text: title, marks: [] }],
                  ),
                ),
              }
            : {}),
        };
      }
      return { text, design };
    }
    if (locale === base)
      return {
        text,
        design,
        ...(original.translations
          ? { translations: original.translations }
          : {}),
      };
    return {
      text: original.text,
      design:
        design.type === "text"
          ? {
              ...design,
              marks:
                original.design?.type === "text" ? original.design.marks : [],
            }
          : design,
      translations: {
        ...original.translations,
        [locale!]: { text, marks: design.type === "text" ? design.marks : [] },
      },
    };
  }

  function assertPreserved() {
    const lostBlock = blocks.find(
      (candidate) => translated(candidate) && !usedBlocks.has(candidate.id),
    );
    if (lostBlock)
      throw new Error(
        `Cannot preserve translations for block “${lostBlock.id}”: no unique rendered match. ${unchanged}`,
      );
    const lostSection = sections.find(
      (candidate) =>
        Object.keys(candidate.titleTranslations ?? {}).length &&
        !usedSections.has(candidate.id),
    );
    if (lostSection)
      throw new Error(
        `Cannot preserve translated titles for section “${lostSection.id}”: no unique rendered match. ${unchanged}`,
      );
  }
  return { block, section, content, assertPreserved };
}
