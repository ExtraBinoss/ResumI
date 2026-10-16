import * as z from "zod/mini";

/** Source is data. The engine never evaluates HTML, JavaScript or React. */
export const sourceSchema = z.strictObject({
  format: z.enum(["html", "react"]),
  code: z.string().check(z.maxLength(200_000)),
  enabled: z.optional(z.boolean()),
});
export const sourceCommands = [
  z.strictObject({ type: z.literal("source.set"), source: sourceSchema }),
  z.strictObject({ type: z.literal("source.clear") }),
  z.strictObject({ type: z.literal("source.activate"), enabled: z.boolean() }),
] as const;
export type DocumentSource = z.infer<typeof sourceSchema>;
export type SourceCommand = z.infer<(typeof sourceCommands)[number]>;
