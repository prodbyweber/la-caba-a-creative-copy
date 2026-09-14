import React, { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Clock, Loader2 } from "lucide-react";
import { getAvailableSlots, getOperatingHours, formatLongDate } from "@/lib/reservations";
import PremiumCalendar from "@/components/reservas/PremiumCalendar";

// Paso 3 mobile: Calendario + horarios en una sola columna.
export default function MobileStepDateTime({ service, date, startTime, onChange }) {
  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(date || "");
  const durationHours = service?.duration_hours || 0;

  const { data: opHours } = useQuery({ queryKey: ["studio-operating-hours"], queryFn: getOperatingHours, staleTime: 60000 });
  const closedDays = useMemo(() => {
    const set = new Set();
    if (opHours) for (let dow = 0; dow < 7; dow++) { if (opHours[dow] && opHours[dow].is_open === false) set.add(dow); }
    return set;
  }, [opHours]);

  const { data: slots = [], isLoading } = useQuery({
    queryKey: ["slots", selectedDate, durationHours],
    queryFn: () => getAvailableSlots(selectedDate, durationHours),
    enabled: !!selectedDate && durationHours > 0,
  });

  const handleSelectDate = (iso) => { setSelectedDate(iso); onChange({ date: iso, startTime: null, endTime: null }); };
  const handleSelectSlot = (slot) => onChange({ date: selectedDate, startTime: slot.start, endTime: slot.end });

  useEffect(() => {
    if (selectedDate && durationHours === 0) onChange({ date: selectedDate, startTime: null, endTime: null });
  }, [selectedDate, durationHours]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[28px] font-black text-white mb-1.5" style={{ letterSpacing: "-0.02em" }}>Fecha y hora</h2>
        <p className="text-white/40 text-sm">Elige el día y la franja horaria.</p>
      </div>

      {/* Calendario */}
      <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)" }}>
        <PremiumCalendar selectedDate={selectedDate} onSelect={handleSelectDate} minDate={today} closedDays={closedDays} />
      </div>

      {/* Horarios disponibles */}
      <div>
        {!selectedDate ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Clock className="w-7 h-7 text-white/15 mb-3" />
            <p className="text-white/30 text-sm">Selecciona un día para ver los horarios.</p>
          </div>
        ) : isLoading ? (
          <div className="flex items-center gap-2 text-white/40 text-sm py-6">
            <Loader2 className="w-4 h-4 animate-spin" /> Comprobando disponibilidad…
          </div>
        ) : slots.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Clock className="w-7 h-7 text-white/15 mb-3" />
            <p className="text-white/30 text-sm">No hay horarios disponibles para este día.</p>
          </div>
        ) : (
          <>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#ff5833] mb-1">Horarios disponibles</p>
            <p className="text-white/40 text-xs mb-4">{formatLongDate(selectedDate)}</p>
            <div className="space-y-2.5">
              {slots.map(slot => {
                const isSel = startTime === slot.start;
                return (
                  <button
                    key={slot.start}
                    disabled={!slot.available}
                    onClick={() => handleSelectSlot(slot)}
                    className="w-full flex items-center justify-between px-5 py-4 rounded-2xl text-left transition-all"
                    style={{
                      background: isSel ? "#ff5833" : slot.available ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.015)",
                      color: isSel ? "#fff" : slot.available ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.2)",
                      border: isSel ? "none" : "1px solid rgba(255,255,255,0.08)",
                      cursor: slot.available ? "pointer" : "not-allowed",
                    }}
                  >
                    <span className="text-base font-bold">{slot.start}</span>
                    <span className="text-sm opacity-60">→ {slot.end}</span>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}