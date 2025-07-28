import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  build: {
    emptyOutDir: false,
    lib: {
      entry: path.resolve(__dirname, "src/injected-script.ts"),
      formats: ["iife"],
      name: "InjectedScript",
      fileName: () => `injected-script.js`,
    },
    rollupOptions: {
      output: {
        // avoid conflict with `window.InjectedScript`, make it silent
        globals: {},
      },
    },
  },
});
