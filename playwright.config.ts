import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./apps/web/e2e",
  globalSetup: "./scripts/e2e-setup.ts",
  fullyParallel: false,
  workers: 1,
  timeout: 40000,
  expect: { timeout: 10000 },
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: process.env.BASE_URL ?? "http://127.0.0.1:4187",
    viewport: { width: 1440, height: 1000 },
    // Screencast capture distorts RAF measurements; retain DOM traces and failure PNGs.
    trace: {
      mode: "retain-on-failure",
      screenshots: false,
      snapshots: true,
      sources: true,
    },
    screenshot: "only-on-failure",
  },
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: "bun run preview",
        url: "http://127.0.0.1:4187",
        reuseExistingServer: !process.env.CI,
        timeout: 60000,
      },
});
