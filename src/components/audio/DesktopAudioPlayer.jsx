import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Volume2, VolumeX, Music2, ChevronUp, ChevronDown, X } from "lucide-react";
import { useGlobalAudio } from "@/context/GlobalAudioContext";

export default function DesktopAudioPlayer() {
  const { playingTrack, isPlaying, currentTime, duration, pauseTrack, resumeTrack, stopTrack, seekTrack } = useGlobalAudio();
  const [isDragging, setIsDragging] = useState(false);
  const [volume, setVolume] = useState(1);
  const [expanded, setExpanded] = useState(true);
  const progressRef = useRef(null);
  const volumeRef = useRef(null);
  const audioRef = useRef(null);

  // Solo mostrar en desktop
  const isDesktop = typeof window !== "undefined" && window.innerWidth >= 1024;

  const handleSeek = (e) => {
    if (!progressRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    seekTrack(percent * duration);
  };

  const handleVolumeChange = (e) => {
    if (!audioRef.current) return;
    const rect = volumeRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setVolume(percent);
    audioRef.current.volume = percent;
  };

  const formatTime = (sec) => {
    if (!sec || !Number.isFinite(sec)) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // Don't render for beat tracks — handled by BeatMiniPlayer
  if (playingTrack?.beat_id) return null;
  if (!isDesktop || !playingTrack) return null;

  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="hidden lg:fixed right-6 bottom-24 z-40 lg:block w-80 rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
      style={{ background: "rgba(15, 15, 17, 0.95)", backdropFilter: "blur(16px)" }}
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
        <h3 className="text-sm font-bold text-white">Reproduciendo</h3>
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-7 h-7 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
        >
          {expanded ? (
            <ChevronDown className="w-4 h-4 text-white/50" />
          ) : (
            <ChevronUp className="w-4 h-4 text-white/50" />
          )}
        </button>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 py-5 space-y-5">
              {/* Cover */}
              <div className="relative w-full aspect-square rounded-xl overflow-hidden shadow-lg">
                {playingTrack.cover_url ? (
                  <motion.img
                    src={playingTrack.cover_url}
                    alt={playingTrack.title}
                    className="w-full h-full object-cover"
                    animate={isPlaying ? { scale: 1.05 } : { scale: 1 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-emerald-500/20 to-purple-500/20 flex items-center justify-center">
                    <Music2 className="w-12 h-12 text-white/20" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              </div>

              {/* Track Info */}
              <div className="space-y-1">
                <h2 className="text-base font-bold text-white truncate">{playingTrack.title}</h2>
                {playingTrack.genre && (
                  <p className="text-xs text-white/40">{playingTrack.genre}</p>
                )}
              </div>

              {/* Progress */}
              <div className="space-y-2">
                <div className="relative h-6 flex items-center group">
                  <div
                    ref={progressRef}
                    className="w-full h-2 bg-white/5 rounded-full cursor-pointer hover:bg-white/8 transition-all relative"
                    onMouseDown={() => setIsDragging(true)}
                    onMouseUp={() => setIsDragging(false)}
                    onMouseMove={(e) => isDragging && handleSeek(e)}
                    onClick={handleSeek}
                  >
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full shadow-lg"
                      style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                    />
                    {/* Handle/Circle */}
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-emerald-400 rounded-full shadow-lg border-2 border-white cursor-grab active:cursor-grabbing hover:w-6 hover:h-6 transition-all"
                      style={{ left: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`, transform: "translate(-50%, -50%)" }}
                      onMouseDown={() => setIsDragging(true)}
                      onMouseUp={() => setIsDragging(false)}
                      onMouseMove={(e) => isDragging && handleSeek(e)}
                    />
                  </div>
                </div>
                <div className="flex justify-between text-xs text-white/50 font-medium">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={isPlaying ? pauseTrack : resumeTrack}
                  className="w-12 h-12 rounded-full bg-emerald-500 hover:bg-emerald-600 active:scale-95 flex items-center justify-center transition-all text-white shadow-lg"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5" fill="white" />
                  ) : (
                    <Play className="w-5 h-5 ml-0.5" fill="white" />
                  )}
                </button>
                <button
                  onClick={stopTrack}
                  className="w-10 h-10 rounded-full hover:bg-white/10 active:bg-white/15 flex items-center justify-center transition-colors text-white/70 hover:text-white"
                  title="Detener"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Volume */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {volume === 0 ? (
                    <VolumeX className="w-4 h-4 text-white/50" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-white/50" />
                  )}
                  <div
                    ref={volumeRef}
                    className="flex-1 h-1 bg-white/5 rounded-full cursor-pointer hover:bg-white/8 transition-all"
                    onClick={handleVolumeChange}
                    onMouseMove={(e) => {
                      if (e.buttons === 1) handleVolumeChange(e);
                    }}
                  >
                    <div
                      className="h-full bg-white/40 rounded-full"
                      style={{ width: `${volume * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-white/40 w-7 text-right">{Math.round(volume * 100)}%</span>
                </div>
              </div>

              {/* Metadata */}
              {(playingTrack.composers?.length > 0 || playingTrack.producers?.length > 0) && (
                <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.06] space-y-1.5 text-xs">
                  {playingTrack.composers?.length > 0 && (
                    <div>
                      <p className="text-white/40 uppercase tracking-wider">Compositores</p>
                      <p className="text-white/70">{playingTrack.composers.join(", ")}</p>
                    </div>
                  )}
                  {playingTrack.producers?.length > 0 && (
                    <div>
                      <p className="text-white/40 uppercase tracking-wider">Productores</p>
                      <p className="text-white/70">{playingTrack.producers.join(", ")}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}