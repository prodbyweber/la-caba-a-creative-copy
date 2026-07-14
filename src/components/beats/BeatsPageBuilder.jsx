import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { GripVertical, Plus, Trash2, Pencil, Eye, EyeOff, Copy, Music2 } from "lucide-react";
import BeatSectionEditor from "./BeatSectionEditor";

// Constructor visual de secciones de la página BEATS (drag & drop).
export default function BeatsPageBuilder() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(null);
  const [localOrder, setLocalOrder] = useState(null);

  const { data: sections = [], isLoading } = useQuery({
    queryKey: ["beat-sections"],
    queryFn: async () => base44.entities.BeatSection.list("order"),
  });

  useEffect(() => {
    if (sections && !localOrder) setLocalOrder(sections);
  }, [sections, localOrder]);

  const ordered = localOrder || sections;

  const persistOrder = useMutation({
    mutationFn: async (list) => {
      const updates = list.map((s, i) => ({ id: s.id, order: i }));
      await base44.entities.BeatSection.bulkUpdate(updates);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["beat-sections"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.BeatSection.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["beat-sections"] }),
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
    if (!result.destination) return;
    const reordered = Array.from(ordered);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    setLocalOrder(reordered);
    persistOrder.mutate(reordered);
  };

  return (
    <div className="rounded-2xl p-4" style={{ background: "#111113", border: "1px solid rgba(255,255,255,0.05)" }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Music2 className="w-4 h-4 text-[#a78bfa]" />
          <h3 className="text-sm font-bold text-white">Secciones de la página Beats</h3>
        </div>
        <button
          onClick={() => setEditing("new")}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white transition-colors"
          style={{ background: "linear-gradient(135deg, #7c4dff, #a78bfa)" }}
        >
          <Plus className="w-3.5 h-3.5" />
          Nueva sección
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-10 text-white/30 text-sm">Cargando secciones...</div>
      ) : ordered.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-white/30 text-sm mb-3">No hay secciones todavía</p>
          <button onClick={() => setEditing("new")} className="text-xs font-semibold text-[#a78bfa] hover:text-white">
            Crear la primera sección
          </button>
        </div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="sections">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
                {ordered.map((s, index) => (
                  <Draggable key={s.id} draggableId={s.id} index={index}>
                    {(prov, snapshot) => (
                      <div
                        ref={prov.innerRef}
                        {...prov.draggableProps}
                        {...prov.dragHandleProps}
                        className="flex items-center gap-3 p-3 rounded-xl transition-all"
                        style={{
                          background: snapshot.isDragging ? "rgba(124,77,255,0.08)" : "#161616",
                          border: `1px solid ${snapshot.isDragging ? "rgba(124,77,255,0.3)" : "rgba(255,255,255,0.06)"}`,
                          ...prov.draggableProps.style,
                        }}
                      >
                        <GripVertical className="w-4 h-4 text-white/30 flex-shrink-0" />
                        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: s.color || "#8b5cf6" }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-white truncate">{s.title}</p>
                          <p className="text-[10px] text-white/35 truncate">
                            {s.source_mode === "manual"
                              ? `${(s.manual_beat_ids || []).length} beats manuales`
                              : `Auto · ${s.filter_type || "recent"}`}
                            {" · "}
                            {s.limit || 10} máx · {s.layout || "grid"}
                          </p>
                        </div>
                        <button
                          onClick={() => toggleVisibility.mutate({ id: s.id, is_visible: s.is_visible })}
                          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
                          title={s.is_visible === false ? "Mostrar" : "Ocultar"}
                        >
                          {s.is_visible === false ? <EyeOff className="w-3.5 h-3.5 text-white/40" /> : <Eye className="w-3.5 h-3.5 text-white/70" />}
                        </button>
                        <button
                          onClick={() => duplicateMutation.mutate(s)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
                          title="Duplicar"
                        >
                          <Copy className="w-3.5 h-3.5 text-white/50" />
                        </button>
                        <button
                          onClick={() => setEditing(s)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
                          title="Editar"
                        >
                          <Pencil className="w-3.5 h-3.5 text-white/70" />
                        </button>
                        <button
                          onClick={() => { if (confirm(`¿Eliminar la sección "${s.title}"?`)) deleteMutation.mutate(s.id); }}
                          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-500/10 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-white/50 hover:text-red-400" />
                        </button>
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

      <p className="text-[10px] text-white/25 mt-3">Arrastra para reordenar · los cambios se guardan automáticamente.</p>

      <AnimatePresence>
        {editing && (
          <BeatSectionEditor
            section={editing === "new" ? null : editing}
            onClose={() => setEditing(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}