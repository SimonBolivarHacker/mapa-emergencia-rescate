import { defineConfig, mergeConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import base from "@repo/config/vitest";

export default mergeConfig(
  base,
  defineConfig({
    plugins: [react()],
    test: {
      include: ["tests/**/*.test.{ts,tsx}"],
    },
  }),
);
