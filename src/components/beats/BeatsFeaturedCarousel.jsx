import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Music2, ChevronLeft, ChevronRight } from "lucide-react";
import { useGlobalAudio } from "@/context/GlobalAudioContext";
import { getCoverForBeat } from "@/lib/beatsUtils";
import { preloadBeatAudio } from "@/lib/beatPreload";

// Hero Carousel — réplica fiel del blueprint de referencia.
// Botón Play en naranja corporativo (#ff5833). Clic en la tarjeta abre la
// ficha cinematográfica; el botón Play reproduce inmediatamente.
export default function BeatsFeaturedCarousel({ beats, isPlaying, onPlay, onOpen, section }) {
  const { playingTrack } = useGlobalAudio();
  const [idx, setIdx] = useState(0);
  const touchStartX = useRef(null);

  const autoPlay = section?.auto_play !== false;
  const intervalMs = Math.max(3, section?.auto_play_interval || 6) * 1000;

  useEffect(() => {
    if (!beats || beats.length <= 1 || !autoPlay) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % beats.length), intervalMs);
    return () => clearInterval(t);
  }, [beats, autoPlay, intervalMs]);

  // Precarga del primer beat (audio) para reproducción inmediata + slide siguiente.
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

  // Swipe táctil (móvil)
  const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touchStartX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 45) go(dx > 0 ? -1 : 1);
    touchStartX.current = null;
  };

  return (
    <div>
      {/* ── Móvil: versión original sin cambios ───────────────────── */}
      <div
        className="sm:hidden relative rounded-2xl overflow-hidden aspect-[16/10] cursor-pointer group select-none"
        style={{ background: "#161616" }}
        onClick={() => onOpen?.(current)}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={current.id}
            src={cover}
            alt={current.title}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55 }}
            className="absolute inset-0 w-full h-full object-cover"
            loading={idx === 0 ? "eager" : "lazy"}
            draggable={false}
          />
        </AnimatePresence>

        {/* Degradado cinematográfico: fuerte abajo, desaparece hacia el centro */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0) 42%, rgba(0,0,0,0.92) 100%)" }}
        />

        {/* Contenido superpuesto — esquina inferior izquierda */}
        <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-6 pointer-events-none">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-xl pointer-events-auto"
              onClick={(e) => { e.stopPropagation(); onOpen?.(current); }}
            >
              <h2
                className="text-[30px] sm:text-[44px] font-black text-white mb-2.5"
                style={{ letterSpacing: "-0.03em", lineHeight: 0.98 }}
              >
                {current.title}
              </h2>
              {/* Sub-label: avatar + productor · géneros · tags */}
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center"
                  style={{ background: "#2a2a2a", border: "1px solid rgba(255,255,255,0.15)" }}
                >
                  {beatCover ? (
                    <img src={beatCover} alt="" className="w-full h-full object-cover" draggable={false} />
                  ) : (
                    <Music2 className="w-3 h-3 text-white/40" />
                  )}
                </div>
                <p className="text-xs sm:text-sm text-white/75 font-medium truncate">
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
              style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.12)" }}
              aria-label="Anterior"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); go(1); }}
              className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
              style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.12)" }}
              aria-label="Siguiente"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </>
        )}

        {/* Botón Play grande — naranja corporativo — reproduce al instante */}
        <button
          onClick={(e) => { e.stopPropagation(); onPlay?.(current, beats); }}
          className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-transform hover:scale-110 active:scale-95 z-10"
          style={{ background: "#ff5833", boxShadow: "0 8px 30px rgba(255,88,51,0.45)" }}
          aria-label={active && isPlaying ? "Pausar" : "Reproducir"}
        >
          {active && isPlaying ? (
            <Pause className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="white" />
          ) : (
            <Play className="w-6 h-6 sm:w-7 sm:h-7 text-white ml-1" fill="white" />
          )}
        </button>
      </div>

      {/* ── Desktop: hero cinematográfico reducido (21:9) ────────── */}
      <div
        className="hidden sm:block relative rounded-2xl overflow-hidden cursor-pointer group select-none"
        style={{ aspectRatio: "21 / 9", background: "#162130" }}
        onClick={() => onOpen?.(current)}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={current.id}
            src={cover}
            alt={current.title}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55 }}
            className="absolute inset-0 w-full h-full object-cover"
            draggable={false}
          />
        </AnimatePresence>

        {/* Overlay navy cinematográfico (fragmentado / reducido) */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "linear-gradient(90deg, rgba(11,18,32,0.92) 0%, rgba(11,18,32,0.55) 45%, rgba(11,18,32,0.12) 100%)" }}
        />

        {/* Contenido — izquierda, centrado vertical */}
        <div className="absolute inset-0 flex items-center px-8 lg:px-12 pointer-events-none">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-xl pointer-events-auto"
              onClick={(e) => { e.stopPropagation(); onOpen?.(current); }}
            >
              <h2
                className="text-[34px] lg:text-[40px] font-black text-white mb-3"
                style={{ letterSpacing: "-0.03em", lineHeight: 0.98 }}
              >
                {current.title}
              </h2>
              <div className="flex items-center gap-2 mb-5">
                <div
                  className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center"
                  style={{ background: "#2a2a2a", border: "1px solid rgba(255,255,255,0.18)" }}
                >
                  {beatCover ? (
                    <img src={beatCover} alt="" className="w-full h-full object-cover" draggable={false} />
                  ) : (
                    <Music2 className="w-3 h-3 text-white/40" />
                  )}
                </div>
                <p className="text-sm text-white/70 font-medium truncate">
                  {meta}{tags ? ` • ${tags}` : ""}
                </p>
              </div>
              {/* Controles: Play circular + pill Ver beat */}
              <div className="flex items-center gap-3">
                <button
                  onClick={(e) => { e.stopPropagation(); onPlay?.(current, beats); }}
                  className="w-12 h-12 rounded-full flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
                  style={{ background: "#ff5833", boxShadow: "0 8px 26px rgba(255,88,51,0.4)" }}
                  aria-label={active && isPlaying ? "Pausar" : "Reproducir"}
                >
                  {active && isPlaying ? (
                    <Pause className="w-5 h-5 text-white" fill="white" />
                  ) : (
                    <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
                  )}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onOpen?.(current); }}
                  className="px-5 py-2.5 rounded-full text-sm font-bold text-white transition-colors hover:bg-white/10"
                  style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)", backdropFilter: "blur(8px)" }}
                >
                  Ver beat
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Flechas de navegación — esquina inferior derecha */}
        {beats.length > 1 && (
          <div className="absolute bottom-5 right-6 flex items-center gap-2 z-10">
            <button
              onClick={(e) => { e.stopPropagation(); go(-1); }}
              className="w-9 h-9 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.14)" }}
              aria-label="Anterior"
            >
              <ChevronLeft className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); go(1); }}
              className="w-9 h-9 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.14)" }}
              aria-label="Siguiente"
            >
              <ChevronRight className="w-4 h-4 text-white" />
            </button>
          </div>
        )}

        {/* Puntos de paginación tenues — centro inferior */}
        {beats.length > 1 && (
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 pointer-events-none z-10">
            {beats.map((_, i) => (
              <span
                key={i}
                className="h-1.5 rounded-full transition-all duration-300"
                style={{ width: i === idx ? 18 : 6, background: i === idx ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.3)" }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Indicadores inferiores — píldoras (móvil) */}
      {beats.length > 1 && (
        <div className="sm:hidden flex items-center justify-center gap-2 mt-4">
          {beats.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className="h-1.5 rounded-full transition-all duration-300"
              style={{ width: i === idx ? 24 : 12, background: i === idx ? "#ffffff" : "#4b4b4b" }}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}