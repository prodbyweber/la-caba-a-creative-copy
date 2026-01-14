import React, { useState } from "react";
import { motion } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Edit, Check, X, Upload, Image as ImageIcon } from "lucide-react";

export default function ProjectHeader({ project, tracksCount, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(project);
  const [uploadingCover, setUploadingCover] = useState(false);

  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.Project.update(project.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', project.id] });
      setIsEditing(false);
      onUpdate();
    },
  });

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, cover_url: file_url });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setUploadingCover(false);
    }
  };

  const statusColors = {
    Draft: "bg-gray-500/10 text-gray-400 border-gray-500/20",
    Recording: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    Producing: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    Mixing: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    Mastering: "bg-pink-500/10 text-pink-400 border-pink-500/20",
    Delivered: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-[#141414] to-black rounded-2xl border border-white/5 overflow-hidden mb-6"
    >
      {isEditing ? (
        <div className="p-8">
          <div className="flex items-start gap-6 mb-6">
            {/* Cover Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Portada del Proyecto</label>
              <div className="w-40 h-40 rounded-xl bg-gradient-to-br from-emerald-500/20 to-purple-500/20 flex items-center justify-center overflow-hidden">
                {formData.cover_url ? (
                  <img src={formData.cover_url} alt="Cover" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-16 h-16 text-white/40" />
                )}
              </div>
              <label className="mt-3 cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium transition-colors">
                <Upload className="w-4 h-4" />
                {uploadingCover ? 'Subiendo...' : 'Cambiar Portada'}
                <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" disabled={uploadingCover} />
              </label>
            </div>

            {/* Metadata Form */}
            <div className="flex-1 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Título *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Tipo</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500/50"
                  >
                    <option value="Single">Single</option>
                    <option value="EP">EP</option>
                    <option value="Album">Álbum</option>
                    <option value="ContentPack">Content Pack</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Estado</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500/50"
                  >
                    <option value="Draft">Borrador</option>
                    <option value="Recording">Grabación</option>
                    <option value="Producing">Producción</option>
                    <option value="Mixing">Mezcla</option>
                    <option value="Mastering">Masterización</option>
                    <option value="Delivered">Entregado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Género</label>
                  <input
                    type="text"
                    value={formData.genre || ""}
                    onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Descripción</label>
                <textarea
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500/50 resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setFormData(project);
                  }}
                  className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white font-medium transition-colors flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancelar
                </button>
                <button
                  onClick={() => updateMutation.mutate(formData)}
                  disabled={updateMutation.isPending}
                  className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  {updateMutation.isPending ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8">
          <div className="flex items-start gap-6">
            {/* Cover */}
            {formData.cover_url && (
              <div className="w-40 h-40 rounded-xl overflow-hidden flex-shrink-0">
                <img src={formData.cover_url} alt={project.title} className="w-full h-full object-cover" />
              </div>
            )}

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-4xl font-bold mb-2">{project.title}</h1>
                  {project.description && (
                    <p className="text-gray-400 mb-4">{project.description}</p>
                  )}
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className={`px-3 py-1 rounded-lg text-sm font-medium border ${statusColors[project.status]}`}>
                      {project.status}
                    </span>
                    {project.type && (
                      <span className="px-3 py-1 rounded-lg text-sm font-medium bg-purple-500/10 text-purple-400">
                        {project.type}
                      </span>
                    )}
                    {project.genre && (
                      <span className="px-3 py-1 rounded-lg text-sm font-medium bg-blue-500/10 text-blue-400">
                        {project.genre}
                      </span>
                    )}
                    <span className="text-gray-500 text-sm">
                      {tracksCount} tracks
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white font-medium transition-colors flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Editar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}