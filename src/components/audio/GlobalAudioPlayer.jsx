import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, ChevronDown, X, Music2 } from "lucide-react";
import { useGlobalAudio } from "@/context/GlobalAudioContext";

export default function GlobalAudioPlayer() {
  const { playingTrack, isPlaying, currentTime, duration, hidden, pauseTrack, resumeTrack, stopTrack, setHidden, seekTrack } = useGlobalAudio();
  const [isDragging, setIsDragging] = useState(false);
  const progressRef = useRef(null);

  if (!playingTrack) return null;

  const handleSeekDown = () => setIsDragging(true);
  const handleSeekUp = () => setIsDragging(false);

  const handleSeek = (e) => {
    if (!progressRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
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

  return (
    <AnimatePresence>
      {!hidden && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10"
          style={{ background: "#0a0a0b" }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleSeekUp}
          onMouseLeave={handleSeekUp}
        >
          {/* Progress bar at top */}
          <div
            ref={progressRef}
            className="h-1 bg-white/5 cursor-pointer group hover:h-1.5 transition-all"
            onMouseDown={handleSeekDown}
            onClick={handleSeek}
            style={{ background: isDragging ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.05)" }}
          >
            <div
              className="h-full bg-emerald-500 rounded-full transition-all"
              style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
            />
          </div>

          <div className="px-4 py-2.5 flex items-center gap-3">
            {/* Cover thumb */}
            <div className="w-9 h-9 rounded flex items-center justify-center flex-shrink-0" style={{ background: "#1a1a1c" }}>
              {playingTrack.cover_url ? (
                <img src={playingTrack.cover_url} alt="" className="w-full h-full object-cover rounded" />
              ) : (
                <Music2 className="w-4 h-4 text-white/30" />
              )}
            </div>

            {/* Title + time */}
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold text-white truncate">{playingTrack.title}</p>
              <p className="text-[9px] text-white/40">{formatTime(currentTime)} / {formatTime(duration)}</p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-0.5 flex-shrink-0">
              <button
                onClick={isPlaying ? pauseTrack : resumeTrack}
                className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
                title={isPlaying ? "Pausar" : "Reproducir"}
              >
                {isPlaying ? (
                  <Pause className="w-3.5 h-3.5 text-white" fill="white" />
                ) : (
                  <Play className="w-3.5 h-3.5 text-white ml-0.5" fill="white" />
                )}
              </button>

              {/* Hide button */}
              <button
                onClick={() => setHidden(true)}
                className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors text-white/50 hover:text-white"
                title="Ocultar"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {/* Close button */}
              <button
                onClick={stopTrack}
                className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors text-white/50 hover:text-white"
                title="Cerrar"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}