import { z } from "zod";
import {
  blockSchema,
  idSchema,
  sectionSchema,
  styleSchema,
} from "../document/schema";

export const commandSchema = z.discriminatedUnion("type", [
  z.strictObject({
    type: z.literal("document.update"),
    name: z.string().trim().min(1).max(120),
  }),
  z.strictObject({
    type: z.literal("style.update"),
    patch: styleSchema.partial(),
  }),
  z.strictObject({
    type: z.literal("section.create"),
    section: sectionSchema.extend({ blockIds: z.array(idSchema).length(0) }),
    index: z.number().int().min(0).optional(),
  }),
  z.strictObject({
    type: z.literal("section.update"),
    id: idSchema,
    title: z.string().max(200),
  }),
  z.strictObject({ type: z.literal("section.delete"), id: idSchema }),
  z.strictObject({
    type: z.literal("section.reorder"),
    ids: z.array(idSchema).max(50),
  }),
  z.strictObject({
    type: z.literal("block.create"),
    sectionId: idSchema,
    block: blockSchema,
    index: z.number().int().min(0).optional(),
  }),
  z.strictObject({
    type: z.literal("block.update"),
    id: idSchema,
    patch: blockSchema.omit({ id: true }).partial(),
  }),
  z.strictObject({ type: z.literal("block.delete"), id: idSchema }),
  z.strictObject({
    type: z.literal("block.reorder"),
    sectionId: idSchema,
    ids: z.array(idSchema).max(200),
  }),
]);
export const batchSchema = z.strictObject({
  version: z.literal(1),
  actor: z.strictObject({
    kind: z.enum(["human", "agent"]),
    name: z.string().trim().min(1).max(100),
  }),
  commands: z.array(commandSchema).min(1).max(100),
});
export type Command = z.infer<typeof commandSchema>;
export type CommandBatch = z.infer<typeof batchSchema>;
export type Actor = CommandBatch["actor"];
