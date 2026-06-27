import type { Metadata } from "next";
import SubPageShell from "../components/SubPageShell";

export const metadata: Metadata = {
  title: "Voluntario · Mapa de Emergencia Venezuela",
  alternates: { canonical: "/voluntario" },
  description: "Ofrece tu tiempo en labores de rescate, apoyo logístico o asistencia médica.",
};

export default function VoluntarioPage() {
  return (
    <SubPageShell breadcrumb="Voluntariado">
      <section className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
        <h1 className="qi-h1">Registro de Voluntarios</h1>
        <p className="mt-2 text-sm leading-relaxed text-[var(--etext2)]">
          Ofrece tu tiempo en labores de rescate, apoyo logístico o asistencia médica. Pronto agregaremos los formularios e información necesarios aquí.
        </p>

        {/* Placeholder para los datos/diseño que enviará el usuario */}
        <div className="e-card mt-6 min-h-[300px] flex items-center justify-center p-6 text-slate-400">
          [ Espacio para el contenido de voluntarios ]
        </div>
      </section>
    </SubPageShell>
  );
}
