import React, { useState } from "react";
import { motion } from "framer-motion";
import { Play, Pause, Heart, Activity } from "lucide-react";
import { useGlobalAudio } from "@/context/GlobalAudioContext";
import { getCoverForBeat, timeAgo } from "@/lib/beatsUtils";

export default function BeatCard({ beat, isPlaying, onPlay, onLike, liked, index }) {
  const { playingTrack } = useGlobalAudio();
  const active = playingTrack?.beat_id === beat.id;
  const [imgError, setImgError] = useState(false);
  const cover = imgError ? null : getCoverForBeat(beat);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: (index || 0) * 0.04, duration: 0.5 }}
      className="group cursor-pointer"
      onClick={onPlay}
    >
      {/* Cover */}
      <div className="relative aspect-square rounded-2xl overflow-hidden mb-3" style={{ background: "#161616" }}>
        {cover ? (
          <img
            src={cover}
            alt={beat.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Activity className="w-8 h-8 text-white/10" />
          </div>
        )}

        {/* Cinematic gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10 pointer-events-none" />

        {/* Soundwave + play count (bottom-left) */}
        <div
          className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold text-white"
          style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)" }}
        >
          <Activity className="w-2.5 h-2.5 text-[#8b5cf6]" />
          {beat.plays_count || 0}
        </div>

        {/* Time ago (top-right) */}
        <div
          className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[9px] font-bold text-white/80 tracking-wider"
          style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }}
        >
          {timeAgo(beat.created_date)}
        </div>

        {/* Like button (top-left, on hover) */}
        {onLike && (
          <button
            onClick={(e) => { e.stopPropagation(); onLike(beat); }}
            className="absolute top-2.5 left-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
            style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}
          >
            <Heart className={`w-3.5 h-3.5 ${liked ? "fill-[#8b5cf6] text-[#8b5cf6]" : "text-white"}`} />
          </button>
        )}

        {/* Hover play button (center) */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-transform group-hover:scale-110"
            style={{ background: "#8b5cf6" }}
          >
            {active && isPlaying ? (
              <Pause className="w-6 h-6 text-white" fill="white" />
            ) : (
              <Play className="w-6 h-6 text-white ml-0.5" fill="white" />
            )}
          </div>
        </div>

        {/* Active state ring */}
        {active && (
          <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{ border: "2px solid #8b5cf6" }} />
        )}
      </div>

      {/* Info */}
      <h3 className="text-sm font-bold text-white truncate leading-tight">{beat.title}</h3>
      <p className="text-xs text-[#a0a0a0] mt-0.5 truncate">{beat.producer || "Cabaña"}</p>

      {/* BPM / Key (no genre tags — cinematic curation) */}
      <div className="flex items-center gap-2 mt-1.5">
        {beat.bpm ? <span className="text-[10px] text-[#a0a0a0] font-medium">{beat.bpm} BPM</span> : null}
        {beat.scale ? (
          <span className="text-[10px] text-[#a0a0a0] font-medium">{beat.scale}</span>
        ) : beat.key ? (
          <span className="text-[10px] text-[#a0a0a0] font-medium">{beat.key}</span>
        ) : null}
      </div>
    </motion.div>
  );
}