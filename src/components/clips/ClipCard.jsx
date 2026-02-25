import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Play, 
  MoreVertical, 
  Edit, 
  Copy, 
  Trash2, 
  Clock,
  Calendar,
  Youtube,
  Instagram,
  Music2
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import EditClipModal from "./EditClipModal.jsx";
import ClipPreviewModal from "./ClipPreviewModal.jsx";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";

const statusConfig = {
  draft: { label: "Borrador", color: "bg-gray-500/10 text-gray-400 border-gray-500/20" },
  scheduled: { label: "Programado", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  publishing: { label: "Publicando", color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
  published: { label: "Publicado", color: "bg-green-500/10 text-green-400 border-green-500/20" },
  error: { label: "Error", color: "bg-red-500/10 text-red-400 border-red-500/20" }
};

const platformIcons = {
  youtube: Youtube,
  instagram: Instagram,
  tiktok: Music2
};

export default function ClipCard({ clip, viewMode, delay, onUpdate }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);

  const { data: artist } = useQuery({
    queryKey: ['artist', clip.artist_id],
    queryFn: () => base44.entities.Artist.filter({ id: clip.artist_id }),
    enabled: !!clip.artist_id,
    select: (data) => data[0]
  });

  const handleDelete = async () => {
    if (confirm("¿Estás seguro de que quieres eliminar este clip?")) {
      await base44.entities.Clip.delete(clip.id);
      onUpdate();
    }
  };

  const handleDuplicate = async () => {
    const newClip = {
      ...clip,
      title: `${clip.title} (copia)`,
      status: "draft",
      scheduled_at: null
    };
    delete newClip.id;
    delete newClip.created_date;
    delete newClip.updated_date;
    delete newClip.created_by;
    
    await base44.entities.Clip.create(newClip);
    onUpdate();
  };

  if (viewMode === "list") {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay }}
        className="bg-[#111113] rounded-2xl border border-white/5 p-4 hover:border-white/10 transition-all"
      >
        <div className="flex items-center gap-4">
          {/* Thumbnail */}
          <div className="relative w-24 h-32 flex-shrink-0 bg-[#0a0a0b] rounded-xl overflow-hidden group">
            {clip.thumbnail_url ? (
              <img src={clip.thumbnail_url} alt={clip.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Play className="w-8 h-8 text-gray-600" />
              </div>
            )}
            <button
              onClick={() => setPreviewModalOpen(true)}
              className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            >
              <Play className="w-8 h-8 text-white" fill="white" />
            </button>
            {clip.duration && (
              <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/80 rounded text-xs">
                {Math.floor(clip.duration / 60)}:{String(Math.floor(clip.duration % 60)).padStart(2, '0')}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg mb-1 truncate">{clip.title}</h3>
            {artist && (
              <p className="text-sm text-gray-500 mb-2">{artist.name}</p>
            )}
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${statusConfig[clip.status]?.color}`}>
                {statusConfig[clip.status]?.label}
              </span>
              {clip.platforms?.map(platform => {
                const Icon = platformIcons[platform];
                return (
                  <div key={platform} className="w-6 h-6 rounded bg-white/5 flex items-center justify-center">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                );
              })}
              {clip.scheduled_at && (
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {format(new Date(clip.scheduled_at), "d MMM, HH:mm", { locale: es })}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
            {menuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-48 bg-[#1a1a1d] border border-white/10 rounded-xl shadow-xl z-20 py-2">
                  <button
                    onClick={() => { setEditModalOpen(true); setMenuOpen(false); }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-white/5 flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Editar
                  </button>
                  <button
                    onClick={() => { handleDuplicate(); setMenuOpen(false); }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-white/5 flex items-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Duplicar
                  </button>
                  <button
                    onClick={() => { handleDelete(); setMenuOpen(false); }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-white/5 flex items-center gap-2 text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  // Grid View - Compact
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="bg-[#111113] rounded-lg border border-white/5 overflow-hidden hover:border-white/10 transition-all group flex flex-col h-full"
      >
        {/* Thumbnail with Play Button - Reduced */}
        <div 
          className="relative aspect-[9/16] bg-[#0a0a0b] cursor-pointer flex-1"
          onClick={() => setPreviewModalOpen(true)}
        >
          {clip.thumbnail_url ? (
            <img src={clip.thumbnail_url} alt={clip.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Play className="w-4 h-4 text-gray-600" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Play className="w-3 h-3 text-white" fill="white" />
            </div>
          </div>
          
          {/* Status & ID Badges */}
          <div className="absolute inset-0 pointer-events-none p-1.5 flex flex-col justify-between">
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border w-fit ${statusConfig[clip.status]?.color}`}>
              {statusConfig[clip.status]?.label}
            </span>
            <span className="px-1.5 py-0.5 rounded-md bg-gradient-to-r from-purple-500 to-pink-500 text-[8px] font-mono font-bold text-white shadow-lg shadow-purple-500/40 w-fit self-end">
              {clip.clip_id || clip.id.slice(0, 5)}
            </span>
          </div>
        </div>

        {/* Content - Ultra Compact */}
        <div className="px-2 py-1.5 space-y-1">
          <h3 className="font-semibold text-[11px] line-clamp-1 leading-tight">{clip.title}</h3>
          {artist && (
            <p className="text-[9px] text-gray-500 line-clamp-1">{artist.stageName || artist.name}</p>
          )}

          {/* Actions Row */}
          <div className="flex items-center justify-between gap-1 pt-1">
            {clip.platforms && clip.platforms.length > 0 && (
              <div className="flex items-center gap-0.5">
                {clip.platforms.slice(0, 2).map(platform => {
                  const Icon = platformIcons[platform];
                  return (
                    <div key={platform} className="w-3 h-3 rounded bg-white/5 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-1.5 h-1.5" />
                    </div>
                  );
                })}
              </div>
            )}
            <div className="flex gap-0.5 ml-auto" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setEditModalOpen(true)}
                className="p-1 hover:bg-white/10 rounded transition-colors"
                title="Editar"
              >
                <Edit className="w-2.5 h-2.5 text-gray-400" />
              </button>
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="p-1 hover:bg-white/10 rounded transition-colors"
                >
                  <MoreVertical className="w-2.5 h-2.5 text-gray-400" />
                </button>
                {menuOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-1 w-32 bg-[#1a1a1d] border border-white/10 rounded-lg shadow-xl z-20 py-1">
                      <button
                        onClick={() => { handleDuplicate(); setMenuOpen(false); }}
                        className="w-full px-2 py-1 text-left text-[10px] hover:bg-white/5 flex items-center gap-1.5"
                      >
                        <Copy className="w-2.5 h-2.5" />
                        Duplicar
                      </button>
                      <button
                        onClick={() => { handleDelete(); setMenuOpen(false); }}
                        className="w-full px-2 py-1 text-left text-[10px] hover:bg-white/5 flex items-center gap-1.5 text-red-400"
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                        Eliminar
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Edit Modal */}
      {editModalOpen && (
        <EditClipModal 
          clip={clip}
          onClose={() => setEditModalOpen(false)}
          onUpdate={onUpdate}
        />
      )}

      {/* Preview Modal */}
      {previewModalOpen && (
        <ClipPreviewModal 
          clip={clip}
          onClose={() => setPreviewModalOpen(false)}
        />
      )}
    </>
  );
}