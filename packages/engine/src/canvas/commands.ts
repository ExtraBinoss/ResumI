import * as z from "zod/mini";
import { idSchema } from "../validation";
import {
  canvasSchema,
  layerSchema,
  layerPatchSchema,
  groupFields,
  markStyleFields,
} from "./schema";
const ids = z.array(idSchema).check(z.minLength(1), z.maxLength(500));
export const referenceSchema = z.strictObject({
  kind: z.enum(["element", "group"]),
  id: idSchema,
});
export const canvasCommands = [
  z.strictObject({
    type: z.literal("canvas.enable"),
    layers: z.record(idSchema, layerSchema),
  }),
  z.strictObject({
    type: z.literal("canvas.update"),
    patch: z.partial(z.omit(canvasSchema, { order: true, groups: true })),
  }),
  z.strictObject({
    type: z.literal("layer.update"),
    ids,
    patch: layerPatchSchema,
  }),
  z.strictObject({
    type: z.literal("layer.translate"),
    ids,
    dx: z.number().check(z.minimum(-10000), z.maximum(10000)),
    dy: z.number().check(z.minimum(-10000), z.maximum(10000)),
  }),
  z.strictObject({
    type: z.literal("layer.relocate"),
    source: referenceSchema,
    target: z.optional(referenceSchema),
    placement: z.enum(["above", "below", "inside", "front", "back"]),
  }),
  z.strictObject({
    type: z.literal("layer.duplicate"),
    copies: z
      .array(z.strictObject({ id: idSchema, newId: idSchema }))
      .check(z.minLength(1), z.maxLength(100)),
    offset: z.optional(z.number().check(z.minimum(-500), z.maximum(500))),
  }),
  z.strictObject({
    type: z.literal("group.create"),
    id: idSchema,
    ids,
    name: z.string().check(z.minLength(1), z.maxLength(120)),
  }),
  z.strictObject({
    type: z.literal("group.update"),
    id: idSchema,
    patch: z.partial(z.strictObject(groupFields)),
  }),
  z.strictObject({ type: z.literal("group.ungroup"), id: idSchema }),
  z.strictObject({
    type: z.literal("text.range.format"),
    id: idSchema,
    markId: idSchema,
    start: z.int().check(z.minimum(0)),
    end: z.int().check(z.minimum(1)),
    style: z.strictObject(markStyleFields),
  }),
  z.strictObject({
    type: z.literal("text.mark.remove"),
    id: idSchema,
    markId: idSchema,
  }),
] as const;
export type CanvasCommand = z.infer<(typeof canvasCommands)[number]>;
