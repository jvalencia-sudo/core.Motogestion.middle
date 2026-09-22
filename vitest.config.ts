import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "url";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Mismo alias que tsconfig.json ("@/*": ["./*"]).
      "@": fileURLToPath(new URL(".", import.meta.url)),
      // Ver tests/stubs/server-only.ts.
      "server-only": fileURLToPath(new URL("./tests/stubs/server-only.ts", import.meta.url)),
    },
  },
  test: {
    // Por defecto Node (middleware, server actions, lib/fetch). Los tests de
    // componentes React piden jsdom por archivo con `// @vitest-environment jsdom`.
    environment: "node",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
  },
});
