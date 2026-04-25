import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, Pause, Edit, Music2, ExternalLink,
  FolderOpen, Mic2, Sliders, Zap, Star, ChevronDown, Plus
} from "lucide-react";

const statusConfig = {
  idea:       { label: "Idea",          color: "#6b7280" },
  production: { label: "Producción",    color: "#60a5fa" },
  mixing:     { label: "Mezcla",        color: "#a78bfa" },
  mastering:  { label: "Masterización", color: "#fb923c" },
  completed:  { label: "Completado",    color: "#34d399" },
};

const FOLDER_DEFS = [
  { key: "mp3",          label: "MP3" },
  { key: "wav_24bit",    label: "WAV 24bit" },
  { key: "stems",        label: "Stems" },
  { key: "mix",          label: "Mix" },
  { key: "master_24bit", label: "Master 24bit" },
  { key: "show",         label: "Show" },
  { key: "acapella",     label: "Acapella" },
  { key: "beat_wav",     label: "Beat WAV" },
];

function TrackCard({ track, index, onEdit }) {
  const [hovered, setHovered] = useState(false);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);
  const hoverTimer = useRef(null);
  const cardRef = useRef(null);

  const status = statusConfig[track.status] || statusConfig.idea;
  const folders = FOLDER_DEFS.filter(f => track.versions?.[f.key]);

  useEffect(() => {
    if (hovered && track.audio_file_url && audioRef.current) {
      hoverTimer.current = setTimeout(async () => {
        try {
          audioRef.current.currentTime = 0;
          await audioRef.current.play();
          setPlaying(true);
        } catch {}
      }, 700);
    } else {
      clearTimeout(hoverTimer.current);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setPlaying(false);
      }
    }
    return () => clearTimeout(hoverTimer.current);
  }, [hovered]);

  const togglePlay = (e) => {
    e.stopPropagation();
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play().then(() => setPlaying(true)).catch(() => {});
    }
  };

  // Determine if card should expand left or right based on index
  const expandDirection = index % 5 >= 3 ? "right" : "left";

  return (
    <div
      ref={cardRef}
      className="relative flex-shrink-0"
      style={{ width: 160 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Base Card */}
      <div
        className="relative rounded-md overflow-hidden cursor-pointer"
        style={{
          width: 160,
          height: 90,
          background: "#1a1a1c",
          transition: "transform 0.15s ease",
          transform: hovered ? "scale(1.05)" : "scale(1)",
          zIndex: hovered ? 5 : 1,
          position: "relative",
        }}
      >
        {track.audio_file_url && (
          <audio
            ref={audioRef}
            src={track.audio_file_url}
            preload="none"
            onEnded={() => setPlaying(false)}
            onPause={() => setPlaying(false)}
          />
        )}

        {/* Cover image / gradient */}
        {track.cover_url ? (
          <img
            src={track.cover_url}
            alt={track.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#1e1e2e] to-[#0a0a0b] flex items-center justify-center">
            <Music2 className="w-8 h-8 text-white/10" />
          </div>
        )}

        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Status badge */}
        <div
          className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold"
          style={{ background: status.color + "33", color: status.color }}
        >
          {status.label}
        </div>

        {/* Atmos badge */}
        {track.dolby_atmos && (
          <div className="absolute top-1.5 right-1.5 px-1 py-0.5 rounded text-[8px] font-bold bg-orange-500/20 text-orange-400">
            ATMOS
          </div>
        )}

        {/* Title */}
        <div className="absolute bottom-0 left-0 right-0 p-2">
          <p className="text-white font-bold text-xs leading-tight line-clamp-1">{track.title}</p>
        </div>

        {/* Playing bars */}
        {playing && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex items-end gap-0.5 h-5">
              {[1,2,3,4].map(i => (
                <div
                  key={i}
                  className="w-0.5 rounded-full bg-white"
                  style={{
                    height: `${6 + i * 3}px`,
                    animation: `pulse 0.${4 + i}s ease-in-out infinite alternate`,
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Netflix-style hover preview panel */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -4 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute z-50 rounded-lg overflow-hidden shadow-2xl"
            style={{
              width: 260,
              top: -10,
              left: expandDirection === "left" ? 0 : "auto",
              right: expandDirection === "right" ? 0 : "auto",
              background: "#181818",
              boxShadow: "0 8px 40px rgba(0,0,0,0.8)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Preview image / cover large */}
            <div className="relative" style={{ height: 140 }}>
              {track.cover_url ? (
                <img
                  src={track.cover_url}
                  alt={track.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-900/60 to-black flex items-center justify-center">
                  <Music2 className="w-12 h-12 text-white/10" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-transparent to-transparent" />

              {/* Title overlay */}
              <div className="absolute bottom-2 left-3">
                <p className="text-white font-black text-sm leading-tight">{track.title}</p>
              </div>
            </div>

            {/* Controls */}
            <div className="px-3 pt-2 pb-1 flex items-center gap-2">
              <button
                onClick={togglePlay}
                className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:bg-white/90 transition-colors flex-shrink-0"
              >
                {playing ? (
                  <Pause className="w-3.5 h-3.5 text-black" fill="black" />
                ) : (
                  <Play className="w-3.5 h-3.5 text-black ml-0.5" fill="black" />
                )}
              </button>
              <button
                onClick={() => onEdit(track)}
                className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center hover:border-white/60 transition-colors"
              >
                <Edit className="w-3 h-3 text-white/70" />
              </button>
              {folders.length > 0 && (
                <div className="flex items-center gap-1 text-white/30 ml-1">
                  <FolderOpen className="w-3 h-3" />
                  <span className="text-[10px]">{folders.length}</span>
                </div>
              )}
            </div>

            {/* Metadata */}
            <div className="px-3 pb-2 space-y-1.5">
              {/* Tags row */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                  style={{ background: status.color + "25", color: status.color }}
                >
                  {status.label}
                </span>
                {track.dolby_atmos && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400">
                    ATMOS
                  </span>
                )}
                {track.bpm && (
                  <span className="text-[10px] text-white/40">{track.bpm} BPM</span>
                )}
                {track.key && (
                  <span className="text-[10px] text-white/40">{track.key}</span>
                )}
              </div>

              {/* Credits */}
              <div className="text-[10px] text-white/40 leading-relaxed">
                {track.composers?.length > 0 && (
                  <span>{track.composers.join(" · ")}</span>
                )}
                {track.genre && (
                  <span className="ml-1.5 text-white/25">• {track.genre}</span>
                )}
              </div>

              {/* Drive folders */}
              {folders.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-0.5">
                  {folders.map(f => (
                    <a
                      key={f.key}
                      href={track.versions[f.key]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[9px] px-1.5 py-0.5 rounded bg-white/[0.06] hover:bg-white/10 text-white/50 hover:text-white border border-white/[0.08] transition-colors flex items-center gap-1"
                    >
                      <ExternalLink className="w-2 h-2" />
                      {f.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function NetflixTrackCard({ track, index, onEdit }) {
  return <TrackCard track={track} index={index} onEdit={onEdit} />;
}