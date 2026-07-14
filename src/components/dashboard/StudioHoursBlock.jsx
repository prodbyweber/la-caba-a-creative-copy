import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Clock, Plus, Minus, X } from "lucide-react";
import { useStudioHours } from "@/hooks/useStudioHours";

export default function StudioHoursBlock({ artist, isAdmin }) {
  const artistId = artist?.id;
  const { totalHours, consumed, remaining } = useStudioHours(artistId);
  const [editMode, setEditMode] = useState(false);
  const [newTotal, setNewTotal] = useState(totalHours);
  const queryClient = useQueryClient();

  React.useEffect(() => { if (editMode) setNewTotal(totalHours); }, [editMode]);

  const updateHoursMutation = useMutation({
    mutationFn: async ({ id, data, adminName, adminId, prevTotal }) => {
      const next = data.studio_hours_total;
      await base44.entities.Artist.update(id, data);
      // Registrar el ajuste como movimiento trazable con saldo final.
      const delta = next - prevTotal;
      await base44.entities.StudioHoursLog.create({
        artist_id: id,
        type: "adjustment",
        hours: Math.abs(delta),
        delta,
        balance_after: Math.max(next - consumed, 0),
        date: new Date().toISOString().split("T")[0],
        concept: delta >= 0 ? "Ajuste de horas (admin)" : "Descuento de horas (admin)",
        admin_user_id: adminId,
        admin_user_name: adminName,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studio-hours-log", artistId] });
      queryClient.invalidateQueries({ queryKey: ["artists"] });
      queryClient.invalidateQueries({ queryKey: ["artist", artistId] });
    },
  });

  const pct = totalHours > 0 ? Math.min((consumed / totalHours) * 100, 100) : 0;

  const handleSave = async () => {
    const admin = await base44.auth.me().catch(() => null);
    await updateHoursMutation.mutateAsync({
      id: artistId,
      data: { studio_hours_total: newTotal },
      adminName: admin?.full_name || admin?.email || "Admin",
      adminId: admin?.id,
      prevTotal: totalHours,
    });
    setEditMode(false);
  };

  return (
    <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-white/30" />
          <span className="text-[10px] font-semibold text-white/30 uppercase tracking-widest">Hrs. Estudio</span>
        </div>
        {isAdmin && artistId && !editMode && (
          <button
            onClick={() => { setNewTotal(totalHours); setEditMode(true); }}
            className="text-[10px] font-semibold text-white/30 hover:text-white transition-colors"
          >
            Editar
          </button>
        )}
      </div>

      {editMode && isAdmin ? (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setNewTotal(v => Math.max(0, v - 1))}
              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
            >
              <Minus className="w-3.5 h-3.5 text-white/60" />
            </button>
            <input
              type="number"
              value={newTotal}
              onChange={(e) => setNewTotal(parseInt(e.target.value) || 0)}
              className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-2xl font-black text-center focus:outline-none focus:border-white/20"
              style={{ WebkitAppearance: "none", MozAppearance: "textfield" }}
            />
            <button
              onClick={() => setNewTotal(v => v + 1)}
              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-white/60" />
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setEditMode(false)}
              className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-white/50 transition-colors flex items-center justify-center gap-1"
            >
              <X className="w-3 h-3" /> Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={updateHoursMutation.isPending}
              className="flex-1 py-2 rounded-lg text-xs font-bold text-white transition-colors disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #7c4dff, #a78bfa)" }}
            >
              {updateHoursMutation.isPending ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-end gap-2 mb-3">
            <span className="text-3xl font-black text-white leading-none">{remaining}</span>
            <span className="text-sm text-white/30 mb-0.5">/ {totalHours} h</span>
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden mb-2">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${pct}%`,
                background: pct >= 90 ? "#ef4444" : pct >= 60 ? "#f59e0b" : "#10b981"
              }}
            />
          </div>

          <p className="text-[10px] text-white/20">{consumed} h consumidas</p>
        </>
      )}
    </div>
  );
}