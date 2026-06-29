/**
 * Root ESLint flat config for the dashboard monorepo.
 * Each app/package extends this via their own eslint.config.mjs.
 * This file exists to stop ESLint from traversing up to the repo root.
 *
 * Intentionally minimal: real rules live in @repo/config/eslint and are
 * applied per-package. This only ignores build artifacts at the monorepo level.
 */

/** @type {import("eslint").Linter.Config[]} */
const config = [
  {
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "**/dist/**",
      "**/build/**",
      "**/.turbo/**",
    ],
  },
];

export default config;
