/**
 * Router `api/public/capabilities` — catálogo de capacidades (admin RBAC).
 *
 * Solo lectura. Sirve la fuente de verdad (CAPABILITIES) para que la UI de roles
 * pueda construir el selector de capacidades. Gateado por role:read (quien
 * gestiona roles necesita ver el catálogo). No hay escritura: el catálogo es
 * fijo en código.
 */
import { Router } from "express";
import { asyncHandler, rateLimit } from "@/middleware";
import { requireCapability } from "@/middleware/auth";
import { CAPABILITIES } from "@/auth/capabilities";

export const capabilitiesRouter = Router();

capabilitiesRouter.get(
  "/",
  rateLimit({ scope: "public:capabilities:list", limit: 120 }),
  requireCapability("role:read"),
  asyncHandler(async (_req, res) => {
    res.json({ items: CAPABILITIES });
  }),
);
