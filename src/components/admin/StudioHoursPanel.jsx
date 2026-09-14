import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { clearOperatingHoursCache } from "@/lib/reservations";

const DAYS = [
  { dow: 1, label: "Lunes" },
  { dow: 2, label: "Martes" },
  { dow: 3, label: "Miércoles" },
  { dow: 4, label: "Jueves" },
  { dow: 5, label: "Viernes" },
  { dow: 6, label: "Sábado" },
  { dow: 0, label: "Domingo" },
];

// Panel de horario operativo semanal del estudio (Admin).
export default function StudioHoursPanel() {
  const queryClient = useQueryClient();
  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["studio-operating-hours"],
    queryFn: () => base44.entities.StudioOperatingHours.list("day_of_week"),
  });
  const [draft, setDraft] = useState({}); // { dow: { start_time, end_time, is_open } }
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const map = {};
    rows.forEach(r => { map[r.day_of_week] = { id: r.id, start_time: r.start_time, end_time: r.end_time, is_open: r.is_open !== false }; });
    setDraft(map);
  }, [rows]);

  const update = (dow, field, value) => {
    setDraft(d => ({ ...d, [dow]: { ...(d[dow] || {}), [field]: value } }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates = [];
      for (const day of DAYS) {
        const d = draft[day.dow];
        if (!d) continue;
        if (d.id) {
          updates.push(base44.entities.StudioOperatingHours.update(d.id, {
            start_time: d.start_time || "15:00",
            end_time: d.end_time || "23:00",
            is_open: d.is_open !== false,
          }));
        } else {
          updates.push(base44.entities.StudioOperatingHours.create({
            day_of_week: day.dow,
            start_time: d.start_time || "15:00",
            end_time: d.end_time || "23:00",
            is_open: d.is_open !== false,
          }));
        }
      }
      await Promise.all(updates);
      clearOperatingHoursCache();
      queryClient.invalidateQueries({ queryKey: ["studio-operating-hours"] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) return <div className="flex items-center gap-2 text-white/40 text-sm py-4"><Loader2 className="w-4 h-4 animate-spin" /> Cargando horario…</div>;

  return (
    <div className="rounded-xl border border-white/[0.07] overflow-hidden mb-6" style={{ background: "rgba(255,255,255,0.02)" }}>
      <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-white">Horario del estudio</p>
          <p className="text-white/40 text-xs mt-0.5">Define la apertura semanal. Las reservas solo pueden empezar dentro de estos horarios.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#ff5833] hover:bg-[#ff6b4a] text-white text-xs font-bold transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : saved ? <Check className="w-3.5 h-3.5" /> : null}
          {saving ? "Guardando…" : saved ? "Guardado" : "Guardar"}
        </button>
      </div>
      <div className="divide-y divide-white/[0.05]">
        {DAYS.map(day => {
          const d = draft[day.dow] || { start_time: "15:00", end_time: "23:00", is_open: true };
          return (
            <div key={day.dow} className="flex items-center gap-3 px-4 py-3">
              <div className="w-24 flex-shrink-0">
                <p className="text-sm text-white font-medium">{day.label}</p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer flex-shrink-0">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={d.is_open !== false}
                    onChange={(e) => update(day.dow, "is_open", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-white/10 rounded-full peer-checked:bg-[#ff5833] transition-colors" />
                  <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4" />
                </div>
              </label>
              <div className={`flex items-center gap-2 ${d.is_open === false ? "opacity-30" : ""}`}>
                <input
                  type="time"
                  value={d.start_time || "15:00"}
                  onChange={(e) => update(day.dow, "start_time", e.target.value)}
                  disabled={d.is_open === false}
                  className="px-3 py-1.5 bg-white/[0.04] border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:border-[#ff5833]/50"
                  style={{ colorScheme: "dark" }}
                />
                <span className="text-white/30 text-xs">—</span>
                <input
                  type="time"
                  value={d.end_time || "23:00"}
                  onChange={(e) => update(day.dow, "end_time", e.target.value)}
                  disabled={d.is_open === false}
                  className="px-3 py-1.5 bg-white/[0.04] border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:border-[#ff5833]/50"
                  style={{ colorScheme: "dark" }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}