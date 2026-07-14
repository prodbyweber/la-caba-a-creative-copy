import React, { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { X, Search, Check, Music2 } from "lucide-react";
import { GENRES, MOODS } from "@/lib/musicConstants";

const ICON_OPTIONS = ["Music2", "TrendingUp", "Star", "Fire", "Zap", "Heart", "Download", "Sparkles"];
const LAYOUTS = [
  { id: "grid", label: "Grid" },
  { id: "carousel", label: "Carrusel" },
  { id: "horizontal", label: "Scroll horizontal" },
  { id: "list", label: "Lista" },
];
const FILTER_TYPES = [
  { id: "recent", label: "Más recientes" },
  { id: "popular", label: "Más reproducidos" },
  { id: "downloads", label: "Más descargados" },
  { id: "featured", label: "Destacados" },
  { id: "genre", label: "Por género" },
  { id: "mood", label: "Por mood" },
  { id: "producer", label: "Por productor" },
];

const DEFAULT_SECTION = {
  title: "",
  subtitle: "",
  icon: "Music2",
  color: "#8b5cf6",
  order: 0,
  layout: "grid",
  columns: 5,
  limit: 10,
  source_mode: "auto",
  manual_beat_ids: [],
  filter_type: "recent",
  filter_value: "",
  is_visible: true,
};

// Modal para editar una sección individual de la página Beats.
export default function BeatSectionEditor({ section, onClose }) {
  const qc = useQueryClient();
  const [form, setForm] = useState(section ? { ...section } : { ...DEFAULT_SECTION });
  const [search, setSearch] = useState("");

  const { data: beats = [] } = useQuery({
    queryKey: ["beats-admin"],
    queryFn: async () => base44.entities.Beat.list("-created_date"),
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (section?.id) return base44.entities.BeatSection.update(section.id, data);
      return base44.entities.BeatSection.create(data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["beat-sections"] });
      qc.invalidateQueries({ queryKey: ["beats-page-sections"] });
      onClose();
    },
  });

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const toggleManualBeat = (id) => {
    setForm((f) => {
      const ids = f.manual_beat_ids || [];
      return { ...f, manual_beat_ids: ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id] };
    });
  };

  const filtered = beats.filter((b) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return b.title?.toLowerCase().includes(q) || b.producer?.toLowerCase().includes(q);
  });

  const iCls = "w-full px-3 py-2.5 rounded-xl text-sm text-white bg-white/[0.05] border border-white/[0.08] focus:outline-none focus:border-white/20 transition-colors";
  const labelCls = "block text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1.5";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[160] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-2xl rounded-2xl overflow-hidden max-h-[92vh] overflow-y-auto"
        style={{ background: "#141416", border: "1px solid rgba(255,255,255,0.08)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between p-5 border-b border-white/5" style={{ background: "#141416" }}>
          <h2 className="text-lg font-black text-white tracking-tight">{section ? "Editar sección" : "Nueva sección"}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-white/50" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Título</label>
              <input value={form.title || ""} onChange={(e) => set("title", e.target.value)} className={iCls} placeholder="New Releases" />
            </div>
            <div>
              <label className={labelCls}>Color</label>
              <div className="flex items-center gap-2">
                <input type="color" value={form.color || "#8b5cf6"} onChange={(e) => set("color", e.target.value)} className="w-10 h-10 rounded-lg bg-transparent border border-white/10 cursor-pointer" />
                <input value={form.color || ""} onChange={(e) => set("color", e.target.value)} className={iCls} placeholder="#8b5cf6" />
              </div>
            </div>
          </div>

          <div>
            <label className={labelCls}>Subtítulo</label>
            <input value={form.subtitle || ""} onChange={(e) => set("subtitle", e.target.value)} className={iCls} placeholder="Descripción opcional" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelCls}>Layout</label>
              <select value={form.layout} onChange={(e) => set("layout", e.target.value)} className={iCls}>
                {LAYOUTS.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Columnas</label>
              <select value={form.columns || 5} onChange={(e) => set("columns", parseInt(e.target.value))} className={iCls}>
                {[2, 3, 4, 5].map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Cantidad máx.</label>
              <input type="number" value={form.limit || 10} onChange={(e) => set("limit", parseInt(e.target.value) || 10)} className={iCls} />
            </div>
          </div>

          {/* Source mode */}
          <div>
            <label className={labelCls}>Modo de selección</label>
            <div className="flex gap-2">
              <button type="button" onClick={() => set("source_mode", "auto")}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${form.source_mode === "auto" ? "bg-[#7c4dff] text-white" : "bg-white/5 text-white/40 border border-white/10"}`}>
                Automático (filtros)
              </button>
              <button type="button" onClick={() => set("source_mode", "manual")}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${form.source_mode === "manual" ? "bg-[#7c4dff] text-white" : "bg-white/5 text-white/40 border border-white/10"}`}>
                Manual (elegir beats)
              </button>
            </div>
          </div>

          {/* Auto filters */}
          {form.source_mode === "auto" && (
            <div className="space-y-3 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div>
                <label className={labelCls}>Filtro</label>
                <select value={form.filter_type} onChange={(e) => set("filter_type", e.target.value)} className={iCls}>
                  {FILTER_TYPES.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
                </select>
              </div>
              {(form.filter_type === "genre" || form.filter_type === "mood") && (
                <div>
                  <label className={labelCls}>{form.filter_type === "genre" ? "Género" : "Mood"}</label>
                  <select value={form.filter_value || ""} onChange={(e) => set("filter_value", e.target.value)} className={iCls}>
                    <option value="">—</option>
                    {(form.filter_type === "genre" ? GENRES : MOODS).map((v) => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
              )}
              {form.filter_type === "producer" && (
                <div>
                  <label className={labelCls}>Productor</label>
                  <input value={form.filter_value || ""} onChange={(e) => set("filter_value", e.target.value)} className={iCls} placeholder="Nombre del productor" />
                </div>
              )}
            </div>
          )}

          {/* Manual beat picker */}
          {form.source_mode === "manual" && (
            <div className="space-y-2 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="flex items-center justify-between">
                <label className={labelCls + " mb-0"}>Beats seleccionados ({(form.manual_beat_ids || []).length})</label>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} className={iCls + " pl-9"} placeholder="Buscar beats..." />
              </div>
              <div className="max-h-64 overflow-y-auto space-y-1.5">
                {filtered.map((b) => {
                  const selected = (form.manual_beat_ids || []).includes(b.id);
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => toggleManualBeat(b.id)}
                      className="flex items-center gap-2.5 w-full p-2 rounded-lg transition-colors text-left"
                      style={{ background: selected ? "rgba(124,77,255,0.1)" : "rgba(255,255,255,0.03)", border: `1px solid ${selected ? "rgba(124,77,255,0.3)" : "rgba(255,255,255,0.06)"}` }}
                    >
                      <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0" style={{ background: "#1a1a1c" }}>
                        {b.cover_url ? <img src={b.cover_url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Music2 className="w-3.5 h-3.5 text-white/15" /></div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white truncate">{b.title}</p>
                        <p className="text-[10px] text-white/35 truncate">{b.producer} · {(b.genres || []).join(", ")}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${selected ? "bg-[#7c4dff]" : "border border-white/15"}`}>
                        {selected && <Check className="w-3 h-3 text-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Visibility */}
          <button type="button" onClick={() => set("is_visible", form.is_visible === false ? true : false)}
            className={`${iCls} flex items-center justify-center gap-2 ${form.is_visible !== false ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : ""}`}>
            {form.is_visible !== false ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
            {form.is_visible !== false ? "Visible en la página pública" : "Oculta"}
          </button>
        </div>

        <div className="flex gap-3 p-5 border-t border-white/5 sticky bottom-0" style={{ background: "#141416" }}>
          <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 text-sm font-semibold transition-colors">Cancelar</button>
          <button
            onClick={() => saveMutation.mutate(form)}
            disabled={saveMutation.isPending || !form.title}
            className="flex-1 py-3 rounded-xl text-white text-sm font-bold transition-colors disabled:opacity-40"
            style={{ background: "linear-gradient(135deg, #7c4dff, #a78bfa)" }}
          >
            {saveMutation.isPending ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}