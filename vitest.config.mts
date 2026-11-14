import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  css: { postcss: { plugins: [] } },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./vitest.setup.ts",
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
});
