/** Text-level inspection of the actual exported PDF, using Mozilla's complete PDF parser. */
export type PdfTextItem = {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontName: string;
  direction: string;
  hasEOL: boolean;
};
export type PdfTextPage = {
  number: number;
  width: number;
  height: number;
  text: string;
  items: PdfTextItem[];
  links: string[];
};
export type PdfTextInspection = {
  pageCount: number;
  pages: PdfTextPage[];
  text: string;
  characterCount: number;
  hasText: boolean;
};
export type PdfTextOptions = { maxBytes?: number; maxPages?: number };

function pageText(items: PdfTextItem[]): string {
  let result = "",
    previous: PdfTextItem | undefined;
  for (const item of items) {
    if (previous) {
      const lineChange =
        previous.hasEOL ||
        Math.abs(item.y - previous.y) >
          Math.max(2, Math.min(item.height, previous.height) * 0.4);
      const gap = item.x - (previous.x + previous.width);
      const separator = lineChange
        ? "\n"
        : gap > Math.max(0.8, Math.min(item.height, previous.height) * 0.15)
          ? " "
          : "";
      if (separator && !/\s$/.test(result) && !/^\s/.test(item.text))
        result += separator;
    }
    result += item.text;
    previous = item;
  }
  return result.trim();
}

/**
 * No rasterization, browser print, source execution, service, or network requests.
 * The local legacy PDF.js build initializes its own local Node worker/DOMMatrix support.
 * Import this subpath lazily; it is intentionally absent from the default CV entry.
 * `text` follows PDF content-stream order, not an inferred semantic reading order;
 * `items` retain positions for diagnostics and `links` expose actual PDF annotations.
 * Selectable text is evidence for ATS readability, never universal ATS certification.
 */
export async function inspectPdfText(
  bytes: Uint8Array,
  options: PdfTextOptions = {},
): Promise<PdfTextInspection> {
  if (!(bytes instanceof Uint8Array) || !bytes.length)
    throw new Error("PDF inspection requires nonempty PDF bytes.");
  const maxBytes = options.maxBytes ?? 64_000_000,
    maxPages = options.maxPages ?? 1000;
  if (
    !Number.isSafeInteger(maxBytes) ||
    maxBytes < 1 ||
    !Number.isSafeInteger(maxPages) ||
    maxPages < 1
  )
    throw new Error("PDF inspection limits must be positive integers.");
  if (bytes.byteLength > maxBytes)
    throw new Error("PDF exceeds the text inspection byte limit.");
  const { getDocument, VerbosityLevel } =
    await import("pdfjs-dist/legacy/build/pdf.mjs");
  const task = getDocument({
    // PDF.js transfers ownership of its input. Keep the caller's download buffer intact.
    data: new Uint8Array(bytes),
    verbosity: VerbosityLevel.ERRORS,
    stopAtErrors: true,
    disableFontFace: true,
    useSystemFonts: false,
    useWorkerFetch: false,
    isOffscreenCanvasSupported: false,
    isImageDecoderSupported: false,
    enableXfa: false,
  });
  try {
    const pdf = await task.promise;
    if (pdf.numPages > maxPages)
      throw new Error("PDF exceeds the text inspection page limit.");
    const pages: PdfTextPage[] = [];
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      const page = await pdf.getPage(pageNumber);
      try {
        const viewport = page.getViewport({ scale: 1 });
        const content = await page.getTextContent({
          includeMarkedContent: false,
          disableNormalization: false,
        });
        const items: PdfTextItem[] = content.items.flatMap((item) =>
          "str" in item
            ? [
                {
                  text: item.str,
                  x: item.transform[4],
                  y: item.transform[5],
                  width: item.width,
                  height: item.height,
                  fontName: item.fontName,
                  direction: item.dir,
                  hasEOL: item.hasEOL,
                },
              ]
            : [],
        );
        const annotations = await page.getAnnotations({ intent: "display" });
        const links: string[] = annotations.flatMap((annotation) =>
          annotation.subtype === "Link" &&
          typeof annotation.url === "string" &&
          /^(https?:|mailto:|tel:)/i.test(annotation.url)
            ? [annotation.url]
            : [],
        );
        pages.push({
          number: pageNumber,
          width: viewport.width,
          height: viewport.height,
          text: pageText(items),
          items,
          links,
        });
      } finally {
        page.cleanup();
      }
    }
    const text = pages.map((page) => page.text).join("\n\n");
    return {
      pageCount: pdf.numPages,
      pages,
      text,
      characterCount: [...text.replace(/\s/gu, "")].length,
      hasText: text.trim().length > 0,
    };
  } finally {
    await task.destroy();
  }
}

export type PdfTextComparison = {
  passed: boolean;
  coveragePassed: boolean;
  orderPassed: boolean;
  coherencePassed: boolean;
  whitespacePassed: boolean;
  missing: string[];
  unexpected: string[];
  missingCharacters: string[];
  unexpectedCharacters: string[];
  replacementCharacters: number;
  expectedCharacters: number;
  actualCharacters: number;
};

/** NFKC, layout whitespace, and equivalent straight/curly/modifier apostrophes only. */
export function normalizePdfText(text: string): string {
  return text
    .normalize("NFKC")
    .replace(/[\u2018\u2019\u02BC]/gu, "'")
    .replace(/\s+/gu, " ")
    .trim();
}

/**
 * Coverage counts every nonspace Unicode character, including duplicates. Coherence additionally
 * compares word/punctuation token counts so joined, split or letter-spaced words cannot pass.
 * Different column order can pass coverage/coherence while failing order. No fuzzy spelling
 * substitutions. Punctuation spacing is reported separately from word/content coherence.
 */
export function comparePdfText(
  expected: string,
  actual: string,
): PdfTextComparison {
  const normalizedExpected = normalizePdfText(expected),
    normalizedActual = normalizePdfText(actual);
  const tokens = (text: string) =>
    text.match(/[\p{L}\p{M}\p{N}_]+|[^\s]/gu) ?? [];
  const expectedTokens = tokens(normalizedExpected),
    actualTokens = tokens(normalizedActual);
  const counts = (values: string[]) => {
    const result = new Map<string, number>();
    for (const value of values) result.set(value, (result.get(value) ?? 0) + 1);
    return result;
  };
  const missingCounts = counts(expectedTokens),
    unexpectedCounts = counts(actualTokens);
  const missing: string[] = [],
    unexpected: string[] = [];
  for (const [text, count] of missingCounts) {
    for (let index = unexpectedCounts.get(text) ?? 0; index < count; index++)
      missing.push(text);
  }
  for (const [text, count] of unexpectedCounts) {
    for (let index = missingCounts.get(text) ?? 0; index < count; index++)
      unexpected.push(text);
  }
  const expectedCharacters = [...normalizedExpected.replace(/\s/gu, "")];
  const actualCharacters = [...normalizedActual.replace(/\s/gu, "")];
  const expectedCharacterCounts = counts(expectedCharacters),
    actualCharacterCounts = counts(actualCharacters);
  const missingCharacters: string[] = [],
    unexpectedCharacters: string[] = [];
  for (const [character, count] of expectedCharacterCounts) {
    for (
      let index = actualCharacterCounts.get(character) ?? 0;
      index < count;
      index++
    )
      missingCharacters.push(character);
  }
  for (const [character, count] of actualCharacterCounts) {
    for (
      let index = expectedCharacterCounts.get(character) ?? 0;
      index < count;
      index++
    )
      unexpectedCharacters.push(character);
  }
  const replacementCharacters = [...actual].filter(
    (character) => character === "\uFFFD",
  ).length;
  const coveragePassed =
    !missingCharacters.length && !unexpectedCharacters.length;
  const orderPassed =
    expectedCharacters.length === actualCharacters.length &&
    expectedCharacters.every(
      (value, index) => value === actualCharacters[index],
    );
  const coherencePassed =
    coveragePassed &&
    !missing.length &&
    !unexpected.length &&
    !replacementCharacters &&
    expectedTokens.length > 0 &&
    actualTokens.length > 0;
  const whitespacePassed = normalizedExpected === normalizedActual;
  return {
    passed: coveragePassed && orderPassed && coherencePassed,
    coveragePassed,
    orderPassed,
    coherencePassed,
    whitespacePassed,
    missing,
    unexpected,
    missingCharacters,
    unexpectedCharacters,
    replacementCharacters,
    expectedCharacters: expectedCharacters.length,
    actualCharacters: actualCharacters.length,
  };
}
