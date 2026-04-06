import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Clock } from "lucide-react";

export default function StudioHoursBlock({ artist }) {
  const totalHours = artist?.studio_hours_total || 0;

  const { data: logs = [] } = useQuery({
    queryKey: ["studio-hours-log", artist?.id],
    queryFn: () => base44.entities.StudioHoursLog.filter({ artist_id: artist.id }),
    enabled: !!artist?.id
  });

  const consumed = logs.reduce((sum, l) => sum + (l.hours || 0), 0);
  const remaining = Math.max(totalHours - consumed, 0);
  const pct = totalHours > 0 ? Math.min((consumed / totalHours) * 100, 100) : 0;

  return (
    <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-3.5 h-3.5 text-white/30" />
        <span className="text-[10px] font-semibold text-white/30 uppercase tracking-widest">Hrs. Estudio</span>
      </div>

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
    </div>
  );
}