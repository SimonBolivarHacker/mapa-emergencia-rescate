/**
 * Next.js ESLint flat config for apps that use Next.js.
 *
 * Composes @eslint/js recommended + eslint-config-next (which bundles
 * typescript-eslint, react, react-hooks, jsx-a11y, @next/eslint-plugin-next)
 * plus the shared boundary rules and vitest test block.
 *
 * Does NOT spread the full base config to avoid plugin re-registration conflicts:
 * eslint-config-next re-registers jsx-a11y and typescript-eslint internally, so
 * including base wholesale would cause "Cannot redefine plugin" errors.
 *
 * Resolution requires `next` to be installed in the consumer app.
 */

import js from "@eslint/js";
import nextConfig from "eslint-config-next";

import sharedConfigs from "./shared.mjs";

/** @type {import("eslint").Linter.Config[]} */
const config = [
  // 1. @eslint/js recommended baseline
  js.configs.recommended,

  // 2. Next.js flat config (bundles typescript-eslint, react, react-hooks,
  //    jsx-a11y, and @next/eslint-plugin-next)
  ...nextConfig,

  // 3 & 4. Boundary rules (GC10) + vitest block — sourced from shared.mjs.
  //   shared.mjs does NOT register jsx-a11y or typescript-eslint plugins,
  //   so there is no "Cannot redefine plugin" conflict with eslint-config-next.
  ...sharedConfigs,
];

export default config;
