import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import react from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";
import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  build: {
    // The app, and the waitlist landing page at /waitlist/ (KES-97).
    rolldownOptions: {
      input: {
        app: path.join(import.meta.dirname, "index.html"),
        waitlist: path.join(import.meta.dirname, "waitlist/index.html"),
      },
    },
  },
  server: {
    // 127.0.0.1 rather than localhost so it's reachable from Windows under WSL mirrored networking.
    host: "127.0.0.1",
    port: 5180,
    strictPort: true,
    // The local API (kestlow-api, `npm run dev` there) answers on 5181; same-origin /api avoids CORS.
    proxy: {
      "/api": { target: "http://127.0.0.1:5181", rewrite: (path) => path.replace(/^\/api/, "") },
    },
    // Playwright writes HTML traces and reports here mid-run; watching them reloads the page under
    // the tests.
    watch: { ignored: ["**/e2e-results/**", "**/e2e-report/**"] },
  },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          environment: "jsdom",
          globals: true,
          setupFiles: ["./src/test/setup.ts"],
        },
      },
      {
        // Renders every story in headless Chromium and fails on any render or play-function error.
        extends: true,
        plugins: [storybookTest({ configDir: path.join(import.meta.dirname, ".storybook") })],
        test: {
          name: "storybook",
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: "chromium" }],
          },
        },
      },
    ],
  },
});
