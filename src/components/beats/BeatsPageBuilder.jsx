import React, { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { GripVertical, Plus, Trash2, Eye, EyeOff, Music2, Settings2, LayoutPanelTop } from "lucide-react";
import PageSectionPreview from "./PageSectionPreview";
import SectionConfigPanel from "./SectionConfigPanel";

const DEFAULT_SECTION = {
  title: "Nueva sección", subtitle: "", description: "", icon: "Music2",
  color: "#ff5833", layout: "grid", columns: 5, limit: 10,
  source_mode: "auto", manual_beat_ids: [], filter_type: "recent", filter_value: "", filter_tags: [], is_visible: true,
};

// Editor visual (drag & drop) de la página BEATS — responsive.
// Móvil: pestañas (Secciones / Editar / Vista previa). Desktop: 3 columnas.
export default function BeatsPageBuilder() {
  const qc = useQueryClient();
  const [selectedId, setSelectedId] = React.useState(null);
  const [draft, setDraft] = React.useState(null);
  const [dirty, setDirty] = React.useState(false);
  const [mobileTab, setMobileTab] = useState("sections");

  const { data: sections = [], isLoading } = useQuery({
    queryKey: ["beat-sections"],
    queryFn: async () => base44.entities.BeatSection.list("order"),
  });
  const { data: beats = [] } = useQuery({
    queryKey: ["beats-admin"],
    queryFn: async () => base44.entities.Beat.list("-created_date"),
  });

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
      setDraft({ ...created });
      setDirty(false);
      setMobileTab("edit");
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
    setMobileTab("edit");
  };

  const set = (field, value) => { setDraft((d) => ({ ...d, [field]: value })); setDirty(true); };
  const save = () => { if (draft && selectedId) updateMutation.mutate({ id: selectedId, data: draft }); };
  const addSection = () => createMutation.mutate({ ...DEFAULT_SECTION });

  const selected = ordered.find((s) => s.id === selectedId);
  const cfg = draft || selected;

  // ── Panel: lista de secciones (drag & drop) ──
  const renderSectionsList = () => (
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
  );

  // ── Panel: vista previa ──
  const renderPreview = () => (
    <div className="space-y-2.5">
      <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-1">Vista previa</p>
      <div className="rounded-xl p-3 max-h-[60vh] lg:max-h-[560px] overflow-y-auto" style={{ background: "#121212", border: "1px solid rgba(255,255,255,0.05)" }}>
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
  );

  // ── Panel: configuración ──
  const renderConfig = () => (
    <div>
      <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-1 mb-2 hidden lg:block">Configuración</p>
      <SectionConfigPanel
        cfg={cfg}
        onSet={set}
        onSave={save}
        onDuplicate={(c) => duplicateMutation.mutate(c)}
        onDelete={(id) => deleteMutation.mutate(id)}
        dirty={dirty}
        saving={updateMutation.isPending}
        beats={beats}
      />
    </div>
  );

  const TabBtn = ({ active, onClick, icon: Icon, label }) => (
    <button onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-colors ${active ? "text-white" : "text-white/40"}`}
      style={active ? { background: "#ff5833" } : { background: "#161616", border: "1px solid rgba(255,255,255,0.06)" }}>
      <Icon className="w-3.5 h-3.5" />
      {label}
    </button>
  );

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

      {/* Tabs móvil */}
      <div className="lg:hidden flex items-center gap-1.5 p-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <TabBtn active={mobileTab === "sections"} onClick={() => setMobileTab("sections")} icon={LayoutPanelTop} label="Secciones" />
        <TabBtn active={mobileTab === "edit"} onClick={() => setMobileTab("edit")} icon={Settings2} label="Editar" />
        <TabBtn active={mobileTab === "preview"} onClick={() => setMobileTab("preview")} icon={Eye} label="Vista previa" />
      </div>

      {/* Desktop: 3 columnas */}
      <div className="hidden lg:grid lg:grid-cols-[230px_1fr_290px] gap-3 p-3">
        {renderSectionsList()}
        {renderPreview()}
        {renderConfig()}
      </div>

      {/* Móvil: panel activo */}
      <div className="lg:hidden p-3">
        {mobileTab === "sections" && renderSectionsList()}
        {mobileTab === "edit" && renderConfig()}
        {mobileTab === "preview" && renderPreview()}
      </div>
    </div>
  );
}