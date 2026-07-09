import React, { useState } from "react";
import { motion } from "framer-motion";
import { Play, Pause, Heart, Download, FolderOpen, Music2, ChevronRight } from "lucide-react";
import { useGlobalAudio } from "@/context/GlobalAudioContext";

export default function BeatCard({ beat, isPlaying, onPlay, onLike, onDownload, onDrive, onLicenses, liked, index }) {
  const { playingTrack } = useGlobalAudio();
  const active = playingTrack?.beat_id === beat.id;
  const [imgError, setImgError] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: (index || 0) * 0.03 }}
      className="group relative rounded-xl overflow-hidden cursor-pointer"
      style={{ background: "#161616", border: "1px solid rgba(255,255,255,0.05)" }}
      onClick={onPlay}
    >
      {/* Cover */}
      <div className="relative aspect-square overflow-hidden" style={{ background: "#1a1a1c" }}>
        {beat.cover_url && !imgError ? (
          <img
            src={beat.cover_url}
            alt={beat.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Music2 className="w-8 h-8 text-white/15" />
          </div>
        )}

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center shadow-xl"
            style={{ background: "linear-gradient(135deg, #7c4dff, #a78bfa)" }}
          >
            {active && isPlaying ? (
              <Pause className="w-5 h-5 text-white" fill="white" />
            ) : (
              <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
            )}
          </div>
        </div>

        {/* Sample count badge (bottom-left) */}
        <div className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold text-white"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
        >
          <Music2 className="w-2.5 h-2.5" />
          {beat.bpm ? `${beat.bpm}` : "—"}
        </div>

        {/* Like button (top-right) */}
        {onLike && (
          <button
            onClick={(e) => { e.stopPropagation(); onLike(beat); }}
            className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-all"
            style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
          >
            <Heart className={`w-3.5 h-3.5 ${liked ? "fill-red-500 text-red-500" : "text-white/70"}`} />
          </button>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="text-sm font-bold text-white truncate leading-tight">{beat.title}</h3>
        <p className="text-xs text-white/40 mt-0.5 truncate">{beat.producer || "Cabaña"}</p>

        {/* Meta */}
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          {beat.key && (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/8 text-white/50 font-semibold uppercase tracking-wider">{beat.key}</span>
          )}
          {beat.scale && (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/8 text-white/50 font-semibold">{beat.scale}</span>
          )}
          {(beat.genres || []).slice(0, 1).map((g, i) => (
            <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-white/8 text-white/50 font-semibold uppercase tracking-wider">{g}</span>
          ))}
        </div>

        {/* Action row */}
        <div className="flex items-center gap-1 mt-3 pt-3 border-t border-white/5">
          {onDownload && (
            <button
              onClick={(e) => { e.stopPropagation(); onDownload(beat); }}
              className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-white/10 text-[10px] font-semibold text-white/50 hover:text-white transition-colors"
            >
              <Download className="w-3 h-3" />
              MP3
            </button>
          )}
          {onDrive && beat.drive_folder_url && (
            <a
              href={beat.drive_folder_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-white/10 text-[10px] font-semibold text-white/50 hover:text-white transition-colors"
            >
              <FolderOpen className="w-3 h-3" />
              Drive
            </a>
          )}
          {onLicenses && (
            <button
              onClick={(e) => { e.stopPropagation(); onLicenses(beat); }}
              className="flex items-center gap-0.5 ml-auto px-2 py-1 rounded-md text-[10px] font-semibold transition-colors"
              style={{ background: "rgba(124,77,255,0.12)", color: "#c4b5fd" }}
            >
              Licencias
              <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}