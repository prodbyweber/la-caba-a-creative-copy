import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause } from "lucide-react";
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
  const genres = (current.genres || []).slice(0, 2).join(" · ");

  return (
    <div>
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

        {/* Cinematic gradient overlays */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(14,14,14,0.55) 0%, rgba(14,14,14,0.1) 40%, rgba(14,14,14,0.92) 100%)" }} />

        {/* Content — bottom-left */}
        <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-xl"
            >
              <p className="text-[10px] font-bold text-[#ff8866] uppercase tracking-[0.3em] mb-2">
                {current.producer || "Cabaña Creative"}
              </p>
              <h2
                className="text-3xl sm:text-6xl font-black text-white mb-2"
                style={{ letterSpacing: "-0.04em", lineHeight: 0.95 }}
              >
                {current.title}
              </h2>
              {genres && (
                <p className="text-xs sm:text-sm text-white/55 font-medium mb-3">{genres}</p>
              )}
              <div className="flex items-center gap-4">
                {current.bpm && <span className="text-xs text-white/50 font-semibold">{current.bpm} BPM</span>}
                {(current.scale || current.key) && <span className="text-xs text-white/50 font-semibold">{current.scale || current.key}</span>}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Floating play button — bottom-right */}
        <button
          onClick={() => onPlay(current, beats)}
          className="absolute bottom-5 right-5 sm:bottom-10 sm:right-10 w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center shadow-2xl transition-transform hover:scale-110 z-10"
          style={{ background: "#ff5833" }}
        >
          {active && isPlaying ? (
            <Pause className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="white" />
          ) : (
            <Play className="w-6 h-6 sm:w-7 sm:h-7 text-white ml-1" fill="white" />
          )}
        </button>
      </div>

      {/* Pagination dots */}
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