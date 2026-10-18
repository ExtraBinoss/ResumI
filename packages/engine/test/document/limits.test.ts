import { expect, test } from "bun:test";
import {
  MAX_DOCUMENT_CONTENT_BYTES,
  MAX_DOCUMENT_FILE_BYTES,
  documentByteLength,
  utf8ByteLength,
  validateDocument,
  serializeDocument,
  deserializeDocument,
  applyCommand,
} from "../../src";
import { visualDocument } from "../canvas/fixtures";

function largeDocument(targetBytes: number) {
  const doc = visualDocument();
  doc.canvas!.fonts = Array.from({ length: 9 }, (_, index) => ({
    id: `font-${index}`,
    name: `Synthetic font ${index}`,
    format: "woff2" as const,
    dataUrl: `data:font/woff2;base64,${"A".repeat(1_300_000)}`,
  }));
  let remaining = targetBytes - documentByteLength(doc);
  for (const font of doc.canvas!.fonts) {
    const added = Math.min(remaining, 1_500_000 - font.dataUrl.length);
    font.dataUrl += "A".repeat(added);
    remaining -= added;
  }
  expect(remaining).toBe(0);
  return doc;
}

test("UTF-8 and canonical JSON accounting include Unicode, escapes and indentation exactly", () => {
  for (const text of [
    "",
    "ASCII",
    "é漢字🙂",
    "\uD800",
    "\uDC00",
    'A\r\n\t\b\f\u0000"\\\u2028',
  ]) {
    expect(utf8ByteLength(text)).toBe(new Blob([text]).size);
    const doc = visualDocument();
    doc.blocks.a.text = text;
    doc.source = {
      format: "html",
      code: `<style>body{color:red}</style>${text}`,
    };
    doc.blocks.a.design!.name = text;
    expect(documentByteLength(doc)).toBe(
      new Blob([JSON.stringify(doc, null, 2)]).size,
    );
    expect(documentByteLength(doc)).toBe(
      new Blob([serializeDocument(doc)]).size,
    );
  }
  const doc = visualDocument();
  documentByteLength(doc);
  doc.blocks.a.text = "🦄".repeat(20);
  expect(documentByteLength(doc)).toBe(
    new Blob([JSON.stringify(doc, null, 2)]).size,
  );
});

test("a document at the shared content budget round-trips with embedded assets", () => {
  const doc = validateDocument(largeDocument(MAX_DOCUMENT_CONTENT_BYTES));
  const json = serializeDocument(doc);
  expect(new Blob([json]).size).toBe(MAX_DOCUMENT_CONTENT_BYTES);
  expect(new Blob([json]).size).toBeLessThan(MAX_DOCUMENT_FILE_BYTES);
  expect(deserializeDocument(json)).toEqual(doc);
  // The extra file allowance accepts harmless surrounding whitespace.
  const padded =
    json + " ".repeat(MAX_DOCUMENT_FILE_BYTES - MAX_DOCUMENT_CONTENT_BYTES);
  expect(deserializeDocument(padded).canvas?.fonts).toHaveLength(9);
  expect(() => deserializeDocument(padded + " ")).toThrow("16 MB");
});

test("global budget rejects oversized valid assets or text and failed commands stay atomic", () => {
  const doc = largeDocument(MAX_DOCUMENT_CONTENT_BYTES + 1);
  expect(() => validateDocument(doc)).toThrow("12 MB budget");
  const allowed = validateDocument(
    largeDocument(MAX_DOCUMENT_CONTENT_BYTES - 500),
  );
  const before = allowed.blocks.a.text;
  expect(() =>
    applyCommand(allowed, {
      type: "block.update",
      id: "a",
      patch: { text: "\u0000".repeat(200) },
    }),
  ).toThrow("12 MB budget");
  expect(allowed.blocks.a.text).toBe(before);
  expect(() =>
    applyCommand(allowed, {
      type: "source.set",
      source: { format: "react", code: "x".repeat(200_000) },
    }),
  ).toThrow("12 MB budget");
  expect(allowed.source).toBeUndefined();
});

test("file limits count UTF-8 bytes, not JavaScript string length", () => {
  const oversized = "é".repeat(MAX_DOCUMENT_FILE_BYTES / 2 + 1);
  expect(oversized.length).toBeLessThan(MAX_DOCUMENT_FILE_BYTES);
  expect(() => deserializeDocument(oversized)).toThrow("16 MB");
});
