import { sourcePolicy } from "@resumi/cv";
import {
  createPdfPrintSnapshot,
  normalizePdfTracking,
} from "@resumi/cv/pdf-print";
import { extractPrintedText } from "./pdf-visible-text";

export type PdfCaptureResult = {
  bytes: Uint8Array;
  expectedText: string;
  expectedPages: { id: string; text: string }[];
  /** Page dimensions in CSS pixels; the PDF uses 0.75 points per pixel. */
  width: number;
  height: number;
  blockedRequests: string[];
  adjustedTracking: number;
};

/** Render current source in an opaque frame, then print only its sanitized inert copy. */
export async function renderPdf(
  html: string,
  width: number,
  height: number,
  react = false,
): Promise<PdfCaptureResult> {
  if (
    ![width, height].every(
      (value) => Number.isFinite(value) && value >= 100 && value <= 10_000,
    )
  )
    throw new Error(
      "PDF page dimensions must be between 100 and 10000 CSS pixels.",
    );
  if (html.length > 32_000_000)
    throw new Error("Resume HTML exceeds the 32 MB PDF export limit.");
  const { chromium } = await import("@playwright/test");
  const browser = await chromium
    .launch({ headless: true })
    .catch((error: unknown) => {
      throw new Error(
        `Chromium could not start. Run bunx playwright install chromium. ${error instanceof Error ? error.message.split("\n")[0] : ""}`,
      );
    });
  const blocked = new Set<string>();
  let timedOut = false;
  const deadline = setTimeout(() => {
    timedOut = true;
    void browser.close();
  }, 30_000);
  try {
    const source = await browser.newContext({
      viewport: { width: Math.ceil(width), height: Math.ceil(height) },
      reducedMotion: "reduce",
      serviceWorkers: "block",
      acceptDownloads: false,
    });
    await source.route("**/*", async (route) => {
      blocked.add(route.request().url());
      await route.abort("blockedbyclient");
    });
    const host = await source.newPage();
    const errors: string[] = [];
    host.on("pageerror", (error) => errors.push(error.message));
    host.setDefaultTimeout(15_000);
    await host.setContent(
      '<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0}iframe{display:block;border:0}</style></head><body><iframe id="resume-frame" title="Resume" sandbox="allow-scripts"></iframe></body></html>',
    );
    const policy = `<meta http-equiv="Content-Security-Policy" content="${sourcePolicy(react)}">`;
    if (!/<head\b/i.test(html))
      throw new Error(
        "PDF export requires the complete HTML returned by renderDocumentHtml.",
      );
    const prepared = html
      .replace(
        /<meta\b[^>]*http-equiv=["']Content-Security-Policy["'][^>]*>/gi,
        "",
      )
      .replace(/<head[^>]*>/i, (head) => head + policy);
    await host.locator("#resume-frame").evaluate(
      (element, value) => {
        const frame = element as HTMLIFrameElement;
        frame.width = String(value.width);
        frame.height = String(value.height);
        frame.srcdoc = value.html;
      },
      { html: prepared, width, height },
    );
    const frame = await (
      await host.locator("#resume-frame").elementHandle()
    )?.contentFrame();
    if (!frame) throw new Error("Resume sandbox could not open.");
    await frame.waitForURL("about:srcdoc");
    await frame.waitForLoadState("load");
    await frame.waitForFunction(() => {
      const root = document.getElementById("resumi-root");
      return !root || root.childElementCount > 0;
    });
    const snapshot = await frame.evaluate(async () => {
      await document.fonts.ready;
      const failedFonts = [...document.fonts].filter(
        (font) => font.status === "error",
      );
      if (failedFonts.length)
        throw new Error(
          `Embedded fonts could not load: ${failedFonts.map((font) => font.family).join(", ")}.`,
        );
      await Promise.all(
        [...document.images].map(async (image) => {
          try {
            await image.decode();
          } catch {
            throw new Error(
              `Embedded image could not decode: ${image.alt || "unnamed image"}.`,
            );
          }
        }),
      );
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      });
      const alert = document.querySelector('[role="alert"]');
      if (alert)
        throw new Error(alert.textContent || "Resume rendering failed.");
      const copy = document.documentElement.cloneNode(true) as HTMLElement;
      // Blob URLs belong to this opaque origin: freeze decoded pixels before disposing it.
      const originals = [...document.images];
      const clones = [...copy.querySelectorAll("img")];
      for (let i = 0; i < originals.length; i++) {
        const image = originals[i]!;
        if (!image.src.startsWith("blob:")) continue;
        const canvas = document.createElement("canvas");
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        const context = canvas.getContext("2d");
        if (!context)
          throw new Error("Could not freeze an embedded blob image.");
        context.drawImage(image, 0, 0);
        clones[i]!.src = canvas.toDataURL("image/png");
      }
      copy.querySelectorAll("script").forEach((node) => node.remove());
      return copy.outerHTML;
    });
    if (errors.length) throw new Error(`Resume rendering failed: ${errors[0]}`);
    if (snapshot.length > 32_000_000)
      throw new Error("Rendered resume exceeds the 32 MB PDF export limit.");

    // Treat the source snapshot as untrusted, even though its rendering was isolated.
    const inert = await host.evaluate(createPdfPrintSnapshot, snapshot);
    await source.close();
    const print = await browser.newContext({
      viewport: { width: Math.ceil(width), height: Math.ceil(height) },
      javaScriptEnabled: false,
      reducedMotion: "reduce",
      serviceWorkers: "block",
      acceptDownloads: false,
    });
    await print.route("**/*", async (route) => {
      blocked.add(route.request().url());
      await route.abort("blockedbyclient");
    });
    const page = await print.newPage();
    page.setDefaultTimeout(15_000);
    await page.emulateMedia({ media: "print" });
    await page.setContent(
      `<!doctype html><html${inert.htmlAttributes}><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="${sourcePolicy(false)}"><style>@page{size:${width * 0.75}pt ${height * 0.75}pt;margin:0}</style></head><body${inert.bodyAttributes}>${inert.markup}<style>*{animation:none!important;transition:none!important;print-color-adjust:exact!important;-webkit-print-color-adjust:exact!important}html,body{margin:0!important}.resume.freeform:not([data-page-id]){width:${width}px!important;height:${height}px!important}</style></body></html>`,
    );
    const tracking = await page.evaluate(normalizePdfTracking, undefined);
    await page.evaluate(async () => {
      await document.fonts.ready;
      const failed = [...document.fonts].filter(
        (font) => font.status === "error",
      );
      if (failed.length)
        throw new Error(
          `Print fonts could not load: ${failed.map((font) => font.family).join(", ")}.`,
        );
      // Match the app's print-copy image policy: preserve alpha and never enlarge.
      for (const image of document.images) {
        await image.decode();
        if (!/^data:image\/(png|jpe?g|webp);/i.test(image.src)) continue;
        const bounds = image.getBoundingClientRect();
        if (!bounds.width || !bounds.height) continue;
        const fit =
          getComputedStyle(image).objectFit === "contain" ? Math.min : Math.max;
        const scale = Math.min(
          1,
          fit(
            (bounds.width * 3) / image.naturalWidth,
            (bounds.height * 3) / image.naturalHeight,
          ),
        );
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
        const context = canvas.getContext("2d");
        if (!context) continue;
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        const alpha = /^data:image\/(png|webp);/i.test(image.src);
        const result = canvas.toDataURL(
          alpha ? "image/png" : "image/jpeg",
          0.9,
        );
        if (result.length < image.src.length) {
          image.src = result;
          await image.decode();
        }
      }
    });
    const expectedText = await page.evaluate(extractPrintedText, undefined);
    const pageIds = await page
      .locator("article.resume.freeform[data-page-id]")
      .evaluateAll((elements) =>
        elements.map((element) => element.getAttribute("data-page-id")!),
      );
    const expectedPages = [];
    for (const id of pageIds)
      expectedPages.push({
        id,
        text: await page.evaluate(extractPrintedText, { pageId: id }),
      });
    const bytes = await page.pdf({
      width: `${width}px`,
      height: `${height}px`,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      printBackground: true,
      preferCSSPageSize: true,
      tagged: true,
      outline: true,
    });
    return {
      bytes,
      expectedText,
      expectedPages,
      width,
      height,
      blockedRequests: [...blocked],
      adjustedTracking: tracking.adjustedElements,
    };
  } catch (error) {
    if (timedOut)
      throw new Error(
        "Resume PDF export timed out after 30 seconds. Check source code and embedded assets.",
      );
    throw error;
  } finally {
    clearTimeout(deadline);
    await browser.close();
  }
}
