import type { NextConfig } from "next";
import path from "node:path";

// Cabeceras de seguridad para TODA respuesta. Un panel admin importa más que el
// sitio público: bloqueamos embebido en iframe (clickjacking sobre acciones de
// admin), sniffing de MIME, y lo marcamos noindex globalmente (el login no debe
// indexarse — el robots:false por página no cubre /robots.txt ni esta cabecera).
const SECURITY_HEADERS = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Robots-Tag", value: "noindex, nofollow" },
];

const nextConfig: NextConfig = {
  transpilePackages: ["@repo/ui"],

  // Emit a self-contained server bundle. Required for container deployments.
  output: "standalone",

  // Trace file dependencies from the monorepo root (admin/) so that workspace
  // packages (@repo/ui, @repo/config) are included in the standalone output.
  // Without this, Next traces from apps/web/ and misses packages/*.
  // import.meta.dirname = admin/apps/web — two levels up = admin/
  outputFileTracingRoot: path.join(import.meta.dirname, "../../"),

  // Anti version-skew para el roll multi-pod (mismo problema que resolvió el
  // frontend): `next build` estampa un build-id aleatorio, así que 2 pods del
  // mismo deploy servirían /_next/static/<id>/… distintos → ChunkLoadError sin
  // sticky sessions en el LB. Derivar el id del commit SHA hace que coincidan;
  // deploymentId fuerza recarga limpia cuando una pestaña vieja pega a un pod
  // nuevo. APP_BUILD_SHA llega en BUILD time (build-arg → ENV); "dev" en local.
  generateBuildId: async () => process.env.APP_BUILD_SHA || "dev",
  deploymentId: process.env.APP_BUILD_SHA || undefined,

  // Sirve /_next/static desde el CDN (R2) si está configurado, para que un chunk
  // nunca dependa de pegar al pod correcto mid-deploy. Sin setear (local) → la
  // app sirve los assets como siempre.
  assetPrefix: process.env.NEXT_PUBLIC_ASSET_PREFIX
    ? process.env.NEXT_PUBLIC_ASSET_PREFIX.replace(/\/$/, "")
    : undefined,

  async headers() {
    return [{ source: "/:path*", headers: SECURITY_HEADERS }];
  },
};

export default nextConfig;
