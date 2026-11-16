import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { History, RotateCcw, Trash2 } from "lucide-react";

export default function VersionsPanel({ onRestore, refreshKey = 0 }) {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const list = await base44.entities.LandingVersion.filter(
        { status: "published" },
        { sort: "-created_date", limit: 30 }
      );
      setVersions(list.items || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [refreshKey]);

  const remove = async (id) => {
    setVersions((prev) => prev.filter((v) => v.id !== id));
    await base44.entities.LandingVersion.delete(id);
  };

  return (
    <div className="space-y-2">
      <p className="text-[11px] text-white/30">
        Cada vez que publicas se guarda una copia. Restaurar carga esa copia en el editor para que
        puedas revisarla y volver a publicar.
      </p>

      {loading && <p className="text-[11px] text-white/30">Cargando…</p>}
      {!loading && versions.length === 0 && <p className="text-[11px] text-white/30">Todavía no hay versiones publicadas.</p>}

      {versions.map((v) => (
        <div key={v.id} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2.5">
          <History size={13} className="text-white/30" />
          <div className="flex-1 min-w-0">
            <div className="text-[11px] text-white/80 truncate">{v.label}</div>
            <div className="text-[10px] text-white/25">
              {v.created_date ? new Date(v.created_date).toLocaleString("es-ES") : ""}
            </div>
          </div>
          <button
            type="button"
            onClick={() => onRestore(v)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-white/10 text-[10px] font-semibold text-white/60 hover:text-white"
          >
            <RotateCcw size={11} /> Restaurar
          </button>
          <button type="button" onClick={() => remove(v.id)} className="p-1.5 text-white/25 hover:text-red-400" aria-label="Eliminar versión">
            <Trash2 size={12} />
          </button>
        </div>
      ))}
    </div>
  );
}