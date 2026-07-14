import React, { useState } from "react";
import { Search, X, Check } from "lucide-react";
import { GENRES, MOODS } from "@/lib/musicConstants";

// Selector de tags (géneros + moods) para el modo automático de una sección.
// Solo los beats que coincidan con los tags seleccionados aparecerán en la sección.
export default function SectionTagSelector({ selected = [], onChange }) {
  const [query, setQuery] = useState("");
  const sel = selected || [];
  const toggle = (tag) => onChange(sel.includes(tag) ? sel.filter((t) => t !== tag) : [...sel, tag]);
  const clear = () => onChange([]);

  const filterFn = (v) => !query || v.toLowerCase().includes(query.toLowerCase());
  const genres = GENRES.filter(filterFn);
  const moods = MOODS.filter(filterFn);

  const Chip = ({ label }) => {
    const on = sel.includes(label);
    return (
      <button
        type="button"
        onClick={() => toggle(label)}
        className="flex-shrink-0 px-2.5 py-1.5 rounded-full text-[11px] font-semibold transition-all flex items-center gap-1"
        style={{
          background: on ? "#ff5833" : "rgba(255,255,255,0.05)",
          color: on ? "#fff" : "rgba(255,255,255,0.55)",
          border: on ? "1px solid #ff5833" : "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {on && <Check className="w-2.5 h-2.5" />}
        {label}
      </button>
    );
  };

  return (
    <div className="space-y-2.5 p-2.5 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Tags (géneros + moods)</p>
        {sel.length > 0 && (
          <button onClick={clear} className="flex items-center gap-1 text-[10px] font-bold text-white/40 hover:text-white transition-colors">
            <X className="w-2.5 h-2.5" /> Limpiar
          </button>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-white/30" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar tag..."
          className="w-full pl-8 pr-3 py-2 rounded-lg text-xs text-white bg-white/[0.05] border border-white/[0.08] focus:outline-none focus:border-white/20 transition-colors"
        />
      </div>

      {sel.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {sel.map((t) => (
            <span key={t} className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-white" style={{ background: "#ff5833" }}>
              {t}
              <button onClick={() => toggle(t)} className="hover:opacity-70"><X className="w-2.5 h-2.5" /></button>
            </span>
          ))}
        </div>
      )}

      {genres.length > 0 && (
        <div>
          <p className="text-[9px] font-bold text-white/25 uppercase tracking-wider mb-1.5">Géneros</p>
          <div className="flex flex-wrap gap-1.5">{genres.map((g) => <Chip key={g} label={g} />)}</div>
        </div>
      )}
      {moods.length > 0 && (
        <div>
          <p className="text-[9px] font-bold text-white/25 uppercase tracking-wider mb-1.5 mt-2">Moods</p>
          <div className="flex flex-wrap gap-1.5">{moods.map((m) => <Chip key={m} label={m} />)}</div>
        </div>
      )}
      {genres.length === 0 && moods.length === 0 && (
        <p className="text-[11px] text-white/30 text-center py-2">Sin tags coincidentes</p>
      )}
    </div>
  );
}