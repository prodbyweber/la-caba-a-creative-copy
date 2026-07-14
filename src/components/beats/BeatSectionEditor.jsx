import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { X, Search, Check, GripVertical, Music2 } from "lucide-react";
import { GENRES, MOODS } from "@/lib/musicConstants";

const LAYOUTS = [
  { id: "grid", label: "Grid" },
  { id: "horizontal", label: "Scroll horizontal" },
  { id: "carousel", label: "Carrusel" },
  { id: "list", label: "Lista" },
];
const FILTERS = [
  { id: "recent", label: "Más recientes" },
  { id: "popular", label: "Más reproducidos" },
  { id: "downloads", label: "Más descargados" },
  { id: "featured", label: "Destacados" },
  { id: "genre", label: "Por género" },
  { id: "mood", label: "Por mood" },
  { id: "bpm", label: "Por BPM (ej: 120-140)" },
  { id: "key", label: "Por tonalidad" },
  { id: "tag", label: "Por etiqueta" },
  { id: "producer", label: "Por productor" },
];
const ICONS = ["Music2", "Flame", "TrendingUp", "Clock", "Download", "Star", "Heart", "Disc3", "Sparkles", "Zap", "Headphones", "Radio", "Mic2"];
const COLORS = ["#8b5cf6", "#7c4dff", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#ef4444", "#14b8a6"];

export default function BeatSectionEditor({ section, beats, onSave, onClose }) {
  const [form, setForm] = useState(() => ({
    title: "", subtitle: "", icon: "Music2", color: "#8b5cf6", order: 0,
    layout: "grid", columns: 5, limit: 10, source_mode: "auto",
    manual_beat_ids: [], filter_type: "recent", filter_value: "", is_visible: true,
    ...section,
  }));
  const [search, setSearch] = useState("");

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const toggleManualBeat = (id) => {
    setForm((f) => {
      const ids = f.manual_beat_ids || [];
      return { ...f, manual_beat_ids: ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id] };
    });
  };

  const moveManualBeat = (id, dir) => {
    setForm((f) => {
      const ids = [...(f.manual_beat_ids || [])];
      const i = ids.indexOf(id);
      const j = i + dir;
      if (j < 0 || j >= ids.length) return f;
      [ids[i], ids[j]] = [ids[j], ids[i]];
      return { ...f, manual_beat_ids: ids };
    });
  };

  const filteredBeats = useMemo(() => {
    const q = search.toLowerCase();
    return (beats || []).filter((b) =>
      !q || b.title?.toLowerCase().includes(q) || b.producer?.toLowerCase().includes(q)
    );
  }, [beats, search]);

  const iCls = "w-full px-3 py-2.5 rounded-xl text-sm text-white bg-white/[0.05] border border-white/[0.08] focus:outline-none focus:border-white/20 transition-colors";
  const labelCls = "block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5";

  const needsValue = ["genre", "mood", "tag", "producer", "bpm", "key"].includes(form.filter_type);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[160] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)" }} onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-2xl rounded-2xl overflow-hidden max-h-[92vh] overflow-y-auto" style={{ background: "#141416", border: "1px solid rgba(255,255,255,0.08)" }} onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 z-10 flex items-center justify-between p-5 border-b border-white/5" style={{ background: "#141416" }}>
          <h2 className="text-lg font-black text-white tracking-tight">{section?.id ? "Editar sección" : "Nueva sección"}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center"><X className="w-4 h-4 text-white/50" /></button>
        </div>

        <div className="p-5 space-y-5">
          {/* Title + subtitle */}
          <div>
            <label className={labelCls}>Título</label>
            <input value={form.title || ""} onChange={(e) => set("title", e.target.value)} className={iCls} placeholder="ej: Afrobeats" />
          </div>
          <div>
            <label className={labelCls}>Subtítulo / Descripción</label>
            <input value={form.subtitle || ""} onChange={(e) => set("subtitle", e.target.value)} className={iCls} placeholder="Descripción opcional" />
          </div>

          {/* Icon + color */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Icono</label>
              <div className="flex flex-wrap gap-1.5">
                {ICONS.map((ic) => (
                  <button key={ic} type="button" onClick={() => set("icon", ic)}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${form.icon === ic ? "border-2 border-[#8b5cf6] bg-[#8b5cf6]/15" : "bg-white/5 border border-white/10"}`}>
                    <span className="text-white/70 text-base font-bold">{ic === "Music2" ? "♪" : ic === "Flame" ? "🔥" : ic === "TrendingUp" ? "📈" : ic === "Clock" ? "⏰" : ic === "Download" ? "⬇" : ic === "Star" ? "★" : ic === "Heart" ? "♥" : ic === "Disc3" ? "◉" : ic === "Sparkles" ? "✦" : ic === "Zap" ? "⚡" : ic === "Headphones" ? "🎧" : ic === "Radio" ? "📻" : "🎤"}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className={labelCls}>Color</label>
              <div className="flex flex-wrap gap-1.5">
                {COLORS.map((c) => (
                  <button key={c} type="button" onClick={() => set("color", c)}
                    className={`w-9 h-9 rounded-lg transition-all ${form.color === c ? "ring-2 ring-white" : ""}`} style={{ background: c }} />
                ))}
                <input type="color" value={form.color || "#8b5cf6"} onChange={(e) => set("color", e.target.value)} className="w-9 h-9 rounded-lg bg-transparent border border-white/10 cursor-pointer" />
              </div>
            </div>
          </div>

          {/* Layout + columns + limit */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-3">
              <label className={labelCls}>Diseño (Layout)</label>
              <div className="grid grid-cols-4 gap-2">
                {LAYOUTS.map((l) => (
                  <button key={l.id} type="button" onClick={() => set("layout", l.id)}
                    className={`px-2 py-2 rounded-lg text-xs font-semibold transition-all ${form.layout === l.id ? "bg-[#7c4dff] text-white" : "bg-white/5 text-white/40 border border-white/10"}`}>{l.label}</button>
                ))}
              </div>
            </div>
            {form.layout === "grid" && (
              <div>
                <label className={labelCls}>Columnas</label>
                <select value={form.columns} onChange={(e) => set("columns", parseInt(e.target.value))} className={iCls}>
                  {[2, 3, 4, 5].map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            )}
            <div className={form.layout === "grid" ? "col-span-2" : "col-span-3"}>
              <label className={labelCls}>Cantidad de beats</label>
              <input type="number" value={form.limit || 10} onChange={(e) => set("limit", parseInt(e.target.value) || 10)} className={iCls} min={1} max={50} />
            </div>
          </div>

          {/* Source mode */}
          <div>
            <label className={labelCls}>Modo de selección</label>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => set("source_mode", "auto")}
                className={`px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${form.source_mode === "auto" ? "bg-[#7c4dff] text-white" : "bg-white/5 text-white/40 border border-white/10"}`}>Automático (filtros)</button>
              <button type="button" onClick={() => set("source_mode", "manual")}
                className={`px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${form.source_mode === "manual" ? "bg-[#7c4dff] text-white" : "bg-white/5 text-white/40 border border-white/10"}`}>Manual (seleccionar)</button>
            </div>
          </div>

          {/* Auto filters */}
          {form.source_mode === "auto" && (
            <div className="space-y-3">
              <div>
                <label className={labelCls}>Filtro</label>
                <select value={form.filter_type} onChange={(e) => set("filter_type", e.target.value)} className={iCls}>
                  {FILTERS.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
                </select>
              </div>
              {needsValue && (
                <div>
                  <label className={labelCls}>Valor del filtro</label>
                  {form.filter_type === "genre" && (
                    <select value={form.filter_value || ""} onChange={(e) => set("filter_value", e.target.value)} className={iCls}>
                      <option value="">— Selecciona —</option>
                      {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
                    </select>
                  )}
                  {form.filter_type === "mood" && (
                    <select value={form.filter_value || ""} onChange={(e) => set("filter_value", e.target.value)} className={iCls}>
                      <option value="">— Selecciona —</option>
                      {MOODS.map((m) => <option key={m} value={m}>{m}</option>)}
                    </select>
                  )}
                  {["tag", "producer", "bpm", "key"].includes(form.filter_type) && (
                    <input value={form.filter_value || ""} onChange={(e) => set("filter_value", e.target.value)} className={iCls} placeholder={form.filter_type === "bpm" ? "120-140" : form.filter_type === "key" ? "C Minor" : "Valor..."} />
                  )}
                </div>
              )}
            </div>
          )}

          {/* Manual selection */}
          {form.source_mode === "manual" && (
            <div className="space-y-3">
              {form.manual_beat_ids?.length > 0 && (
                <div>
                  <label className={labelCls}>Seleccionados ({form.manual_beat_ids.length}) — orden</label>
                  <div className="space-y-1.5">
                    {form.manual_beat_ids.map((id) => {
                      const b = beats.find((x) => x.id === id);
                      return (
                        <div key={id} className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.03] border border-white/8">
                          <GripVertical className="w-4 h-4 text-white/30" />
                          <span className="flex-1 text-xs text-white truncate">{b?.title || "Eliminado"}</span>
                          <button onClick={() => moveManualBeat(id, -1)} className="text-white/40 hover:text-white text-xs px-1">↑</button>
                          <button onClick={() => moveManualBeat(id, 1)} className="text-white/40 hover:text-white text-xs px-1">↓</button>
                          <button onClick={() => toggleManualBeat(id)} className="text-red-400 hover:text-red-300 text-xs px-1">✕</button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              <div>
                <label className={labelCls}>Buscar y añadir beats</label>
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input value={search} onChange={(e) => setSearch(e.target.value)} className={iCls + " pl-9"} placeholder="Buscar..." />
                </div>
                <div className="max-h-52 overflow-y-auto space-y-1 rounded-lg border border-white/8 p-1.5" style={{ scrollbarWidth: "thin" }}>
                  {filteredBeats.slice(0, 60).map((b) => {
                    const sel = form.manual_beat_ids?.includes(b.id);
                    return (
                      <button key={b.id} type="button" onClick={() => toggleManualBeat(b.id)}
                        className={`w-full flex items-center gap-2 p-2 rounded-lg text-left transition-colors ${sel ? "bg-[#8b5cf6]/15" : "hover:bg-white/5"}`}>
                        <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 ${sel ? "bg-[#8b5cf6]" : "border border-white/20"}`}>
                          {sel && <Check className="w-3 h-3 text-white" />}
                        </div>
                        {b.cover_url ? <img src={b.cover_url} alt="" className="w-8 h-8 rounded object-cover flex-shrink-0" /> : <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center"><Music2 className="w-3 h-3 text-white/20" /></div>}
                        <span className="text-xs text-white truncate flex-1">{b.title}</span>
                        <span className="text-[10px] text-white/30 flex-shrink-0">{b.producer}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Visibility */}
          <button type="button" onClick={() => set("is_visible", !form.is_visible)}
            className={`w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 ${form.is_visible ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" : "bg-white/5 text-white/40 border border-white/10"}`}>
            {form.is_visible ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
            {form.is_visible ? "Visible en la página pública" : "Oculta"}
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-5 border-t border-white/5 sticky bottom-0" style={{ background: "#141416" }}>
          <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 text-sm font-semibold">Cancelar</button>
          <button onClick={() => onSave(form)} disabled={!form.title}
            className="flex-1 py-3 rounded-xl text-white text-sm font-bold disabled:opacity-40" style={{ background: "linear-gradient(135deg, #7c4dff, #a78bfa)" }}>Guardar</button>
        </div>
      </motion.div>
    </motion.div>
  );
}