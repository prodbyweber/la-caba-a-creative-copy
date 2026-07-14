import React, { useState } from "react";
import { motion } from "framer-motion";
import { Activity, Pause } from "lucide-react";
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
  onOpen,
  listBeats,
}) {
  const { playingTrack, isPlaying } = useBeatPlayer();
  const [imgError, setImgError] = useState(false);
  const cover = imgError ? null : getCoverForBeat(beat);
  const genre = (beat.genres && beat.genres[0]) || "";
  const active = playingTrack?.beat_id === beat.id;
  const playingNow = active && isPlaying;

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

          {/* Reproducciones (abajo-izquierda) */}
          <div
            className="absolute bottom-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold text-white"
            style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)" }}
          >
            <Activity className="w-2.5 h-2.5" style={{ color: BEATS_BRAND.orange }} />
            {beat.plays_count || 0}
          </div>

          {/* Indicador "sonando" (abajo-derecha, no interactivo) */}
          {active && (
            <div
              className="absolute bottom-2 right-2 flex items-end gap-[2px] h-5 px-1.5 py-1 rounded-full pointer-events-none"
              style={{ background: BEATS_BRAND.orange }}
            >
              {playingNow ? (
                [0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="w-[2px] rounded-full bg-white"
                    animate={{ height: [4, 13, 4] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.14, ease: "easeInOut" }}
                    style={{ height: 6 }}
                  />
                ))
              ) : (
                <Pause className="w-3 h-3 text-white" fill="white" />
              )}
            </div>
          )}

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