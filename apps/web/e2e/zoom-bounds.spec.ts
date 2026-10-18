import { expect, test, type Locator, type Page } from "@playwright/test";

async function settled(page: Page, surface: Locator) {
  const target = Number(
    await page
      .getByRole("spinbutton", { name: "Canvas zoom", exact: true })
      .inputValue(),
  );
  await expect
    .poll(() =>
      surface.evaluate((node) => (node as HTMLElement).style.transform),
    )
    .toBe(`scale(${target / 100})`);
  await expect
    .poll(() =>
      surface.evaluate((node) => (node as HTMLElement).style.willChange),
    )
    .toBe("");
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      }),
  );
}

for (const mode of ["visual", "text", "materialized"] as const) {
  test(`${mode} zoom projects unreachable anchors into the bounded stage before commit`, async ({
    page,
  }) => {
    await page.goto(
      mode === "materialized" ? "/editor?template=react-cobalt" : "/editor",
    );
    if (mode === "text") {
      await page.getByRole("button", { name: "Text", exact: true }).click();
      await expect(
        page.getByRole("article", { name: "Text workspace", exact: true }),
      ).toBeVisible();
    }
    const surface = page.locator("[data-zoom-surface]");
    await expect(surface).toBeVisible();
    await settled(page, surface);
    const zoom = page.getByRole("spinbutton", {
      name: "Canvas zoom",
      exact: true,
    });
    await zoom.fill("150");
    await settled(page, surface);
    const anchor = await surface.evaluate((node) => {
      const viewport = node.parentElement!.parentElement!.parentElement!,
        rect = viewport.getBoundingClientRect();
      return {
        x: rect.left + viewport.clientWidth * 0.3,
        y: rect.top + viewport.clientHeight * 0.35,
      };
    });
    await surface.evaluate((node) => {
      type Sample = {
        left: number;
        top: number;
        width: number;
        height: number;
        preview: boolean;
        layout: string;
      };
      const samples: Sample[] = [];
      Object.assign(window, { boundedZoomSamples: samples });
      const end = performance.now() + 10000;
      let previewSeen = false,
        committedFrames = 0;
      function sample() {
        const rect = node.getBoundingClientRect();
        samples.push({
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
          preview: (node as HTMLElement).style.willChange === "transform",
          layout: (node.parentElement as HTMLElement).style.width,
        });
        previewSeen ||= samples[samples.length - 1].preview;
        if (previewSeen && !samples[samples.length - 1].preview)
          committedFrames++;
        if (performance.now() < end && committedFrames < 4)
          requestAnimationFrame(sample);
      }
      requestAnimationFrame(sample);
    });
    await page.mouse.move(anchor.x, anchor.y);
    await page.keyboard.down("Control");
    await page.mouse.wheel(0, Math.log(150 / 40) / 0.002);
    await page.keyboard.up("Control");
    await expect(zoom).toHaveValue("40");
    await settled(page, surface);
    const geometry = await surface.evaluate((node) => {
      const bounds = node.parentElement!,
        stage = bounds.parentElement!,
        viewport = stage.parentElement!,
        rect = node.getBoundingClientRect(),
        viewportRect = viewport.getBoundingClientRect(),
        stageRect = stage.getBoundingClientRect(),
        style = getComputedStyle(stage);
      const paddingX =
          parseFloat(style.paddingLeft) + parseFloat(style.paddingRight),
        paddingY =
          parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
      return {
        scrollLeft: viewport.scrollLeft,
        scrollTop: viewport.scrollTop,
        extraWidth: viewport.scrollWidth - viewport.clientWidth,
        extraHeight: viewport.scrollHeight - viewport.clientHeight,
        stageWidth: stageRect.width,
        stageHeight: stageRect.height,
        expectedWidth: Math.max(viewport.clientWidth, rect.width + paddingX),
        expectedHeight: Math.max(viewport.clientHeight, rect.height + paddingY),
        left: rect.left,
        top: rect.top,
        expectedLeft:
          viewportRect.left +
          viewport.clientLeft +
          (viewport.clientWidth - rect.width) / 2,
        expectedTop:
          viewportRect.top +
          viewport.clientTop +
          parseFloat(style.paddingTop) +
          (viewport.clientHeight - rect.height - paddingY) / 2,
        transform: (node as HTMLElement).style.transform,
        overflow: stage.style.overflow,
      };
    });
    expect(geometry.extraWidth).toBe(0);
    expect(geometry.extraHeight).toBe(0);
    expect(geometry.scrollLeft).toBe(0);
    expect(geometry.scrollTop).toBe(0);
    expect(Math.abs(geometry.stageWidth - geometry.expectedWidth)).toBeLessThan(
      0.1,
    );
    expect(
      Math.abs(geometry.stageHeight - geometry.expectedHeight),
    ).toBeLessThan(0.1);
    expect(Math.abs(geometry.left - geometry.expectedLeft)).toBeLessThan(0.1);
    expect(Math.abs(geometry.top - geometry.expectedTop)).toBeLessThan(0.1);
    expect(geometry.transform).toBe("scale(0.4)");
    expect(geometry.overflow).toBe("");
    const samples = await page.evaluate(
      () =>
        (
          window as unknown as {
            boundedZoomSamples: {
              left: number;
              top: number;
              width: number;
              height: number;
              preview: boolean;
              layout: string;
            }[];
          }
        ).boundedZoomSamples,
    );
    const lastPreview = [...samples]
      .reverse()
      .find((sample) => sample.preview)!;
    const committed = samples.find(
      (sample, index) =>
        !sample.preview && index > samples.indexOf(lastPreview),
    )!;
    expect(lastPreview).toBeTruthy();
    expect(committed).toBeTruthy();
    expect(
      new Set(samples.map((sample) => sample.layout)).size,
    ).toBeLessThanOrEqual(2);
    expect(
      Math.hypot(
        lastPreview.left - committed.left,
        lastPreview.top - committed.top,
      ),
      "The final bounds commit must not remove an unreachable preview translation",
    ).toBeLessThan(1.5);
    expect(Math.abs(lastPreview.width - committed.width)).toBeLessThan(0.5);
  });
}

test("a fitted native page on mobile stays in the canvas above the open panels", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/editor");
  const surface = page.locator("[data-zoom-surface]");
  await expect(surface).toBeVisible();
  await page
    .getByRole("spinbutton", { name: "Canvas zoom", exact: true })
    .fill("30");
  await settled(page, surface);
  const geometry = await surface.evaluate((node) => {
    const viewport = node.parentElement!.parentElement!.parentElement!,
      rect = node.getBoundingClientRect(),
      bounds = viewport.getBoundingClientRect();
    return {
      left: rect.left,
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom,
      viewportLeft: bounds.left,
      viewportTop: bounds.top,
      viewportRight: bounds.right,
      viewportBottom: bounds.bottom,
      extraWidth: viewport.scrollWidth - viewport.clientWidth,
      extraHeight: viewport.scrollHeight - viewport.clientHeight,
    };
  });
  const panel = (await page
    .getByRole("complementary", { name: "Layers panel", exact: true })
    .boundingBox())!;
  expect(geometry.extraWidth).toBe(0);
  expect(geometry.extraHeight).toBe(0);
  expect(geometry.left).toBeGreaterThanOrEqual(geometry.viewportLeft);
  expect(geometry.top).toBeGreaterThanOrEqual(geometry.viewportTop);
  expect(geometry.right).toBeLessThanOrEqual(geometry.viewportRight);
  expect(geometry.bottom).toBeLessThanOrEqual(geometry.viewportBottom);
  expect(geometry.bottom).toBeLessThan(panel.y);
});

for (const mode of ["visual", "text"] as const) {
  for (const width of [390, 1440]) {
    test(`${mode} scrollbars let every highly zoomed page edge reach the workspace center at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto("/editor");
      if (mode === "text")
        await page.getByRole("button", { name: "Text", exact: true }).click();
      const surface = page.locator("[data-zoom-surface]");
      await expect(surface).toBeVisible();
      await page
        .getByRole("spinbutton", { name: "Canvas zoom", exact: true })
        .fill("250");
      await settled(page, surface);
      const bounds = await surface.evaluate((node) => {
        const viewport = node.parentElement!.parentElement!.parentElement!,
          viewportRect = viewport.getBoundingClientRect();
        viewport.scrollLeft = 0;
        viewport.scrollTop = 0;
        const start = node.getBoundingClientRect();
        viewport.scrollLeft = viewport.scrollWidth;
        viewport.scrollTop = viewport.scrollHeight;
        const end = node.getBoundingClientRect();
        return {
          startX: start.left,
          startY: start.top,
          endX: end.right,
          endY: end.bottom,
          centerX: viewportRect.left + viewport.clientWidth / 2,
          centerY: viewportRect.top + viewport.clientHeight / 2,
          rangeX: viewport.scrollWidth - viewport.clientWidth,
          rangeY: viewport.scrollHeight - viewport.clientHeight,
          pageWidth: start.width,
          pageHeight: start.height,
        };
      });
      expect(Math.abs(bounds.startX - bounds.centerX)).toBeLessThan(12);
      expect(Math.abs(bounds.startY - bounds.centerY)).toBeLessThan(12);
      expect(Math.abs(bounds.endX - bounds.centerX)).toBeLessThan(12);
      expect(Math.abs(bounds.endY - bounds.centerY)).toBeLessThan(12);
      expect(bounds.rangeX).toBeGreaterThanOrEqual(bounds.pageWidth - 1);
      expect(bounds.rangeY).toBeGreaterThanOrEqual(bounds.pageHeight - 1);
    });
  }
}
