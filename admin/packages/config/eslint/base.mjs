/**
 * Base ESLint flat config for all packages in the monorepo.
 *
 * Includes:
 *  1. @eslint/js recommended
 *  2. typescript-eslint recommended (flat config array)
 *  3. eslint-plugin-jsx-a11y recommended (flat config)
 *  4. Import-boundary rules (GC10): domain/application must not reach into
 *     infrastructure or ui layers; ui must not reach into context modules.
 *  5. eslint-plugin-vitest recommended + env globals, scoped to test/spec files.
 *
 * Does NOT include eslint-config-next. Use @repo/config/eslint/next for Next.js apps.
 */

import js from "@eslint/js";
import jsxA11y from "eslint-plugin-jsx-a11y";
import tseslint from "typescript-eslint";

import sharedConfigs from "./shared.mjs";

/** @type {import("eslint").Linter.Config[]} */
const config = [
  // 1. @eslint/js recommended baseline
  js.configs.recommended,

  // 2. typescript-eslint recommended (array — spread)
  ...tseslint.configs.recommended,

  // 3. jsx-a11y recommended (flat config object)
  jsxA11y.flatConfigs.recommended,

  // 4 & 5. Boundary rules (GC10) + vitest block — sourced from shared.mjs
  ...sharedConfigs,
];

export default config;
