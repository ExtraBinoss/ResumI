import type { Block, Document } from "../document/schema";
import { EngineError } from "../validation";
import { updateTextPreservingMarks } from "../canvas/marks";
import type { TextMark } from "../canvas/marks";

export const defaultLocalization = {
  baseLocale: "en",
  activeLocale: "en",
  locales: [{ code: "en", name: "English" }],
};
export function documentLocale(doc: Document): string {
  return doc.localization?.activeLocale ?? "en";
}
/** A projection of one block, with identity cached by block and locale. Never another document. */
const resolved = new WeakMap<Block, Map<string, Block>>();
export function localizedBlock(doc: Document, id: string): Block {
  const block = doc.blocks[id],
    locale = documentLocale(doc);
  if (!block) throw new EngineError("NOT_FOUND", `Block not found: ${id}`);
  const translation = block.translations?.[locale];
  if (!translation || locale === doc.localization?.baseLocale) return block;
  let variants = resolved.get(block);
  if (!variants) {
    variants = new Map();
    resolved.set(block, variants);
  }
  let result = variants.get(locale);
  if (!result) {
    result = {
      ...block,
      text: translation.text,
      ...(block.design?.type === "text"
        ? { design: { ...block.design, marks: translation.marks } }
        : {}),
    };
    variants.set(locale, result);
  }
  return result;
}
export function writeLocalizedText(
  doc: Document,
  id: string,
  text: string,
  marks?: TextMark[],
  locale = documentLocale(doc),
): Document {
  const block = doc.blocks[id];
  if (!block) throw new EngineError("NOT_FOUND", `Block not found: ${id}`);
  if (block.kind === "image" || block.kind === "shape")
    throw new EngineError(
      "INVALID_INPUT",
      "Only text blocks can be translated.",
    );
  const base = !doc.localization || locale === doc.localization.baseLocale;
  const prior = base ? undefined : block.translations?.[locale];
  const previousText = prior?.text ?? block.text;
  const previousMarks =
    prior?.marks ?? (block.design?.type === "text" ? block.design.marks : []);
  const nextMarks =
    marks ?? updateTextPreservingMarks(previousText, text, previousMarks);
  const next = base
    ? {
        ...block,
        text,
        ...(block.design?.type === "text"
          ? { design: { ...block.design, marks: nextMarks } }
          : {}),
      }
    : {
        ...block,
        translations: {
          ...block.translations,
          [locale]: { text, marks: nextMarks },
        },
      };
  return { ...doc, blocks: { ...doc.blocks, [id]: next } };
}
export function assertLocalization(doc: Document): void {
  const localization = doc.localization;
  const codes = localization?.locales.map((locale) => locale.code) ?? [];
  if (
    localization &&
    (new Set(codes).size !== codes.length ||
      !codes.includes(localization.baseLocale) ||
      !codes.includes(localization.activeLocale))
  )
    throw new EngineError(
      "INVALID_INPUT",
      "Languages must be unique and contain the active and base languages.",
    );
  for (const section of Object.values(doc.sections)) {
    if (
      Object.keys(section.titleTranslations ?? {}).some(
        (locale) =>
          !localization ||
          !codes.includes(locale) ||
          locale === localization.baseLocale,
      )
    )
      throw new EngineError(
        "INVALID_INPUT",
        "Section translations require a non-base document language.",
      );
  }
  for (const block of Object.values(doc.blocks)) {
    for (const [locale, translation] of Object.entries(
      block.translations ?? {},
    )) {
      if (
        !localization ||
        !codes.includes(locale) ||
        locale === localization.baseLocale ||
        ["image", "shape"].includes(block.kind)
      )
        throw new EngineError(
          "INVALID_INPUT",
          "Translations require a non-base document language and a text block.",
        );
      if (
        new Set(translation.marks.map((mark) => mark.id)).size !==
          translation.marks.length ||
        translation.marks.some(
          (mark) =>
            mark.end <= mark.start || mark.end > translation.text.length,
        )
      )
        throw new EngineError(
          "INVALID_INPUT",
          `Invalid translated text ranges for ${block.id}.`,
        );
    }
  }
}
