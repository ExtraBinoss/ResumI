import { chromium, type CDPSession } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { performance as clock } from "node:perf_hooks";
import { gzipSync } from "node:zlib";

type Resource = {
  name: string;
  initiatorType: string;
  startInDocumentMs: number;
  durationMs: number;
  transferBytes: number;
  encodedBytes: number;
};
type Navigation = {
  type: string;
  responseStartMs: number;
  responseEndMs: number;
  domContentLoadedMs: number;
  loadMs: number;
};
type Canvas = {
  x: number;
  y: number;
  width: number;
  height: number;
  textLength: number;
};
type Report = {
  documentId: number;
  url: string;
  browserNowMs: number;
  phase: string;
  resources?: Resource[];
  navigation?: Navigation;
  canvas?: Canvas;
};
type ObservedReport = Report & { observedAt: number };
type ProfileDocument = {
  id: number;
  urls: string[];
  firstObservedAt: number;
  lastObservedAt: number;
  navigation?: Navigation;
  resources: Map<string, Resource>;
};

/** Installed by Playwright in every main document, including full navigations. */
function installProbe(binding: string) {
  if (window !== window.top) return;
  const documentId = performance.timeOrigin;
  let frame = 0,
    lastPhase = "",
    stableFrames = 0,
    painted = false,
    visible = false,
    previous: Canvas | null = null;
  const sent = new Set<string>();
  performance.setResourceTimingBufferSize(4000);
  function resources() {
    return (
      performance.getEntriesByType("resource") as PerformanceResourceTiming[]
    )
      .filter((entry) => {
        const key = `${entry.name}\0${entry.startTime}`;
        if (sent.has(key)) return false;
        sent.add(key);
        return true;
      })
      .map((entry) => ({
        name: entry.name.startsWith(location.origin)
          ? entry.name.slice(location.origin.length)
          : entry.name,
        initiatorType: entry.initiatorType,
        startInDocumentMs: entry.startTime,
        durationMs: entry.duration,
        transferBytes: entry.transferSize,
        encodedBytes: entry.encodedBodySize,
      }));
  }
  function send(phase: string, canvas?: Canvas) {
    const navigation = performance.getEntriesByType("navigation")[0] as
      | PerformanceNavigationTiming
      | undefined;
    const report: Report = {
      documentId,
      url: location.href,
      browserNowMs: performance.now(),
      phase,
      resources: resources(),
      navigation: navigation && {
        type: navigation.type,
        responseStartMs: navigation.responseStart,
        responseEndMs: navigation.responseEnd,
        domContentLoadedMs: navigation.domContentLoadedEventEnd,
        loadMs: navigation.loadEventEnd,
      },
      canvas,
    };
    const bridge = (
      window as unknown as Record<string, (value: Report) => Promise<void>>
    )[binding];
    // The old document can disappear before a final binding acknowledgement.
    void bridge(report).catch(() => {});
  }
  function readCanvas(): { canvas: Canvas; opaque: boolean } | null {
    const node = document.querySelector<HTMLElement>(
      'article[aria-label="Resume canvas"]',
    );
    if (!node?.isConnected || !node.textContent?.trim()) return null;
    const rect = node.getBoundingClientRect();
    if (
      rect.width <= 0 ||
      rect.height <= 0 ||
      rect.right <= 0 ||
      rect.bottom <= 0 ||
      rect.left >= innerWidth ||
      rect.top >= innerHeight
    )
      return null;
    let opacity = 1;
    for (
      let parent: HTMLElement | null = node;
      parent;
      parent = parent.parentElement
    ) {
      const style = getComputedStyle(parent);
      if (style.display === "none" || style.visibility === "hidden")
        return null;
      opacity *= Number(style.opacity);
    }
    if (opacity <= 0.01) return null;
    return {
      canvas: {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
        textLength: node.textContent.length,
      },
      opaque: opacity >= 0.99,
    };
  }
  function tick() {
    frame = 0;
    if (painted) return;
    const result = readCanvas();
    if (!result) {
      stableFrames = 0;
      previous = null;
      if (document.querySelector('article[aria-label="Resume canvas"]'))
        frame = requestAnimationFrame(tick);
      return;
    }
    if (!visible) {
      visible = true;
      send("canvas-visible", result.canvas);
    }
    const stable =
      previous &&
      (["x", "y", "width", "height"] as const).every(
        (key) => Math.abs(previous![key] - result.canvas[key]) < 0.5,
      );
    stableFrames =
      result.opaque && document.fonts.status === "loaded"
        ? stable
          ? stableFrames + 1
          : 1
        : 0;
    previous = result.canvas;
    // Three RAF observations span two rendering opportunities after readiness.
    if (stableFrames >= 3) {
      painted = true;
      send("canvas-painted", result.canvas);
    } else frame = requestAnimationFrame(tick);
  }
  function inspect() {
    const headings = Array.from(
      document.querySelectorAll("h1"),
      (node) => node.textContent ?? "",
    );
    const phase = document.querySelector('article[aria-label="Resume canvas"]')
      ? "canvas-attached"
      : headings.some((text) => /creating.*resume/i.test(text))
        ? "creating"
        : headings.some((text) => /opening.*resume/i.test(text))
          ? "opening"
          : location.pathname.startsWith("/editor")
            ? "editor-shell"
            : "landing";
    if (phase !== lastPhase) {
      lastPhase = phase;
      send(phase);
    }
    if (!frame && !painted) frame = requestAnimationFrame(tick);
  }
  const mutations = new MutationObserver(inspect);
  mutations.observe(document, {
    childList: true,
    subtree: true,
    characterData: true,
  });
  const timings = new PerformanceObserver(() => send("resources"));
  timings.observe({ type: "resource", buffered: true });
  document.addEventListener("DOMContentLoaded", () => {
    send("dom-content-loaded");
    inspect();
  });
  window.addEventListener("load", () => send("load"));
  window.addEventListener(
    "pagehide",
    () => {
      send("pagehide");
      mutations.disconnect();
      timings.disconnect();
      cancelAnimationFrame(frame);
    },
    { once: true },
  );
  send("document-start");
  inspect();
}

async function saveTrace(cdp: CDPSession, path: string) {
  const complete = new Promise<{ stream?: string }>((resolve) => {
    cdp.once("Tracing.tracingComplete", resolve);
  });
  await cdp.send("Tracing.end");
  const { stream } = await complete;
  if (!stream) throw new Error("Chrome did not return a trace stream.");
  const chunks: string[] = [];
  try {
    while (true) {
      const item = await cdp.send("IO.read", { handle: stream });
      chunks.push(
        item.base64Encoded
          ? Buffer.from(item.data, "base64").toString()
          : item.data,
      );
      if (item.eof) break;
    }
  } finally {
    await cdp.send("IO.close", { handle: stream });
  }
  await Bun.write(path, gzipSync(chunks.join("")));
}

const label = process.env.RESUMI_PROFILE_LABEL ?? "latest";
if (!/^[a-z0-9-]+$/i.test(label))
  throw new Error("Use an alphanumeric profile label.");
const baseURL = process.env.BASE_URL ?? "http://127.0.0.1:5175";
const prefix = `artifacts/performance/create-${label}`;
const measurement = {
  version: 2,
  clock: "Node performance.now(), shared across document navigations",
  start:
    "Immediately before Playwright mouse.click dispatch; protocol overhead included",
  end: "Nonempty canvas in viewport, visible and >=99% opaque, fonts loaded, two stable rendering intervals; Node receives the probe report",
  evidence:
    "First sample viewport screenshot is captured after the measured endpoint",
  comparability:
    "Do not compare directly with older in-page .click()/performance.now() profiles, including the 611ms/366ms results",
};
const conditions = {
  browser: "Playwright Chromium",
  viewport: { width: 1440, height: 1000 },
  runs: 3,
  context: "Fresh browser context and empty local storage per sample",
  landing:
    "DOMContentLoaded, document.fonts.ready, CTA hover, then 250ms intent",
  hydration:
    "No React-internal hydration check; native full navigation is allowed",
  server:
    process.env.RESUMI_PROFILE_SERVER_STATE ??
    "Unspecified; no automatic server warmup/reset",
  throttling: "No CPU or network throttling",
  instrumentation:
    "Injected main-document DOM/resource probe; CDP trace on first sample",
  resources:
    "All completed resource timings per main document, including landing/intent traffic; start times are document-relative",
};
await mkdir("artifacts/performance", { recursive: true });
const browser = await chromium.launch();
try {
  const samples = [];
  for (let run = 0; run < conditions.runs; run++) {
    const context = await browser.newContext({ viewport: conditions.viewport });
    const reports: ObservedReport[] = [],
      documents = new Map<number, ProfileDocument>();
    const pageErrors: string[] = [];
    let clickedAt: number | undefined;
    let clickDocumentId: number | undefined;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    let resolvePaint!: (report: ObservedReport) => void;
    const painted = new Promise<ObservedReport>((resolve) => {
      resolvePaint = resolve;
    });
    await context.exposeBinding(
      "__resumiProfileReport",
      ({ frame }, report: Report) => {
        if (frame.parentFrame() || report.url === "about:blank") return;
        const observedAt = clock.now();
        const observed = { ...report, observedAt };
        const existing = documents.get(report.documentId);
        const document = existing ?? {
          id: report.documentId,
          urls: [],
          firstObservedAt: observedAt,
          lastObservedAt: observedAt,
          resources: new Map<string, Resource>(),
        };
        if (!document.urls.includes(report.url)) document.urls.push(report.url);
        document.lastObservedAt = observedAt;
        document.navigation = report.navigation ?? document.navigation;
        for (const resource of report.resources ?? [])
          document.resources.set(
            `${resource.name}\0${resource.startInDocumentMs}`,
            resource,
          );
        documents.set(report.documentId, document);
        if (report.phase !== "resources") reports.push(observed);
        if (report.phase === "canvas-painted" && clickedAt !== undefined)
          resolvePaint(observed);
      },
    );
    await context.addInitScript(installProbe, "__resumiProfileReport");
    const page = await context.newPage();
    page.on("pageerror", (error) => pageErrors.push(error.message));
    const cdp = await context.newCDPSession(page);
    let tracing = false;
    function snapshot(origin: number) {
      return {
        phases: reports.map(
          ({ observedAt, resources: _resources, ...report }) => ({
            ...report,
            observedAtMs: observedAt - origin,
          }),
        ),
        documents: Array.from(documents.values(), (document) => ({
          ...document,
          firstObservedAtMs: document.firstObservedAt - origin,
          lastObservedAtMs: document.lastObservedAt - origin,
          firstObservedAt: undefined,
          lastObservedAt: undefined,
          resources: Array.from(document.resources.values()),
        })),
        pageErrors,
      };
    }
    try {
      if (run === 0) {
        await cdp.send("Tracing.start", {
          categories: "devtools.timeline,v8.execute,blink.user_timing",
          transferMode: "ReturnAsStream",
        });
        tracing = true;
      }
      await page.goto(baseURL, { waitUntil: "domcontentloaded" });
      await page.evaluate(() => document.fonts.ready);
      const create = page.getByRole("link", {
        name: "Create a resume",
        exact: true,
      });
      await create.hover();
      await page.waitForTimeout(250);
      const bounds = await create.boundingBox();
      if (!bounds) throw new Error("The create link is not visible.");
      clickDocumentId = await page.evaluate(() => performance.timeOrigin);
      // This trusted input survives destruction of the landing execution context.
      clickedAt = clock.now();
      const expired = new Promise<never>((_, reject) => {
        timeout = setTimeout(
          () => reject(new Error("Creation exceeded 30 seconds.")),
          30000,
        );
      });
      const input = page.mouse
        .click(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2)
        .then(() => clock.now());
      const [dispatchedAt, ready] = await Promise.race([
        Promise.all([input, painted]),
        expired,
      ]);
      clearTimeout(timeout);
      if (pageErrors.length)
        throw new Error(`Page exception: ${pageErrors.join("; ")}`);
      if (run === 0) await page.screenshot({ path: `${prefix}.canvas.png` });
      samples.push({
        run: run + 1,
        clickToCanvasMs: ready.observedAt - clickedAt,
        inputDispatchMs: dispatchedAt - clickedAt,
        navigation:
          ready.documentId === clickDocumentId
            ? "same-document"
            : "full-document",
        clickDocumentId,
        readyDocumentId: ready.documentId,
        canvas: ready.canvas,
        finalURL: page.url(),
        mainDocumentCount: documents.size,
        ...snapshot(clickedAt),
      });
    } catch (error) {
      await Bun.write(
        `${prefix}.failure.json`,
        JSON.stringify(
          {
            baseURL,
            label,
            measurement,
            conditions,
            run: run + 1,
            error: error instanceof Error ? error.message : String(error),
            clicked: clickedAt !== undefined,
            ...snapshot(clickedAt ?? clock.now()),
          },
          null,
          2,
        ),
      );
      throw error;
    } finally {
      clearTimeout(timeout);
      try {
        if (tracing) await saveTrace(cdp, `${prefix}.trace.json.gz`);
      } finally {
        await context.close();
      }
    }
  }
  const sorted = samples
    .map((sample) => sample.clickToCanvasMs)
    .sort((a, b) => a - b);
  const result = {
    baseURL,
    label,
    measurement,
    conditions,
    medianClickToCanvasMs: sorted[1],
    samples,
  };
  await Bun.write(`${prefix}.json`, JSON.stringify(result, null, 2));
  console.log(
    JSON.stringify(
      {
        label,
        method: measurement.version,
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
