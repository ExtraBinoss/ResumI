import {
  expect,
  test,
  type Locator,
  type Page,
  type TestInfo,
} from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";

type Timing = { journey: string; state: "cold" | "warm"; milliseconds: number };
const canvas = (page: Page) =>
  page.getByRole("article", { name: "Resume canvas", exact: true });
const tab = (page: Page, path: string) =>
  page.locator(`[data-library-header] nav a[href="${path}"]`);
const heading = (page: Page, name: string) =>
  page.getByRole("heading", { name, exact: true });
const captures = (page: Page) =>
  page.evaluate(() =>
    performance
      .getEntriesByName("resumi:materialize")
      .map((entry) => entry.duration),
  );
async function measured(
  page: Page,
  action: Locator,
  ready: Locator,
  journey: string,
  state: Timing["state"],
): Promise<Timing> {
  const start = await page.evaluate(() => performance.now());
  await action.click();
  await expect(ready).toBeVisible();
  return {
    journey,
    state,
    milliseconds: await page.evaluate(
      (start) => performance.now() - start,
      start,
    ),
  };
}
async function report(
  testInfo: TestInfo,
  timings: Timing[],
  materializations: number[] = [],
) {
  const body = JSON.stringify({ timings, materializations }, null, 2);
  await mkdir("artifacts/performance", { recursive: true });
  await writeFile(
    `artifacts/performance/navigation-${testInfo.title.split(":")[0]}.json`,
    body + "\n",
  );
  await testInfo.attach("navigation-timings", {
    body,
    contentType: "application/json",
  });
}

test("public: cold/warm catalogue", async ({ page }, info) => {
  await page.goto("/");
  const timings: Timing[] = [];
  for (const state of ["cold", "warm"] as const) {
    timings.push(
      await measured(
        page,
        page
          .getByRole("main")
          .getByRole("link", { name: "Create Resume", exact: true }),
        heading(page, "Templates"),
        "landing → templates",
        state,
      ),
    );
    await expect(page.locator("[data-template-card]")).toHaveCount(20);
    await expect(page.locator("[data-route-pending]")).toHaveCount(0);
    await page.getByRole("link", { name: "ResumI home", exact: true }).click();
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Your resume",
    );
  }
  await report(info, timings);
});

test("library: cold/warm sibling routes", async ({ page }, info) => {
  await page.goto("/projects");
  const header = await page.locator("[data-library-header]").elementHandle();
  const timings: Timing[] = [];
  for (const state of ["cold", "warm"] as const) {
    timings.push(
      await measured(
        page,
        tab(page, "/templates"),
        heading(page, "Templates"),
        "projects → templates",
        state,
      ),
    );
    timings.push(
      await measured(
        page,
        tab(page, "/projects"),
        heading(page, "Your resumes"),
        "templates → projects",
        state,
      ),
    );
    expect(await header!.evaluate((node) => node.isConnected)).toBe(true);
  }
  await report(info, timings);
});

test("intent: no project created on hover", async ({ page }, info) => {
  await page.goto("/templates");
  await expect(page.locator("[data-template-card]")).toHaveCount(20);
  await page
    .getByRole("link", { name: "Use React Studio", exact: true })
    .hover();
  await tab(page, "/projects").click();
  await expect(heading(page, "No resumes yet")).toBeVisible();
  expect(await captures(page)).toEqual([]);
  await report(info, []);
});

test("native: cold/warm without capture", async ({ page }, info) => {
  await page.goto("/editor");
  await expect(canvas(page)).toBeVisible();
  await expect(page).toHaveURL(/\/editor\/[^/?]+$/);
  expect(await captures(page)).toEqual([]);
  const timings: Timing[] = [];
  await page
    .getByRole("button", { name: "Back to projects", exact: true })
    .click();
  await expect(page).toHaveURL(/\/projects$/);
  await expect(heading(page, "Your resumes")).toBeVisible();
  await page.reload();
  await expect(page).toHaveURL(/\/projects$/);
  await expect(heading(page, "Your resumes")).toBeVisible();
  for (const state of ["cold", "warm"] as const) {
    timings.push(
      await measured(
        page,
        page.getByRole("link", {
          name: "Open Alex Morgan — Resume",
          exact: true,
        }),
        canvas(page),
        "projects → native editor",
        state,
      ),
    );
    expect(await captures(page)).toEqual([]);
    await expect(page.locator("iframe,[data-route-pending]")).toHaveCount(0);
    await page
      .getByRole("button", { name: "Back to projects", exact: true })
      .click();
    await expect(page).toHaveURL(/\/projects$/);
    await expect(heading(page, "Your resumes")).toBeVisible();
  }
  await report(info, timings);
});

test("template: capture only once", async ({ page }, info) => {
  await page.goto("/templates");
  const timings = [
    await measured(
      page,
      page.getByRole("link", { name: "Use React Studio", exact: true }),
      canvas(page),
      "templates → prepared editor",
      "cold",
    ),
  ];
  await expect(page).toHaveURL(/\/editor\/[^/?]+$/);
  await expect(
    page.getByRole("status", { name: "Save status", exact: true }),
  ).toHaveText("Saved");
  const first = await captures(page);
  expect(first).toHaveLength(1);
  await expect(page.locator("iframe,[data-route-pending]")).toHaveCount(0);
  await page
    .getByRole("button", { name: "Back to projects", exact: true })
    .click();
  await expect(page).toHaveURL(/\/projects$/);
  await expect(heading(page, "Your resumes")).toBeVisible();
  timings.push(
    await measured(
      page,
      page.getByRole("link", {
        name: "Open Alex Morgan — Resume",
        exact: true,
      }),
      canvas(page),
      "projects → prepared editor",
      "warm",
    ),
  );
  expect(await captures(page)).toEqual(first);
  await expect(page.locator("iframe,[data-route-pending]")).toHaveCount(0);
  await report(info, timings, first);
});
