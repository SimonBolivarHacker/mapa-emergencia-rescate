"use client";

import { useState } from "react";

const SHARE_TEXT =
  "Mapa de Emergencia y Rescate: Terremoto en Venezuela. Reporta y consulta el estado de las zonas en tiempo real.";

export default function ShareButton() {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Mapa de Emergencia y Rescate",
          text: SHARE_TEXT,
          url,
        });
        return;
      } catch {
        // el usuario canceló o no se pudo compartir; intentamos copiar
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // sin permisos de portapapeles: no hacemos nada
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
    >
      {copied ? "✓ Enlace copiado" : "🔗 Compartir mapa"}
    </button>
  );
}
