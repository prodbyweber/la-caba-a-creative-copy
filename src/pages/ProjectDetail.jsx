import React, { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import DashboardNav from "@/components/dashboard/DashboardNav";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { 
  ArrowLeft, Plus, Music2, Palette, Edit, Trash2, 
  Check, X, Image as ImageIcon, FileText, Sparkles, Play, Pause
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function ProjectDetail() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("tracks");
  const [editingTrack, setEditingTrack] = useState(null);
  const [showAddTrack, setShowAddTrack] = useState(false);
  const [playingTrackId, setPlayingTrackId] = useState(null);
  const audioRefs = React.useRef({});

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

  const togglePlay = (trackId) => {
    const audio = audioRefs.current[trackId];
    if (!audio) return;

    if (playingTrackId === trackId) {
      audio.pause();
      setPlayingTrackId(null);
    } else {
      // Pause any other playing track
      if (playingTrackId && audioRefs.current[playingTrackId]) {
        audioRefs.current[playingTrackId].pause();
      }
      audio.play().catch(err => console.error('Error playing audio:', err));
      setPlayingTrackId(trackId);
    }
  };

  const tabs = [
    { id: "tracks", label: "Tracks", icon: Music2 },
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
      <DashboardNav onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="lg:pl-64 pt-16">
        <div className="p-6 max-w-[1600px] mx-auto">
          {/* Back Button */}
          <Link to={createPageUrl("Dashboard")}>
            <button className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
              <ArrowLeft className="w-5 h-5" />
              Volver al Dashboard
            </button>
          </Link>

          {/* Project Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-[#141414] to-black rounded-2xl border border-white/5 p-8 mb-6"
          >
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2">{project.name}</h1>
                <p className="text-gray-400 mb-4">{project.description}</p>
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
          </motion.div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
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
          {activeTab === "tracks" ? (
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

              {/* Tracks List */}
              <div className="space-y-3">
                {tracks.map((track, index) => (
                  <motion.div
                    key={track.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-[#141414] rounded-xl border border-white/5 overflow-hidden"
                  >
                    {editingTrack?.id === track.id ? (
                      <div className="p-6">
                        <TrackForm
                          track={track}
                          projectId={projectId}
                          onSubmit={(data) => updateTrackMutation.mutate({ id: track.id, data })}
                          onCancel={() => setEditingTrack(null)}
                        />
                      </div>
                    ) : (
                      <div className="p-4 flex items-center gap-4">
                        {/* Play Button or Track Number */}
                        {track.audio_file_url ? (
                          <>
                            <audio
                              ref={(el) => { if (el) audioRefs.current[track.id] = el; }}
                              src={track.audio_file_url}
                              onEnded={() => setPlayingTrackId(null)}
                              onPause={() => { if (playingTrackId === track.id) setPlayingTrackId(null); }}
                              onPlay={() => setPlayingTrackId(track.id)}
                            />
                            <button
                              onClick={() => togglePlay(track.id)}
                              className="w-10 h-10 rounded-full bg-emerald-500 hover:bg-emerald-600 flex items-center justify-center transition-colors flex-shrink-0"
                            >
                              {playingTrackId === track.id ? (
                                <Pause className="w-4 h-4 text-white" fill="white" />
                              ) : (
                                <Play className="w-4 h-4 text-white ml-0.5" fill="white" />
                              )}
                            </button>
                          </>
                        ) : (
                          <div className="w-8 text-center font-bold text-gray-500">
                            {track.track_number || index + 1}
                          </div>
                        )}

                        {/* Cover */}
                        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-emerald-500/20 to-purple-500/20 flex items-center justify-center overflow-hidden flex-shrink-0">
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
                              <span>Compositor: {track.composer}</span>
                            )}
                            {track.dolby_atmos && (
                              <span className="px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 text-xs font-medium">
                                Dolby Atmos
                              </span>
                            )}
                            {track.status && (
                              <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                track.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' :
                                track.status === 'mastering' ? 'bg-purple-500/10 text-purple-400' :
                                'bg-gray-500/10 text-gray-400'
                              }`}>
                                {track.status}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-6 text-sm text-gray-500">
                          {track.clips_count > 0 && (
                            <div className="text-center">
                              <div className="font-bold text-white">{track.clips_count}</div>
                              <div className="text-xs">Clips</div>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingTrack(track)}
                            className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
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
    notes: ""
  });

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