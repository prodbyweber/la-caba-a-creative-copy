import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";
import { X, Upload, Save } from "lucide-react";

export default function ArtistProfileEditor({ artist, isOpen, onClose }) {
  const [formData, setFormData] = useState({
    stageName: artist?.stageName || "",
    legalName: artist?.legalName || "",
    email: artist?.email || "",
    phone: artist?.phone || "",
    location: artist?.location || "",
    bio: artist?.bio || "",
    avatar_url: artist?.avatar_url || ""
  });
  const [isSaving, setIsSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(artist?.avatar_url || "");
  const queryClient = useQueryClient();

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setAvatarPreview(event.target?.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let avatarUrl = formData.avatar_url;

      // Subir imagen si hay una nueva
      if (avatarFile) {
        try {
          const uploadResponse = await base44.integrations.Core.UploadFile({
            file: avatarFile
          });
          avatarUrl = uploadResponse.file_url;
        } catch (err) {
          console.error('Error uploading avatar:', err);
        }
      }

      // Actualizar perfil de artista
      await base44.entities.Artist.update(artist.id, {
        ...formData,
        avatar_url: avatarUrl
      });

      // Invalidar cache
      queryClient.invalidateQueries({ queryKey: ['artist', artist.id] });
      queryClient.invalidateQueries({ queryKey: ['artists'] });

      onClose();
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Error al guardar el perfil');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-[#111113] border border-white/10 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Editar Perfil</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Avatar Upload */}
            <div className="mb-6">
              <label className="block text-sm text-gray-400 mb-3">Foto de Perfil</label>
              <div className="flex items-center gap-4">
                {/* Preview */}
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-white/5 flex-shrink-0">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-2xl font-bold text-gray-600">
                        {formData.stageName?.[0]?.toUpperCase() || "A"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Upload Button */}
                <label className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/15 rounded-lg border border-white/20 cursor-pointer transition-colors flex items-center justify-center gap-2">
                  <Upload className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-400">Cambiar foto</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Nombre Artístico *</label>
                <input
                  type="text"
                  value={formData.stageName}
                  onChange={(e) => setFormData(prev => ({ ...prev, stageName: e.target.value }))}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
                  placeholder="Tu nombre artístico"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Nombre Legal</label>
                <input
                  type="text"
                  value={formData.legalName}
                  onChange={(e) => setFormData(prev => ({ ...prev, legalName: e.target.value }))}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
                  placeholder="Tu nombre legal"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
                  placeholder="tu@email.com"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Teléfono</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
                  placeholder="+34 123 456 789"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Ubicación</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
                  placeholder="Madrid, España"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Biografía</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 transition-colors resize-none"
                  placeholder="Cuéntanos sobre ti..."
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end">
              <button
                onClick={onClose}
                disabled={isSaving}
                className="px-6 py-2 rounded-lg border border-white/20 text-white hover:bg-white/10 disabled:opacity-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-medium transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}