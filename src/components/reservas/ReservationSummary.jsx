import React from "react";
import { formatPrice } from "@/lib/reservations";

// Resumen de reserva reutilizable (wizard + admin).
export default function ReservationSummary({ service, extras, date, startTime, endTime, durationHours }) {
  if (!service) return null;
  const extrasList = extras || [];
  return (
    <div className="rounded-xl border border-white/[0.07] overflow-hidden" style={{ background: "rgba(255,255,255,0.02)" }}>
      <div className="px-4 py-3 border-b border-white/[0.06]">
        <p className="text-[10px] font-bold uppercase tracking-wider text-white/30">Resumen</p>
      </div>
      <div className="p-4 space-y-3 text-sm">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-white/30 mb-0.5">Servicio</p>
          <p className="text-white font-medium">{service.name}</p>
          <p className="text-white/40 text-xs">{formatPrice(service.price)}</p>
        </div>

        {extrasList.length > 0 && (
          <div>
            <p className="text-[10px] uppercase tracking-wider text-white/30 mb-1">Extras</p>
            <div className="space-y-1">
              {extrasList.map((e, i) => (
                <div key={i} className="flex justify-between">
                  <span className="text-white/60">{e.name}{e.hours ? ` (${e.hours}h)` : ""}</span>
                  <span className="text-white/60">{formatPrice(e.price)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {date && (
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/[0.05]">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-white/30">Fecha</p>
              <p className="text-white/70">{date}</p>
            </div>
            {startTime && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-white/30">Hora</p>
                <p className="text-white/70">{startTime}{endTime ? `–${endTime}` : ""}</p>
              </div>
            )}
            {durationHours > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-white/30">Duración</p>
                <p className="text-white/70">{durationHours}h</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}