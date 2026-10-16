import * as z from "zod/mini";
import en from "zod/v4/locales/en.js";
z.config(en());
export const idSchema = z
  .string()
  .check(z.regex(/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,99}$/));
export const textSchema = z.string().check(z.maxLength(20000));
export class EngineError extends Error {
  constructor(
    public code: "INVALID_INPUT" | "NOT_FOUND" | "CONFLICT" | "INVALID_VERSION",
    message: string,
  ) {
    super(message);
    this.name = "EngineError";
  }
}
export function parse<T>(schema: z.ZodMiniType<T>, input: unknown): T {
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
