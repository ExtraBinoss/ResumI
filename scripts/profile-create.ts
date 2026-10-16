import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { gzipSync } from "node:zlib";
const label = process.env.RESUMI_PROFILE_LABEL ?? "latest";
if (!/^[a-z0-9-]+$/i.test(label))
  throw new Error("Use an alphanumeric profile label.");
const baseURL = process.env.BASE_URL ?? "http://127.0.0.1:5175";
const browser = await chromium.launch();
try {
  const samples = [];
  for (let run = 0; run < 3; run++) {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
    });
    const page = await context.newPage();
    await page.goto(baseURL);
    await page.evaluate(() => document.fonts.ready);
    // A real click, with the same intent interval before and after the change.
    const create = page.getByRole("link", {
      name: "Create a resume",
      exact: true,
    });
    await create.hover();
    await page.waitForTimeout(250);
    const cdp = await context.newCDPSession(page);
    if (run === 0)
      await cdp.send("Tracing.start", {
        categories: "devtools.timeline,v8.execute,blink.user_timing",
        transferMode: "ReturnAsStream",
      });
    const result = await page.evaluate(async () => {
      const resourcesBefore = performance.getEntriesByType("resource").length;
      const phases: { type: string; time: number }[] = [];
      const observer = new MutationObserver(() => {
        const type = document.querySelector('[aria-label="Resume canvas"]')
          ? "canvas"
          : document.body.textContent?.includes("Creating your local resume")
            ? "creating"
            : document.body.textContent?.includes("Opening your resume")
              ? "opening"
              : "navigation";
        if (phases.at(-1)?.type !== type)
          phases.push({ type, time: performance.now() });
      });
      observer.observe(document.body, { childList: true, subtree: true });
      const started = performance.now();
      (
        document.querySelector('a[href="/editor"]') as HTMLAnchorElement
      ).click();
      while (!document.querySelector('[aria-label="Resume canvas"]')) {
        if (performance.now() - started > 30000)
          throw new Error("Creation exceeded 30 seconds.");
        await new Promise(requestAnimationFrame);
      }
      await new Promise(requestAnimationFrame);
      observer.disconnect();
      return {
        clickToCanvasMs: performance.now() - started,
        phases: phases.map((p) => ({ ...p, time: p.time - started })),
        resources: (
          performance
            .getEntriesByType("resource")
            .slice(resourcesBefore) as PerformanceResourceTiming[]
        ).map((r) => ({
          name: r.name.replace(location.origin, ""),
          duration: r.duration,
          bytes: r.transferSize,
        })),
      };
    });
    samples.push(result);
    if (run === 0) {
      const complete = new Promise<{ stream?: string }>((resolve) =>
        cdp.once("Tracing.tracingComplete", resolve),
      );
      await cdp.send("Tracing.end");
      const { stream } = await complete;
      if (!stream) throw new Error("Chrome did not return a trace stream.");
      const chunks: string[] = [];
      while (true) {
        const item = await cdp.send("IO.read", { handle: stream });
        chunks.push(
          item.base64Encoded
            ? Buffer.from(item.data, "base64").toString()
            : item.data,
        );
        if (item.eof) break;
      }
      await cdp.send("IO.close", { handle: stream });
      await mkdir("artifacts/performance", { recursive: true });
      await Bun.write(
        `artifacts/performance/create-${label}.trace.json.gz`,
        gzipSync(chunks.join("")),
      );
    }
    await context.close();
  }
  const sorted = samples.map((s) => s.clickToCanvasMs).sort((a, b) => a - b);
  const result = {
    baseURL,
    label,
    conditions:
      "Chromium, fresh browser context per run; warmed Vite server; 250ms pointer intent; no CPU/network throttling",
    medianClickToCanvasMs: sorted[1],
    samples,
  };
  await Bun.write(
    `artifacts/performance/create-${label}.json`,
    JSON.stringify(result, null, 2),
  );
  console.log(
    JSON.stringify(
      {
        label,
        medianMs: Math.round(sorted[1]),
        samplesMs: sorted.map(Math.round),
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
