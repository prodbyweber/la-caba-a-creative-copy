import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Music2, ChevronLeft, ChevronRight } from "lucide-react";
import { useGlobalAudio } from "@/context/GlobalAudioContext";
import { getCoverForBeat } from "@/lib/beatsUtils";
import { preloadBeatAudio } from "@/lib/beatPreload";

// Hero carrusel horizontal — escaparate de Beats Destacados.
// Composición fiel a la referencia; botón Play en naranja corporativo (#ff5833).
// Clic en la tarjeta abre la ficha cinematográfica; el botón Play reproduce.
export default function BeatsFeaturedCarousel({ beats, isPlaying, onPlay, onOpen, section }) {
  const { playingTrack } = useGlobalAudio();
  const [idx, setIdx] = useState(0);

  const autoPlay = section?.auto_play !== false;
  const intervalMs = Math.max(3, section?.auto_play_interval || 6) * 1000;

  useEffect(() => {
    if (!beats || beats.length <= 1 || !autoPlay) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % beats.length), intervalMs);
    return () => clearInterval(t);
  }, [beats, autoPlay, intervalMs]);

  // Precarga del primer beat (audio) para reproducción inmediata.
  useEffect(() => {
    if (beats?.[0]?.preview_mp3_url) preloadBeatAudio(beats[0].preview_mp3_url);
  }, [beats]);

  if (!beats || beats.length === 0) return null;

  const current = beats[idx] || beats[0];
  const active = playingTrack?.beat_id === current.id;
  const beatCover = getCoverForBeat(current);
  const cover = section?.hero_image_url || beatCover;
  const genres = (current.genres || []).slice(0, 2).join(", ");
  const tags = (current.tags || []).slice(0, 3).join(" · ");
  const meta = [current.producer, genres].filter(Boolean).join(" · ");
  const aux = section?.aux_text;

  const go = (n) => setIdx((i) => (i + n + beats.length) % beats.length);

  return (
    <div>
      <div
        className="relative rounded-3xl overflow-hidden aspect-[16/10] sm:aspect-[21/9] cursor-pointer group"
        style={{ background: "#161616" }}
        onClick={() => onOpen?.(current)}
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
            loading={idx === 0 ? "eager" : "lazy"}
          />
        </AnimatePresence>

        {/* Degradado cinematográfico inferior */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "linear-gradient(180deg, rgba(14,14,14,0.2) 0%, rgba(14,14,14,0.05) 38%, rgba(14,14,14,0.92) 100%)" }}
        />

        {/* Contenido superpuesto — abajo a la izquierda */}
        <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-8 pointer-events-none">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-xl pointer-events-auto"
              onClick={(e) => { e.stopPropagation(); onOpen?.(current); }}
            >
              <h2
                className="text-3xl sm:text-5xl font-black text-white mb-2.5"
                style={{ letterSpacing: "-0.03em", lineHeight: 0.98 }}
              >
                {current.title}
              </h2>
              {/* Sub-label: avatar + productor · géneros · tags */}
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center"
                  style={{ background: "#2a2a2a", border: "1px solid rgba(255,255,255,0.15)" }}
                >
                  {beatCover ? (
                    <img src={beatCover} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Music2 className="w-3 h-3 text-white/40" />
                  )}
                </div>
                <p className="text-xs sm:text-sm text-white/70 font-medium truncate">
                  {meta}{tags ? ` · ${tags}` : ""}
                </p>
              </div>
              {aux && (
                <p className="text-xs sm:text-sm text-white/55 mt-2.5 line-clamp-2 max-w-md">{aux}</p>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Flechas de navegación manual (desktop hover) */}
        {beats.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); go(-1); }}
              className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
              style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.12)" }}
              aria-label="Anterior"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); go(1); }}
              className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
              style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.12)" }}
              aria-label="Siguiente"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </>
        )}

        {/* Botón Play grande — naranja corporativo — reproduce inmediatamente */}
        <button
          onClick={(e) => { e.stopPropagation(); onPlay?.(current, beats); }}
          className="absolute bottom-5 right-5 sm:bottom-8 sm:right-8 w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center shadow-2xl transition-transform hover:scale-110 active:scale-95 z-10"
          style={{ background: "#ff5833" }}
          aria-label={active && isPlaying ? "Pausar" : "Reproducir"}
        >
          {active && isPlaying ? (
            <Pause className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="white" />
          ) : (
            <Play className="w-6 h-6 sm:w-7 sm:h-7 text-white ml-1" fill="white" />
          )}
        </button>
      </div>

      {/* Indicadores inferiores (píldoras) */}
      {beats.length > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          {beats.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className="h-1.5 rounded-full transition-all duration-300"
              style={{ width: i === idx ? 28 : 8, background: i === idx ? "#ffffff" : "rgba(255,255,255,0.2)" }}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}