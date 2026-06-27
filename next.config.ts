import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // `output: "standalone"` empaqueta solo lo necesario (incluido un server.js
  // mínimo) en `.next/standalone`, para correr en Docker sin instalar todo
  // node_modules. Necesario para el despliegue en Hetzner/k3s (ver Dockerfile
  // + infra/). En Vercel es inocuo. `public` y `.next/static` se copian a mano
  // en el Dockerfile, tal como indican los docs de Next.
  output: "standalone",
  // `pg` solo se usa en desarrollo local (ver lib/db.ts). Lo mantenemos fuera
  // del bundle para que se cargue como módulo de Node en tiempo de ejecución.
  serverExternalPackages: ["pg"],
};

export default nextConfig;
