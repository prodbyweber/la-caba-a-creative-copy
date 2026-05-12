import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Edit, Trash2, Copy, Calendar, Youtube, Instagram, Music2, ChevronDown, X, Film } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import EditClipModal from "./EditClipModal.jsx";

function getYoutubeId(url) {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

const statusConfig = {
  draft:      { label: "Borrador",   color: "#6b7280" },
  scheduled:  { label: "Programado", color: "#60a5fa" },
  publishing: { label: "Publicando", color: "#fbbf24" },
  published:  { label: "Publicado",  color: "#34d399" },
  error:      { label: "Error",      color: "#f87171" },
};

const platformIcons = { youtube: Youtube, instagram: Instagram, tiktok: Music2 };

const STOCK_THUMBS = [
  "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=700&fit=crop&q=80",
  "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=700&fit=crop&q=80",
  "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&h=700&fit=crop&q=80",
  "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=700&fit=crop&q=80",
  "https://images.unsplash.com/photo-1501612780327-45045538702b?w=400&h=700&fit=crop&q=80",
];

// ── Detail Modal ──────────────────────────────────────────────────────────────
function ClipDetailModal({ clip, thumb, onClose, onEdit, onDelete, onDuplicate }) {
  const status = statusConfig[clip.status] || statusConfig.draft;
  const ytId = getYoutubeId(clip.file_url) || getYoutubeId(clip.youtube_url);
  const [showYt, setShowYt] = useState(false);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  return ReactDOM.createPortal(
    <div className="fixed inset-0 flex items-end sm:items-center justify-center" style={{ zIndex: 99999 }}>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/90 backdrop-blur-md"
      />
      <motion.div
        initial={{ opacity: 0, y: 60, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 60, scale: 0.96 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full sm:max-w-xl rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden"
        style={{ background: "#0f0f0f", maxHeight: "92vh", overflowY: "auto" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Hero */}
        <div className="relative" style={{ height: 260, overflow: "hidden" }}>
          <motion.div
            className="absolute inset-0"
            animate={{ scale: 1.04 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <img src={thumb} alt={clip.title} className="w-full h-full object-cover" />
          </motion.div>
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, #0f0f0f 0%, rgba(15,15,15,0.5) 50%, transparent 100%)" }} />

          <div className="absolute bottom-0 left-0 right-0 px-5 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold"
                style={{ background: status.color + "25", color: status.color }}>
                {status.label}
              </span>
              {clip.platforms?.map(p => {
                const Icon = platformIcons[p];
                return Icon ? (
                  <div key={p} className="w-5 h-5 rounded bg-white/10 flex items-center justify-center">
                    <Icon className="w-3 h-3 text-white/50" />
                  </div>
                ) : null;
              })}
            </div>
            <h2 className="text-white font-black text-2xl leading-tight">{clip.title}</h2>
          </div>

          <button onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.15)" }}>
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="px-5 pb-8 pt-4 space-y-5">
          {/* Action row */}
          <div className="flex items-center gap-2 flex-wrap">
            {ytId && (
              <button
                onClick={() => setShowYt(v => !v)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all flex-shrink-0"
                style={{
                  background: showYt ? "rgba(255,80,80,0.2)" : "rgba(255,80,80,0.1)",
                  border: "1px solid rgba(255,80,80,0.3)",
                  color: "#f87171",
                }}
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                </svg>
                {showYt ? "Cerrar video" : "Reproducir"}
              </button>
            )}
            <button onClick={() => onEdit(clip)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-white/60 hover:text-white transition-all"
              style={{ background: "rgba(255,255,255,0.06)" }}>
              <Edit className="w-3.5 h-3.5" /> Editar
            </button>
            <button onClick={onDuplicate}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-white/40 hover:text-white transition-all"
              style={{ background: "rgba(255,255,255,0.04)" }}>
              <Copy className="w-3.5 h-3.5" /> Duplicar
            </button>
            <button onClick={onDelete}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all">
              <Trash2 className="w-3.5 h-3.5" /> Eliminar
            </button>
          </div>

          {/* YouTube embed */}
          <AnimatePresence>
            {showYt && ytId && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden rounded-xl"
              >
                <div className="relative w-full rounded-xl overflow-hidden" style={{ paddingBottom: "56.25%" }}>
                  <iframe
                    className="absolute inset-0 w-full h-full"
                    src={`https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Meta */}
          {clip.caption_master && (
            <div>
              <p className="text-[10px] font-semibold text-white/20 uppercase tracking-widest mb-1.5">Caption</p>
              <p className="text-sm text-white/40 leading-relaxed">{clip.caption_master}</p>
            </div>
          )}

          {clip.scheduled_at && (
            <div className="flex items-center gap-2 text-xs text-white/30">
              <Calendar className="w-3.5 h-3.5" />
              {format(new Date(clip.scheduled_at), "d MMM yyyy, HH:mm", { locale: es })}
            </div>
          )}

          {clip.hashtags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {clip.hashtags.slice(0, 8).map(h => (
                <span key={h} className="px-2 py-0.5 rounded-full text-[10px] text-white/30"
                  style={{ background: "rgba(255,255,255,0.05)" }}>#{h}</span>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>,
    document.body
  );
}

// ── Clip Card ─────────────────────────────────────────────────────────────────
export default function NetflixClipCard({ clip, index, onUpdate, isFirst }) {
  const [hovered, setHovered] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const thumb = clip.thumbnail_url || STOCK_THUMBS[index % STOCK_THUMBS.length];
  const status = statusConfig[clip.status] || statusConfig.draft;
  const ytId = getYoutubeId(clip.file_url) || getYoutubeId(clip.youtube_url);

  const handleDelete = async () => {
    if (confirm("¿Eliminar este clip?")) {
      await base44.entities.Clip.delete(clip.id);
      onUpdate();
      setShowDetail(false);
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
      {/* Outer wrapper */}
      <div
        style={{ width: 160, flexShrink: 0, position: "relative", zIndex: hovered ? 50 : 1 }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <motion.div
          animate={{ scale: hovered ? 1.12 : 1 }}
          transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{
            width: 160,
            transformOrigin: isFirst ? "left center" : "center center",
            cursor: "pointer",
            position: "relative",
          }}
          onClick={() => setShowDetail(true)}
        >
          {/* ChevronDown */}
          <div
            style={{ position: "absolute", top: 8, right: 8, zIndex: 10 }}
            onClick={(e) => { e.stopPropagation(); setShowDetail(true); }}
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
              style={{
                background: "rgba(10,10,10,0.8)",
                border: "1px solid rgba(255,255,255,0.3)",
                backdropFilter: "blur(8px)",
              }}
            >
              <ChevronDown className="w-3.5 h-3.5 text-white" />
            </div>
          </div>

          <div className="rounded-xl overflow-hidden shadow-2xl" style={{ background: "#1a1a1c" }}>
            {/* Vertical cover — 9:16 */}
            <div style={{ height: 284, overflow: "hidden", position: "relative" }}>
              <motion.div
                style={{ width: "100%", height: "100%" }}
                animate={hovered ? { scale: 1.08 } : { scale: 1 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              >
                <img src={thumb} alt={clip.title} className="w-full h-full object-cover" />
              </motion.div>

              {/* YouTube preview on hover */}
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

              {/* Bottom: title + play */}
              <div className="absolute bottom-0 left-0 right-0 px-2.5 pb-2.5">
                <p className="text-white font-bold text-[11px] leading-tight line-clamp-2 mb-1">{clip.title}</p>
                <div className="flex items-center gap-1">
                  {clip.platforms?.slice(0, 3).map(p => {
                    const Icon = platformIcons[p];
                    return Icon ? <Icon key={p} className="w-2.5 h-2.5 text-white/30" /> : null;
                  })}
                  {ytId && (
                    <div className="ml-auto flex items-center gap-1 px-1.5 py-0.5 rounded"
                      style={{ background: "rgba(255,0,0,0.18)", border: "1px solid rgba(255,80,80,0.25)" }}>
                      <svg className="w-2.5 h-2.5 text-red-400" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                      </svg>
                      <span className="text-[8px] text-red-400 font-bold">YT</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Hover metadata */}
            <AnimatePresence>
              {hovered && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.22 }}
                  className="overflow-hidden"
                  style={{ background: "#1a1a1c" }}
                >
                  <div className="px-2.5 pt-2 pb-3 space-y-1">
                    {clip.duration && (
                      <span className="text-[9px] text-white/35">
                        {Math.floor(clip.duration / 60)}:{String(Math.floor(clip.duration % 60)).padStart(2, '0')}
                      </span>
                    )}
                    {clip.caption_master && (
                      <p className="text-[8px] text-white/25 line-clamp-2">{clip.caption_master}</p>
                    )}
                    {clip.scheduled_at && (
                      <p className="text-[8px] text-white/20 flex items-center gap-0.5">
                        <Calendar className="w-2 h-2" />
                        {format(new Date(clip.scheduled_at), "d MMM", { locale: es })}
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Detail modal */}
      <AnimatePresence>
        {showDetail && (
          <ClipDetailModal
            clip={clip}
            thumb={thumb}
            onClose={() => setShowDetail(false)}
            onEdit={() => { setShowDetail(false); setEditOpen(true); }}
            onDelete={handleDelete}
            onDuplicate={handleDuplicate}
          />
        )}
      </AnimatePresence>

      {editOpen && <EditClipModal clip={clip} onClose={() => setEditOpen(false)} onUpdate={onUpdate} />}
    </>
  );
}