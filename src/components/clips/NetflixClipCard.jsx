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

function getYoutubeThumbnail(url) {
  const id = getYoutubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/maxresdefault.jpg` : null;
}

// ── Detail Modal ──────────────────────────────────────────────────────────────
function ClipDetailModal({ clip, onClose, onEdit, onDelete }) {
  const ytId = getYoutubeId(clip.file_url) || getYoutubeId(clip.youtube_url);
  const ytThumb = getYoutubeThumbnail(clip.file_url || clip.youtube_url);
  const [showYt, setShowYt] = useState(false);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ zIndex: 99999 }}
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/90 backdrop-blur-md"
      />

      {/* Modal — centrado */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.95 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="relative rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        style={{ background: "#0f0f0f", width: 320, maxHeight: "90vh" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Hero vertical */}
        <div className="relative flex-shrink-0" style={{ height: 420 }}>
          {showYt && ytId ? (
            <iframe
              className="absolute inset-0 w-full h-full border-0"
              src={`https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <>
              <img
                src={ytThumb || clip.thumbnail_url}
                alt={clip.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to top, #0f0f0f 0%, rgba(15,15,15,0.2) 60%, transparent 100%)" }} />

              {/* Play button */}
              {ytId && (
                <button
                  onClick={() => setShowYt(true)}
                  className="absolute inset-0 flex items-center justify-center group"
                >
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
                    style={{ background: "rgba(0,0,0,0.55)", border: "2px solid rgba(255,255,255,0.4)", backdropFilter: "blur(4px)" }}
                  >
                    <Play className="w-7 h-7 text-white ml-1" fill="white" />
                  </div>
                </button>
              )}
            </>
          )}

          {/* Botón cerrar */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.65)", border: "1px solid rgba(255,255,255,0.18)", zIndex: 10 }}
          >
            <X className="w-4 h-4 text-white" />
          </button>

          {/* Botón stop video */}
          {showYt && (
            <button
              onClick={() => setShowYt(false)}
              className="absolute top-3 left-3 w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: "rgba(0,0,0,0.65)", border: "1px solid rgba(255,255,255,0.18)", zIndex: 10 }}
            >
              <X className="w-3.5 h-3.5 text-white/70" />
            </button>
          )}
        </div>

        {/* Info + acciones */}
        <div className="px-4 py-4 space-y-3">
          <p className="text-white font-bold text-base leading-tight">{clip.title}</p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(clip)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-white/55 hover:text-white transition-all"
              style={{ background: "rgba(255,255,255,0.06)" }}
            >
              <Edit className="w-3.5 h-3.5" /> Editar
            </button>
            <button
              onClick={onDelete}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-red-400 hover:bg-red-500/20 transition-all"
              style={{ background: "rgba(255,60,60,0.08)" }}
            >
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

  const ytId = getYoutubeId(clip.file_url) || getYoutubeId(clip.youtube_url);
  // Siempre usar miniatura de YouTube si hay ytId
  const thumb = ytId
    ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
    : (clip.thumbnail_url || "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=700&fit=crop&q=80");

  const handleDelete = async () => {
    if (confirm("¿Eliminar este short?")) {
      await base44.entities.Clip.delete(clip.id);
      onUpdate();
      setShowDetail(false);
    }
  };

  return (
    <>
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
          {/* ChevronDown */}
          <div
            style={{ position: "absolute", top: 8, right: 8, zIndex: 10 }}
            onClick={e => { e.stopPropagation(); setShowDetail(true); }}
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center"
              style={{
                background: "rgba(10,10,10,0.8)",
                border: "1px solid rgba(255,255,255,0.3)",
                backdropFilter: "blur(8px)",
              }}
            >
              <ChevronDown className="w-3.5 h-3.5 text-white" />
            </div>
          </div>

          {/* Tarjeta vertical */}
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

              {/* Play en hover */}
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
                        style={{ background: "rgba(0,0,0,0.55)", border: "2px solid rgba(255,255,255,0.5)", backdropFilter: "blur(4px)" }}
                      >
                        <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}

              {/* Título en la tarjeta */}
              <div className="absolute bottom-0 left-0 right-0 px-2.5 pb-2.5">
                <p className="text-white font-bold text-[11px] leading-tight line-clamp-2">{clip.title}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {showDetail && (
          <ClipDetailModal
            clip={clip}
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