import path from "path";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: ["src/components/passive-liveness.ts", "src/tim-camera.ts"],
      formats: ["es"],
    },
    emptyOutDir: false,
    outDir: "lib",
  },
});
