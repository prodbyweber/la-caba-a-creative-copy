import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import MobileTrackPoster, { MobileAudioProvider } from "./MobileTrackPoster";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Music2, Upload, Edit, Image as ImageIcon, Check, X, Link } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import NetflixTrackCard from "./NetflixTrackCard";

export default function TracksSection({ jlyArtistId }) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTrack, setEditingTrack] = useState(null);

  const queryClient = useQueryClient();

  const { data: tracks = [], isLoading } = useQuery({
    queryKey: ['tracks', jlyArtistId || 'all'],
    queryFn: async () => {
      if (jlyArtistId) {
        // Tracks directos del artista
        const byArtist = await base44.entities.Track.filter({ artist_id: jlyArtistId });
        // También tracks vinculados por proyecto del artista
        const projects = await base44.entities.Project.filter({ artist_id: jlyArtistId });
        const projectIds = new Set(projects.map(p => p.id));
        // Buscar tracks sin artist_id pero con project_id del artista
        if (projectIds.size > 0) {
          const allTracks = await base44.entities.Track.list('-created_date', 200);
          const byProject = allTracks.filter(t => !t.artist_id && projectIds.has(t.project_id));
          const seen = new Set(byArtist.map(t => t.id));
          return [...byArtist, ...byProject.filter(t => !seen.has(t.id))];
        }
        return byArtist;
      }
      return base44.entities.Track.list('-created_date', 50);
    },
    initialData: [],
    staleTime: 0,
  });

  const { data: allProjects = [] } = useQuery({
    queryKey: ['projects', jlyArtistId || 'all'],
    queryFn: () => jlyArtistId
      ? base44.entities.Project.filter({ artist_id: jlyArtistId })
      : base44.entities.Project.list('-created_date'),
    initialData: [],
    staleTime: 0,
  });

  const projects = allProjects;

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Track.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracks'] });
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
        style={{ overflow: "visible" }}
      >
        {/* Visual wrapper — border/bg only, no overflow clipping */}
        <div className="sm:bg-gradient-to-br sm:from-[#141414] sm:to-black sm:rounded-2xl sm:border sm:border-white/5" style={{ overflow: "visible" }}>

        {/* Header */}
        <div className="px-0 sm:px-4 sm:py-3 sm:border-b sm:border-white/5 flex items-center justify-between mb-3 sm:mb-0"
          style={{ borderRadius: "1rem 1rem 0 0" }}>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex w-8 h-8 rounded-lg bg-white/5 items-center justify-center">
              <Music2 className="w-4 h-4 text-white/40" />
            </div>
            <h3 className="text-base font-bold text-white">Soundtracks</h3>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-white/60 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-3 h-3" />
            <span className="hidden lg:inline">Nuevo soundtrack</span>
          </button>
        </div>

        {/* MOBILE: poster-style Netflix carousel edge-to-edge */}
        <div className="sm:hidden -mx-4 px-4">
          {tracks.length === 0 ? (
            <div className="text-center py-8 px-4">
              <Music2 className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 text-sm mb-3">No tienes soundtracks aún</p>
              <button onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-colors">
                Crear tu primer soundtrack
              </button>
            </div>
          ) : (
            <MobileAudioProvider>
              <div className="overflow-x-auto" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
                <div className="flex gap-2.5" style={{ width: "max-content" }}>
                  {tracks.map((track) => (
                    <MobileTrackPoster key={track.id} track={track} onEdit={setEditingTrack} />
                  ))}
                  <div className="flex-shrink-0 w-1" />
                </div>
              </div>
            </MobileAudioProvider>
          )}
        </div>

        {/* DESKTOP: existing Netflix hover cards */}
        <div className="hidden sm:block" style={{ overflowX: "auto", overflowY: "visible", padding: "80px 16px 240px", margin: "-80px 0 -240px", scrollbarWidth: "none", msOverflowStyle: "none" }}>
          {tracks.length === 0 ? (
            <div className="text-center py-8 px-4">
              <Music2 className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 text-sm mb-3">No tienes soundtracks aún</p>
              <button onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-colors">
                Crear tu primer soundtrack
              </button>
            </div>
          ) : (
            <div className="flex gap-3" style={{ width: "max-content" }}>
              {tracks.map((track, index) => (
                <NetflixTrackCard key={track.id} track={track} index={index} onEdit={setEditingTrack} />
              ))}
            </div>
          )}
        </div>
        </div>{/* end visual wrapper */}
      </motion.div>

      {/* Create/Edit Modal — rendered via portal to avoid clipping */}
      {(showCreateModal || !!editingTrack) && ReactDOM.createPortal(
        <TrackModal
          isOpen={true}
          track={editingTrack}
          projects={projects}
          jlyArtistId={jlyArtistId}
          onClose={() => {
            setShowCreateModal(false);
            setEditingTrack(null);
          }}
        />,
        document.body
      )}
    </>
  );
}

function TrackModal({ isOpen, track, projects, jlyArtistId, onClose }) {
  // Lock body scroll while modal is open
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [isOpen]);
  // jlyArtistId es el ID del artista al que se vinculará el track al crearlo
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
  const [audioMode, setAudioMode] = useState(track?.youtube_music_url ? "link" : "file");
  const [newComposer, setNewComposer] = useState("");
  const [newProducer, setNewProducer] = useState("");

  const queryClient = useQueryClient();

  useEffect(() => {
    if (track) {
      setFormData(track);
      setAudioMode(track.youtube_music_url ? "link" : "file");
    } else {
      setFormData({
        title: "",
        project_id: "",
        track_number: null,
        cover_url: "",
        audio_file_url: "",
        youtube_music_url: "",
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
      setAudioMode("file");
    }
  }, [track, isOpen]);

  const saveMutation = useMutation({
    mutationFn: (data) => {
      // Limpiar campos vacíos para no enviar strings vacíos a la BD
      const clean = Object.fromEntries(
        Object.entries(data).filter(([_, v]) => v !== "" && v !== null && v !== undefined)
      );
      if (track) {
        return base44.entities.Track.update(track.id, clean);
      } else {
        // Siempre incluir artist_id del artista activo
        return base44.entities.Track.create({ ...clean, artist_id: jlyArtistId });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracks'] });
      onClose();
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('El título del track es requerido');
      return;
    }
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

    const validTypes = ['audio/mpeg'];
    if (!validTypes.includes(file.type) && !file.name.toLowerCase().endsWith('.mp3')) {
      alert('Solo se permiten archivos MP3');
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
      <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 999999 }}>
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
                  {track ? 'Editar Soundtrack' : 'Nuevo Soundtrack'}
                </h3>
                <p className="text-sm text-gray-500">Completa la información del soundtrack</p>
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

            {/* Audio — MP3 o link YouTube Music */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-300">Audio</label>
                <div className="flex items-center gap-1 bg-white/5 rounded-lg p-0.5">
                  <button
                    type="button"
                    onClick={() => setAudioMode("file")}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${audioMode === "file" ? "bg-white/10 text-white" : "text-white/40 hover:text-white/70"}`}
                  >
                    <Upload className="w-3 h-3" /> MP3
                  </button>
                  <button
                    type="button"
                    onClick={() => setAudioMode("link")}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${audioMode === "link" ? "bg-white/10 text-white" : "text-white/40 hover:text-white/70"}`}
                  >
                    <Link className="w-3 h-3" /> YouTube Music
                  </button>
                </div>
              </div>

              {audioMode === "file" ? (
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-500/20 to-blue-500/20 flex items-center justify-center flex-shrink-0">
                    {formData.audio_file_url ? <Check className="w-7 h-7 text-emerald-400" /> : <Music2 className="w-7 h-7 text-white/40" />}
                  </div>
                  <div className="flex-1">
                    <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium transition-colors text-sm">
                      <Upload className="w-4 h-4" />
                      {uploadingAudio ? 'Subiendo...' : formData.audio_file_url ? 'Cambiar MP3' : 'Subir MP3'}
                      <input type="file" accept=".mp3,audio/mpeg" onChange={handleAudioUpload} className="hidden" disabled={uploadingAudio} />
                    </label>
                    <p className="text-xs text-gray-500 mt-1.5">Solo MP3. Máx 70MB.</p>
                    {formData.audio_file_url && <p className="text-xs text-emerald-400 mt-1">✓ MP3 cargado</p>}
                  </div>
                </div>
              ) : (
                <div>
                  <input
                    type="url"
                    value={formData.youtube_music_url || ""}
                    onChange={(e) => setFormData({ ...formData, youtube_music_url: e.target.value })}
                    placeholder="https://music.youtube.com/watch?v=..."
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-red-500/50 transition-colors text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1.5">Link de YouTube Music o YouTube</p>
                </div>
              )}
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
                  {projects && projects.length > 0 ? (
                    projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.title}
                      </option>
                    ))
                  ) : (
                    <option disabled>No hay proyectos disponibles</option>
                  )}
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

            {/* Carpeta Drive */}
            <div className="space-y-2">
              <h4 className="font-semibold text-white flex items-center gap-2">
                <span className="w-1 h-4 bg-emerald-500 rounded-full" />
                Carpeta de Drive
              </h4>
              <p className="text-xs text-white/30">Link a la carpeta de Google Drive con todas las versiones del track (WAV, stems, etc.)</p>
              <input
                type="text"
                value={formData.versions?.drive_folder || ""}
                onChange={(e) => setFormData({
                  ...formData,
                  versions: { ...(formData.versions || {}), drive_folder: e.target.value }
                })}
                placeholder="https://drive.google.com/drive/folders/..."
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
              />
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
                  {track ? 'Guardar Cambios' : 'Crear Soundtrack'}
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