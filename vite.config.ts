import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(
    Boolean
  ),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"),
        "content-script": path.resolve(__dirname, "src/content-script.ts"),
        // "injected-script": path.resolve(__dirname, "src/injected-script.ts"),
        background: path.resolve(__dirname, "src/background.ts"),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          const specialFiles = [
            "content-script",
            "injected-script",
            "background",
          ];
          if (specialFiles.includes(chunkInfo.name)) {
            return `${chunkInfo.name}.js`;
          }
          return "assets/[name]-[hash].js";
        },
      },
    },
  },
}));
