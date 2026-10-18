import { expect, test, type Page } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import {
  applyCommands,
  createDocument,
  makeLayer,
  type Command,
} from "@resumi/engine";

function fixture() {
  let document = createDocument("drag-performance", "Synthetic 120-layer drag");
  const commands: Command[] = [
    {
      type: "section.create",
      section: { id: "content", title: "Content", blockIds: [] },
    },
    { type: "canvas.enable", layers: {} },
    ...Array.from({ length: 120 }, (_, index): Command => ({
      type: "block.create",
      sectionId: "content",
      block: {
        id: `layer-${index}`,
        kind: "text",
        text: `Perf layer ${index + 1}`,
        design: makeLayer("text", {
          name: `Perf layer ${index + 1}`,
          x: 40 + (index % 3) * 240,
          y: 40 + Math.floor(index / 3) * 24,
          width: 220,
          height: 22,
          fontSize: 12,
        }),
      },
    })),
  ];
  for (let index = 0; index < commands.length; index += 100)
    document = applyCommands(document, {
      version: 1,
      actor: { kind: "agent", name: "Synthetic benchmark" },
      commands: commands.slice(index, index + 100),
    }).document;
  return document;
}

async function savedDocument(page: Page) {
  return page.evaluate(async () => {
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open("resumi-projects");
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    try {
      return await new Promise<string>((resolve, reject) => {
        const request = database
          .transaction("projects")
          .objectStore("projects")
          .get(location.pathname.split("/").at(-1)!);
        request.onsuccess = () =>
          resolve(JSON.stringify(request.result.document));
        request.onerror = () => reject(request.error);
      });
    } finally {
      database.close();
    }
  });
}

test("native layer drag reports real frames and bounded semantic previews for 120 layers", async ({
  page,
}, info) => {
  await page.goto("/projects");
  await page.locator("input[type=file]").setInputFiles({
    name: "synthetic-drag-120.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(fixture())),
  });
  await expect(
    page.getByRole("article", { name: "Resume canvas", exact: true }),
  ).toBeVisible();
  await expect(page.locator("[data-layer-row]")).toHaveCount(120);
  const status = page.getByRole("status", { name: "Save status", exact: true });
  await expect(status).toHaveText("Saved");
  const original = await savedDocument(page);
  const row = (name: string) =>
    page
      .getByRole("button", { name: `Select layer ${name}`, exact: true })
      .locator("..");
  const source = row("Perf layer 120"),
    target = row("Perf layer 117");
  const sourceId = (await source.getAttribute("data-layer-row"))!;
  const sourceBox = (await source.boundingBox())!,
    targetBox = (await target.boundingBox())!;
  const start = { x: sourceBox.x + 70, y: sourceBox.y + sourceBox.height / 2 };
  await page.mouse.move(start.x, start.y);
  await page.evaluate(() => {
    performance.clearMeasures("resumi:layer-preview");
    const frames: number[] = [],
      longTasks: { start: number; duration: number }[] = [];
    let running = true,
      previous = 0,
      frame = 0;
    const tick = (now: number) => {
      if (previous) frames.push(now - previous);
      previous = now;
      if (running) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    const observer = PerformanceObserver.supportedEntryTypes.includes(
      "longtask",
    )
      ? new PerformanceObserver((list) => {
          for (const entry of list.getEntries())
            longTasks.push({
              start: entry.startTime,
              duration: entry.duration,
            });
        })
      : undefined;
    observer?.observe({ type: "longtask" });
    Object.assign(window, {
      __resumiDragMetrics: () => {
        running = false;
        cancelAnimationFrame(frame);
        observer?.disconnect();
        return { frames, longTasks, longTasksSupported: !!observer };
      },
    });
  });
  await page.mouse.down();
  const point = { x: targetBox.x + 70, y: targetBox.y + 3 };
  await page.mouse.move(point.x, point.y);
  await expect(page.locator('[data-drop-position="above"]')).toHaveCount(1);
  await expect.poll(() => performanceCount(page)).toBeGreaterThan(0);
  const firstPreviewCount = await performanceCount(page);
  const reordered = await page
    .locator("[data-layer-row]")
    .evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute("data-layer-row")),
    );
  expect(reordered[2]).toBe(sourceId);
  expect(await savedDocument(page)).toBe(original);
  const pointerErrors: number[] = [];
  for (let index = 0; index < 24; index++) {
    point.x = targetBox.x + 70 + (index % 12) * 4;
    await page.mouse.move(point.x, point.y);
    pointerErrors.push(
      await page.evaluate(
        async ({ point, start }) => {
          await new Promise<void>((resolve) => {
            requestAnimationFrame(() => resolve());
          });
          const ghost = document.querySelector<HTMLElement>(
            "[data-layer-drag-ghost]",
          )!;
          const matrix = new DOMMatrixReadOnly(
            getComputedStyle(ghost).transform,
          );
          return Math.hypot(
            matrix.e - (point.x - start.x),
            matrix.f - (point.y - start.y),
          );
        },
        { point, start },
      ),
    );
  }
  const sameTargetPreviewCount =
    (await performanceCount(page)) - firstPreviewCount;
  expect(sameTargetPreviewCount).toBeLessThanOrEqual(1);
  expect(await performanceCount(page)).toBeLessThanOrEqual(3);
  expect(Math.max(...pointerErrors)).toBeLessThan(1);
  expect(await savedDocument(page)).toBe(original);
  await expect(
    page.getByRole("button", { name: "Undo", exact: true }),
  ).toBeDisabled();
  const metrics = await page.evaluate(() => {
    const read = Reflect.get(window, "__resumiDragMetrics") as () => {
      frames: number[];
      longTasks: { start: number; duration: number }[];
      longTasksSupported: boolean;
    };
    const result = read();
    Reflect.deleteProperty(window, "__resumiDragMetrics");
    return {
      ...result,
      previews: performance
        .getEntriesByName("resumi:layer-preview")
        .map((entry) => ({
          start: entry.startTime,
          duration: entry.duration,
          layers: (entry as PerformanceMeasure).detail.layers,
        })),
    };
  });
  expect(metrics.frames.length).toBeGreaterThan(0);
  expect(metrics.previews[0].layers).toBe(120);
  await page.mouse.up();
  await expect(page.locator("[data-layer-drag-ghost]")).toHaveCount(0);
  await expect(status).toHaveText("Saved");
  await expect.poll(() => savedDocument(page)).not.toBe(original);
  const sorted = [...metrics.frames].sort((a, b) => a - b);
  const report = {
    layers: 120,
    pointerMoves: 24,
    firstPreviewMilliseconds: metrics.previews[0].duration,
    sameTargetPreviewCount,
    pointerErrors,
    ...metrics,
    frameSummary: {
      median: sorted[Math.floor(sorted.length / 2)],
      p95: sorted[
        Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95))
      ],
      max: Math.max(...sorted),
    },
  };
  const body = JSON.stringify(report, null, 2);
  await mkdir("artifacts/performance", { recursive: true });
  await writeFile("artifacts/performance/layer-drag.json", body + "\n");
  await info.attach("layer-drag-performance", {
    body,
    contentType: "application/json",
  });
});

async function performanceCount(page: Page) {
  return page.evaluate(
    () => performance.getEntriesByName("resumi:layer-preview").length,
  );
}
