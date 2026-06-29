/**
 * Shared Vitest config preset for the monorepo.
 *
 * Consumer packages merge this in their vitest.config.ts:
 *   import { defineConfig, mergeConfig } from "vitest/config";
 *   import base from "@repo/config/vitest";
 *   export default mergeConfig(base, defineConfig({ ... }));
 */

import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    // Node >=24 exposes import.meta.dirname natively; no __dirname shim needed.
    setupFiles: [path.resolve(import.meta.dirname, "./setup.ts")],
  },
});
