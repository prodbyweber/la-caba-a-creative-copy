import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Play, Pause, Download, Share2, Pencil, Trash2, Unlink, Bookmark,
  Music2, Lock, Sparkles,
} from "lucide-react";
import { useGlobalAudio } from "@/context/GlobalAudioContext";

// Modal cinematográfico de detalle del beat — estilo soundtrack (TrackDetailModal).
// Muestra portada, metadatos técnicos (BPM, tonalidad, escala), géneros/moods/tags,
// descripción y botones: reproducir, descargar, compartir y acciones de admin según origen.
export default function BeatDetailModal({ item, queue, isAdmin, isReadOnly, onClose, onEdit, onDelete, onUnassign, onUnsave }) {
  const globalAudio = useGlobalAudio();
  const [downloading, setDownloading] = useState(false);
  const [shareFeedback, setShareFeedback] = useState("");

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  if (!item?.beat) return null;

  const beat = item.beat;
  const hasAudio = !!beat.preview_mp3_url;
  const downloadUrl = beat.free_mp3_url || beat.preview_mp3_url || beat.audio_url;
  const active = globalAudio?.playingTrack?.beat_id === beat.beat_id;
  const playing = active && globalAudio?.isPlaying;

  const LABELS = {
    privado: { text: "Privado", Icon: Lock, color: "#ff5833" },
    recomendado: { text: "Recomendado", Icon: Sparkles, color: "#ff5833" },
    guardado: { text: "Guardado", Icon: Bookmark, color: "#7c4dff" },
  };
  const { text, Icon, color } = LABELS[item.type] || LABELS.privado;

  const togglePlay = (e) => {
    if (e) e.stopPropagation();
    if (!hasAudio) return;
    if (active && globalAudio.isPlaying) { globalAudio.pauseTrack(); return; }
    if (active) { globalAudio.resumeTrack(); return; }
    const playable = (queue && queue.length ? queue : [beat]).filter((b) => !!b.preview_mp3_url);
    const idx = playable.findIndex((b) => b.beat_id === beat.beat_id);
    globalAudio.playQueue(playable, Math.max(0, idx));
  };

  const handleDownload = async (e) => {
    if (e) e.stopPropagation();
    if (!downloadUrl || downloading) return;
    try {
      setDownloading(true);
      const res = await fetch(downloadUrl);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${beat.title || "beat"}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      window.open(downloadUrl, "_blank");
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async (e) => {
    if (e) e.stopPropagation();
    try {
      await navigator.clipboard.writeText(beat.slug ? `${window.location.origin}/beats/${beat.slug}` : window.location.href);
      setShareFeedback("Enlace copiado");
    } catch {
      setShareFeedback("No se pudo copiar");
    }
    setTimeout(() => setShareFeedback(""), 2000);
  };

  const meta = [
    beat.bpm ? `${beat.bpm} BPM` : null,
    beat.key,
    beat.scale,
  ].filter(Boolean);

  return ReactDOM.createPortal(
    <div className="fixed inset-0 flex items-end sm:items-center justify-center" style={{ zIndex: 99999 }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/90 backdrop-blur-md" />
      <motion.div
        initial={{ opacity: 0, y: 60, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 60, scale: 0.96 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full sm:max-w-xl rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden"
        style={{ background: "#0f0f0f", maxHeight: "92vh", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hero */}
        <div className="relative" style={{ height: 260, overflow: "hidden" }}>
          <motion.div className="absolute inset-0"
            animate={playing ? { scale: 1.08, x: [0, 4, -4, 2, 0] } : { scale: 1.04, x: 0 }}
            transition={playing ? { scale: { duration: 0.8 }, x: { duration: 10, repeat: Infinity, ease: "easeInOut" } } : { duration: 0.8 }}
          >
            {beat.cover_url
              ? <img src={beat.cover_url} alt={beat.title} className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #1e0a3c 0%, #0a1628 40%, #0a0a0b 100%)" }}><Music2 className="w-20 h-20 text-white/10" /></div>}
          </motion.div>
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, #0f0f0f 0%, rgba(15,15,15,0.5) 50%, transparent 100%)" }} />
          <div className="absolute bottom-0 left-0 right-0 px-5 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold" style={{ background: color + "25", color }}>
                <Icon className="w-2.5 h-2.5" /> {text}
              </span>
            </div>
            <h2 className="text-white font-black text-2xl leading-tight">{beat.title}</h2>
            {beat.producer && <p className="text-white/40 text-sm mt-0.5">{beat.producer}</p>}
          </div>
          <button onClick={onClose} className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.15)" }}>
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="px-5 pb-8 pt-4 space-y-5">
          {/* Action row */}
          <div className="flex items-center gap-2 flex-wrap">
            {hasAudio && (
              <button onClick={togglePlay} className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all" style={{ background: playing ? "rgba(255,255,255,0.12)" : "white", border: playing ? "1px solid rgba(255,255,255,0.2)" : "none" }}>
                {playing ? <Pause className="w-4 h-4 text-white" fill="white" /> : <Play className="w-4 h-4 text-black ml-0.5" fill="black" />}
              </button>
            )}
            {hasAudio && !isReadOnly && (
              <button onClick={handleDownload} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all" style={{ background: "rgba(255,255,255,0.06)" }}>
                {downloading ? <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Download className="w-3.5 h-3.5 text-white/60" />}
                <span className="text-white/60">{downloading ? "Descargando…" : "Descargar"}</span>
              </button>
            )}
            <button onClick={handleShare} className="relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all" style={{ background: "rgba(255,255,255,0.06)" }}>
              <Share2 className="w-3.5 h-3.5 text-white/60" /> <span className="text-white/60">Compartir</span>
              <AnimatePresence>
                {shareFeedback && (
                  <motion.span initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded-md text-[10px] font-bold text-white whitespace-nowrap"
                    style={{ background: "rgba(0,0,0,0.85)", border: "1px solid rgba(255,255,255,0.15)" }}>
                    {shareFeedback}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
            {isAdmin && !isReadOnly && item.type === "privado" && (
              <>
                <button onClick={(e) => { e.stopPropagation(); onEdit?.(); }} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all" style={{ background: "rgba(255,255,255,0.06)" }}>
                  <Pencil className="w-3.5 h-3.5 text-white/60" /> <span className="text-white/60">Editar</span>
                </button>
                <button onClick={(e) => { e.stopPropagation(); onDelete?.(); }} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all">
                  <Trash2 className="w-3.5 h-3.5" /> Eliminar
                </button>
              </>
            )}
            {isAdmin && !isReadOnly && item.type === "recomendado" && (
              <button onClick={(e) => { e.stopPropagation(); onUnassign?.(); }} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all" style={{ background: "rgba(255,255,255,0.06)" }}>
                <Unlink className="w-3.5 h-3.5 text-white/60" /> <span className="text-white/60">Quitar</span>
              </button>
            )}
            {!isAdmin && !isReadOnly && item.type === "guardado" && (
              <button onClick={(e) => { e.stopPropagation(); onUnsave?.(); }} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all" style={{ background: "rgba(255,255,255,0.06)" }}>
                <Bookmark className="w-3.5 h-3.5 text-white/60" fill="white" /> <span className="text-white/60">Quitar</span>
              </button>
            )}
          </div>

          {/* Technical metadata */}
          {meta.length > 0 && (
            <div className="grid grid-cols-3 gap-x-4 gap-y-3">
              {beat.bpm && <div><p className="text-[10px] font-semibold text-white/20 uppercase tracking-wider">BPM</p><p className="text-sm text-white/70 font-medium">{beat.bpm}</p></div>}
              {beat.key && <div><p className="text-[10px] font-semibold text-white/20 uppercase tracking-wider">Tonalidad</p><p className="text-sm text-white/70 font-medium">{beat.key}</p></div>}
              {beat.scale && <div><p className="text-[10px] font-semibold text-white/20 uppercase tracking-wider">Escala</p><p className="text-sm text-white/70 font-medium">{beat.scale}</p></div>}
            </div>
          )}

          {/* Géneros + Moods */}
          {((beat.genres && beat.genres.length > 0) || (beat.moods && beat.moods.length > 0)) && (
            <div className="space-y-2">
              {beat.genres?.length > 0 && (
                <div className="flex items-start gap-3">
                  <span className="text-[10px] text-white/25 uppercase tracking-wider w-20 flex-shrink-0 pt-1">Géneros</span>
                  <div className="flex flex-wrap gap-1.5">
                    {beat.genres.map((g, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ background: "rgba(255,88,51,0.12)", color: "#ff8866" }}>{g}</span>
                    ))}
                  </div>
                </div>
              )}
              {beat.moods?.length > 0 && (
                <div className="flex items-start gap-3">
                  <span className="text-[10px] text-white/25 uppercase tracking-wider w-20 flex-shrink-0 pt-1">Moods</span>
                  <div className="flex flex-wrap gap-1.5">
                    {beat.moods.map((m, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/[0.06] text-white/50">{m}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tags */}
          {beat.tags?.length > 0 && (
            <div className="flex items-start gap-3">
              <span className="text-[10px] text-white/25 uppercase tracking-wider w-20 flex-shrink-0 pt-1">Tags</span>
              <div className="flex flex-wrap gap-1.5">
                {beat.tags.map((t, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/[0.04] text-white/40">{t}</span>
                ))}
              </div>
            </div>
          )}

          {/* Descripción */}
          {beat.description && (
            <div>
              <p className="text-[10px] font-semibold text-white/20 uppercase tracking-widest mb-1.5">Descripción</p>
              <p className="text-sm text-white/45 leading-relaxed">{beat.description}</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>,
    document.body
  );
}