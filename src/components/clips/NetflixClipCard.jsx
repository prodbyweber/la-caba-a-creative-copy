import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Edit, Trash2, ChevronDown, X, Play } from "lucide-react";
import { base44 } from "@/api/base44Client";
import EditClipModal from "./EditClipModal.jsx";

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
];

// ── Detail Modal ──────────────────────────────────────────────────────────────
function ClipDetailModal({ clip, thumb, onClose, onEdit, onDelete }) {
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
        className="relative w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden"
        style={{ background: "#0f0f0f", maxHeight: "92vh", overflowY: "auto" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Hero vertical */}
        <div className="relative" style={{ aspectRatio: "9/16", maxHeight: 480, overflow: "hidden" }}>
          {showYt && ytId ? (
            <iframe
              className="absolute inset-0 w-full h-full border-0"
              src={`https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <>
              <motion.img
                src={thumb}
                alt={clip.title}
                className="absolute inset-0 w-full h-full object-cover"
                animate={{ scale: 1.04 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to top, #0f0f0f 0%, rgba(15,15,15,0.3) 60%, transparent 100%)" }} />

              {/* Play button centrado */}
              {ytId && (
                <button
                  onClick={() => setShowYt(true)}
                  className="absolute inset-0 flex items-center justify-center group"
                >
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
                    style={{ background: "rgba(255,0,0,0.85)", backdropFilter: "blur(4px)" }}
                  >
                    <Play className="w-7 h-7 text-white ml-1" fill="white" />
                  </div>
                </button>
              )}
            </>
          )}

          {/* Close */}
          <button onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.15)", zIndex: 10 }}>
            <X className="w-4 h-4 text-white" />
          </button>

          {/* Stop video */}
          {showYt && (
            <button onClick={() => setShowYt(false)}
              className="absolute top-4 left-4 w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.15)", zIndex: 10 }}>
              <X className="w-4 h-4 text-white/70" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="px-5 py-5 space-y-4">
          <h2 className="text-white font-black text-xl leading-tight">{clip.title}</h2>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button onClick={() => onEdit(clip)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-white/60 hover:text-white transition-all"
              style={{ background: "rgba(255,255,255,0.06)" }}>
              <Edit className="w-3.5 h-3.5" /> Editar
            </button>
            <button onClick={onDelete}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all">
              <Trash2 className="w-3.5 h-3.5" /> Eliminar
            </button>
          </div>
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
  const ytId = getYoutubeId(clip.file_url) || getYoutubeId(clip.youtube_url);

  const handleDelete = async () => {
    if (confirm("¿Eliminar este short?")) {
      await base44.entities.Clip.delete(clip.id);
      onUpdate();
      setShowDetail(false);
    }
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
          animate={{ scale: hovered ? 1.08 : 1 }}
          transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{
            width: 160,
            transformOrigin: isFirst ? "left center" : "center center",
            cursor: "pointer",
            position: "relative",
          }}
          onClick={() => setShowDetail(true)}
        >
          {/* ChevronDown button */}
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

          {/* Card vertical 9:16 */}
          <div className="rounded-xl overflow-hidden shadow-2xl" style={{ background: "#1a1a1c" }}>
            <div style={{ height: 284, overflow: "hidden", position: "relative" }}>
              <motion.div
                style={{ width: "100%", height: "100%" }}
                animate={hovered ? { scale: 1.06 } : { scale: 1 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              >
                <img src={thumb} alt={clip.title} className="w-full h-full object-cover" />
              </motion.div>

              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />

              {/* YouTube play button on hover */}
              {ytId && (
                <AnimatePresence>
                  {hovered && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2 }}
                      className="absolute inset-0 flex items-center justify-center"
                      style={{ pointerEvents: "none" }}
                    >
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center"
                        style={{ background: "rgba(255,0,0,0.85)", backdropFilter: "blur(4px)" }}
                      >
                        <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}

              {/* Bottom: title */}
              <div className="absolute bottom-0 left-0 right-0 px-2.5 pb-2.5">
                <p className="text-white font-bold text-[11px] leading-tight line-clamp-2">{clip.title}</p>
                {ytId && !hovered && (
                  <div className="flex items-center gap-1 mt-1">
                    <svg className="w-2.5 h-2.5 text-red-400" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                    </svg>
                    <span className="text-[8px] text-red-400 font-bold">YouTube</span>
                  </div>
                )}
              </div>
            </div>
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
          />
        )}
      </AnimatePresence>

      {editOpen && (
        <EditClipModal
          clip={clip}
          onClose={() => setEditOpen(false)}
          onUpdate={() => { onUpdate(); setEditOpen(false); }}
        />
      )}
    </>
  );
}