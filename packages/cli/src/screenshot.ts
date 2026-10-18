import type { CaptureResult } from "./io";

/** Untrusted source executes only in an opaque frame in a disposable browser. */
export async function captureScreenshot(
  html: string,
  width: number,
  height: number,
): Promise<CaptureResult> {
  const { chromium } = await import("@playwright/test");
  const browser = await chromium
    .launch({ headless: true })
    .catch((error: unknown) => {
      throw new Error(
        `Chromium could not start. Run bunx playwright install chromium. ${error instanceof Error ? error.message.split("\n")[0] : ""}`,
      );
    });
  let timedOut = false;
  const deadline = setTimeout(() => {
    timedOut = true;
    void browser.close();
  }, 30000);
  try {
    const context = await browser.newContext({
      viewport: { width, height: Math.min(height, 1080) },
      deviceScaleFactor: 1,
      reducedMotion: "reduce",
      serviceWorkers: "block",
      acceptDownloads: false,
    });
    const blocked = new Set<string>(),
      errors: string[] = [];
    const page = await context.newPage();
    page.setDefaultTimeout(15000);
    page.on("pageerror", (error) => errors.push(error.message));
    await context.route("**/*", async (route) => {
      blocked.add(route.request().url());
      await route.abort("blockedbyclient");
    });
    // Never place source markup in the automation's same-origin parent.
    await page.setContent(
      '<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;background:white}iframe{display:block;border:0}</style></head><body><iframe id="resume-frame" title="Resume" sandbox="allow-scripts"></iframe></body></html>',
    );
    await page.locator("#resume-frame").evaluate(
      (element, options) => {
        const frame = element as HTMLIFrameElement;
        frame.width = String(options.width);
        frame.height = String(options.height);
        frame.srcdoc = options.html;
      },
      { html, width, height },
    );
    const element = await page.locator("#resume-frame").elementHandle();
    const frame = await element?.contentFrame();
    if (!frame) throw new Error("Resume sandbox could not open.");
    await frame.waitForURL("about:srcdoc");
    await frame.waitForLoadState("load");
    await frame.waitForFunction(() => {
      const root = document.querySelector("#resumi-root");
      return !root || root.childElementCount > 0;
    });
    const rendering = await frame.evaluate(async () => {
      await document.fonts.ready;
      const failedFonts = Array.from(document.fonts)
        .filter((font) => font.status === "error")
        .map((font) => font.family);
      const failed: string[] = [];
      await Promise.all(
        Array.from(document.images, async (image) => {
          try {
            await image.decode();
          } catch {
            failed.push(image.alt || "unnamed image");
          }
        }),
      );
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      });
      const alert = document.querySelector('[role="alert"]');
      return {
        width: document.documentElement.scrollWidth,
        height: Math.max(
          document.documentElement.scrollHeight,
          document.body.scrollHeight,
        ),
        failed,
        failedFonts,
        alert: alert?.textContent,
      };
    });
    if (errors.length || rendering.alert)
      throw new Error(
        `Resume rendering failed: ${errors[0] ?? rendering.alert}`,
      );
    if (rendering.failed.length)
      throw new Error(
        `Embedded images could not decode: ${rendering.failed.join(", ")}. Use embedded data URLs.`,
      );
    if (rendering.failedFonts.length)
      throw new Error(
        `Embedded fonts could not load: ${rendering.failedFonts.join(", ")}. Use embedded data URLs.`,
      );
    if (rendering.width > width + 1)
      throw new Error(
        `Resume exceeds capture width (${rendering.width}px > ${width}px). Fix CSS overflow or pass --width ${Math.ceil(rendering.width)}.`,
      );
    const fullHeight = Math.max(height, rendering.height);
    if (fullHeight > 10000)
      throw new Error(
        `Resume is too tall (${fullHeight}px); maximum screenshot height is 10000px.`,
      );
    await page.locator("#resume-frame").evaluate((element, value) => {
      (element as HTMLIFrameElement).height = String(value);
    }, fullHeight);
    const bytes = await page
      .locator("#resume-frame")
      .screenshot({ type: "png", animations: "disabled", timeout: 15000 });
    return { bytes, width, height: fullHeight, blockedRequests: [...blocked] };
  } catch (error) {
    if (timedOut)
      throw new Error(
        "Resume capture timed out after 30 seconds. Check for non-terminating source code or asset-loading work.",
      );
    throw error;
  } finally {
    clearTimeout(deadline);
    await browser.close();
  }
}
