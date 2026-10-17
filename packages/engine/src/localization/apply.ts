import type { Document } from "../document/schema";
import { EngineError } from "../validation";
import { requireUnlocked } from "../canvas/groups";
import {
  writeLocalizedSectionTitle,
  removeSectionTitleTranslation,
  rekeySectionTranslations,
} from "./sections";
import { defaultLocalization, writeLocalizedText } from "./document";
import type { LocaleCommand } from "./schema";

export function applyLocale(doc: Document, command: LocaleCommand): Document {
  const localization = doc.localization ?? defaultLocalization;
  const code = "code" in command ? command.code : command.locale;
  const exists = localization.locales.some((locale) => locale.code === code);
  if (command.type === "locale.add") {
    if (exists)
      throw new EngineError("CONFLICT", `Language already exists: ${code}`);
    return {
      ...doc,
      localization: {
        ...localization,
        locales: [...localization.locales, { code, name: command.name }],
      },
    };
  }
  if (!exists)
    throw new EngineError("NOT_FOUND", `Language not found: ${code}`);
  if (command.type === "locale.activate")
    return { ...doc, localization: { ...localization, activeLocale: code } };
  if (command.type === "section.translation.set")
    return writeLocalizedSectionTitle(
      doc,
      command.id,
      command.title,
      command.locale,
    );
  if (command.type === "section.translation.remove")
    return removeSectionTitleTranslation(doc, command.id, command.locale);
  if (command.type === "translation.set") {
    requireUnlocked(doc, [command.id]);
    return writeLocalizedText(
      doc,
      command.id,
      command.text,
      command.marks,
      command.locale,
    );
  }
  if (command.type === "translation.remove") {
    requireUnlocked(doc, [command.id]);
    if (code === localization.baseLocale)
      throw new EngineError(
        "CONFLICT",
        "Base text cannot be removed as a translation.",
      );
    const block = doc.blocks[command.id];
    const translations = { ...block.translations };
    delete translations[code];
    return {
      ...doc,
      blocks: { ...doc.blocks, [block.id]: { ...block, translations } },
    };
  }
  if (command.type === "locale.remove" && code === localization.baseLocale)
    throw new EngineError("CONFLICT", "The base language cannot be removed.");
  const nextCode =
    command.type === "locale.update" ? (command.nextCode ?? code) : undefined;
  if (
    nextCode &&
    nextCode !== code &&
    localization.locales.some((locale) => locale.code === nextCode)
  )
    throw new EngineError("CONFLICT", `Language already exists: ${nextCode}`);
  const blocks = { ...doc.blocks };
  for (const [id, block] of Object.entries(blocks)) {
    if (!block.translations?.[code]) continue;
    const translations = { ...block.translations };
    if (nextCode) translations[nextCode] = translations[code];
    if (nextCode !== code) delete translations[code];
    blocks[id] = { ...block, translations };
  }
  return {
    ...doc,
    blocks,
    sections: rekeySectionTranslations(doc, code, nextCode),
    localization: {
      ...localization,
      baseLocale:
        localization.baseLocale === code ? nextCode! : localization.baseLocale,
      activeLocale:
        localization.activeLocale === code
          ? (nextCode ?? localization.baseLocale)
          : localization.activeLocale,
      locales:
        command.type === "locale.update"
          ? localization.locales.map((locale) =>
              locale.code === code
                ? { code: nextCode!, name: command.name }
                : locale,
            )
          : localization.locales.filter((locale) => locale.code !== code),
    },
  };
}
