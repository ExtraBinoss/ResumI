import { expect, test, type Page } from "@playwright/test";
import { mkdir } from "node:fs/promises";

type HarnessWindow = Window & {
  releaseOrbStorage: () => void;
  orbPaints: Map<HTMLCanvasElement, number>;
  loadingCanvas?: HTMLCanvasElement;
};
async function holdStorage(page: Page) {
  await page.addInitScript(() => {
    let release!: () => void;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    const harness = window as unknown as HarnessWindow;
    harness.releaseOrbStorage = release;
    harness.orbPaints = new Map();
    const add = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function (
      type,
      listener,
      options,
    ) {
      if (this instanceof IDBOpenDBRequest && type === "success" && listener) {
        const callback = listener;
        return add.call(
          this,
          type,
          (event) => {
            void gate.then(() => {
              if (typeof callback === "function") callback.call(this, event);
              else callback.handleEvent(event);
            });
          },
          options,
        );
      }
      return add.call(this, type, listener, options);
    };
    const clear = CanvasRenderingContext2D.prototype.clearRect;
    CanvasRenderingContext2D.prototype.clearRect = function (...args) {
      if (this.canvas.dataset.thinkingOrb)
        harness.orbPaints.set(
          this.canvas,
          (harness.orbPaints.get(this.canvas) ?? 0) + 1,
        );
      return clear.apply(this, args);
    };
  });
}
async function paints(page: Page) {
  return page.evaluate(() => {
    const harness = window as unknown as HarnessWindow;
    const canvas =
      harness.loadingCanvas ??
      document.querySelector<HTMLCanvasElement>("canvas[data-thinking-orb]")!;
    harness.loadingCanvas = canvas;
    return harness.orbPaints.get(canvas) ?? 0;
  });
}
async function ink(page: Page) {
  return page
    .locator("canvas[data-thinking-orb]")
    .evaluate((node: HTMLCanvasElement) => {
      const pixels = node
        .getContext("2d")!
        .getImageData(0, 0, node.width, node.height).data;
      let total = 0,
        weight = 0;
      for (let i = 0; i < pixels.length; i += 4) {
        total += pixels[i] * pixels[i + 3];
        weight += pixels[i + 3];
      }
      return weight ? total / weight : 0;
    });
}
async function finish(page: Page) {
  await page.evaluate(() =>
    (window as unknown as HarnessWindow).releaseOrbStorage(),
  );
  await expect(
    page.getByRole("article", { name: "Resume canvas", exact: true }),
  ).toBeVisible();
  await expect(page.locator("[data-loading-state]")).toHaveCount(0);
  const stopped = await paints(page);
  await page.waitForTimeout(140);
  expect(
    await paints(page),
    "Unmounted loading canvases must not keep drawing",
  ).toBe(stopped);
}

test("real project opening uses a themed orb, pauses hidden/offscreen, and cleans its canvas lifecycle", async ({
  page,
}) => {
  await page.emulateMedia({
    colorScheme: "light",
    reducedMotion: "no-preference",
  });
  await holdStorage(page);
  await page.goto("/editor");
  const loading = page
    .getByRole("status")
    .filter({ hasText: "Opening your resume…" });
  const canvas = loading.locator('canvas[data-thinking-orb="breathing"]');
  await expect(loading).toBeVisible();
  await expect(canvas).toHaveAttribute("aria-hidden", "true");
  await expect(canvas).toHaveAttribute("data-running", "true");
  await expect.poll(() => paints(page)).toBeGreaterThan(3);
  const image = await canvas.evaluate((node: HTMLCanvasElement) =>
    node.toDataURL(),
  );
  await expect
    .poll(() => canvas.evaluate((node: HTMLCanvasElement) => node.toDataURL()))
    .not.toBe(image);
  const light = await ink(page);
  expect(light).toBeGreaterThan(0);
  await mkdir("artifacts/visual", { recursive: true });
  await page.screenshot({ path: "artifacts/visual/loading-orb-light.png" });
  await page.evaluate(() => {
    localStorage.setItem("resumi-theme", "dark");
    window.dispatchEvent(
      new StorageEvent("storage", { key: "resumi-theme", newValue: "dark" }),
    );
  });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect.poll(() => ink(page)).toBeGreaterThan(light + 20);
  await page.screenshot({ path: "artifacts/visual/loading-orb-dark.png" });
  await page.evaluate(() => {
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      value: "hidden",
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(canvas).toHaveAttribute("data-running", "false");
  const hidden = await paints(page);
  await page.waitForTimeout(140);
  expect(await paints(page), "A hidden tab must stop the orb RAF").toBe(hidden);
  await page.evaluate(() => {
    delete (document as unknown as { visibilityState?: string })
      .visibilityState;
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(canvas).toHaveAttribute("data-running", "true");
  await loading.evaluate((node) => {
    node.style.marginTop = "200vh";
  });
  await expect(canvas).toHaveAttribute("data-running", "false");
  const offscreen = await paints(page);
  await page.waitForTimeout(140);
  expect(await paints(page), "An offscreen orb must stop its RAF").toBe(
    offscreen,
  );
  await expect(loading.locator("h1")).toHaveCSS(
    "animation-play-state",
    "paused",
  );
  await loading.evaluate((node) => {
    node.style.marginTop = "0";
  });
  await expect(canvas).toHaveAttribute("data-running", "true");
  await finish(page);
});

test("reduced motion paints one static orb state, disables shimmer and still follows the theme", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" });
  await holdStorage(page);
  await page.goto("/editor");
  const loading = page
    .getByRole("status")
    .filter({ hasText: "Opening your resume…" });
  const canvas = loading.locator("canvas[data-thinking-orb]");
  await expect(loading).toBeVisible();
  await expect.poll(() => paints(page)).toBeGreaterThan(0);
  await expect(canvas).toHaveAttribute("data-running", "false");
  await expect(loading.locator("h1")).toHaveCSS("animation-name", "none");
  const count = await paints(page),
    image = await canvas.evaluate((node: HTMLCanvasElement) =>
      node.toDataURL(),
    );
  await page.waitForTimeout(160);
  expect(await paints(page)).toBe(count);
  expect(
    await canvas.evaluate((node: HTMLCanvasElement) => node.toDataURL()),
  ).toBe(image);
  const light = await ink(page);
  await page.evaluate(() => {
    localStorage.setItem("resumi-theme", "dark");
    window.dispatchEvent(
      new StorageEvent("storage", { key: "resumi-theme", newValue: "dark" }),
    );
  });
  await expect.poll(() => ink(page)).toBeGreaterThan(light + 20);
  await page.screenshot({ path: "artifacts/visual/loading-orb-reduced.png" });
  await finish(page);
});
