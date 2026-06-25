"use client";

import { useEffect } from "react";

interface MissingPerson {
  id: string;
  name: string;
  age: number | null;
  description: string;
  lastSeen: string;
  contact: string;
  photoUrl: string | null;
  createdAt: number;
}

function extractPhone(contact: string): string | null {
  const digits = contact.replace(/[^\d+]/g, "");
  return digits.replace(/\D/g, "").length >= 7 ? digits : null;
}

interface Props {
  person: MissingPerson;
  onClose: () => void;
}

export default function MissingPersonDetail({ person, onClose }: Props) {
  const phone = extractPhone(person.contact);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="missing-detail-title"
      className="fixed inset-0 z-[2000] flex items-end justify-center bg-slate-900/60 p-0 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white shadow-xl sm:rounded-2xl"
      >
        <div className="relative">
          {person.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={person.photoUrl}
              alt={`Foto de ${person.name}`}
              className="max-h-[55vh] w-full bg-slate-100 object-contain"
            />
          ) : (
            <div className="grid h-64 w-full place-items-center bg-slate-100 text-6xl text-slate-300">
              🧍
            </div>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-xl text-slate-700 shadow-sm hover:bg-white"
          >
            ×
          </button>
        </div>

        <div className="space-y-3 p-5 sm:p-6">
          <div>
            <h3
              id="missing-detail-title"
              className="text-xl font-bold text-slate-900"
            >
              {person.name}
            </h3>
            {person.age !== null && (
              <p className="text-sm text-slate-500">{person.age} años</p>
            )}
          </div>

          {person.lastSeen && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Visto por última vez en
              </p>
              <p className="mt-0.5 text-sm text-slate-800">
                📍 {person.lastSeen}
              </p>
            </div>
          )}

          {person.description && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Descripción
              </p>
              <p className="mt-0.5 whitespace-pre-wrap text-sm text-slate-800">
                {person.description}
              </p>
            </div>
          )}

          {person.contact && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Contacto para dar información
              </p>
              {phone ? (
                <a
                  href={`tel:${phone}`}
                  className="mt-1 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700"
                >
                  📞 Llamar a {person.contact}
                </a>
              ) : (
                <p className="mt-0.5 text-sm font-medium text-slate-800">
                  {person.contact}
                </p>
              )}
            </div>
          )}

          <p className="pt-2 text-[11px] text-slate-400">
            Reportada el {new Date(person.createdAt).toLocaleString("es-VE")}
          </p>
        </div>
      </div>
    </div>
  );
}
