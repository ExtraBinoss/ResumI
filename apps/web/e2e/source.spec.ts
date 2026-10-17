import { test, expect } from "@playwright/test";
import { readFile, mkdir } from "node:fs/promises";
import { openSource, closeDialog } from "./helpers/editor";

test("HTML and React sources share validated history, sandbox preview and portable export", async ({
  page,
  context,
}) => {
  await page.goto("/editor");
  await expect(
    page.getByRole("article", { name: "Resume canvas" }),
  ).toBeVisible();
  await openSource(page);
  await expect(
    page.getByRole("heading", { name: "HTML or React" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Start with HTML", exact: true })
    .click();
  const html = page.getByRole("textbox", {
    name: "HTML resume source",
    exact: true,
  });
  await html.fill(
    '<style>body{font-family:Arial;padding:48px}h1{color:#2563eb}</style><h1>HTML resume</h1><p>Designed in code.</p><script>parent.document.body.dataset.sourceEscaped="yes"</script>',
  );
  await page
    .getByRole("button", { name: "Apply & preview", exact: true })
    .click();
  const sourceDialog = page.getByRole("dialog", {
    name: "Source",
    exact: true,
  });
  await expect(
    sourceDialog
      .frameLocator('iframe[title="HTML resume preview"]')
      .getByRole("heading", { name: "HTML resume", exact: true }),
  ).toBeVisible();
  expect(
    await page.locator("body").getAttribute("data-source-escaped"),
  ).toBeNull();
  await closeDialog(page, "Source");
  await expect(
    page.getByRole("status", { name: "Save status", exact: true }),
  ).toHaveText("Saved");
  await page.reload();
  await expect(
    page.getByRole("region", { name: "Source canvas" }),
  ).toBeVisible();
  await openSource(page);
  await expect(html).toHaveValue(/HTML resume/);
  await closeDialog(page, "Source");
  await page.getByRole("button", { name: "Visual", exact: true }).click();
  await expect(
    page.getByRole("article", { name: "Text workspace", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Visual", exact: true }).click();
  await expect(
    page.getByRole("article", { name: "Resume canvas" }),
  ).toBeVisible();
  await expect(
    page.getByRole("status", { name: "Save status", exact: true }),
  ).toHaveText("Saved");
  await page.reload();
  await expect(
    page.getByRole("article", { name: "Resume canvas" }),
  ).toBeVisible();
  await openSource(page);
  await expect(html).toHaveValue(/HTML resume/);
  await page
    .getByRole("button", { name: "New React source", exact: true })
    .click();
  const source = page.getByRole("textbox", {
    name: "React resume source",
    exact: true,
  });
  await source.fill(
    'import { useState } from "react"; export default function Resume(){ const [count,setCount]=useState(0); let isolated=false; try{parent.document.body.dataset.sourceEscaped="yes"}catch{isolated=true} return <article style={{padding:48,fontFamily:"Arial"}}><h1>React resume</h1><p>{isolated?"Opaque sandbox":"Not isolated"}</p><button onClick={()=>setCount(count+1)}>Portfolio {count}</button></article> }',
  );
  await page
    .getByRole("button", { name: "Apply & preview", exact: true })
    .click();
  const frame = sourceDialog.frameLocator(
    'iframe[title="React resume preview"]',
  );
  await expect(
    frame.getByRole("heading", { name: "React resume", exact: true }),
  ).toBeVisible();
  await expect(
    frame.getByText("Opaque sandbox", { exact: true }),
  ).toBeVisible();
  expect(
    await page.locator("body").getAttribute("data-source-escaped"),
  ).toBeNull();
  await frame.getByRole("button", { name: "Portfolio 0", exact: true }).click();
  await expect(
    frame.getByRole("button", { name: "Portfolio 1", exact: true }),
  ).toBeVisible();
  const downloadPromise = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Export portable HTML", exact: true })
    .click();
  const download = await downloadPromise;
  const content = await readFile((await download.path())!, "utf8");
  expect(content).toContain("Content-Security-Policy");
  const exported = await context.newPage();
  await exported.route("**/*", (route) => route.abort());
  await exported.setContent(
    `<iframe title="Exported resume" sandbox="allow-scripts" style="width:900px;height:1200px"></iframe>`,
  );
  await exported.locator("iframe").evaluate((frame, src) => {
    (frame as HTMLIFrameElement).srcdoc = src;
  }, content);
  await expect(
    exported
      .frameLocator("iframe")
      .getByRole("heading", { name: "React resume", exact: true }),
  ).toBeVisible();
  await exported
    .frameLocator("iframe")
    .getByRole("button", { name: "Portfolio 0", exact: true })
    .click();
  await expect(
    exported
      .frameLocator("iframe")
      .getByRole("button", { name: "Portfolio 1", exact: true }),
  ).toBeVisible();
  await exported.close();
  await mkdir("artifacts/visual", { recursive: true });
  await page.screenshot({ path: "artifacts/visual/editor-code-desktop.png" });
});

test("React template opens as editable TSX and compiler errors preserve the saved preview", async ({
  page,
}) => {
  await page.goto("/templates");
  await page
    .getByRole("link", { name: "Use React Studio", exact: true })
    .click();
  await expect(
    page.getByRole("region", { name: "Source canvas" }),
  ).toBeVisible();
  await openSource(page);
  const sourceDialog = page.getByRole("dialog", {
    name: "Source",
    exact: true,
  });
  const input = page.getByRole("textbox", {
    name: "React resume source",
    exact: true,
  });
  await expect(input).toHaveValue(/export default function Resume/);
  await expect(
    sourceDialog
      .frameLocator('iframe[title="React resume preview"]')
      .getByRole("heading", { name: "Alex Morgan", exact: true }),
  ).toBeVisible();
  await input.fill("export default function Resume( { return <p>");
  await page
    .getByRole("button", { name: "Apply & preview", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText(
    /Resume.tsx|Unexpected token|expected/i,
  );
  await expect(
    sourceDialog
      .frameLocator('iframe[title="React resume preview"]')
      .getByRole("heading", { name: "Alex Morgan", exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("region", { name: "Source canvas" }),
  ).toBeVisible();
  await openSource(page);
  await expect(input).toHaveValue(/export default function Resume/);
});
