import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: ["src/components/gl-chat-widget.ts", "src/components/webcam.ts"],
      formats: ["es"],
    },
    emptyOutDir: false,
    outDir: "standalone",
  },
});
