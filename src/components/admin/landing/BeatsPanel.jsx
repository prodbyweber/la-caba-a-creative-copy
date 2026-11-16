import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Trash2, ArrowUp, ArrowDown, Lock, Play } from "lucide-react";

export default function BeatsPanel({ featured = [], onChange }) {
  const [library, setLibrary] = useState([]);

  useEffect(() => {
    base44.entities.Beat
      .filter({ status: "Publicado", archived: false }, { sort: "-created_date", limit: 200 })
      .then((page) => setLibrary(page.items || []))
      .catch(() => setLibrary([]));
  }, []);

  const used = featured.map((f) => f.beat_id);
  const available = library.filter((b) => !used.includes(b.id));

  const update = (idx, patch) =>
    onChange(featured.map((f, i) => (i === idx ? { ...f, ...patch } : f)));

  const move = (idx, dir) => {
    const target = idx + dir;
    if (target < 0 || target >= featured.length) return;
    const next = featured.slice();
    const [it] = next.splice(idx, 1);
    next.splice(target, 0, it);
    onChange(next.map((f, i) => ({ ...f, order: i + 1 })));
  };

  return (
    <div className="space-y-2">
      <p className="text-[11px] text-white/30">
        Los beats marcados se muestran en la franja y se pueden escuchar. El resto de la biblioteca
        aparece con candado.
      </p>

      {featured.map((row, idx) => {
        const beat = library.find((b) => b.id === row.beat_id);
        return (
          <div key={idx} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2">
            {beat?.cover_url ? (
              <img src={beat.cover_url} alt="" className="w-9 h-9 rounded object-cover" />
            ) : (
              <span className="w-9 h-9 rounded bg-white/5 grid place-items-center">
                <Play size={12} className="text-white/30" />
              </span>
            )}

            <select
              value={row.beat_id || ""}
              onChange={(e) => update(idx, { beat_id: e.target.value })}
              className="flex-1 min-w-0 rounded-lg bg-black/40 border border-white/10 px-2 py-1.5 text-xs text-white focus:outline-none"
            >
              <option value="" className="bg-[#111]">
                Selecciona un beat…
              </option>
              {beat && <option value={beat.id} className="bg-[#111]">{beat.title}</option>}
              {available.map((b) => (
                <option key={b.id} value={b.id} className="bg-[#111]">
                  {b.title}
                </option>
              ))}
            </select>

            {beat && !beat.preview_mp3_url && (
              <span className="text-[9px] text-amber-400/80 flex items-center gap-1">
                <Lock size={9} /> sin preview
              </span>
            )}

            <button
              type="button"
              onClick={() => update(idx, { is_visible: row.is_visible === false })}
              className={`text-[9px] uppercase tracking-wider px-2 py-1 rounded border ${
                row.is_visible === false
                  ? "border-white/10 text-white/30"
                  : "border-emerald-400/30 text-emerald-400/80"
              }`}
            >
              {row.is_visible === false ? "oculto" : "visible"}
            </button>

            <button type="button" onClick={() => move(idx, -1)} className="p-1 text-white/30 hover:text-white" aria-label="Subir">
              <ArrowUp size={12} />
            </button>
            <button type="button" onClick={() => move(idx, 1)} className="p-1 text-white/30 hover:text-white" aria-label="Bajar">
              <ArrowDown size={12} />
            </button>
            <button
              type="button"
              onClick={() => onChange(featured.filter((_, i) => i !== idx))}
              className="p-1 text-white/30 hover:text-red-400"
              aria-label="Eliminar"
            >
              <Trash2 size={12} />
            </button>
          </div>
        );
      })}

      <button
        type="button"
        onClick={() => onChange([...featured, { beat_id: "", order: featured.length + 1, is_visible: true }])}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-white/15 text-[11px] font-semibold text-white/50 hover:text-white hover:border-white/30"
      >
        <Plus size={13} /> Añadir beat destacado
      </button>
    </div>
  );
}