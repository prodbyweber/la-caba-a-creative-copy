import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Upload, ChevronDown, ChevronUp } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function TimelineEditor({ timeline = [], onUpdate }) {
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [uploading, setUploading] = useState(null);

  const addMilestone = () => {
    onUpdate([...timeline, {
      year: new Date().getFullYear().toString(),
      title: "Nuevo hito",
      description: "Descripción del hito",
      image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&h=500&fit=crop&q=80"
    }]);
  };

  const updateMilestone = (index, field, value) => {
    const updated = [...timeline];
    updated[index] = { ...updated[index], [field]: value };
    onUpdate(updated);
  };

  const removeMilestone = (index) => {
    onUpdate(timeline.filter((_, i) => i !== index));
  };

  const handleImageUpload = async (index, file) => {
    if (!file) return;
    
    setUploading(index);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      updateMilestone(index, 'image', file_url);
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
          {timeline.length} hitos en el timeline
        </span>
        <button
          onClick={addMilestone}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 rounded-lg text-emerald-400 text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Añadir Hito
        </button>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {timeline.map((milestone, index) => (
            <motion.div
              key={index}
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
                          onChange={(e) => updateMilestone(index, 'year', e.target.value)}
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
                          onChange={(e) => updateMilestone(index, 'title', e.target.value)}
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
                          onChange={(e) => updateMilestone(index, 'description', e.target.value)}
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
                              onChange={(e) => updateMilestone(index, 'image', e.target.value)}
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

      {timeline.length === 0 && (
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