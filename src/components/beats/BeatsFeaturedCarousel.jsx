import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause } from "lucide-react";
import { useGlobalAudio } from "@/context/GlobalAudioContext";
import { getCoverForBeat } from "@/lib/beatsUtils";

export default function BeatsFeaturedCarousel({ beats, isPlaying, onPlay, onLike, likedIds }) {
  const { playingTrack } = useGlobalAudio();
  const [idx, setIdx] = useState(0);

  // Auto-advance every 6s
  useEffect(() => {
    if (!beats || beats.length <= 1) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % beats.length), 6000);
    return () => clearInterval(t);
  }, [beats]);

  if (!beats || beats.length === 0) return null;

  const current = beats[idx] || beats[0];
  const active = playingTrack?.beat_id === current.id;
  const cover = getCoverForBeat(current);

  return (
    <div>
      <div
        className="relative rounded-3xl overflow-hidden aspect-[16/11] sm:aspect-[21/9]"
        style={{ background: "#161616" }}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={current.id}
            src={cover}
            alt={current.title}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </AnimatePresence>

        {/* Cinematic gradient overlays */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(14,14,14,0.7) 0%, rgba(14,14,14,0.15) 45%, rgba(14,14,14,0.92) 100%)" }} />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="text-[10px] font-bold text-[#a78bfa] uppercase tracking-[0.3em] mb-2">
                {current.producer || "Cabaña Creative"}
              </p>
              <h2
                className="text-3xl sm:text-6xl font-black text-white mb-3"
                style={{ letterSpacing: "-0.04em", lineHeight: 0.95 }}
              >
                {current.title}
              </h2>
              <div className="flex items-center gap-4 mb-5">
                {current.bpm && <span className="text-xs text-white/60 font-semibold">{current.bpm} BPM</span>}
                {current.scale && <span className="text-xs text-white/60 font-semibold">{current.scale}</span>}
                {current.key && !current.scale && <span className="text-xs text-white/60 font-semibold">{current.key}</span>}
                <span className="text-xs text-white/40 font-semibold flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-[#8b5cf6]" />
                  {current.plays_count || 0} plays
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onPlay(current, beats)}
                  className="w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-transform hover:scale-110"
                  style={{ background: "#8b5cf6" }}
                >
                  {active && isPlaying ? (
                    <Pause className="w-7 h-7 text-white" fill="white" />
                  ) : (
                    <Play className="w-7 h-7 text-white ml-1" fill="white" />
                  )}
                </button>
                {onLike && (
                  <button
                    onClick={() => onLike(current)}
                    className="px-5 py-3 rounded-full text-xs font-bold text-white border border-white/15 hover:bg-white/10 transition-colors"
                  >
                    {likedIds.has(current.id) ? "Guardado" : "Guardar"}
                  </button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Pagination dots */}
      <div className="flex items-center justify-center gap-2 mt-4">
        {beats.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            className="h-1.5 rounded-full transition-all duration-300"
            style={{ width: i === idx ? 28 : 8, background: i === idx ? "#8b5cf6" : "rgba(255,255,255,0.2)" }}
          />
        ))}
      </div>
    </div>
  );
}