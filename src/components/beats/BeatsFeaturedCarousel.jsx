import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Music2, Flame } from "lucide-react";
import { useGlobalAudio } from "@/context/GlobalAudioContext";
import { getCoverForBeat } from "@/lib/beatsUtils";

export default function BeatsFeaturedCarousel({ beats, isPlaying, onPlay, onLike, likedIds }) {
  const { playingTrack } = useGlobalAudio();
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (!beats || beats.length <= 1) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % beats.length), 6000);
    return () => clearInterval(t);
  }, [beats]);

  if (!beats || beats.length === 0) return null;

  const current = beats[idx] || beats[0];
  const active = playingTrack?.beat_id === current.id;
  const cover = getCoverForBeat(current);
  const genres = (current.genres || []).slice(0, 2).join(", ");
  const meta = [current.producer, genres, current.bpm ? `${current.bpm} BPM` : null, current.scale || current.key]
    .filter(Boolean).join(" · ");

  return (
    <div>
      {/* Eyebrow — selección top */}
      <div className="flex items-center gap-2 mb-3 px-1">
        <Flame className="w-4 h-4" style={{ color: "#7C3AED" }} />
        <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-white/70">Beats de la semana</span>
      </div>

      <div
        className="relative rounded-3xl overflow-hidden aspect-[16/10] sm:aspect-[21/9]"
        style={{ background: "#161616" }}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={current.id}
            src={cover}
            alt={current.title}
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </AnimatePresence>

        {/* Cinematic gradient overlay */}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(180deg, rgba(14,14,14,0.25) 0%, rgba(14,14,14,0.1) 35%, rgba(14,14,14,0.92) 100%)" }}
        />

        {/* Content — bottom-left */}
        <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-xl"
            >
              <h2
                className="text-3xl sm:text-5xl font-black text-white mb-2.5"
                style={{ letterSpacing: "-0.03em", lineHeight: 0.98 }}
              >
                {current.title}
              </h2>
              {/* Sub-label: avatar circular + meta */}
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center"
                  style={{ background: "#2a2a2a", border: "1px solid rgba(255,255,255,0.15)" }}
                >
                  {cover ? (
                    <img src={cover} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Music2 className="w-3 h-3 text-white/40" />
                  )}
                </div>
                <p className="text-xs sm:text-sm text-white/70 font-medium truncate">{meta}</p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Play button — bottom-right, purple */}
        <button
          onClick={() => onPlay(current, beats)}
          className="absolute bottom-5 right-5 sm:bottom-8 sm:right-8 w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center shadow-2xl transition-transform hover:scale-110 active:scale-95 z-10"
          style={{ background: "#7C3AED" }}
        >
          {active && isPlaying ? (
            <Pause className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="white" />
          ) : (
            <Play className="w-6 h-6 sm:w-7 sm:h-7 text-white ml-1" fill="white" />
          )}
        </button>
      </div>

      {/* Pagination pills */}
      <div className="flex items-center justify-center gap-2 mt-4">
        {beats.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            className="h-1.5 rounded-full transition-all duration-300"
            style={{ width: i === idx ? 28 : 8, background: i === idx ? "#ffffff" : "rgba(255,255,255,0.2)" }}
          />
        ))}
      </div>
    </div>
  );
}