import { batchSchema, execute, parse, type Session } from "@resumi/engine";
import { z } from "zod";

export const commandContract = z.toJSONSchema(batchSchema);
export function parseProposal(json: string) {
  if (json.length > 200000) throw new Error("Command proposal exceeds 200 KB.");
  return parse(batchSchema, JSON.parse(json));
}
/** Transport-free preview. Nothing is committed until the caller accepts the returned session. */
export function previewProposal(session: Session, json: string) {
  const batch = parseProposal(json);
  const next = execute(session, batch);
  return {
    session: next,
    baseDocument: session.document,
    batch,
    changedBlocks: Object.keys(next.document.blocks).filter(
      (id) => next.document.blocks[id] !== session.document.blocks[id],
    ),
  };
}
