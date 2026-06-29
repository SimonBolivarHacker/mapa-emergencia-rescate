/**
 * Vitest global setup file.
 *
 * - Extends expect with @testing-library/jest-dom matchers.
 * - Creates an MSW v2 server (no handlers registered here; tests add them
 *   via server.use(...)).
 * - Lifecycle: beforeAll → listen (strict), afterEach → reset, afterAll → close.
 *
 * Export `server` so individual tests can register handlers:
 *   import { server } from "@repo/config/vitest/setup";
 *   server.use(http.get("/api/foo", () => HttpResponse.json({ ok: true })));
 */

import "@testing-library/jest-dom";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll } from "vitest";

// No handlers registered in the preset — each test file adds its own via
// server.use(...). onUnhandledRequest: "error" ensures no request leaks to
// the real network.
export const server = setupServer();

beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});
