import { deserializeDocument } from "@resumi/engine";

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
  if (file.size > 2_000_000) throw new Error("This file is larger than 2 MB.");
  return deserializeDocument(await file.text());
}
