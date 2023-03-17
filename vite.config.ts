import fs from "fs";
import { defineConfig } from "vite";

// List all files under src/components to make it as entry points
const files = fs
  .readdirSync("src/components")
  .map((file) => `src/components/${file}`);

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: [...files, "src/index.ts"],
      formats: ["es"],
    },
    outDir: "lib",
    emptyOutDir: false,
    rollupOptions: {
      external: /^lit/,
    },
  },
});
