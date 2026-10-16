import type { Document } from "../document/schema";
import { EngineError } from "../validation";
import type { SourceCommand } from "./schema";

/** Source mode preserves the structured/visual document for an explicit return. */
export function applySource(
  document: Document,
  command: SourceCommand,
): Document {
  if (command.type === "source.set")
    return { ...document, source: command.source };
  if (command.type === "source.activate") {
    if (!document.source)
      throw new EngineError("NOT_FOUND", "This document has no saved source.");
    return {
      ...document,
      source: { ...document.source, enabled: command.enabled },
    };
  }
  const next = { ...document };
  delete next.source;
  return next;
}
