import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Edit, Trash2, Copy, Calendar, Youtube, Instagram, Music2, ChevronDown, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import EditClipModal from "./EditClipModal.jsx";
import ClipPreviewModal from "./ClipPreviewModal.jsx";

function getYoutubeId(url) {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

const STOCK_THUMBS = [
  "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=700&fit=crop&q=80",
  "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=700&fit=crop&q=80",
  "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&h=700&fit=crop&q=80",
  "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=700&fit=crop&q=80",
  "https://images.unsplash.com/photo-1501612780327-45045538702b?w=400&h=700&fit=crop&q=80",
  "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=400&h=700&fit=crop&q=80",
];

const statusConfig = {
  draft:      { label: "Borrador",   color: "#6b7280" },
  scheduled:  { label: "Programado", color: "#60a5fa" },
  publishing: { label: "Publicando", color: "#fbbf24" },
  published:  { label: "Publicado",  color: "#34d399" },
  error:      { label: "Error",      color: "#f87171" },
};

const platformIcons = { youtube: Youtube, instagram: Instagram, tiktok: Music2 };

// YouTube player modal
function YouTubePlayerModal({ ytId, title, onClose }) {
  return (
    <motion.div
      key="yt-modal"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4"
      style={{ zIndex: 1000 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.18 }}
        className="relative w-full max-w-4xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3 px-1">
          <p className="text-white font-bold text-sm truncate pr-4">{title}</p>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors flex-shrink-0">
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
        <div className="relative w-full rounded-xl overflow-hidden shadow-2xl bg-black" style={{ paddingBottom: "56.25%" }}>
          <iframe
            key={ytId}
            src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="absolute inset-0 w-full h-full border-0"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

function ClipDetailModal({ clip, thumb, onClose, onEdit, onDelete, onDuplicate }) {
  const status = statusConfig[clip.status] || statusConfig.draft;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/85 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 20 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="relative w-full max-w-lg rounded-xl overflow-hidden shadow-2xl"
        style={{ background: "#181818" }}
      >
        <div className="relative" style={{ height: 220, overflow: "hidden" }}>
          <motion.div style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }}
            animate={{ scale: 1.04 }} transition={{ duration: 0.7 }}>
            <img src={thumb} alt={clip.title} className="w-full h-full object-cover" />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-[#181818]/40 to-transparent" />
          <button onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80 transition-colors">
            <X className="w-4 h-4 text-white" />
          </button>
          <div className="absolute bottom-4 left-5 right-5">
            <h2 className="text-white font-black text-2xl leading-tight">{clip.title}</h2>
          </div>
        </div>

        <div className="px-5 pb-5 pt-3 space-y-4">
          <div className="flex items-center gap-2">
            <button onClick={() => onEdit(clip)}
              className="flex items-center gap-2 px-4 py-2 rounded-md bg-white/10 text-white/70 text-sm font-bold hover:bg-white/20 transition-colors">
              <Edit className="w-3.5 h-3.5" /> Editar
            </button>
            <span className="px-2 py-1 rounded text-[10px] font-bold"
              style={{ background: status.color + "22", color: status.color }}>{status.label}</span>
            <div className="flex items-center gap-1 ml-auto">
              {clip.platforms?.map(p => {
                const Icon = platformIcons[p];
                return Icon ? (
                  <div key={p} className="w-6 h-6 rounded bg-white/10 flex items-center justify-center">
                    <Icon className="w-3.5 h-3.5 text-white/60" />
                  </div>
                ) : null;
              })}
            </div>
          </div>

          {clip.caption_master && (
            <p className="text-xs text-white/40 leading-relaxed line-clamp-3">{clip.caption_master}</p>
          )}

          {clip.scheduled_at && (
            <div className="flex items-center gap-2 text-xs text-white/40">
              <Calendar className="w-3.5 h-3.5" />
              {format(new Date(clip.scheduled_at), "d MMM yyyy, HH:mm", { locale: es })}
            </div>
          )}

          {clip.hashtags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {clip.hashtags.slice(0, 6).map(h => (
                <span key={h} className="px-2 py-0.5 rounded-full bg-white/[0.06] text-white/30 text-[10px]">#{h}</span>
              ))}
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button onClick={onDuplicate}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 text-xs transition-colors">
              <Copy className="w-3 h-3" /> Duplicar
            </button>
            <button onClick={onDelete}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs transition-colors">
              <Trash2 className="w-3 h-3" /> Eliminar
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function NetflixClipCard({ clip, index, onUpdate, isFirst }) {
  const [hovered, setHovered] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [showYTPlayer, setShowYTPlayer] = useState(false);
  const previewRef = useRef(null);

  const thumb = clip.thumbnail_url || STOCK_THUMBS[index % STOCK_THUMBS.length];
  const status = statusConfig[clip.status] || statusConfig.draft;
  
  // Detectar YouTube URL
  const youtubeUrl = clip.file_url && getYoutubeId(clip.file_url) ? clip.file_url : null;
  const ytId = youtubeUrl ? getYoutubeId(youtubeUrl) : null;

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
    setShowDetail(false);
  };

  return (
    <>
      <div
        className="relative flex-shrink-0"
        style={{ width: 240, zIndex: hovered ? 50 : 1 }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <motion.div
          animate={{ scale: hovered ? 1.18 : 1 }}
          transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="rounded-xl cursor-pointer shadow-2xl"
          style={{ width: 240, transformOrigin: isFirst ? "left center" : "center center", overflow: "visible" }}
          onClick={() => setShowDetail(true)}
        >
          <div className="rounded-xl overflow-hidden" style={{ background: "#1a1a1c" }}>
            {/* Cover */}
            <div style={{ height: 150, overflow: "hidden", position: "relative" }}>
              <motion.div
                style={{ width: "100%", height: "100%" }}
                animate={hovered ? { scale: 1.08 } : { scale: 1 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              >
                <img src={thumb} alt={clip.title} className="w-full h-full object-cover" />
              </motion.div>

              {/* Preview overlay — YouTube embed on hover */}
              <AnimatePresence>
                {hovered && ytId && (
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="absolute inset-0"
                  >
                    <iframe
                      src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&controls=0&rel=0&modestbranding=1&loop=1&playlist=${ytId}`}
                      className="w-full h-full border-0"
                      allow="autoplay"
                      style={{ pointerEvents: "none" }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />

              {/* Status badge */}
              <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[9px] font-bold"
                style={{ background: status.color + "30", color: status.color }}>
                {status.label}
              </div>

              {/* Info chevron on hover */}
              <AnimatePresence>
                {hovered && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.15 }}
                    onClick={(e) => { e.stopPropagation(); setShowDetail(true); }}
                    className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(20,20,20,0.80)", border: "1px solid rgba(255,255,255,0.18)", backdropFilter: "blur(6px)" }}
                  >
                    <ChevronDown className="w-2.5 h-2.5 text-white/70" />
                  </motion.button>
                )}
              </AnimatePresence>

              {/* Bottom: title + play */}
              <div className="absolute bottom-0 left-0 right-0 px-2.5 pb-2 flex items-end justify-between">
                <div className="flex-1 min-w-0 pr-2">
                  <p className="text-white font-bold text-[11px] leading-tight line-clamp-1">{clip.title}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    {clip.platforms?.slice(0, 3).map(p => {
                      const Icon = platformIcons[p];
                      return Icon ? <Icon key={p} className="w-2.5 h-2.5 text-white/30" /> : null;
                    })}
                  </div>
                </div>
                {ytId && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowYTPlayer(true); }}
                    className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all hover:scale-110"
                    style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.18)", backdropFilter: "blur(4px)" }}
                    title="Reproducir video"
                  >
                    <Play className="w-2.5 h-2.5 text-white ml-0.5" fill="white" />
                  </button>
                )}
              </div>
            </div>

            {/* Metadata panel on hover */}
            <AnimatePresence>
              {hovered && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className="overflow-hidden"
                  style={{ background: "#1a1a1c" }}
                >
                  <div className="px-2.5 pt-2 pb-3 space-y-1.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {clip.duration && (
                        <span className="text-[9px] text-white/35">
                          {Math.floor(clip.duration / 60)}:{String(Math.floor(clip.duration % 60)).padStart(2, '0')}
                        </span>
                      )}
                      {clip.scheduled_at && (
                        <span className="text-[9px] text-white/25 flex items-center gap-0.5">
                          <Calendar className="w-2 h-2" />
                          {format(new Date(clip.scheduled_at), "d MMM", { locale: es })}
                        </span>
                      )}
                    </div>
                    {clip.caption_master && (
                      <p className="text-[8px] text-white/25 line-clamp-2 leading-relaxed">{clip.caption_master}</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {showDetail && (
          <ClipDetailModal
            clip={clip}
            thumb={thumb}
            onClose={() => setShowDetail(false)}
            onEdit={(c) => { setShowDetail(false); setEditOpen(true); }}
            onDelete={() => { setShowDetail(false); handleDelete(); }}
            onDuplicate={handleDuplicate}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showYTPlayer && ytId && (
          <YouTubePlayerModal
            ytId={ytId}
            title={clip.title}
            onClose={() => setShowYTPlayer(false)}
          />
        )}
      </AnimatePresence>

      {editOpen && <EditClipModal clip={clip} onClose={() => setEditOpen(false)} onUpdate={onUpdate} />}
    </>
  );
}