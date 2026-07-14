import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Plus, Trash2, Clock, Save, ArrowUp, ArrowDown, User } from "lucide-react";

import { useStudioHours } from "@/hooks/useStudioHours";

export default function StudioHoursAdmin({ artist }) {
  const queryClient = useQueryClient();
  const artistId = artist?.id;
  const { totalHours, consumed, remaining, logs } = useStudioHours(artistId);
  const [form, setForm] = useState({ hours: "", date: new Date().toISOString().split("T")[0], concept: "" });

  const addLogMutation = useMutation({
    mutationFn: async (data) => {
      const admin = await base44.auth.me().catch(() => null);
      const balanceAfter = Math.max(totalHours - consumed - data.hours, 0);
      return base44.entities.StudioHoursLog.create({
        ...data,
        type: "consumption",
        delta: -Math.abs(data.hours),
        balance_after: balanceAfter,
        admin_user_id: admin?.id,
        admin_user_name: admin?.full_name || admin?.email || "Admin",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studio-hours-log", artistId] });
      setForm({ hours: "", date: new Date().toISOString().split("T")[0], concept: "" });
    }
  });

  const deleteLogMutation = useMutation({
    mutationFn: (id) => base44.entities.StudioHoursLog.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["studio-hours-log", artistId] })
  });

  const updateTotalMutation = useMutation({
    mutationFn: async (val) => {
      const admin = await base44.auth.me().catch(() => null);
      const prev = totalHours;
      await base44.entities.Artist.update(artistId, { studio_hours_total: val });
      const delta = val - prev;
      if (delta !== 0) {
        await base44.entities.StudioHoursLog.create({
          artist_id: artistId,
          type: "adjustment",
          hours: Math.abs(delta),
          delta,
          balance_after: Math.max(val - consumed, 0),
          date: new Date().toISOString().split("T")[0],
          concept: delta >= 0 ? "Ajuste de horas (admin)" : "Descuento de horas (admin)",
          admin_user_id: admin?.id,
          admin_user_name: admin?.full_name || admin?.email || "Admin",
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studio-hours-log", artistId] });
      queryClient.invalidateQueries({ queryKey: ["artists"] });
      queryClient.invalidateQueries({ queryKey: ["artist", artistId] });
    }
  });

  const [editTotal, setEditTotal] = useState(String(totalHours));
  React.useEffect(() => { setEditTotal(String(totalHours)); }, [totalHours]);

  const handleAddLog = () => {
    const h = parseFloat(form.hours);
    if (!h || h <= 0 || !form.date) return;
    addLogMutation.mutate({ artist_id: artistId, hours: h, date: form.date, concept: form.concept });
  };

  const handleSaveTotal = () => {
    const v = parseFloat(editTotal);
    if (!isNaN(v) && v >= 0 && v !== totalHours) updateTotalMutation.mutate(v);
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
        {updateTotalMutation.isError && (
          <p className="text-[10px] text-red-400 mt-1.5">Error al guardar</p>
        )}
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
            {logs.map(log => {
              const isAdjust = log.type === "adjustment";
              const delta = log.delta ?? (isAdjust ? 0 : -Math.abs(log.hours));
              const positive = delta >= 0;
              return (
                <div key={log.id} className="flex items-center justify-between p-3 bg-white/[0.03] rounded-xl border border-white/[0.05] group">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${positive ? "bg-emerald-500/15" : "bg-amber-500/15"}`}>
                      {positive ? <ArrowUp className="w-3 h-3 text-emerald-400" /> : <ArrowDown className="w-3 h-3 text-amber-400" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-semibold ${positive ? "text-emerald-400" : "text-amber-400"}`}>
                          {positive ? "+" : "-"}{Math.abs(log.hours)}h
                        </span>
                        <span className="text-[10px] text-white/30 font-mono">{log.date}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 min-w-0">
                        {log.concept && <span className="text-xs text-white/35 truncate">{log.concept}</span>}
                        {log.admin_user_name && (
                          <span className="flex items-center gap-1 text-[10px] text-white/25 flex-shrink-0">
                            <User className="w-2.5 h-2.5" /> {log.admin_user_name}
                          </span>
                        )}
                      </div>
                      {typeof log.balance_after === "number" && (
                        <span className="text-[10px] text-white/20">Saldo: {log.balance_after}h</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteLogMutation.mutate(log.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 rounded-lg text-red-400 transition-all flex-shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}