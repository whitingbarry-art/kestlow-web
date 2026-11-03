import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import react from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";
import path from "node:path";
import type { Plugin } from "vite";
import { defineConfig } from "vitest/config";
import { AREA_PAGES, AREAS_INDEX_META, areaPageMeta, sitemapXml } from "./src/data/areas";
import { SITE_LINKS } from "./src/data/navigation";
import { withPageMeta } from "./src/logic/staticPages";

/**
 * What search engines read (KES-135, KES-136): sitemap.xml, made from the same lists as the pages
 * so it can't fall behind, and a copy of the app's index.html for each town and trade page with
 * its own title, description and canonical address, read without running the app. Cloudflare
 * Pages serves roofing-leads/bromley.html at /roofing-leads/bromley.
 */
function searchEnginePages(): Plugin {
  const sitemap = sitemapXml(SITE_LINKS.map((link) => link.href));
  return {
    name: "kestlow-search-engine-pages",
    // After Vite's own HTML step, which adds index.html to the bundle.
    enforce: "post",
    configureServer(server) {
      server.middlewares.use("/sitemap.xml", (_req, res) => {
        res.setHeader("Content-Type", "application/xml");
        res.end(sitemap);
      });
    },
    generateBundle(_options, bundle) {
      // Only the web app's own build: Storybook builds with this config too.
      const index = bundle["index.html"];
      if (index?.type !== "asset") return;
      this.emitFile({ type: "asset", fileName: "sitemap.xml", source: sitemap });
      const html = String(index.source);
      for (const page of [AREAS_INDEX_META, ...AREA_PAGES.map(areaPageMeta)])
        this.emitFile({
          type: "asset",
          fileName: `${page.path.slice(1)}.html`,
          source: withPageMeta(html, page),
        });
    },
  };
}

export default defineConfig({
  plugins: [react(), searchEnginePages()],
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
