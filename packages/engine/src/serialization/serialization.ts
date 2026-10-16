import {
  EngineError,
  validateDocument,
  type Document,
} from "../document/schema";
import { MAX_DOCUMENT_FILE_BYTES, utf8ByteLength } from "../document/limits";

/** Version 0 was the early ResumI title-based schema, not the unrelated Vue V1. */
export function migrateDocument(input: unknown): Document {
  if (typeof input !== "object" || input === null || Array.isArray(input))
    throw new EngineError("INVALID_INPUT", "Expected a document object.");
  if (
    "schemaVersion" in input &&
    input.schemaVersion === 0 &&
    "title" in input
  ) {
    const { title, ...rest } = input;
    return validateDocument({ ...rest, schemaVersion: 1, name: title });
  }
  if (!("schemaVersion" in input) || input.schemaVersion !== 1)
    throw new EngineError(
      "INVALID_VERSION",
      "Unsupported document version. Expected schemaVersion 1.",
    );
  return validateDocument(input);
}
export function serializeDocument(document: Document): string {
  return JSON.stringify(validateDocument(document), null, 2);
}
export function deserializeDocument(json: string): Document {
  if (
    json.length > MAX_DOCUMENT_FILE_BYTES ||
    utf8ByteLength(json) > MAX_DOCUMENT_FILE_BYTES
  )
    throw new EngineError("INVALID_INPUT", "Document file exceeds 16 MB.");
  let input: unknown;
  try {
    input = JSON.parse(json);
  } catch {
    throw new EngineError("INVALID_INPUT", "Invalid JSON document.");
  }
  return migrateDocument(input);
}
export function duplicateDocument(
  doc: Document,
  id: string,
  nextId: () => string,
): Document {
  const sections: Document["sections"] = {},
    blocks: Document["blocks"] = {};
  const mapping = new Map<string, string>();
  const sectionIds = doc.sectionIds.map((oldId) => {
    const sectionId = nextId();
    const old = doc.sections[oldId];
    const blockIds = old.blockIds.map((blockId) => {
      const newId = nextId();
      mapping.set(blockId, newId);
      blocks[newId] = { ...doc.blocks[blockId], id: newId };
      return newId;
    });
    sections[sectionId] = { ...old, id: sectionId, blockIds };
    return sectionId;
  });
  return validateDocument({
    ...doc,
    id,
    name: `${doc.name.slice(0, 113)} (copy)`,
    ...(doc.canvas
      ? {
          canvas: {
            ...doc.canvas,
            order: doc.canvas.order.map((id) => mapping.get(id)!),
            groups: doc.canvas.groups.map((group) => ({
              ...group,
              id: nextId(),
              elementIds: group.elementIds.map((id) => mapping.get(id)!),
            })),
          },
        }
      : {}),
    sectionIds,
    sections,
    blocks,
  });
}
