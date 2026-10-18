import { expect, type Page, type Locator } from "@playwright/test";
import type { Block } from "@resumi/engine";

/** Measure trusted synthetic template HTML with its own CSS, including hidden contacts. */
async function referenceGraphics(page: Page, html: string) {
  return page.evaluate(async (html) => {
    const frame = document.createElement("iframe");
    frame.title = "Synthetic template reference";
    frame.setAttribute("sandbox", "allow-same-origin");
    frame.style.cssText =
      "position:fixed;left:-20000px;top:0;width:794px;height:1123px;border:0";
    const loaded = new Promise<void>((resolve) => {
      frame.onload = () => resolve();
    });
    frame.srcdoc = html;
    document.body.appendChild(frame);
    try {
      await loaded;
      const reference = frame.contentDocument!;
      await reference.fonts.ready;
      await Promise.all(
        Array.from(reference.images, (image) => image.decode()),
      );
      function visible(element: Element) {
        const bounds = element.getBoundingClientRect();
        if (!bounds.width || !bounds.height) return false;
        for (
          let node: Element | null = element;
          node;
          node = node.parentElement
        ) {
          const css = reference.defaultView!.getComputedStyle(node);
          if (
            css.display === "none" ||
            css.visibility === "hidden" ||
            css.visibility === "collapse" ||
            Number(css.opacity) === 0
          )
            return false;
        }
        return true;
      }
      return {
        photos: Array.from(reference.querySelectorAll("img")).filter(visible)
          .length,
        drawings: Array.from(reference.querySelectorAll("svg")).filter(visible)
          .length,
      };
    } finally {
      frame.remove();
    }
  }, html);
}

export async function expectMaterializedGraphics(
  page: Page,
  canvas: Locator,
  blocks: Block[],
  html: string,
) {
  const { photos: expectedPhotos, drawings: expectedDrawings } =
    await referenceGraphics(page, html);
  const graphics = blocks.filter(
    (block) =>
      block.design?.type === "image" ||
      (block.design?.type === "shape" && !!block.design.vector),
  );
  // Simple SVGs stay vectors; complex drawings may become independently editable bitmaps.
  expect(graphics.length).toBeGreaterThanOrEqual(
    expectedPhotos + expectedDrawings,
  );
  expect(
    blocks.filter((block) => block.design?.type === "image").length,
  ).toBeGreaterThanOrEqual(expectedPhotos);
  for (const graphic of graphics) {
    const rendered = canvas
      .locator(`[data-layer-id="${graphic.id}"]`)
      .locator("svg,img")
      .first();
    await expect(rendered).toBeVisible();
    if (graphic.design?.type === "image") {
      expect(
        await rendered.evaluate(async (node) => {
          const image = node as HTMLImageElement;
          await image.decode();
          return image.naturalWidth > 0;
        }),
      ).toBe(true);
    }
  }
  await expect(page.locator("iframe")).toHaveCount(0);
}
