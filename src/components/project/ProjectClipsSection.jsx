import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { 
  Film, Plus, FolderPlus, Folder, Music2, Play, Pause, 
  Edit3, Trash2, Upload, Calendar, Eye, Hash, Instagram, Youtube, Music, X
} from "lucide-react";
import { format, parseISO } from "date-fns";

const platformIcons = {
  youtube: Youtube,
  instagram: Instagram,
  tiktok: Music
};

const platformColors = {
  youtube: 'from-red-500/20 to-red-600/20 border-red-500/30 text-red-400',
  instagram: 'from-pink-500/20 to-purple-600/20 border-pink-500/30 text-pink-400',
  tiktok: 'from-cyan-500/20 to-blue-600/20 border-cyan-500/30 text-cyan-400'
};

export default function ProjectClipsSection({ projectId, tracks }) {
  const [viewMode, setViewMode] = useState("all"); // "all", "byTrack", "folders"
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [showAddClip, setShowAddClip] = useState(false);
  const [showAddFolder, setShowAddFolder] = useState(false);
  const [selectedClip, setSelectedClip] = useState(null);

  const queryClient = useQueryClient();

  const { data: clips = [] } = useQuery({
    queryKey: ['clips', projectId],
    queryFn: () => base44.entities.Clip.filter({ project_id: projectId }),
    initialData: []
  });

  const { data: folders = [] } = useQuery({
    queryKey: ['clipFolders', projectId],
    queryFn: async () => {
      // Simulado - podrías crear una entidad ClipFolder
      return [];
    },
    initialData: []
  });

  const clipsByTrack = tracks.reduce((acc, track) => {
    acc[track.id] = clips.filter(c => c.track_id === track.id);
    return acc;
  }, {});

  const unassignedClips = clips.filter(c => !c.track_id);

  return (
    <div className="space-y-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-orange-500/10 rounded-xl border border-purple-500/20 p-4"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Film className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Clips del Proyecto</h3>
              <p className="text-sm text-gray-400">{clips.length} clips totales</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddFolder(true)}
              className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition-all flex items-center gap-2"
            >
              <FolderPlus className="w-4 h-4" />
              <span className="text-sm hidden sm:inline">Carpeta</span>
            </button>
            <button
              onClick={() => setShowAddClip(true)}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              Añadir Clip
            </button>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex gap-2 bg-black/20 rounded-lg p-1">
          <button
            onClick={() => setViewMode("all")}
            className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all ${
              viewMode === "all" 
                ? 'bg-white/10 text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setViewMode("byTrack")}
            className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all ${
              viewMode === "byTrack" 
                ? 'bg-white/10 text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Por Track
          </button>
          <button
            onClick={() => setViewMode("folders")}
            className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all ${
              viewMode === "folders" 
                ? 'bg-white/10 text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Carpetas
          </button>
        </div>
      </motion.div>

      {/* Content */}
      {viewMode === "all" && (
        <ClipsGrid clips={clips} onClipClick={setSelectedClip} />
      )}

      {viewMode === "byTrack" && (
        <ClipsByTrackView 
          tracks={tracks} 
          clipsByTrack={clipsByTrack}
          unassignedClips={unassignedClips}
          onClipClick={setSelectedClip}
        />
      )}

      {viewMode === "folders" && (
        <ClipsFolderView 
          folders={folders}
          clips={clips}
          onClipClick={setSelectedClip}
        />
      )}

      {/* Add Clip Modal */}
      <AnimatePresence>
        {showAddClip && (
          <AddClipModal
            projectId={projectId}
            tracks={tracks}
            onClose={() => setShowAddClip(false)}
          />
        )}
      </AnimatePresence>

      {/* Clip Preview Modal */}
      <AnimatePresence>
        {selectedClip && (
          <ClipPreviewModal
            clip={selectedClip}
            tracks={tracks}
            onClose={() => setSelectedClip(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ClipsGrid({ clips, onClipClick }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
      {clips.map((clip, i) => (
        <ClipCard key={clip.id} clip={clip} onClick={() => onClipClick(clip)} delay={i * 0.02} />
      ))}
    </div>
  );
}

function ClipsByTrackView({ tracks, clipsByTrack, unassignedClips, onClipClick }) {
  return (
    <div className="space-y-4">
      {tracks.map((track) => {
        const trackClips = clipsByTrack[track.id] || [];
        if (trackClips.length === 0) return null;

        return (
          <motion.div
            key={track.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#141414] rounded-xl border border-white/5 p-4"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500/20 to-purple-500/20 flex items-center justify-center">
                {track.cover_url ? (
                  <img src={track.cover_url} alt={track.title} className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <Music2 className="w-5 h-5 text-white/40" />
                )}
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-white">{track.title}</h4>
                <p className="text-xs text-gray-500">{trackClips.length} clips</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {trackClips.map((clip, i) => (
                <ClipCard key={clip.id} clip={clip} onClick={() => onClipClick(clip)} delay={i * 0.02} compact />
              ))}
            </div>
          </motion.div>
        );
      })}

      {unassignedClips.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#141414] rounded-xl border border-white/5 p-4"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-gray-500/20 flex items-center justify-center">
              <Film className="w-5 h-5 text-gray-400" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-gray-400">Sin Asignar</h4>
              <p className="text-xs text-gray-500">{unassignedClips.length} clips</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {unassignedClips.map((clip, i) => (
              <ClipCard key={clip.id} clip={clip} onClick={() => onClipClick(clip)} delay={i * 0.02} compact />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

function ClipsFolderView({ folders, clips, onClipClick }) {
  return (
    <div className="space-y-4">
      <div className="text-center py-12 text-gray-500">
        <Folder className="w-12 h-12 mx-auto mb-3 text-gray-600" />
        <p>Función de carpetas próximamente</p>
      </div>
    </div>
  );
}

function ClipCard({ clip, onClick, delay = 0, compact = false }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      whileHover={{ scale: 1.05 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
      className="relative group cursor-pointer"
    >
      <div className={`relative ${compact ? 'aspect-[9/16]' : 'aspect-[9/16]'} rounded-lg overflow-hidden bg-black`}>
        {clip.thumbnail_url ? (
          <img src={clip.thumbnail_url} alt={clip.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
            <Film className="w-8 h-8 text-gray-600" />
          </div>
        )}
        
        {/* Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent transition-opacity ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`} />

        {/* Play Button */}
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: isHovered ? 1 : 0 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 hover:bg-white flex items-center justify-center"
        >
          <Play className="w-6 h-6 text-black ml-0.5" fill="black" />
        </motion.button>

        {/* Status Badge */}
        {clip.status && (
          <div className={`absolute top-2 right-2 px-2 py-1 rounded text-[10px] font-bold ${
            clip.status === 'published' ? 'bg-emerald-500/90 text-white' :
            clip.status === 'scheduled' ? 'bg-purple-500/90 text-white' :
            'bg-gray-500/90 text-white'
          }`}>
            {clip.status}
          </div>
        )}

        {/* Platform Icons */}
        {clip.platforms && clip.platforms.length > 0 && (
          <div className="absolute bottom-2 left-2 flex gap-1">
            {clip.platforms.map((platform) => {
              const Icon = platformIcons[platform];
              return Icon ? (
                <div key={platform} className="w-5 h-5 rounded bg-black/60 flex items-center justify-center">
                  <Icon className="w-3 h-3 text-white" />
                </div>
              ) : null;
            })}
          </div>
        )}
      </div>
      
      {/* Title */}
      <div className="mt-2">
        <p className="text-xs font-medium text-white truncate">{clip.title}</p>
        {clip.scheduled_at && (
          <p className="text-[10px] text-gray-500">{format(parseISO(clip.scheduled_at), 'dd MMM')}</p>
        )}
      </div>
    </motion.div>
  );
}

function AddClipModal({ projectId, tracks, onClose }) {
  const [formData, setFormData] = useState({
    title: "",
    track_id: "",
    platforms: [],
    caption_master: "",
    hashtags: [],
    status: "draft"
  });

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Clip.create({ ...data, project_id: projectId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clips', projectId] });
      onClose();
    }
  });

  const togglePlatform = (platform) => {
    setFormData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform]
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-[#141414] rounded-xl border border-white/10 p-6 max-h-[90vh] overflow-y-auto"
      >
        <h3 className="text-xl font-bold mb-6">Añadir Clip al Proyecto</h3>

        <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(formData); }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Título *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500/50"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Track Asociado</label>
            <select
              value={formData.track_id}
              onChange={(e) => setFormData({ ...formData, track_id: e.target.value })}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500/50"
            >
              <option value="">Sin asignar</option>
              {tracks.map((track) => (
                <option key={track.id} value={track.id}>{track.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Plataformas</label>
            <div className="flex gap-2">
              {Object.keys(platformIcons).map((platform) => {
                const Icon = platformIcons[platform];
                const isSelected = formData.platforms.includes(platform);
                return (
                  <button
                    key={platform}
                    type="button"
                    onClick={() => togglePlatform(platform)}
                    className={`flex-1 px-4 py-3 rounded-lg border transition-all flex items-center justify-center gap-2 ${
                      isSelected 
                        ? `bg-gradient-to-br ${platformColors[platform]} border-current` 
                        : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium capitalize">{platform}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Caption</label>
            <textarea
              value={formData.caption_master}
              onChange={(e) => setFormData({ ...formData, caption_master: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500/50 resize-none"
              placeholder="Escribe el caption del clip..."
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium transition-all"
            >
              Crear Clip
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

function ClipPreviewModal({ clip, tracks, onClose }) {
  const track = tracks.find(t => t.id === clip.track_id);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl bg-[#141414] rounded-xl border border-white/10 overflow-hidden"
      >
        <div className="grid md:grid-cols-2 gap-6 p-6">
          {/* Left: Video Preview */}
          <div>
            <div className="relative aspect-[9/16] rounded-lg overflow-hidden bg-black">
              {clip.thumbnail_url ? (
                <img src={clip.thumbnail_url} alt={clip.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Film className="w-16 h-16 text-gray-600" />
                </div>
              )}
              <button className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white/90 hover:bg-white flex items-center justify-center">
                <Play className="w-8 h-8 text-black ml-1" fill="black" />
              </button>
            </div>
          </div>

          {/* Right: Metadata */}
          <div className="space-y-4">
            <div>
              <h3 className="text-2xl font-bold mb-2">{clip.title}</h3>
              <div className="flex flex-wrap gap-2">
                {clip.platforms?.map((platform) => {
                  const Icon = platformIcons[platform];
                  return (
                    <span key={platform} className={`px-3 py-1 rounded-lg border bg-gradient-to-br ${platformColors[platform]} text-sm font-medium flex items-center gap-2`}>
                      <Icon className="w-4 h-4" />
                      {platform}
                    </span>
                  );
                })}
              </div>
            </div>

            {track && (
              <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                <p className="text-xs text-gray-500 mb-1">Track Asociado</p>
                <div className="flex items-center gap-2">
                  <Music2 className="w-4 h-4 text-emerald-400" />
                  <p className="font-medium">{track.title}</p>
                </div>
              </div>
            )}

            {clip.scheduled_at && (
              <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/30">
                <p className="text-xs text-purple-400 mb-1">Programado</p>
                <p className="text-sm text-white font-medium">{format(parseISO(clip.scheduled_at), 'dd MMM yyyy, HH:mm')}</p>
              </div>
            )}

            {clip.caption_master && (
              <div>
                <p className="text-xs text-gray-500 mb-2">Caption</p>
                <p className="text-sm text-gray-300">{clip.caption_master}</p>
              </div>
            )}

            {clip.hashtags && clip.hashtags.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-2">Hashtags</p>
                <div className="flex flex-wrap gap-1">
                  {clip.hashtags.map((tag, i) => (
                    <span key={i} className="text-xs text-purple-400">#{tag}</span>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={onClose}
              className="w-full px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white font-medium transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}