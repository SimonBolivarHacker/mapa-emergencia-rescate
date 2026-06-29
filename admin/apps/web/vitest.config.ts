import { defineConfig, mergeConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";
import base from "@repo/config/vitest";

export default mergeConfig(
  base,
  defineConfig({
    plugins: [react()],
    resolve: {
      alias: {
        // Mirror the TypeScript @/* → ./* path alias so vitest resolves it too.
        "@": path.resolve(import.meta.dirname),
      },
    },
    test: {
      include: ["tests/**/*.test.{ts,tsx}"],
    },
  }),
);
