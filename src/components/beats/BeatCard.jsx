import React, { useState } from "react";
import { motion } from "framer-motion";
import { Activity, Pause, Play } from "lucide-react";
import { useBeatPlayer } from "@/hooks/useBeatPlayer";
import { getCoverForBeat } from "@/lib/beatsUtils";
import { BEATS_BRAND } from "@/lib/beatsTheme";

// Tarjeta de beat — una única superficie interactiva.
// Cualquier clic abre la vista cinematográfica completa del beat.
// Sin menús hover, sin paneles flotantes, sin overlays inferiores.
export default function BeatCard({
  beat,
  index,
  user,
  liked,
  saved,
  onLike,
  onSave,
  onDownload,
  onBuy,
  onPlay,
  onOpen,
  listBeats,
}) {
  const { playingTrack, isPlaying } = useBeatPlayer();
  const [imgError, setImgError] = useState(false);
  const cover = imgError ? null : getCoverForBeat(beat);
  const genre = (beat.genres && beat.genres[0]) || "";
  const active = playingTrack?.beat_id === beat.id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: (index || 0) * 0.04, duration: 0.5 }}
      className="group"
    >
      {/* Toda la tarjeta abre la vista cinematográfica */}
      <button
        type="button"
        onClick={() => onOpen?.(beat)}
        className="block w-full text-left"
      >
        <div
          className="relative aspect-square rounded-2xl overflow-hidden mb-2.5 transition-transform duration-300 group-hover:scale-[1.02]"
          style={{ background: "#161616" }}
        >
          {cover ? (
            <img
              src={cover}
              alt={beat.title}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Activity className="w-8 h-8 text-white/10" />
            </div>
          )}

          {/* Gradiente cinematográfico */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/5 pointer-events-none" />

          {/* Botón de play minimalista centrado */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onPlay?.(beat, listBeats); }}
              className="pointer-events-auto w-12 h-12 rounded-full flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
              style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.18)" }}
              title={active && isPlaying ? "Pausar" : "Reproducir"}
            >
              {active && isPlaying ? (
                <Pause className="w-5 h-5 text-white" fill="white" />
              ) : (
                <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
              )}
            </button>
          </div>

          {/* Anillo de estado activo */}
          {active && (
            <div
              className="absolute inset-0 rounded-2xl pointer-events-none"
              style={{ border: `2px solid ${BEATS_BRAND.orange}` }}
            />
          )}
        </div>

        {/* Título + productor */}
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-white truncate leading-tight group-hover:text-white/90 transition-colors">
            {beat.title}
          </h3>
          <p className="text-xs text-[#a0a0a0] mt-0.5 truncate">{beat.producer || "Cabaña"}</p>
        </div>

        {/* Género + BPM / Key */}
        <div className="flex items-center gap-2 mt-1.5">
          {genre && (
            <span className="text-[9px] font-bold tracking-wider uppercase" style={{ color: BEATS_BRAND.red }}>
              {genre}
            </span>
          )}
          {beat.bpm && <span className="text-[10px] text-[#707070] font-medium">{beat.bpm} BPM</span>}
          {(beat.scale || beat.key) && (
            <span className="text-[10px] text-[#707070] font-medium">{beat.scale || beat.key}</span>
          )}
        </div>
      </button>
    </motion.div>
  );
}