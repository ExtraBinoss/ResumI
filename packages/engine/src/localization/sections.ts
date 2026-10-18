import type { Document, Section } from "../document/schema";
import { EngineError } from "../validation";
import { documentLocale } from "./document";

function requireSection(doc: Document, id: string): Section {
  const section = doc.sections[id];
  if (!section) throw new EngineError("NOT_FOUND", `Section not found: ${id}`);
  return section;
}
export function localizedSectionTitle(doc: Document, id: string): string {
  const section = requireSection(doc, id);
  return section.titleTranslations?.[documentLocale(doc)] ?? section.title;
}
const resolved = new WeakMap<Section, Map<string, Section>>();
export function localizedSection(doc: Document, id: string): Section {
  const section = requireSection(doc, id),
    title = localizedSectionTitle(doc, id);
  if (title === section.title) return section;
  let variants = resolved.get(section);
  if (!variants) {
    variants = new Map();
    resolved.set(section, variants);
  }
  let result = variants.get(documentLocale(doc));
  if (!result) {
    result = { ...section, title };
    variants.set(documentLocale(doc), result);
  }
  return result;
}
export function writeLocalizedSectionTitle(
  doc: Document,
  id: string,
  title: string,
  locale = documentLocale(doc),
): Document {
  const section = requireSection(doc, id);
  const translated = doc.localization && locale !== doc.localization.baseLocale;
  return {
    ...doc,
    sections: {
      ...doc.sections,
      [id]: translated
        ? {
            ...section,
            titleTranslations: {
              ...section.titleTranslations,
              [locale]: title,
            },
          }
        : { ...section, title },
    },
  };
}
export function removeSectionTitleTranslation(
  doc: Document,
  id: string,
  locale: string,
): Document {
  const section = requireSection(doc, id);
  if (locale === (doc.localization?.baseLocale ?? "en"))
    throw new EngineError(
      "CONFLICT",
      "The original section title cannot be removed as a translation.",
    );
  const titleTranslations = { ...section.titleTranslations };
  delete titleTranslations[locale];
  return {
    ...doc,
    sections: { ...doc.sections, [id]: { ...section, titleTranslations } },
  };
}
export function rekeySectionTranslations(
  doc: Document,
  code: string,
  nextCode?: string,
): Document["sections"] {
  const sections = { ...doc.sections };
  for (const [id, section] of Object.entries(sections)) {
    if (!Object.hasOwn(section.titleTranslations ?? {}, code)) continue;
    const titleTranslations = { ...section.titleTranslations };
    if (nextCode) titleTranslations[nextCode] = titleTranslations[code];
    if (nextCode !== code) delete titleTranslations[code];
    sections[id] = { ...section, titleTranslations };
  }
  return sections;
}
