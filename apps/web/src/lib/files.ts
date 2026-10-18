import { deserializeDocument, MAX_DOCUMENT_FILE_BYTES } from "@resumi/engine";

export class DocumentFileTooLargeError extends Error {
  constructor() {
    super("This file is larger than 16 MB.");
    this.name = "DocumentFileTooLargeError";
  }
}

export function downloadFile(
  name: string,
  content: string,
  type = "application/json",
) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function fileName(name: string, extension: string) {
  return `${name.replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 80)}.${extension}`;
}
export async function readDocumentFile(file: File) {
  if (file.size > MAX_DOCUMENT_FILE_BYTES)
    throw new DocumentFileTooLargeError();
  return deserializeDocument(await file.text());
}
