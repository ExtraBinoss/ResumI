import { expect, test } from "bun:test";
import {
  createDocument,
  serializeDocument,
  MAX_DOCUMENT_FILE_BYTES,
} from "@resumi/engine";
import { readDocumentFile } from "../../src/lib/files";

test("browser document imports share the engine file-size gate and validation", async () => {
  const doc = createDocument("synthetic-file");
  const json = serializeDocument(doc);
  expect(await readDocumentFile(new File([json], "resume.json"))).toEqual(doc);
  await expect(
    readDocumentFile(new File(["{}"], "invalid.json")),
  ).rejects.toThrow();
  const padded =
    json + " ".repeat(MAX_DOCUMENT_FILE_BYTES - new Blob([json]).size);
  expect((await readDocumentFile(new File([padded], "padded.json"))).id).toBe(
    doc.id,
  );
  await expect(
    readDocumentFile(new File([padded, " "], "too-large.json")),
  ).rejects.toThrow("16 MB");
  await expect(
    readDocumentFile(
      new File(["é".repeat(MAX_DOCUMENT_FILE_BYTES / 2 + 1)], "unicode.json"),
    ),
  ).rejects.toThrow("16 MB");
});
