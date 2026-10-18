import { expect, test } from "@playwright/test";

for (const width of [1440, 390, 320]) {
  for (const reducedMotion of ["no-preference", "reduce"] as const) {
    test(`Dock clips rapid mode transitions without scaling at ${width}px with ${reducedMotion}`, async ({
      page,
    }, testInfo) => {
      await page.setViewportSize({ width, height: 1000 });
      await page.emulateMedia({ reducedMotion });
      await page.goto("/editor");
      const dock = page.getByRole("navigation", {
        name: "Editor tools",
        exact: true,
      });
      const visual = dock.getByRole("button", { name: "Visual", exact: true });
      const zoom = dock.getByRole("spinbutton", {
        name: "Canvas zoom",
        exact: true,
      });
      await expect(
        dock.getByRole("button", { name: "Select", exact: true }),
      ).toBeVisible();
      const initialZoom = await zoom.inputValue();
      const observations = await dock.evaluate(async (nav) => {
        const modes = nav.querySelector('[role="group"]')!;
        const buttons = modes.querySelectorAll<HTMLButtonElement>("button");
        const reveal = nav.querySelector<HTMLElement>("[data-open]")!;
        const clip = reveal.firstElementChild!;
        const zoomSection = modes.nextElementSibling!;
        const violations: string[] = [];
        let frames = 0;
        let sampleUntil = true;
        const overlaps = (
          a: { left: number; right: number; top: number; bottom: number },
          b: DOMRect,
        ) =>
          Math.min(a.right, b.right) - Math.max(a.left, b.left) > 0.5 &&
          Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 0.5;
        function sample() {
          frames++;
          const mask = clip.getBoundingClientRect();
          const controls = [
            modes.getBoundingClientRect(),
            zoomSection.getBoundingClientRect(),
          ];
          for (const icon of reveal.querySelectorAll("button svg")) {
            const rect = icon.getBoundingClientRect();
            const visible = {
              left: Math.max(rect.left, mask.left),
              right: Math.min(rect.right, mask.right),
              top: Math.max(rect.top, mask.top),
              bottom: Math.min(rect.bottom, mask.bottom),
            };
            if (
              visible.right > visible.left &&
              visible.bottom > visible.top &&
              controls.some((control) => overlaps(visible, control))
            )
              violations.push(`tools overlap controls on frame ${frames}`);
          }
          for (const node of [
            nav,
            modes,
            zoomSection,
            ...buttons,
            ...nav.querySelectorAll("button svg,input"),
          ]) {
            const transform = getComputedStyle(node).transform;
            if (transform === "none") continue;
            const matrix = new DOMMatrixReadOnly(transform);
            if (
              Math.abs(matrix.a - 1) > 0.001 ||
              Math.abs(matrix.d - 1) > 0.001 ||
              Math.abs(matrix.b) > 0.001 ||
              Math.abs(matrix.c) > 0.001
            )
              violations.push(
                `scaled control on frame ${frames}: ${transform}`,
              );
          }
          const bounds = nav.getBoundingClientRect();
          if (bounds.left < -0.5 || bounds.right > window.innerWidth + 0.5)
            violations.push(`Dock leaves viewport on frame ${frames}`);
          if (sampleUntil) requestAnimationFrame(sample);
        }
        const frame = () =>
          new Promise<void>((resolve) => {
            requestAnimationFrame(() => resolve());
          });
        requestAnimationFrame(sample);
        // Real controls, one frame between events: interruption starts from current geometry.
        for (let index = 0; index < 8; index++) {
          buttons[index % 2 ? 0 : 1].click();
          await frame();
          await frame();
        }
        // Observe the actual transition until geometry stops changing, not a fixed delay.
        let stable = 0;
        let previous = "";
        for (let index = 0; index < 90 && stable < 3; index++) {
          await frame();
          const rect = reveal.getBoundingClientRect();
          const current = `${rect.width.toFixed(3)}:${rect.height.toFixed(3)}`;
          stable = current === previous ? stable + 1 : 0;
          previous = current;
        }
        sampleUntil = false;
        return {
          frames,
          violations,
          finalMode: modes.getAttribute("data-mode"),
          settled: stable >= 3,
        };
      });
      expect(observations.frames).toBeGreaterThan(8);
      expect(observations.violations).toEqual([]);
      expect(observations.settled).toBe(true);
      expect(observations.finalMode).toBe("visual");
      await expect(visual).toHaveAttribute("aria-pressed", "true");
      await expect(zoom).toHaveValue(initialZoom);
      await expect(
        page.getByRole("article", { name: "Resume canvas", exact: true }),
      ).toBeVisible();
      const transition = await dock.evaluate(async (nav) => {
        const reveal = nav.querySelector<HTMLElement>("[data-open]")!;
        const clip = reveal.firstElementChild!;
        const modes = nav.querySelector('[role="group"]')!;
        const axis = window.innerWidth <= 850 ? "height" : "width";
        const initial = clip.getBoundingClientRect()[axis];
        const samples: {
          size: number;
          navWidth: number;
          navHeight: number;
          time: number;
        }[] = [];
        const started = performance.now();
        modes.querySelectorAll<HTMLButtonElement>("button")[1].click();
        for (let index = 0; index < 90; index++) {
          await new Promise<void>((resolve) => {
            requestAnimationFrame(() => resolve());
          });
          const size = clip.getBoundingClientRect()[axis];
          const bounds = nav.getBoundingClientRect();
          samples.push({
            size,
            navWidth: bounds.width,
            navHeight: bounds.height,
            time: performance.now() - started,
          });
          if (
            size < 0.5 &&
            !reveal
              .getAnimations({ subtree: true })
              .some((animation) => animation.playState === "running")
          )
            break;
        }
        const intermediate = new Set(
          samples
            .filter(({ size }) => size > 0.5 && size < initial - 0.5)
            .map(({ size }) => size.toFixed(2)),
        );
        return { axis, initial, intermediateCount: intermediate.size, samples };
      });
      await testInfo.attach("dock-motion-geometry", {
        body: JSON.stringify({ rapid: observations, transition }, null, 2),
        contentType: "application/json",
      });
      {
        const remainder = transition.samples.map(
          ({ size, navWidth, navHeight }) =>
            (transition.axis === "width" ? navWidth : navHeight) - size,
        );
        // A single reveal makes the nav follow its clip exactly. Intrinsic fr
        // sizing previously shrank these twice at different rates.
        expect(Math.max(...remainder) - Math.min(...remainder)).toBeLessThan(
          0.75,
        );
      }
      await expect(dock.locator("[data-open]")).toHaveAttribute(
        "aria-hidden",
        "true",
      );
      await expect(dock.locator("[data-open]")).toHaveAttribute("inert", "");
      await expect(
        dock.getByRole("button", { name: "Select", exact: true }),
      ).toHaveCount(0);
      await expect
        .poll(() =>
          dock.locator("[data-open]").evaluate((reveal) => {
            const clip = reveal.firstElementChild!.getBoundingClientRect();
            return window.innerWidth <= 850 ? clip.height : clip.width;
          }),
        )
        .toBeLessThan(0.5);
      await expect(
        page.getByRole("article", { name: "Text workspace", exact: true }),
      ).toBeVisible();
      if (reducedMotion === "no-preference") {
        const interpolation = await dock.evaluate(async (nav) => {
          const reveal = nav.querySelector<HTMLElement>("[data-open]")!;
          const clip = reveal.firstElementChild!;
          const axis = window.innerWidth <= 850 ? "height" : "width";
          // Capture the real transition before a busy host can skip its frames.
          // RAF observations above still check uninterrupted product geometry.
          const animation = await new Promise<CSSTransition>(
            (resolve, reject) => {
              const observer = new MutationObserver(() => {
                if (reveal.getAttribute("data-open") !== "true") return;
                observer.disconnect();
                const transition = reveal
                  .getAnimations()
                  .find(
                    (candidate): candidate is CSSTransition =>
                      candidate instanceof CSSTransition &&
                      candidate.transitionProperty === axis,
                  );
                if (!transition) {
                  reject(new Error(`Missing ${axis} reveal transition`));
                  return;
                }
                transition.pause();
                resolve(transition);
              });
              observer.observe(reveal, {
                attributes: true,
                attributeFilter: ["data-open"],
              });
              nav
                .querySelector('[role="group"]')!
                .querySelector<HTMLButtonElement>("button")!
                .click();
            },
          );
          const duration = Number(
            animation.effect!.getComputedTiming().activeDuration,
          );
          const samples = [0, 0.25, 0.5, 0.75, 1].map((progress) => {
            animation.currentTime = progress * duration;
            const bounds = nav.getBoundingClientRect();
            return {
              progress,
              size: clip.getBoundingClientRect()[axis],
              navSize: bounds[axis],
            };
          });
          animation.finish();
          return { axis, duration, samples };
        });
        await testInfo.attach("dock-motion-interpolation", {
          body: JSON.stringify(interpolation, null, 2),
          contentType: "application/json",
        });
        expect(interpolation.duration).toBeGreaterThan(0);
        const sizes = interpolation.samples.map(({ size }) => size);
        expect(sizes[0]).toBeLessThan(0.5);
        expect(sizes.at(-1)).toBeCloseTo(transition.initial, 1);
        for (let index = 1; index < sizes.length; index++)
          expect(sizes[index] - sizes[index - 1]).toBeGreaterThan(0.5);
        expect(
          new Set(sizes.slice(1, -1).map((size) => size.toFixed(2))).size,
        ).toBe(3);
        const remainder = interpolation.samples.map(
          ({ navSize, size }) => navSize - size,
        );
        expect(Math.max(...remainder) - Math.min(...remainder)).toBeLessThan(
          0.75,
        );
      } else {
        await visual.click();
      }
      await expect(
        dock.getByRole("button", { name: "Select", exact: true }),
      ).toBeVisible();
      await expect
        .poll(() =>
          dock.evaluate(
            (nav) =>
              nav
                .getAnimations({ subtree: true })
                .filter((animation) => animation.playState === "running")
                .length,
          ),
        )
        .toBe(0);
      expect(
        await dock.locator("[data-open]").evaluate((reveal) => {
          const clip = reveal.firstElementChild!.getBoundingClientRect();
          return Array.from(reveal.querySelectorAll("button svg")).every(
            (icon) => {
              const rect = icon.getBoundingClientRect();
              return (
                rect.left >= clip.left - 0.5 &&
                rect.right <= clip.right + 0.5 &&
                rect.top >= clip.top - 0.5 &&
                rect.bottom <= clip.bottom + 0.5
              );
            },
          );
        }),
      ).toBe(true);
      const before = await dock.boundingBox();
      await zoom.fill("99");
      await zoom.fill("100");
      await zoom.press("Tab");
      const after = await dock.boundingBox();
      expect(after!.width).toBeCloseTo(before!.width, 1);
      expect(after!.height).toBeCloseTo(before!.height, 1);
      await expect(zoom).toHaveValue("100");
      await expect(
        page.getByRole("button", { name: "Undo", exact: true }),
      ).toBeDisabled();
      await page.screenshot({
        path: `artifacts/visual/dock-motion-${width}-${reducedMotion}.png`,
        animations: "disabled",
      });
    });
  }
}
