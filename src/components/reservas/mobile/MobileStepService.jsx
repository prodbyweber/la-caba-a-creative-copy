import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { normalizeService, formatPrice } from "@/lib/reservations";

// Tarjeta premium vertical para una opción de sesión.
function ServiceCard({ svc, selected, onClick }) {
  const h = svc.duration_hours || 0;
  const isBeatmaking = svc.subcategory === "Estudio + Beatmaking";
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 px-5 py-5 rounded-2xl text-left transition-all"
      style={{
        background: selected ? "rgba(255,88,51,0.06)" : "rgba(255,255,255,0.02)",
        border: selected ? "1.5px solid #ff5833" : "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div
        className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center transition-all"
        style={{
          background: selected ? "#ff5833" : "transparent",
          border: selected ? "none" : "1.5px solid rgba(255,255,255,0.2)",
        }}
      >
        {selected && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-lg font-bold tracking-tight">{h} horas</p>
        <p className="text-white/40 text-sm mt-0.5">{isBeatmaking ? "Beatmaking personalizado" : "Sesión de estudio"}</p>
      </div>
      <span className="text-white font-black text-xl flex-shrink-0">{formatPrice(svc.price)}</span>
    </button>
  );
}

// Paso 1 mobile: Selección de sesión de estudio.
export default function MobileStepService({ selectedService, onSelect }) {
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
    <div className="space-y-7">
      <div>
        <h2 className="text-[28px] font-black text-white mb-1.5" style={{ letterSpacing: "-0.02em" }}>
          Elige tu sesión
        </h2>
        <p className="text-white/40 text-sm">Selecciona la sesión que quieres reservar.</p>
      </div>

      {isLoading && <p className="text-white/40 text-sm">Cargando sesiones…</p>}

      {horas.length > 0 && (
        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#ff5833] mb-3">Horas de estudio</h3>
          <div className="space-y-3">
            {horas.map(svc => (
              <ServiceCard key={svc.id} svc={svc} selected={isSel(svc)} onClick={() => onSelect(normalizeService(svc))} />
            ))}
          </div>
        </div>
      )}

      {beatmaking.length > 0 && (
        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#ff5833] mb-3">Estudio + Beatmaking</h3>
          <div className="space-y-3">
            {beatmaking.map(svc => (
              <ServiceCard key={svc.id} svc={svc} selected={isSel(svc)} onClick={() => onSelect(normalizeService(svc))} />
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