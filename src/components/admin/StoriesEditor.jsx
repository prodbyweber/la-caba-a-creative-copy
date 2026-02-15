import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Upload, ChevronDown, ChevronUp, Music, Film, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "react-hot-toast";

export default function StoriesEditor({ testimonials = [], onUpdate }) {
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [uploading, setUploading] = useState(null);
  const [uploadingClip, setUploadingClip] = useState(null);
  const [localTestimonials, setLocalTestimonials] = useState(testimonials);

  React.useEffect(() => {
    setLocalTestimonials(testimonials);
  }, [testimonials]);

  const addTestimonial = () => {
    const newTestimonials = [...testimonials, {
      id: Date.now(),
      image: "https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=600&h=400&fit=crop&q=80",
      quote: "Nueva historia de éxito...",
      name: "Nombre del artista",
      role: "Rol del artista"
    }];
    setLocalTestimonials(newTestimonials);
    onUpdate(newTestimonials);
  };

  const updateTestimonialLocal = (index, field, value) => {
    const updated = [...localTestimonials];
    updated[index] = { ...updated[index], [field]: value };
    setLocalTestimonials(updated);
  };

  const saveTestimonial = () => {
    onUpdate(localTestimonials);
  };

  const removeTestimonial = (index) => {
    const newTestimonials = testimonials.filter((_, i) => i !== index);
    setLocalTestimonials(newTestimonials);
    onUpdate(newTestimonials);
  };

  const handleImageUpload = async (index, file) => {
    if (!file) return;
    
    setUploading(index);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const updated = [...localTestimonials];
      updated[index] = { ...updated[index], image: file_url };
      setLocalTestimonials(updated);
      onUpdate(updated);
      toast.success('Imagen subida');
    } catch (error) {
      toast.error('Error al subir imagen');
    } finally {
      setUploading(null);
    }
  };

  const addTrack = (index) => {
    const updated = [...localTestimonials];
    if (!updated[index].tracks) updated[index].tracks = [];
    updated[index].tracks.push({
      title: "Nuevo track",
      album: "",
      duration: "",
      audio_url: ""
    });
    setLocalTestimonials(updated);
    onUpdate(updated);
  };

  const updateTrack = (testimonialIndex, trackIndex, field, value) => {
    const updated = [...localTestimonials];
    updated[testimonialIndex].tracks[trackIndex][field] = value;
    setLocalTestimonials(updated);
  };

  const removeTrack = (testimonialIndex, trackIndex) => {
    const updated = [...localTestimonials];
    updated[testimonialIndex].tracks.splice(trackIndex, 1);
    setLocalTestimonials(updated);
    onUpdate(updated);
  };

  const handleAudioUpload = async (testimonialIndex, trackIndex, file) => {
    if (!file) return;
    
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const updated = [...localTestimonials];
      updated[testimonialIndex].tracks[trackIndex].audio_url = file_url;
      setLocalTestimonials(updated);
      onUpdate(updated);
      toast.success('Audio subido');
    } catch (error) {
      toast.error('Error al subir audio');
    }
  };

  const addClip = (index) => {
    const updated = [...localTestimonials];
    if (!updated[index].clips) updated[index].clips = [];
    updated[index].clips.push({
      title: "Nuevo clip",
      video_url: "",
      thumbnail_url: ""
    });
    setLocalTestimonials(updated);
    onUpdate(updated);
  };

  const updateClip = (testimonialIndex, clipIndex, field, value) => {
    const updated = [...localTestimonials];
    updated[testimonialIndex].clips[clipIndex][field] = value;
    setLocalTestimonials(updated);
  };

  const removeClip = (testimonialIndex, clipIndex) => {
    const updated = [...localTestimonials];
    updated[testimonialIndex].clips.splice(clipIndex, 1);
    setLocalTestimonials(updated);
    onUpdate(updated);
  };

  const handleClipUpload = async (testimonialIndex, clipIndex, file) => {
    if (!file) return;
    
    // Validar tamaño máximo 100MB
    if (file.size > 100 * 1024 * 1024) {
      toast.error('El archivo no puede superar los 100MB');
      return;
    }
    
    setUploadingClip(`${testimonialIndex}-${clipIndex}`);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const updated = [...localTestimonials];
      updated[testimonialIndex].clips[clipIndex].video_url = file_url;
      setLocalTestimonials(updated);
      onUpdate(updated);
      toast.success('Video subido correctamente');
    } catch (error) {
      toast.error('Error al subir video');
    } finally {
      setUploadingClip(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-gray-400 font-medium">
          {localTestimonials.length} testimoniales
        </span>
        <button
          onClick={addTestimonial}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 rounded-lg text-emerald-400 text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Añadir Historia
        </button>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {localTestimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id || index}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white/5 rounded-xl border border-white/10 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 bg-white/5">
                <div 
                  className="flex items-center gap-3 flex-1 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedIndex(expandedIndex === index ? null : index);
                  }}
                >
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-medium mb-1">{testimonial.name}</div>
                    <p className="text-gray-500 text-xs">{testimonial.role}</p>
                  </div>
                  <div className="text-gray-400">
                    {expandedIndex === index ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </div>
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeTestimonial(index);
                  }}
                  className="ml-2 p-2 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Content - Visible cuando está expandido */}
              {expandedIndex === index && (
                <div className="border-t border-white/10">
                  <div className="p-4 space-y-4" onClick={(e) => e.stopPropagation()}>
                      {/* Name */}
                      <div>
                        <label className="text-xs text-gray-400 mb-2 block font-medium">
                          Nombre del artista
                        </label>
                        <input
                          type="text"
                          value={testimonial.name}
                          onChange={(e) => updateTestimonialLocal(index, 'name', e.target.value)}
                          onBlur={saveTestimonial}
                          className="w-full px-4 py-2 bg-white/5 rounded-lg border border-white/10 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                          placeholder="Carlos Mendoza"
                        />
                      </div>

                      {/* Role */}
                      <div>
                        <label className="text-xs text-gray-400 mb-2 block font-medium">
                          Rol / Especialidad
                        </label>
                        <input
                          type="text"
                          value={testimonial.role}
                          onChange={(e) => updateTestimonialLocal(index, 'role', e.target.value)}
                          onBlur={saveTestimonial}
                          className="w-full px-4 py-2 bg-white/5 rounded-lg border border-white/10 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                          placeholder="Artista Urbano"
                        />
                      </div>

                      {/* Quote */}
                      <div>
                        <label className="text-xs text-gray-400 mb-2 block font-medium">
                          Testimonio
                        </label>
                        <textarea
                          value={testimonial.quote}
                          onChange={(e) => updateTestimonialLocal(index, 'quote', e.target.value)}
                          onBlur={saveTestimonial}
                          rows={4}
                          className="w-full px-4 py-2 bg-white/5 rounded-lg border border-white/10 text-white focus:outline-none focus:border-emerald-500 transition-colors resize-none"
                          placeholder="Escribe el testimonio del artista..."
                        />
                      </div>

                      {/* Image */}
                      <div>
                        <label className="text-xs text-gray-400 mb-2 block font-medium">
                          Imagen del artista
                        </label>
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <input
                              type="text"
                              value={testimonial.image}
                              onChange={(e) => updateTestimonialLocal(index, 'image', e.target.value)}
                              onBlur={saveTestimonial}
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

                      {/* Tracks Section */}
                      <div className="border-t border-white/10 pt-4 mt-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                          <div className="flex items-center gap-2">
                            <Music className="w-5 h-5 text-emerald-400" />
                            <h4 className="text-sm text-white font-semibold">
                              Tracks & Álbumes
                            </h4>
                            <span className="text-xs text-gray-500">
                              ({testimonial.tracks?.length || 0})
                            </span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              addTrack(index);
                            }}
                            type="button"
                            className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 rounded-lg text-emerald-400 text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2"
                          >
                            <Plus className="w-4 h-4" />
                            Añadir Track
                          </button>
                        </div>
                        
                        <div className="space-y-3">
                          {(!testimonial.tracks || testimonial.tracks.length === 0) && (
                            <div className="text-center py-6 border border-dashed border-white/10 rounded-lg">
                              <Music className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                              <p className="text-sm text-gray-500">No hay tracks añadidos</p>
                            </div>
                          )}
                          
                          {testimonial.tracks?.map((track, trackIdx) => (
                            <div key={trackIdx} className="p-4 bg-zinc-800/80 rounded-lg space-y-3 border border-white/10">
                              {/* Título y botón eliminar */}
                              <div className="flex items-start gap-2">
                                <div className="flex-1">
                                  <label className="text-xs text-gray-400 mb-1.5 block">Título del Track *</label>
                                  <input
                                    type="text"
                                    value={track.title || ""}
                                    onChange={(e) => {
                                      e.stopPropagation();
                                      updateTrack(index, trackIdx, 'title', e.target.value);
                                    }}
                                    onBlur={saveTestimonial}
                                    placeholder="Nombre de la canción"
                                    className="w-full px-3 py-2.5 bg-white/5 rounded-lg border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                                  />
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    removeTrack(index, trackIdx);
                                  }}
                                  type="button"
                                  className="mt-6 p-2.5 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors"
                                  title="Eliminar track"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                              
                              {/* Álbum y Duración */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                  <label className="text-xs text-gray-400 mb-1.5 block">Álbum</label>
                                  <input
                                    type="text"
                                    value={track.album || ""}
                                    onChange={(e) => {
                                      e.stopPropagation();
                                      updateTrack(index, trackIdx, 'album', e.target.value);
                                    }}
                                    onBlur={saveTestimonial}
                                    placeholder="Nombre del álbum"
                                    className="w-full px-3 py-2.5 bg-white/5 rounded-lg border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs text-gray-400 mb-1.5 block">Duración</label>
                                  <input
                                    type="text"
                                    value={track.duration || ""}
                                    onChange={(e) => {
                                      e.stopPropagation();
                                      updateTrack(index, trackIdx, 'duration', e.target.value);
                                    }}
                                    onBlur={saveTestimonial}
                                    placeholder="3:45"
                                    className="w-full px-3 py-2.5 bg-white/5 rounded-lg border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                                  />
                                </div>
                              </div>
                              
                              {/* URL del audio y botón subir */}
                              <div>
                                <label className="text-xs text-gray-400 mb-1.5 block">Archivo de Audio</label>
                                <div className="flex flex-col sm:flex-row gap-2">
                                  <input
                                    type="text"
                                    value={track.audio_url || ""}
                                    onChange={(e) => {
                                      e.stopPropagation();
                                      updateTrack(index, trackIdx, 'audio_url', e.target.value);
                                    }}
                                    onBlur={saveTestimonial}
                                    placeholder="https://... o sube un archivo"
                                    className="flex-1 px-3 py-2.5 bg-white/5 rounded-lg border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                                  />
                                  <label className="px-4 py-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 rounded-lg text-emerald-400 cursor-pointer text-sm font-medium transition-colors flex items-center justify-center gap-2 whitespace-nowrap">
                                    <input
                                      type="file"
                                      accept="audio/*"
                                      className="hidden"
                                      onChange={(e) => {
                                        e.stopPropagation();
                                        handleAudioUpload(index, trackIdx, e.target.files?.[0]);
                                      }}
                                    />
                                    <Upload className="w-4 h-4" />
                                    <span>Subir Audio</span>
                                  </label>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Clips Section */}
                      <div className="border-t border-white/10 pt-4 mt-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                          <div className="flex items-center gap-2">
                            <Film className="w-4 h-4 text-purple-400" />
                            <label className="text-xs text-gray-400 font-medium">
                              Video Clips ({testimonial.clips?.length || 0})
                            </label>
                          </div>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              addClip(index);
                            }}
                            type="button"
                            className="px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 rounded text-purple-400 text-xs transition-colors whitespace-nowrap"
                          >
                            + Clip
                          </button>
                        </div>
                        
                        {testimonial.clips?.length > 0 && (
                          <div className="space-y-3">
                            {testimonial.clips.map((clip, clipIdx) => (
                              <div key={clipIdx} className="p-3 bg-zinc-800/50 rounded-lg space-y-2 border border-white/5">
                                <div className="flex flex-col sm:flex-row items-start gap-2">
                                  <input
                                    type="text"
                                    value={clip.title}
                                    onChange={(e) => {
                                      e.stopPropagation();
                                      updateClip(index, clipIdx, 'title', e.target.value);
                                    }}
                                    onBlur={saveTestimonial}
                                    placeholder="Título del clip"
                                    className="flex-1 w-full px-3 py-2 bg-white/5 rounded border border-white/10 text-white text-sm focus:outline-none focus:border-purple-500"
                                  />
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      removeClip(index, clipIdx);
                                    }}
                                    type="button"
                                    className="p-2 hover:bg-red-500/20 rounded text-red-400 transition-colors"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                                <input
                                  type="text"
                                  value={clip.thumbnail_url || ""}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    updateClip(index, clipIdx, 'thumbnail_url', e.target.value);
                                  }}
                                  onBlur={saveTestimonial}
                                  placeholder="URL miniatura"
                                  className="w-full px-3 py-2 bg-white/5 rounded border border-white/10 text-white text-sm focus:outline-none focus:border-purple-500"
                                />
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                  <input
                                    type="text"
                                    value={clip.video_url || ""}
                                    onChange={(e) => {
                                      e.stopPropagation();
                                      updateClip(index, clipIdx, 'video_url', e.target.value);
                                    }}
                                    onBlur={saveTestimonial}
                                    placeholder="URL del video"
                                    className="flex-1 px-3 py-2 bg-white/5 rounded border border-white/10 text-white text-sm focus:outline-none focus:border-purple-500"
                                  />
                                  <label className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 rounded text-purple-400 cursor-pointer text-sm transition-colors flex items-center justify-center gap-2">
                                    <input
                                      type="file"
                                      accept="video/*"
                                      className="hidden"
                                      onChange={(e) => {
                                        e.stopPropagation();
                                        handleClipUpload(index, clipIdx, e.target.files?.[0]);
                                      }}
                                      disabled={uploadingClip === `${index}-${clipIdx}`}
                                    />
                                    {uploadingClip === `${index}-${clipIdx}` ? (
                                      <>
                                        <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                                        <span>Subiendo...</span>
                                      </>
                                    ) : (
                                      <>
                                        <Upload className="w-4 h-4" />
                                        <span>Subir Video</span>
                                      </>
                                    )}
                                  </label>
                                </div>
                                <p className="text-xs text-gray-500">Máx. 100MB</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {localTestimonials.length === 0 && (
        <div className="text-center py-12 border border-dashed border-white/20 rounded-xl">
          <p className="text-gray-500 mb-4">No hay historias todavía</p>
          <button
            onClick={addTestimonial}
            className="px-6 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 rounded-lg text-emerald-400 text-sm font-medium transition-colors"
          >
            Añadir primera historia
          </button>
        </div>
      )}
    </div>
  );
}