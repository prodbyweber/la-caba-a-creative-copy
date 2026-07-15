import React from "react";
import { Eye, EyeOff, Copy, Trash2, Check, Save } from "lucide-react";
import BeatPicker from "./BeatPicker";
import SectionTagSelector from "./SectionTagSelector";

const LAYOUTS = [
  { id: "grid", label: "Grid" },
  { id: "carousel", label: "Carrusel" },
  { id: "horizontal", label: "Scroll horizontal" },
  { id: "list", label: "Lista" },
  { id: "ranking", label: "Ranking" },
  { id: "compact", label: "Lista compacta" },
];
const ORDERINGS = [
  { id: "recent", label: "Más recientes" },
  { id: "oldest", label: "Más antiguos" },
  { id: "popular", label: "Más reproducidos" },
  { id: "downloads", label: "Más descargados" },
  { id: "featured", label: "Destacados" },
  { id: "az", label: "A-Z" },
  { id: "za", label: "Z-A" },
];

const iCls = "w-full px-3 py-2.5 rounded-xl text-sm text-white bg-white/[0.05] border border-white/[0.08] focus:outline-none focus:border-white/20 transition-colors";
const labelCls = "block text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1.5";

// Panel de configuración de una sección (reutilizado en desktop y móvil).
export default function SectionConfigPanel({ cfg, onSet, onSave, onDuplicate, onDelete, dirty, saving, beats }) {
  if (!cfg) {
    return (
      <div className="rounded-xl p-4 text-center" style={{ background: "#161616", border: "1px solid rgba(255,255,255,0.05)" }}>
        <p className="text-xs text-white/30">Selecciona una sección para editarla</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl p-3 space-y-3" style={{ background: "#161616", border: "1px solid rgba(255,255,255,0.05)" }}>
      {/* Textos */}
      <div>
        <label className={labelCls}>Título</label>
        <input value={cfg.title || ""} onChange={(e) => onSet("title", e.target.value)} className={iCls} placeholder="Título de la sección" />
      </div>
      <div>
        <label className={labelCls}>Subtítulo</label>
        <input value={cfg.subtitle || ""} onChange={(e) => onSet("subtitle", e.target.value)} className={iCls} placeholder="Subtítulo visible" />
      </div>
      <div>
        <label className={labelCls}>Descripción</label>
        <textarea value={cfg.description || ""} onChange={(e) => onSet("description", e.target.value)} className={iCls} rows={2} placeholder="Descripción interna (opcional)" />
      </div>

      {/* Configuración del hero carrusel */}
      {cfg.layout === "carousel" && (
        <div className="space-y-3 p-3 rounded-xl" style={{ background: "rgba(255,88,51,0.06)", border: "1px solid rgba(255,88,51,0.18)" }}>
          <p className="text-[10px] font-bold text-[#ff8866] uppercase tracking-widest">Hero Carousel</p>
          <div>
            <label className={labelCls}>Texto auxiliar</label>
            <textarea value={cfg.aux_text || ""} onChange={(e) => onSet("aux_text", e.target.value)} className={iCls} rows={2} placeholder="Texto secundario sobre la tarjeta" />
          </div>
          <div>
            <label className={labelCls}>Imagen del Hero (override · opcional)</label>
            <input value={cfg.hero_image_url || ""} onChange={(e) => onSet("hero_image_url", e.target.value)} className={iCls} placeholder="https://... (vacío = portada del beat)" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={labelCls}>Auto-transición</label>
              <button type="button" onClick={() => onSet("auto_play", cfg.auto_play === false ? true : false)}
                className={`${iCls} flex items-center justify-center ${cfg.auto_play !== false ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : ""}`}>
                {cfg.auto_play !== false ? "Activada" : "Desactivada"}
              </button>
            </div>
            <div>
              <label className={labelCls}>Intervalo (s)</label>
              <input type="number" value={cfg.auto_play_interval || 6} onChange={(e) => onSet("auto_play_interval", parseInt(e.target.value) || 6)} className={iCls} />
            </div>
          </div>
        </div>
      )}

      {/* Diseño */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className={labelCls}>Tipo</label>
          <select value={cfg.layout} onChange={(e) => onSet("layout", e.target.value)} className={iCls}>
            {LAYOUTS.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Color</label>
          <div className="flex items-center gap-2">
            <input type="color" value={cfg.color || "#ff5833"} onChange={(e) => onSet("color", e.target.value)} className="w-9 h-9 rounded-lg bg-transparent border border-white/10 cursor-pointer flex-shrink-0" />
            <input value={cfg.color || ""} onChange={(e) => onSet("color", e.target.value)} className={iCls} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className={labelCls}>Columnas</label>
          <select value={cfg.columns || 5} onChange={(e) => onSet("columns", parseInt(e.target.value))} className={iCls}>
            {[2, 3, 4, 5].map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Cantidad máx.</label>
          <input type="number" value={cfg.limit || 10} onChange={(e) => onSet("limit", parseInt(e.target.value) || 10)} className={iCls} />
        </div>
      </div>

      {/* Modo de selección */}
      <div>
        <label className={labelCls}>Selección de beats</label>
        <div className="flex gap-2">
          <button type="button" onClick={() => onSet("source_mode", "auto")}
            className={`flex-1 py-2.5 rounded-xl text-[11px] font-bold transition-all ${cfg.source_mode === "auto" ? "text-white" : "bg-white/5 text-white/40 border border-white/10"}`}
            style={cfg.source_mode === "auto" ? { background: "#ff5833" } : {}}>
            Automático
          </button>
          <button type="button" onClick={() => onSet("source_mode", "manual")}
            className={`flex-1 py-2.5 rounded-xl text-[11px] font-bold transition-all ${cfg.source_mode === "manual" ? "text-white" : "bg-white/5 text-white/40 border border-white/10"}`}
            style={cfg.source_mode === "manual" ? { background: "#ff5833" } : {}}>
            Manual
          </button>
        </div>
      </div>

      {cfg.source_mode === "auto" ? (
        <div className="space-y-2">
          <SectionTagSelector
            selected={cfg.filter_tags || []}
            onChange={(tags) => onSet("filter_tags", tags)}
          />
          <div>
            <label className={labelCls}>Orden</label>
            <select value={cfg.filter_type} onChange={(e) => onSet("filter_type", e.target.value)} className={iCls}>
              {ORDERINGS.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
            </select>
          </div>
        </div>
      ) : (
        <BeatPicker selectedIds={cfg.manual_beat_ids || []} beats={beats} onChange={(ids) => onSet("manual_beat_ids", ids)} />
      )}

      {/* Visibilidad */}
      <button type="button" onClick={() => onSet("is_visible", cfg.is_visible === false ? true : false)}
        className={`${iCls} flex items-center justify-center gap-2 ${cfg.is_visible !== false ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : ""}`}>
        {cfg.is_visible !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
        {cfg.is_visible !== false ? "Visible" : "Oculta"}
      </button>

      {/* Acciones */}
      <div className="flex items-center gap-2">
        <button onClick={() => onDuplicate(cfg)}
          className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-xs font-bold transition-colors flex items-center justify-center gap-1.5">
          <Copy className="w-3.5 h-3.5" /> Duplicar
        </button>
        <button onClick={() => { if (confirm(`¿Eliminar "${cfg.title}"?`)) onDelete(cfg.id); }}
          className="flex-1 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold transition-colors flex items-center justify-center gap-1.5">
          <Trash2 className="w-3.5 h-3.5" /> Eliminar
        </button>
      </div>

      <button onClick={onSave} disabled={!dirty || saving}
        className="w-full py-3 rounded-xl text-white text-sm font-bold transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
        style={{ background: "linear-gradient(135deg, #ff5833, #e0451f)" }}>
        {saving ? "Guardando..." : dirty ? <><Save className="w-4 h-4" /> Guardar cambios</> : <><Check className="w-4 h-4" /> Guardado</>}
      </button>
    </div>
  );
}