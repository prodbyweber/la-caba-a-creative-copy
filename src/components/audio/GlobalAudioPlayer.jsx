import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, ChevronDown, X, Music2 } from "lucide-react";
import { useGlobalAudio } from "@/context/GlobalAudioContext";

export default function GlobalAudioPlayer() {
  const { playingTrack, isPlaying, currentTime, duration, hidden, pauseTrack, resumeTrack, stopTrack, setHidden, seekTrack } = useGlobalAudio();
  const [isDragging, setIsDragging] = useState(false);
  const progressRef = useRef(null);
  const playerRef = useRef(null);

  const handleSeekDown = () => setIsDragging(true);
  
  const handleSeekUp = () => setIsDragging(false);

  const handleSeek = (e) => {
    if (!progressRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    seekTrack(percent * duration);
  };

  const handleTouchSeek = (e) => {
    if (!progressRef.current) return;
    const touch = e.touches[0];
    const rect = progressRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (touch.clientX - rect.left) / rect.width));
    seekTrack(percent * duration);
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      handleSeek(e);
    }
  };

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
          onMouseMove={handleMouseMove}
          onMouseUp={handleSeekUp}
          onMouseLeave={handleSeekUp}
          onTouchEnd={handleSeekUp}
        >
          {/* Progress bar - mejorada */}
          <div
            ref={progressRef}
            className="h-1 sm:h-1.5 bg-white/5 cursor-pointer group hover:bg-white/8 transition-all active:bg-white/12"
            onMouseDown={handleSeekDown}
            onTouchStart={handleSeekDown}
            onTouchMove={handleTouchSeek}
            onClick={handleSeek}
          >
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all shadow-lg"
              style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
            />
          </div>

          <div className="px-3 sm:px-5 py-3 sm:py-4 flex items-center gap-2.5 sm:gap-4">
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