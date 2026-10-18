import { batchSchema } from "@resumi/engine";
import { toJSONSchema } from "zod/mini";
export const commandContract = toJSONSchema(batchSchema);
