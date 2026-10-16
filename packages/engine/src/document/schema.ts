import { z } from "zod";

export const idSchema = z.string().regex(/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,99}$/);
export const textSchema = z.string().max(20000);
export const blockSchema = z.strictObject({
  id: idSchema,
  kind: z.enum(["heading", "text", "subtitle", "meta", "bullet"]),
  text: textSchema,
});
export const sectionSchema = z.strictObject({
  id: idSchema,
  title: z.string().max(200),
  blockIds: z.array(idSchema).max(200),
});
export const styleSchema = z.strictObject({
  accent: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  font: z.enum(["sans", "serif"]),
  fontSize: z.number().min(10).max(16),
  spacing: z.number().min(12).max(40),
});
export const documentSchema = z.strictObject({
  schemaVersion: z.literal(1),
  id: idSchema,
  name: z.string().trim().min(1).max(120),
  sectionIds: z.array(idSchema).max(50),
  sections: z.record(idSchema, sectionSchema),
  blocks: z.record(idSchema, blockSchema),
  style: styleSchema,
});
export type Document = z.infer<typeof documentSchema>;
export type Block = z.infer<typeof blockSchema>;
export type Section = z.infer<typeof sectionSchema>;

export class EngineError extends Error {
  constructor(
    public code: "INVALID_INPUT" | "NOT_FOUND" | "CONFLICT" | "INVALID_VERSION",
    message: string,
  ) {
    super(message);
    this.name = "EngineError";
  }
}
export function parse<T>(schema: z.ZodType<T>, input: unknown): T {
  const result = schema.safeParse(input);
  if (!result.success)
    throw new EngineError(
      "INVALID_INPUT",
      result.error.issues
        .map((i) => `${i.path.join(".") || "input"}: ${i.message}`)
        .join("; "),
    );
  return result.data;
}
export function assertInvariants(doc: Document): void {
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
