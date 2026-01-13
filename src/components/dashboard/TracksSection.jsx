import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Music2, Upload, Edit, Trash2, Image as ImageIcon, Check } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export default function TracksSection() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTrack, setEditingTrack] = useState(null);

  const queryClient = useQueryClient();

  const { data: tracks, isLoading } = useQuery({
    queryKey: ['all-tracks'],
    queryFn: () => base44.entities.Track.list('-created_date'),
    initialData: [],
  });

  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: () => base44.entities.Project.list(),
    initialData: [],
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Track.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-tracks'] });
    },
  });

  const statusColors = {
    idea: "bg-gray-500/10 text-gray-400",
    production: "bg-blue-500/10 text-blue-400",
    mixing: "bg-purple-500/10 text-purple-400",
    mastering: "bg-orange-500/10 text-orange-400",
    completed: "bg-emerald-500/10 text-emerald-400"
  };

  const statusLabels = {
    idea: "Idea",
    production: "Producción",
    mixing: "Mezcla",
    mastering: "Masterización",
    completed: "Completado"
  };

  if (isLoading) {
    return (
      <div className="bg-[#141414] rounded-2xl border border-white/5 p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-white/5 rounded w-1/4" />
          <div className="h-32 bg-white/5 rounded" />
        </div>
      </div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-[#141414] to-black rounded-2xl border border-white/5 overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <Music2 className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Pistas</h3>
              <p className="text-sm text-gray-500">Gestiona tus tracks y metadata</p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-medium flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nueva Pista
          </button>
        </div>

        {/* Tracks List */}
        <div className="p-6">
          {tracks.length === 0 ? (
            <div className="text-center py-12">
              <Music2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No tienes pistas aún</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-colors"
              >
                Crear tu primera pista
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {tracks.map((track, index) => (
                <motion.div
                  key={track.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white/5 rounded-xl p-4 border border-white/5 hover:border-purple-500/30 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    {/* Cover */}
                    <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {track.cover_url ? (
                        <img src={track.cover_url} alt={track.title} className="w-full h-full object-cover" />
                      ) : (
                        <Music2 className="w-6 h-6 text-white/40" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-white mb-1">{track.title}</h4>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                        {track.composer && (
                          <span className="text-xs">Compositor: {track.composer}</span>
                        )}
                        {track.mix_engineer && (
                          <span className="text-xs">Mix: {track.mix_engineer}</span>
                        )}
                        {track.master_engineer && (
                          <span className="text-xs">Master: {track.master_engineer}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[track.status]}`}>
                          {statusLabels[track.status]}
                        </span>
                        {track.dolby_atmos && (
                          <span className="px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 text-xs font-medium">
                            Dolby Atmos
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setEditingTrack(track)}
                        className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('¿Eliminar esta pista?')) {
                            deleteMutation.mutate(track.id);
                          }
                        }}
                        className="p-2 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Create/Edit Modal */}
      <TrackModal
        isOpen={showCreateModal || !!editingTrack}
        track={editingTrack}
        projects={projects}
        onClose={() => {
          setShowCreateModal(false);
          setEditingTrack(null);
        }}
      />
    </>
  );
}

function TrackModal({ isOpen, track, projects, onClose }) {
  const [formData, setFormData] = useState(track || {
    title: "",
    project_id: "",
    track_number: null,
    cover_url: "",
    composer: "",
    mix_engineer: "",
    master_engineer: "",
    dolby_atmos: false,
    genre: "",
    bpm: null,
    key: "",
    status: "idea",
    notes: ""
  });
  const [uploadingCover, setUploadingCover] = useState(false);

  const queryClient = useQueryClient();

  React.useEffect(() => {
    if (track) {
      setFormData(track);
    }
  }, [track]);

  const saveMutation = useMutation({
    mutationFn: (data) => {
      if (track) {
        return base44.entities.Track.update(track.id, data);
      } else {
        return base44.entities.Track.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-tracks'] });
      onClose();
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCover(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, cover_url: file_url });
    } catch (error) {
      console.error('Error uploading cover:', error);
    } finally {
      setUploadingCover(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-3xl bg-[#141414] rounded-2xl border border-white/10 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/5 flex items-center justify-between sticky top-0 bg-[#141414] z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Music2 className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {track ? 'Editar Pista' : 'Nueva Pista'}
                </h3>
                <p className="text-sm text-gray-500">Completa la información del track</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Cover Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">Portada</label>
              <div className="flex items-center gap-4">
                <div className="w-32 h-32 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center overflow-hidden">
                  {formData.cover_url ? (
                    <img src={formData.cover_url} alt="Cover" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-12 h-12 text-white/40" />
                  )}
                </div>
                <div className="flex-1">
                  <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium transition-colors">
                    <Upload className="w-4 h-4" />
                    {uploadingCover ? 'Subiendo...' : 'Subir Portada'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverUpload}
                      className="hidden"
                      disabled={uploadingCover}
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-2">JPG, PNG o GIF. Máx 5MB.</p>
                </div>
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Título *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Nombre de la pista"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50 transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Proyecto</label>
                <select
                  value={formData.project_id}
                  onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50 transition-colors"
                >
                  <option value="">Sin proyecto</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Credits */}
            <div className="space-y-4">
              <h4 className="font-semibold text-white flex items-center gap-2">
                <span className="w-1 h-4 bg-purple-500 rounded-full" />
                Créditos
              </h4>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Compositor</label>
                  <input
                    type="text"
                    value={formData.composer}
                    onChange={(e) => setFormData({ ...formData, composer: e.target.value })}
                    placeholder="Nombre del compositor"
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Ingeniero de Mezcla</label>
                  <input
                    type="text"
                    value={formData.mix_engineer}
                    onChange={(e) => setFormData({ ...formData, mix_engineer: e.target.value })}
                    placeholder="Mix engineer"
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Ingeniero de Master</label>
                  <input
                    type="text"
                    value={formData.master_engineer}
                    onChange={(e) => setFormData({ ...formData, master_engineer: e.target.value })}
                    placeholder="Mastering engineer"
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Technical Info */}
            <div className="space-y-4">
              <h4 className="font-semibold text-white flex items-center gap-2">
                <span className="w-1 h-4 bg-purple-500 rounded-full" />
                Información Técnica
              </h4>
              <div className="grid md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Género</label>
                  <input
                    type="text"
                    value={formData.genre}
                    onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                    placeholder="Trap, Pop..."
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">BPM</label>
                  <input
                    type="number"
                    value={formData.bpm || ""}
                    onChange={(e) => setFormData({ ...formData, bpm: parseInt(e.target.value) || null })}
                    placeholder="120"
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Tonalidad</label>
                  <input
                    type="text"
                    value={formData.key}
                    onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                    placeholder="Am, C#m..."
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Estado</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500/50 transition-colors"
                  >
                    <option value="idea">Idea</option>
                    <option value="production">Producción</option>
                    <option value="mixing">Mezcla</option>
                    <option value="mastering">Masterización</option>
                    <option value="completed">Completado</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Dolby Atmos */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-orange-500/5 border border-orange-500/20">
              <label className="flex items-center gap-3 cursor-pointer flex-1">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={formData.dolby_atmos}
                    onChange={(e) => setFormData({ ...formData, dolby_atmos: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-white/10 rounded-full peer-checked:bg-orange-500 transition-colors" />
                  <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-5" />
                </div>
                <div>
                  <p className="font-medium text-white">Dolby Atmos</p>
                  <p className="text-xs text-gray-500">Masterización espacial inmersiva</p>
                </div>
              </label>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Notas</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Notas adicionales sobre la pista..."
                rows={4}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50 transition-colors resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saveMutation.isPending}
                className="flex-1 px-4 py-3 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saveMutation.isPending ? (
                  'Guardando...'
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    {track ? 'Guardar Cambios' : 'Crear Pista'}
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}