import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Clock, Plus, Minus, Check, X } from "lucide-react";

export default function StudioHoursBlock({ artist, isAdmin }) {
  const totalHours = artist?.studio_hours_total || 0;
  const [editMode, setEditMode] = useState(false);
  const [newTotal, setNewTotal] = useState(totalHours);
  const queryClient = useQueryClient();

  const { data: logs = [] } = useQuery({
    queryKey: ["studio-hours-log", artist?.id],
    queryFn: () => base44.entities.StudioHoursLog.filter({ artist_id: artist.id }),
    enabled: !!artist?.id
  });

  const updateHoursMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Artist.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studio-hours-log", artist?.id] });
      queryClient.invalidateQueries({ queryKey: ["artists"] });
      queryClient.invalidateQueries({ queryKey: ["artist", artist?.id] });
    },
  });

  const consumed = logs.reduce((sum, l) => sum + (l.hours || 0), 0);
  const remaining = Math.max(totalHours - consumed, 0);
  const pct = totalHours > 0 ? Math.min((consumed / totalHours) * 100, 100) : 0;

  const handleSave = () => {
    updateHoursMutation.mutate(
      { id: artist.id, data: { studio_hours_total: newTotal } },
      { onSuccess: () => setEditMode(false) }
    );
  };

  return (
    <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-white/30" />
          <span className="text-[10px] font-semibold text-white/30 uppercase tracking-widest">Hrs. Estudio</span>
        </div>
        {isAdmin && artist?.id && !editMode && (
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