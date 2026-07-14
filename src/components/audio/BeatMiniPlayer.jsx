import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, SkipBack, SkipForward, Repeat, Repeat1, Shuffle, Volume2, VolumeX, ChevronUp, X, Heart, Download, FolderOpen, Share2, Music2 } from "lucide-react";
import { useGlobalAudio } from "@/context/GlobalAudioContext";
import WaveformBars from "./WaveformBars";
import { Link } from "react-router-dom";

export default function BeatMiniPlayer({ onLike, onDownload, onDrive, liked }) {
  const {
    playingTrack, isPlaying, currentTime, duration,
    pauseTrack, resumeTrack, seekTrack, stopTrack,
    playNext, playPrevious, repeat, shuffle, setRepeat, setShuffle,
    volume, setVolume, setExpanded,
  } = useGlobalAudio();

  const [isDragging, setIsDragging] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const progressRef = useRef(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const performSeek = useCallback((clientX) => {
    if (!progressRef.current || !duration) return;
    const rect = progressRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    seekTrack(percent * duration);
  }, [duration, seekTrack]);

  useEffect(() => {
    if (!isDragging) return;
    const move = (e) => {
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      performSeek(x);
    };
    const end = () => setIsDragging(false);
    document.addEventListener("mousemove", move, { passive: true });
    document.addEventListener("touchmove", move, { passive: true });
    document.addEventListener("mouseup", end);
    document.addEventListener("touchend", end);
    return () => {
      document.removeEventListener("mousemove", move);
      document.removeEventListener("touchmove", move);
      document.removeEventListener("mouseup", end);
      document.removeEventListener("touchend", end);
    };
  }, [isDragging, performSeek]);

  const formatTime = (sec) => {
    if (!sec || !Number.isFinite(sec)) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const progress = duration > 0 ? currentTime / duration : 0;

  const toggleRepeat = () => {
    if (repeat === "off") setRepeat("all");
    else if (repeat === "all") setRepeat("one");
    else setRepeat("off");
  };

  if (!playingTrack) return null;

  // Hide if this is not a beat (playingTrack.beat_id set by normalizeTrack)
  const isBeat = !!playingTrack.beat_id;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed left-0 right-0 z-[100] border-t border-white/10 backdrop-blur-xl"
        style={{
          bottom: isMobile ? "65px" : "0px",
          background: "rgba(12, 12, 14, 0.97)",
        }}
      >
        {/* Progress bar */}
        <div className="relative h-3 flex items-center px-3 sm:px-5 group">
          <div
            ref={progressRef}
            className="w-full h-1 sm:h-1.5 bg-white/8 cursor-pointer hover:bg-white/12 relative rounded-full transition-all"
            onMouseDown={(e) => { e.preventDefault(); setIsDragging(true); }}
            onTouchStart={(e) => setIsDragging(true)}
            onClick={(e) => performSeek(e.clientX)}
          >
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${progress * 100}%`,
                background: "linear-gradient(90deg, #ff5833, #ff7a52)",
              }}
            />
            <div
              className="absolute top-1/2 w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full shadow-lg border border-white cursor-grab active:cursor-grabbing transition-all"
              style={{
                left: `${progress * 100}%`,
                transform: "translate(-50%, -50%)",
                background: "#ff5833",
              }}
            />
          </div>
        </div>

        <div className="px-3 sm:px-5 py-2.5 flex items-center gap-3">
          {/* Cover */}
          <button onClick={() => setExpanded(true)} className="flex-shrink-0">
            <div
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-lg overflow-hidden flex items-center justify-center shadow-md"
              style={{ background: "#1a1a1c", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              {playingTrack.cover_url ? (
                <img src={playingTrack.cover_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <Music2 className="w-5 h-5 text-white/25" />
              )}
            </div>
          </button>

          {/* Title + time — clic abre el panel de reproduciendo */}
          <button onClick={() => setExpanded(true)} className="flex-1 min-w-0 text-left hover:opacity-80 transition-opacity">
            <p className="text-xs sm:text-sm font-bold text-white truncate leading-snug">{playingTrack.title}</p>
            <p className="text-[10px] sm:text-xs text-white/45 font-medium truncate">
              {playingTrack.artist} · {formatTime(currentTime)} / {formatTime(duration)}
            </p>
          </button>

          {/* Beat actions (desktop only inline) */}
          {isBeat && (
            <div className="hidden sm:flex items-center gap-1 flex-shrink-0">
              {onLike && (
                <button
                  onClick={onLike}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
                  title="Me gusta"
                >
                  <Heart className={`w-4 h-4 ${liked ? "fill-red-500 text-red-500" : "text-white/50"}`} />
                </button>
              )}
              {onDrive && playingTrack.drive_folder_url && (
                <a
                  href={playingTrack.drive_folder_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
                  title="Carpeta Drive"
                >
                  <FolderOpen className="w-4 h-4 text-white/50" />
                </a>
              )}
              {onDownload && (
                <button
                  onClick={onDownload}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
                  title="Descargar MP3"
                >
                  <Download className="w-4 h-4 text-white/50" />
                </button>
              )}
            </div>
          )}

          {/* Playback controls */}
          <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
            <button
              onClick={() => setShuffle(!shuffle)}
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-colors ${shuffle ? "text-[#ff5833]" : "text-white/40 hover:text-white"}`}
              title="Aleatorio"
            >
              <Shuffle className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={playPrevious}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center hover:bg-white/10 text-white/60 hover:text-white transition-colors"
              title="Anterior"
            >
              <SkipBack className="w-4 h-4" fill="currentColor" />
            </button>
            <button
              onClick={isPlaying ? pauseTrack : resumeTrack}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all text-white shadow-lg"
              style={{ background: "linear-gradient(135deg, #ff5833, #e0451f)" }}
              title={isPlaying ? "Pausar" : "Reproducir"}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4" fill="currentColor" />
              ) : (
                <Play className="w-4 h-4 ml-0.5" fill="currentColor" />
              )}
            </button>
            <button
              onClick={playNext}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center hover:bg-white/10 text-white/60 hover:text-white transition-colors"
              title="Siguiente"
            >
              <SkipForward className="w-4 h-4" fill="currentColor" />
            </button>
            <button
              onClick={toggleRepeat}
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-colors ${repeat !== "off" ? "text-[#ff5833]" : "text-white/40 hover:text-white"}`}
              title="Repetir"
            >
              {repeat === "one" ? <Repeat1 className="w-3.5 h-3.5" /> : <Repeat className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Expand button (desktop) */}
          <button
            onClick={() => setExpanded(true)}
            className="hidden sm:flex w-8 h-8 rounded-full items-center justify-center hover:bg-white/10 text-white/40 hover:text-white transition-colors flex-shrink-0"
            title="Expandir"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}