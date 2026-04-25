import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, ChevronDown, X, Music2 } from "lucide-react";
import { useGlobalAudio } from "@/context/GlobalAudioContext";

export default function GlobalAudioPlayer() {
  const { playingTrack, isPlaying, currentTime, duration, hidden, pauseTrack, resumeTrack, stopTrack, setHidden, seekTrack } = useGlobalAudio();
  const [isDragging, setIsDragging] = useState(false);
  const progressRef = useRef(null);
  const playerRef = useRef(null);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    isDraggingRef.current = isDragging;
  }, [isDragging]);

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

  const handleSeekUp = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleClick = useCallback((e) => {
    performSeek(e.clientX);
  }, [performSeek]);

  // Mouse move - solo ejecuta si está arrastrando
  useEffect(() => {
    if (!isDraggingRef.current) return;

    const handleMouseMove = (e) => {
      if (isDraggingRef.current) {
        performSeek(e.clientX);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [performSeek]);

  // Touch move - solo ejecuta si está arrastrando
  useEffect(() => {
    if (!isDraggingRef.current) return;

    const handleTouchMove = (e) => {
      if (isDraggingRef.current && e.touches[0]) {
        performSeek(e.touches[0].clientX);
      }
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
    };

    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd);

    return () => {
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [performSeek]);

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

  return (
    <AnimatePresence>
      {playingTrack && !hidden && (
        <motion.div
          ref={playerRef}
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-0 left-0 right-0 z-[100] border-t border-white/10 backdrop-blur-xl"
          style={{ background: "rgba(10, 10, 11, 0.95)" }}
          onContextMenu={(e) => e.preventDefault()}
        >
          {/* Progress bar - mejorada */}
          <div className="relative h-4 sm:h-5 flex items-center px-3 sm:px-5">
            <div
              ref={progressRef}
              className="w-full h-1 sm:h-1.5 bg-white/5 cursor-pointer group hover:bg-white/8 transition-all active:bg-white/12 relative rounded-full"
              onMouseDown={handleSeekDown}
              onTouchStart={handleSeekDown}
              onClick={handleClick}
            >
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all shadow-lg"
                style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
              />
              {/* Handle Circle */}
              <div
               className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-emerald-400 rounded-full shadow-lg border border-white cursor-grab active:cursor-grabbing hover:w-4.5 hover:h-4.5 sm:hover:w-5 sm:hover:h-5 transition-all pointer-events-auto"
               style={{ left: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`, transform: "translate(-50%, -50%)" }}
               onMouseDown={handleSeekDown}
               onTouchStart={handleSeekDown}
               onPointerDown={handleSeekDown}
              />
            </div>
          </div>

          <div className="px-3 sm:px-5 py-2 sm:py-3 flex items-center gap-2.5 sm:gap-4">
            {/* Cover thumb - mejorado */}
            <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md" style={{ background: "#1a1a1c", border: "1px solid rgba(255,255,255,0.05)" }}>
              {playingTrack.cover_url ? (
                <img src={playingTrack.cover_url} alt="" className="w-full h-full object-cover rounded-lg" />
              ) : (
                <Music2 className="w-5 sm:w-6 h-5 sm:h-6 text-white/25" />
              )}
            </div>

            {/* Title + time - mejorado */}
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-bold text-white truncate leading-snug">{playingTrack.title}</p>
              <p className="text-[10px] sm:text-xs text-white/45 font-medium">{formatTime(currentTime)} / {formatTime(duration)}</p>
            </div>

            {/* Controls - mejorados */}
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <button
                onClick={isPlaying ? pauseTrack : resumeTrack}
                className="w-8 sm:w-9 h-8 sm:h-9 rounded-full flex items-center justify-center hover:bg-white/10 active:bg-white/15 transition-colors text-white"
                title={isPlaying ? "Pausar" : "Reproducir"}
              >
                {isPlaying ? (
                  <Pause className="w-4 sm:w-4.5 h-4 sm:h-4.5" fill="currentColor" />
                ) : (
                  <Play className="w-4 sm:w-4.5 h-4 sm:h-4.5 ml-0.5" fill="currentColor" />
                )}
              </button>

              {/* Close button */}
              <button
                onClick={stopTrack}
                className="w-8 sm:w-9 h-8 sm:h-9 rounded-full flex items-center justify-center hover:bg-red-500/10 active:bg-red-500/15 transition-colors text-white/50 hover:text-red-400"
                title="Cerrar"
              >
                <X className="w-4 sm:w-4.5 h-4 sm:h-4.5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}