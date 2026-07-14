import React, { useEffect } from "react";
import { motion } from "framer-motion";
import {
  Play, Pause, Download, ShoppingBag, Bookmark, Heart, Share2, Music2, X,
} from "lucide-react";
import { formatDuration } from "@/lib/musicConstants";
import { BEATS_BRAND, BEATS_GRADIENTS } from "@/lib/beatsTheme";
import { getCoverForBeat } from "@/lib/beatsUtils";

// Vista cinematográfica completa del beat (pantalla casi entera).
// Reutiliza la ficha técnica del catálogo con presentación premium inmersiva.
// Se abre al pulsar la tarjeta. Sin menús hover. Inspiración: Netflix / Apple Music.
export default function BeatExpandedPanel({
  beat,
  onClose,
  user,
  liked,
  saved,
  active,
  isPlaying,
  onLike,
  onSave,
  onDownload,
  onBuy,
  onPlay,
}) {
  const licenses = beat.licenses || [];
  const hasBuy = !!(beat.buy_link || licenses.length > 0);
  const cover = getCoverForBeat(beat);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose?.(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const handleShare = async (e) => {
    e.stopPropagation();
    const url = `${window.location.origin}/beats/${beat.slug || beat.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: beat.title, text: `${beat.title} — ${beat.producer || "Cabaña"}`, url });
      } else {
        await navigator.clipboard.writeText(url);
      }
    } catch {}
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6"
      style={{ background: "rgba(6,6,8,0.72)", backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 24 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0, y: 16 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-5xl max-h-[92vh] overflow-y-auto rounded-3xl"
        style={{
          background: "linear-gradient(180deg, rgba(28,28,32,0.85), rgba(14,14,16,0.92))",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
        }}
      >
        {/* Cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-colors"
          style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(8px)" }}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Banner / artwork cinematográfico */}
        <div className="relative h-52 sm:h-72 overflow-hidden rounded-t-3xl">
          {cover ? (
            <img src={cover} alt={beat.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ background: BEATS_GRADIENTS.orange }}>
              <Music2 className="w-12 h-12 text-white/40" />
            </div>
          )}
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(14,14,16,0) 45%, rgba(14,14,16,0.96) 100%)" }}
          />

        </div>

        {/* Cuerpo */}
        <div className="px-5 sm:px-8 pb-7 -mt-10 relative">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div className="min-w-0">
              <h2 className="text-3xl sm:text-4xl font-black text-white" style={{ letterSpacing: "-0.03em" }}>
                {beat.title}
              </h2>
              <p className="text-sm text-white/55 mt-1">{beat.producer || "Cabaña Creative"}</p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onPlay?.(); }}
              className="w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-transform hover:scale-105 flex-shrink-0"
              style={{ background: BEATS_GRADIENTS.orange }}
              title={active && isPlaying ? "Pausar" : "Reproducir"}
            >
              {active && isPlaying ? (
                <Pause className="w-6 h-6 text-white" fill="white" />
              ) : (
                <Play className="w-6 h-6 text-white ml-0.5" fill="white" />
              )}
            </button>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6">
            <MetaChip label="Género" value={(beat.genres || []).join(", ") || "—"} />
            <MetaChip label="BPM" value={beat.bpm ? `${beat.bpm}` : "—"} />
            <MetaChip label="Key" value={beat.key || beat.scale || "—"} />
            <MetaChip label="Mood" value={(beat.moods || []).join(", ") || "—"} />
            <MetaChip label="Duración" value={beat.duration > 0 ? formatDuration(beat.duration) : "—"} />
          </div>

          {/* Descripción */}
          {beat.description && (
            <p className="text-sm text-white/65 leading-relaxed mt-6">{beat.description}</p>
          )}

          {/* Licencias disponibles */}
          {licenses.length > 0 && (
            <div className="mt-6">
              <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: BEATS_BRAND.yellow }}>
                Licencias disponibles
              </p>
              <div className="flex flex-wrap gap-2">
                {licenses.map((l, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold text-white/80"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                  >
                    {l.type === "mp3_free" ? "MP3 Free" : l.type === "wav" ? "WAV" : l.type === "wav_premium" ? "WAV Premium" : "Exclusiva"}
                    {l.price != null && l.price > 0 ? ` · ${l.price}€` : ""}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Acciones */}
          <div className="flex items-center gap-2 mt-7 flex-wrap">
            {beat.free_mp3_url && onDownload && (
              <button
                onClick={(e) => { e.stopPropagation(); onDownload(beat); }}
                className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white transition-colors hover:bg-white/10"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}
              >
                <Download className="w-4 h-4" /> Descargar MP3
              </button>
            )}
            {hasBuy && (
              <button
                onClick={(e) => { e.stopPropagation(); onBuy(beat); }}
                className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white transition-transform hover:scale-[1.03]"
                style={{ background: BEATS_GRADIENTS.orange }}
              >
                <ShoppingBag className="w-4 h-4" /> Comprar licencia
              </button>
            )}
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white transition-colors hover:bg-white/10"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}
            >
              <Share2 className="w-4 h-4" /> Compartir
            </button>
            <div className="flex-1" />
            {onLike && (
              <button
                onClick={(e) => { e.stopPropagation(); onLike(beat); }}
                className="w-12 h-12 rounded-xl flex items-center justify-center transition-colors hover:bg-white/10"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}
                title="Me gusta"
              >
                <Heart
                  className={`w-5 h-5 ${liked ? "fill-current" : ""}`}
                  style={liked ? { color: BEATS_BRAND.red } : { color: "rgba(255,255,255,0.7)" }}
                />
              </button>
            )}
            {onSave && (
              <button
                onClick={(e) => { e.stopPropagation(); onSave(beat); }}
                className="w-12 h-12 rounded-xl flex items-center justify-center transition-colors hover:bg-white/10"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}
                title="Guardar"
              >
                <Bookmark
                  className={`w-5 h-5 ${saved ? "fill-current" : ""}`}
                  style={saved ? { color: BEATS_BRAND.yellow } : { color: "rgba(255,255,255,0.7)" }}
                />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function MetaChip({ label, value }) {
  return (
    <div
      className="rounded-xl px-4 py-3 transition-colors hover:bg-white/[0.06]"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
    >
      <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/30">{label}</p>
      <p className="text-[15px] font-bold text-white truncate mt-1.5" style={{ letterSpacing: "-0.01em" }}>{value}</p>
    </div>
  );
}