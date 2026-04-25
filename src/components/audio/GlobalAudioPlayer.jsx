import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, ChevronDown, X, Music2 } from "lucide-react";
import { useGlobalAudio } from "@/context/GlobalAudioContext";

export default function GlobalAudioPlayer() {
  const { playingTrack, isPlaying, currentTime, duration, hidden, pauseTrack, resumeTrack, stopTrack, setHidden, seekTrack } = useGlobalAudio();
  const [isDragging, setIsDragging] = useState(false);

  if (!playingTrack) return null;

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    seekTrack(percent * duration);
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
        >
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
            {/* Cover thumb */}
            <div className="w-10 h-10 rounded flex items-center justify-center flex-shrink-0" style={{ background: "#1a1a1c" }}>
              {playingTrack.cover_url ? (
                <img src={playingTrack.cover_url} alt="" className="w-full h-full object-cover rounded" />
              ) : (
                <Music2 className="w-5 h-5 text-white/30" />
              )}
            </div>

            {/* Title */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{playingTrack.title}</p>
              <p className="text-[10px] text-white/40 truncate">{formatTime(currentTime)} / {formatTime(duration)}</p>
            </div>

            {/* Progress bar */}
            <div className="w-32 h-1 bg-white/5 rounded-full cursor-pointer group" onClick={handleSeek}>
              <div
                className="h-full bg-white rounded-full transition-all"
                style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
              />
            </div>

            {/* Controls */}
            <div className="flex items-center gap-1">
              <button
                onClick={isPlaying ? pauseTrack : resumeTrack}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 text-white" fill="white" />
                ) : (
                  <Play className="w-4 h-4 text-white ml-0.5" fill="white" />
                )}
              </button>

              {/* Hide button */}
              <button
                onClick={() => setHidden(true)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors text-white/50 hover:text-white"
              >
                <ChevronDown className="w-4 h-4" />
              </button>

              {/* Close button */}
              <button
                onClick={stopTrack}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors text-white/50 hover:text-white"
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