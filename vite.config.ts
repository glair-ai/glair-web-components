import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: [
        "src/components/passive-liveness.ts",
        "src/components/liveness-hint.ts",
      ],
      formats: ["es"],
    },
    rollupOptions: {
      external: /^lit/,
    },
  },
});
