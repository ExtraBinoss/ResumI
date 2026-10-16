import * as z from "zod/mini";
import {
  blockSchema,
  idSchema,
  sectionSchema,
  styleSchema,
} from "../document/schema";

import { sourceCommands } from "../source/schema";
import { canvasCommands } from "../canvas/commands";

export const commandSchema = z.discriminatedUnion("type", [
  ...canvasCommands,
  ...sourceCommands,
  z.strictObject({
    type: z.literal("document.update"),
    name: z.string().check(z.trim(), z.minLength(1), z.maxLength(120)),
  }),
  z.strictObject({
    type: z.literal("style.update"),
    patch: z.partial(styleSchema),
  }),
  z.strictObject({
    type: z.literal("section.create"),
    section: z.extend(sectionSchema, {
      blockIds: z.array(idSchema).check(z.length(0)),
    }),
    index: z.optional(z.int().check(z.minimum(0))),
  }),
  z.strictObject({
    type: z.literal("section.update"),
    id: idSchema,
    title: z.string().check(z.maxLength(200)),
  }),
  z.strictObject({ type: z.literal("section.delete"), id: idSchema }),
  z.strictObject({
    type: z.literal("section.reorder"),
    ids: z.array(idSchema).check(z.maxLength(50)),
  }),
  z.strictObject({
    type: z.literal("block.create"),
    sectionId: idSchema,
    block: blockSchema,
    index: z.optional(z.int().check(z.minimum(0))),
  }),
  z.strictObject({
    type: z.literal("block.update"),
    id: idSchema,
    patch: z.partial(z.omit(blockSchema, { id: true })),
  }),
  z.strictObject({ type: z.literal("block.delete"), id: idSchema }),
  z.strictObject({
    type: z.literal("block.reorder"),
    sectionId: idSchema,
    ids: z.array(idSchema).check(z.maxLength(200)),
  }),
]);
export const batchSchema = z.strictObject({
  version: z.literal(1),
  actor: z.strictObject({
    kind: z.enum(["human", "agent"]),
    name: z.string().check(z.trim(), z.minLength(1), z.maxLength(100)),
  }),
  commands: z.array(commandSchema).check(z.minLength(1), z.maxLength(100)),
});
export type Command = z.infer<typeof commandSchema>;
export type CommandBatch = z.infer<typeof batchSchema>;
export type Actor = CommandBatch["actor"];
