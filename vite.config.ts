import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import { componentTagger } from "lovable-tagger";
import { visualizer } from "rollup-plugin-visualizer";
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    nodePolyfills({
      protocolImports: true,
      include: ["buffer"],
    }),
    visualizer({ open: false }),
    wasm(),
    topLevelAwait(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: "esnext",
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"),
        "content-script": path.resolve(__dirname, "src/content-script.ts"),
        // "injected-script": path.resolve(__dirname, "src/injected-script.ts"),
        background: path.resolve(__dirname, "src/background.ts"),
        "passphrase-popup": path.resolve(__dirname, "src/passphrase-popup.ts"),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          const specialFiles = [
            "content-script",
            "injected-script",
            "background",
            "passphrase-popup",
          ];
          if (specialFiles.includes(chunkInfo.name)) {
            return `${chunkInfo.name}.js`;
          }
          return "assets/[name]-[hash].js";
        },
        manualChunks(id) {
          if (id.includes("node_modules")) {
            return "vendor";
          }
        },
      },
    },
  },
}));
