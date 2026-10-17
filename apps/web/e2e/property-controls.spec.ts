import { expect, test } from "@playwright/test";

test("scrubbing a property previews live, snaps rotation and commits one undo step", async ({
  page,
}) => {
  await page.goto("/editor");
  await page
    .getByRole("button", { name: "Select layer Name", exact: true })
    .click();
  const inspector = page.getByRole("complementary", {
    name: "Properties inspector",
  });
  const x = inspector.getByRole("spinbutton", { name: "Layer x", exact: true });
  const initial = Number(await x.inputValue());
  const handle = inspector.getByRole("button", {
    name: "Adjust Layer x",
    exact: true,
  });
  const box = (await handle.boundingBox())!;
  const layer = page.locator('[data-layer-name="Name"]');
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 30, box.y + box.height / 2, {
    steps: 8,
  });
  await expect(x).toHaveValue(String(initial + 6));
  await expect(layer).toHaveCSS("left", `${initial + 6}px`);
  await page.mouse.up();
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(x).toHaveValue(String(initial));
  await expect(layer).toHaveCSS("left", `${initial}px`);
  await page.screenshot({ path: "artifacts/visual/property-fields-light.png" });
  const rotation = inspector.getByRole("spinbutton", {
    name: "Rotation",
    exact: true,
  });
  const rotationHandle = inspector.getByRole("button", {
    name: "Adjust Rotation",
    exact: true,
  });
  const rotationBox = (await rotationHandle.boundingBox())!;
  await page.mouse.move(
    rotationBox.x + 10,
    rotationBox.y + rotationBox.height / 2,
  );
  await page.mouse.down();
  await page.keyboard.down("Shift");
  await page.mouse.move(
    rotationBox.x + 54,
    rotationBox.y + rotationBox.height / 2,
    { steps: 8 },
  );
  await page.mouse.up();
  await page.keyboard.up("Shift");
  await expect(rotation).toHaveValue("90");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(rotation).toHaveValue("0");
});

test("font search, categories and hover preview preserve the saved font until selection", async ({
  page,
}) => {
  await page.goto("/editor");
  await page
    .getByRole("button", { name: "Select layer Name", exact: true })
    .click();
  const heading = page
    .getByRole("article", { name: "Resume canvas" })
    .getByRole("heading", { name: "Alex Morgan", exact: true });
  const original = await heading.evaluate(
    (node) => getComputedStyle(node).fontFamily,
  );
  await page
    .getByRole("combobox", { name: "Font family", exact: true })
    .click();
  await page
    .getByRole("combobox", { name: "Font category", exact: true })
    .click();
  await page
    .getByRole("option", { name: "This computer", exact: true })
    .click();
  const serif = page
    .getByRole("listbox", { name: "Font families", exact: true })
    .getByRole("option", { name: "Serif", exact: true });
  await serif.hover();
  await expect(heading).toHaveCSS("font-family", "ui-serif, serif");
  await page.keyboard.press("Escape");
  await expect(heading).toHaveCSS("font-family", original);
  await page
    .getByRole("combobox", { name: "Font family", exact: true })
    .click();
  await page
    .getByRole("searchbox", { name: "Search fonts", exact: true })
    .fill("Space Grotesk");
  await expect(
    page.getByRole("option", { name: "Space Grotesk", exact: true }),
  ).toBeVisible();
  await expect(page.getByText("1 font", { exact: true })).toBeVisible();
  await expect(
    page.locator(
      '[data-slot="scroll-shadow"] [role="listbox"][aria-label="Font families"]',
    ),
  ).toBeVisible();
  await page.screenshot({ path: "artifacts/visual/font-picker-light.png" });
  await page.keyboard.press("Escape");
});

test("the color editor keeps its content during exit and has one focus border", async ({
  page,
}) => {
  await page.goto("/editor");
  await page
    .getByRole("button", { name: "Select layer Name", exact: true })
    .click();
  await page.getByRole("button", { name: "Text color", exact: true }).click();
  const popup = page
    .locator('[data-slot="popover-content"]')
    .filter({ has: page.locator('[data-slot="color-picker-area"]') });
  await expect(popup.locator('[data-slot="color-picker-area"]')).toBeVisible();
  const hex = popup.locator('[data-channel="hex"]');
  await hex.focus();
  await expect(hex).toHaveCSS("border-top-width", "0px");
  await expect(hex).toHaveCSS("box-shadow", "none");
  await page.screenshot({ path: "artifacts/visual/color-picker-light.png" });
  await page.evaluate(() => {
    const observations: boolean[] = [];
    Object.assign(window, { colorExitObservations: observations });
    const observer = new MutationObserver(() => {
      for (const popup of document.querySelectorAll(
        '[data-slot="popover-content"][data-closed]',
      ))
        observations.push(
          !!popup.querySelector('[data-slot="color-picker-area"]'),
        );
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["data-closed"],
    });
    setTimeout(() => observer.disconnect(), 400);
  });
  await page.getByRole("heading", { name: "Typography", exact: true }).click();
  await expect(popup).toHaveCount(0);
  const observations = await page.evaluate(
    () =>
      (window as Window & { colorExitObservations?: boolean[] })
        .colorExitObservations ?? [],
  );
  expect(observations.every(Boolean)).toBe(true);
});

test("a Google font selection embeds the downloaded face and restores it after reload", async ({
  page,
}) => {
  const { readFile } = await import("node:fs/promises");
  const bytes = await readFile(
    "node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2",
  );
  const requests: string[] = [];
  await page.route("https://fonts.googleapis.com/**", async (route) => {
    requests.push(route.request().url());
    await route.fulfill({
      contentType: "text/css",
      headers: { "access-control-allow-origin": "*" },
      body: "@font-face{font-family:'Space Grotesk';font-style:normal;font-weight:400;src:url(https://fonts.gstatic.com/resumi-test/space-grotesk.woff2) format('woff2')}",
    });
  });
  await page.route("https://fonts.gstatic.com/resumi-test/**", (route) =>
    route.fulfill({
      contentType: "font/woff2",
      body: bytes,
      headers: { "access-control-allow-origin": "*" },
    }),
  );
  await page.goto("/editor");
  await page
    .getByRole("button", { name: "Select layer Name", exact: true })
    .click();
  const heading = page
    .getByRole("article", { name: "Resume canvas" })
    .getByRole("heading", { name: "Alex Morgan", exact: true });
  await page
    .getByRole("combobox", { name: "Font family", exact: true })
    .click();
  await page
    .getByRole("searchbox", { name: "Search fonts", exact: true })
    .fill("Space Grotesk");
  const option = page.getByRole("option", {
    name: "Space Grotesk",
    exact: true,
  });
  await option.hover();
  await expect.poll(() => requests.length).toBe(1);
  await option.click();
  await expect(heading).toHaveCSS("font-family", '"Space Grotesk", sans-serif');
  await expect(
    page.getByRole("status", { name: "Save status", exact: true }),
  ).toHaveText("Saved");
  const downloaded = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export", exact: true }).click();
  await page
    .getByRole("menuitem", { name: "Portable HTML", exact: true })
    .click();
  const html = await readFile((await (await downloaded).path())!, "utf8");
  expect(html).toContain(
    "font-family:'Space Grotesk';src:url('data:font/woff2;base64,",
  );
  expect(html).toContain(bytes.toString("base64"));
  await page.reload();
  await expect(heading).toHaveCSS("font-family", '"Space Grotesk", sans-serif');
  expect(
    await page.evaluate(async () =>
      (await document.fonts.load('38px "Space Grotesk"')).some(
        (face) => face.status === "loaded",
      ),
    ),
  ).toBe(true);
});
