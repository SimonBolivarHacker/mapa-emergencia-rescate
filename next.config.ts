import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // `pg` solo se usa en desarrollo local (ver lib/db.ts). Lo mantenemos fuera
  // del bundle para que se cargue como módulo de Node en tiempo de ejecución.
  serverExternalPackages: ["pg"],
  // Fija la raíz del workspace a este directorio. Sin esto Turbopack la infiere
  // por lockfiles en carpetas superiores (p. ej. un pnpm-lock.yaml en el home).
  turbopack: {
    root: import.meta.dirname,
  },
};

export default nextConfig;
