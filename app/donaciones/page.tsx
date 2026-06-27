import type { Metadata } from "next";
import SubPageShell from "../components/SubPageShell";

export const metadata: Metadata = {
  title: "Donaciones · Mapa de Emergencia Venezuela",
  alternates: { canonical: "/donaciones" },
  description: "Apoya económicamente a organizaciones verificadas que trabajan sobre el terreno.",
};

export default function DonacionesPage() {
  return (
    <SubPageShell breadcrumb="Donaciones">
      <section className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
        <h1 className="qi-h1">Centros de Acopio y Donaciones</h1>
        <p className="mt-2 text-sm leading-relaxed text-[var(--etext2)]">
          Apoya económicamente a organizaciones verificadas que trabajan sobre el terreno. Pronto agregaremos los números de cuenta e información aquí.
        </p>

        {/* Placeholder para los datos/diseño que enviará el usuario */}
        <div className="e-card mt-6 min-h-[300px] flex items-center justify-center p-6 text-slate-400">
          [ Espacio para el contenido de donaciones ]
        </div>
      </section>
    </SubPageShell>
  );
}
