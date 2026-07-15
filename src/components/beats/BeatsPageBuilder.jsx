import React, { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { GripVertical, Plus, Trash2, Eye, EyeOff, Copy, Music2, Check, Save } from "lucide-react";
import PageSectionPreview from "./PageSectionPreview";
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
const DEFAULT_SECTION = {
  title: "Nueva sección", subtitle: "", description: "", icon: "Music2",
  color: "#ff5833", layout: "grid", columns: 5, limit: 10,
  source_mode: "auto", manual_beat_ids: [], filter_type: "recent", filter_value: "", filter_tags: [], is_visible: true,
};

const iCls = "w-full px-3 py-2.5 rounded-xl text-sm text-white bg-white/[0.05] border border-white/[0.08] focus:outline-none focus:border-white/20 transition-colors";
const labelCls = "block text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1.5";

// Editor visual (drag & drop) de la página BEATS.
export default function BeatsPageBuilder() {
  const qc = useQueryClient();
  const [selectedId, setSelectedId] = React.useState(null);
  const [draft, setDraft] = React.useState(null);
  const [dirty, setDirty] = React.useState(false);

  const { data: sections = [], isLoading } = useQuery({
    queryKey: ["beat-sections"],
    queryFn: async () => base44.entities.BeatSection.list("order"),
  });
  const { data: beats = [] } = useQuery({
    queryKey: ["beats-admin"],
    queryFn: async () => base44.entities.Beat.list("-created_date"),
  });

  // ordered se deriva directamente de `sections` (ya viene ordenado por `order`).
  // Antes usábamos un localOrder que no se refrescaba tras crear/eliminar → bug.
  const ordered = sections;

  const previewSections = useMemo(
    () => ordered.map((s) => (draft && s.id === selectedId ? { ...s, ...draft } : s)),
    [ordered, draft, selectedId]
  );

  const persistOrder = useMutation({
    mutationFn: async (list) => {
      await base44.entities.BeatSection.bulkUpdate(list.map((s, i) => ({ id: s.id, order: i })));
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["beat-sections"] }),
  });

  const createMutation = useMutation({
    mutationFn: async (data) => base44.entities.BeatSection.create({ ...data, order: ordered.length }),
    onSuccess: (created) => {
      qc.invalidateQueries({ queryKey: ["beat-sections"] });
      setSelectedId(created.id);
      setDraft(null);
      setDirty(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => base44.entities.BeatSection.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["beat-sections"] }); setDirty(false); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.BeatSection.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["beat-sections"] }); setSelectedId(null); setDraft(null); },
  });

  const duplicateMutation = useMutation({
    mutationFn: async (s) => {
      const { id, created_date, updated_date, order, ...rest } = s;
      return base44.entities.BeatSection.create({ ...rest, title: `${s.title} (copia)`, order: ordered.length });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["beat-sections"] }),
  });

  const toggleVisibility = useMutation({
    mutationFn: ({ id, is_visible }) => base44.entities.BeatSection.update(id, { is_visible: !is_visible }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["beat-sections"] }),
  });

  const onDragEnd = (result) => {
    if (!result.destination || result.destination.index === result.source.index) return;
    const reordered = Array.from(ordered);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    persistOrder.mutate(reordered);
  };

  const selectSection = (s) => {
    if (dirty && draft && selectedId) updateMutation.mutate({ id: selectedId, data: draft });
    setSelectedId(s.id);
    setDraft({ ...s });
    setDirty(false);
  };

  const set = (field, value) => { setDraft((d) => ({ ...d, [field]: value })); setDirty(true); };
  const save = () => { if (draft && selectedId) updateMutation.mutate({ id: selectedId, data: draft }); };
  const addSection = () => createMutation.mutate({ ...DEFAULT_SECTION });

  const selected = ordered.find((s) => s.id === selectedId);
  const cfg = draft || selected;

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "#0c0c0d", border: "1px solid rgba(255,255,255,0.05)" }}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 sm:p-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="flex items-center gap-2">
          <Music2 className="w-4 h-4 text-[#ff5833]" />
          <h3 className="text-sm font-bold text-white">Editor de la página Beats</h3>
        </div>
        <button onClick={addSection}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white transition-colors"
          style={{ background: "linear-gradient(135deg, #ff5833, #e0451f)" }}>
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Añadir sección</span>
          <span className="sm:hidden">Sección</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[230px_1fr_290px] gap-3 p-3">
        {/* ── Panel izquierdo: lista de secciones (drag & drop) ── */}
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-1">Secciones</p>
          {isLoading ? (
            <div className="text-center py-8 text-white/30 text-xs">Cargando...</div>
          ) : ordered.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-white/30 text-xs mb-3">Sin secciones</p>
              <button onClick={addSection} className="text-xs font-semibold text-[#ff8866]">Crear la primera</button>
            </div>
          ) : (
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="sections">
                {(prov) => (
                  <div ref={prov.innerRef} {...prov.droppableProps} className="space-y-1.5">
                    {ordered.map((s, index) => (
                      <Draggable key={s.id} draggableId={s.id} index={index}>
                        {(p, snap) => (
                          <div ref={p.innerRef} {...p.draggableProps} {...p.dragHandleProps}
                            onClick={() => selectSection(s)}
                            className="flex items-center gap-2 p-2 rounded-xl cursor-pointer transition-all"
                            style={{
                              background: snap.isDragging ? "rgba(255,88,51,0.12)" : selectedId === s.id ? "rgba(255,88,51,0.08)" : "#161616",
                              border: `1px solid ${snap.isDragging ? "rgba(255,88,51,0.35)" : selectedId === s.id ? "rgba(255,88,51,0.3)" : "rgba(255,255,255,0.06)"}`,
                              ...p.draggableProps.style,
                            }}>
                            <GripVertical className="w-3.5 h-3.5 text-white/30 flex-shrink-0" />
                            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.color || "#ff5833" }} />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-white truncate">{s.title}</p>
                              <p className="text-[9px] text-white/30 uppercase tracking-wider">{s.layout} · {s.is_visible === false ? "oculta" : "visible"}</p>
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); toggleVisibility.mutate({ id: s.id, is_visible: s.is_visible }); }}
                              className="w-6 h-6 rounded flex items-center justify-center hover:bg-white/10 flex-shrink-0">
                              {s.is_visible === false ? <EyeOff className="w-3 h-3 text-white/40" /> : <Eye className="w-3 h-3 text-white/70" />}
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); if (confirm(`¿Eliminar "${s.title}"?`)) deleteMutation.mutate(s.id); }}
                              className="w-6 h-6 rounded flex items-center justify-center hover:bg-red-500/15 text-white/40 hover:text-red-400 flex-shrink-0">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {prov.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
          <p className="text-[10px] text-white/25 px-1 pt-1">Arrastra para reordenar · clic para editar.</p>
        </div>

        {/* ── Panel central: vista previa en tiempo real ── */}
        <div className="space-y-2.5">
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-1">Vista previa</p>
          <div className="rounded-xl p-3 max-h-[560px] overflow-y-auto" style={{ background: "#121212", border: "1px solid rgba(255,255,255,0.05)" }}>
            {previewSections.length === 0 ? (
              <p className="text-center text-white/30 text-xs py-10">Añade una sección para verla aquí</p>
            ) : previewSections.map((s) => (
              <div key={s.id} className="mb-3 last:mb-0">
                <PageSectionPreview
                  section={s}
                  beats={beats.filter((b) => b.status === "Publicado" && !b.archived)}
                  selected={s.id === selectedId}
                  onSelect={() => selectSection(s)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* ── Panel derecho: configuración de la sección ── */}
        <div>
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-1 mb-2">Configuración</p>
          {!cfg ? (
            <div className="rounded-xl p-4 text-center" style={{ background: "#161616", border: "1px solid rgba(255,255,255,0.05)" }}>
              <p className="text-xs text-white/30">Selecciona una sección para editarla</p>
            </div>
          ) : (
            <div className="rounded-xl p-3 space-y-3" style={{ background: "#161616", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div>
                <label className={labelCls}>Título</label>
                <input value={cfg.title || ""} onChange={(e) => set("title", e.target.value)} className={iCls} placeholder="Título de la sección" />
              </div>
              <div>
                <label className={labelCls}>Subtítulo</label>
                <input value={cfg.subtitle || ""} onChange={(e) => set("subtitle", e.target.value)} className={iCls} placeholder="Subtítulo" />
              </div>

              {/* Configuración del hero carrusel */}
              {cfg.layout === "carousel" && (
                <div className="space-y-3 p-3 rounded-xl" style={{ background: "rgba(255,88,51,0.06)", border: "1px solid rgba(255,88,51,0.18)" }}>
                  <p className="text-[10px] font-bold text-[#ff8866] uppercase tracking-widest">Hero Carousel</p>
                  <div>
                    <label className={labelCls}>Texto auxiliar</label>
                    <textarea value={cfg.aux_text || ""} onChange={(e) => set("aux_text", e.target.value)} className={iCls} rows={2} placeholder="Texto secundario sobre la tarjeta" />
                  </div>
                  <div>
                    <label className={labelCls}>Imagen del Hero (override · opcional)</label>
                    <input value={cfg.hero_image_url || ""} onChange={(e) => set("hero_image_url", e.target.value)} className={iCls} placeholder="https://... (vacío = portada del beat)" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className={labelCls}>Auto-transición</label>
                      <button type="button" onClick={() => set("auto_play", cfg.auto_play === false ? true : false)}
                        className={`${iCls} flex items-center justify-center ${cfg.auto_play !== false ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : ""}`}>
                        {cfg.auto_play !== false ? "Activada" : "Desactivada"}
                      </button>
                    </div>
                    <div>
                      <label className={labelCls}>Intervalo (s)</label>
                      <input type="number" value={cfg.auto_play_interval || 6} onChange={(e) => set("auto_play_interval", parseInt(e.target.value) || 6)} className={iCls} />
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={labelCls}>Tipo</label>
                  <select value={cfg.layout} onChange={(e) => set("layout", e.target.value)} className={iCls}>
                    {LAYOUTS.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Color</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={cfg.color || "#ff5833"} onChange={(e) => set("color", e.target.value)} className="w-9 h-9 rounded-lg bg-transparent border border-white/10 cursor-pointer" />
                    <input value={cfg.color || ""} onChange={(e) => set("color", e.target.value)} className={iCls} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={labelCls}>Columnas</label>
                  <select value={cfg.columns || 5} onChange={(e) => set("columns", parseInt(e.target.value))} className={iCls}>
                    {[2, 3, 4, 5].map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Cantidad máx.</label>
                  <input type="number" value={cfg.limit || 10} onChange={(e) => set("limit", parseInt(e.target.value) || 10)} className={iCls} />
                </div>
              </div>

              {/* Modo de selección */}
              <div>
                <label className={labelCls}>Selección de beats</label>
                <div className="flex gap-2">
                  <button type="button" onClick={() => set("source_mode", "auto")}
                    className={`flex-1 py-2 rounded-xl text-[11px] font-bold transition-all ${cfg.source_mode === "auto" ? "text-white" : "bg-white/5 text-white/40 border border-white/10"}`}
                    style={cfg.source_mode === "auto" ? { background: "#ff5833" } : {}}>
                    Automático
                  </button>
                  <button type="button" onClick={() => set("source_mode", "manual")}
                    className={`flex-1 py-2 rounded-xl text-[11px] font-bold transition-all ${cfg.source_mode === "manual" ? "text-white" : "bg-white/5 text-white/40 border border-white/10"}`}
                    style={cfg.source_mode === "manual" ? { background: "#ff5833" } : {}}>
                    Manual
                  </button>
                </div>
              </div>

              {cfg.source_mode === "auto" ? (
                <div className="space-y-2">
                  <SectionTagSelector
                    selected={cfg.filter_tags || []}
                    onChange={(tags) => set("filter_tags", tags)}
                  />
                  <div>
                    <label className={labelCls}>Orden</label>
                    <select value={cfg.filter_type} onChange={(e) => set("filter_type", e.target.value)} className={iCls}>
                      {ORDERINGS.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
                    </select>
                  </div>
                </div>
              ) : (
                <BeatPicker selectedIds={cfg.manual_beat_ids || []} beats={beats} onChange={(ids) => set("manual_beat_ids", ids)} />
              )}

              {/* Visibilidad */}
              <button type="button" onClick={() => set("is_visible", cfg.is_visible === false ? true : false)}
                className={`${iCls} flex items-center justify-center gap-2 ${cfg.is_visible !== false ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : ""}`}>
                {cfg.is_visible !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                {cfg.is_visible !== false ? "Visible" : "Oculta"}
              </button>

              {/* Acciones */}
              <div className="flex items-center gap-2">
                <button onClick={() => duplicateMutation.mutate(cfg)}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-xs font-bold transition-colors flex items-center justify-center gap-1.5">
                  <Copy className="w-3.5 h-3.5" /> Duplicar
                </button>
                <button onClick={() => { if (confirm(`¿Eliminar "${cfg.title}"?`)) deleteMutation.mutate(cfg.id); }}
                  className="flex-1 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold transition-colors flex items-center justify-center gap-1.5">
                  <Trash2 className="w-3.5 h-3.5" /> Eliminar
                </button>
              </div>

              <button onClick={save} disabled={!dirty || updateMutation.isPending}
                className="w-full py-3 rounded-xl text-white text-sm font-bold transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg, #ff5833, #e0451f)" }}>
                {updateMutation.isPending ? "Guardando..." : dirty ? <><Save className="w-4 h-4" /> Guardar cambios</> : <><Check className="w-4 h-4" /> Guardado</>}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}