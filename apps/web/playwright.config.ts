import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end tests (KES-65): the real web app against the real API and database, in a browser.
 * They need both dev servers running (`npm run dev -w web`, and `npm run dev -w api` in
 * kestlow-api); `npm run e2e:watch -w web` runs them in a visible, slowed-down browser.
 */
export default defineConfig({
  testDir: "./e2e",
  testMatch: "**/*.e2e.ts",
  globalSetup: "./e2e/global-setup.ts",
  // Each test makes its own account, so they can run side by side.
  fullyParallel: true,
  workers: 4,
  timeout: 60_000,
  reporter: [["list"], ["html", { open: "never", outputFolder: "e2e-report" }]],
  outputDir: "e2e-results",
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://127.0.0.1:5180",
    // Kept only when a test fails, to see what went wrong.
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    launchOptions: { slowMo: Number(process.env.E2E_SLOW_MO ?? 0) },
  },
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 } },
    },
    { name: "phone", use: { ...devices["Pixel 7"] } },
  ],
});
