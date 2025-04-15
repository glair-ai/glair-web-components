import { build } from "vite";

async function buildAll() {
  const entries = [
    "src/components/gl-chat-sidebar.ts",
    "src/components/gl-chat-widget.ts",
    "src/components/webcam.ts",
  ];
  for (const entry of entries) {
    await build({
      configFile: false,
      build: {
        lib: {
          entry: [entry],
          formats: ["es"],
        },
        emptyOutDir: false,
        outDir: "standalone",
      },
    });
  }
}

buildAll().catch(console.error);
