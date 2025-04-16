import fs from "fs";
import { build } from "vite";
async function buildAll() {
  const files = fs
    .readdirSync("src/components")
    .filter((file) => file !== "tailwind.element.ts")
    .map((file) => `src/components/${file}`);

  for (const file of files) {
    await build({
      configFile: false,
      build: {
        lib: {
          entry: [file],
          formats: ["es"],
        },
        emptyOutDir: false,
        outDir: "standalone",
      },
    });
  }
}

buildAll().catch(console.error);
