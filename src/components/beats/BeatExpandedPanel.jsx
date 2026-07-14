import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, Pause, Download, ShoppingBag, Bookmark, Heart, Share2, Clock, Activity, Music2,
} from "lucide-react";
import { formatDuration } from "@/lib/musicConstants";
import { BEATS_BRAND, BEATS_GRADIENTS } from "@/lib/beatsTheme";
import { getCoverForBeat } from "@/lib/beatsUtils";

// Ficha técnica cinematográfica del beat (mismo componente que Mi Catálogo).
// Se abre al pulsar la tarjeta. Sin menús hover. Reutiliza este componente existente.
export default function BeatExpandedPanel({
  beat,
  expanded,
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
  const statusLabel = beat.status || "—";

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
    <AnimatePresence initial={false}>
      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden"
        >
          <div
            className="mt-2.5 rounded-2xl p-3 space-y-3"
            style={{ background: "#161616", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            {/* Cabecera: artwork + nombre + productor + play */}
            <div className="flex items-center gap-3">
              <div
                className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0"
                style={{ background: "#1f1f1f" }}
              >
                {cover ? (
                  <img src={cover} alt={beat.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Music2 className="w-5 h-5 text-white/20" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-black text-white truncate" style={{ letterSpacing: "-0.01em" }}>
                  {beat.title}
                </h4>
                <p className="text-[11px] text-white/45 truncate">{beat.producer || "Cabaña"}</p>
                <span
                  className="inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider"
                  style={{
                    color: beat.status === "Publicado" ? BEATS_BRAND.yellow : "rgba(255,255,255,0.5)",
                    background: beat.status === "Publicado" ? BEATS_BRAND.yellowSoft : "rgba(255,255,255,0.05)",
                  }}
                >
                  {statusLabel}
                </span>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); onPlay && onPlay(); }}
                className="w-11 h-11 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 flex-shrink-0"
                style={{ background: BEATS_GRADIENTS.orange }}
                title={active && isPlaying ? "Pausar" : "Reproducir"}
              >
                {active && isPlaying ? (
                  <Pause className="w-4 h-4 text-white" fill="white" />
                ) : (
                  <Play className="w-4 h-4 text-white ml-0.5" fill="white" />
                )}
              </button>
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-[10px]">
              <MetaRow label="Género" value={(beat.genres || []).join(", ") || "—"} />
              <MetaRow label="BPM" value={beat.bpm ? `${beat.bpm}` : "—"} />
              <MetaRow label="Key" value={beat.key || beat.scale || "—"} />
              <MetaRow label="Mood" value={(beat.moods || []).join(", ") || "—"} />
              <MetaRow label="Duración" value={beat.duration > 0 ? formatDuration(beat.duration) : "—"} icon={Clock} />
              <MetaRow label="Repros" value={`${beat.plays_count || 0}`} icon={Activity} />
            </div>

            {/* Licencias disponibles */}
            {licenses.length > 0 && (
              <div>
                <p className="text-[9px] font-bold uppercase tracking-wider mb-1.5" style={{ color: BEATS_BRAND.yellow }}>
                  Licencias
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {licenses.map((l, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 rounded-full text-[10px] font-semibold text-white/75"
                      style={{ background: "#1f1f1f", border: "1px solid #2a2a2a" }}
                    >
                      {l.type === "mp3_free" ? "MP3 Free" : l.type === "wav" ? "WAV" : l.type === "wav_premium" ? "WAV Premium" : "Exclusiva"}
                      {l.price != null && l.price > 0 ? ` · ${l.price}€` : ""}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Acciones */}
            <div className="flex items-center gap-2 pt-1 flex-wrap">
              {/* Descargar Preview */}
              {beat.free_mp3_url && onDownload && (
                <button
                  onClick={(e) => { e.stopPropagation(); onDownload(beat); }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold text-white transition-colors hover:bg-white/10"
                  style={{ background: "#1f1f1f", border: "1px solid #2a2a2a" }}
                >
                  <Download className="w-3.5 h-3.5" />
                  Descargar Preview
                </button>
              )}

              {/* Comprar Beat */}
              {hasBuy && (
                <button
                  onClick={(e) => { e.stopPropagation(); onBuy(beat); }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold text-white transition-transform hover:scale-[1.03]"
                  style={{ background: BEATS_GRADIENTS.orange }}
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  Comprar Beat
                </button>
              )}

              {/* Compartir */}
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold text-white transition-colors hover:bg-white/10"
                style={{ background: "#1f1f1f", border: "1px solid #2a2a2a" }}
                title="Compartir"
              >
                <Share2 className="w-3.5 h-3.5" />
                Compartir
              </button>

              <div className="flex-1" />

              {/* Like */}
              {onLike && (
                <button
                  onClick={(e) => { e.stopPropagation(); onLike(beat); }}
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors hover:bg-white/10"
                  style={{ background: "#1f1f1f", border: "1px solid #2a2a2a" }}
                  title="Me gusta"
                >
                  <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} style={liked ? { color: BEATS_BRAND.red } : { color: "rgba(255,255,255,0.6)" }} />
                </button>
              )}
              {/* Save */}
              {onSave && (
                <button
                  onClick={(e) => { e.stopPropagation(); onSave(beat); }}
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors hover:bg-white/10"
                  style={{ background: "#1f1f1f", border: "1px solid #2a2a2a" }}
                  title="Guardar"
                >
                  <Bookmark className={`w-4 h-4 ${saved ? "fill-current" : ""}`} style={saved ? { color: BEATS_BRAND.yellow } : { color: "rgba(255,255,255,0.6)" }} />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function MetaRow({ label, value, icon: Icon }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="uppercase tracking-wider font-semibold text-white/30">{label}</span>
      <span className="text-white/85 font-semibold truncate flex items-center gap-1">
        {Icon && <Icon className="w-2.5 h-2.5 text-white/40" />}
        {value}
      </span>
    </div>
  );
}