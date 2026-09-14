import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Clock, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { getAvailableSlots, WORKING_HOURS } from "@/lib/reservations";

// Paso 3: Fecha y hora.
// Servicios de estudio (duration_hours > 0): fecha + slot con comprobación de disponibilidad.
// Resto: fecha preferida (sin slot).
export default function StepDateTime({ service, date, startTime, onChange }) {
  const isStudio = (service?.duration_hours || 0) > 0;
  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(date || "");

  const { data: slots = [], isLoading } = useQuery({
    queryKey: ["slots", selectedDate, service?.duration_hours],
    queryFn: () => getAvailableSlots(selectedDate, service.duration_hours),
    enabled: isStudio && !!selectedDate,
  });

  useEffect(() => {
    if (!isStudio && selectedDate) onChange({ date: selectedDate, startTime: null, endTime: null });
  }, [selectedDate, isStudio]);

  return (
    <div className="space-y-7">
      <div>
        <h2 className="text-2xl sm:text-3xl font-black text-white mb-1.5" style={{ letterSpacing: "-0.02em" }}>Fecha y hora</h2>
        <p className="text-white/40 text-sm">
          {isStudio ? `Selecciona el día y la franja horaria. Horario: ${WORKING_HOURS.start}–${WORKING_HOURS.end}.` : "Indícanos tu fecha preferida."}
        </p>
      </div>

      {/* Fecha */}
      <div>
        <label className="flex items-center gap-2 text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
          <Calendar className="w-3.5 h-3.5" /> Fecha
        </label>
        <input
          type="date"
          min={today}
          value={selectedDate}
          onChange={(e) => { setSelectedDate(e.target.value); if (isStudio) onChange({ date: e.target.value, startTime: null, endTime: null }); }}
          className="w-full sm:max-w-xs px-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#ff5833]/50 transition-colors"
          style={{ colorScheme: "dark" }}
        />
      </div>

      {/* Slots (solo estudio) */}
      {isStudio && selectedDate && (
        <div>
          <label className="flex items-center gap-2 text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">
            <Clock className="w-3.5 h-3.5" /> Hora de inicio
          </label>
          {isLoading ? (
            <div className="flex items-center gap-2 text-white/40 text-sm"><Loader2 className="w-4 h-4 animate-spin" /> Comprobando disponibilidad…</div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {slots.map(slot => (
                <button
                  key={slot.start}
                  disabled={!slot.available}
                  onClick={() => onChange({ date: selectedDate, startTime: slot.start, endTime: slot.end })}
                  className="px-3 py-2.5 rounded-lg text-xs font-semibold transition-all"
                  style={{
                    background: startTime === slot.start ? "#ff5833" : slot.available ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.02)",
                    color: startTime === slot.start ? "#fff" : slot.available ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.2)",
                    border: startTime === slot.start ? "none" : "1px solid rgba(255,255,255,0.06)",
                    cursor: slot.available ? "pointer" : "not-allowed",
                  }}
                >
                  {slot.start}
                </button>
              ))}
            </div>
          )}
          {startTime && (
            <p className="text-sm text-[#ff5833] font-semibold mt-3">✓ {startTime}–{slots.find(s => s.start === startTime)?.end} · {service.duration_hours}h</p>
          )}
        </div>
      )}
    </div>
  );
}