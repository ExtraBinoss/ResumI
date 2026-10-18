import * as z from "zod/mini";
import { idSchema, textSchema } from "../validation";
import { markSchema } from "../canvas/schema";

export const localeCodeSchema = z
  .string()
  .check(z.regex(/^[a-z]{2,3}(?:-[A-Za-z0-9]{2,8}){0,3}$/), z.maxLength(35));
const localeName = z.string().check(z.trim(), z.minLength(1), z.maxLength(60));
export const localizationSchema = z.strictObject({
  baseLocale: localeCodeSchema,
  activeLocale: localeCodeSchema,
  locales: z
    .array(z.strictObject({ code: localeCodeSchema, name: localeName }))
    .check(z.minLength(1), z.maxLength(30)),
});
export const translationSchema = z.strictObject({
  text: textSchema,
  marks: z.array(markSchema).check(z.maxLength(200)),
});
export const sectionTitleTranslationsSchema = z.record(
  localeCodeSchema,
  z.string().check(z.maxLength(200)),
);
export const translationsSchema = z.record(localeCodeSchema, translationSchema);
export const localeCommands = [
  z.strictObject({
    type: z.literal("section.translation.set"),
    id: idSchema,
    locale: localeCodeSchema,
    title: z.string().check(z.maxLength(200)),
  }),
  z.strictObject({
    type: z.literal("section.translation.remove"),
    id: idSchema,
    locale: localeCodeSchema,
  }),
  z.strictObject({
    type: z.literal("locale.add"),
    code: localeCodeSchema,
    name: localeName,
  }),
  z.strictObject({
    type: z.literal("locale.update"),
    code: localeCodeSchema,
    name: localeName,
    nextCode: z.optional(localeCodeSchema),
  }),
  z.strictObject({ type: z.literal("locale.remove"), code: localeCodeSchema }),
  z.strictObject({
    type: z.literal("locale.activate"),
    code: localeCodeSchema,
  }),
  z.strictObject({
    type: z.literal("translation.set"),
    id: idSchema,
    locale: localeCodeSchema,
    text: textSchema,
    marks: z.optional(z.array(markSchema).check(z.maxLength(200))),
  }),
  z.strictObject({
    type: z.literal("translation.remove"),
    id: idSchema,
    locale: localeCodeSchema,
  }),
] as const;
export type LocaleCommand = z.infer<(typeof localeCommands)[number]>;
