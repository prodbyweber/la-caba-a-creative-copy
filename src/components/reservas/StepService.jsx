import React from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Clock, Music2, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { CATEGORY_LABELS, normalizeService, formatPrice } from "@/lib/reservations";

// Paso 1: Selección de servicio.
export default function StepService({ selectedService, onSelect, onPickBeat }) {
  const { data: services = [], isLoading } = useQuery({
    queryKey: ["reservation-services"],
    queryFn: () => base44.entities.ReservationService.filter({ active: true }),
  });

  const sorted = [...services].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  const categories = ["estudio", "mix_master", "digital"];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl sm:text-3xl font-black text-white mb-1.5" style={{ letterSpacing: "-0.02em" }}>Elige tu servicio</h2>
        <p className="text-white/40 text-sm">Selecciona el servicio que quieres reservar en Cabaña Creative.</p>
      </div>

      {isLoading && <p className="text-white/40 text-sm">Cargando servicios…</p>}

      {categories.map(cat => {
        const items = sorted.filter(s => s.category === cat);
        if (items.length === 0) return null;
        return (
          <div key={cat}>
            <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#ff5833] mb-3">{CATEGORY_LABELS[cat]}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {items.map(svc => {
                const isSelected = selectedService?.kind === "service" && selectedService?.id === svc.id;
                return (
                  <motion.button
                    key={svc.id}
                    whileHover={{ y: -2 }}
                    onClick={() => (svc.is_beat_picker ? onPickBeat() : onSelect(normalizeService(svc)))}
                    className="text-left p-4 rounded-xl transition-all relative"
                    style={{
                      background: isSelected ? "rgba(255,88,51,0.06)" : "rgba(255,255,255,0.025)",
                      border: isSelected ? "1.5px solid #ff5833" : "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    {isSelected && (
                      <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#ff5833] flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <div className="flex items-start gap-3 pr-7">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,255,255,0.04)" }}>
                        {svc.duration_hours ? <Clock className="w-4 h-4 text-white/40" /> : <Music2 className="w-4 h-4 text-white/40" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold text-sm leading-tight">{svc.name}</p>
                        {svc.description && <p className="text-white/40 text-xs mt-1 line-clamp-2">{svc.description}</p>}
                        <div className="flex items-center gap-2 mt-2">
                          {svc.duration_hours > 0 && <span className="text-[10px] text-white/40">{svc.duration_hours}h</span>}
                          <span className="text-sm font-bold text-[#ff5833]">{formatPrice(svc.price)}</span>
                        </div>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}