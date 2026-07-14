import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, GripVertical, Trash2, Copy, Eye, EyeOff, Pencil, Layout, Music2, Layers, ArrowLeft } from "lucide-react";
import BeatSectionEditor from "@/components/beats/BeatSectionEditor";

export default function BeatsPageBuilder({ beats, onBack }) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(null);

  const { data: sections = [], isLoading } = useQuery({
    queryKey: ["beat-sections"],
    queryFn: async () => {
      const all = await base44.entities.BeatSection.list("order");
      return all.sort((a, b) => (a.order || 0) - (b.order || 0));
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (data.id) return base44.entities.BeatSection.update(data.id, data);
      return base44.entities.BeatSection.create(data);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["beat-sections"] }); setEditing(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.BeatSection.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["beat-sections"] }),
  });

  const duplicateMutation = useMutation({
    mutationFn: async (s) => {
      const { id, created_date, updated_date, ...rest } = s;
      return base44.entities.BeatSection.create({ ...rest, title: `${s.title} (copia)`, order: (s.order || 0) + 1 });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["beat-sections"] }),
  });

  const toggleVisibilityMutation = useMutation({
    mutationFn: ({ id, is_visible }) => base44.entities.BeatSection.update(id, { is_visible: !is_visible }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["beat-sections"] }),
  });

  const reorderMutation = useMutation({
    mutationFn: async (ordered) => {
      const updates = ordered.map((s, i) => ({ id: s.id, order: i }));
      await base44.entities.BeatSection.bulkUpdate(updates);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["beat-sections"] }),
  });

  const onDragEnd = (result) => {
    if (!result.destination || result.destination.index === result.source.index) return;
    const reordered = [...sections];
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    reorderMutation.mutate(reordered);
  };

  const handleSave = (form) => {
    // Si es nueva, asignar order al final
    if (!form.id) form.order = sections.length;
    saveMutation.mutate(form);
  };

  return (
    <div className="min-h-screen pb-20" style={{ background: "#0a0a0b" }}>
      {/* Header */}
      <div className="sticky top-0 z-40 px-5 sm:px-10 py-4 flex items-center justify-between"
        style={{ background: "rgba(10,10,11,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="flex items-center gap-2 text-xs font-semibold text-white/60 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /> Volver
          </button>
          <span className="text-white/20">/</span>
          <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2"><Layout className="w-5 h-5 text-[#a78bfa]" /> Constructor de página</h1>
        </div>
        <button onClick={() => setEditing({})}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold text-white transition-colors"
          style={{ background: "linear-gradient(135deg, #7c4dff, #a78bfa)" }}>
          <Plus className="w-4 h-4" /> Nueva sección
        </button>
      </div>

      <div className="px-5 sm:px-10 max-w-3xl mx-auto mt-6">
        <p className="text-xs text-white/40 mb-4 flex items-center gap-2">
          <Layers className="w-3.5 h-3.5" /> Arrastra las secciones para reordenar. Cada sección puede tener selección manual o automática de beats, layout y filtros configurables.
        </p>

        {isLoading ? (
          <div className="text-center py-20 text-white/30 text-sm">Cargando...</div>
        ) : sections.length === 0 ? (
          <div className="text-center py-20 rounded-2xl" style={{ background: "#141416", border: "1px dashed rgba(255,255,255,0.1)" }}>
            <Layout className="w-10 h-10 text-white/15 mx-auto mb-3" />
            <p className="text-white/40 text-sm mb-3">Aún no hay secciones. Crea la primera.</p>
            <button onClick={() => setEditing({})}
              className="text-sm font-semibold text-[#a78bfa] hover:text-white transition-colors">+ Crear sección</button>
          </div>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="sections">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-3">
                  {sections.map((section, idx) => (
                    <Draggable key={section.id} draggableId={section.id} index={idx}>
                      {(prov, snap) => (
                        <div ref={prov.innerRef} {...prov.draggableProps}
                          className="rounded-xl p-3 flex items-center gap-3 transition-all"
                          style={{ background: snap.isDragging ? "#1a1a1c" : "#141416", border: "1px solid rgba(255,255,255,0.06)", ...prov.draggableProps.style }}>
                          <span {...prov.dragHandleProps} className="cursor-grab active:cursor-grabbing text-white/20 hover:text-white/50">
                            <GripVertical className="w-5 h-5" />
                          </span>

                          {/* Icon */}
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${section.color || "#8b5cf6"}22` }}>
                            <Music2 className="w-4 h-4" style={{ color: section.color || "#8b5cf6" }} />
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-bold text-white truncate">{section.title}</h3>
                              <span className="text-[10px] text-white/30 px-1.5 py-0.5 rounded bg-white/5">
                                {section.source_mode === "manual" ? `${(section.manual_beat_ids || []).length} beats` : `Auto: ${section.filter_type}`}
                              </span>
                              <span className="text-[10px] text-white/30 px-1.5 py-0.5 rounded bg-white/5">{section.layout}</span>
                            </div>
                            {section.subtitle && <p className="text-xs text-white/40 truncate mt-0.5">{section.subtitle}</p>}
                          </div>

                          {/* Visibility */}
                          <button onClick={() => toggleVisibilityMutation.mutate({ id: section.id, is_visible: section.is_visible })}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${section.is_visible === false ? "text-white/30 hover:text-white/60" : "text-emerald-400"}`}>
                            {section.is_visible === false ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>

                          {/* Actions */}
                          <button onClick={() => setEditing(section)} className="w-8 h-8 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors"><Pencil className="w-4 h-4" /></button>
                          <button onClick={() => duplicateMutation.mutate(section)} className="w-8 h-8 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors"><Copy className="w-4 h-4" /></button>
                          <button onClick={() => { if (confirm(`¿Eliminar la sección "${section.title}"?`)) deleteMutation.mutate(section.id); }} className="w-8 h-8 rounded-lg flex items-center justify-center text-white/50 hover:text-red-400 hover:bg-red-500/10 transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>

      <AnimatePresence>
        {editing && (
          <BeatSectionEditor section={editing} beats={beats} onSave={handleSave} onClose={() => setEditing(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}