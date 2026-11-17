import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  css: { postcss: { plugins: [] } },
  test: {
    environment: "jsdom",
    pool: "vmThreads",
    globals: true,
    exclude: ["**/node_modules/**", "**/dist/**", "e2e/**", "docs/**", "examples/**"],
    setupFiles: "./vitest.setup.ts",
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
});
