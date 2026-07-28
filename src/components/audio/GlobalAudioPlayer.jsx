import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, ChevronDown, ChevronUp, X, Music2 } from "lucide-react";
import { useGlobalAudio } from "@/context/GlobalAudioContext";

export default function GlobalAudioPlayer() {
  const { playingTrack, isPlaying, currentTime, duration, hidden, pauseTrack, resumeTrack, stopTrack, closePlayer, setHidden, seekTrack, setExpanded } = useGlobalAudio();
  const [isDragging, setIsDragging] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const progressRef = useRef(null);
  const playerRef = useRef(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const performSeek = useCallback((clientX) => {
    if (!progressRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    seekTrack(percent * duration);
  }, [duration, seekTrack]);

  const handleSeekDown = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleSeekUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (isDragging) {
      performSeek(e.clientX);
    }
  }, [isDragging, performSeek]);

  const handleTouchMove = useCallback((e) => {
    if (isDragging && e.touches[0]) {
      e.preventDefault();
      performSeek(e.touches[0].clientX);
    }
  }, [isDragging, performSeek]);

  const handleClick = useCallback((e) => {
    performSeek(e.clientX);
  }, [performSeek]);

  // Agregar listeners globales cuando está arrastrando
  useEffect(() => {
    if (!isDragging) return;

    const handleGlobalMouseMove = (e) => {
      performSeek(e.clientX);
    };

    const handleGlobalTouchMove = (e) => {
      if (e.touches[0]) {
        performSeek(e.touches[0].clientX);
      }
    };

    const handleGlobalEnd = () => {
      setIsDragging(false);
    };

    document.addEventListener("mousemove", handleGlobalMouseMove, { passive: true });
    document.addEventListener("touchmove", handleGlobalTouchMove, { passive: false });
    document.addEventListener("mouseup", handleGlobalEnd);
    document.addEventListener("touchend", handleGlobalEnd);

    return () => {
      document.removeEventListener("mousemove", handleGlobalMouseMove);
      document.removeEventListener("touchmove", handleGlobalTouchMove);
      document.removeEventListener("mouseup", handleGlobalEnd);
      document.removeEventListener("touchend", handleGlobalEnd);
    };
  }, [isDragging, performSeek]);

  const formatTime = (sec) => {
    if (!sec || !Number.isFinite(sec)) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  React.useEffect(() => {
    if (playerRef.current && playingTrack) {
      playerRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [playingTrack?.id]);

  // Don't render for beat tracks — handled by BeatMiniPlayer
  if (playingTrack?.beat_id) return null;

  const displayArtist = playingTrack?.display_artist || playingTrack?.artist || "Cabaña Creative";

  return (
    <AnimatePresence>
      {playingTrack && !hidden && (
        <motion.div
          ref={playerRef}
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed left-0 right-0 z-[100] border-t border-white/10 backdrop-blur-xl"
          style={{
            bottom: isMobile ? "calc(60px + env(safe-area-inset-bottom, 0px))" : "0px",
            background: "rgba(10, 10, 11, 0.95)"
          }}
          onMouseMove={handleMouseMove}
          onTouchMove={handleTouchMove}
          onMouseUp={handleSeekUp}
          onTouchEnd={handleSeekUp}
        >
          {/* Barra de progreso — esmeralda, compacta en desktop */}
          <div className="relative h-4 sm:h-3 flex items-center px-3 sm:px-4">
            <div
              ref={progressRef}
              className="w-full h-1 sm:h-1 bg-white/5 cursor-pointer group hover:bg-white/8 transition-all relative rounded-full"
              onMouseDown={handleSeekDown}
              onTouchStart={handleSeekDown}
              onClick={handleClick}
            >
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-[width] duration-150 ease-out sm:shadow-[0_0_8px_#34d39973]"
                style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
              />
              {/* Handle */}
              <div
                className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-3 sm:h-3 bg-emerald-400 rounded-full shadow-lg border border-white cursor-grab active:cursor-grabbing transition-all opacity-0 group-hover:opacity-100"
                style={{ left: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`, transform: "translate(-50%, -50%)" }}
                onMouseDown={handleSeekDown}
                onTouchStart={handleSeekDown}
              />
            </div>
          </div>

          <div className="px-3 sm:px-4 py-2 sm:py-1.5 flex items-center gap-2.5 sm:gap-3.5">
            {/* Cover */}
            <div className="w-10 sm:w-11 h-10 sm:h-11 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0 shadow-md relative" style={{ background: "#1a1a1c", border: "1px solid rgba(255,255,255,0.05)" }}>
              {playingTrack.cover_url ? (
                <img src={playingTrack.cover_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <Music2 className="w-5 sm:w-6 h-5 sm:h-6 text-white/25" />
              )}
              {isPlaying && (
                <span className="hidden sm:block absolute inset-0 rounded-lg pointer-events-none animate-pulse" style={{ boxShadow: "0 0 0 2px rgba(52,211,153,0.55)" }} />
              )}
            </div>

            {/* Artista + Cabaña Creative (móvil y desktop) */}
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-bold text-white truncate leading-tight">{displayArtist}</p>
              {displayArtist !== "Cabaña Creative" && (
                <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.25em] text-white/35 font-semibold mt-0.5">Cabaña Creative</p>
              )}
            </div>

            {/* Controles */}
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <button
                onClick={isPlaying ? pauseTrack : resumeTrack}
                className={`w-8 sm:w-9 h-8 sm:h-9 rounded-full flex items-center justify-center transition-all text-white ${isPlaying ? "sm:bg-emerald-500/15 sm:shadow-[0_0_14px_#34d39966]" : "hover:bg-white/10 active:bg-white/15"}`}
                title={isPlaying ? "Pausar" : "Reproducir"}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4" fill="currentColor" />
                ) : (
                  <Play className="w-4 h-4 ml-0.5" fill="currentColor" />
                )}
              </button>

              {/* Expandir — solo desktop */}
              <button
                onClick={() => setExpanded(true)}
                className="hidden sm:flex w-8 h-8 rounded-full items-center justify-center hover:bg-white/10 text-white/45 hover:text-white transition-colors"
                title="Expandir"
              >
                <ChevronUp className="w-4 h-4" />
              </button>

              {/* Cerrar */}
              <button
                onClick={closePlayer}
                className="w-8 sm:w-9 h-8 sm:h-9 rounded-full flex items-center justify-center hover:bg-red-500/10 transition-colors text-white/50 hover:text-red-400"
                title="Cerrar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}