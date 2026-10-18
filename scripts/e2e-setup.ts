import { mkdir } from "node:fs/promises";

/** Verification outputs are generated locally, including on a fresh checkout. */
export default async function setup() {
  await Promise.all(
    [
      "artifacts/visual",
      "artifacts/rendered",
      "artifacts/performance",
      "output/pdf",
    ].map((directory) => mkdir(directory, { recursive: true })),
  );
}
