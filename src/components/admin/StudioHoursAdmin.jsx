import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Plus, Trash2, Clock, Save } from "lucide-react";
import { format } from "date-fns";

export default function StudioHoursAdmin({ artist }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ hours: "", date: new Date().toISOString().split("T")[0], concept: "" });

  const totalHours = artist?.studio_hours_total || 0;

  const { data: logs = [] } = useQuery({
    queryKey: ["studio-hours-log", artist.id],
    queryFn: () => base44.entities.StudioHoursLog.filter({ artist_id: artist.id }),
  });

  const consumed = logs.reduce((sum, l) => sum + (l.hours || 0), 0);
  const remaining = Math.max(totalHours - consumed, 0);

  const addLogMutation = useMutation({
    mutationFn: (data) => base44.entities.StudioHoursLog.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studio-hours-log", artist.id] });
      setForm({ hours: "", date: new Date().toISOString().split("T")[0], concept: "" });
    }
  });

  const deleteLogMutation = useMutation({
    mutationFn: (id) => base44.entities.StudioHoursLog.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["studio-hours-log", artist.id] })
  });

  const updateTotalMutation = useMutation({
    mutationFn: (val) => base44.entities.Artist.update(artist.id, { studio_hours_total: val }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["artists"] });
      queryClient.invalidateQueries({ queryKey: ["artist", artist.id] });
    }
  });

  const [editTotal, setEditTotal] = useState(String(totalHours));

  const handleAddLog = () => {
    const h = parseFloat(form.hours);
    if (!h || h <= 0 || !form.date) return;
    addLogMutation.mutate({ artist_id: artist.id, hours: h, date: form.date, concept: form.concept });
  };

  const handleSaveTotal = () => {
    const v = parseFloat(editTotal);
    if (!isNaN(v) && v >= 0) updateTotalMutation.mutate(v);
  };

  return (
    <div className="space-y-5">
      {/* Resumen */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total asignadas", value: totalHours, color: "text-white" },
          { label: "Consumidas", value: consumed, color: "text-amber-400" },
          { label: "Disponibles", value: remaining, color: remaining <= 5 ? "text-red-400" : "text-emerald-400" },
        ].map(s => (
          <div key={s.label} className="bg-white/[0.04] rounded-xl p-3 text-center border border-white/[0.06]">
            <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
            <div className="text-[10px] text-white/30 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Editar total */}
      <div className="bg-white/[0.03] rounded-xl border border-white/[0.07] p-4">
        <label className="text-xs text-white/40 mb-2 block font-medium">Horas totales asignadas al artista</label>
        <div className="flex gap-2">
          <input
            type="number"
            min="0"
            step="0.5"
            value={editTotal}
            onChange={e => setEditTotal(e.target.value)}
            className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500/50"
          />
          <button
            onClick={handleSaveTotal}
            disabled={updateTotalMutation.isPending}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-white text-sm font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            Guardar
          </button>
        </div>
      </div>

      {/* Registrar consumo */}
      <div className="bg-white/[0.03] rounded-xl border border-white/[0.07] p-4">
        <div className="flex items-center gap-2 mb-3">
          <Plus className="w-3.5 h-3.5 text-white/40" />
          <span className="text-xs font-semibold text-white/50 uppercase tracking-widest">Registrar consumo</span>
        </div>
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-white/30 mb-1 block">Horas consumidas</label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                placeholder="2"
                value={form.hours}
                onChange={e => setForm({ ...form, hours: e.target.value })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500/50"
              />
            </div>
            <div>
              <label className="text-[10px] text-white/30 mb-1 block">Fecha</label>
              <input
                type="date"
                value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500/50"
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] text-white/30 mb-1 block">Concepto (opcional)</label>
            <input
              type="text"
              placeholder="Ej: Sesión de grabación vocal"
              value={form.concept}
              onChange={e => setForm({ ...form, concept: e.target.value })}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500/50"
            />
          </div>
          <button
            onClick={handleAddLog}
            disabled={!form.hours || addLogMutation.isPending}
            className="w-full py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 rounded-lg text-amber-400 text-sm font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-40"
          >
            <Clock className="w-3.5 h-3.5" />
            {addLogMutation.isPending ? "Registrando..." : "Registrar horas consumidas"}
          </button>
        </div>
      </div>

      {/* Historial */}
      <div>
        <p className="text-[10px] text-white/30 uppercase tracking-widest font-semibold mb-3">Historial</p>
        {logs.length === 0 ? (
          <p className="text-xs text-white/20 text-center py-6">Sin registros aún</p>
        ) : (
          <div className="space-y-2">
            {[...logs].sort((a, b) => new Date(b.date) - new Date(a.date)).map(log => (
              <div key={log.id} className="flex items-center justify-between p-3 bg-white/[0.03] rounded-xl border border-white/[0.05] group">
                <div className="flex items-center gap-3">
                  <div className="text-xs font-mono text-white/30">{log.date}</div>
                  <div>
                    <span className="text-sm font-semibold text-amber-400">-{log.hours}h</span>
                    {log.concept && <span className="text-xs text-white/35 ml-2">{log.concept}</span>}
                  </div>
                </div>
                <button
                  onClick={() => deleteLogMutation.mutate(log.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 rounded-lg text-red-400 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}