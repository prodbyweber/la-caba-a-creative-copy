import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Music2, Upload, Edit, Image as ImageIcon, Check, X } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import NetflixTrackCard from "./NetflixTrackCard";

export default function TracksSection({ jlyArtistId }) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTrack, setEditingTrack] = useState(null);

  const queryClient = useQueryClient();

  const { data: allTracks = [], isLoading } = useQuery({
    queryKey: ['all-tracks'],
    queryFn: () => base44.entities.Track.list('-created_date'),
    initialData: [],
  });

  const { data: allProjects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => base44.entities.Project.list(),
    initialData: [],
  });

  // Filtrar proyectos del artista JLY
  const projects = jlyArtistId 
    ? allProjects.filter(project => project.artist_id === jlyArtistId)
    : allProjects;

  // Filtrar tracks que pertenecen a proyectos de JLY
  const tracks = jlyArtistId
    ? allTracks.filter(track => {
        const project = allProjects.find(p => p.id === track.project_id);
        return project && project.artist_id === jlyArtistId;
      })
    : allTracks;

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
        className="bg-gradient-to-br from-[#141414] to-black rounded-2xl border border-white/5"
        style={{ overflow: "visible" }}
      >
        {/* Header */}
        <div className="p-3 lg:p-4 border-b border-white/5 flex items-center justify-between" style={{ borderRadius: "1rem 1rem 0 0", background: "linear-gradient(to right, #141414, #0a0a0b)" }}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <Music2 className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Tracks</h3>
              <p className="text-xs text-gray-500 hidden lg:block">Con metadata y versiones</p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-3 py-1.5 rounded-lg bg-purple-500 hover:bg-purple-600 text-white text-sm font-medium flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Nuevo</span>
          </button>
        </div>

        {/* Tracks Carousel */}
        <div className="py-4 px-2" style={{ overflowX: "visible" }}>
          {tracks.length === 0 ? (
            <div className="text-center py-8 px-4">
              <Music2 className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 text-sm mb-3">No tienes tracks aún</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-colors"
              >
                Crear tu primer track
              </button>
            </div>
          ) : (
            <div
              className="flex gap-3 pb-2"
              style={{
                overflowX: "auto",
                overflowY: "visible",
                scrollbarWidth: "none",
                msOverflowStyle: "none",
                paddingBottom: "180px",
                marginBottom: "-180px",
              }}
            >
              {tracks.map((track, index) => (
                <NetflixTrackCard
                  key={track.id}
                  track={track}
                  index={index}
                  onEdit={setEditingTrack}
                />
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
    audio_file_url: "",
    composers: [],
    producers: [],
    mix_engineer: "",
    master_engineer: "",
    dolby_atmos: false,
    genre: "",
    bpm: null,
    key: "",
    status: "idea",
    notes: "",
    versions: {}
  });
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [newComposer, setNewComposer] = useState("");
  const [newProducer, setNewProducer] = useState("");

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
      queryClient.invalidateQueries({ queryKey: ['tracks'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
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

  const handleAudioUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 70 * 1024 * 1024; // 70MB
    if (file.size > maxSize) {
      alert('El archivo supera los 70MB');
      return;
    }

    const validTypes = ['audio/mpeg', 'audio/wav', 'audio/x-wav'];
    if (!validTypes.includes(file.type)) {
      alert('Solo se permiten archivos MP3 o WAV');
      return;
    }

    setUploadingAudio(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, audio_file_url: file_url });
    } catch (error) {
      console.error('Error uploading audio:', error);
    } finally {
      setUploadingAudio(false);
    }
  };

  const addComposer = () => {
    if (newComposer.trim()) {
      setFormData({ 
        ...formData, 
        composers: [...(formData.composers || []), newComposer.trim()] 
      });
      setNewComposer("");
    }
  };

  const removeComposer = (index) => {
    setFormData({
      ...formData,
      composers: formData.composers.filter((_, i) => i !== index)
    });
  };

  const addProducer = () => {
    if (newProducer.trim()) {
      setFormData({ 
        ...formData, 
        producers: [...(formData.producers || []), newProducer.trim()] 
      });
      setNewProducer("");
    }
  };

  const removeProducer = (index) => {
    setFormData({
      ...formData,
      producers: formData.producers.filter((_, i) => i !== index)
    });
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
                  {track ? 'Editar Track' : 'Nuevo Track'}
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

            {/* Audio Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">Archivo de Audio</label>
              <div className="flex items-center gap-4">
                <div className="w-32 h-32 rounded-xl bg-gradient-to-br from-emerald-500/20 to-blue-500/20 flex items-center justify-center">
                  <Music2 className="w-12 h-12 text-white/40" />
                </div>
                <div className="flex-1">
                  <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium transition-colors">
                    <Upload className="w-4 h-4" />
                    {uploadingAudio ? 'Subiendo...' : formData.audio_file_url ? 'Cambiar Audio' : 'Subir Audio'}
                    <input
                      type="file"
                      accept="audio/mpeg,audio/wav"
                      onChange={handleAudioUpload}
                      className="hidden"
                      disabled={uploadingAudio}
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-2">MP3 o WAV. Máx 70MB.</p>
                  {formData.audio_file_url && (
                    <p className="text-xs text-emerald-400 mt-1">✓ Audio cargado</p>
                  )}
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
                      {project.title}
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

              {/* Composers */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Compositores</label>
                <div className="space-y-2">
                  {formData.composers?.map((composer, index) => (
                    <div key={index} className="flex items-center gap-2 bg-white/5 px-3 py-2 rounded-lg">
                      <span className="flex-1 text-white text-sm">{composer}</span>
                      <button
                        type="button"
                        onClick={() => removeComposer(index)}
                        className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-red-400 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newComposer}
                      onChange={(e) => setNewComposer(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addComposer())}
                      placeholder="Agregar compositor"
                      className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={addComposer}
                      className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg text-purple-400 font-medium transition-colors"
                    >
                      Agregar
                    </button>
                  </div>
                </div>
              </div>

              {/* Producers */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Productores Musicales</label>
                <div className="space-y-2">
                  {formData.producers?.map((producer, index) => (
                    <div key={index} className="flex items-center gap-2 bg-white/5 px-3 py-2 rounded-lg">
                      <span className="flex-1 text-white text-sm">{producer}</span>
                      <button
                        type="button"
                        onClick={() => removeProducer(index)}
                        className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-red-400 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newProducer}
                      onChange={(e) => setNewProducer(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addProducer())}
                      placeholder="Agregar productor"
                      className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={addProducer}
                      className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg text-purple-400 font-medium transition-colors"
                    >
                      Agregar
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
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

            {/* Drive Folders */}
            <div className="space-y-3">
              <h4 className="font-semibold text-white flex items-center gap-2">
                <span className="w-1 h-4 bg-emerald-500 rounded-full" />
                Links de Drive / Versiones
              </h4>
              <div className="grid md:grid-cols-2 gap-3">
                {[
                  { key: "mp3", label: "MP3" },
                  { key: "wav_24bit", label: "WAV 24bit" },
                  { key: "stems", label: "Stems" },
                  { key: "mix", label: "Mix" },
                  { key: "master_24bit", label: "Master 24bit" },
                  { key: "show", label: "Show en vivo" },
                  { key: "acapella", label: "Acapella" },
                  { key: "beat_wav", label: "Beat WAV" },
                ].map(v => (
                  <div key={v.key}>
                    <label className="block text-xs font-medium text-gray-400 mb-1">{v.label}</label>
                    <input
                      type="text"
                      value={formData.versions?.[v.key] || ""}
                      onChange={(e) => setFormData({
                        ...formData,
                        versions: { ...(formData.versions || {}), [v.key]: e.target.value }
                      })}
                      placeholder="https://drive.google.com/..."
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Notas</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Notas adicionales sobre la pista..."
                rows={3}
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
                    {track ? 'Guardar Cambios' : 'Crear Track'}
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