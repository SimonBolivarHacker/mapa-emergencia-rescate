/**
 * Shared ESLint flat config objects used by both base.mjs and next.mjs.
 *
 * Contains only configs that do NOT register jsx-a11y or typescript-eslint
 * plugins — those two must remain per-file to avoid "Cannot redefine plugin"
 * errors when eslint-config-next is in the same array.
 *
 * Exports:
 *  - boundaryConfigs — two no-restricted-imports objects (GC10 DDD layering)
 *  - vitestConfig    — eslint-plugin-vitest block scoped to test/spec files
 *  - filenameCase    — unicorn/filename-case (kebabCase) for .ts/.tsx files
 *  - sharedConfigs   — array of all (spread into base/next config arrays)
 */

import unicorn from "eslint-plugin-unicorn";
import vitest from "eslint-plugin-vitest";

// 4a / 3a. domain + application layers: must not import from infrastructure or ui.
// Excludes test files — tests may import any layer to wire up integration assertions.
export const domainApplicationBoundary = {
  name: "repo/boundaries/domain-application",
  files: ["**/domain/**", "**/application/**"],
  ignores: ["**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}"],
  rules: {
    "no-restricted-imports": [
      "error",
      {
        patterns: [
          {
            group: ["**/infrastructure/**", "**/ui/**"],
            message:
              "domain/application must not depend on infrastructure or ui (DDD layering)",
          },
        ],
      },
    ],
  },
};

// 4b / 3b. ui layer: must not import from contexts (keep components domain-agnostic).
// Excludes test files — tests are allowed to import from any layer for composition tests.
export const uiBoundary = {
  name: "repo/boundaries/ui",
  files: ["**/ui/**"],
  ignores: ["**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}"],
  rules: {
    "no-restricted-imports": [
      "error",
      {
        patterns: [
          {
            group: ["**/contexts/**"],
            message: "ui must stay domain-agnostic (no imports from contexts)",
          },
        ],
      },
    ],
  },
};

// Vitest plugin rules + globals, scoped to test/spec files only.
// Merges vitest.configs.recommended (rules + plugin registration) and
// vitest.configs.env (languageOptions.globals for describe/it/expect/vi/…).
export const vitestConfig = {
  name: "repo/vitest",
  files: ["**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}"],
  plugins: vitest.configs.recommended.plugins,
  rules: vitest.configs.recommended.rules,
  languageOptions: vitest.configs.env.languageOptions,
};

// Disable the core no-unused-vars rule for TS files so that
// @typescript-eslint/no-unused-vars (enabled via typescript-eslint/eslint-config-next)
// is the sole authority on unused variables in TypeScript.  Must be placed after
// js.configs.recommended so it overrides the core rule rather than the TS one.
export const tsNoUnusedVarsOverride = {
  name: "repo/ts-no-unused-vars-override",
  files: ["**/*.{ts,tsx}"],
  rules: {
    "no-unused-vars": "off",
  },
};

// Enforce kebab-case filenames for all TypeScript source and test files.
// Scoped to .ts/.tsx only — config files (.mjs, .js, vitest.config.ts are
// already kebab-case or handled by their own conventions).
// Next.js special files (page, layout, route, etc.) are ignored so that
// future multi-word Next files (e.g. not-found.tsx) don't trip the rule.
export const filenameCaseConfig = {
  name: "repo/filename-case",
  files: ["**/*.{ts,tsx}"],
  ignores: [
    "**/page.tsx",
    "**/layout.tsx",
    "**/route.ts",
    "**/route.tsx",
    "**/middleware.ts",
    "**/loading.tsx",
    "**/error.tsx",
    "**/not-found.tsx",
    "**/template.tsx",
    "**/default.tsx",
  ],
  plugins: { unicorn },
  rules: {
    "unicorn/filename-case": ["error", { case: "kebabCase" }],
  },
};

/** All shared configs as a flat array — spread into the consumer's config. */
const sharedConfigs = [
  domainApplicationBoundary,
  uiBoundary,
  vitestConfig,
  tsNoUnusedVarsOverride,
  filenameCaseConfig,
];

export default sharedConfigs;
