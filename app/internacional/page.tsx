import type { Metadata } from "next";
import SubPageShell from "../components/SubPageShell";

export const metadata: Metadata = {
  title: "Ayuda Internacional · Mapa de Emergencia Venezuela",
  alternates: { canonical: "/internacional" },
  description: "Estás fuera de Venezuela. Canales internacionales de donación y coordinación.",
};

export default function InternacionalPage() {
  return (
    <SubPageShell breadcrumb="Ayuda Internacional">
      <section className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
        <h1 className="qi-h1">Canales de Ayuda Internacional</h1>
        <p className="mt-2 text-sm leading-relaxed text-[var(--etext2)]">
          Estás fuera de Venezuela. Canales internacionales de donación y coordinación. Pronto agregaremos los detalles aquí.
        </p>

        {/* Placeholder para los datos/diseño que enviará el usuario */}
        <div className="e-card mt-6 min-h-[300px] flex items-center justify-center p-6 text-slate-400">
          [ Espacio para el contenido de ayuda internacional ]
        </div>
      </section>
    </SubPageShell>
  );
}
