import { defineConfig } from "tsup";
import pkg from "./package.json";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    core: "src/core/index.ts",
    react: "src/core/react/index.ts",
  },
  format: ["cjs", "esm"],
  dts: false,
  clean: true,
  external: [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
    "next/dynamic",
    "next/dynamic.js",
    "next/link",
    "next-themes",
    "react",
    "react-dom",
    "lexical",
    "@lexical/clipboard",
    "@lexical/code",
    "@lexical/history",
    "@lexical/html",
    "@lexical/link",
    "@lexical/list",
    "@lexical/markdown",
    "@lexical/react",
    "@lexical/rich-text",
    "@lexical/selection",
    "@lexical/table",
    "@lexical/utils",
    /\.css$/,
  ],
  minify: false,
  sourcemap: false,
  treeshake: false,
  shims: false,
  esbuildOptions(options) {
    options.inject = ["./react-shim.js"];
  },
});
