import React, { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import DashboardNav from "@/components/dashboard/DashboardNav";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { 
  ArrowLeft, Plus, Music2, Palette, Edit, Trash2, 
  Check, X, Image as ImageIcon, FileText, Sparkles, Play, Pause, GripVertical,
  FolderPlus, Folder, Film
} from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import ProjectClipsSection from "@/components/project/ProjectClipsSection";
import TrackFilesSection from "@/components/project/TrackFilesSection";

export default function ProjectDetail() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("tracks");
  const [editingTrack, setEditingTrack] = useState(null);
  const [showAddTrack, setShowAddTrack] = useState(false);
  const [playingTrackId, setPlayingTrackId] = useState(null);
  const audioRefs = React.useRef({});
  const [moodboardImages, setMoodboardImages] = useState([]);

  const urlParams = new URLSearchParams(window.location.search);
  const projectId = urlParams.get('id');

  const queryClient = useQueryClient();

  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const projects = await base44.entities.Project.filter({ id: projectId });
      return projects[0];
    },
    enabled: !!projectId,
  });

  const { data: tracks } = useQuery({
    queryKey: ['tracks', projectId],
    queryFn: () => base44.entities.Track.filter({ project_id: projectId }),
    initialData: [],
    enabled: !!projectId,
  });

  const { data: branding } = useQuery({
    queryKey: ['branding', project?.artist_id],
    queryFn: async () => {
      const brandings = await base44.entities.ArtistBranding.filter({ artist_id: project.artist_id });
      return brandings[0];
    },
    enabled: !!project?.artist_id,
  });

  React.useEffect(() => {
    if (project?.moodboard_urls && Array.isArray(project.moodboard_urls)) {
      setMoodboardImages(project.moodboard_urls);
    }
  }, [project]);

  const createTrackMutation = useMutation({
    mutationFn: (data) => base44.entities.Track.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracks', projectId] });
      setShowAddTrack(false);
    },
  });

  const updateTrackMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Track.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracks', projectId] });
      setEditingTrack(null);
    },
  });

  const deleteTrackMutation = useMutation({
    mutationFn: (id) => base44.entities.Track.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracks', projectId] });
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: (data) => base44.entities.Project.update(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    },
  });

  const handleAddMoodboardSlot = async (file) => {
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    const newImages = [...moodboardImages, file_url];
    setMoodboardImages(newImages);
    updateProjectMutation.mutate({ moodboard_urls: newImages });
  };

  const handleRemoveMoodboardSlot = (index) => {
    const newImages = moodboardImages.filter((_, i) => i !== index);
    setMoodboardImages(newImages);
    updateProjectMutation.mutate({ moodboard_urls: newImages });
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(moodboardImages);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setMoodboardImages(items);
    updateProjectMutation.mutate({ moodboard_urls: items });
  };

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

  const tabs = [
    { id: "tracks", label: "Tracks", icon: Music2 },
    { id: "clips", label: "Clips", icon: Play },
    { id: "branding", label: "Branding", icon: Palette },
  ];

  if (!project) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="text-white">Cargando proyecto...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      <DashboardNav />

      <main className="pt-16">
        <div className="p-4 sm:p-6 max-w-6xl mx-auto">
          {/* Project Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-[#141414] to-black rounded-2xl border border-white/5 p-6 mb-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <button 
                  onClick={() => window.history.back()} 
                  className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 mb-3 transition-colors"
                  title="Volver"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Volver</span>
                </button>
                <h1 className="text-3xl sm:text-4xl font-bold mb-2">{project.title}</h1>
                {project.description && (
                  <p className="text-gray-400 mb-3 text-sm sm:text-base">{project.description}</p>
                )}
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-lg text-sm font-medium ${
                    project.status === 'active' 
                      ? 'bg-emerald-500/10 text-emerald-400' 
                      : 'bg-gray-500/10 text-gray-400'
                  }`}>
                    {project.status === 'active' ? 'Activo' : 'Completado'}
                  </span>
                  <span className="text-gray-500 text-sm">
                    {tracks.length} tracks
                  </span>
                </div>
              </div>
            </div>

            {/* Moodboard Gallery - Pinterest Style Collage */}
            {moodboardImages.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <p className="text-xs text-gray-500 flex items-center gap-2">
                    <Palette className="w-3 h-3" />
                    Visual Moodboard
                  </p>
                  <label className="cursor-pointer">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handleAddMoodboardSlot(e.target.files[0])}
                      className="hidden"
                    />
                    <button className="px-2 py-1 text-xs bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 rounded transition-all flex items-center gap-1">
                      <Plus className="w-3 h-3" />
                      Añadir
                    </button>
                  </label>
                </div>
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="moodboard" type="moodboard">
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="grid gap-1 mb-2 auto-rows-[60px] sm:auto-rows-[80px] md:auto-rows-[100px]"
                        style={{
                          gridTemplateColumns: 'repeat(auto-fit, minmax(60px, 1fr))',
                        }}
                      >
                        {moodboardImages.map((url, index) => {
                          const colSpan = 1;
                          const rowSpan = 1;
                          
                          return (
                            <Draggable key={`img-${index}`} draggableId={`img-${index}`} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className={`relative group rounded-lg overflow-hidden cursor-grab active:cursor-grabbing transition-all ${
                                    snapshot.isDragging ? 'opacity-60 ring-2 ring-emerald-400 shadow-lg' : 'hover:shadow-lg'
                                  }`}
                                  style={{
                                    gridColumn: `span ${colSpan}`,
                                    gridRow: `span ${rowSpan}`,
                                    ...provided.draggableProps.style
                                  }}
                                >
                                  <img 
                                    src={url} 
                                    alt={`Ref ${index + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                  
                                  {/* Overlay */}
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all" />
                                  
                                  {/* Drag Handle */}
                                  <div {...provided.dragHandleProps} className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                    <div className="bg-black/70 backdrop-blur-sm p-1.5 rounded-lg">
                                      <GripVertical className="w-4 h-4 text-white" />
                                    </div>
                                  </div>
                                  
                                  {/* Remove Button */}
                                  <button
                                    onClick={() => handleRemoveMoodboardSlot(index)}
                                    className="absolute top-2 right-2 p-1.5 bg-red-500/80 hover:bg-red-600 rounded-lg opacity-0 group-hover:opacity-100 transition-all z-10"
                                  >
                                    <X className="w-4 h-4 text-white" />
                                  </button>
                                </div>
                              )}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </div>
            )}

            {moodboardImages.length === 0 && (
              <label className="block w-full h-20 border-2 border-dashed border-white/10 rounded-lg cursor-pointer hover:border-emerald-500/30 hover:bg-white/5 transition-all">
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleAddMoodboardSlot(e.target.files[0])}
                  className="hidden"
                />
                <div className="w-full h-full flex items-center justify-center gap-2 text-gray-600 text-sm">
                  <Plus className="w-4 h-4" />
                  Añadir referencias visuales al moodboard
                </div>
              </label>
            )}
          </motion.div>

          {/* Tabs */}
          <div className="flex gap-2 mb-4 sm:mb-6 -mx-4 sm:-mx-6 px-4 sm:px-6 py-2 sm:py-3 z-20">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-emerald-500 text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          {activeTab === "clips" ? (
            <ProjectClipsSection projectId={projectId} tracks={tracks} />
          ) : activeTab === "tracks" ? (
            <div className="space-y-4">
              {/* Add Track Button */}
              <button
                onClick={() => setShowAddTrack(!showAddTrack)}
                className="w-full p-4 rounded-xl border-2 border-dashed border-white/10 hover:border-emerald-500/50 bg-white/5 hover:bg-white/10 flex items-center justify-center gap-2 text-gray-400 hover:text-emerald-400 transition-all"
              >
                <Plus className="w-5 h-5" />
                Añadir Track
              </button>

              {/* Add Track Form */}
              {showAddTrack && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="bg-[#141414] rounded-xl p-6 border border-white/5"
                >
                  <TrackForm
                    projectId={projectId}
                    onSubmit={(data) => createTrackMutation.mutate(data)}
                    onCancel={() => setShowAddTrack(false)}
                  />
                </motion.div>
              )}

              {/* Tracks List - Netflix Style Vertical */}
              <div className="space-y-2">
                {tracks.map((track, index) => (
                  <motion.div
                    key={track.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group"
                  >
                    {editingTrack?.id === track.id ? (
                      <div className="bg-[#141414] rounded-xl border border-white/5 overflow-hidden p-6">
                        <TrackForm
                          track={track}
                          projectId={projectId}
                          onSubmit={(data) => updateTrackMutation.mutate({ id: track.id, data })}
                          onCancel={() => setEditingTrack(null)}
                        />
                      </div>
                    ) : (
                      <div className="bg-[#141414] hover:bg-[#1a1a1a] rounded-xl border border-white/5 hover:border-white/10 overflow-hidden transition-all duration-300 flex gap-4 p-4">
                        {/* Track Number */}
                        <div className="text-center font-bold text-gray-500 flex-shrink-0 w-6 h-6 flex items-center justify-center">
                          {track.track_number || index + 1}
                        </div>

                        {/* Cover with Play Button */}
                        <div className="relative flex-shrink-0">
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

                          <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-emerald-500/20 to-purple-500/20 flex items-center justify-center overflow-hidden relative">
                            {track.cover_url ? (
                              <img src={track.cover_url} alt={track.title} className="w-full h-full object-cover" />
                            ) : (
                              <Music2 className="w-6 h-6 text-white/40" />
                            )}

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
                                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white active:scale-95 hover:scale-110 flex items-center justify-center transition-all shadow-lg z-10 touch-manipulation"
                                >
                                  {playingTrackId === track.id ? (
                                    <Pause className="w-4 h-4 text-black" fill="black" />
                                  ) : (
                                    <Play className="w-4 h-4 text-black ml-0.5" fill="black" />
                                  )}
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-white mb-1.5 line-clamp-1">{track.title}</h4>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400">
                            {track.composer && (
                              <span className="truncate">{track.composer}</span>
                            )}
                            {track.composer && track.status && (
                              <span className="text-gray-600">·</span>
                            )}
                            {track.status && (
                              <span className={`px-2 py-0.5 rounded font-medium ${
                                track.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' :
                                track.status === 'mastering' ? 'bg-purple-500/10 text-purple-400' :
                                'bg-gray-500/10 text-gray-400'
                              }`}>
                                {track.status}
                              </span>
                            )}
                            {track.dolby_atmos && (
                              <span className="px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 font-medium">
                                ATMOS
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Duration */}
                        {track.duration && (
                          <div className="text-sm text-gray-500 flex-shrink-0">
                            {Math.floor(track.duration / 60)}:{String(Math.floor(track.duration % 60)).padStart(2, '0')}
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setEditingTrack(track)}
                            className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('¿Eliminar este track?')) {
                                deleteTrackMutation.mutate(track.id);
                              }
                            }}
                            className="p-2 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          ) : (
            <BrandingSection branding={branding} artistId={project.artist_id} />
          )}
        </div>
      </main>
    </div>
  );
}

function TrackForm({ track, projectId, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(track || {
    title: "",
    track_number: null,
    composer: "",
    mix_engineer: "",
    master_engineer: "",
    dolby_atmos: false,
    genre: "",
    status: "idea",
    notes: "",
    audio_file_url: "",
    versions: {}
  });
  const [uploadingAudio, setUploadingAudio] = useState(false);

  const handleAudioUpload = async (file) => {
    if (!file) return;
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

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...formData, project_id: projectId });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Título *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500/50"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Número de Track</label>
          <input
            type="number"
            value={formData.track_number || ""}
            onChange={(e) => setFormData({ ...formData, track_number: parseInt(e.target.value) || null })}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500/50"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Compositor</label>
          <input
            type="text"
            value={formData.composer}
            onChange={(e) => setFormData({ ...formData, composer: e.target.value })}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500/50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Mix Engineer</label>
          <input
            type="text"
            value={formData.mix_engineer}
            onChange={(e) => setFormData({ ...formData, mix_engineer: e.target.value })}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500/50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Master Engineer</label>
          <input
            type="text"
            value={formData.master_engineer}
            onChange={(e) => setFormData({ ...formData, master_engineer: e.target.value })}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500/50"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Género</label>
          <input
            type="text"
            value={formData.genre}
            onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500/50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Estado</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500/50"
          >
            <option value="idea">Idea</option>
            <option value="production">Producción</option>
            <option value="mixing">Mezcla</option>
            <option value="mastering">Masterización</option>
            <option value="completed">Completado</option>
          </select>
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.dolby_atmos}
              onChange={(e) => setFormData({ ...formData, dolby_atmos: e.target.checked })}
              className="w-5 h-5 rounded bg-white/5 border-white/10"
            />
            <span className="text-sm font-medium text-gray-300">Dolby Atmos</span>
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Notas</label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={3}
          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500/50 resize-none"
        />
      </div>

      {/* Audio Files Section - Combined */}
      <div className="space-y-4 bg-white/5 border border-white/10 rounded-lg p-4">
        {/* Main Audio File */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Archivo de Audio Principal</label>
          {formData.audio_file_url ? (
            <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-lg">
              <Music2 className="w-5 h-5 text-emerald-400" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">Audio cargado</p>
                <audio controls src={formData.audio_file_url} className="w-full mt-2 h-8" />
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, audio_file_url: "" })}
                className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-medium transition-colors"
              >
                Quitar
              </button>
            </div>
          ) : (
            <label className="block w-full p-4 border-2 border-dashed border-white/10 rounded-lg cursor-pointer hover:border-emerald-500/50 hover:bg-white/5 transition-all">
              <input
                type="file"
                accept="audio/*"
                onChange={(e) => e.target.files?.[0] && handleAudioUpload(e.target.files[0])}
                className="hidden"
                disabled={uploadingAudio}
              />
              <div className="flex flex-col items-center gap-2 text-gray-400">
                {uploadingAudio ? (
                  <>
                    <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm">Subiendo audio...</span>
                  </>
                ) : (
                  <>
                    <Music2 className="w-8 h-8" />
                    <span className="text-sm">Haz clic para subir un archivo de audio</span>
                    <span className="text-xs text-gray-500">MP3, WAV, M4A</span>
                  </>
                )}
              </div>
            </label>
          )}
        </div>

        {/* Version Files */}
        <TrackFilesSection 
          versions={formData.versions || {}}
          onChange={(versions) => setFormData({ ...formData, versions })}
        />
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white font-medium transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-medium transition-colors"
        >
          {track ? 'Guardar' : 'Crear Track'}
        </button>
      </div>
    </form>
  );
}

function BrandingSection({ branding, artistId }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(branding || {
    primary_font: "",
    secondary_font: "",
    primary_color: "#10b981",
    secondary_color: "#8b5cf6",
    accent_color: "#f97316",
    visual_style: "",
    tone_of_voice: "",
    brand_keywords: []
  });

  const queryClient = useQueryClient();

  const saveBrandingMutation = useMutation({
    mutationFn: (data) => {
      if (branding) {
        return base44.entities.ArtistBranding.update(branding.id, data);
      } else {
        return base44.entities.ArtistBranding.create({ ...data, artist_id: artistId });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branding', artistId] });
      setIsEditing(false);
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Branding del Artista</h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-medium transition-colors"
        >
          {isEditing ? 'Cancelar' : 'Editar Branding'}
        </button>
      </div>

      {isEditing ? (
        <div className="bg-[#141414] rounded-xl p-6 border border-white/5 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Tipografía Principal</label>
              <input
                type="text"
                value={formData.primary_font}
                onChange={(e) => setFormData({ ...formData, primary_font: e.target.value })}
                placeholder="Inter, Helvetica..."
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Tipografía Secundaria</label>
              <input
                type="text"
                value={formData.secondary_font}
                onChange={(e) => setFormData({ ...formData, secondary_font: e.target.value })}
                placeholder="Montserrat, Arial..."
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Color Primario</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={formData.primary_color}
                  onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                  className="w-12 h-10 rounded bg-white/5 border border-white/10"
                />
                <input
                  type="text"
                  value={formData.primary_color}
                  onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                  className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500/50"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Color Secundario</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={formData.secondary_color}
                  onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                  className="w-12 h-10 rounded bg-white/5 border border-white/10"
                />
                <input
                  type="text"
                  value={formData.secondary_color}
                  onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                  className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500/50"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Color de Acento</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={formData.accent_color}
                  onChange={(e) => setFormData({ ...formData, accent_color: e.target.value })}
                  className="w-12 h-10 rounded bg-white/5 border border-white/10"
                />
                <input
                  type="text"
                  value={formData.accent_color}
                  onChange={(e) => setFormData({ ...formData, accent_color: e.target.value })}
                  className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500/50"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Estilo Visual</label>
            <textarea
              value={formData.visual_style}
              onChange={(e) => setFormData({ ...formData, visual_style: e.target.value })}
              placeholder="Describe el estilo visual del artista..."
              rows={3}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500/50 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Tono de Voz</label>
            <textarea
              value={formData.tone_of_voice}
              onChange={(e) => setFormData({ ...formData, tone_of_voice: e.target.value })}
              placeholder="Define el tono de comunicación..."
              rows={3}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500/50 resize-none"
            />
          </div>

          <button
            onClick={() => saveBrandingMutation.mutate(formData)}
            disabled={saveBrandingMutation.isPending}
            className="w-full px-4 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-medium transition-colors disabled:opacity-50"
          >
            {saveBrandingMutation.isPending ? 'Guardando...' : 'Guardar Branding'}
          </button>
        </div>
      ) : branding ? (
        <div className="space-y-6">
          {/* Color Palette */}
          <div className="bg-[#141414] rounded-xl p-6 border border-white/5">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Palette className="w-5 h-5 text-emerald-400" />
              Paleta de Colores
            </h3>
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="h-24 rounded-lg mb-2" style={{ backgroundColor: branding.primary_color }} />
                <p className="text-sm text-gray-400">Primario</p>
                <p className="text-xs font-mono text-gray-500">{branding.primary_color}</p>
              </div>
              <div className="flex-1">
                <div className="h-24 rounded-lg mb-2" style={{ backgroundColor: branding.secondary_color }} />
                <p className="text-sm text-gray-400">Secundario</p>
                <p className="text-xs font-mono text-gray-500">{branding.secondary_color}</p>
              </div>
              <div className="flex-1">
                <div className="h-24 rounded-lg mb-2" style={{ backgroundColor: branding.accent_color }} />
                <p className="text-sm text-gray-400">Acento</p>
                <p className="text-xs font-mono text-gray-500">{branding.accent_color}</p>
              </div>
            </div>
          </div>

          {/* Typography */}
          <div className="bg-[#141414] rounded-xl p-6 border border-white/5">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-400" />
              Tipografía
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {branding.primary_font && (
                <div>
                  <p className="text-sm text-gray-400 mb-1">Principal</p>
                  <p className="text-xl font-bold" style={{ fontFamily: branding.primary_font }}>
                    {branding.primary_font}
                  </p>
                </div>
              )}
              {branding.secondary_font && (
                <div>
                  <p className="text-sm text-gray-400 mb-1">Secundaria</p>
                  <p className="text-xl font-bold" style={{ fontFamily: branding.secondary_font }}>
                    {branding.secondary_font}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Style Description */}
          {(branding.visual_style || branding.tone_of_voice) && (
            <div className="bg-[#141414] rounded-xl p-6 border border-white/5 space-y-4">
              {branding.visual_style && (
                <div>
                  <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-orange-400" />
                    Estilo Visual
                  </h3>
                  <p className="text-gray-400 leading-relaxed">{branding.visual_style}</p>
                </div>
              )}
              {branding.tone_of_voice && (
                <div>
                  <h3 className="text-lg font-bold mb-2">Tono de Voz</h3>
                  <p className="text-gray-400 leading-relaxed">{branding.tone_of_voice}</p>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-[#141414] rounded-xl p-12 border border-white/5 text-center">
          <Palette className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 mb-4">No hay branding configurado</p>
          <button
            onClick={() => setIsEditing(true)}
            className="px-6 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-medium transition-colors"
          >
            Configurar Branding
          </button>
        </div>
      )}
    </div>
  );
}