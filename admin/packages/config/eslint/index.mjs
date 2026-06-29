/**
 * Default ESLint export for @repo/config.
 *
 * Re-exports the base config (no Next.js rules).
 * Non-Next packages (ui, contracts, shared…) import this.
 *
 * For Next.js apps use @repo/config/eslint/next instead.
 */

export { default } from "./base.mjs";
