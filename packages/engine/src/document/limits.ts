import type { Document } from "./schema";
import { EngineError } from "../validation";

/** Decimal bytes. Canonical exports fit within the shared import-file limit. */
export const MAX_DOCUMENT_FILE_BYTES = 16_000_000;
export const MAX_DOCUMENT_CONTENT_BYTES = 12_000_000;

/** UTF-8 bytes of a string, with the same lone-surrogate replacement as file encoding. */
export function utf8ByteLength(value: string): number {
  let bytes = 0;
  for (let index = 0; index < value.length; index++) {
    const point = value.charCodeAt(index);
    if (point < 0x80) bytes++;
    else if (point < 0x800) bytes += 2;
    else if (
      point >= 0xd800 &&
      point <= 0xdbff &&
      value.charCodeAt(index + 1) >= 0xdc00 &&
      value.charCodeAt(index + 1) <= 0xdfff
    ) {
      bytes += 4;
      index++;
    } else bytes += 3;
  }
  return bytes;
}

type Measure = { bytes: number; breaks: number };
// Weak keys retain no discarded snapshots. Comparing the actual string also
// prevents stale measurements when validating an externally modified object.
const stringSizes = new WeakMap<
  object,
  Map<string, { value: string; bytes: number }>
>();

function escapedStringBytes(owner: object, key: string, value: string): number {
  let cache = stringSizes.get(owner);
  if (!cache) {
    cache = new Map();
    stringSizes.set(owner, cache);
  }
  const prior = cache.get(key);
  if (prior?.value === value) return prior.bytes;
  const bytes = utf8ByteLength(JSON.stringify(value));
  cache.set(key, { value, bytes });
  return bytes;
}

/** Exact UTF-8 size of JSON.stringify(value, null, 2), without allocating the document JSON. */
export function documentByteLength(document: Document): number {
  function measure(value: unknown, owner: object, key: string): Measure {
    if (typeof value === "string")
      return { bytes: escapedStringBytes(owner, key, value), breaks: 0 };
    if (value === null || typeof value !== "object")
      return { bytes: String(value).length, breaks: 0 };
    const entries = Array.isArray(value)
      ? value.map((child, index) => [String(index), child] as const)
      : Object.entries(value).filter(([, child]) => child !== undefined);
    if (!entries.length) return { bytes: 2, breaks: 0 };
    let bytes = 3,
      breaks = entries.length + 1;
    entries.forEach(([entryKey, child], index) => {
      const next = measure(child, value, entryKey);
      // Opening newline + closing bracket are in the initial3. Every entry has
      // two spaces, its value, a newline and (except the last) a comma.
      bytes +=
        3 + next.bytes + 2 * next.breaks + (index < entries.length - 1 ? 1 : 0);
      if (!Array.isArray(value))
        bytes += utf8ByteLength(JSON.stringify(entryKey)) + 2;
      breaks += next.breaks;
    });
    return { bytes, breaks };
  }
  return measure(document, document, "").bytes;
}

export function assertDocumentBudget(document: Document): void {
  if (documentByteLength(document) > MAX_DOCUMENT_CONTENT_BYTES)
    throw new EngineError(
      "INVALID_INPUT",
      "Document content exceeds the 12 MB budget, including embedded assets and text.",
    );
}
