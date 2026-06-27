"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { HandCoins } from "lucide-react";
import { formatDonationUsd } from "@/lib/donation-shared";
import { PLATFORM_EXPENSES_URL, psychologyHelpUrl } from "@/lib/site";
import { DonateModal } from "./DonateButton";
import { trackEvent } from "./openpanel";

function psychologyClickLabel(count: number): string {
  const n = count.toLocaleString("es-VE");
  return count === 1 ? `${n} persona` : `${n} personas`;
}

type MonthlyDonation = {
  raisedCents: number;
  goalCents: number;
};

export default function StickyHelpButton() {
  const pathname = usePathname();
  const [psychOpen, setPsychOpen] = useState(false);
  const [donateOpen, setDonateOpen] = useState(false);
  const [donateModalOpen, setDonateModalOpen] = useState(false);
  const [clickCount, setClickCount] = useState<number | null>(null);
  const [monthly, setMonthly] = useState<MonthlyDonation | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const psychologyUrl = psychologyHelpUrl();
  const psychologyIsExternal = !psychologyUrl.startsWith("mailto:");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/stats/psychology-help")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { count?: number } | null) => {
        if (!cancelled && typeof data?.count === "number") {
          setClickCount(data.count);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/donations", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { monthly?: MonthlyDonation } | null) => {
        if (!cancelled && data?.monthly) {
          setMonthly(data.monthly);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [donateModalOpen]);

  const trackPsychologyClick = useCallback(() => {
    trackEvent("psychology_help_requested", {
      destination: psychologyIsExternal ? "external" : "mailto",
    });
    fetch("/api/stats/psychology-help", {
      method: "POST",
      keepalive: true,
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { count?: number } | null) => {
        if (typeof data?.count === "number") {
          setClickCount(data.count);
        }
      })
      .catch(() => {});
  }, [psychologyIsExternal]);

  useEffect(() => {
    if (!psychOpen && !donateOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPsychOpen(false);
        setDonateOpen(false);
      }
    };
    const onClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setPsychOpen(false);
        setDonateOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [psychOpen, donateOpen]);

  useEffect(() => {
    const closeIfMobileSheetOpen = () => {
      if (document.body.classList.contains("mobile-sheet-open")) {
        setPsychOpen(false);
        setDonateOpen(false);
      }
    };
    closeIfMobileSheetOpen();
    const observer = new MutationObserver(closeIfMobileSheetOpen);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const raisedCents = monthly?.raisedCents ?? 0;
  const goalCents = monthly?.goalCents ?? 80_000;
  const progressPct =
    goalCents > 0 ? Math.min(100, Math.round((raisedCents / goalCents) * 100)) : 0;
  const pendingCents = Math.max(0, goalCents - raisedCents);
  const expensesIsExternal = PLATFORM_EXPENSES_URL.startsWith("http");

  return (
    <>
      <div
        ref={rootRef}
        data-sticky-help-root
        className="fixed bottom-[calc(3.75rem+env(safe-area-inset-bottom))] right-3 z-[1840] flex flex-col items-end gap-3 md:bottom-[max(1rem,env(safe-area-inset-bottom))] md:right-4 md:z-[1900]"
      >
        {psychOpen && (
          <div
            id="sticky-help-menu"
            role="menu"
            aria-hidden={false}
            className="origin-bottom-right w-[min(calc(100vw-2rem),18rem)] rounded-2xl border border-violet-200 bg-white p-4 shadow-2xl transition-all duration-200"
          >
            <p className="text-sm font-bold text-slate-900">¿Necesitas apoyo?</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">
              Primeros auxilios psicológicos en línea vía{" "}
              <strong className="font-semibold text-slate-700">Calma</strong> (voluntarios
              de la Universidad Continental). Agenda tu cita en el formulario.
            </p>

            <a
              role="menuitem"
              href={psychologyUrl}
              target={psychologyIsExternal ? "_blank" : undefined}
              rel={psychologyIsExternal ? "noopener noreferrer" : undefined}
              onClick={() => {
                setPsychOpen(false);
                trackPsychologyClick();
              }}
              data-track="psychology_help_clicked"
              className="relative mt-3 flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-500"
            >
              <span className="flex items-center gap-2">
                <span aria-hidden>💜</span>
                Solicitar cita psicológica (Calma)
              </span>
              {clickCount !== null && clickCount > 0 ? (
                <span className="text-[10px] font-medium text-violet-200">
                  {psychologyClickLabel(clickCount)} han pedido cita
                </span>
              ) : null}
            </a>

            <p className="mt-3 text-[11px] leading-relaxed text-slate-400">
              Si estás en peligro inmediato, llama a los servicios de emergencia
              (171 / 911).
            </p>
          </div>
        )}

        <div
          id="__donate-tooltip"
          role="region"
          aria-labelledby="donate-tooltip-title"
          aria-hidden={!donateOpen}
          inert={!donateOpen ? true : undefined}
          className={`e-donate-tooltip origin-bottom-right w-[min(calc(100vw-2rem),300px)] transition-all duration-200 ${
            donateOpen
              ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
              : "pointer-events-none translate-y-2 scale-95 opacity-0"
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <p id="donate-tooltip-title" className="text-sm font-bold text-slate-900">
              Ayúdanos a seguir activos
            </p>
            <a
              href={PLATFORM_EXPENSES_URL}
              target={expensesIsExternal ? "_blank" : undefined}
              rel={expensesIsExternal ? "noopener noreferrer" : undefined}
              className="shrink-0 text-xs font-semibold text-amber-700 underline decoration-amber-300 underline-offset-2 hover:text-amber-800"
              onClick={() => trackEvent("donation_expenses_clicked")}
            >
              Ver gastos
            </a>
          </div>

          <p className="mt-3 text-xs font-semibold text-slate-700">
            Recaudado este mes
          </p>
          <p className="mt-0.5 text-lg font-extrabold text-slate-900">
            {formatDonationUsd(raisedCents)}{" "}
            <span className="text-sm font-semibold text-slate-500">
              / {formatDonationUsd(goalCents)}
            </span>
          </p>

          <div
            className="mt-2 h-2 overflow-hidden rounded-full bg-amber-100"
            role="progressbar"
            aria-valuenow={progressPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Progreso de la meta mensual"
          >
            <div
              className="h-full rounded-full bg-amber-500 transition-[width] duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
            {progressPct}% de la meta mensual · {formatDonationUsd(pendingCents)}{" "}
            pendientes
          </p>

          <p className="mt-3 text-xs leading-relaxed text-slate-600">
            Plataforma 100% gratuita creada por voluntarios. Tu donación mantiene a
            familias conectadas y el mapa en línea.
          </p>

          <button
            type="button"
            onClick={() => {
              setDonateOpen(false);
              setDonateModalOpen(true);
              trackEvent("donation_fab_cta_clicked", { progressPct });
            }}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-amber-600"
          >
            <HandCoins aria-hidden className="h-4 w-4" strokeWidth={2.2} />
            Donar ahora
          </button>
        </div>

        <div className="flex flex-col items-end gap-2">
          <button
            type="button"
            aria-expanded={psychOpen}
            aria-haspopup="menu"
            aria-controls="sticky-help-menu"
            aria-label={
              psychOpen
                ? "Cerrar menú de apoyo psicológico"
                : "Abrir menú de apoyo psicológico"
            }
            onClick={() => {
              setDonateOpen(false);
              setPsychOpen((value) => !value);
            }}
            data-track="psychology_menu_toggled"
            className={`relative flex min-h-12 max-w-[calc(100vw-1.5rem)] items-center gap-2 rounded-full bg-violet-600 px-3 py-3 text-xs font-semibold text-white shadow-lg transition hover:bg-violet-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400 sm:max-w-none sm:px-4 sm:text-sm ${
              psychOpen ? "" : "animate-pulse-soft"
            }`}
          >
            <span aria-hidden className="shrink-0 text-base">
              {psychOpen ? "×" : "💜"}
            </span>
            <span className="truncate">
              {psychOpen ? "Cerrar" : "Apoyo psicológico"}
            </span>
          </button>

          <button
            id="__donate-btn"
            type="button"
            aria-expanded={donateOpen}
            aria-controls="__donate-tooltip"
            aria-label={
              donateOpen ? "Cerrar información de apoyo a la plataforma" : "Apoya Responde"
            }
            onClick={() => {
              setPsychOpen(false);
              setDonateOpen((value) => !value);
              trackEvent("donation_fab_toggled", { open: !donateOpen });
            }}
            data-track="donation_fab_toggled"
            className={`e-donate-fab-btn flex min-h-12 max-w-[calc(100vw-1.5rem)] items-center gap-2 rounded-full px-4 py-3 text-xs font-bold text-white shadow-lg transition hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 sm:max-w-none sm:text-sm ${
              donateOpen ? "" : "animate-pulse-soft"
            }`}
          >
            <HandCoins aria-hidden className="h-4 w-4 shrink-0" strokeWidth={2.2} />
            <span className="truncate">Apoya Responde</span>
          </button>
        </div>
      </div>

      <DonateModal
        open={donateModalOpen}
        onClose={() => setDonateModalOpen(false)}
        onSuccess={() => {}}
      />
    </>
  );
}
