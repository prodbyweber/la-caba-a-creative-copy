import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Upload, ChevronDown, ChevronUp, GripVertical } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

export default function TimelineEditor({ timeline = [], onUpdate }) {
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [uploading, setUploading] = useState(null);
  const [localMilestones, setLocalMilestones] = useState(timeline);

  React.useEffect(() => {
    setLocalMilestones(timeline);
  }, [timeline]);

  const addMilestone = () => {
    const newMilestones = [...timeline, {
      year: new Date().getFullYear().toString(),
      title: "Nuevo hito",
      description: "Descripción del hito",
      image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&h=500&fit=crop&q=80"
    }];
    setLocalMilestones(newMilestones);
    onUpdate(newMilestones);
  };

  const updateMilestoneLocal = (index, field, value) => {
    const updated = [...localMilestones];
    updated[index] = { ...updated[index], [field]: value };
    setLocalMilestones(updated);
  };

  const saveMilestone = (index) => {
    onUpdate(localMilestones);
  };

  const removeMilestone = (index) => {
    const newMilestones = timeline.filter((_, i) => i !== index);
    setLocalMilestones(newMilestones);
    onUpdate(newMilestones);
  };

  const handleImageUpload = async (index, file) => {
    if (!file) return;
    
    setUploading(index);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const updated = [...localMilestones];
      updated[index] = { ...updated[index], image: file_url };
      setLocalMilestones(updated);
      onUpdate(updated);
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setUploading(null);
    }
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const items = Array.from(localMilestones);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setLocalMilestones(items);
    onUpdate(items);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-gray-400 font-medium">
          {localMilestones.length} hitos en el timeline
        </span>
        <button
          onClick={addMilestone}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 rounded-lg text-emerald-400 text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Añadir Hito
        </button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="timeline-milestones">
          {(provided) => (
            <div 
              className="space-y-3"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {localMilestones.map((milestone, index) => (
                <Draggable key={`milestone-${index}`} draggableId={`milestone-${index}`} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`bg-white/5 rounded-xl border border-white/10 overflow-hidden transition-shadow ${
                        snapshot.isDragging ? 'shadow-2xl shadow-emerald-500/20' : ''
                      }`}
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3 flex-1">
                          <div 
                            {...provided.dragHandleProps}
                            className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-white transition-colors"
                          >
                            <GripVertical className="w-5 h-5" />
                          </div>
                          <button
                            onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                            className="flex items-center gap-3 flex-1 text-left"
                          >
                  <div className="w-16 h-20 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                    <img 
                      src={milestone.image} 
                      alt={milestone.year}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-emerald-400 font-bold text-lg">{milestone.year}</span>
                      <span className="text-white font-medium">{milestone.title}</span>
                    </div>
                    <p className="text-gray-500 text-xs line-clamp-1">{milestone.description}</p>
                  </div>
                            {expandedIndex === index ? (
                              <ChevronUp className="w-5 h-5 text-gray-400" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-400" />
                            )}
                          </button>
                        </div>
                        
                        <button
                          onClick={() => removeMilestone(index)}
                          className="ml-2 p-2 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

              {/* Expanded Content */}
              <AnimatePresence>
                {expandedIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-white/10"
                  >
                    <div className="p-4 space-y-4">
                      {/* Year */}
                      <div>
                        <label className="text-xs text-gray-400 mb-2 block font-medium">
                          Año
                        </label>
                        <input
                          type="text"
                          value={milestone.year}
                          onChange={(e) => updateMilestoneLocal(index, 'year', e.target.value)}
                          onBlur={() => saveMilestone(index)}
                          className="w-full px-4 py-2 bg-white/5 rounded-lg border border-white/10 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                          placeholder="2024"
                        />
                      </div>

                      {/* Title */}
                      <div>
                        <label className="text-xs text-gray-400 mb-2 block font-medium">
                          Título
                        </label>
                        <input
                          type="text"
                          value={milestone.title}
                          onChange={(e) => updateMilestoneLocal(index, 'title', e.target.value)}
                          onBlur={() => saveMilestone(index)}
                          className="w-full px-4 py-2 bg-white/5 rounded-lg border border-white/10 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                          placeholder="Los inicios"
                        />
                      </div>

                      {/* Description */}
                      <div>
                        <label className="text-xs text-gray-400 mb-2 block font-medium">
                          Descripción
                        </label>
                        <textarea
                          value={milestone.description}
                          onChange={(e) => updateMilestoneLocal(index, 'description', e.target.value)}
                          onBlur={() => saveMilestone(index)}
                          rows={3}
                          className="w-full px-4 py-2 bg-white/5 rounded-lg border border-white/10 text-white focus:outline-none focus:border-emerald-500 transition-colors resize-none"
                          placeholder="Una breve descripción del hito..."
                        />
                      </div>

                      {/* Image */}
                      <div>
                        <label className="text-xs text-gray-400 mb-2 block font-medium">
                          Imagen de portada
                        </label>
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <input
                              type="text"
                              value={milestone.image}
                              onChange={(e) => updateMilestoneLocal(index, 'image', e.target.value)}
                              onBlur={() => saveMilestone(index)}
                              className="w-full px-4 py-2 bg-white/5 rounded-lg border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                              placeholder="URL de la imagen"
                            />
                          </div>
                          <label className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 rounded-lg text-emerald-400 cursor-pointer transition-colors flex items-center gap-2">
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleImageUpload(index, e.target.files?.[0])}
                            />
                            <Upload className="w-4 h-4" />
                            <span className="text-sm">
                              {uploading === index ? 'Subiendo...' : 'Subir'}
                            </span>
                          </label>
                        </div>
                      </div>

                      {/* Playlist Section */}
                      <div className="space-y-4 mt-4 p-4 bg-white/5 rounded-lg border border-white/10">
                        <h4 className="text-sm font-medium text-white">Playlist (Opcional)</h4>
                        
                        <div>
                          <label className="text-xs text-gray-400 mb-2 block font-medium">
                            Título del Álbum/Single
                          </label>
                          <input
                            type="text"
                            value={milestone.playlist?.title || ''}
                            onChange={(e) => {
                              const updated = [...localMilestones];
                              if (!updated[index].playlist) {
                                updated[index].playlist = { title: '', songs: [] };
                              }
                              updated[index].playlist.title = e.target.value;
                              setLocalMilestones(updated);
                            }}
                            onBlur={() => saveMilestone(index)}
                            className="w-full px-4 py-2 bg-white/5 rounded-lg border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                            placeholder="Ej: Mi Primer Álbum"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs text-gray-400 font-medium">Canciones</label>
                          {(milestone.playlist?.songs || []).map((song, songIndex) => (
                            <div key={songIndex} className="p-3 bg-white/5 rounded-lg space-y-2 border border-white/10">
                              <input
                                type="text"
                                placeholder="Título de la canción"
                                value={song.title}
                                onChange={(e) => {
                                  const updated = [...localMilestones];
                                  updated[index].playlist.songs[songIndex].title = e.target.value;
                                  setLocalMilestones(updated);
                                }}
                                onBlur={() => saveMilestone(index)}
                                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm focus:outline-none focus:border-emerald-500"
                              />
                              <input
                                type="text"
                                placeholder="Artista"
                                value={song.artist}
                                onChange={(e) => {
                                  const updated = [...localMilestones];
                                  updated[index].playlist.songs[songIndex].artist = e.target.value;
                                  setLocalMilestones(updated);
                                }}
                                onBlur={() => saveMilestone(index)}
                                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm focus:outline-none focus:border-emerald-500"
                              />
                              <input
                                type="text"
                                placeholder="URL de YouTube"
                                value={song.youtube_url}
                                onChange={(e) => {
                                  const updated = [...localMilestones];
                                  updated[index].playlist.songs[songIndex].youtube_url = e.target.value;
                                  setLocalMilestones(updated);
                                }}
                                onBlur={() => saveMilestone(index)}
                                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm focus:outline-none focus:border-emerald-500"
                              />
                              <button
                                onClick={() => {
                                  const updated = [...localMilestones];
                                  updated[index].playlist.songs.splice(songIndex, 1);
                                  setLocalMilestones(updated);
                                  onUpdate(updated);
                                }}
                                className="text-red-400 text-sm hover:text-red-300 transition-colors"
                              >
                                Eliminar canción
                              </button>
                            </div>
                          ))}
                          
                          <button
                            onClick={() => {
                              const updated = [...localMilestones];
                              if (!updated[index].playlist) {
                                updated[index].playlist = { title: '', songs: [] };
                              }
                              updated[index].playlist.songs.push({
                                title: '',
                                artist: '',
                                youtube_url: ''
                              });
                              setLocalMilestones(updated);
                              onUpdate(updated);
                            }}
                            className="w-full px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg text-sm font-medium transition-colors"
                          >
                            + Agregar Canción
                          </button>
                        </div>
                      </div>
                    </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {localMilestones.length === 0 && (
        <div className="text-center py-12 border border-dashed border-white/20 rounded-xl">
          <p className="text-gray-500 mb-4">No hay hitos en el timeline</p>
          <button
            onClick={addMilestone}
            className="px-6 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 rounded-lg text-emerald-400 text-sm font-medium transition-colors"
          >
            Añadir primer hito
          </button>
        </div>
      )}
    </div>
  );
}