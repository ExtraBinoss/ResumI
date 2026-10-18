import googleFonts from "./google-fonts.generated.json";

export type FontOption = {
  label: string;
  value: string;
  category: string;
  source: "document" | "computer" | "google";
};
export type LocalFont = {
  family: string;
  style?: string;
  fullName?: string;
  blob: () => Promise<Blob>;
};
export const fontName = (value: string) =>
  value
    .split(",")[0]
    .trim()
    .replace(/^['"]|['"]$/g, "");
export const fontStack = (family: string, category = "Sans Serif") =>
  `"${family}", ${category === "Serif" ? "serif" : category === "Monospace" ? "monospace" : "sans-serif"}`;
export const googleCatalog: FontOption[] = googleFonts.map(
  ({ family, category }) => ({
    label: family,
    value: fontStack(family, category),
    category,
    source: "google",
  }),
);
const categories = new Map(
  googleCatalog.map((font) => [font.label.toLowerCase(), font.category]),
);
export function fontCategory(family: string) {
  return (
    categories.get(family.toLowerCase()) ??
    (/mono|consolas|courier|menlo/i.test(family)
      ? "Monospace"
      : /serif|georgia|times|baskerville|cambria|charter|didot|hoefler|palatino/i.test(
            family,
          ) && !/sans/i.test(family)
        ? "Serif"
        : "Sans Serif")
  );
}
const commonFonts = [
  "Arial",
  "Arial Narrow",
  "Aptos",
  "Avenir",
  "Avenir Next",
  "Baskerville",
  "Calibri",
  "Cambria",
  "Candara",
  "Charter",
  "Consolas",
  "Courier New",
  "Didot",
  "Futura",
  "Georgia",
  "Gill Sans",
  "Helvetica",
  "Helvetica Neue",
  "Hoefler Text",
  "Inter",
  "Liberation Sans",
  "Liberation Serif",
  "Menlo",
  "Monaco",
  "Optima",
  "Palatino",
  "Segoe UI",
  "Tahoma",
  "Times New Roman",
  "Trebuchet MS",
  "Verdana",
];
const genericFonts: FontOption[] = [
  {
    label: "System",
    value: "system-ui, sans-serif",
    category: "Interface",
    source: "computer",
  },
  {
    label: "Sans serif",
    value: "ui-sans-serif, sans-serif",
    category: "Sans Serif",
    source: "computer",
  },
  {
    label: "Serif",
    value: "ui-serif, serif",
    category: "Serif",
    source: "computer",
  },
  {
    label: "Monospace",
    value: "ui-monospace, monospace",
    category: "Monospace",
    source: "computer",
  },
];
export function detectedFonts(): FontOption[] {
  const context = document.createElement("canvas").getContext("2d");
  if (!context) return genericFonts;
  const sample = "mmmmmmmmwwwww0123456789";
  const installed = commonFonts.filter((family) =>
    ["monospace", "serif", "sans-serif"].some((fallback) => {
      context.font = `72px ${fallback}`;
      const baseline = context.measureText(sample).width;
      context.font = `72px "${family}",${fallback}`;
      return context.measureText(sample).width !== baseline;
    }),
  );
  return [
    ...genericFonts,
    ...installed.map((family): FontOption => ({
      label: family,
      value: fontStack(family),
      category: "Installed",
      source: "computer",
    })),
  ];
}

const googleRequests = new Map<string, Promise<Blob>>();
export type GoogleFontErrorCode = "load" | "no-downloadable-font" | "download";
export class GoogleFontError extends Error {
  constructor(readonly code: GoogleFontErrorCode) {
    super(code);
    this.name = "GoogleFontError";
  }
}
/** Visible font-picker samples, hover and selection share one request/cache per family. */
export function googleFontBlob(family: string) {
  const existing = googleRequests.get(family);
  if (existing) return existing;
  const request = (async () => {
    const response = await fetch(
      `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}&display=swap`,
    );
    if (!response.ok) throw new GoogleFontError("load");
    const css = await response.text();
    // The CSS API orders latin last. Its regular face supports the editor's Latin CV text.
    const urls = [
      ...css.matchAll(/src:\s*url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/g),
    ];
    const url = urls.at(-1)?.[1];
    if (!url) throw new GoogleFontError("no-downloadable-font");
    const font = await fetch(url);
    if (!font.ok) throw new GoogleFontError("download");
    const blob = await font.blob();
    const face = await new FontFace(family, await blob.arrayBuffer()).load();
    document.fonts.add(face);
    return blob;
  })();
  googleRequests.set(family, request);
  void request.catch(() => googleRequests.delete(family));
  return request;
}
