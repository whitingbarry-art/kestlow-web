import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  server: {
    // 127.0.0.1 rather than localhost so it's reachable from Windows under WSL mirrored networking.
    host: "127.0.0.1",
    port: 5180,
    strictPort: true,
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
  },
});
