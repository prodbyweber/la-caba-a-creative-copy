import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Film, Search, Upload, Play, Edit, Trash2, Copy, MoreVertical, Calendar, Youtube, Instagram, Music2, X, Plus } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import EditClipModal from "./EditClipModal.jsx";
import ClipPreviewModal from "./ClipPreviewModal.jsx";
import UploadClipModal from "./UploadClipModal.jsx";

const STOCK_THUMBS = [
  "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=700&fit=crop&q=80",
  "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=700&fit=crop&q=80",
  "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&h=700&fit=crop&q=80",
  "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=700&fit=crop&q=80",
  "https://images.unsplash.com/photo-1501612780327-45045538702b?w=400&h=700&fit=crop&q=80",
  "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=400&h=700&fit=crop&q=80",
];

const statusConfig = {
  draft:      { label: "Borrador",   dot: "bg-white/30" },
  scheduled:  { label: "Programado", dot: "bg-blue-400" },
  publishing: { label: "Publicando", dot: "bg-yellow-400 animate-pulse" },
  published:  { label: "Publicado",  dot: "bg-emerald-400" },
  error:      { label: "Error",      dot: "bg-red-400" },
};

const platformIcons = {
  youtube:   Youtube,
  instagram: Instagram,
  tiktok:    Music2,
};

function ClipTile({ clip, index, onUpdate }) {
  const [hover, setHover] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const thumb = clip.thumbnail_url || STOCK_THUMBS[index % STOCK_THUMBS.length];
  const status = statusConfig[clip.status] || statusConfig.draft;

  const handleDelete = async () => {
    if (confirm("¿Eliminar este clip?")) {
      await base44.entities.Clip.delete(clip.id);
      onUpdate();
    }
  };

  const handleDuplicate = async () => {
    const newClip = { ...clip, title: `${clip.title} (copia)`, status: "draft", scheduled_at: null };
    delete newClip.id; delete newClip.created_date; delete newClip.updated_date; delete newClip.created_by;
    await base44.entities.Clip.create(newClip);
    onUpdate();
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.04, duration: 0.4 }}
        className="group relative"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        {/* Thumbnail — 9:16 */}
        <div
          className="relative aspect-[9/16] rounded-xl overflow-hidden cursor-pointer bg-[#111]"
          onClick={() => setPreviewOpen(true)}
        >
          <img
            src={thumb}
            alt={clip.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />

          {/* Gradient overlay always */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Play button on hover */}
          <AnimatePresence>
            {hover && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="w-12 h-12 rounded-full border border-white/50 backdrop-blur-sm bg-white/10 flex items-center justify-center">
                  <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Status dot + duration top */}
          <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/60 backdrop-blur-sm">
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${status.dot}`} />
              <span className="text-[9px] font-medium text-white/80 tracking-wide">{status.label}</span>
            </div>
            {clip.duration && (
              <div className="px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-sm text-[9px] text-white/70">
                {Math.floor(clip.duration / 60)}:{String(Math.floor(clip.duration % 60)).padStart(2, '0')}
              </div>
            )}
          </div>

          {/* Bottom info */}
          <div className="absolute bottom-0 left-0 right-0 p-2.5">
            <p className="text-white font-semibold text-xs leading-tight line-clamp-2 mb-1.5">{clip.title}</p>

            <div className="flex items-center justify-between">
              {/* Platforms */}
              <div className="flex items-center gap-1">
                {clip.platforms?.slice(0, 3).map(p => {
                  const Icon = platformIcons[p];
                  return Icon ? (
                    <div key={p} className="w-4 h-4 rounded bg-white/10 backdrop-blur-sm flex items-center justify-center">
                      <Icon className="w-2.5 h-2.5 text-white/70" />
                    </div>
                  ) : null;
                })}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-0.5" onClick={e => e.stopPropagation()}>
                <button
                  onClick={() => setEditOpen(true)}
                  className="w-6 h-6 rounded flex items-center justify-center bg-white/10 backdrop-blur-sm hover:bg-white/25 transition-colors"
                >
                  <Edit className="w-3 h-3 text-white/80" />
                </button>
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="w-6 h-6 rounded flex items-center justify-center bg-white/10 backdrop-blur-sm hover:bg-white/25 transition-colors"
                  >
                    <MoreVertical className="w-3 h-3 text-white/80" />
                  </button>
                  {menuOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                      <div className="absolute right-0 bottom-full mb-1 w-36 bg-[#1a1a1c] border border-white/10 rounded-xl shadow-2xl z-20 py-1 overflow-hidden">
                        <button onClick={() => { handleDuplicate(); setMenuOpen(false); }}
                          className="w-full px-3 py-2 text-left text-xs text-white/70 hover:bg-white/5 flex items-center gap-2">
                          <Copy className="w-3.5 h-3.5" /> Duplicar
                        </button>
                        <button onClick={() => { handleDelete(); setMenuOpen(false); }}
                          className="w-full px-3 py-2 text-left text-xs text-red-400 hover:bg-red-500/10 flex items-center gap-2">
                          <Trash2 className="w-3.5 h-3.5" /> Eliminar
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {clip.scheduled_at && (
              <p className="text-[9px] text-white/40 mt-1 flex items-center gap-1">
                <Calendar className="w-2.5 h-2.5" />
                {format(new Date(clip.scheduled_at), "d MMM, HH:mm", { locale: es })}
              </p>
            )}
          </div>
        </div>
      </motion.div>

      {editOpen && <EditClipModal clip={clip} onClose={() => setEditOpen(false)} onUpdate={onUpdate} />}
      {previewOpen && <ClipPreviewModal clip={clip} onClose={() => setPreviewOpen(false)} />}
    </>
  );
}

export default function ClipsLibrary({ filters }) {
  const [search, setSearch] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);

  const { data: clips = [], isLoading, refetch } = useQuery({
    queryKey: ['clips', filters],
    queryFn: async () => {
      let query = {};
      if (filters.status !== "all") query.status = filters.status;
      if (filters.artist !== "all") query.artist_id = filters.artist;
      const allClips = await base44.entities.Clip.filter(query, '-created_date');
      return allClips.filter(clip => {
        if (filters.platform?.length > 0 && !filters.platform.some(p => clip.platforms?.includes(p))) return false;
        if (filters.search) {
          const s = filters.search.toLowerCase();
          if (!clip.title?.toLowerCase().includes(s) && !clip.tags?.some(t => t.toLowerCase().includes(s))) return false;
        }
        return true;
      });
    },
  });

  const filtered = search
    ? clips.filter(c => c.title?.toLowerCase().includes(search.toLowerCase()))
    : clips;

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar clips..."
            className="w-full bg-white/[0.04] border border-white/[0.07] rounded-lg py-2 pl-9 pr-4 text-xs text-white placeholder:text-white/25 focus:outline-none focus:border-white/20 transition-colors"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70">
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        <div className="ml-auto text-xs text-white/20">
          {filtered.length} clip{filtered.length !== 1 ? "s" : ""}
        </div>

        <button
          onClick={() => setUploadOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white text-xs font-medium transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          Nuevo clip
        </button>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="aspect-[9/16] rounded-xl bg-white/[0.04] animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-24 text-center"
        >
          <div className="w-16 h-16 rounded-2xl border border-white/10 flex items-center justify-center mb-4">
            <Film className="w-7 h-7 text-white/20" />
          </div>
          <p className="text-white/30 text-sm mb-1">Sin clips todavía</p>
          <p className="text-white/15 text-xs mb-6">Sube tu primer clip para empezar</p>
          <button
            onClick={() => setUploadOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-white/60 hover:text-white text-xs font-medium transition-all"
          >
            <Upload className="w-3.5 h-3.5" />
            Subir clip
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
          {filtered.map((clip, i) => (
            <ClipTile key={clip.id} clip={clip} index={i} onUpdate={refetch} />
          ))}
        </div>
      )}

      {uploadOpen && (
        <UploadClipModal
          onClose={() => { setUploadOpen(false); refetch(); }}
          artistId={filters.artist !== "all" ? filters.artist : undefined}
        />
      )}
    </div>
  );
}