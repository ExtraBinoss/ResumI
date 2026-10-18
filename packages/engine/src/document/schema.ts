import * as z from "zod/mini";
import { idSchema, textSchema, EngineError, parse } from "../validation";
import { layerSchema, canvasSchema } from "../canvas/schema";
import { assertLocalization } from "../localization/document";
import {
  localizationSchema,
  translationsSchema,
  sectionTitleTranslationsSchema,
} from "../localization/schema";
import { sourceSchema } from "../source/schema";
import { assertCanvas } from "../canvas/invariants";
import { assertDocumentBudget } from "./limits";
export { idSchema, textSchema, EngineError, parse } from "../validation";
export const blockSchema = z.strictObject({
  id: idSchema,
  kind: z.enum([
    "heading",
    "text",
    "subtitle",
    "meta",
    "bullet",
    "image",
    "shape",
  ]),
  text: textSchema,
  design: z.optional(layerSchema),
  translations: z.optional(translationsSchema),
});
export const sectionSchema = z.strictObject({
  id: idSchema,
  title: z.string().check(z.maxLength(200)),
  titleTranslations: z.optional(sectionTitleTranslationsSchema),
  blockIds: z.array(idSchema).check(z.maxLength(200)),
});
export const styleSchema = z.strictObject({
  accent: z.string().check(z.regex(/^#[0-9a-fA-F]{6}$/)),
  font: z.enum(["sans", "serif"]),
  fontSize: z.number().check(z.minimum(10), z.maximum(16)),
  spacing: z.number().check(z.minimum(12), z.maximum(40)),
});
export const documentSchema = z.strictObject({
  schemaVersion: z.literal(1),
  id: idSchema,
  name: z.string().check(z.trim(), z.minLength(1), z.maxLength(120)),
  sectionIds: z.array(idSchema).check(z.maxLength(50)),
  sections: z.record(idSchema, sectionSchema),
  blocks: z.record(idSchema, blockSchema),
  style: styleSchema,
  canvas: z.optional(canvasSchema),
  source: z.optional(sourceSchema),
  localization: z.optional(localizationSchema),
});
export type Document = z.infer<typeof documentSchema>;
export type Block = z.infer<typeof blockSchema>;
export type Section = z.infer<typeof sectionSchema>;

export function assertInvariants(doc: Document): void {
  assertDocumentBudget(doc);
  assertCanvas(doc);
  assertLocalization(doc);
  const sectionIds = new Set(doc.sectionIds);
  const used = new Set<string>([doc.id]);
  if (
    sectionIds.size !== doc.sectionIds.length ||
    sectionIds.size !== Object.keys(doc.sections).length
  )
    throw new EngineError(
      "INVALID_INPUT",
      "Section order must contain each section exactly once.",
    );
  for (const id of doc.sectionIds) {
    const section = doc.sections[id];
    if (!section || section.id !== id || used.has(id))
      throw new EngineError(
        "INVALID_INPUT",
        `Invalid or duplicate section ID: ${id}`,
      );
    used.add(id);
  }
  for (const section of Object.values(doc.sections)) {
    for (const id of section.blockIds) {
      if (used.has(id) || !doc.blocks[id] || doc.blocks[id].id !== id)
        throw new EngineError(
          "INVALID_INPUT",
          `Invalid or duplicate block ID: ${id}`,
        );
      used.add(id);
    }
  }
  if (used.size !== 1 + sectionIds.size + Object.keys(doc.blocks).length)
    throw new EngineError("INVALID_INPUT", "Orphan blocks are not allowed.");
}
export function validateDocument(input: unknown): Document {
  const doc = parse(documentSchema, input);
  assertInvariants(doc);
  return doc;
}
export function createDocument(id: string, name = "Untitled resume"): Document {
  return validateDocument({
    schemaVersion: 1,
    id,
    name,
    sectionIds: [],
    sections: {},
    blocks: {},
    style: { accent: "#2563eb", font: "sans", fontSize: 12, spacing: 24 },
  });
}
