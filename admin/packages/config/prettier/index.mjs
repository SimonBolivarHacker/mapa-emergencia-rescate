/**
 * Shared Prettier config preset for the monorepo.
 *
 * Keeps Prettier defaults except for the minimal overrides needed.
 * Consumer packages reference this via their prettier.config.mjs:
 *   import base from "@repo/config/prettier";
 *   export default { ...base };
 *
 * Or in package.json:
 *   "prettier": "@repo/config/prettier"
 * (Prettier supports string resolution via exports when `"prettier"` key points
 *  to a module that exports the config object.)
 */

/** @type {import("prettier").Config} */
const config = {
  semi: true,
  singleQuote: false,
  tabWidth: 2,
  trailingComma: "all",
  printWidth: 100,
  endOfLine: "lf",
};

export default config;
