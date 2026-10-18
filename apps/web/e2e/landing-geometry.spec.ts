import { expect, test, type Page } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";

// Run once with LANDING_NATIVE_SCROLLBARS=1 on a display to exercise the native
// scrollbar gutter. Keep that isolated browser window away from the user's UI.
test.use({
  headless: process.env.LANDING_NATIVE_SCROLLBARS !== "1",
  launchOptions: { args: ["--window-position=-2400,-2400"] },
});

async function geometry(page: Page) {
  return page.evaluate(() => {
    const rect = (element: Element) => {
      const { x, y, width, height } = element.getBoundingClientRect();
      return { x, y, width, height };
    };
    const wordmark = document.querySelector(
      "footer > div:last-child > a[href='#top']",
    )!;
    const ink = document.createRange();
    ink.selectNodeContents(wordmark.querySelector("span")!);
    const { x, y, width, height } = ink.getBoundingClientRect();
    return {
      viewport: window.innerWidth,
      clientWidth: document.documentElement.clientWidth,
      gutter: getComputedStyle(document.documentElement).scrollbarGutter,
      wordmark: rect(wordmark),
      ink: { x, y, width, height },
      clip: rect(wordmark.parentElement!),
      footer: rect(document.querySelector("footer")!),
      navigation: rect(document.querySelector("header nav")!),
      fontSize: getComputedStyle(wordmark).fontSize,
    };
  });
}

async function readyFonts(page: Page) {
  await page.evaluate(async () => {
    await Promise.all([
      document.fonts.load('500 14px "Source Sans 3 Variable"'),
      document.fonts.load('650 24px "Source Sans 3 Variable"'),
      document.fonts.load('650 390px "Space Grotesk Variable"'),
    ]);
    await document.fonts.ready;
  });
}

function expectStable(
  before: Awaited<ReturnType<typeof geometry>>,
  after: typeof before,
) {
  expect(after.fontSize).toBe(before.fontSize);
  for (const key of [
    "wordmark",
    "ink",
    "clip",
    "footer",
    "navigation",
  ] as const)
    for (const dimension of ["x", "y", "width", "height"] as const)
      expect(
        Math.abs(after[key][dimension] - before[key][dimension]),
        `${key}.${dimension}`,
        // Native scroll locking rounds fractional scroll offsets at noninteger
        // device scales. Sizes must stay exact; allow a subpixel translation.
      ).toBeLessThan(dimension === "y" ? 0.75 : 0.2);
}

for (const width of [320, 390, 1440, 1920]) {
  test(`visual: public chrome stays steady through scrolling and language popup at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await readyFonts(page);
    const navigation = page.getByRole("navigation", {
      name: "Main navigation",
      exact: true,
    });
    const identity = page.locator('footer a[href="https://plinka.eu"]');
    const logo = page.locator('footer a[href="/"]');
    expect(
      Math.abs(
        (await identity.boundingBox())!.x - (await logo.boundingBox())!.x,
      ),
    ).toBeLessThan(0.2);
    const first = (await navigation.boundingBox())!;
    for (const fraction of [0.25, 0.6, 1]) {
      await page.evaluate((fraction) => {
        window.scrollTo(
          0,
          (document.documentElement.scrollHeight - innerHeight) * fraction,
        );
      }, fraction);
      await expect
        .poll(async () => (await navigation.boundingBox())!.y)
        .toBe(first.y);
      const current = (await navigation.boundingBox())!;
      expect(current.x).toBe(first.x);
      expect(current.width).toBe(first.width);
    }
    const locale = page
      .locator("footer")
      .getByRole("combobox", { name: "Interface language", exact: true });
    await expect(locale).toBeInViewport();
    const before = await geometry(page);
    await locale.click();
    await expect(
      page.getByRole("option", { name: "Français", exact: true }),
    ).toBeVisible();
    // Base UI acquires its scroll lock in a zero-delay task.
    await page.evaluate(
      () =>
        new Promise<void>((resolve) => {
          requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
        }),
    );
    const opened = await geometry(page);
    const mode =
      process.env.LANDING_NATIVE_SCROLLBARS === "1" ? "native" : "overlay";
    await mkdir("artifacts/visual", { recursive: true });
    await writeFile(
      `artifacts/visual/landing-geometry-${mode}-${width}.json`,
      JSON.stringify({ before, opened }, null, 2),
    );
    expectStable(before, opened);
    await page.screenshot({
      path: `artifacts/visual/landing-language-open-${mode}-${width}.png`,
      animations: "disabled",
    });
    await page.keyboard.press("Escape");
    await expect(page.getByRole("listbox")).toBeHidden();
    await expect.poll(() => geometry(page)).toEqual(before);
    const closed = await geometry(page);
    expectStable(before, closed);
    await writeFile(
      `artifacts/visual/landing-geometry-${mode}-${width}.json`,
      JSON.stringify({ before, opened, closed }, null, 2),
    );
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width);
  });
}

for (const width of [320, 1440]) {
  for (const colorScheme of ["light", "dark"] as const) {
    test(`visual: AI marks align their visible artwork at ${width}px in ${colorScheme}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 1000 });
      await page.emulateMedia({ reducedMotion: "reduce", colorScheme });
      await page.goto("/");
      const brands = page.getByRole("group", {
        name: "Your AI tools",
        exact: true,
      });
      await brands.scrollIntoViewIfNeeded();
      const marks = await brands.evaluate(async (element) => {
        await document.fonts.ready;
        return Promise.all(
          Array.from(element.querySelectorAll("img"), async (img) => {
            const content = getComputedStyle(img).content;
            const source = new Image();
            source.src = content.startsWith("url(")
              ? content.slice(5, -2)
              : img.currentSrc;
            await source.decode();
            const box = img.getBoundingClientRect();
            const label =
              img.parentElement!.nextElementSibling!.getBoundingClientRect();
            const scale = Math.min(
              box.width / source.naturalWidth,
              box.height / source.naturalHeight,
            );
            const paintedWidth = source.naturalWidth * scale;
            const paintedHeight = source.naturalHeight * scale;
            const canvas = document.createElement("canvas");
            canvas.width = Math.ceil(box.width * 8);
            canvas.height = Math.ceil(box.height * 8);
            const context = canvas.getContext("2d")!;
            context.scale(8, 8);
            context.drawImage(
              source,
              (box.width - paintedWidth) / 2,
              (box.height - paintedHeight) / 2,
              paintedWidth,
              paintedHeight,
            );
            const pixels = context.getImageData(
              0,
              0,
              canvas.width,
              canvas.height,
            ).data;
            let left = canvas.width,
              right = 0,
              top = canvas.height,
              bottom = 0;
            for (let y = 0; y < canvas.height; y++)
              for (let x = 0; x < canvas.width; x++)
                if (pixels[(y * canvas.width + x) * 4 + 3]! >= 32) {
                  left = Math.min(left, x);
                  right = Math.max(right, x + 1);
                  top = Math.min(top, y);
                  bottom = Math.max(bottom, y + 1);
                }
            return {
              name: img.parentElement!.nextElementSibling!.textContent,
              centerDelta:
                box.y + (top + bottom) / 16 - (label.y + label.height / 2),
              labelGap: label.x - (box.x + right / 8),
              inkWidth: (right - left) / 8,
              inkHeight: (bottom - top) / 8,
            };
          }),
        );
      });
      expect(marks).toHaveLength(6);
      for (const mark of marks) {
        expect(Math.abs(mark.centerDelta), mark.name!).toBeLessThan(0.75);
        expect(mark.labelGap, mark.name!).toBeGreaterThan(4);
        expect(mark.inkHeight, mark.name!).toBeGreaterThan(14);
        expect(mark.inkWidth, mark.name!).toBeGreaterThan(14);
      }
      await mkdir("artifacts/visual", { recursive: true });
      await brands.screenshot({
        path: `artifacts/visual/landing-agent-marks-${colorScheme}-${width}.png`,
      });
      await writeFile(
        `artifacts/visual/landing-agent-marks-${colorScheme}-${width}.json`,
        JSON.stringify(marks, null, 2),
      );
    });
  }
}
