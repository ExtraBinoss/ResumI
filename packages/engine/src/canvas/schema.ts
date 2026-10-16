import * as z from "zod/mini";
import { idSchema, textSchema } from "../validation";
const number = (min: number, max: number) =>
  z.number().check(z.minimum(min), z.maximum(max));
export const colorSchema = z
  .string()
  .check(z.regex(/^(#[0-9a-fA-F]{6}([0-9a-fA-F]{2})?|transparent)$/));
export const fontSchema = z
  .string()
  .check(z.maxLength(160), z.regex(/^[a-zA-Z0-9 '",._-]+$/));
export const blendModes = [
  "normal",
  "multiply",
  "screen",
  "overlay",
  "darken",
  "lighten",
  "color-dodge",
  "color-burn",
  "hard-light",
  "soft-light",
  "difference",
  "exclusion",
  "hue",
  "saturation",
  "color",
  "luminosity",
] as const;
export const blendSchema = z.enum(blendModes);
export const effectsSchema = z.strictObject({
  blur: number(0, 64),
  grain: number(0, 1),
  grainSize: number(0.5, 12),
  dither: number(0, 1),
  brightness: number(0, 3),
  contrast: number(0, 3),
  saturation: number(0, 3),
});
export const gradientSchema = z.strictObject({
  type: z.literal("linear"),
  angle: number(-360, 360),
  stops: z
    .array(
      z.strictObject({
        id: idSchema,
        offset: number(0, 1),
        color: colorSchema,
      }),
    )
    .check(z.minLength(2), z.maxLength(16)),
});
export const vectorSchema = z.strictObject({
  path: z
    .string()
    .check(
      z.minLength(1),
      z.maxLength(50000),
      z.regex(/^[MmZzLlHhVvCcSsQqTtAaEe0-9.,+\s-]+$/),
    ),
  viewBox: z.string().check(z.regex(/^-?[\d.]+\s+-?[\d.]+\s+[\d.]+\s+[\d.]+$/)),
  strokeOnly: z.optional(z.boolean()),
});
export const markStyleFields = {
  href: z.optional(
    z.string().check(z.maxLength(2000), z.regex(/^(https?:|mailto:|tel:)/i)),
  ),
  color: z.optional(colorSchema),
  fontFamily: z.optional(fontSchema),
  fontSize: z.optional(number(4, 240)),
  fontWeight: z.optional(number(100, 1000)),
  fontStyle: z.optional(z.enum(["normal", "italic"])),
  underline: z.optional(z.boolean()),
  strike: z.optional(z.boolean()),
};
export const markSchema = z.strictObject({
  ...markStyleFields,
  id: idSchema,
  start: z.int().check(z.minimum(0)),
  end: z.int().check(z.minimum(1)),
});
export const baseFields = {
  name: z.string().check(z.maxLength(120)),
  x: number(-5000, 5000),
  y: number(-5000, 5000),
  width: number(1, 5000),
  height: number(1, 5000),
  rotation: number(-360, 360),
  opacity: number(0, 1),
  blendMode: blendSchema,
  locked: z.boolean(),
  hidden: z.boolean(),
  aspectLocked: z.boolean(),
};
export const textFields = {
  fontFamily: fontSchema,
  fontSize: number(4, 240),
  fontWeight: number(100, 1000),
  fontStyle: z.enum(["normal", "italic"]),
  lineHeight: number(0.7, 4),
  letterSpacing: number(-10, 40),
  align: z.enum(["left", "center", "right"]),
  color: colorSchema,
  underline: z.boolean(),
  strike: z.boolean(),
  uppercase: z.boolean(),
  marks: z.array(markSchema).check(z.maxLength(200)),
};
export const shapeFields = {
  shape: z.string().check(z.maxLength(80), z.regex(/^[a-z0-9-]+$/)),
  vector: z.optional(vectorSchema),
  fill: colorSchema,
  gradient: z.optional(z.nullable(gradientSchema)),
  stroke: colorSchema,
  strokeWidth: number(0, 100),
  borderRadius: number(0, 2500),
  effects: effectsSchema,
};
export const imageFields = {
  src: z
    .string()
    .check(
      z.maxLength(1500000),
      z.regex(/^data:image\/(png|jpeg|webp);base64,[a-zA-Z0-9+/]+=*$/),
    ),
  alt: textSchema,
  objectFit: z.enum(["cover", "contain"]),
  objectPosition: z.strictObject({ x: number(0, 100), y: number(0, 100) }),
  imageScale: number(1, 5),
  borderRadius: number(0, 2500),
  effects: effectsSchema,
};
export const layerSchema = z.discriminatedUnion("type", [
  z.strictObject({ ...baseFields, type: z.literal("text"), ...textFields }),
  z.strictObject({ ...baseFields, type: z.literal("shape"), ...shapeFields }),
  z.strictObject({ ...baseFields, type: z.literal("image"), ...imageFields }),
]);
export const layerPatchSchema = z.partial(
  z.strictObject({
    ...baseFields,
    ...textFields,
    ...shapeFields,
    ...imageFields,
  }),
);
export const groupFields = {
  name: z.string().check(z.minLength(1), z.maxLength(120)),
  opacity: number(0, 1),
  blendMode: blendSchema,
  collapsed: z.boolean(),
  locked: z.boolean(),
  hidden: z.boolean(),
};
export const groupSchema = z.strictObject({
  id: idSchema,
  elementIds: z.array(idSchema).check(z.minLength(1), z.maxLength(500)),
  ...groupFields,
});
export const canvasSchema = z.strictObject({
  width: number(100, 5000),
  height: number(100, 5000),
  background: colorSchema,
  order: z.array(idSchema).check(z.maxLength(1000)),
  groups: z.array(groupSchema).check(z.maxLength(100)),
  fonts: z
    .array(
      z.strictObject({
        id: idSchema,
        name: fontSchema,
        dataUrl: z
          .string()
          .check(
            z.maxLength(1500000),
            z.regex(
              /^data:(font\/(ttf|otf|woff|woff2)|application\/(octet-stream|font-woff));base64,[a-zA-Z0-9+/]+=*$/,
            ),
          ),
        format: z.enum(["truetype", "opentype", "woff", "woff2"]),
      }),
    )
    .check(z.maxLength(12)),
});
export type Layer = z.infer<typeof layerSchema>;
export type LayerPatch = z.infer<typeof layerPatchSchema>;
export type LayerGroup = z.infer<typeof groupSchema>;
export type Canvas = z.infer<typeof canvasSchema>;
