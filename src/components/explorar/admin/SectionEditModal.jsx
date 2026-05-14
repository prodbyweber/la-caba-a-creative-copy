import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  X, Save, Plus, Trash2, GripVertical, Search, Film, User, Check
} from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

function getYoutubeThumbnail(url) {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : null;
}

export default function SectionEditModal({ section, assignments, allItems, artists, onClose, onSave }) {
  // Local state: label + ordered list of item IDs in this section
  const [label, setLabel] = useState(section?.label || "");
  const [sectionType, setSectionType] = useState(section?.section_type || "standard");
  // Note: section prop contains the full ExplorarSection record including section_type
  const [orderedItems, setOrderedItems] = useState(
    assignments
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map(a => ({ assignmentId: a.id, itemId: a.item_id }))
  );
  const [search, setSearch] = useState("");
  const [showPicker, setShowPicker] = useState(false);

  const assignedItemIds = new Set(orderedItems.map(o => o.itemId));

  const filteredAll = allItems.filter(item => {
    if (assignedItemIds.has(item.id)) return false;
    if (!search) return true;
    return item.title?.toLowerCase().includes(search.toLowerCase());
  });

  const addItem = (item) => {
    setOrderedItems(prev => [...prev, { assignmentId: null, itemId: item.id }]);
    setSearch("");
  };

  const removeItem = (itemId) => {
    setOrderedItems(prev => prev.filter(o => o.itemId !== itemId));
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const reordered = [...orderedItems];
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    setOrderedItems(reordered);
  };

  const handleSave = () => {
    onSave({
      label,
      sectionType,
      orderedItems, // [{assignmentId, itemId}] in order
    });
  };

  const ic = "w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-white/25 placeholder-white/20 transition-colors";
  const lc = "text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-1.5 block";

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-[#111113] border border-white/10 rounded-2xl w-full max-w-xl max-h-[88vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07] flex-shrink-0">
          <h2 className="text-sm font-bold text-white">Editar sección</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Section name */}
          <div>
            <label className={lc}>Nombre de la sección</label>
            <input
              value={label}
              onChange={e => setLabel(e.target.value)}
              className={ic}
              placeholder="Ej: En Tendencia"
            />
          </div>

          {/* Section type */}
          <div>
            <label className={lc}>Tipo de sección</label>
            <div className="flex gap-2">
              <button
                onClick={() => setSectionType("standard")}
                className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${sectionType === "standard" ? "border-white/40 bg-white/10 text-white" : "border-white/[0.08] bg-white/[0.02] text-white/40 hover:text-white/60"}`}
              >
                <div className="flex flex-col items-center gap-1">
                  <div className="flex gap-1">
                    {[1,2,3].map(i => <div key={i} className="w-6 h-4 rounded bg-white/20" />)}
                  </div>
                  <span>Fila estándar</span>
                </div>
              </button>
              <button
                onClick={() => setSectionType("top10")}
                className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${sectionType === "top10" ? "border-[#E50914]/60 bg-[#E50914]/10 text-white" : "border-white/[0.08] bg-white/[0.02] text-white/40 hover:text-white/60"}`}
              >
                <div className="flex flex-col items-center gap-1">
                  <div className="flex items-end gap-0.5">
                    <span className="text-[16px] font-black leading-none" style={{ WebkitTextStroke: "1px rgba(229,9,20,0.8)", color: "transparent" }}>1</span>
                    <div className="w-5 h-7 rounded bg-white/20" />
                    <span className="text-[13px] font-black leading-none ml-1" style={{ WebkitTextStroke: "1px rgba(229,9,20,0.6)", color: "transparent" }}>2</span>
                    <div className="w-5 h-7 rounded bg-white/20" />
                  </div>
                  <span>Top 10</span>
                </div>
              </button>
            </div>
            {sectionType === "top10" && (
              <p className="text-[10px] text-white/25 mt-1.5">Muestra hasta 10 ítems con número gigante estilo Netflix</p>
            )}
          </div>

          {/* Ordered project list */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={lc}>Proyectos ({orderedItems.length})</label>
              <button
                onClick={() => setShowPicker(v => !v)}
                className="flex items-center gap-1.5 text-[10px] px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/50 hover:text-white transition-colors font-semibold"
              >
                <Plus className="w-3 h-3" />
                Añadir proyecto
              </button>
            </div>

            {/* Project picker */}
            {showPicker && (
              <div className="mb-3 rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2.5 border-b border-white/[0.06]">
                  <Search className="w-3.5 h-3.5 text-white/25 flex-shrink-0" />
                  <input
                    autoFocus
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Buscar proyectos..."
                    className="flex-1 bg-transparent text-sm text-white placeholder-white/20 outline-none"
                  />
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {filteredAll.length === 0 ? (
                    <p className="text-xs text-white/20 text-center py-6">
                      {search ? `Sin resultados para "${search}"` : "Todos los proyectos ya están añadidos"}
                    </p>
                  ) : (
                    filteredAll.map(item => {
                      const thumb = item.thumbnail_url || getYoutubeThumbnail(item.youtube_url || item.youtube_music_url);
                      const artist = artists.find(a => a.id === item.artist_id);
                      return (
                        <button
                          key={item.id}
                          onClick={() => addItem(item)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/[0.05] transition-colors text-left"
                        >
                          <div className="w-10 h-7 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                            {thumb ? <img src={thumb} alt={item.title} className="w-full h-full object-cover" /> : <Film className="w-3.5 h-3.5 text-white/15 m-auto mt-1.5" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-white truncate">{item.title}</p>
                            {artist && <p className="text-[10px] text-white/30">{artist.stageName}</p>}
                          </div>
                          <Plus className="w-3.5 h-3.5 text-white/30 flex-shrink-0" />
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* Drag & drop list */}
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="section-items">
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
                    {orderedItems.length === 0 && (
                      <div className="py-8 border border-dashed border-white/[0.06] rounded-xl text-center">
                        <p className="text-xs text-white/20">Sin proyectos en esta sección</p>
                        <p className="text-[10px] text-white/10 mt-0.5">Usa "Añadir proyecto" para agregar</p>
                      </div>
                    )}
                    {orderedItems.map(({ itemId }, index) => {
                      const item = allItems.find(i => i.id === itemId);
                      if (!item) return null;
                      const thumb = item.thumbnail_url || getYoutubeThumbnail(item.youtube_url || item.youtube_music_url);
                      const artist = artists.find(a => a.id === item.artist_id);
                      return (
                        <Draggable key={itemId} draggableId={itemId} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className="flex items-center gap-3 p-3 bg-white/[0.03] border border-white/[0.06] rounded-xl group"
                            >
                              <div {...provided.dragHandleProps} className="text-white/20 hover:text-white/50 cursor-grab flex-shrink-0">
                                <GripVertical className="w-4 h-4" />
                              </div>
                              <span className="text-[10px] text-white/20 w-4 text-center flex-shrink-0">{index + 1}</span>
                              <div className="w-12 h-8 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                                {thumb ? <img src={thumb} alt={item.title} className="w-full h-full object-cover" /> : <Film className="w-3 h-3 text-white/15 m-auto mt-2.5" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-white truncate">{item.title}</p>
                                {(artist || item.subtitle) && (
                                  <p className="text-[10px] text-white/30 truncate">{artist?.stageName || item.subtitle}</p>
                                )}
                              </div>
                              <button
                                onClick={() => removeItem(itemId)}
                                className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/10 transition-all flex-shrink-0"
                              >
                                <X className="w-3.5 h-3.5 text-red-400/60" />
                              </button>
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-6 py-4 border-t border-white/[0.07] flex-shrink-0">
          <button onClick={onClose} className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 text-xs font-semibold transition-colors">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!label.trim()}
            className="flex-1 py-2.5 rounded-xl bg-white text-black font-bold text-xs transition-all hover:bg-white/90 disabled:opacity-40 flex items-center justify-center gap-2"
          >
            <Save className="w-3.5 h-3.5" />
            Guardar sección
          </button>
        </div>
      </motion.div>
    </div>
  );
}