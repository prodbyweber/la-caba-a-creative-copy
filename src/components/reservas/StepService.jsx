import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { normalizeService, formatPrice } from "@/lib/reservations";

// Etiqueta limpia para una opción de estudio.
function serviceLabel(svc) {
  const h = svc.duration_hours || 0;
  if (svc.subcategory === "Estudio + Beatmaking") return `${h} horas + Beatmaking`;
  return `${h} horas de estudio`;
}

// Fila compacta editorial para una opción de sesión.
function SessionRow({ svc, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 px-4 sm:px-5 py-4 rounded-xl text-left transition-all"
      style={{
        background: selected ? "rgba(255,88,51,0.06)" : "rgba(255,255,255,0.02)",
        border: selected ? "1.5px solid #ff5833" : "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {/* Indicador de selección */}
      <div
        className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center transition-all"
        style={{
          background: selected ? "#ff5833" : "transparent",
          border: selected ? "none" : "1.5px solid rgba(255,255,255,0.2)",
        }}
      >
        {selected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
      </div>

      {/* Etiqueta compacta de horas */}
      <span
        className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md flex-shrink-0"
        style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)" }}
      >
        {svc.duration_hours}h
      </span>

      <span className="flex-1 text-white text-sm sm:text-base font-medium min-w-0 truncate">
        {serviceLabel(svc)}
      </span>

      <span className="text-white font-bold text-base sm:text-lg flex-shrink-0 ml-auto">
        {formatPrice(svc.price)}
      </span>
    </button>
  );
}

// Paso 1: Selección de sesión de estudio.
// Solo se muestran reservas de estudio (categoría "estudio"), agrupadas en dos bloques.
export default function StepService({ selectedService, onSelect }) {
  const { data: services = [], isLoading } = useQuery({
    queryKey: ["reservation-services"],
    queryFn: () => base44.entities.ReservationService.filter({ active: true }),
  });

  const studio = services
    .filter(s => s.category === "estudio")
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  const horas = studio.filter(s => s.subcategory !== "Estudio + Beatmaking");
  const beatmaking = studio.filter(s => s.subcategory === "Estudio + Beatmaking");

  const isSel = (svc) => selectedService?.kind === "service" && selectedService?.id === svc.id;

  return (
    <div className="space-y-9">
      <div>
        <h2 className="text-2xl sm:text-3xl font-black text-white mb-1.5" style={{ letterSpacing: "-0.02em" }}>
          Elige tu sesión
        </h2>
        <p className="text-white/40 text-sm">
          Selecciona el tipo de sesión que quieres reservar en Cabaña Creative.
        </p>
      </div>

      {isLoading && <p className="text-white/40 text-sm">Cargando sesiones…</p>}

      {/* Bloque: Horas de estudio */}
      {horas.length > 0 && (
        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#ff5833] mb-3">
            Horas de estudio
          </h3>
          <div className="space-y-2">
            {horas.map(svc => (
              <SessionRow key={svc.id} svc={svc} selected={isSel(svc)} onClick={() => onSelect(normalizeService(svc))} />
            ))}
          </div>
        </div>
      )}

      {/* Bloque: Estudio + Beatmaking */}
      {beatmaking.length > 0 && (
        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#ff5833] mb-3">
            Estudio + Beatmaking
          </h3>
          <div className="space-y-2">
            {beatmaking.map(svc => (
              <SessionRow key={svc.id} svc={svc} selected={isSel(svc)} onClick={() => onSelect(normalizeService(svc))} />
            ))}
          </div>
        </div>
      )}

      {!isLoading && studio.length === 0 && (
        <p className="text-white/30 text-sm">No hay sesiones disponibles actualmente.</p>
      )}
    </div>
  );
}