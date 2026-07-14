import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, SkipBack, SkipForward, Repeat, Repeat1, Shuffle, ChevronDown, X, Heart, Bookmark, Download, FolderOpen, Share2, Music2, Volume2, VolumeX } from "lucide-react";
import { useGlobalAudio } from "@/context/GlobalAudioContext";
import WaveformBars from "./WaveformBars";

export default function ExpandedPlayer({ onLike, onSave, onDownload, onDrive, onLicenses, liked, saved }) {
  const {
    playingTrack, isPlaying, currentTime, duration,
    pauseTrack, resumeTrack, seekTrack, stopTrack,
    playNext, playPrevious, repeat, shuffle, setRepeat, setShuffle,
    volume, setVolume, expanded, setExpanded,
    queue, currentIndex,
  } = useGlobalAudio();

  const [isDragging, setIsDragging] = useState(false);
  const progressRef = useRef(null);
  const startY = useRef(null);

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

  // Swipe down to minimize
  const handleTouchStart = (e) => {
    startY.current = e.touches[0].clientY;
  };
  const handleTouchMove = (e) => {
    if (startY.current == null) return;
    const dy = e.touches[0].clientY - startY.current;
    if (dy > 100) {
      setExpanded(false);
      startY.current = null;
    }
  };
  const handleTouchEnd = () => { startY.current = null; };

  // Swipe left/right for prev/next (mobile)
  const startX = useRef(null);
  const handleSwipeStart = (e) => {
    startX.current = e.touches[0].clientX;
  };
  const handleSwipeEnd = (e) => {
    if (startX.current == null) return;
    const dx = (e.changedTouches[0]?.clientX || 0) - startX.current;
    if (Math.abs(dx) > 80) {
      if (dx > 0) playPrevious();
      else playNext();
    }
    startX.current = null;
  };

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

  const handleShare = () => {
    if (navigator.share && playingTrack) {
      navigator.share({ title: playingTrack.title, text: `${playingTrack.title} - ${playingTrack.artist}` }).catch(() => {});
    }
  };

  return (
    <AnimatePresence>
      {expanded && playingTrack && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[200] flex flex-col"
          style={{ background: "rgba(8, 8, 10, 0.98)", backdropFilter: "blur(20px)" }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Background blur from cover */}
          {playingTrack.cover_url && (
            <div className="absolute inset-0 overflow-hidden">
              <img src={playingTrack.cover_url} alt="" className="w-full h-full object-cover scale-125 blur-3xl opacity-15" />
            </div>
          )}

          {/* Top bar */}
          <div className="relative z-10 flex items-center justify-between px-5 pt-5 pb-3 flex-shrink-0">
            <button
              onClick={() => setExpanded(false)}
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
            <p className="text-[10px] font-semibold text-white/40 uppercase tracking-[0.25em]">
              {queue.length > 1 ? `Cola ${currentIndex + 1}/${queue.length}` : "Reproduciendo"}
            </p>
            <button
              onClick={stopTrack}
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Main content */}
          <div
            className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pb-8 max-w-md mx-auto w-full"
            onTouchStart={handleSwipeStart}
            onTouchEnd={handleSwipeEnd}
          >
            {/* Artwork */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-xs aspect-square rounded-2xl overflow-hidden shadow-2xl mb-8"
              style={{ border: "1px solid rgba(255,255,255,0.08)" }}
            >
              {playingTrack.cover_url ? (
                <motion.img
                  src={playingTrack.cover_url}
                  alt={playingTrack.title}
                  className="w-full h-full object-cover"
                  animate={isPlaying ? { scale: 1.08 } : { scale: 1 }}
                  transition={{ duration: 8, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, rgba(255,88,51,0.15), rgba(255,88,51,0.05))" }}>
                  <Music2 className="w-16 h-16 text-white/20" />
                </div>
              )}
            </motion.div>

            {/* Info */}
            <div className="w-full text-center mb-6">
              <h2 className="text-2xl font-black text-white tracking-tight mb-1" style={{ fontFamily: "'Helvetica Neue', sans-serif", letterSpacing: "-0.03em" }}>
                {playingTrack.title}
              </h2>
              <p className="text-sm text-white/50">{playingTrack.artist}</p>
              <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
                {playingTrack.bpm != null && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/8 text-white/50 font-semibold">{playingTrack.bpm} BPM</span>
                )}
                {playingTrack.key && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/8 text-white/50 font-semibold">{playingTrack.key}</span>
                )}
                {playingTrack.scale && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/8 text-white/50 font-semibold">{playingTrack.scale}</span>
                )}
                {(playingTrack.genres || []).slice(0, 2).map((g, i) => (
                  <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-white/8 text-white/50 font-semibold">{g}</span>
                ))}
              </div>
            </div>

            {/* Waveform progress */}
            <div className="w-full mb-4">
              <div
                ref={progressRef}
                className="relative h-12 flex items-center cursor-pointer group"
                onMouseDown={(e) => { e.preventDefault(); setIsDragging(true); }}
                onTouchStart={(e) => setIsDragging(true)}
                onClick={(e) => performSeek(e.clientX)}
              >
                <WaveformBars progress={progress} isPlaying={isPlaying} bars={56} color="#ff5833" />
              </div>
              <div className="flex justify-between text-xs text-white/40 font-medium mt-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Main controls */}
            <div className="flex items-center justify-center gap-5 mb-6">
              <button
                onClick={() => setShuffle(!shuffle)}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${shuffle ? "text-[#ff5833]" : "text-white/40 hover:text-white"}`}
              >
                <Shuffle className="w-4 h-4" />
              </button>
              <button
                onClick={playPrevious}
                className="w-11 h-11 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-colors"
              >
                <SkipBack className="w-6 h-6" fill="currentColor" />
              </button>
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={isPlaying ? pauseTrack : resumeTrack}
                className="w-16 h-16 rounded-full flex items-center justify-center text-white shadow-2xl"
                style={{ background: "linear-gradient(135deg, #ff5833, #e0451f)" }}
              >
                {isPlaying ? (
                  <Pause className="w-7 h-7" fill="currentColor" />
                ) : (
                  <Play className="w-7 h-7 ml-1" fill="currentColor" />
                )}
              </motion.button>
              <button
                onClick={playNext}
                className="w-11 h-11 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-colors"
              >
                <SkipForward className="w-6 h-6" fill="currentColor" />
              </button>
              <button
                onClick={toggleRepeat}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${repeat !== "off" ? "text-[#ff5833]" : "text-white/40 hover:text-white"}`}
              >
                {repeat === "one" ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
              </button>
            </div>

            {/* Secondary actions */}
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {onLike && (
                <button
                  onClick={onLike}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white/70 transition-all"
                >
                  <Heart className={`w-3.5 h-3.5 ${liked ? "fill-red-500 text-red-500" : ""}`} />
                  Me gusta
                </button>
              )}
              {onSave && (
                <button
                  onClick={onSave}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white/70 transition-all"
                >
                  <Bookmark className={`w-3.5 h-3.5 ${saved ? "fill-[#ffd23f] text-[#ffd23f]" : ""}`} />
                  Guardar
                </button>
              )}
              {onDownload && (
                <button
                  onClick={onDownload}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white/70 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  Descargar
                </button>
              )}
              {onLicenses && (
                <button
                  onClick={onLicenses}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all"
                  style={{ background: "linear-gradient(135deg, rgba(255,88,51,0.2), rgba(255,88,51,0.08))", border: "1px solid rgba(255,88,51,0.35)", color: "#ff8866" }}
                >
                  Licencias
                </button>
              )}
              {onDrive && playingTrack.drive_folder_url && (
                <a
                  href={playingTrack.drive_folder_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white/70 transition-all"
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  Drive
                </a>
              )}
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white/70 transition-all"
              >
                <Share2 className="w-3.5 h-3.5" />
                Compartir
              </button>
            </div>

            {/* Volume (desktop only) */}
            <div className="hidden sm:flex items-center gap-2 w-full mt-6 max-w-xs">
              {volume === 0 ? (
                <VolumeX className="w-4 h-4 text-white/40 flex-shrink-0" />
              ) : (
                <Volume2 className="w-4 h-4 text-white/40 flex-shrink-0" />
              )}
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="flex-1 accent-[#ff5833]"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}