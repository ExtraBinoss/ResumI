import { expect, test } from "@playwright/test";

for (const width of [1440, 390]) {
  test(`Text keeps its formatting bar and page geometry stable at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/editor");
    const canvas = page.getByRole("article", {
      name: "Resume canvas",
      exact: true,
    });
    await expect(canvas).toBeVisible();
    const initial = (await canvas.boundingBox())!;
    const zoom = page.getByRole("spinbutton", {
      name: "Canvas zoom",
      exact: true,
    });
    const initialZoom = await zoom.inputValue();
    await page.getByRole("button", { name: "Text", exact: true }).click();
    const workspace = page.getByRole("article", {
      name: "Text workspace",
      exact: true,
    });
    await expect(workspace).toBeVisible();
    const toolbar = page.getByRole("toolbar", {
      name: "Text editing tools",
      exact: true,
    });
    const typography = toolbar.getByRole("group", {
      name: "Typography",
      exact: true,
    });
    const bold = typography.getByRole("button", { name: "Bold", exact: true });
    await expect(bold).toBeVisible();
    await expect(bold).toBeDisabled();
    await expect(
      toolbar.getByRole("combobox", { name: "CV language", exact: true }),
    ).toBeVisible();
    await expect(
      toolbar.getByRole("button", { name: "Manage languages", exact: true }),
    ).toBeEnabled();
    const textBounds = (await workspace.boundingBox())!;
    for (const key of ["x", "y", "width", "height"] as const)
      expect(textBounds[key], `Text ${key} matches the page`).toBeCloseTo(
        initial[key],
        0,
      );
    const barBefore = (await typography.boundingBox())!;
    const field = workspace.getByRole("textbox").first();
    const fieldBefore = (await field.boundingBox())!;
    await field.focus();
    await expect(bold).toBeEnabled();
    const barSelected = (await typography.boundingBox())!;
    const fieldSelected = (await field.boundingBox())!;
    expect(barSelected.height).toBeCloseTo(barBefore.height, 1);
    expect(barSelected.y).toBeCloseTo(barBefore.y, 1);
    expect(fieldSelected.y).toBeCloseTo(fieldBefore.y, 1);
    // Deselect outside the editable field; the bar remains mounted and visible.
    await page.getByRole("button", { name: "Text", exact: true }).focus();
    await page.keyboard.press("Escape");
    await expect(bold).toBeVisible();
    await expect(bold).toBeDisabled();
    expect((await typography.boundingBox())!.height).toBeCloseTo(
      barBefore.height,
      1,
    );
    await page.getByRole("button", { name: "Visual", exact: true }).click();
    await expect(canvas).toBeVisible();
    const restored = (await canvas.boundingBox())!;
    for (const key of ["x", "y", "width", "height"] as const)
      expect(restored[key]).toBeCloseTo(initial[key], 0);
    await expect(zoom).toHaveValue(initialZoom);
    await expect(
      page.getByRole("button", { name: "Undo", exact: true }),
    ).toBeDisabled();
    await page.getByRole("button", { name: "Text", exact: true }).click();
    await page.screenshot({
      path: `artifacts/visual/text-toolbar-stable-${width}.png`,
      animations: "disabled",
    });
  });

  test(`Layers adds a page next to its tabs with keyboard activation at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/editor");
    const layers = page.getByRole("complementary", {
      name: "Layers panel",
      exact: true,
    });
    const first = layers.getByRole("tab", { name: "Page 1", exact: true });
    const add = layers.getByRole("button", { name: "Add page", exact: true });
    await expect(add).toBeVisible();
    const tabBounds = (await first.boundingBox())!;
    const plusBounds = (await add.boundingBox())!;
    expect(plusBounds.x).toBeGreaterThanOrEqual(
      tabBounds.x + tabBounds.width - 1,
    );
    expect(plusBounds.x - tabBounds.x - tabBounds.width).toBeLessThanOrEqual(
      12,
    );
    expect(plusBounds.y + plusBounds.height / 2).toBeCloseTo(
      tabBounds.y + tabBounds.height / 2,
      0,
    );
    await add.focus();
    await page.keyboard.press("Enter");
    const second = layers.getByRole("tab", { name: "Page 2", exact: true });
    await expect(second).toHaveAttribute("aria-selected", "true");
    const paper = page.getByRole("article", {
      name: "Resume canvas",
      exact: true,
    });
    await expect(paper.locator("[data-layer-id]")).toHaveCount(0);
    await page.getByRole("button", { name: "Undo", exact: true }).click();
    await expect(second).toHaveCount(0);
    await expect(first).toHaveAttribute("aria-selected", "true");
    await expect(
      paper.getByRole("heading", { name: "Alex Morgan", exact: true }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Redo", exact: true }).click();
    await expect(second).toBeVisible();
    await expect(
      page.getByRole("status", { name: "Save status", exact: true }),
    ).toHaveText("Saved");
    await page.reload();
    await expect(second).toBeVisible();
    await first.click();
    await expect(
      paper.getByRole("heading", { name: "Alex Morgan", exact: true }),
    ).toBeVisible();
  });
}

for (const width of [1440, 390]) {
  for (const reducedMotion of ["no-preference", "reduce"] as const) {
    test(`Text first visible frames preserve pose and human wheel reaches its top at ${width}px with ${reducedMotion}`, async ({
      page,
    }, testInfo) => {
      await page.setViewportSize({ width, height: 1000 });
      await page.emulateMedia({ reducedMotion });
      await page.goto("/editor");
      const canvas = page.getByRole("article", {
        name: "Resume canvas",
        exact: true,
      });
      await expect(canvas).toBeVisible();
      const zoom = page.getByRole("spinbutton", {
        name: "Canvas zoom",
        exact: true,
      });
      await zoom.fill("150");
      await expect
        .poll(() =>
          canvas.evaluate((node) => (node as HTMLElement).style.transform),
        )
        .toBe("scale(1.5)");
      await expect
        .poll(() =>
          canvas.evaluate((node) => (node as HTMLElement).style.willChange),
        )
        .toBe("");
      const initial = await canvas.evaluate((surface) => {
        const viewport = surface.parentElement!.parentElement!.parentElement!;
        viewport.scrollLeft = 130;
        viewport.scrollTop = 240;
        const rect = surface.getBoundingClientRect();
        return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
      });
      async function switchAndSample(index: number, label: string) {
        return page.evaluate(
          async ({ index, label }) => {
            const samples: {
              x: number;
              y: number;
              width: number;
              height: number;
              count: number;
              mode: string;
              zoom: string;
            }[] = [];
            let targetFrames = 0;
            const modes = document.querySelector(
              'nav[aria-label="Editor tools"] [role="group"]',
            )!;
            modes.querySelectorAll<HTMLButtonElement>("button")[index].click();
            for (let frame = 0; frame < 120; frame++) {
              await new Promise<void>((resolve) => {
                requestAnimationFrame(() => resolve());
              });
              const articles = document.querySelectorAll(
                'article[aria-label="Text workspace"],article[aria-label="Resume canvas"]',
              );
              const article = articles[0];
              const rect = article?.getBoundingClientRect();
              const mode = article?.getAttribute("aria-label") ?? "missing";
              if (mode === label) targetFrames++;
              samples.push({
                x: rect?.x ?? 0,
                y: rect?.y ?? 0,
                width: rect?.width ?? 0,
                height: rect?.height ?? 0,
                count: articles.length,
                mode,
                zoom: document.querySelector<HTMLInputElement>(
                  'input[aria-label="Canvas zoom"]',
                )!.value,
              });
              if (samples.length >= 24 && targetFrames >= 3) break;
            }
            return { samples, targetFrames };
          },
          { index, label },
        );
      }
      const text = await switchAndSample(1, "Text workspace");
      const workspace = page.getByRole("article", {
        name: "Text workspace",
        exact: true,
      });
      await expect(workspace).toBeVisible();
      const toolbar = page.getByRole("toolbar", {
        name: "Text editing tools",
        exact: true,
      });
      await expect(toolbar).toBeInViewport();
      const barBeforeWheel = (await toolbar.boundingBox())!;
      const wheelTarget = await workspace.evaluate((article) => {
        const viewport = article.closest("[data-zoom-surface]")!.parentElement!
          .parentElement!.parentElement!;
        const outer = viewport.getBoundingClientRect();
        const bar = document
          .querySelector('[role="toolbar"][aria-label="Text editing tools"]')!
          .getBoundingClientRect();
        for (const field of article.querySelectorAll<HTMLElement>(
          "[data-edit-field]",
        )) {
          const rect = field.getBoundingClientRect();
          const left = Math.max(rect.left, outer.left + 12);
          const right = Math.min(rect.right, outer.right - 12);
          const top = Math.max(rect.top, bar.bottom + 12);
          const bottom = Math.min(rect.bottom, outer.bottom - 20);
          if (right > left && bottom > top)
            return {
              x: (left + right) / 2,
              y: (top + bottom) / 2,
              beforeTop: viewport.scrollTop,
            };
        }
        throw new Error(
          "No visible Text field available for a human wheel gesture.",
        );
      });
      expect(wheelTarget.beforeTop).toBeGreaterThan(0);
      await page.mouse.move(wheelTarget.x, wheelTarget.y);
      expect(
        await page.evaluate(
          ({ x, y }) =>
            !!document.elementFromPoint(x, y)?.closest("[data-edit-field]"),
          wheelTarget,
        ),
      ).toBe(true);
      await page.mouse.wheel(0, -3000);
      await expect
        .poll(() =>
          workspace.evaluate(
            (article) =>
              article.closest("[data-zoom-surface]")!.parentElement!
                .parentElement!.parentElement!.scrollTop,
          ),
        )
        .toBe(0);
      const atTop = await workspace.evaluate((article) => {
        function bounds(node: Element) {
          const r = node.getBoundingClientRect();
          return { x: r.x, y: r.y, width: r.width, height: r.height };
        }
        return {
          paper: bounds(article),
          firstField: bounds(article.querySelector("[data-edit-field]")!),
          bar: bounds(
            document.querySelector(
              '[role="toolbar"][aria-label="Text editing tools"]',
            )!,
          ),
          appBar: bounds(document.querySelector("main > header")!),
        };
      });
      expect(atTop.bar.y).toBeCloseTo(barBeforeWheel.y, 1);
      expect(atTop.bar.height).toBeCloseTo(barBeforeWheel.height, 1);
      expect(atTop.bar.y).toBeGreaterThanOrEqual(
        atTop.appBar.y + atTop.appBar.height,
      );
      expect(atTop.firstField.y).toBeGreaterThanOrEqual(
        atTop.bar.y + atTop.bar.height,
      );
      const visual = await switchAndSample(0, "Resume canvas");
      await testInfo.attach("text-first-paint-geometry", {
        body: JSON.stringify(
          { initial, text, wheelTarget, atTop, visual },
          null,
          2,
        ),
        contentType: "application/json",
      });
      expect(text.targetFrames).toBeGreaterThanOrEqual(3);
      expect(visual.targetFrames).toBeGreaterThanOrEqual(3);
      for (const [transition, expected] of [
        [text, initial],
        [visual, atTop.paper],
      ] as const) {
        expect(transition.samples.length).toBeGreaterThanOrEqual(24);
        for (const sample of transition.samples) {
          expect(sample.count, "exactly one visible workspace per frame").toBe(
            1,
          );
          expect(sample.zoom).toBe("150");
          for (const key of ["x", "y", "width", "height"] as const)
            expect(sample[key], `${sample.mode} retains ${key}`).toBeCloseTo(
              expected[key],
              0,
            );
        }
      }
      await expect(zoom).toHaveValue("150");
      await expect(
        page.getByRole("button", { name: "Undo", exact: true }),
      ).toBeDisabled();
    });
  }
}

test("Text toolbar adds and selects a CV language without changing interface language or existing content", async ({
  page,
}) => {
  await page.goto("/editor");
  await expect(
    page.getByRole("article", { name: "Resume canvas", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Text", exact: true }).click();
  const workspace = page.getByRole("article", {
    name: "Text workspace",
    exact: true,
  });
  const toolbar = page.getByRole("toolbar", {
    name: "Text editing tools",
    exact: true,
  });
  const language = toolbar.getByRole("combobox", {
    name: "CV language",
    exact: true,
  });
  await expect(language).toContainText("English");
  await toolbar
    .getByRole("button", { name: "Manage languages", exact: true })
    .click();
  const dialog = page.getByRole("dialog", {
    name: "CV languages",
    exact: true,
  });
  await dialog.getByRole("button", { name: "French", exact: true }).click();
  await dialog.getByRole("button", { name: "Add", exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await expect(language).toContainText("French");
  await expect(
    workspace.getByRole("textbox").filter({ hasText: "Alex Morgan" }).first(),
  ).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await language.click();
  await page.getByRole("option", { name: "English", exact: true }).click();
  await expect(language).toContainText("English");
  await expect(
    page.getByRole("button", { name: "Text", exact: true }),
  ).toBeVisible();
});

for (const width of [701, 768]) {
  test(`Text tools and language controls stay inside the compact bar at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/editor");
    await expect(
      page.getByRole("article", { name: "Resume canvas", exact: true }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Text", exact: true }).click();
    const toolbar = page.getByRole("toolbar", {
      name: "Text editing tools",
      exact: true,
    });
    await expect(toolbar).toBeVisible();
    const controls = await toolbar.evaluate((bar) => {
      const bounds = bar.getBoundingClientRect();
      return {
        bar: {
          left: bounds.left,
          right: bounds.right,
          top: bounds.top,
          bottom: bounds.bottom,
        },
        controls: Array.from(
          bar.querySelectorAll("button,[role=combobox]"),
        ).map((node) => {
          const rect = node.getBoundingClientRect();
          return {
            label: node.getAttribute("aria-label"),
            left: rect.left,
            right: rect.right,
            top: rect.top,
            bottom: rect.bottom,
          };
        }),
      };
    });
    expect(controls.controls.length).toBeGreaterThanOrEqual(8);
    for (const control of controls.controls) {
      expect(control.left, `${control.label} left`).toBeGreaterThanOrEqual(
        controls.bar.left,
      );
      expect(control.right, `${control.label} right`).toBeLessThanOrEqual(
        controls.bar.right,
      );
      expect(control.top, `${control.label} top`).toBeGreaterThanOrEqual(
        controls.bar.top,
      );
      expect(control.bottom, `${control.label} bottom`).toBeLessThanOrEqual(
        controls.bar.bottom,
      );
    }
    const buttonRows = await toolbar
      .getByRole("group", { name: "Typography", exact: true })
      .getByRole("button")
      .evaluateAll((buttons) =>
        buttons.map((button) => button.getBoundingClientRect().top),
      );
    expect(buttonRows).toHaveLength(6);
    expect(Math.max(...buttonRows) - Math.min(...buttonRows)).toBeLessThan(1);
    await expect(
      toolbar.getByRole("combobox", { name: "CV language", exact: true }),
    ).toBeVisible();
    await expect(
      toolbar.getByRole("button", { name: "Manage languages", exact: true }),
    ).toBeVisible();
    await page.screenshot({
      path: `artifacts/visual/text-toolbar-compact-${width}.png`,
      animations: "disabled",
    });
  });
}
