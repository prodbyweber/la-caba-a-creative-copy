import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Upload, ChevronDown, ChevronUp } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function StoriesEditor({ testimonials = [], onUpdate }) {
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [uploading, setUploading] = useState(null);
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
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setUploading(null);
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
              <div className="flex items-center justify-between p-4">
                <button
                  onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                  className="flex items-center gap-3 flex-1 text-left"
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
                  {expandedIndex === index ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                
                <button
                  onClick={() => removeTestimonial(index)}
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
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
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