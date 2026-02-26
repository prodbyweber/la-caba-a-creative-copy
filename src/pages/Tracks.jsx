import React, { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Music2, Play, Pause, Edit, Trash2, Search, Plus, Image as ImageIcon, Upload, X, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function TracksPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [editingTrack, setEditingTrack] = useState(null);
  const [playingTrackId, setPlayingTrackId] = useState(null);
  const audioRefs = React.useRef({});

  const urlParams = new URLSearchParams(window.location.search);
  const artistId = urlParams.get("artistId");

  const queryClient = useQueryClient();

  const { data: allTracks = [], isLoading } = useQuery({
    queryKey: ['all-tracks'],
    queryFn: () => base44.entities.Track.list('-created_date'),
    initialData: [],
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => base44.entities.Project.list(),
    initialData: [],
  });

  // Filtrar tracks por artista si hay artistId en la URL
  const tracks = artistId 
    ? allTracks.filter(track => {
        const project = projects.find(p => p.id === track.project_id);
        return project && project.artist_id === artistId;
      })
    : allTracks;

  const filteredTracks = tracks.filter(track => 
    track.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const togglePlay = async (trackId) => {
    const audio = audioRefs.current[trackId];
    if (!audio) {
      console.error('Audio element not found for track:', trackId);
      return;
    }

    try {
      if (playingTrackId === trackId) {
        audio.pause();
        setPlayingTrackId(null);
      } else {
        // Pause any other playing track
        if (playingTrackId && audioRefs.current[playingTrackId]) {
          audioRefs.current[playingTrackId].pause();
        }
        
        // Play audio
        setPlayingTrackId(trackId);
        await audio.play();
      }
    } catch (err) {
      console.error('Error playing audio:', err);
      setPlayingTrackId(null);
    }
  };

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

  return (
    <AdminLayout activePage="Tracks">
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Tracks</h1>
          <p className="text-gray-500">Gestiona todos los tracks del estudio</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar tracks..."
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-emerald-500/50"
            />
          </div>
        </div>

        {/* Tracks Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white/5 rounded-xl p-4 animate-pulse">
                <div className="aspect-square bg-white/5 rounded-lg mb-4" />
                <div className="h-4 bg-white/5 rounded w-3/4 mb-2" />
                <div className="h-3 bg-white/5 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredTracks.length === 0 ? (
          <div className="text-center py-20">
            <Music2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No se encontraron tracks</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredTracks.map((track) => {
              const project = projects.find(p => p.id === track.project_id);
              
              return (
                <motion.div
                  key={track.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/5 rounded-xl border border-white/5 hover:border-purple-500/30 transition-all overflow-hidden group"
                >
                  {/* Cover with Play Button */}
                  <div className="relative aspect-square">
                    {track.audio_file_url && (
                      <audio
                        ref={(el) => { if (el) audioRefs.current[track.id] = el; }}
                        src={track.audio_file_url}
                        preload="metadata"
                        playsInline
                        onEnded={() => setPlayingTrackId(null)}
                        onPause={() => { if (playingTrackId === track.id) setPlayingTrackId(null); }}
                        onPlay={() => setPlayingTrackId(track.id)}
                        onError={(e) => console.error('Audio load error:', e, track.audio_file_url)}
                      />
                    )}
                    
                    <div className="w-full h-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center overflow-hidden">
                      {track.cover_url ? (
                        <img src={track.cover_url} alt={track.title} className="w-full h-full object-cover" />
                      ) : (
                        <Music2 className="w-16 h-16 text-white/20" />
                      )}
                    </div>

                    {/* Play Button Overlay */}
                    {track.audio_file_url && (
                      <>
                        <div className={`absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity ${playingTrackId === track.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                        <button
                          type="button"
                          onTouchEnd={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            togglePlay(track.id);
                          }}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            togglePlay(track.id);
                          }}
                          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/90 hover:bg-white active:scale-95 hover:scale-110 flex items-center justify-center transition-all shadow-2xl z-10 touch-manipulation"
                        >
                          {playingTrackId === track.id ? (
                            <Pause className="w-6 h-6 text-black" fill="black" />
                          ) : (
                            <Play className="w-6 h-6 text-black ml-0.5" fill="black" />
                          )}
                        </button>
                      </>
                    )}

                    {/* Actions Overlay */}
                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setEditingTrack(track)}
                        className="p-2 rounded-lg bg-black/60 backdrop-blur-sm hover:bg-black/80 text-white transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('¿Eliminar este track?')) {
                            deleteMutation.mutate(track.id);
                          }
                        }}
                        className="p-2 rounded-lg bg-black/60 backdrop-blur-sm hover:bg-red-500 text-white transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Track Info */}
                  <Link to={createPageUrl(`TrackDetail?id=${track.id}`)} className="block p-4">
                    <h3 className="font-bold text-white mb-1 truncate group-hover:text-purple-400 transition-colors">
                      {track.title}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2 truncate">
                      {project ? project.title : 'Sin proyecto'}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[track.status]}`}>
                        {statusLabels[track.status]}
                      </span>
                      {track.dolby_atmos && (
                        <span className="px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 text-xs font-medium">
                          Atmos
                        </span>
                      )}
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Track Modal */}
      {editingTrack && (
        <TrackEditModal
          track={editingTrack}
          projects={projects}
          onClose={() => setEditingTrack(null)}
        />
      )}
    </AdminLayout>
  );
}

function TrackEditModal({ track, projects, onClose }) {
  const [formData, setFormData] = useState(track);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [newComposer, setNewComposer] = useState("");
  const [newProducer, setNewProducer] = useState("");

  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.Track.update(track.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-tracks'] });
      onClose();
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(formData);
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

    const maxSize = 70 * 1024 * 1024;
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-3xl bg-[#141414] rounded-2xl border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between sticky top-0 bg-[#141414] z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <Music2 className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Editar Track</h3>
              <p className="text-sm text-gray-500">Actualiza la metadata del track</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Cover & Audio Upload */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">Portada</label>
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center overflow-hidden">
                  {formData.cover_url ? (
                    <img src={formData.cover_url} alt="Cover" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-white/40" />
                  )}
                </div>
                <div className="flex-1">
                  <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium transition-colors">
                    <Upload className="w-4 h-4" />
                    {uploadingCover ? 'Subiendo...' : 'Cambiar'}
                    <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" disabled={uploadingCover} />
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">Audio</label>
              <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium transition-colors">
                <Upload className="w-4 h-4" />
                {uploadingAudio ? 'Subiendo...' : formData.audio_file_url ? 'Cambiar Audio' : 'Subir Audio'}
                <input type="file" accept="audio/mpeg,audio/wav" onChange={handleAudioUpload} className="hidden" disabled={uploadingAudio} />
              </label>
              {formData.audio_file_url && (
                <p className="text-xs text-emerald-400 mt-2">✓ Audio cargado</p>
              )}
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
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Proyecto</label>
              <select
                value={formData.project_id}
                onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50"
              >
                <option value="">Sin proyecto</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>{project.title}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Credits */}
          <div className="space-y-4">
            <h4 className="font-semibold text-white">Créditos</h4>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Compositores</label>
              <div className="space-y-2">
                {formData.composers?.map((composer, index) => (
                  <div key={index} className="flex items-center gap-2 bg-white/5 px-3 py-2 rounded-lg">
                    <span className="flex-1 text-white text-sm">{composer}</span>
                    <button type="button" onClick={() => removeComposer(index)} className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-red-400">
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
                    className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500/50"
                  />
                  <button type="button" onClick={addComposer} className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg text-purple-400">
                    Agregar
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Productores</label>
              <div className="space-y-2">
                {formData.producers?.map((producer, index) => (
                  <div key={index} className="flex items-center gap-2 bg-white/5 px-3 py-2 rounded-lg">
                    <span className="flex-1 text-white text-sm">{producer}</span>
                    <button type="button" onClick={() => removeProducer(index)} className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-red-400">
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
                    className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500/50"
                  />
                  <button type="button" onClick={addProducer} className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg text-purple-400">
                    Agregar
                  </button>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Mix Engineer</label>
                <input
                  type="text"
                  value={formData.mix_engineer || ""}
                  onChange={(e) => setFormData({ ...formData, mix_engineer: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Master Engineer</label>
                <input
                  type="text"
                  value={formData.master_engineer || ""}
                  onChange={(e) => setFormData({ ...formData, master_engineer: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500/50"
                />
              </div>
            </div>
          </div>

          {/* Technical Info */}
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Género</label>
              <input
                type="text"
                value={formData.genre || ""}
                onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">BPM</label>
              <input
                type="number"
                value={formData.bpm || ""}
                onChange={(e) => setFormData({ ...formData, bpm: parseInt(e.target.value) || null })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Key</label>
              <input
                type="text"
                value={formData.key || ""}
                onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Estado</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500/50"
              >
                <option value="idea">Idea</option>
                <option value="production">Producción</option>
                <option value="mixing">Mezcla</option>
                <option value="mastering">Masterización</option>
                <option value="completed">Completado</option>
              </select>
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
                <p className="text-xs text-gray-500">Masterización espacial</p>
              </div>
            </label>
          </div>

          {/* Versions Section */}
          <div className="space-y-4">
            <h4 className="font-semibold text-white">Versiones del Track</h4>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">MP3</label>
                <input
                  type="url"
                  value={formData.versions?.mp3 || ""}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    versions: { ...formData.versions, mp3: e.target.value }
                  })}
                  placeholder="https://drive.google.com/..."
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">WAV 24bit</label>
                <input
                  type="url"
                  value={formData.versions?.wav_24bit || ""}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    versions: { ...formData.versions, wav_24bit: e.target.value }
                  })}
                  placeholder="https://drive.google.com/..."
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Stems</label>
                <input
                  type="url"
                  value={formData.versions?.stems || ""}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    versions: { ...formData.versions, stems: e.target.value }
                  })}
                  placeholder="https://drive.google.com/..."
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Mix</label>
                <input
                  type="url"
                  value={formData.versions?.mix || ""}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    versions: { ...formData.versions, mix: e.target.value }
                  })}
                  placeholder="https://drive.google.com/..."
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Master 24bit</label>
                <input
                  type="url"
                  value={formData.versions?.master_24bit || ""}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    versions: { ...formData.versions, master_24bit: e.target.value }
                  })}
                  placeholder="https://drive.google.com/..."
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Show</label>
                <input
                  type="url"
                  value={formData.versions?.show || ""}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    versions: { ...formData.versions, show: e.target.value }
                  })}
                  placeholder="https://drive.google.com/..."
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Acapella</label>
                <input
                  type="url"
                  value={formData.versions?.acapella || ""}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    versions: { ...formData.versions, acapella: e.target.value }
                  })}
                  placeholder="https://drive.google.com/..."
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Beat WAV</label>
                <input
                  type="url"
                  value={formData.versions?.beat_wav || ""}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    versions: { ...formData.versions, beat_wav: e.target.value }
                  })}
                  placeholder="https://drive.google.com/..."
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium">
              Cancelar
            </button>
            <button type="submit" disabled={updateMutation.isPending} className="flex-1 px-4 py-3 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-medium disabled:opacity-50 flex items-center justify-center gap-2">
              {updateMutation.isPending ? 'Guardando...' : (
                <>
                  <Check className="w-4 h-4" />
                  Guardar Cambios
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}